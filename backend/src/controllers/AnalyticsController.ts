import { Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getOverview(req: AuthRequest, res: Response) {
    try {
      const stats = await AnalyticsService.getOverview((req.user as any).organizationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching overview stats' });
    }
  }

  static async getDailyScans(req: AuthRequest, res: Response) {
    try {
      const data = await AnalyticsService.getDailyScans((req.user as any).organizationId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chart data' });
    }
  }
}
