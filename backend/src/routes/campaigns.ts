import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { CampaignController } from '../controllers/CampaignController';
import { Role } from '@prisma/client';

const router = express.Router();

// Create Campaign
router.post('/', authenticate, authorize([Role.ADMIN]), CampaignController.createCampaign);

// List Campaigns
router.get('/', authenticate, authorize([Role.ADMIN]), CampaignController.listCampaigns);

export default router;
