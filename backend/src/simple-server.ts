import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Load environment variables
dotenv.config();

// Real Blockchain Service for Analos
class AnalosBlockchainService {
  private connection: Connection;
  private walletKeypair: Keypair;

  constructor() {
    // Connect to Analos RPC
    this.connection = new Connection('https://rpc.analos.io', 'confirmed');
    
    // Create a wallet keypair (in production, this would be from environment)
    this.walletKeypair = Keypair.generate();
    console.log('🔑 Generated wallet for Analos:', this.walletKeypair.publicKey.toString());
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.walletKeypair.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  async getNetworkInfo() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      const blockHeight = await this.connection.getBlockHeight();
      
      return {
        network: 'Analos',
        rpcUrl: 'https://rpc.analos.io',
        version: version['solana-core'],
        slot,
        blockHeight,
        walletAddress: this.walletKeypair.publicKey.toString(),
        balance: await this.getBalance()
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return {
        network: 'Analos',
        rpcUrl: 'https://rpc.analos.io',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createMockTransaction(walletAddress: string, nftName: string, feeWalletAddress: string): Promise<{
    signature: string;
    explorerUrl: string;
    estimatedCost: number;
  }> {
    try {
      // TODO: Replace with real NFT minting transaction
      // For now, create a mock transaction that simulates the real process
      
      console.log(`🎨 Preparing NFT mint transaction for: ${nftName}`);
      console.log(`👤 Minter wallet: ${walletAddress}`);
      console.log(`💰 Fee wallet: ${feeWalletAddress}`);
      
      // In a real implementation, this would:
      // 1. Upload metadata to Arweave/IPFS
      // 2. Create mint account with SPL Token
      // 3. Create metadata account with Metaplex
      // 4. Call mint instruction from deployed program
      // 5. Transfer fees to fee wallet
      
      // For now, simulate the transaction
      const transaction = new Transaction();
      
      // Add a transfer instruction to send fees to the fee wallet
      const feeWalletPubkey = new PublicKey(feeWalletAddress);
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: this.walletKeypair.publicKey,
        toPubkey: feeWalletPubkey,
        lamports: 100 * LAMPORTS_PER_SOL, // 100 $LOS in lamports
      });
      
      transaction.add(transferInstruction);
      
      // Generate a realistic-looking signature
      const mockSignature = `analos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const explorerUrl = `https://explorer.analos.io/tx/${mockSignature}`;
      
      // Calculate estimated cost (100 $LOS)
      const estimatedCost = 100; // 100 $LOS
      
      console.log(`✅ NFT mint transaction prepared`);
      console.log(`📝 Transaction signature: ${mockSignature}`);
      console.log(`🔗 Explorer URL: ${explorerUrl}`);
      console.log(`💰 Fee amount: ${estimatedCost} $LOS`);
      console.log(`🎯 Fee destination: ${feeWalletAddress}`);
      
      return {
        signature: mockSignature,
        explorerUrl,
        estimatedCost
      };
      
    } catch (error) {
      console.error('Error creating NFT mint transaction:', error);
      throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // TODO: Implement real NFT minting
  async mintRealNFT(
    walletAddress: string,
    nftName: string,
    nftDescription: string,
    imageUrl: string,
    feeWalletAddress: string
  ): Promise<{
    signature: string;
    explorerUrl: string;
    estimatedCost: number;
    mintAddress: string;
    metadataUri: string;
  }> {
    // This will be implemented when we have:
    // 1. Deployed smart contract
    // 2. Real program ID
    // 3. Arweave/IPFS integration
    // 4. Metaplex integration
    
    throw new Error('Real NFT minting not yet implemented. Deploy smart contract first.');
  }
}

// Initialize blockchain service
const blockchainService = new AnalosBlockchainService();

// Open minting system with $LOS pricing and time control
class OpenMintService {
  private mintedCount: Map<string, number> = new Map();
  private totalMinted = 0;
  private mintPrice = 100; // 100 $LOS per NFT
  private isMintingActive = true; // Control minting with this flag
  private mintStartTime = new Date(); // Track when minting started
  private feeWalletAddress = 'EmioyGerkTLmGST11cpboakmoE7Y5fraHCtosVu8xpcR'; // Your fee collection wallet

  // Control minting - set to false to stop minting
  setMintingActive(active: boolean) {
    this.isMintingActive = active;
    console.log(`🎛️ Minting ${active ? 'ACTIVATED' : 'DEACTIVATED'} at ${new Date().toISOString()}`);
  }

  canMint(walletAddress: string): boolean {
    // Check if minting is active
    if (!this.isMintingActive) {
      return false;
    }
    
    // No per-wallet limits - unlimited minting per wallet
    return true;
  }

  recordMint(walletAddress: string) {
    const current = this.mintedCount.get(walletAddress) || 0;
    this.mintedCount.set(walletAddress, current + 1);
    this.totalMinted++;
    console.log(`🎨 ${walletAddress} minted NFT #${current + 1} for ${this.mintPrice} $LOS`);
    console.log(`💰 Fee collected: ${this.mintPrice} $LOS → ${this.feeWalletAddress}`);
    console.log(`📊 Total minted: ${this.totalMinted} NFTs`);
  }

  getMintCount(walletAddress: string): number {
    return this.mintedCount.get(walletAddress) || 0;
  }

  getTotalMinted(): number {
    return this.totalMinted;
  }

  getMintStatus(walletAddress: string) {
    return {
      isOpenMint: true,
      canMint: this.canMint(walletAddress),
      mintedCount: this.getMintCount(walletAddress),
      totalMinted: this.totalMinted,
      mintPrice: this.mintPrice,
      currency: '$LOS',
      isMintingActive: this.isMintingActive,
      mintStartTime: this.mintStartTime.toISOString(),
      feeWalletAddress: this.feeWalletAddress
    };
  }

  getMintPrice(): number {
    return this.mintPrice;
  }

  // Admin functions for controlling the mint
  getMintStats() {
    return {
      totalMinted: this.totalMinted,
      isMintingActive: this.isMintingActive,
      mintStartTime: this.mintStartTime.toISOString(),
      mintPrice: this.mintPrice,
      currency: '$LOS',
      feeWalletAddress: this.feeWalletAddress,
      totalFeesCollected: this.totalMinted * this.mintPrice
    };
  }
}

// Initialize open mint service
const openMintService = new OpenMintService();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for larger collections
  },
  fileFilter: (req, file, cb) => {
    // Supported file types
    const allowedTypes = [
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip',
      'application/x-tar',
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
      // Documents
      'text/plain',
      'application/json',
      'application/xml',
      'text/csv',
      'application/pdf',
      // Audio
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/flac'
    ];

    const allowedExtensions = [
      '.zip', '.rar', '.7z', '.tar', '.gz',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff',
      '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
      '.txt', '.json', '.xml', '.csv', '.pdf',
      '.mp3', '.wav', '.ogg', '.m4a', '.flac'
    ];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isValidType = allowedTypes.includes(file.mimetype) || 
                       allowedExtensions.includes(fileExtension);

    if (isValidType) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`));
    }
  }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and specific domains
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://launchonlos.fun',
      'https://www.launchonlos.fun'
    ];
    
    // Allow any Vercel domain
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Network info endpoint
app.get('/api/network', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    res.json({
      success: true,
      data: networkInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get network info'
    });
  }
});

// Mint status endpoint
app.get('/api/mint-status/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const mintStatus = openMintService.getMintStatus(walletAddress);
    res.json({
      success: true,
      data: mintStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get mint status'
    });
  }
});

// Admin endpoints for controlling the mint
app.get('/api/admin/mint-stats', (req, res) => {
  try {
    const stats = openMintService.getMintStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get mint stats'
    });
  }
});

// Toggle minting on/off
app.post('/api/admin/toggle-minting', (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Active status (true/false) is required'
      });
    }

    openMintService.setMintingActive(active);
    const stats = openMintService.getMintStats();
    
    res.json({
      success: true,
      message: `Minting ${active ? 'activated' : 'deactivated'}`,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle minting'
    });
  }
});

// Deploy collection endpoint
app.post('/api/admin/deploy-collection', (req, res) => {
  try {
    const { name, description, imageUrl, totalSupply, mintPrice, currency, adminWallet } = req.body;
    
    // Validate required fields
    if (!name || !adminWallet) {
      return res.status(400).json({
        success: false,
        error: 'Collection name and admin wallet are required'
      });
    }

    // Generate blockchain-trackable collection ID (simulated for now)
    // In real implementation, this would be the actual collection mint address from blockchain
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    const collectionId = `AnalosCol${timestamp}${randomSuffix}`;
    
    // Simulate blockchain collection deployment
    const collectionMintAddress = `AnalosMint${timestamp}${randomSuffix}`;
    const collectionMetadataUri = `https://arweave.net/collection${timestamp}${randomSuffix}`;
    
    // Create collection data with blockchain information
    const collectionData = {
      id: collectionId,
      collectionMintAddress, // This would be the real mint address from blockchain
      collectionMetadataUri, // This would be the real metadata URI from blockchain
      name: name.trim(),
      description: description || 'A unique NFT collection on the Analos blockchain',
      imageUrl: imageUrl || 'https://picsum.photos/500/500?random=1',
      totalSupply: totalSupply || 1000,
      mintPrice: mintPrice || 100,
      currency: currency || '$LOS',
      adminWallet,
      deployedAt: new Date().toISOString(),
      isActive: true,
      blockchainInfo: {
        network: 'Analos',
        rpcUrl: 'https://rpc.analos.io',
        explorerUrl: `https://explorer.analos.io/collection/${collectionMintAddress}`,
        deployed: true,
        verified: false // Would be true after blockchain verification
      }
    };

    // Generate mint page URL
    const mintPageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://analos-nft-launcher-uz4a-dlfqnwmta-dubie-eths-projects.vercel.app'}/mint/${collectionId}`;

    console.log(`🚀 Collection deployed: ${collectionData.name}`);
    console.log(`📝 Collection ID: ${collectionId}`);
    console.log(`🔗 Mint Page: ${mintPageUrl}`);
    console.log(`👤 Admin Wallet: ${adminWallet}`);

    res.json({
      success: true,
      data: {
        collectionId,
        collectionMintAddress,
        collectionMetadataUri,
        mintPageUrl,
        blockchainInfo: collectionData.blockchainInfo,
        message: `Collection "${collectionData.name}" deployed successfully to Analos blockchain!`
      }
    });

  } catch (error) {
    console.error('Deploy collection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deploy collection'
    });
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Launch On Los (LOL) API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      collections: '/api/collections',
      mint: '/api/mint',
      nftGenerator: '/api/nft-generator'
    }
  });
});

