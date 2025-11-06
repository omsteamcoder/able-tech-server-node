import express from 'express';
import {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByType,
  searchProducts
} from '../controllers/productCtrl.js';
import { applyDynamicMiddleware } from '../middleware/dynamicImageHelper.js';

const router = express.Router();

// Routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/type/:type', getProductsByType);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.post('/', applyDynamicMiddleware(createProduct, 'product'));
router.put('/:id', applyDynamicMiddleware(updateProduct, 'product'));
router.delete('/:id', deleteProduct);

export default router;