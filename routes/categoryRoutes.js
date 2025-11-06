import express from 'express';
import { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryBySlug 
} from '../controllers/categoryCtrl.js';

const router = express.Router();

// Get all categories
router.get('/', getCategories);

// Get a single category by ID
router.get('/:id', getCategoryById);

// Get a category by slug
router.get('/slug/:slug', getCategoryBySlug);

// Create a new category
router.post('/', createCategory);

// Update an existing category
router.put('/:id', updateCategory);

// Delete a category
router.delete('/:id', deleteCategory);

export default router;