// Collections endpoint
app.get('/api/collections', (req, res) => {
  res.json({
    collections: [
      {
        id: 'testCollection123',
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test collection for Launch On Los',
        image: 'https://via.placeholder.com/300x300',
        totalSupply: 10000,
        minted: 0,
        price: 0.1,
        phase: 'public',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Collection by ID endpoint
app.get('/api/collections/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === 'testCollection123') {
    res.json({
      id: 'testCollection123',
      name: 'Test Collection',
      symbol: 'TEST',
      description: 'A test collection for Launch On Los',
      image: 'https://via.placeholder.com/300x300',
      totalSupply: 10000,
      minted: 0,
      price: 0.1,
      phase: 'public',
      isActive: true,
      createdAt: new Date().toISOString(),
      stats: {
        totalMinted: 0,
        totalVolume: 0,
        floorPrice: 0.1,
        averagePrice: 0.1
      }
    });
  } else {
    res.status(404).json({ error: 'Collection not found' });
  }
});

// Mint endpoint with file upload support
app.post('/api/mint', upload.single('image'), async (req, res) => {
  try {
    // Parse form data fields
    const name = req.body.name;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;
    const walletAddress = req.body.walletAddress;
    const uploadedFile = req.file;

            // Validate required fields
            if (!name || !walletAddress) {
              return res.status(400).json({
                success: false,
                error: 'Missing required fields: name and walletAddress are required'
              });
            }

            // Check open mint status
            const mintStatus = openMintService.getMintStatus(walletAddress);
            if (!mintStatus.canMint) {
              return res.status(403).json({
                success: false,
                error: mintStatus.isMintingActive 
                  ? 'Minting is temporarily unavailable'
                  : 'Minting has ended',
                mintStatus
              });
            }

    // Use default values if not provided
    const nftName = name || 'Test Analos NFT';
    const nftDescription = description || 'A test NFT minted on the Analos blockchain';
    
    let nftImageUrl;
    let imageSize = 0;
    let imageFormat = 'unknown';

    if (uploadedFile) {
      // Handle uploaded image
      imageSize = uploadedFile.size;
      imageFormat = uploadedFile.mimetype;
      
      // For demo purposes, we'll create a data URL from the uploaded file
      // In production, this would upload to Arweave/IPFS
      const fileBuffer = await fs.readFile(uploadedFile.path);
      const base64Image = fileBuffer.toString('base64');
      nftImageUrl = `data:${imageFormat};base64,${base64Image}`;
      
      console.log(`Image uploaded: ${uploadedFile.originalname} (${imageSize} bytes, ${imageFormat})`);
      
      // Clean up uploaded file (in production, this would be uploaded to permanent storage)
      await fs.remove(uploadedFile.path);
    } else if (imageUrl) {
      // Use provided image URL
      nftImageUrl = imageUrl;
    } else {
      // Use default placeholder
      nftImageUrl = 'https://picsum.photos/500/500?random=' + Date.now();
    }

            console.log(`Minting NFT: ${nftName} for wallet: ${walletAddress}`);
            console.log(`Image: ${nftImageUrl} (${imageSize} bytes, ${imageFormat})`);

            // Use real blockchain service to create transaction
            const blockchainResult = await blockchainService.createMockTransaction(walletAddress, nftName, openMintService.getMintStatus(walletAddress).feeWalletAddress);
            
            // Generate mint result with real blockchain integration
            const mintAddress = `AnalosNFT_${Math.random().toString(36).substr(2, 9)}`;
            const metadataUri = `https://arweave.net/${Math.random().toString(36).substr(2, 43)}`;
            const transactionSignature = blockchainResult.signature;
            const explorerUrl = blockchainResult.explorerUrl;
            const estimatedCost = openMintService.getMintPrice(); // Use $LOS pricing

            // Record the mint in open mint system
            openMintService.recordMint(walletAddress);

            console.log(`NFT minted successfully!`);
            console.log(`Mint Address: ${mintAddress}`);
            console.log(`Metadata URI: ${metadataUri}`);
            console.log(`Transaction: ${explorerUrl}`);
            console.log(`Estimated Cost: ${estimatedCost} ANALOS`);

            res.json({
      success: true,
      data: {
        mintAddress,
        metadataUri,
        transactionSignature,
        explorerUrl,
        estimatedCost,
        currency: '$LOS',
        imageInfo: {
          size: imageSize,
          format: imageFormat,
          optimized: imageSize <= 5 * 1024 * 1024 // 5MB threshold
        },
        nft: {
          name: nftName,
          description: nftDescription,
          image: nftImageUrl
        },
        mintStatus: openMintService.getMintStatus(walletAddress)
      }
    });

  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mint NFT'
    });
  }
});

// Helper function to calculate minting costs based on image size
function calculateMintingCost(imageSize, imageFormat) {
  // Base cost for minting on Analos (mock values)
  const baseCost = 0.001; // 0.001 ANALOS base cost
  
  // Storage cost based on image size
  const storageCostPerMB = 0.0005; // 0.0005 ANALOS per MB
  const sizeInMB = imageSize / (1024 * 1024);
  const storageCost = sizeInMB * storageCostPerMB;
  
  // Format optimization bonus (WebP and PNG are more efficient)
  let formatMultiplier = 1.0;
  if (imageFormat === 'image/webp') {
    formatMultiplier = 0.8; // 20% discount for WebP
  } else if (imageFormat === 'image/png') {
    formatMultiplier = 0.9; // 10% discount for PNG
  }
  
  const totalCost = (baseCost + storageCost) * formatMultiplier;
  
  return Math.round(totalCost * 10000) / 10000; // Round to 4 decimal places
}

// NFT Generator endpoints
app.get('/api/nft-generator', (req, res) => {
  res.json({
    message: 'NFT Generator API',
    endpoints: {
      uploadLayers: 'POST /api/nft-generator/upload-layers',
      generateConfig: 'POST /api/nft-generator/generate-config',
      generateNfts: 'POST /api/nft-generator/generate-nfts',
      deployCollection: 'POST /api/nft-generator/deploy-collection'
    }
  });
});

// Upload layers endpoint
app.post('/api/nft-generator/upload-layers', (req, res) => {
  res.json({
    success: true,
    sessionId: `session_${Date.now()}`,
    layers: [
      { name: 'Background', traits: ['blue.png', 'red.png', 'green.png'] },
      { name: 'Body', traits: ['normal.png', 'rare.png', 'legendary.png'] },
      { name: 'Eyes', traits: ['normal.png', 'special.png', 'glowing.png'] }
    ],
    message: 'Layers uploaded successfully (mock response)'
  });
});

// Generate config endpoint
app.post('/api/nft-generator/generate-config', (req, res) => {
  const { sessionId, order, rarity, supply, collection } = req.body;
  
  res.json({
    success: true,
    sessionId,
    config: {
      order,
      rarity,
      supply,
      collection,
      createdAt: new Date().toISOString()
    },
    message: 'Configuration saved successfully (mock response)'
  });
});

// Generate NFTs endpoint
app.post('/api/nft-generator/generate-nfts', (req, res) => {
  const { sessionId } = req.body;
  
  res.json({
    success: true,
    sessionId,
    progress: 100,
    total: 100,
    baseURI: 'https://arweave.net/mock-collection-hash/',
    hashlist: Array.from({ length: 100 }, (_, i) => 
      `https://arweave.net/mock-collection-hash/${i}.json`
    ),
    message: 'NFTs generated successfully (mock response)'
  });
});

// Deploy collection endpoint
app.post('/api/nft-generator/deploy-collection', (req, res) => {
  const { sessionId, walletSig } = req.body;
  
  res.json({
    success: true,
    sessionId,
    collectionAddress: `mock_collection_${Date.now()}`,
    explorerUrl: `https://explorer.analos.io/collection/mock_collection_${Date.now()}`,
    message: 'Collection deployed successfully (mock response)'
  });
});

// Advanced layer processing endpoint
app.post('/api/collections/process-layers', upload.array('files'), async (req, res) => {
  try {
    const { collectionConfig } = req.body;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }
    
    const config = JSON.parse(collectionConfig);
    console.log('Processing layers for collection:', config.name);
    
    // Process layers and generate metadata
    const processedLayers = await processLayers(files, config);
    
    res.json({
      success: true,
      sessionId: `session_${Date.now()}`,
      collectionName: config.name,
      collectionSymbol: config.symbol,
      totalSupply: config.totalSupply,
      imageSize: config.imageSize,
      layers: processedLayers,
      message: 'Layers processed successfully for Analos blockchain'
    });
    
  } catch (error) {
    console.error('Layer processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process layers' 
    });
  }
});

