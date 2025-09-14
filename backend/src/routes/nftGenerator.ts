import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { NFTGeneratorService } from '../services/NFTGeneratorService';
import { StorageService } from '../services/StorageService';
import { DeployService } from '../services/DeployService';
import { RarityUtils } from '../utils/RarityUtils';
import { logger } from '../utils/logger';
import { broadcastToSession } from '../index';

const router = Router();
const generatorService = new NFTGeneratorService();
const storageService = new StorageService();
const deployService = new DeployService();

// Configure multer for ZIP uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
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

/**
 * POST /upload-layers
 * Upload ZIP file containing layer folders and extract them
 */
router.post('/upload-layers', upload.single('zipFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No ZIP file uploaded',
          code: 'NO_FILE_UPLOADED'
        }
      });
    }

    const sessionId = uuidv4();
    logger.info(`Starting layer upload for session: ${sessionId}`);

    // Extract layers from ZIP
    const layers = await generatorService.extractLayers(req.file.buffer, sessionId);
    
    // Validate layers
    const validation = await generatorService.validateLayers(layers);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid layer structure',
          code: 'INVALID_LAYERS',
          details: validation.errors
        }
      });
    }

    logger.info(`Successfully extracted ${layers.length} layers for session: ${sessionId}`);

    res.json({
      success: true,
      data: {
        sessionId,
        layers: layers.map(layer => ({
          name: layer.name,
          traits: layer.traits,
          count: layer.traits.length
        })),
        totalTraits: layers.reduce((sum, layer) => sum + layer.traits.length, 0)
      }
    });

  } catch (error) {
    logger.error('Layer upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process ZIP file',
        code: 'UPLOAD_FAILED'
      }
    });
  }
});

/**
 * POST /generate-config
 * Save generation configuration for a session
 */
router.post('/generate-config', [
  body('sessionId').isString().withMessage('Session ID is required'),
  body('order').isArray({ min: 1 }).withMessage('Layer order is required'),
  body('rarity').isObject().withMessage('Rarity configuration is required'),
  body('supply').isInt({ min: 1, max: 10000 }).withMessage('Supply must be between 1 and 10,000'),
  body('collection').isObject().withMessage('Collection configuration is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId, order, rarity, supply, collection } = req.body;

    logger.info(`Saving generation config for session: ${sessionId}`);

    // Validate configuration
    const validation = await generatorService.validateConfig({
      sessionId,
      order,
      rarity,
      supply,
      collection
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid configuration',
          code: 'INVALID_CONFIG',
          details: validation.errors
        }
      });
    }

    // Save configuration
    await generatorService.saveConfig(sessionId, {
      order,
      rarity,
      supply,
      collection,
      createdAt: new Date()
    });

    logger.info(`Configuration saved for session: ${sessionId}`);

    res.json({
      success: true,
      data: {
        sessionId,
        config: {
          order,
          rarity,
          supply,
          collection
        }
      }
    });

  } catch (error) {
    logger.error('Config generation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to save configuration',
        code: 'CONFIG_SAVE_FAILED'
      }
    });
  }
});

/**
 * POST /generate-nfts
 * Generate NFTs based on saved configuration
 */
router.post('/generate-nfts', [
  body('sessionId').isString().withMessage('Session ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId } = req.body;

    logger.info(`Starting NFT generation for session: ${sessionId}`);

    // Get configuration
    const config = await generatorService.getConfig(sessionId);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Configuration not found',
          code: 'CONFIG_NOT_FOUND'
        }
      });
    }

    // Start generation process (async)
    generatorService.generateNFTs(sessionId, config)
      .then(async (result) => {
        logger.info(`NFT generation completed for session: ${sessionId}`);
        
        // Broadcast completion
        broadcastToSession(sessionId, {
          type: 'generation_complete',
          sessionId,
          result
        });
      })
      .catch((error) => {
        logger.error(`NFT generation failed for session: ${sessionId}`, error);
        
        // Broadcast error
        broadcastToSession(sessionId, {
          type: 'generation_error',
          sessionId,
          error: error.message
        });
      });

    res.json({
      success: true,
      data: {
        sessionId,
        message: 'NFT generation started',
        estimatedTime: Math.ceil(config.supply / 100) // Rough estimate
      }
    });

  } catch (error) {
    logger.error('NFT generation start error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start NFT generation',
        code: 'GENERATION_START_FAILED'
      }
    });
  }
});

/**
 * POST /deploy-collection
 * Deploy collection to Analos blockchain
 */
router.post('/deploy-collection', [
  body('sessionId').isString().withMessage('Session ID is required'),
  body('walletSignature').isString().withMessage('Wallet signature is required'),
  body('walletAddress').isString().withMessage('Wallet address is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId, walletSignature, walletAddress } = req.body;

    logger.info(`Starting collection deployment for session: ${sessionId}`);

    // Verify wallet signature
    const isValidSignature = await deployService.verifySignature(
      walletAddress,
      walletSignature,
      sessionId
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid wallet signature',
          code: 'INVALID_SIGNATURE'
        }
      });
    }

    // Get generation result
    const result = await generatorService.getGenerationResult(sessionId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generation result not found',
          code: 'RESULT_NOT_FOUND'
        }
      });
    }

    // Deploy to blockchain
    const deployment = await deployService.deployCollection({
      sessionId,
      walletAddress,
      collectionConfig: result.collection,
      metadataUri: result.baseURI,
      totalSupply: result.totalSupply
    });

    logger.info(`Collection deployed for session: ${sessionId}`, deployment);

    res.json({
      success: true,
      data: {
        sessionId,
        collectionAddress: deployment.collectionAddress,
        masterMintAddress: deployment.masterMintAddress,
        transactionSignature: deployment.transactionSignature,
        explorerUrl: `https://explorer.analos.io/tx/${deployment.transactionSignature}`,
        baseURI: result.baseURI
      }
    });

  } catch (error) {
    logger.error('Collection deployment error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deploy collection',
        code: 'DEPLOYMENT_FAILED'
      }
    });
  }
});

/**
 * GET /progress/:sessionId
 * Get generation progress for a session
 */
router.get('/progress/:sessionId', [
  param('sessionId').isString().withMessage('Session ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const progress = await generatorService.getProgress(sessionId);
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: progress
    });

  } catch (error) {
    logger.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get progress',
        code: 'PROGRESS_FETCH_FAILED'
      }
    });
  }
});

/**
 * GET /sessions/:sessionId/result
 * Get generation result for a session
 */
router.get('/sessions/:sessionId/result', [
  param('sessionId').isString().withMessage('Session ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await generatorService.getGenerationResult(sessionId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Generation result not found',
          code: 'RESULT_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Result fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get result',
        code: 'RESULT_FETCH_FAILED'
      }
    });
  }
});

/**
 * DELETE /sessions/:sessionId
 * Clean up session data
 */
router.delete('/sessions/:sessionId', [
  param('sessionId').isString().withMessage('Session ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    await generatorService.cleanupSession(sessionId);

    res.json({
      success: true,
      message: 'Session cleaned up successfully'
    });

  } catch (error) {
    logger.error('Session cleanup error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to cleanup session',
        code: 'CLEANUP_FAILED'
      }
    });
  }
});

export default router;
