import { Router } from 'express';
import { FinancialController } from '../controllers/FinancialController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const controller = new FinancialController();

router.use(authenticate);

router.get('/summary', authorize([Role.ADMIN]), controller.getSummary);
router.get('/requests', authorize([Role.ADMIN]), controller.getCashoutRequests);
router.post('/cashout', authorize([Role.AGENT]), controller.createCashoutRequest);
router.patch('/requests/:id', authorize([Role.ADMIN]), controller.updateStatus);

export default router;
