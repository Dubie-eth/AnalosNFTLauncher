import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
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

// Mint endpoint
app.post('/api/mint', (req, res) => {
  const { collectionId, walletAddress, quantity, phase } = req.body;
  
  // Basic validation
  if (!collectionId || !walletAddress || !quantity) {
    return res.status(400).json({ 
      error: 'Missing required fields: collectionId, walletAddress, quantity' 
    });
  }
  
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ 
      error: 'Quantity must be between 1 and 10' 
    });
  }
  
  // Simulate minting
  const transactionSignature = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    success: true,
    transactionSignature,
    nftAddresses: Array.from({ length: quantity }, (_, i) => 
      `mock_nft_${Date.now()}_${i}`
    ),
    explorerUrl: `https://explorer.analos.io/tx/${transactionSignature}`,
    message: `Successfully minted ${quantity} NFT(s) from collection ${collectionId}`
  });
});

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
