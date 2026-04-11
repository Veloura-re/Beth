import { Router } from 'express';
import { FinancialController } from '../controllers/FinancialController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new FinancialController();

router.use(authenticate);

router.get('/summary', controller.getSummary);
router.get('/requests', controller.getCashoutRequests);
router.post('/cashout', controller.createCashoutRequest);
router.patch('/requests/:id', controller.updateStatus);

export default router;
