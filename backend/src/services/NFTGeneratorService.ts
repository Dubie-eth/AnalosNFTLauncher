import { createWorker } from 'workerpool';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './StorageService';
import { RarityUtils } from '../utils/RarityUtils';
import { logger } from '../utils/logger';

// TypeScript interfaces
export interface Layer {
  name: string;
  traits: string[];
  weights?: number[];
  images: Map<string, Buffer>;
}

export interface GenerationConfig {
  order: string[];
  rarity: { [layerName: string]: { [traitName: string]: number } };
  supply: number;
  collection: {
    name: string;
    symbol: string;
    description: string;
    royalties: number;
    price?: number;
  };
  createdAt: Date;
}

export interface GenerationProgress {
  sessionId: string;
  status: 'pending' | 'generating' | 'uploading' | 'completed' | 'error';
  progress: number;
  current: number;
  total: number;
  message: string;
  error?: string;
}

export interface GenerationResult {
  sessionId: string;
  baseURI: string;
  totalSupply: number;
  metadata: Array<{
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  }>;
  hashlist: string[];
  collection: GenerationConfig['collection'];
}

export class NFTGeneratorService {
  private sessionsDir: string;
  private storageService: StorageService;
  private workerPool: any;
  private activeGenerations: Map<string, GenerationProgress> = new Map();

  constructor() {
    this.sessionsDir = path.join(process.cwd(), 'tmp', 'sessions');
    this.storageService = new StorageService();
    
    // Ensure sessions directory exists
    fs.ensureDirSync(this.sessionsDir);
    
    // Initialize worker pool for parallel processing
    this.workerPool = createWorker(path.join(__dirname, 'workers', 'imageWorker.js'));
    
    // Cleanup old sessions on startup
    this.cleanupOldSessions();
  }

  /**
   * Extract layers from ZIP file
   */
  async extractLayers(zipBuffer: Buffer, sessionId: string): Promise<Layer[]> {
    const sessionDir = path.join(this.sessionsDir, sessionId);
    await fs.ensureDir(sessionDir);

    const zip = new AdmZip(zipBuffer);
    const layers: Layer[] = [];

    // Extract ZIP contents
    zip.extractAllTo(sessionDir, true);

    // Process each folder as a layer
    const entries = await fs.readdir(sessionDir);
    
    for (const entry of entries) {
      const entryPath = path.join(sessionDir, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory()) {
        const layerName = entry.replace(/[^a-zA-Z0-9]/g, '_');
        const traits: string[] = [];
        const images = new Map<string, Buffer>();

        // Process images in the layer folder
        const files = await fs.readdir(entryPath);
        
        for (const file of files) {
          const filePath = path.join(entryPath, file);
          const fileStat = await fs.stat(filePath);
          
          if (fileStat.isFile() && this.isValidImageFile(file)) {
            const traitName = path.parse(file).name;
            traits.push(traitName);
            
            // Load image into memory
            const imageBuffer = await fs.readFile(filePath);
            images.set(traitName, imageBuffer);
          }
        }

        if (traits.length > 0) {
          layers.push({
            name: layerName,
            traits,
            images
          });
        }
      }
    }

    // Save layers info
    await fs.writeJSON(
      path.join(sessionDir, 'layers.json'),
      layers.map(layer => ({
        name: layer.name,
        traits: layer.traits
      }))
    );

    return layers;
  }

