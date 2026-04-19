import { prisma } from '../index';
import { Role } from '@prisma/client';

// In-memory rate limiting store
const scanAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS_PER_QR = 100; // Max scans per QR code per minute

export class ScanService {
  static async processScan(qrId: string, agentId: string, lat?: number, lng?: number) {
    // 0. Rate limit by QR code (anti-abuse)
    const now = Date.now();
    const qrAttempts = scanAttempts.get(qrId);
    if (qrAttempts) {
      if (now - qrAttempts.lastAttempt < RATE_LIMIT_WINDOW) {
        if (qrAttempts.count > MAX_ATTEMPTS_PER_QR) {
          throw new Error('QR code scan limit exceeded. Please try again later.');
        }
        qrAttempts.count++;
      } else {
        qrAttempts.count = 1;
        qrAttempts.lastAttempt = now;
      }
    } else {
      scanAttempts.set(qrId, { count: 1, lastAttempt: now });
    }

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

    // 2. Fraud Detection: Rate Limiting per Agent
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
      
      // Approximate distance check (0.01 degrees ~ 1km at equator)
      if (distLat > 0.01 || distLng > 0.01) {
        throw new Error('You are too far from the QR location');
      }
    }

    // 6. Record Scan
    const scanRecord = await prisma.scan.create({
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

    // 7. Enforce Single-Use Expiration
    await prisma.qRCode.update({
      where: { id: qrId },
      data: { status: 'EXPIRED' }
    });

    return scanRecord;
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
