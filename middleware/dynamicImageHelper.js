import { uploadConfigs } from '../config/uploadConfig.js';
import { dynamicImageHandler } from './dynamicImageHandler.js';

export const applyDynamicMiddleware = (controller, routeKey) => {
  return async (req, res, next) => {
    const config = uploadConfigs[routeKey];
    if (!config) {
      return res.status(400).json({ message: 'Invalid route configuration' });
    }

    // Assign the configuration to `req.uploadConfig`
    req.uploadConfig = config;

    // Apply Dynamic Image Handler Middleware
    const imageHandler = dynamicImageHandler(config);

    imageHandler(req, res, (err) => {
      if (err) {
        console.error('Error in dynamicImageHandler:', err.message);
        return res.status(400).json({ message: 'Error processing uploads', error: err.message });
      }
      controller(req, res, next);
    });
  };
};
