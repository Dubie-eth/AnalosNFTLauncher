import { Collection, CollectionConfig, CollectionStatus, CollectionStats } from '@analos-nft-launcher/shared';
import { generateCollectionId, validateCollectionConfig } from '@analos-nft-launcher/shared';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes
// In production, this would be replaced with a database
const collections = new Map<string, Collection>();

export class CollectionService {
  /**
   * Create a new collection
   */
  async createCollection(config: CollectionConfig): Promise<Collection> {
    // Validate configuration
    const validationErrors = validateCollectionConfig(config);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid collection configuration: ${validationErrors.join(', ')}`);
    }

    const collection: Collection = {
      id: generateCollectionId(),
      config,
      status: CollectionStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalMinted: 0,
      totalRevenue: 0
    };

    collections.set(collection.id, collection);
    
    console.log(`Collection created: ${collection.id}`);
    return collection;
  }

  /**
   * Get collection by ID
   */
  async getCollection(id: string): Promise<Collection | null> {
    return collections.get(id) || null;
  }

  /**
   * Get user's collections
   */
  async getUserCollections(walletAddress: string, page: number = 1, limit: number = 20): Promise<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const allCollections = Array.from(collections.values())
      .filter(collection => collection.config.creator === walletAddress)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allCollections.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCollections = allCollections.slice(startIndex, endIndex);

    return {
      collections: paginatedCollections,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Update collection
   */
  async updateCollection(id: string, updates: Partial<CollectionConfig>): Promise<Collection | null> {
    const collection = collections.get(id);
    if (!collection) {
      return null;
    }

    // Merge updates with existing config
    const updatedConfig = { ...collection.config, ...updates };
    
    // Validate updated configuration
    const validationErrors = validateCollectionConfig(updatedConfig);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid collection configuration: ${validationErrors.join(', ')}`);
    }

    const updatedCollection: Collection = {
      ...collection,
      config: updatedConfig,
      updatedAt: new Date()
    };

    collections.set(id, updatedCollection);
    return updatedCollection;
  }

  /**
   * Delete collection
   */
  async deleteCollection(id: string): Promise<boolean> {
    const collection = collections.get(id);
    if (!collection) {
      return false;
    }

    // Only allow deletion if collection is in draft state
    if (collection.status !== CollectionStatus.DRAFT) {
      throw new Error('Cannot delete collection that has been deployed');
    }

    return collections.delete(id);
  }

  /**
   * Update collection status
   */
  async updateCollectionStatus(
    id: string, 
    status: CollectionStatus, 
    error?: string
  ): Promise<Collection | null> {
    const collection = collections.get(id);
    if (!collection) {
      return null;
    }

    const updatedCollection: Collection = {
      ...collection,
      status,
      error,
      updatedAt: new Date()
    };

    collections.set(id, updatedCollection);
    return updatedCollection;
  }

  /**
   * Update collection deployment info
   */
  async updateCollectionDeployment(
    id: string, 
    deploymentResult: {
      mintAddress?: string;
      collectionAddress?: string;
      masterMintAddress?: string;
      metadataUri?: string;
    }
  ): Promise<Collection | null> {
    const collection = collections.get(id);
    if (!collection) {
      return null;
    }

    const updatedCollection: Collection = {
      ...collection,
      mintAddress: deploymentResult.mintAddress ? deploymentResult.mintAddress as any : collection.mintAddress,
      collectionAddress: deploymentResult.collectionAddress ? deploymentResult.collectionAddress as any : collection.collectionAddress,
      masterMintAddress: deploymentResult.masterMintAddress ? deploymentResult.masterMintAddress as any : collection.masterMintAddress,
      metadataUri: deploymentResult.metadataUri || collection.metadataUri,
      updatedAt: new Date()
    };

    collections.set(id, updatedCollection);
    return updatedCollection;
  }

  /**
   * Update mint statistics
   */
  async updateMintStats(id: string, quantity: number, revenue: number): Promise<Collection | null> {
    const collection = collections.get(id);
    if (!collection) {
      return null;
    }

    const updatedCollection: Collection = {
      ...collection,
      totalMinted: collection.totalMinted + quantity,
      totalRevenue: collection.totalRevenue + revenue,
      updatedAt: new Date()
    };

    collections.set(id, updatedCollection);
    return updatedCollection;
  }

  /**
   * Check if wallet is whitelisted
   */
  async isWalletWhitelisted(collectionId: string, walletAddress: string): Promise<boolean> {
    const collection = collections.get(collectionId);
    if (!collection) {
      return false;
    }

    return collection.config.whitelist?.includes(walletAddress) || false;
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(id: string): Promise<CollectionStats | null> {
    const collection = collections.get(id);
    if (!collection) {
      return null;
    }

    return {
      totalSupply: collection.config.supply,
      minted: collection.totalMinted,
      remaining: collection.config.supply - collection.totalMinted,
      floorPrice: collection.config.mintPrice,
      volume: collection.totalRevenue,
      holders: 0 // Would need to track this separately
    };
  }

  /**
   * Validate collection configuration
   */
  validateConfig(config: CollectionConfig): string[] {
    return validateCollectionConfig(config);
  }

  /**
   * Get all collections (for admin purposes)
   */
  async getAllCollections(): Promise<Collection[]> {
    return Array.from(collections.values());
  }

  /**
   * Search collections
   */
  async searchCollections(query: string, page: number = 1, limit: number = 20): Promise<{
    collections: Collection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const allCollections = Array.from(collections.values())
      .filter(collection => 
        collection.config.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.config.description.toLowerCase().includes(query.toLowerCase()) ||
        collection.config.symbol.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = allCollections.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCollections = allCollections.slice(startIndex, endIndex);

    return {
      collections: paginatedCollections,
      total,
      page,
      limit,
      totalPages
    };
  }
}
