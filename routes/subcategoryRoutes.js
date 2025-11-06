import express from 'express';
import {
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/subcategoryCtrl.js';

const router = express.Router();

// Routes
router.get('/', getSubcategories);
router.get('/:id', getSubcategoryById);
router.post('/', createSubcategory);
router.put('/:id', updateSubcategory);
router.delete('/:id', deleteSubcategory);

export default router;
