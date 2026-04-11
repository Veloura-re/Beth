import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { ScanController } from '../controllers/ScanController';
import { Role } from '@prisma/client';

const router = express.Router();

// Scan QR (Agent only)
router.post('/', authenticate, authorize([Role.AGENT]), ScanController.handleScan);

// Get Scan Logs (Admin only)
router.get('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), ScanController.getLogs);

export default router;
