import { prisma } from '../index';
import { Role } from '@prisma/client';

export class AnalyticsService {
  static async getOverview(organizationId?: string) {
    const where = organizationId ? { campaign: { organizationId } } : {};
    
    const totalScans = await prisma.scan.count({ where });
    
    // For counts, we might need a different approach if they aren't linked directly to organization in the DB, 
    // but typically users/agents would be. For now, we'll filters scans.
    
    const aggregations = await prisma.scan.aggregate({
      where,
      _sum: {
        pointsEarned: true,
        painterEarned: true,
        systemRevenue: true,
      },
    });

    const totalRewardsIssued = aggregations._sum.pointsEarned || 0;
    const totalPainterEarnings = aggregations._sum.painterEarned || 0;
    const totalRevenue = aggregations._sum.systemRevenue || 0;
    
    const agentRewardsValue = totalRewardsIssued * 0.1;
    const netProfit = totalRevenue - agentRewardsValue - totalPainterEarnings;

    return {
      totalScans,
      totalRewardsIssued,
      totalPainterEarnings,
      totalRevenue,
      netProfit,
    };
  }

  static async getDailyScans(organizationId?: string) {
    // Note: raw queries might need adjustment for org filtering
    if (organizationId) {
      return await prisma.$queryRaw`
        SELECT DATE_TRUNC('day', s.timestamp) as date, COUNT(*) as count
        FROM "Scan" s
        JOIN "Campaign" c ON s."campaignId" = c.id
        WHERE c."organizationId" = ${organizationId}
        GROUP BY date
        ORDER BY date ASC
      `;
    }
    
    return await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', timestamp) as date, COUNT(*) as count
      FROM "Scan"
      GROUP BY date
      ORDER BY date ASC
    `;
  }

  static async getPlatformCensus() {
    const [totalOrgs, totalAdmins, totalAgents, totalScans] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.user.count({ where: { role: Role.AGENT } }),
      prisma.scan.count()
    ]);

    return {
      totalOrgs,
      totalAdmins,
      totalAgents,
      totalScans
    };
  }
}
