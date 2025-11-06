// routes/fileRoutes.js
import express from 'express';
import { uploadSingleFile, uploadMultipleFiles, listFiles, deleteFile, upload } from '../controllers/fileController.js';

const router = express.Router();



// routes/fileRoutes.js
// Single file upload - expects 'file' as field name
router.post('/upload/single', upload.single('file'), uploadSingleFile);

// Multiple file upload - expects 'files' as field name
router.post('/upload/multiple', upload.array('files', 30), uploadMultipleFiles);

// Endpoint to list all files
router.get('/files', listFiles);

// Endpoint to delete a file by filename
router.delete('/files/:filename', deleteFile);

export default router;
