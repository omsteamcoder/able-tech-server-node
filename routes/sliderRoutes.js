import express from 'express';
import {
  createSlider,
  getSliders,
  updateSlider,
  deleteSlider,
} from '../controllers/sliderController.js'; // Updated to sliderController
import { uploadConfigs } from '../config/uploadConfig.js';
import { dynamicImageHandler } from '../middleware/dynamicImageHandler.js';

const router = express.Router();


// Create a new slider with dynamic image upload middleware
router.post(
  '/',
  dynamicImageHandler(uploadConfigs.slider), // Changed to use the `slider` upload config
  createSlider
);

// Update an existing slider
router.put(
  '/:id',
  dynamicImageHandler(uploadConfigs.slider), // Changed to use the `slider` upload config
  updateSlider
);

// Delete a slider
router.delete('/:id', deleteSlider);

// Get all sliders
router.get('/', getSliders);

export default router;
