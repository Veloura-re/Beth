import { Request, Response } from 'express';
import { FinancialService } from '../services/FinancialService';
import { AuthRequest } from '../middleware/auth';

const financialService = new FinancialService();

export class FinancialController {
  async getSummary(req: Request, res: Response) {
    try {
      const organizationId = (req as AuthRequest).user?.organizationId;
      if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });
      const summary = await financialService.getOrganizationFinancialSummary(organizationId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCashoutRequests(req: Request, res: Response) {
    try {
      const organizationId = (req as AuthRequest).user?.organizationId;
      if (!organizationId) return res.status(401).json({ message: 'Unauthorized' });
      const requests = await financialService.getOrganizationCashouts(organizationId);
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCashoutRequest(req: Request, res: Response) {
    try {
      const agentId = (req as AuthRequest).user?.id;
      if (!agentId) return res.status(401).json({ message: 'Unauthorized' });
      const { amount } = req.body;
      const request = await financialService.requestCashout(agentId, amount);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const request = await financialService.updateCashoutStatus(id as string, status as any); // Cast to any or the specific union if imported
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
