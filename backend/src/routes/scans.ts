import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

// Scan QR (Agent only)
router.post('/', authenticate, authorize([Role.AGENT]), async (req: AuthRequest, res) => {
  const { qrId } = req.body;
  const agentId = req.user?.id;

  if (!qrId || !agentId) {
    return res.status(400).json({ message: 'Missing QR ID or Auth' });
  }

  try {
    // 1. Validate QR
    const qr = await prisma.qRCode.findUnique({
      where: { id: qrId },
      include: { campaign: true },
    });

    if (!qr || qr.status !== 'ACTIVE') {
      return res.status(404).json({ message: 'Invalid or inactive QR code' });
    }

    if (qr.expirationDate && qr.expirationDate < new Date()) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // 2. Fraud Detection: Rate Limiting (Prevent scan spam)
    const lastScan = await prisma.scan.findFirst({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastScan) {
      const secondsSinceLastScan = (new Date().getTime() - lastScan.timestamp.getTime()) / 1000;
      if (secondsSinceLastScan < 30) {
        return res.status(429).json({ message: 'Scanning too fast. Please wait 30 seconds.' });
      }
    }

    // 3. Prevent Duplicate Scans by same agent for this specific QR
    const existingScan = await prisma.scan.findFirst({
      where: { qrId, agentId },
    });

    if (existingScan) {
      return res.status(400).json({ message: 'You have already scanned this QR code' });
    }

    // 4. Budget Check
    // Calculate total points already awarded for this campaign
    const totalPointsAwarded = await prisma.scan.aggregate({
      where: { campaignId: qr.campaignId },
      _sum: { pointsEarned: true },
    });

    // Simple budget check: budget is $ amount, 1 point = $0.1
    const potentialTotalValue = ((totalPointsAwarded._sum.pointsEarned || 0) + qr.rewardPoints) * 0.1;
    if (qr.campaign.budget > 0 && potentialTotalValue > qr.campaign.budget) {
      return res.status(400).json({ message: 'Campaign budget reached' });
    }

    // 5. Geo-verification (Optional)
    if (qr.gps && req.body.lat && req.body.lng) {
      const [qrLat, qrLng] = qr.gps.split(',').map(Number);
      const agentLat = Number(req.body.lat);
      const agentLng = Number(req.body.lng);
      
      // Simple distance check (Haversine or approximation)
      // For now, a rough check: ~0.005 degrees is approx 500m
      const distLat = Math.abs(qrLat - agentLat);
      const distLng = Math.abs(qrLng - agentLng);
      
      if (distLat > 0.01 || distLng > 0.01) {
        return res.status(400).json({ message: 'You are too far from the QR location' });
      }
    }

    // 6. Record Scan and Calculate Earnings
    const scan = await prisma.scan.create({
      data: {
        qrId,
        agentId,
        painterId: qr.painterId,
        campaignId: qr.campaignId,
        pointsEarned: qr.rewardPoints,
        painterEarned: qr.campaign.painterMargin,
        systemRevenue: qr.campaign.systemRevenue,
        lat: req.body.lat ? Number(req.body.lat) : null,
        lng: req.body.lng ? Number(req.body.lng) : null,
      },
    });

    // Note: We don't necessarily update "balance" fields if we calculate them from scan logs,
    // but for UI performance, we could have a cache. For now, we'll calculate dynamically.

    res.json({
      message: 'Scan successful! Points awarded.',
      points: qr.rewardPoints,
      scanId: scan.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing scan' });
  }
});

// Get Scan Logs (Admin only)
router.get('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const scans = await prisma.scan.findMany({
      include: {
        qr: true,
        agent: { select: { name: true } },
        painter: { select: { name: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scan logs' });
  }
});

export default router;
