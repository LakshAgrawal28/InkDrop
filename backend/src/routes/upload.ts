import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import cloudinary from '../config/cloudinary';

const router = Router();

// Configure multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * POST /api/upload
 * Upload an image to Cloudinary and return the secure URL.
 * Requires authentication.
 */
router.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req: MulterRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if Cloudinary keys are configured
      if (!cloudinary.config().cloud_name) {
        return res.status(503).json({
          error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend/.env'
        });
      }

      // Create a stream to upload the file to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'inkdrop',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Image upload failed: ' + error.message });
          }

          if (!result) {
            return res.status(500).json({ error: 'Image upload failed: No result from Cloudinary' });
          }

          return res.status(200).json({
            imageUrl: result.secure_url,
          });
        }
      );

      // Write buffer to stream and end it
      uploadStream.end(req.file.buffer);
    } catch (err: any) {
      console.error('Upload route error:', err);
      next(err);
    }
  }
);

export default router;
