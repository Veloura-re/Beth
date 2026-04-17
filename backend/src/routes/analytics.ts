import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { Role } from '@prisma/client';

const router = express.Router();

// Dashboard Overview Stats (Admin/SuperAdmin)
router.get('/overview', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), AnalyticsController.getOverview);

// Chart Data (Daily Scans)
router.get('/charts/daily-scans', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), AnalyticsController.getDailyScans);

// Global Census (SuperAdmin only)
router.get('/census', authenticate, authorize([Role.SUPERADMIN]), AnalyticsController.getPlatformCensus);

export default router;
