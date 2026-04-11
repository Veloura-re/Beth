import { prisma } from '../index';
import { Role } from '@prisma/client';

export class UserService {
  static async listUsersByRole(role: Role, organizationId?: string) {
    const where: any = { role };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        createdAt: true,
        // We can aggregate scans here to show performance data
        _count: {
          select: { scans: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getUserPerformance(userId: string) {
    const stats = await prisma.scan.aggregate({
      where: { 
        OR: [
          { agentId: userId },
          { painterId: userId }
        ]
      },
      _sum: {
        pointsEarned: true,
        painterEarned: true,
      },
      _count: {
        _all: true
      }
    });

    const cashouts = await prisma.cashoutRequest.aggregate({
      where: {
        agentId: userId,
        status: { in: ['PENDING', 'APPROVED', 'PAID'] }
      },
      _sum: {
        amount: true
      }
    });

    const totalEarned = stats._sum.pointsEarned || stats._sum.painterEarned || 0;
    const totalCashoutValue = (cashouts._sum.amount || 0) * 10; // 10 pts per $1

    return {
      totalScans: stats._count._all,
      totalEarned,
      availableBalance: totalEarned - totalCashoutValue
    };
  }
}
