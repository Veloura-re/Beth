import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { Role } from '@prisma/client';

const router = express.Router();

// Dashboard Overview Stats (Admin only)
router.get('/overview', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), AnalyticsController.getOverview);

// Chart Data (Daily Scans)
router.get('/charts/daily-scans', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), AnalyticsController.getDailyScans);

export default router;
