import { Response } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';

export class UserController {
  static async listAllUsers(req: AuthRequest, res: Response) {
    try {
      const requesterRole = req.user?.role;
      const organizationId = (req.user as any).organizationId;
      
      let targetRole: Role | undefined;
      
      if (requesterRole === Role.SUPERADMIN) {
        targetRole = Role.ADMIN;
      } else if (requesterRole === Role.ADMIN) {
        targetRole = Role.AGENT;
      } else {
        return res.status(403).json({ message: 'Operational hierarchy mismatch' });
      }

      const users = await UserService.listUsersByRole(targetRole, organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching hierarchy registry' });
    }
  }

  static async listAgents(req: AuthRequest, res: Response) {
    try {
      const users = await UserService.listUsersByRole(Role.AGENT, (req.user as any).organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching agents' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    
    try {
      const performance = await UserService.getUserPerformance(
        userId, 
        req.user?.role as Role, 
        req.user?.organizationId
      );
      res.json({ ...req.user, performance });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }
}
