import { prisma } from '../index';
import { Role } from '@prisma/client';

export class ScanService {
  static async processScan(qrId: string, agentId: string, lat?: number, lng?: number) {
    // 1. Validate QR
    const qr = await prisma.qRCode.findUnique({
      where: { id: qrId },
      include: { campaign: true },
    });

    if (!qr || qr.status !== 'ACTIVE') {
      throw new Error('Invalid or inactive QR code');
    }

    if (qr.expirationDate && qr.expirationDate < new Date()) {
      throw new Error('QR code has expired');
    }

    // 2. Fraud Detection: Rate Limiting
    const lastScan = await prisma.scan.findFirst({
      where: { agentId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastScan) {
      const secondsSinceLastScan = (new Date().getTime() - lastScan.timestamp.getTime()) / 1000;
      if (secondsSinceLastScan < 30) {
        throw new Error('Scanning too fast. Please wait 30 seconds.');
      }
    }

    // 3. Prevent Duplicate Scans
    const existingScan = await prisma.scan.findFirst({
      where: { qrId, agentId },
    });

    if (existingScan) {
      throw new Error('You have already scanned this QR code');
    }

    // 4. Budget Check
    const totalPointsAwarded = await prisma.scan.aggregate({
      where: { campaignId: qr.campaignId },
      _sum: { pointsEarned: true },
    });

    const potentialTotalValue = ((totalPointsAwarded._sum.pointsEarned || 0) + qr.rewardPoints) * 0.1;
    if (qr.campaign.budget > 0 && potentialTotalValue > qr.campaign.budget) {
      throw new Error('Campaign budget reached');
    }

    // 5. Geo-verification
    if (qr.gps && lat && lng) {
      const [qrLat, qrLng] = qr.gps.split(',').map(Number);
      const distLat = Math.abs(qrLat - lat);
      const distLng = Math.abs(qrLng - lng);
      
      if (distLat > 0.01 || distLng > 0.01) {
        throw new Error('You are too far from the QR location');
      }
    }

    // 6. Record Scan
    return await prisma.scan.create({
      data: {
        qrId,
        agentId,
        painterId: qr.painterId,
        campaignId: qr.campaignId,
        pointsEarned: qr.rewardPoints,
        painterEarned: qr.campaign.painterMargin,
        systemRevenue: qr.campaign.systemRevenue,
        lat: lat || null,
        lng: lng || null,
      },
    });
  }

  static async getLogs(organizationId?: string) {
    return await prisma.scan.findMany({
      where: organizationId ? { campaign: { organizationId } } : {},
      include: {
        qr: true,
        agent: { select: { name: true } },
        painter: { select: { name: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  static async getAgentHistory(agentId: string) {
    return await prisma.scan.findMany({
      where: { agentId },
      include: {
        qr: true,
        campaign: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
