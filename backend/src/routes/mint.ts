import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { MintService } from '../services/MintService';
import { MarketplaceService } from '../services/MarketplaceService';
import { logger } from '../utils/logger';

const router = Router();
const mintService = new MintService();
const marketplaceService = new MarketplaceService();

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
 * GET /collection/:id
 * Get collection minting information
 */
router.get('/collection/:id', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Fetching mint info for collection: ${id}`);

    const mintInfo = await mintService.getCollectionMintInfo(id);
    
    res.json({
      success: true,
      data: mintInfo
    });

  } catch (error) {
    logger.error('Failed to get collection mint info:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch collection information',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * POST /mint
 * Process mint request
 */
router.post('/mint', [
  body('collectionId').isString().withMessage('Collection ID is required'),
  body('walletAddress').isString().withMessage('Wallet address is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
  body('phase').isString().withMessage('Phase is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { collectionId, walletAddress, quantity, phase, signature } = req.body;

    logger.info(`Processing mint request: ${collectionId}, ${walletAddress}, ${quantity}`);

    // Validate signature if provided
    if (signature) {
      // In a real implementation, this would verify the signature
      // For now, we'll just log it
      logger.info(`Signature provided: ${signature}`);
    }

    const result = await mintService.processMint({
      collectionId,
      walletAddress,
      quantity,
      phase,
      signature
    });

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: result.error,
          code: 'MINT_FAILED'
        }
      });
    }

  } catch (error) {
    logger.error('Mint request failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to process mint request',
        code: 'MINT_ERROR'
      }
    });
  }
});

/**
 * GET /wallet/:address/mint-count/:collectionId
 * Get wallet mint count for a collection
 */
router.get('/wallet/:address/mint-count/:collectionId', [
  param('address').isString().withMessage('Wallet address is required'),
  param('collectionId').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { address, collectionId } = req.params;

    const mintCount = await mintService.getWalletMintCount(collectionId, address);

    res.json({
      success: true,
      data: {
        walletAddress: address,
        collectionId,
        mintCount
      }
    });

  } catch (error) {
    logger.error('Failed to get wallet mint count:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch mint count',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * GET /wallet/:address/whitelist/:collectionId/:phase
 * Check if wallet is whitelisted for a phase
 */
router.get('/wallet/:address/whitelist/:collectionId/:phase', [
  param('address').isString().withMessage('Wallet address is required'),
  param('collectionId').isString().withMessage('Collection ID is required'),
  param('phase').isString().withMessage('Phase is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { address, collectionId, phase } = req.params;

    const isWhitelisted = await mintService.isWalletWhitelisted(collectionId, address, phase);

    res.json({
      success: true,
      data: {
        walletAddress: address,
        collectionId,
        phase,
        isWhitelisted
      }
    });

  } catch (error) {
    logger.error('Failed to check whitelist status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check whitelist status',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * PUT /collection/:id/phases
 * Update collection phases (creator only)
 */
router.put('/collection/:id/phases', [
  param('id').isString().withMessage('Collection ID is required'),
  body('phases').isArray({ min: 1 }).withMessage('Phases array is required'),
  body('creatorWallet').isString().withMessage('Creator wallet is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { phases, creatorWallet } = req.body;

    logger.info(`Updating phases for collection: ${id} by ${creatorWallet}`);

    const result = await mintService.updateCollectionPhases(id, phases, creatorWallet);

    if (result.success) {
      res.json({
        success: true,
        message: 'Phases updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: result.error,
          code: 'UPDATE_FAILED'
        }
      });
    }

  } catch (error) {
    logger.error('Failed to update collection phases:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update phases',
        code: 'UPDATE_ERROR'
      }
    });
  }
});

/**
 * GET /collection/:id/stats
 * Get minting statistics for a collection
 */
router.get('/collection/:id/stats', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await mintService.getMintingStats(id);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Failed to get minting stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch minting statistics',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * POST /collection/:id/verify-marketplace
 * Verify collection on marketplace
 */
router.post('/collection/:id/verify-marketplace', [
  param('id').isString().withMessage('Collection ID is required'),
  body('marketplace').isString().withMessage('Marketplace is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { marketplace } = req.body;

    logger.info(`Verifying collection ${id} on ${marketplace}`);

    let result;
    switch (marketplace) {
      case 'magic-eden':
        result = await marketplaceService.verifyCollectionOnMagicEden(id);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            message: 'Unsupported marketplace',
            code: 'UNSUPPORTED_MARKETPLACE'
          }
        });
    }

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: {
          message: result.error,
          code: 'VERIFICATION_FAILED'
        }
      });
    }

  } catch (error) {
    logger.error('Failed to verify collection on marketplace:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify collection',
        code: 'VERIFICATION_ERROR'
      }
    });
  }
});

/**
 * GET /collection/:id/listings
 * Get all marketplace listings for a collection
 */
router.get('/collection/:id/listings', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    const listings = await marketplaceService.getCollectionListings(id);

    res.json({
      success: true,
      data: listings
    });

  } catch (error) {
    logger.error('Failed to get collection listings:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch marketplace listings',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * GET /collection/:id/share-links
 * Get shareable links for a collection
 */
router.get('/collection/:id/share-links', [
  param('id').isString().withMessage('Collection ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.query;

    const shareLinks = await marketplaceService.createShareableLinks(
      id,
      (name as string) || 'LOL Collection'
    );

    res.json({
      success: true,
      data: shareLinks
    });

  } catch (error) {
    logger.error('Failed to create shareable links:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create shareable links',
        code: 'FETCH_FAILED'
      }
    });
  }
});

/**
 * GET /marketplace/trending
 * Get trending collections
 */
router.get('/marketplace/trending', async (req, res) => {
  try {
    const trending = await marketplaceService.getTrendingCollections();

    res.json({
      success: true,
      data: trending
    });

  } catch (error) {
    logger.error('Failed to get trending collections:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch trending collections',
        code: 'FETCH_FAILED'
      }
    });
  }
});

export default router;