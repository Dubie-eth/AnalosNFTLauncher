const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
      'application/x-7z-compressed', 'application/gzip', 'application/x-tar',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv',
      'text/plain', 'application/json', 'application/xml', 'text/csv', 'application/pdf',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac'
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

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Launch On Los (LOL) Backend API',
    version: '1.0.0',
    blockchain: 'Analos (Solana Fork)',
    endpoints: {
      health: '/health',
      upload: '/api/collections/upload',
      processLayers: '/api/collections/process-layers',
      status: '/api/collections/status/:sessionId'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    blockchain: 'Analos'
  });
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

    console.log('Processing collection upload:', {
      collectionName,
      collectionSymbol,
      launchType,
      fileName: file.originalname,
      fileSize: file.size,
      walletAddress
    });

    // Simulate processing
    const sessionId = `session_${Date.now()}`;
    const collectionAddress = `collection_${Date.now()}`;
    const totalSupply = Math.floor(Math.random() * 1000) + 100;
    const processedMetadata = Math.floor(totalSupply * 0.8);

    // Get file type
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileType = getFileType(fileExtension);

    // Clean up uploaded file
    await fs.remove(file.path);

    res.json({
      success: true,
      sessionId,
      collectionName,
      collectionSymbol,
      launchType,
      fileType: fileType,
      fileSize: file.size,
      walletAddress: walletAddress,
      explorerUrl: `https://explorer.analos.io/collection/${collectionAddress}`,
      collectionAddress: collectionAddress,
      totalSupply: totalSupply,
      processedMetadata: processedMetadata,
      message: 'Collection uploaded successfully to Analos blockchain'
    });

  } catch (error) {
    console.error('Collection upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process collection upload' 
    });
  }
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

// Helper function to get file type
function getFileType(extension) {
  const typeMap = {
    '.zip': 'ZIP Archive', '.rar': 'RAR Archive', '.7z': '7-Zip Archive', '.tar': 'TAR Archive', '.gz': 'GZIP Archive',
    '.jpg': 'JPEG Image', '.jpeg': 'JPEG Image', '.png': 'PNG Image', '.gif': 'GIF Image', '.webp': 'WebP Image', '.svg': 'SVG Vector', '.bmp': 'Bitmap Image', '.tiff': 'TIFF Image',
    '.mp4': 'MP4 Video', '.avi': 'AVI Video', '.mov': 'MOV Video', '.wmv': 'WMV Video', '.flv': 'FLV Video', '.webm': 'WebM Video', '.mkv': 'MKV Video',
    '.txt': 'Text Document', '.json': 'JSON Data', '.xml': 'XML Document', '.csv': 'CSV Data', '.pdf': 'PDF Document',
    '.mp3': 'MP3 Audio', '.wav': 'WAV Audio', '.ogg': 'OGG Audio', '.m4a': 'M4A Audio', '.flac': 'FLAC Audio'
  };
  return typeMap[extension] || 'Unknown File Type';
}

// Process layers for advanced NFT generation
async function processLayers(files, config) {
  console.log('Processing layers with config:', config);
  
  // Group files by layer (folder structure)
  const layerGroups = {};
  
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
  console.log(`🔗 CORS enabled for: http://localhost:3000`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
