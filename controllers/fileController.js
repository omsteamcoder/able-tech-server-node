import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Directory Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(__dirname, '../uploads');
const tempDirectory = path.join(__dirname, '../uploads/temp');

// Ensure directories exist at the start of the file
[uploadDirectory, tempDirectory].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Multer Storage Configuration for Temp Directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDirectory),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Helper function to convert image to WebP and handle file placement
const convertToWebpAndHandleTemp = async (tempPath) => {
  const webpFilename = `${Date.now()}-${path.parse(tempPath).name}.webp`;
  const webpPath = path.join(uploadDirectory, webpFilename);

  try {
    // Convert any image file to .webp format
    await sharp(tempPath).webp({ quality: 80 }).toFile(webpPath);
    console.log('Converted to .webp:', webpPath);

    // Wait before moving to avoid file lock issues
    await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

    // Move the original file asynchronously to avoid locking issues
    const tempDestination = path.join(tempDirectory, path.basename(tempPath));
    fs.rename(tempPath, tempDestination, (err) => {
      if (err) console.error(`Failed to move file to temp: ${tempPath}`, err);
      else console.log('Original file moved to temp:', tempDestination);
    });

    return webpPath;
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
};

// Middleware for Single File Upload, Conversion, and Moving Original
export const uploadSingleFile = async (req, res) => {
  if (!req.file) {
    console.error("No file received"); // Debugging log
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log("File received:", req.file); // Log the received file

  const tempPath = path.join(tempDirectory, req.file.filename);

  try {
    const convertedPath = await convertToWebpAndHandleTemp(tempPath);
    req.uploadedFile = { path: `/uploads/${path.basename(convertedPath)}`, filename: path.basename(convertedPath) };

    res.status(200).json(req.uploadedFile);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Image processing failed', error: error.message });
  }
};




// export const uploadSingleFile = async (req, res) => {
//     if (!req.file) {
//         console.error("No file received"); // Debugging log
//         return res.status(400).json({ message: 'No file uploaded' });
//     }

//     console.log("File received:", req.file); // Log the received file
    
//     const originalPath = path.join(req.file.destination, req.file.filename);
//     try {
//         const webpFilename = `${Date.now()}-${path.parse(req.file.originalname).name}.webp`;
//         const webpPath = path.join(uploadDirectory, webpFilename);

//         await sharp(originalPath)
//             .webp({ quality: 80 })
//             .toFile(webpPath);

//         fs.unlinkSync(originalPath);

//         res.status(200).json({ path: `/uploads/${webpFilename}` });
//     } catch (error) {
//         console.error('Error processing file:', error);
//         res.status(500).json({ message: 'Error processing file', error: error.message });
//     }
// };



// export const uploadSingleFile = async (req, res) => {
//   if (!req.file) {
//     console.error("No file received"); // Debugging log
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   console.log("File received:", req.file); // Log the received file
  
//   const originalPath = path.join(req.file.destination, req.file.filename);
//   try {
//     const webpFilename = `${Date.now()}-${path.parse(req.file.originalname).name}.webp`;
//     const webpPath = path.join(uploadDirectory, webpFilename);

//     await sharp(originalPath)
//       .webp({ quality: 80 })
//       .toFile(webpPath);

//     fs.unlinkSync(originalPath);

//     res.status(200).json({ path: `/uploads/${webpFilename}` });
//   } catch (error) {
//     console.error('Error processing file:', error);
//     res.status(500).json({ message: 'Error processing file', error: error.message });
//   }
// };





// Periodic Temp Directory Cleanup
const cleanupTempDirectory = () => {
  fs.readdir(tempDirectory, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(tempDirectory, file);
      try {
        fs.unlinkSync(filePath);
        console.log('Deleted temp file:', filePath);
      } catch (err) {
        console.error(`Error deleting temp file: ${filePath}`, err);
      }
    });
  });
};
setInterval(cleanupTempDirectory, 3600000); // Runs every hour



export const uploadMultipleFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error("No files received");
    return res.status(400).json({ message: 'No files uploaded' });
  }

  console.log("Files received:", req.files); // Log received files to confirm

  const convertedFiles = [];
  for (const file of req.files) {
    const tempPath = path.join(tempDirectory, file.filename);
    try {
      const convertedPath = await convertToWebpAndHandleTemp(tempPath);
      convertedFiles.push({
        path: `/uploads/${path.basename(convertedPath)}`,
        filename: path.basename(convertedPath)
      });
    } catch (error) {
      await Promise.all(convertedFiles.map(async (f) => fs.unlink(f.path).catch(() => {})));
      console.error('Error processing some images:', error);
      return res.status(500).json({
        message: 'Error processing some images',
        error: error.message
      });
    }
  }

  res.status(200).json({ files: convertedFiles });
};


// List All Files in Upload Directory
export const listFiles = (req, res) => {
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) return res.status(500).json({ message: 'Error listing files' });
    const fileList = files.map(file => ({ name: file, url: `/uploads/${file}` }));
    res.status(200).json(fileList);
  });
};

// Delete a Specific File
export const deleteFile = (req, res) => {
  const filePath = path.join(uploadDirectory, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting file' });
    res.status(200).json({ message: 'File deleted successfully' });
  });
};

// Export the upload middleware
export { upload };
