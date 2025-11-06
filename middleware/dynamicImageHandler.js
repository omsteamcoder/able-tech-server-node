import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

// Resolve Current Directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define Folders
const TEMP_DIR = path.resolve(__dirname, "../uploads/temp");
const MAIN_DIR = path.resolve(__dirname, "../uploads/main");

// Utility to Ensure Directory Exists
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`Directory created: ${directory}`);
    } catch (error) {
      console.error(`Failed to create directory: ${directory}`, error.message);
    }
  } else {
    console.log(`Directory exists: ${directory}`);
  }
};

// Check All Required Folders
const checkRequiredFolders = () => {
  console.log("Checking required folders...");
  [TEMP_DIR, MAIN_DIR].forEach(ensureDirectoryExists);
};
checkRequiredFolders();

// Multer Storage Configuration for Temp Folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureDirectoryExists(TEMP_DIR);
      cb(null, TEMP_DIR); // Save all original files to TEMP_DIR
    } catch (error) {
      console.error("Error ensuring temp folder existence:", error.message);
      cb(new Error("Failed to create temp directory"), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];
    console.log(`File type received: ${file.mimetype}`);
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log("File accepted.");
      cb(null, true);
    } else {
      console.error(`File rejected: Unsupported file format: ${file.mimetype}`);
      cb(new Error(`Unsupported file format: ${file.mimetype}`), false);
    }
  },
});

// Image Processing with Sharp
const processImage = async (filePath, { width, height, outputDir }) => {
  try {
    const outputFilePath = path.join(
      outputDir,
      `${Date.now()}-${path.basename(filePath).replace(/\.[^.]+$/, ".webp")}`
    );

    console.log(`Processing image: ${filePath}`);
    console.log(`Resizing to: ${width}x${height}`);

    // Sharp processing
    await sharp(filePath)
      .resize(width, height, { fit: "cover", position: "center" })
      .toFormat("webp") // Convert to WebP
      .toFile(outputFilePath);

    console.log(`Image processed and saved as: ${outputFilePath}`);
    return outputFilePath; // Return processed file path
  } catch (error) {
    console.error("Error during image processing:", error.message);
    throw new Error("Failed to process image");
  }
};

// Dynamic Image Handler Middleware
export const dynamicImageHandler = (config) => {
  return async (req, res, next) => {
    if (!config || !config.sizes || !Array.isArray(config.sizes)) {
      return res
        .status(400)
        .json({ error: "Invalid configuration for image handler" });
    }

    req.uploadConfig = { folderName: config.folderName || "default" }; // Attach folderName to request

    const fields = config.sizes.map((size) => ({
      name: size.fieldName,
      maxCount: size.multiple ? size.limit || 5 : 1,
    }));

    const uploader = upload.fields(fields);

    uploader(req, res, async (err) => {
      if (err) {
        console.error("Error during file upload:", err.message);
        return res
          .status(400)
          .json({ error: "Error uploading files", details: err.message });
      }

      try {
        // Process all configured fields
        for (const sizeConfig of config.sizes) {
          const fieldName = sizeConfig.fieldName;
          const files = req.files[fieldName] || [];

          console.log(
            `Processing field: ${fieldName}, Files found: ${files.length}`
          );

          if (files.length > 0) {
            const processedFiles = await Promise.all(
              files.map(async (file) => {
                console.log(
                  `Processing file: ${file.path} for field: ${fieldName}`
                );

                const outputDir = path.join(
                  MAIN_DIR,
                  req.uploadConfig.folderName
                );
                ensureDirectoryExists(outputDir);

                const processedPath = await processImage(file.path, {
                  width: sizeConfig.width,
                  height: sizeConfig.height,
                  outputDir,
                });

                return {
                  ...file,
                  originalPath: file.path,
                  path: processedPath,
                };
              })
            );

            req.files[fieldName] = processedFiles;
          }
        }

        console.log("All files processed successfully");
        next();
      } catch (error) {
        console.error("Error during image processing:", error.message);
        res
          .status(500)
          .json({ error: "Error processing images", details: error.message });
      }
    });
  };
};

// Scheduled Cleanup for Temp Folder
export const scheduleTempCleanup = () => {
  setInterval(() => {
    const files = fs.readdirSync(TEMP_DIR);
    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);
      const fileStats = fs.statSync(filePath);
      const fileAge = Date.now() - fileStats.mtimeMs;

      if (fileAge > 3600000) {
        // Older than 1 hour
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted temp file: ${filePath}`);
        } catch (error) {
          console.error(
            `Failed to delete temp file: ${filePath}`,
            error.message
          );
        }
      }
    });
  }, 1000 * 60 * 60); // Run every hour
};
