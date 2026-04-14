import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserController } from '../controllers/UserController';
import { Role } from '@prisma/client';

const router = express.Router();

// List All (Admin/SuperAdmin)
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), UserController.listAllUsers);

// List Agents (Admin only)
router.get('/agents', authenticate, authorize([Role.ADMIN, Role.SUPERADMIN]), UserController.listAgents);

// My Profile
router.get('/me', authenticate, UserController.getProfile);

export default router;
