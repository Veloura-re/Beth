import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

// Create Campaign
router.post('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req: AuthRequest, res) => {
  const { name, description, budget, rewardPerScan, painterMargin, systemRevenue, organizationId } = req.body;
  try {
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget: budget || 0,
        rewardPerScan: rewardPerScan || 10,
        painterMargin: painterMargin || 0.05,
        systemRevenue: systemRevenue || 0.25,
        organizationId: organizationId || (req.user as any).organizationId,
      },
    });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign' });
  }
});

// List Campaigns
router.get('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { _count: { select: { qrCodes: true, scans: true } } },
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns' });
  }
});

export default router;
