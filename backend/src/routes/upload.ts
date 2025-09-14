import { Router } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import { UploadService } from '../services/UploadService';
import { config } from '../utils/env';

const router = Router();
const uploadService = new UploadService();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
    files: 100 // Maximum 100 files per request
  },
  fileFilter: (req, file, cb) => {
    if (config.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${config.allowedFileTypes.join(', ')}`));
    }
  }
});

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

// Upload single file
router.post('/single', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'NO_FILE_UPLOADED'
        }
      });
    }

    const { layer, trait, value, weight } = req.body;
    
    if (!layer || !trait || !value) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: layer, trait, value',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const uploadResult = await uploadService.uploadFile({
      file: req.file,
      layer,
      trait,
      value,
      weight: weight ? parseFloat(weight) : 1
    });

    res.json({
      success: true,
      data: uploadResult
    });
  } catch (error) {
    console.error('Single file upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload file',
        code: 'UPLOAD_FAILED'
      }
    });
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 100), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No files uploaded',
          code: 'NO_FILES_UPLOADED'
        }
      });
    }

    const { layer, trait } = req.body;
    
    if (!layer || !trait) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: layer, trait',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const uploadResults = await uploadService.uploadMultipleFiles(files, layer, trait);

    res.json({
      success: true,
      data: {
        uploads: uploadResults,
        total: uploadResults.length
      }
    });
  } catch (error) {
    console.error('Multiple files upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload files',
        code: 'UPLOAD_FAILED'
      }
    });
  }
});

// Upload trait images
router.post('/traits', upload.array('images', 100), [
  body('collectionId').isString().withMessage('Collection ID is required'),
  body('traits').isArray({ min: 1 }).withMessage('At least one trait is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { collectionId, traits } = req.body;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No images uploaded',
          code: 'NO_IMAGES_UPLOADED'
        }
      });
    }

    const uploadResults = await uploadService.uploadTraitImages(collectionId, files, JSON.parse(traits));

    res.json({
      success: true,
      data: {
        collectionId,
        uploads: uploadResults,
        total: uploadResults.length
      }
    });
  } catch (error) {
    console.error('Trait images upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload trait images',
        code: 'TRAIT_IMAGES_UPLOAD_FAILED'
      }
    });
  }
});

// Get upload status
router.get('/status/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const status = await uploadService.getUploadStatus(uploadId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Upload not found',
          code: 'UPLOAD_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get upload status',
        code: 'GET_UPLOAD_STATUS_FAILED'
      }
    });
  }
});

// Delete uploaded file
router.delete('/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    
    const success = await uploadService.deleteFile(uploadId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found or could not be deleted',
          code: 'FILE_DELETE_FAILED'
        }
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete file',
        code: 'DELETE_FILE_FAILED'
      }
    });
  }
});

// Get upload history
router.get('/history/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const history = await uploadService.getUploadHistory(collectionId);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get upload history error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get upload history',
        code: 'GET_UPLOAD_HISTORY_FAILED'
      }
    });
  }
});

// Error handling middleware for multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: `File too large. Maximum size: ${config.maxFileSize / 1024 / 1024}MB`,
          code: 'FILE_TOO_LARGE'
        }
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Too many files. Maximum: 100 files per request',
          code: 'TOO_MANY_FILES'
        }
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: {
        message: error.message,
        code: 'INVALID_FILE_TYPE'
      }
    });
  }
  
  next(error);
});

export default router;
