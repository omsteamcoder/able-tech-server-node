const uploadMiddleware = (type, fieldName, config) => {
    const { folderName, width, height, limit = 5 } = config; // Default limit for multiple files
  
    return async (req, res, next) => {
      try {
        const uploadPath = path.join('uploads', folderName);
  
        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
  
        const storage = multer.diskStorage({
          destination: (req, file, cb) => {
            cb(null, uploadPath); // Use dynamic folder name
          },
          filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
          },
        });
  
        const upload = multer({ storage });
  
        if (type === 'single') {
          await upload.single(fieldName)(req, res, async (err) => {
            if (err) return res.status(400).json({ error: 'Error uploading file.' });
  
            // Process single image
            req.file.path = (
              await processImages([req.file], { width, height })
            )[0];
            next();
          });
        } else if (type === 'multiple') {
          await upload.array(fieldName, limit)(req, res, async (err) => {
            if (err) return res.status(400).json({ error: 'Error uploading files.' });
  
            // Process multiple images
            req.files = await processImages(req.files, { width, height });
            next();
          });
        }
      } catch (error) {
        res.status(500).json({ error: 'Error handling uploads.', details: error.message });
      }
    };
  };
  