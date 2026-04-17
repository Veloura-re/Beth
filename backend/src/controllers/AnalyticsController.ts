import { Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { AuthRequest } from '../middleware/auth';

export class AnalyticsController {
  static async getOverview(req: AuthRequest, res: Response) {
    try {
      const requesterRole = req.user?.role;
      let organizationId = (req.user as any).organizationId;

      // SuperAdmin can override with query param
      if (requesterRole === 'SUPERADMIN' && req.query.organizationId) {
        organizationId = req.query.organizationId as string;
      }

      const stats = await AnalyticsService.getOverview(organizationId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching overview stats' });
    }
  }

  static async getDailyScans(req: AuthRequest, res: Response) {
    try {
      const requesterRole = req.user?.role;
      let organizationId = (req.user as any).organizationId;

      if (requesterRole === 'SUPERADMIN' && req.query.organizationId) {
        organizationId = req.query.organizationId as string;
      }

      const data = await AnalyticsService.getDailyScans(organizationId);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching chart data' });
    }
  }

  static async getPlatformCensus(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'SUPERADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }
      const census = await AnalyticsService.getPlatformCensus();
      res.json(census);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching platform census' });
    }
  }
}
