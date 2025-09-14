import { createBundlr } from '@bundlr-network/client';
import { PublicKey, Keypair } from '@solana/web3.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { logger } from '../utils/logger';
import { config } from '../utils/env';

export interface UploadResult {
  uri: string;
  cid?: string;
  size: number;
}

export class StorageService {
  private bundlr: any;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeBundlr();
  }

  /**
   * Initialize Bundlr client for Arweave uploads
   */
  private async initializeBundlr(): Promise<void> {
    try {
      if (config.arweaveWalletPrivateKey) {
        // Convert private key to Keypair
        const privateKeyBytes = Buffer.from(config.arweaveWalletPrivateKey, 'base64');
        const keypair = Keypair.fromSecretKey(privateKeyBytes);

        this.bundlr = await createBundlr({
          url: config.bundlrNetworkUrl,
          wallet: keypair
        });

        this.isInitialized = true;
        logger.info('Bundlr initialized successfully');
      } else {
        logger.warn('Arweave wallet private key not provided, using mock storage');
      }
    } catch (error) {
      logger.error('Failed to initialize Bundlr:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Upload image to storage
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    try {
      if (this.isInitialized && this.bundlr) {
        // Upload to Arweave via Bundlr
        const response = await this.bundlr.upload(imageBuffer, {
          tags: [
            { name: 'Content-Type', value: 'image/png' },
            { name: 'Filename', value: filename },
            { name: 'Type', value: 'nft-image' }
          ]
        });

        const uri = `https://arweave.net/${response.id}`;
        logger.info(`Image uploaded to Arweave: ${uri}`);
        return uri;
      } else {
        // Fallback to mock storage
        return this.uploadToMockStorage(imageBuffer, filename, 'image/png');
      }
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload metadata to storage
   */
  async uploadMetadata(sessionId: string, metadata: any[]): Promise<string> {
    try {
      // Create collection metadata
      const collectionMetadata = {
        name: metadata[0]?.collection?.name || 'LOL Collection',
        symbol: metadata[0]?.collection?.family || 'LOL',
        description: metadata[0]?.description || 'Generated with Launch On Los',
        image: metadata[0]?.image || '',
        external_url: `https://launchonlos.com/collection/${sessionId}`,
        seller_fee_basis_points: 250, // 2.5%
        attributes: this.extractAllAttributes(metadata),
        properties: {
          category: 'image',
          files: metadata.map(item => ({
            uri: item.image,
            type: 'image/png'
          }))
        },
        collection: {
          name: metadata[0]?.collection?.name || 'LOL Collection',
          family: metadata[0]?.collection?.family || 'LOL'
        }
      };

      const metadataBuffer = Buffer.from(JSON.stringify(collectionMetadata, null, 2));

      if (this.isInitialized && this.bundlr) {
        // Upload to Arweave via Bundlr
        const response = await this.bundlr.upload(metadataBuffer, {
          tags: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Session-ID', value: sessionId },
            { name: 'Type', value: 'collection-metadata' },
            { name: 'Collection-Name', value: collectionMetadata.name }
          ]
        });

        const baseURI = `https://arweave.net/${response.id}`;
        logger.info(`Metadata uploaded to Arweave: ${baseURI}`);
        return baseURI;
      } else {
        // Fallback to mock storage
        return this.uploadToMockStorage(metadataBuffer, `${sessionId}/metadata.json`, 'application/json');
      }
    } catch (error) {
      logger.error('Metadata upload failed:', error);
      throw new Error(`Failed to upload metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload individual NFT metadata
   */
  async uploadNFTMetadata(metadata: any, filename: string): Promise<string> {
    try {
      const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));

      if (this.isInitialized && this.bundlr) {
        const response = await this.bundlr.upload(metadataBuffer, {
          tags: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Filename', value: filename },
            { name: 'Type', value: 'nft-metadata' }
          ]
        });

        return `https://arweave.net/${response.id}`;
      } else {
        return this.uploadToMockStorage(metadataBuffer, filename, 'application/json');
      }
    } catch (error) {
      logger.error('NFT metadata upload failed:', error);
      throw new Error(`Failed to upload NFT metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch upload multiple files
   */
  async uploadBatch(files: Array<{ buffer: Buffer; filename: string; mimeType: string }>): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file.buffer, file.filename, file.mimeType)
      );

      const results = await Promise.all(uploadPromises);
      return results.map(result => result.uri);
    } catch (error) {
      logger.error('Batch upload failed:', error);
      throw new Error(`Failed to upload batch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload any file to storage
   */
  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    try {
      if (this.isInitialized && this.bundlr) {
        const response = await this.bundlr.upload(buffer, {
          tags: [
            { name: 'Content-Type', value: mimeType },
            { name: 'Filename', value: filename }
          ]
        });

        return {
          uri: `https://arweave.net/${response.id}`,
          cid: response.id,
          size: buffer.length
        };
      } else {
        const uri = await this.uploadToMockStorage(buffer, filename, mimeType);
        return {
          uri,
          size: buffer.length
        };
      }
    } catch (error) {
      logger.error('File upload failed:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload to mock storage (fallback)
   */
  private async uploadToMockStorage(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const mockStorageDir = path.join(process.cwd(), 'tmp', 'mock-storage');
    await fs.ensureDir(mockStorageDir);

    const filePath = path.join(mockStorageDir, filename);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, buffer);

    const mockUri = `https://mock-storage.launchonlos.com/${filename}`;
    logger.info(`File uploaded to mock storage: ${mockUri}`);
    return mockUri;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    provider: string;
  }> {
    if (this.isInitialized && this.bundlr) {
      try {
        const balance = await this.bundlr.getBalance();
        return {
          totalFiles: 0, // Bundlr doesn't provide file count
          totalSize: balance,
          provider: 'Arweave via Bundlr'
        };
      } catch (error) {
        logger.error('Failed to get Bundlr stats:', error);
      }
    }

    // Mock storage stats
    const mockStorageDir = path.join(process.cwd(), 'tmp', 'mock-storage');
    if (await fs.pathExists(mockStorageDir)) {
      const files = await fs.readdir(mockStorageDir, { recursive: true });
      let totalSize = 0;

      for (const file of files) {
        const filePath = path.join(mockStorageDir, file as string);
        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          totalSize += stat.size;
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        provider: 'Mock Storage'
      };
    }

    return {
      totalFiles: 0,
      totalSize: 0,
      provider: 'Not initialized'
    };
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get base URI for a collection
   */
  getBaseURI(cid: string): string {
    if (this.isInitialized) {
      return `https://arweave.net/${cid}`;
    } else {
      return `https://mock-storage.launchonlos.com/${cid}`;
    }
  }

  /**
   * Extract all unique attributes from metadata
   */
  private extractAllAttributes(metadata: any[]): Array<{ trait_type: string; value: string }> {
    const attributeMap = new Map<string, Set<string>>();

    for (const item of metadata) {
      if (item.attributes) {
        for (const attr of item.attributes) {
          if (!attributeMap.has(attr.trait_type)) {
            attributeMap.set(attr.trait_type, new Set());
          }
          attributeMap.get(attr.trait_type)!.add(attr.value);
        }
      }
    }

    const allAttributes: Array<{ trait_type: string; value: string }> = [];
    for (const [trait_type, values] of attributeMap) {
      for (const value of values) {
        allAttributes.push({ trait_type, value });
      }
    }

    return allAttributes;
  }

  /**
   * Clean up old files
   */
  async cleanupOldFiles(olderThanDays: number = 7): Promise<number> {
    const mockStorageDir = path.join(process.cwd(), 'tmp', 'mock-storage');
    if (!await fs.pathExists(mockStorageDir)) {
      return 0;
    }

    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    const files = await fs.readdir(mockStorageDir, { recursive: true });
    
    for (const file of files) {
      const filePath = path.join(mockStorageDir, file as string);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile() && stat.mtime.getTime() < cutoffDate) {
        await fs.remove(filePath);
        deletedCount++;
      }
    }

    logger.info(`Cleaned up ${deletedCount} old files from mock storage`);
    return deletedCount;
  }
}
