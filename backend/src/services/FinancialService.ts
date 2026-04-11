import { prisma } from '../index';

export class FinancialService {
  /**
   * Agents request to cash out their accumulated points.
   */
  async requestCashout(agentId: string, amount: number) {
    // 1. Calculate current balance
    const user = await prisma.user.findUnique({
      where: { id: agentId },
      include: {
        scans: true,
        cashouts: {
          where: { status: { in: ['PENDING', 'APPROVED', 'PAID'] } }
        }
      }
    });

    if (!user) throw new Error('User not found');

    const totalEarnedPoints = user.scans.reduce((sum, s) => sum + s.pointsEarned, 0);
    const totalCashoutOutValue = user.cashouts.reduce((sum, c) => sum + (c.amount * 10), 0); // Assuming 10pts per $1
    const availablePoints = totalEarnedPoints - totalCashoutOutValue;

    if (availablePoints < (amount * 10)) {
      throw new Error('Insufficient balance for this cashout request');
    }

    return await prisma.cashoutRequest.create({
      data: {
        agentId,
        amount,
        status: 'PENDING'
      }
    });
  }

  /**
   * Admins update the status of a cashout request.
   */
  async updateCashoutStatus(requestId: string, status: 'APPROVED' | 'REJECTED' | 'PAID') {
    return await prisma.cashoutRequest.update({
      where: { id: requestId },
      data: { status }
    });
  }

  /**
   * Get all cashout requests for an organization.
   */
  async getOrganizationCashouts(organizationId: string) {
    return await prisma.cashoutRequest.findMany({
      where: {
        agent: {
          organizationId
        }
      },
      include: {
        agent: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Record a payout made to a painter.
   */
  async recordPainterPayout(adminId: string, painterId: string, amount: number) {
    return await prisma.painterPayout.create({
      data: {
        adminId,
        painterId,
        amount
      }
    });
  }

  /**
   * Get financial summary for an organization.
   */
  async getOrganizationFinancialSummary(organizationId: string) {
    const cashouts = await prisma.cashoutRequest.findMany({
      where: { agent: { organizationId } }
    });

    const totalDisbursed = cashouts
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);

    const pendingLiability = cashouts
      .filter(c => c.status === 'PENDING' || c.status === 'APPROVED')
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      totalDisbursed,
      pendingLiability,
      requestCount: cashouts.length
    };
  }
}
