import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { OrganizationController } from '../controllers/OrganizationController';
import { Role } from '@prisma/client';

const router = express.Router();

// List Organizations (SuperAdmin only)
router.get('/', authenticate, authorize([Role.SUPERADMIN]), OrganizationController.listOrganizations);

// Create Organization (SuperAdmin only)
router.post('/', authenticate, authorize([Role.SUPERADMIN]), OrganizationController.createOrganization);

// Update Organization (SuperAdmin only)
router.patch('/:id', authenticate, authorize([Role.SUPERADMIN]), OrganizationController.updateOrganization);

// Delete Organization (SuperAdmin only)
router.delete('/:id', authenticate, authorize([Role.SUPERADMIN]), OrganizationController.deleteOrganization);

export default router;
