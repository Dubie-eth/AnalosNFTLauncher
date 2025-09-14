import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CollectionService } from '../services/CollectionService';
import { MetadataService } from '../services/MetadataService';
import { BlockchainService } from '../services/BlockchainService';
import { CollectionConfig, CollectionStatus } from '@analos-nft-launcher/shared';
import { broadcastToCollection } from '../index';

const router = Router();
const collectionService = new CollectionService();
const metadataService = new MetadataService();
const blockchainService = new BlockchainService();

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

// Create a new collection
router.post('/create', [
  body('name').isString().isLength({ min: 1, max: 32 }).withMessage('Name must be 1-32 characters'),
  body('symbol').isString().isLength({ min: 1, max: 10 }).withMessage('Symbol must be 1-10 characters'),
  body('description').isString().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('supply').isInt({ min: 1, max: 10000 }).withMessage('Supply must be between 1 and 10,000'),
  body('mintPrice').isFloat({ min: 0.001, max: 10 }).withMessage('Mint price must be between 0.001 and 10'),
  body('royalties').isFloat({ min: 0, max: 25 }).withMessage('Royalties must be between 0 and 25%'),
  body('traits').isArray({ min: 1 }).withMessage('At least one trait category is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('creator').isString().withMessage('Creator wallet address is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const config: CollectionConfig = req.body;
    
    // Validate collection configuration
    const validationErrors = collectionService.validateConfig(config);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid collection configuration',
          code: 'INVALID_CONFIG',
          details: validationErrors
        }
      });
    }

    // Create collection record
    const collection = await collectionService.createCollection(config);
    
    // Broadcast collection creation
    broadcastToCollection(collection.id, {
      type: 'collection_created',
      collectionId: collection.id,
      status: collection.status
    });

    res.status(201).json({
      success: true,
      data: {
        collectionId: collection.id,
        status: collection.status,
        message: 'Collection created successfully. Processing will begin shortly.'
      }
    });

    // Start async processing
    processCollectionAsync(collection.id, config).catch(error => {
      console.error('Collection processing error:', error);
      collectionService.updateCollectionStatus(collection.id, CollectionStatus.ERROR, error.message);
      
      broadcastToCollection(collection.id, {
        type: 'collection_error',
        collectionId: collection.id,
        error: error.message
      });
    });

  } catch (error) {
    console.error('Collection creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create collection',
        code: 'COLLECTION_CREATION_FAILED'
      }
    });
  }
});

// Get collection details
router.get('/:id', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollection(id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get collection',
        code: 'GET_COLLECTION_FAILED'
      }
    });
  }
});

// Get user's collections
router.get('/user/:walletAddress', [
  param('walletAddress').isString().withMessage('Wallet address is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const collections = await collectionService.getUserCollections(walletAddress, page, limit);
    
    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get user collections error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get user collections',
        code: 'GET_USER_COLLECTIONS_FAILED'
      }
    });
  }
});

// Update collection
router.put('/:id', [
  param('id').isString().withMessage('Collection ID is required'),
  body('name').optional().isString().isLength({ min: 1, max: 32 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('imageUri').optional().isString().isURL(),
  body('externalUrl').optional().isString().isURL(),
  body('isPublic').optional().isBoolean(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const collection = await collectionService.updateCollection(id, updates);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    // Broadcast update
    broadcastToCollection(id, {
      type: 'collection_updated',
      collectionId: id,
      updates
    });

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update collection',
        code: 'UPDATE_COLLECTION_FAILED'
      }
    });
  }
});

// Delete collection (only if not deployed)
router.delete('/:id', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await collectionService.deleteCollection(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found or cannot be deleted',
          code: 'COLLECTION_DELETE_FAILED'
        }
      });
    }

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete collection',
        code: 'DELETE_COLLECTION_FAILED'
      }
    });
  }
});

// Get collection statistics
router.get('/:id/stats', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await collectionService.getCollectionStats(id);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get collection stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get collection statistics',
        code: 'GET_COLLECTION_STATS_FAILED'
      }
    });
  }
});

// Async collection processing function
async function processCollectionAsync(collectionId: string, config: CollectionConfig) {
  try {
    // Update status to uploading
    await collectionService.updateCollectionStatus(collectionId, CollectionStatus.UPLOADING);
    broadcastToCollection(collectionId, {
      type: 'status_update',
      collectionId,
      status: CollectionStatus.UPLOADING
    });

    // Upload images to storage
    const imageUris = await metadataService.uploadImages(config.images);
    
    // Update status to generating
    await collectionService.updateCollectionStatus(collectionId, CollectionStatus.GENERATING);
    broadcastToCollection(collectionId, {
      type: 'status_update',
      collectionId,
      status: CollectionStatus.GENERATING
    });

    // Generate metadata
    const metadataUri = await metadataService.generateCollectionMetadata(collectionId, config, imageUris);
    
    // Update status to deploying
    await collectionService.updateCollectionStatus(collectionId, CollectionStatus.DEPLOYING);
    broadcastToCollection(collectionId, {
      type: 'status_update',
      collectionId,
      status: CollectionStatus.DEPLOYING
    });

    // Deploy to blockchain
    const deploymentResult = await blockchainService.deployCollection(collectionId, config, metadataUri);
    
    // Update collection with deployment results
    await collectionService.updateCollectionDeployment(collectionId, deploymentResult);
    
    // Update status to ready
    await collectionService.updateCollectionStatus(collectionId, CollectionStatus.READY);
    broadcastToCollection(collectionId, {
      type: 'collection_ready',
      collectionId,
      deploymentResult
    });

  } catch (error) {
    console.error('Collection processing error:', error);
    await collectionService.updateCollectionStatus(collectionId, CollectionStatus.ERROR, error.message);
    throw error;
  }
}

export default router;
