import { Router, Request, Response } from 'express';
import { BlockchainService } from '../services/BlockchainService';
import { logger } from '../utils/logger';

const router = Router();
let blockchainService: BlockchainService | null = null;

// Lazy load the blockchain service to avoid initialization errors
const getBlockchainService = () => {
  if (!blockchainService) {
    blockchainService = new BlockchainService();
  }
  return blockchainService;
};

/**
 * POST /api/mint
 * Mint a single NFT with metadata
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl, walletAddress } = req.body;

    // Validate required fields
    if (!name || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and walletAddress are required'
      });
    }

    // Use default values if not provided
    const nftName = name || 'Test Analos NFT';
    const nftDescription = description || 'A test NFT minted on the Analos blockchain';
    const nftImageUrl = imageUrl || 'https://via.placeholder.com/500x500.png?text=Analos+NFT';

    logger.info(`Minting NFT: ${nftName} for wallet: ${walletAddress}`);

    // Mint the NFT
    const result = await getBlockchainService().mintSingleNFT(
      nftName,
      nftDescription,
      nftImageUrl,
      walletAddress
    );

    res.json({
      success: true,
      data: {
        mintAddress: result.mintAddress,
        metadataUri: result.metadataUri,
        transactionSignature: result.transactionSignature,
        explorerUrl: result.explorerUrl,
        nft: {
          name: nftName,
          description: nftDescription,
          image: nftImageUrl
        }
      }
    });

  } catch (error) {
    logger.error('Mint NFT error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint NFT'
    });
  }
});

/**
 * GET /api/mint/status/:signature
 * Get mint transaction status
 */
router.get('/status/:signature', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Transaction signature is required'
      });
    }

    const status = await getBlockchainService().getTransactionStatus(signature);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('Get transaction status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get transaction status'
    });
  }
});

/**
 * GET /api/mint/network
 * Get network information
 */
router.get('/network', async (req: Request, res: Response) => {
  try {
    const networkInfo = await getBlockchainService().getNetworkInfo();
    const connectionStatus = await getBlockchainService().getConnectionStatus();

    res.json({
      success: true,
      data: {
        ...networkInfo,
        connection: connectionStatus
      }
    });

  } catch (error) {
    logger.error('Get network info error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get network info'
    });
  }
});

export default router;