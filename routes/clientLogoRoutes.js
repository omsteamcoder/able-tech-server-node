// routes/clientLogoRoutes.js
import express from 'express';
import { createClientLogo, getClientLogos, updateClientLogo, deleteClientLogo } from '../controllers/clientLogoController.js';
import { uploadConfigs } from '../config/uploadConfig.js';
import { dynamicImageHandler } from '../middleware/dynamicImageHandler.js';

const router = express.Router();

// Routes for client logo CRUD operations
// Create new logo with dynamic image upload middleware
// Create a new client logo
router.post(
    '/',
    dynamicImageHandler(uploadConfigs.clientLogo),
    createClientLogo
  );
  
  // Update an existing client logo
  router.put(
    '/:id',
    dynamicImageHandler(uploadConfigs.clientLogo),
    updateClientLogo
  );
  
  // Delete a client logo
  router.delete('/:id', deleteClientLogo);
router.get('/', getClientLogos);      // Get all logos

export default router;
