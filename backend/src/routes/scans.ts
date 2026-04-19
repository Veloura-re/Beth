import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { ScanController } from '../controllers/ScanController';
import { Role } from '@prisma/client';

const router = express.Router();

// Scan QR (Agent only)
router.post('/', authenticate, authorize([Role.AGENT]), ScanController.handleScan);

// Get All Scan Logs (Admin/SuperAdmin) - for financials/audit ledger
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), ScanController.getLogs);

// Get Personal Scan Logs (Agent only)
router.get('/me', authenticate, authorize([Role.AGENT]), ScanController.getMyScans);

export default router;
