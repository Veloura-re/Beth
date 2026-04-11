import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserController } from '../controllers/UserController';
import { Role } from '@prisma/client';

const router = express.Router();

// List Agents (Admin only)
router.get('/agents', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), UserController.listAgents);

// List Painters (Admin only)
router.get('/painters', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), UserController.listPainters);

// My Profile
router.get('/me', authenticate, UserController.getProfile);

export default router;
