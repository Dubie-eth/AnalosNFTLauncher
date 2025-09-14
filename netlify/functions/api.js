const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: 'production'
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

module.exports.handler = serverless(app);