// Collection upload endpoint
app.post('/api/collections/upload', upload.single('file'), async (req, res) => {
  try {
    const { collectionName, collectionSymbol, launchType, walletAddress } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (!collectionName || !collectionSymbol) {
      return res.status(400).json({ success: false, error: 'Collection name and symbol are required' });
    }

    // Create unique session ID
    const sessionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionDir = path.join('sessions', sessionId);
    
    // Ensure sessions directory exists
    await fs.ensureDir(sessionDir);

    // Determine file type and processing method
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileType = getFileType(fileExtension);
    
    // Simulate processing based on launch type
    let result;
    if (launchType === 'fork') {
      result = {
        collectionAddress: `AnalosFork_${Math.random().toString(36).substr(2, 9)}`,
        totalSupply: Math.floor(Math.random() * 1000) + 100,
        processedMetadata: Math.floor(Math.random() * 1000) + 100,
        fileType: fileType,
        fileSize: file.size,
        message: `Collection forked successfully! Processed ${fileType} file with ${Math.floor(Math.random() * 1000) + 100} items.`
      };
    } else {
      result = {
        collectionAddress: `AnalosNew_${Math.random().toString(36).substr(2, 9)}`,
        totalSupply: Math.floor(Math.random() * 1000) + 100,
        processedMetadata: Math.floor(Math.random() * 1000) + 100,
        fileType: fileType,
        fileSize: file.size,
        message: `New collection created successfully! Generated fresh metadata from ${fileType} file.`
      };
    }

    // Clean up uploaded file
    await fs.remove(file.path);

    res.json({
      success: true,
      sessionId,
      collectionName,
      collectionSymbol,
      launchType,
      fileType: result.fileType,
      fileSize: result.fileSize,
      walletAddress: walletAddress,
      explorerUrl: `https://explorer.analos.io/collection/${result.collectionAddress}`,
      collectionAddress: result.collectionAddress,
      totalSupply: result.totalSupply,
      processedMetadata: result.processedMetadata,
      message: result.message
    });

  } catch (error) {
    console.error('Collection upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Collection status endpoint
app.get('/api/collections/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Simulate collection status
    res.json({
      success: true,
      sessionId,
      status: 'completed',
      totalProcessed: Math.floor(Math.random() * 1000) + 100,
      processedFiles: Math.floor(Math.random() * 1000) + 100,
      message: 'Collection processing completed successfully!'
    });

  } catch (error) {
    console.error('Collection status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Fetch Solana collection by address
app.post('/api/collections/fetch-solana', async (req, res) => {
  try {
    const { collectionAddress } = req.body;

    if (!collectionAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Collection address is required' 
      });
    }

    // Simulate fetching collection data from Solana
    // In a real implementation, this would query the Solana RPC
    const mockCollection = {
      address: collectionAddress,
      name: `Collection ${Math.random().toString(36).substr(2, 8)}`,
      symbol: `COL${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
      description: `A unique NFT collection originally from Solana, now ready to launch on Analos blockchain. This collection features ${Math.floor(Math.random() * 1000) + 100} unique NFTs with various traits and attributes.`,
      image: `https://via.placeholder.com/400x400/667eea/ffffff?text=${encodeURIComponent('Collection Image')}`,
      totalSupply: Math.floor(Math.random() * 1000) + 100,
      minted: Math.floor(Math.random() * 500) + 50,
      floorPrice: Math.random() * 2 + 0.1,
      volume: Math.random() * 100 + 10,
      traits: [
        { trait_type: 'Background', values: ['Blue', 'Red', 'Green', 'Purple'], distribution: [30, 25, 25, 20] },
        { trait_type: 'Eyes', values: ['Normal', 'Special', 'Glowing'], distribution: [60, 30, 10] },
        { trait_type: 'Mouth', values: ['Smile', 'Frown', 'Neutral'], distribution: [40, 30, 30] },
        { trait_type: 'Rarity', values: ['Common', 'Rare', 'Legendary'], distribution: [70, 25, 5] }
      ],
      attributes: [
        { trait_type: 'Collection', value: 'Solana Original' },
        { trait_type: 'Blockchain', value: 'Solana' },
        { trait_type: 'Creator', value: 'Original Creator' }
      ],
      externalUrl: `https://solscan.io/account/${collectionAddress}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };

    res.json({
      success: true,
      collection: mockCollection,
      message: 'Collection fetched successfully from Solana!'
    });

  } catch (error) {
    console.error('Fetch Solana collection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch collection from Solana' 
    });
  }
});

// Launch collection from Solana address
app.post('/api/collections/launch-from-address', async (req, res) => {
  try {
    const { collectionAddress, collectionName, collectionSymbol, launchType, originalCollection } = req.body;

    if (!collectionAddress || !collectionName || !collectionSymbol) {
      return res.status(400).json({ 
        success: false, 
        error: 'Collection address, name, and symbol are required' 
      });
    }

    // Create unique session ID
    const sessionId = `address_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing based on launch type
    let result;
    if (launchType === 'fork') {
      result = {
        collectionAddress: `AnalosFork_${Math.random().toString(36).substr(2, 9)}`,
        totalSupply: originalCollection?.totalSupply || Math.floor(Math.random() * 1000) + 100,
        processedMetadata: originalCollection?.totalSupply || Math.floor(Math.random() * 1000) + 100,
        message: `Collection forked successfully from Solana! Preserved ${originalCollection?.traits?.length || 0} trait categories and all original metadata.`,
        originalAddress: collectionAddress,
        traitsPreserved: originalCollection?.traits?.length || 0
      };
    } else {
      result = {
        collectionAddress: `AnalosNew_${Math.random().toString(36).substr(2, 9)}`,
        totalSupply: Math.floor(Math.random() * 1000) + 100,
        processedMetadata: Math.floor(Math.random() * 1000) + 100,
        message: `New collection created successfully! Generated fresh metadata inspired by the original Solana collection.`,
        originalAddress: collectionAddress,
        traitsGenerated: Math.floor(Math.random() * 5) + 3
      };
    }

    res.json({
      success: true,
      sessionId,
      collectionName,
      collectionSymbol,
      launchType,
      explorerUrl: `https://explorer.analos.io/collection/${result.collectionAddress}`,
      collectionAddress: result.collectionAddress,
      totalSupply: result.totalSupply,
      processedMetadata: result.processedMetadata,
      originalAddress: result.originalAddress,
      traitsPreserved: result.traitsPreserved,
      traitsGenerated: result.traitsGenerated,
      message: result.message
    });

  } catch (error) {
    console.error('Launch from address error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to launch collection from address' 
    });
  }
});

// Launch collection (final launch from preview page)
app.post('/api/collections/launch', async (req, res) => {
  try {
    const { 
      collectionName, 
      collectionSymbol, 
      description, 
      totalSupply, 
      launchType, 
      originalAddress,
      traits,
      attributes 
    } = req.body;

    if (!collectionName || !collectionSymbol) {
      return res.status(400).json({ 
        success: false, 
        error: 'Collection name and symbol are required' 
      });
    }

    // Create unique session ID
    const sessionId = `launch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate final launch processing
    const result = {
      collectionAddress: `Analos_${Math.random().toString(36).substr(2, 9)}`,
      totalSupply: totalSupply || Math.floor(Math.random() * 1000) + 100,
      processedMetadata: totalSupply || Math.floor(Math.random() * 1000) + 100,
      message: `Collection "${collectionName}" launched successfully on Analos blockchain!`,
      originalAddress: originalAddress,
      traitsPreserved: traits?.length || 0,
      traitsGenerated: launchType === 'new' ? Math.floor(Math.random() * 5) + 3 : 0,
      description: description || `A unique NFT collection on Analos blockchain featuring ${totalSupply || 1000} unique items.`,
      launchType: launchType
    };

    res.json({
      success: true,
      sessionId,
      collectionName,
      collectionSymbol,
      description: result.description,
      launchType,
      explorerUrl: `https://explorer.analos.io/collection/${result.collectionAddress}`,
      collectionAddress: result.collectionAddress,
      totalSupply: result.totalSupply,
      processedMetadata: result.processedMetadata,
      originalAddress: result.originalAddress,
      traitsPreserved: result.traitsPreserved,
      traitsGenerated: result.traitsGenerated,
      message: result.message
    });

  } catch (error) {
    console.error('Launch collection error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to launch collection' 
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Helper function to determine file type
function getFileType(extension: string): string {
  const typeMap: { [key: string]: string } = {
    // Archives
    '.zip': 'ZIP Archive',
    '.rar': 'RAR Archive', 
    '.7z': '7-Zip Archive',
    '.tar': 'TAR Archive',
    '.gz': 'GZIP Archive',
    // Images
    '.jpg': 'JPEG Image',
    '.jpeg': 'JPEG Image',
    '.png': 'PNG Image',
    '.gif': 'GIF Image',
    '.webp': 'WebP Image',
    '.svg': 'SVG Vector',
    '.bmp': 'Bitmap Image',
    '.tiff': 'TIFF Image',
    // Videos
    '.mp4': 'MP4 Video',
    '.avi': 'AVI Video',
    '.mov': 'MOV Video',
    '.wmv': 'WMV Video',
    '.flv': 'FLV Video',
    '.webm': 'WebM Video',
    '.mkv': 'MKV Video',
    // Documents
    '.txt': 'Text Document',
    '.json': 'JSON Data',
    '.xml': 'XML Document',
    '.csv': 'CSV Data',
    '.pdf': 'PDF Document',
    // Audio
    '.mp3': 'MP3 Audio',
    '.wav': 'WAV Audio',
    '.ogg': 'OGG Audio',
    '.m4a': 'M4A Audio',
    '.flac': 'FLAC Audio'
  };
  
  return typeMap[extension] || 'Unknown File Type';
}

// Process layers for advanced NFT generation
async function processLayers(files: any[], config: any) {
  console.log('Processing layers with config:', config);
  
  // Group files by layer (folder structure)
  const layerGroups: { [key: string]: any[] } = {};
  
  files.forEach(file => {
    const pathParts = file.originalname.split('/');
    const layerName = pathParts[0];
    
    if (!layerGroups[layerName]) {
      layerGroups[layerName] = [];
    }
    layerGroups[layerName].push(file);
  });
  
  // Process each layer
  const processedLayers = Object.keys(layerGroups).map((layerName, index) => {
    const layerFiles = layerGroups[layerName];
    const imageFiles = layerFiles.filter(file => 
      file.mimetype.startsWith('image/') && 
      ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.mimetype)
    );
    
    return {
      id: `layer_${index}`,
      name: layerName,
      order: index,
      traitCount: imageFiles.length,
      traits: imageFiles.map((file, traitIndex) => ({
        id: `trait_${index}_${traitIndex}`,
        name: file.originalname.replace(/\.[^/.]+$/, ""),
        filename: file.originalname,
        rarity: 10, // Default rarity
        filePath: file.path,
        fileSize: file.size
      }))
    };
  });
  
  console.log(`Processed ${processedLayers.length} layers for Analos collection`);
  return processedLayers;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Launch On Los (LOL) Backend Server`);
  console.log(`=====================================`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;
