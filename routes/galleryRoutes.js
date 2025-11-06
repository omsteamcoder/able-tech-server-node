import express from 'express';
import {
  createGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
} from '../controllers/galleryController.js'; // Updated to galleryController
import { uploadConfigs } from '../config/uploadConfig.js';
import { dynamicImageHandler } from '../middleware/dynamicImageHandler.js';

const router = express.Router();

// Routes for gallery image CRUD operations

// Create a new gallery image with dynamic image upload middleware
router.post(
  '/',
  dynamicImageHandler(uploadConfigs.gallery), // Changed to use the `gallery` upload config
  createGalleryImage
);

// Update an existing gallery image
router.put(
  '/:id',
  dynamicImageHandler(uploadConfigs.gallery), // Changed to use the `gallery` upload config
  updateGalleryImage
);

// Delete a gallery image
router.delete('/:id', deleteGalleryImage);

// Get all gallery images
router.get('/', getGalleryImages);

export default router;
