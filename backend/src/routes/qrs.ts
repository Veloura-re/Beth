import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import qrcode from 'qrcode';
import { ScanController } from '../controllers/ScanController';

const router = express.Router();

import { randomUUID } from 'crypto';

// Generate Single or Batch QR
router.post('/', authenticate, authorize([Role.ADMIN]), async (req: AuthRequest, res) => {
  const { campaignId, painterId, locationName, gps, rewardPoints, expirationDate, quantity } = req.body;
  const organizationId = (req.user as any).organizationId;
  const numToCreate = Math.min(Math.max(1, quantity ? parseInt(quantity, 10) : 1), 100);
  const batchId = numToCreate > 1 ? randomUUID() : null;

  try {
    // Verify campaign belongs to same organization
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    // Validate painterId if provided (must be a valid User UUID)
    let validatedPainterId = null;
    if (painterId && typeof painterId === 'string' && painterId.length > 30) {
      const painter = await prisma.user.findUnique({ where: { id: painterId } });
      if (painter) validatedPainterId = painterId;
    }

    if (!campaign || (organizationId && campaign.organizationId !== organizationId)) {
      return res.status(403).json({ 
        message: 'Directive mismatch or unauthorized organization',
        details: { campaignOrg: campaign?.organizationId, userOrg: organizationId }
      });
    }

    const createPromises = Array.from({ length: numToCreate }).map(() => {
      return prisma.qRCode.create({
        data: {
          campaignId,
          painterId: validatedPainterId,
          locationName,
          gps,
          batchId,
          rewardPoints: rewardPoints ? parseInt(rewardPoints.toString(), 10) : 10,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
        },
      });
    });

    const createdQRs = await Promise.all(createPromises);

    res.json({
       count: createdQRs.length,
       batchId,
       sampleId: createdQRs[0]?.id
    });
  } catch (error: any) {
    console.error('[DATABASE_ERROR]', error);
    res.status(500).json({ 
      message: 'Error generating QR code', 
      error: error.message,
      diagnostic: {
        body: req.body,
        user: { id: req.user?.id, role: req.user?.role, organizationId: (req.user as any).organizationId }
      },
      prismaCode: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

// Scan QR via /qrs endpoint (backward compatibility)
// This proxies to the scans controller
router.post('/scan', authenticate, authorize([Role.AGENT]), async (req: AuthRequest, res) => {
  // Convert { code } to { qrId } format for compatibility
  const { code, lat, lng } = req.body;
  req.body = { ...req.body, qrId: code || req.body.qrId };
  return await ScanController.handleScan(req, res);
});

export default router;
