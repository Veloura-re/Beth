import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import qrcode from 'qrcode';

const router = express.Router();

// Generate Single QR
router.post('/', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  const { campaignId, painterId, locationName, gps, rewardPoints, expirationDate } = req.body;
  const organizationId = (req.user as any).organizationId;

  try {
    // Verify campaign belongs to same organization
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign || campaign.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Directive mismatch or unauthorized organization' });
    }

    const qr = await prisma.qRCode.create({
      data: {
        campaignId,
        painterId,
        locationName,
        gps,
        rewardPoints: rewardPoints || 10,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    // Generate QR Data URL
    const qrData = await qrcode.toDataURL(qr.id);

    res.json({ ...qr, qrData });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code' });
  }
});

// List QRs
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), async (req: AuthRequest, res) => {
  try {
    const requesterRole = req.user?.role;
    const organizationId = (req.user as any).organizationId;

    const qrs = await prisma.qRCode.findMany({
      where: (requesterRole === Role.ADMIN) ? {
        campaign: { organizationId }
      } : {},
      include: { campaign: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(qrs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR codes' });
  }
});

export default router;
