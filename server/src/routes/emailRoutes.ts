import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';

const router = Router();

router.get('/', EmailController.getEmails);
router.get('/:id', EmailController.getEmailById);
router.post('/check-inbox', EmailController.checkInbox);
router.post('/simulate', EmailController.simulateInbound);
router.put('/extractions/:id', EmailController.updateExtraction);

export default router;
