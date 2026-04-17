import { Response } from 'express';
import { OrganizationService } from '../services/OrganizationService';
import { AuthRequest } from '../middleware/auth';

export class OrganizationController {
  static async listOrganizations(req: AuthRequest, res: Response) {
    try {
      const orgs = await OrganizationService.listOrganizations();
      res.json(orgs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching organization registry' });
    }
  }

  static async createOrganization(req: AuthRequest, res: Response) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Identifier required' });
    
    try {
      const org = await OrganizationService.createOrganization(name);
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: 'Operation failed' });
    }
  }

  static async updateOrganization(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'New identifier required' });

    try {
      const org = await OrganizationService.updateOrganization(id, name);
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: 'Update failed' });
    }
  }

  static async deleteOrganization(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    try {
      await OrganizationService.deleteOrganization(id);
      res.json({ message: 'Decommissioned' });
    } catch (error) {
      res.status(500).json({ message: 'Decommissioning failed' });
    }
  }
}
