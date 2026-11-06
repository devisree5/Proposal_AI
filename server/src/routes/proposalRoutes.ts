import { Router } from 'express';
import { ProposalController } from '../controllers/proposalController.js';

const router = Router();

router.get('/', ProposalController.getProposals);
router.post('/', ProposalController.createProposal);
router.get('/:id', ProposalController.getProposalById);
router.put('/:id', ProposalController.updateProposal);
router.get('/:id/preview', ProposalController.previewProposal);
router.get('/:id/download', ProposalController.downloadPdf);
router.post('/:id/send', ProposalController.sendEmail);

export default router;