  /**
   * Validate extracted layers
   */
  async validateLayers(layers: Layer[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (layers.length === 0) {
      errors.push('No valid layers found in ZIP file');
    }

    for (const layer of layers) {
      if (layer.traits.length === 0) {
        errors.push(`Layer "${layer.name}" has no valid image files`);
      }

      if (layer.traits.length > 100) {
        errors.push(`Layer "${layer.name}" has too many traits (max 100)`);
      }

      // Validate image files
      for (const [traitName, imageBuffer] of layer.images) {
        try {
          const metadata = await sharp(imageBuffer).metadata();
          if (metadata.width && metadata.height) {
            if (metadata.width > 2048 || metadata.height > 2048) {
              errors.push(`Image "${traitName}" in layer "${layer.name}" is too large (max 2048x2048)`);
            }
          }
        } catch (error) {
          errors.push(`Invalid image file "${traitName}" in layer "${layer.name}"`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate generation configuration
   */
  async validateConfig(config: {
    sessionId: string;
    order: string[];
    rarity: { [layerName: string]: { [traitName: string]: number } };
    supply: number;
    collection: any;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if session exists
    const sessionDir = path.join(this.sessionsDir, config.sessionId);
    if (!await fs.pathExists(sessionDir)) {
      errors.push('Session not found');
      return { valid: false, errors };
    }

    // Load layers
    const layersPath = path.join(sessionDir, 'layers.json');
    if (!await fs.pathExists(layersPath)) {
      errors.push('Layers not found for session');
      return { valid: false, errors };
    }

    const layers = await fs.readJSON(layersPath);

    // Validate order
    for (const layerName of config.order) {
      if (!layers.find((l: any) => l.name === layerName)) {
        errors.push(`Layer "${layerName}" not found in uploaded layers`);
      }
    }

    // Validate rarity configuration
    for (const layerName of config.order) {
      const layer = layers.find((l: any) => l.name === layerName);
      if (layer && config.rarity[layerName]) {
        const rarityWeights = Object.values(config.rarity[layerName]);
        const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
        
        if (totalWeight === 0) {
          errors.push(`Layer "${layerName}" has no valid rarity weights`);
        }

        // Check if all traits have weights
        for (const trait of layer.traits) {
          if (!(trait in config.rarity[layerName])) {
            errors.push(`Trait "${trait}" in layer "${layerName}" missing rarity weight`);
          }
        }
      }
    }

    // Validate collection config
    if (!config.collection.name || config.collection.name.length < 1) {
      errors.push('Collection name is required');
    }

    if (!config.collection.symbol || config.collection.symbol.length < 1) {
      errors.push('Collection symbol is required');
    }

    if (config.collection.royalties < 0 || config.collection.royalties > 25) {
      errors.push('Royalties must be between 0 and 25%');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Save generation configuration
   */
  async saveConfig(sessionId: string, config: GenerationConfig): Promise<void> {
    const sessionDir = path.join(this.sessionsDir, sessionId);
    await fs.ensureDir(sessionDir);
    
    await fs.writeJSON(
      path.join(sessionDir, 'config.json'),
      config,
      { spaces: 2 }
    );
  }

  /**
   * Get saved configuration
   */
  async getConfig(sessionId: string): Promise<GenerationConfig | null> {
    const configPath = path.join(this.sessionsDir, sessionId, 'config.json');
    
    if (await fs.pathExists(configPath)) {
      return await fs.readJSON(configPath);
    }
    
    return null;
  }

  /**
   * Generate NFTs based on configuration
   */
  async generateNFTs(sessionId: string, config: GenerationConfig): Promise<GenerationResult> {
    const sessionDir = path.join(this.sessionsDir, sessionId);
    
    // Update progress
    this.updateProgress(sessionId, {
      status: 'generating',
      progress: 0,
      current: 0,
      total: config.supply,
      message: 'Starting generation...'
    });

    try {
      // Load layers
      const layers = await this.loadLayers(sessionId);
      
      // Generate unique combinations
      const combinations = await this.generateCombinations(config, layers);
      
      // Update progress
      this.updateProgress(sessionId, {
        status: 'generating',
        progress: 25,
        current: 0,
        total: config.supply,
        message: 'Generating images...'
      });

      // Generate images and metadata in batches
      const batchSize = 100;
      const batches = Math.ceil(combinations.length / batchSize);
      const metadata: any[] = [];
      const hashlist: string[] = [];

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, combinations.length);
        const batch = combinations.slice(startIndex, endIndex);

        // Process batch in parallel
        const batchPromises = batch.map(async (combination, index) => {
          const tokenId = startIndex + index;
          
          // Generate image
          const imageBuffer = await this.compositeImage(combination, layers);
          
          // Create metadata
          const metadataItem = this.createMetadata(
            tokenId,
            combination,
            config.collection
          );

          return {
            tokenId,
            imageBuffer,
            metadata: metadataItem
          };
        });

        const batchResults = await Promise.all(batchPromises);

        // Upload images to storage
        const uploadPromises = batchResults.map(async (result) => {
          const imageUri = await this.storageService.uploadImage(
            result.imageBuffer,
            `${sessionId}/${result.tokenId}.png`
          );
          
          return {
            ...result,
            imageUri
          };
        });

        const uploadedResults = await Promise.all(uploadPromises);

        // Add to metadata and hashlist
        for (const result of uploadedResults) {
          result.metadata.image = result.imageUri;
          metadata.push(result.metadata);
          hashlist.push(result.imageUri);
        }

        // Update progress
        const progress = Math.min(25 + (batchIndex + 1) / batches * 50, 75);
        this.updateProgress(sessionId, {
          status: 'generating',
          progress,
          current: endIndex,
          total: config.supply,
          message: `Generated ${endIndex}/${config.supply} NFTs...`
        });
      }

      // Upload metadata to storage
      this.updateProgress(sessionId, {
        status: 'uploading',
        progress: 75,
        current: config.supply,
        total: config.supply,
        message: 'Uploading metadata...'
      });

      const baseURI = await this.storageService.uploadMetadata(sessionId, metadata);

      // Save result
      const result: GenerationResult = {
        sessionId,
        baseURI,
        totalSupply: config.supply,
        metadata,
        hashlist,
        collection: config.collection
      };

      await fs.writeJSON(
        path.join(sessionDir, 'result.json'),
        result,
        { spaces: 2 }
      );

      // Update progress
      this.updateProgress(sessionId, {
        status: 'completed',
        progress: 100,
        current: config.supply,
        total: config.supply,
        message: 'Generation completed!'
      });

      return result;

    } catch (error) {
      logger.error(`Generation failed for session ${sessionId}:`, error);
      
      this.updateProgress(sessionId, {
        status: 'error',
        progress: 0,
        current: 0,
        total: config.supply,
        message: 'Generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Load layers from session directory
   */
  private async loadLayers(sessionId: string): Promise<Layer[]> {
    const sessionDir = path.join(this.sessionsDir, sessionId);
    const layers: Layer[] = [];

    const layersInfo = await fs.readJSON(path.join(sessionDir, 'layers.json'));

    for (const layerInfo of layersInfo) {
      const layerDir = path.join(sessionDir, layerInfo.name);
      const images = new Map<string, Buffer>();

      for (const trait of layerInfo.traits) {
        const imagePath = path.join(layerDir, `${trait}.png`);
        if (await fs.pathExists(imagePath)) {
          const imageBuffer = await fs.readFile(imagePath);
          images.set(trait, imageBuffer);
        }
      }

      layers.push({
        name: layerInfo.name,
        traits: layerInfo.traits,
        images
      });
    }

    return layers;
  }

  /**
   * Generate unique trait combinations
   */
  private async generateCombinations(config: GenerationConfig, layers: Layer[]): Promise<Array<{ [layerName: string]: string }>> {
    const combinations: Array<{ [layerName: string]: string }> = [];
    const maxAttempts = config.supply * 10;
    let attempts = 0;

    while (combinations.length < config.supply && attempts < maxAttempts) {
      const combination: { [layerName: string]: string } = {};

      for (const layerName of config.order) {
        const layer = layers.find(l => l.name === layerName);
        if (layer && config.rarity[layerName]) {
          const trait = RarityUtils.selectWeightedTrait(
            layer.traits,
            config.rarity[layerName]
          );
          combination[layerName] = trait;
        }
      }

      // Check if combination is unique
      const key = JSON.stringify(combination);
      if (!combinations.some(c => JSON.stringify(c) === key)) {
        combinations.push(combination);
      }

      attempts++;
    }

    // If we couldn't generate enough unique combinations, fill with random ones
    while (combinations.length < config.supply) {
      const combination: { [layerName: string]: string } = {};

      for (const layerName of config.order) {
        const layer = layers.find(l => l.name === layerName);
        if (layer && config.rarity[layerName]) {
          const trait = RarityUtils.selectWeightedTrait(
            layer.traits,
            config.rarity[layerName]
          );
          combination[layerName] = trait;
        }
      }

      combinations.push(combination);
    }

    return combinations;
  }

  /**
   * Composite image from layers
   */
  private async compositeImage(
    combination: { [layerName: string]: string },
    layers: Layer[]
  ): Promise<Buffer> {
    let composite = sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Apply layers in order
    for (const layer of layers) {
      const trait = combination[layer.name];
      if (trait && layer.images.has(trait)) {
        const imageBuffer = layer.images.get(trait)!;
        composite = composite.composite([{
          input: imageBuffer,
          blend: 'over'
        }]);
      }
    }

    return await composite.png().toBuffer();
  }

  /**
   * Create metadata for NFT
   */
  private createMetadata(
    tokenId: number,
    combination: { [layerName: string]: string },
    collection: GenerationConfig['collection']
  ): any {
    const attributes = Object.entries(combination).map(([trait_type, value]) => ({
      trait_type,
      value
    }));

    return {
      name: `${collection.name} #${tokenId}`,
      description: collection.description,
      image: '', // Will be set after upload
      attributes,
      properties: {
        files: [],
        category: 'image',
        creators: [{
          address: '', // Will be set during deployment
          share: 100,
          verified: true
        }]
      },
      collection: {
        name: collection.name,
        family: collection.symbol
      }
    };
  }

  /**
   * Get generation progress
   */
  async getProgress(sessionId: string): Promise<GenerationProgress | null> {
    return this.activeGenerations.get(sessionId) || null;
  }

  /**
   * Update generation progress
   */
  private updateProgress(sessionId: string, progress: Partial<GenerationProgress>): void {
    const current = this.activeGenerations.get(sessionId) || {
      sessionId,
      status: 'pending',
      progress: 0,
      current: 0,
      total: 0,
      message: ''
    };

    this.activeGenerations.set(sessionId, {
      ...current,
      ...progress
    });
  }

  /**
   * Get generation result
   */
  async getGenerationResult(sessionId: string): Promise<GenerationResult | null> {
    const resultPath = path.join(this.sessionsDir, sessionId, 'result.json');
    
    if (await fs.pathExists(resultPath)) {
      return await fs.readJSON(resultPath);
    }
    
    return null;
  }

  /**
   * Clean up session data
   */
  async cleanupSession(sessionId: string): Promise<void> {
    const sessionDir = path.join(this.sessionsDir, sessionId);
    
    if (await fs.pathExists(sessionDir)) {
      await fs.remove(sessionDir);
    }
    
    this.activeGenerations.delete(sessionId);
  }

  /**
   * Clean up old sessions (older than 1 hour)
   */
  private async cleanupOldSessions(): Promise<void> {
    const entries = await fs.readdir(this.sessionsDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);

    for (const entry of entries) {
      const entryPath = path.join(this.sessionsDir, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory() && stat.mtime.getTime() < oneHourAgo) {
        await fs.remove(entryPath);
        logger.info(`Cleaned up old session: ${entry}`);
      }
    }
  }

  /**
   * Check if file is a valid image
   */
  private isValidImageFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
  }
}
