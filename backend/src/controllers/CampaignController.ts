import { Response } from 'express';
import { CampaignService } from '../services/CampaignService';
import { AuthRequest } from '../middleware/auth';

export class CampaignController {
  static async createCampaign(req: AuthRequest, res: Response) {
    const { name, description, budget, rewardPerScan, painterMargin, systemRevenue, organizationId } = req.body;
    try {
      const campaign = await CampaignService.createCampaign({
        name,
        description,
        budget,
        rewardPerScan,
        painterMargin,
        systemRevenue,
        organizationId: organizationId || (req.user as any).organizationId,
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: 'Error creating campaign' });
    }
  }

  static async listCampaigns(req: AuthRequest, res: Response) {
    try {
      const campaigns = await CampaignService.listCampaigns((req.user as any).organizationId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching campaigns' });
    }
  }
}
