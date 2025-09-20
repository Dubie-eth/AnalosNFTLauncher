const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

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
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://launchonlos.fun',
    'https://www.launchonlos.fun'
  ],
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

// Helper function to determine file type
function getFileType(extension) {
  const typeMap = {
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

// Error handling middleware
app.use((err, req, res, next) => {
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

module.exports = app;