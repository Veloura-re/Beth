import { Request, Response } from 'express';
import { ScanService } from '../services/ScanService';
import { AuthRequest } from '../middleware/auth';

export class ScanController {
  static async handleScan(req: AuthRequest, res: Response) {
    const { qrId, lat, lng } = req.body;
    const agentId = req.user?.id;

    if (!qrId || !agentId) {
      return res.status(400).json({ message: 'Missing QR ID or Auth' });
    }

    try {
      const scan = await ScanService.processScan(qrId, agentId, Number(lat), Number(lng));
      res.json({
        message: 'Scan successful! Points awarded.',
        points: scan.pointsEarned,
        scanId: scan.id,
      });
    } catch (error: any) {
      res.status(error.message.includes('Scanning too fast') ? 429 : 400).json({ message: error.message });
    }
  }

  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const scans = await ScanService.getLogs((req.user as any).organizationId);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching scan logs' });
    }
  }
}
