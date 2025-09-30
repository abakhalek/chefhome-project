import multer from 'multer';
import path from 'path';

// Configure multer for different file types
const createUploadMiddleware = (options = {}) => {
  const {
    destination = 'uploads/',
    fileSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  } = options;

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    limits: { fileSize },
    fileFilter
  });
};

// Specific upload configurations
export const uploadDocument = createUploadMiddleware({
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  fileSize: 10 * 1024 * 1024 // 10MB for documents
});

export const uploadImage = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  fileSize: 5 * 1024 * 1024 // 5MB for images
});

export const uploadPortfolio = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  fileSize: 3 * 1024 * 1024 // 3MB for portfolio images
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};