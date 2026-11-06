import { Router } from 'express';
import { CatalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/', CatalogController.getCatalog);
router.post('/', CatalogController.createCatalogItem);
router.put('/:id', CatalogController.updateCatalogItem);
router.post('/match', CatalogController.matchPricing);
router.post('/calculate', CatalogController.calculateTotals);

export default router;
