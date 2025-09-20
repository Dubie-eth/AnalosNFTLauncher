import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import AdmZip from 'adm-zip';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Upload and process collection
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { collectionName, collectionSymbol, launchType } = req.body;
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

    // Extract ZIP file
    const zip = new AdmZip(file.path);
    zip.extractAllTo(sessionDir, true);

    // Process the collection based on launch type
    let result;
    if (launchType === 'fork') {
      result = await processForkedCollection(sessionDir, collectionName, collectionSymbol);
    } else {
      result = await processNewCollection(sessionDir, collectionName, collectionSymbol);
    }

    // Clean up uploaded file
    await fs.remove(file.path);

    res.json({
      success: true,
      sessionId,
      collectionName,
      collectionSymbol,
      launchType,
      explorerUrl: `https://explorer.analos.io/collection/${result.collectionAddress}`,
      collectionAddress: result.collectionAddress,
      message: 'Collection processed successfully!'
    });

  } catch (error) {
    console.error('Collection upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Process forked collection (keep existing metadata)
async function processForkedCollection(sessionDir: string, name: string, symbol: string) {
  console.log('Processing forked collection...');
  
  // Find metadata files
  const metadataFiles = await findMetadataFiles(sessionDir);
  
  if (metadataFiles.length === 0) {
    throw new Error('No metadata files found in the collection');
  }

  // Process each metadata file
  const processedMetadata = [];
  for (const metadataFile of metadataFiles) {
    const metadata = await fs.readJson(metadataFile);
    
    // Update collection info while keeping traits
    const updatedMetadata = {
      ...metadata,
      name: `${name} #${processedMetadata.length + 1}`,
      symbol: symbol,
      collection: {
        name: name,
        family: name
      }
    };
    
    processedMetadata.push(updatedMetadata);
  }

  // Save processed metadata
  const processedDir = path.join(sessionDir, 'processed');
  await fs.ensureDir(processedDir);
  
  for (let i = 0; i < processedMetadata.length; i++) {
    await fs.writeJson(path.join(processedDir, `${i}.json`), processedMetadata[i]);
  }

  // Simulate collection deployment (in real implementation, this would deploy to Analos)
  const collectionAddress = `Analos${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    collectionAddress,
    totalSupply: processedMetadata.length,
    processedMetadata: processedMetadata.length
  };
}

// Process new collection (fresh start)
async function processNewCollection(sessionDir: string, name: string, symbol: string) {
  console.log('Processing new collection...');
  
  // Find image files
  const imageFiles = await findImageFiles(sessionDir);
  
  if (imageFiles.length === 0) {
    throw new Error('No image files found in the collection');
  }

  // Generate new metadata for each image
  const processedMetadata = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const imageName = path.basename(imageFile, path.extname(imageFile));
    
    const metadata = {
      name: `${name} #${i + 1}`,
      symbol: symbol,
      description: `A unique ${name} NFT from the ${name} collection on Analos blockchain.`,
      image: `https://arweave.net/${Math.random().toString(36).substr(2, 43)}`,
      attributes: [
        {
          trait_type: "Collection",
          value: name
        },
        {
          trait_type: "Rarity",
          value: Math.random() > 0.8 ? "Legendary" : Math.random() > 0.5 ? "Rare" : "Common"
        }
      ],
      collection: {
        name: name,
        family: name
      },
      properties: {
        files: [
          {
            uri: `https://arweave.net/${Math.random().toString(36).substr(2, 43)}`,
            type: "image/png"
          }
        ],
        category: "image"
      }
    };
    
    processedMetadata.push(metadata);
  }

  // Save processed metadata
  const processedDir = path.join(sessionDir, 'processed');
  await fs.ensureDir(processedDir);
  
  for (let i = 0; i < processedMetadata.length; i++) {
    await fs.writeJson(path.join(processedDir, `${i}.json`), processedMetadata[i]);
  }

  // Simulate collection deployment (in real implementation, this would deploy to Analos)
  const collectionAddress = `Analos${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    collectionAddress,
    totalSupply: processedMetadata.length,
    processedMetadata: processedMetadata.length
  };
}

// Helper function to find metadata files
async function findMetadataFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  const items = await fs.readdir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const subFiles = await findMetadataFiles(fullPath);
      files.push(...subFiles);
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Helper function to find image files
async function findImageFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  const items = await fs.readdir(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      const subFiles = await findImageFiles(fullPath);
      files.push(...subFiles);
    } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Get collection status
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = path.join('sessions', sessionId);
    
    if (!await fs.pathExists(sessionDir)) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const processedDir = path.join(sessionDir, 'processed');
    const processedFiles = await fs.readdir(processedDir);
    
    res.json({
      success: true,
      sessionId,
      status: 'completed',
      totalProcessed: processedFiles.length,
      processedFiles: processedFiles.length
    });

  } catch (error) {
    console.error('Collection status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

export default router;