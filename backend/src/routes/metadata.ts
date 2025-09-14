import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';
import { MetadataService } from '../services/MetadataService';
import { CollectionService } from '../services/CollectionService';

const router = Router();
const metadataService = new MetadataService();
const collectionService = new CollectionService();

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

// Get collection metadata
router.get('/collection/:collectionId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const collection = await collectionService.getCollection(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    const metadata = await metadataService.getCollectionMetadata(collectionId);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Get collection metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get collection metadata',
        code: 'GET_COLLECTION_METADATA_FAILED'
      }
    });
  }
});

// Get NFT metadata
router.get('/nft/:collectionId/:tokenId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  param('tokenId').isInt({ min: 0 }).withMessage('Token ID must be a non-negative integer'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId, tokenId } = req.params;
    const tokenIdNum = parseInt(tokenId);
    
    const metadata = await metadataService.getNFTMetadata(collectionId, tokenIdNum);
    
    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'NFT metadata not found',
          code: 'NFT_METADATA_NOT_FOUND'
        }
      });
    }

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Get NFT metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get NFT metadata',
        code: 'GET_NFT_METADATA_FAILED'
      }
    });
  }
});

// Get collection traits
router.get('/traits/:collectionId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const traits = await metadataService.getCollectionTraits(collectionId);
    
    res.json({
      success: true,
      data: traits
    });
  } catch (error) {
    console.error('Get collection traits error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get collection traits',
        code: 'GET_COLLECTION_TRAITS_FAILED'
      }
    });
  }
});

// Get rarity data
router.get('/rarity/:collectionId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  query('sortBy').optional().isIn(['rarity', 'trait_type', 'trait_value']).withMessage('Invalid sortBy parameter'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { sortBy = 'rarity', order = 'desc' } = req.query;
    
    const rarityData = await metadataService.getRarityData(collectionId, {
      sortBy: sortBy as string,
      order: order as 'asc' | 'desc'
    });
    
    res.json({
      success: true,
      data: rarityData
    });
  } catch (error) {
    console.error('Get rarity data error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get rarity data',
        code: 'GET_RARITY_DATA_FAILED'
      }
    });
  }
});

// Generate preview metadata
router.post('/preview', async (req, res) => {
  try {
    const { traits, images, config } = req.body;
    
    if (!traits || !images || !config) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: traits, images, config',
          code: 'MISSING_FIELDS'
        }
      });
    }

    const preview = await metadataService.generatePreview(traits, images, config);
    
    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('Generate preview error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to generate preview',
        code: 'GENERATE_PREVIEW_FAILED'
      }
    });
  }
});

// Update NFT metadata (only for collection owner)
router.put('/nft/:collectionId/:tokenId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  param('tokenId').isInt({ min: 0 }).withMessage('Token ID must be a non-negative integer'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId, tokenId } = req.params;
    const { updates } = req.body;
    const tokenIdNum = parseInt(tokenId);
    
    // Verify collection ownership
    const collection = await collectionService.getCollection(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          code: 'COLLECTION_NOT_FOUND'
        }
      });
    }

    // TODO: Add ownership verification
    // const isOwner = await collectionService.isCollectionOwner(collectionId, req.user.walletAddress);
    // if (!isOwner) {
    //   return res.status(403).json({
    //     success: false,
    //     error: {
    //       message: 'Not authorized to update this NFT',
    //       code: 'NOT_AUTHORIZED'
    //     }
    //   });
    // }

    const updatedMetadata = await metadataService.updateNFTMetadata(
      collectionId,
      tokenIdNum,
      updates
    );
    
    res.json({
      success: true,
      data: updatedMetadata
    });
  } catch (error) {
    console.error('Update NFT metadata error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update NFT metadata',
        code: 'UPDATE_NFT_METADATA_FAILED'
      }
    });
  }
});

// Get metadata statistics
router.get('/stats/:collectionId', [
  param('collectionId').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    const stats = await metadataService.getMetadataStats(collectionId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get metadata stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get metadata statistics',
        code: 'GET_METADATA_STATS_FAILED'
      }
    });
  }
});

export default router;
