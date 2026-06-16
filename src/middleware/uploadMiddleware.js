const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../server/utils/logger');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File size limits
const FILE_SIZE_LIMITS = {
  profilePicture: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  default: 5 * 1024 * 1024, // 5MB
};

// Allowed file types
const ALLOWED_TYPES = {
  profilePicture: ['image/jpeg', 'image/png', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  default: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, req.user?.id || 'temp');
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  try {
    const fieldType = req.params?.fieldType || req.body?.fieldType || 'default';
    const allowedMimes = ALLOWED_TYPES[fieldType] || ALLOWED_TYPES.default;
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`), false);
    }
  } catch (error) {
    logger.error('File filter error:', error);
    cb(error);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
  },
});

// Middleware for single file upload
const uploadSingleFile = (fieldName, fieldType = 'default') => {
  return (req, res, next) => {
    const sizeLimit = FILE_SIZE_LIMITS[fieldType] || FILE_SIZE_LIMITS.default;
    
    const uploader = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: sizeLimit,
      },
    });

    uploader.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds limit of ${sizeLimit / 1024 / 1024}MB`,
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded',
          });
        }
      }

      if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: `No file uploaded for field: ${fieldName}`,
        });
      }

      // Validate file exists and has content
      const filePath = req.file.path;
      const stats = fs.statSync(filePath);
      
      if (stats.size === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          success: false,
          message: 'Uploaded file is empty',
        });
      }

      logger.info('File uploaded successfully:', {
        userId: req.user?.id,
        filename: req.file.filename,
        size: stats.size,
        mimetype: req.file.mimetype,
      });

      next();
    });
  };
};

// Middleware for multiple file uploads
const uploadMultipleFiles = (fieldName, maxFiles = 5, fieldType = 'default') => {
  return (req, res, next) => {
    const sizeLimit = FILE_SIZE_LIMITS[fieldType] || FILE_SIZE_LIMITS.default;
    
    const uploader = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: sizeLimit,
        files: maxFiles,
      },
    });

    uploader.array(fieldName, maxFiles)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds limit of ${sizeLimit / 1024 / 1024}MB`,
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Maximum ${maxFiles} files allowed`,
          });
        }
      }

      if (err) {
        logger.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: `No files uploaded for field: ${fieldName}`,
        });
      }

      logger.info('Multiple files uploaded successfully:', {
        userId: req.user?.id,
        fileCount: req.files.length,
      });

      next();
    });
  };
};

// Middleware to cleanup file on error
const cleanupFile = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400 && req.file) {
      try {
        fs.unlinkSync(req.file.path);
        logger.info('Temporary file cleaned up:', req.file.filename);
      } catch (error) {
        logger.error('File cleanup error:', error);
      }
    }
  });
  next();
};

// Delete uploaded file
const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted:', filePath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('File delete error:', error);
    return false;
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  cleanupFile,
  deleteUploadedFile,
  FILE_SIZE_LIMITS,
  ALLOWED_TYPES,
};
