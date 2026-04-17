import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { ScanController } from '../controllers/ScanController';
import { Role } from '@prisma/client';

const router = express.Router();

// Scan QR (Agent only)
router.post('/', authenticate, authorize([Role.AGENT]), ScanController.handleScan);

// Get Personal Scan Logs (Agent only)
router.get('/me', authenticate, authorize([Role.AGENT]), ScanController.getMyScans);

export default router;
