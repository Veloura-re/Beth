import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { CampaignController } from '../controllers/CampaignController';
import { Role } from '@prisma/client';

const router = express.Router();

// List Campaigns (Admin/SuperAdmin)
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), CampaignController.listCampaigns);

// Create Campaign
router.post('/', authenticate, authorize([Role.ADMIN]), CampaignController.createCampaign);

// Update Campaign
router.patch('/:id', authenticate, authorize([Role.ADMIN]), CampaignController.updateCampaign);

// Delete Campaign
router.delete('/:id', authenticate, authorize([Role.ADMIN]), CampaignController.deleteCampaign);

export default router;
