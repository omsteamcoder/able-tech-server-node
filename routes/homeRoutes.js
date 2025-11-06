import express from 'express';
import { createBanner, deleteBanner, getBanners, updateBanner } from '../controllers/bannerSecCtrl.js';
import { createProductSection, deleteProductSection, getProductSections, updateProductSection } from '../controllers/productSecCtrl.js';
import { createSingleSection, deleteSingleSection, getSingleSections, updateSingleSection } from '../controllers/singleSectionCtrl.js';
import { createFeedback, deleteFeedback, getFeedback } from '../controllers/feedbackSecCtrl.js';
import { createAdminProductHighlight, deleteAdminProductHighlight, getAdminProductHighlights } from '../controllers/productHighlightCtrl.js';


const router = express.Router();

// Banner routes
router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Product Section routes
router.get('/product-sections', getProductSections);
router.post('/product-sections', createProductSection);
router.put('/product-sections/:id', updateProductSection);
router.delete('/product-sections/:id', deleteProductSection);

// Single Section routes
router.get('/single-sections', getSingleSections);
router.post('/single-sections', createSingleSection);
router.put('/single-sections/:id', updateSingleSection);
router.delete('/single-sections/:id', deleteSingleSection);

// Feedback routes
router.get('/feedback', getFeedback);
router.post('/feedback', createFeedback);
router.delete('/feedback/:id', deleteFeedback);

// Admin Product Highlight routes
router.get('/admin-product-highlights', getAdminProductHighlights);
router.post('/admin-product-highlights', createAdminProductHighlight);
router.delete('/admin-product-highlights/:id', deleteAdminProductHighlight);

export default router;
