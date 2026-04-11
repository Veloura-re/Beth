import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export class UserController {
  static async listAgents(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.listUsersByRole(Role.AGENT, (req.user as any).organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agents' });
    }
  }

  static async listPainters(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.listUsersByRole(Role.PAINTER, (req.user as any).organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching painters' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    try {
      const performance = await UserService.getUserPerformance(userId);
      res.json({ ...req.user, performance });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }
}
