import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';
import qrcode from 'qrcode';

const router = express.Router();

// Generate Single QR
router.post('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  const { campaignId, painterId, locationName, gps, rewardPoints, expirationDate } = req.body;
  try {
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
    // The QR contains just the ID for security and simplicity
    const qrData = await qrcode.toDataURL(qr.id);

    res.json({ ...qr, qrData });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code' });
  }
});

// List QRs
router.get('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const qrs = await prisma.qRCode.findMany({
      include: { campaign: true, painter: { select: { name: true, email: true } } },
    });
    res.json(qrs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR codes' });
  }
});

export default router;
