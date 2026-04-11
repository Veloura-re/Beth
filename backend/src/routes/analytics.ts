import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

// Dashboard Overview Stats (Admin only)
router.get('/overview', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const totalScans = await prisma.scan.count();
    const activeAgents = await prisma.user.count({ where: { role: Role.AGENT } });
    const activePainters = await prisma.user.count({ where: { role: Role.PAINTER } });
    
    // Aggregations
    const aggregations = await prisma.scan.aggregate({
      _sum: {
        pointsEarned: true,
        painterEarned: true,
        systemRevenue: true,
      },
    });

    const totalRewardsIssued = aggregations._sum.pointsEarned || 0;
    const totalPainterEarnings = aggregations._sum.painterEarned || 0;
    const totalRevenue = aggregations._sum.systemRevenue || 0;
    
    // Agent Rewards in $$ (Assuming 100 points = $10 => 1 point = $0.1)
    const agentRewardsValue = totalRewardsIssued * 0.1;
    const netProfit = totalRevenue - agentRewardsValue - totalPainterEarnings;

    res.json({
      totalScans,
      activeAgents,
      activePainters,
      totalRewardsIssued,
      totalPainterEarnings,
      totalRevenue,
      netProfit,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overview stats' });
  }
});

// Chart Data (Daily Scans)
router.get('/charts/daily-scans', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const dailyScans = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', timestamp) as date, COUNT(*) as count
      FROM "Scan"
      GROUP BY date
      ORDER BY date ASC
    `;
    res.json(dailyScans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chart data' });
  }
});

export default router;
