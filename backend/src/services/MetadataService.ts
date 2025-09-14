import { createBundlr } from '@bundlr-network/client';
import { CollectionConfig, NFTMetadata, RarityConfig } from '@analos-nft-launcher/shared';
import { generateTraitCombination, calculateRarity, generateUniqueCombinations } from '@analos-nft-launcher/shared';
import { config } from '../utils/env';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';

// Mock storage for demo purposes
const metadataStorage = new Map<string, any>();
const imageStorage = new Map<string, string>();

export class MetadataService {
  private bundlr: any;

  constructor() {
    // Initialize Bundlr for Arweave uploads
    this.initializeBundlr();
  }

  /**
   * Initialize Bundlr client
   */
  private async initializeBundlr() {
    try {
      if (config.arweaveWalletPrivateKey) {
        this.bundlr = await createBundlr({
          url: config.bundlrNetworkUrl,
          privateKey: config.arweaveWalletPrivateKey
        });
        console.log('Bundlr initialized successfully');
      } else {
        console.warn('Arweave wallet private key not provided, using mock storage');
      }
    } catch (error) {
      console.error('Failed to initialize Bundlr:', error);
      console.warn('Using mock storage for metadata');
    }
  }

  /**
   * Upload images to storage
   */
  async uploadImages(images: any[]): Promise<{ [key: string]: string }> {
    const uploadedImages: { [key: string]: string } = {};

    for (const image of images) {
      try {
        const imageUri = await this.uploadImage(image);
        const key = `${image.layer}_${image.trait}_${image.value}`;
        uploadedImages[key] = imageUri;
      } catch (error) {
        console.error('Image upload error:', error);
        throw new Error(`Failed to upload image: ${image.layer}/${image.trait}/${image.value}`);
      }
    }

    return uploadedImages;
  }

  /**
   * Upload single image
   */
  private async uploadImage(image: any): Promise<string> {
    try {
      // Process image with Sharp
      const processedImage = await sharp(Buffer.from(image.file, 'base64'))
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      if (this.bundlr) {
        // Upload to Arweave via Bundlr
        const response = await this.bundlr.upload(processedImage, {
          tags: [
            { name: 'Content-Type', value: 'image/png' },
            { name: 'Collection', value: image.collectionId || 'unknown' },
            { name: 'Layer', value: image.layer },
            { name: 'Trait', value: image.trait },
            { name: 'Value', value: image.value }
          ]
        });

        return `https://arweave.net/${response.id}`;
      } else {
        // Mock upload for demo
        const mockUri = `https://mock-storage.com/images/${uuidv4()}.png`;
        imageStorage.set(mockUri, processedImage.toString('base64'));
        return mockUri;
      }
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Generate collection metadata
   */
  async generateCollectionMetadata(
    collectionId: string,
    config: CollectionConfig,
    imageUris: { [key: string]: string }
  ): Promise<string> {
    try {
      console.log(`Generating metadata for collection ${collectionId}...`);

      // Generate trait combinations
      const traits = this.convertToTraitMap(config.traits);
      const combinations = generateUniqueCombinations(traits, config.supply);

      // Generate metadata for each NFT
      const metadataPromises = combinations.map(async (combination, index) => {
        const nftMetadata = await this.generateNFTMetadata(
          collectionId,
          index,
          config,
          combination,
          imageUris
        );
        return { tokenId: index, metadata: nftMetadata };
      });

      const nftMetadataList = await Promise.all(metadataPromises);

      // Create collection metadata
      const collectionMetadata = {
        name: config.name,
        symbol: config.symbol,
        description: config.description,
        image: imageUris[Object.keys(imageUris)[0]] || '', // Use first image as collection image
        external_url: `https://analos-nft-launcher.com/collection/${collectionId}`,
        seller_fee_basis_points: config.royalties * 100,
        creators: [
          {
            address: config.creator,
            share: 100,
            verified: true
          }
        ],
        collection: {
          name: config.name,
          family: config.symbol
        },
        properties: {
          category: 'image',
          files: Object.values(imageUris).map(uri => ({
            uri,
            type: 'image/png'
          }))
        },
        attributes: this.generateCollectionAttributes(config.traits),
        nfts: nftMetadataList
      };

      // Upload collection metadata
      const metadataUri = await this.uploadMetadata(collectionMetadata, collectionId);
      
      // Store locally for quick access
      metadataStorage.set(collectionId, collectionMetadata);

      console.log(`Collection metadata generated: ${metadataUri}`);
      return metadataUri;

    } catch (error) {
      console.error('Collection metadata generation error:', error);
      throw new Error(`Failed to generate collection metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate NFT metadata
   */
  private async generateNFTMetadata(
    collectionId: string,
    tokenId: number,
    config: CollectionConfig,
    combination: { [key: string]: string },
    imageUris: { [key: string]: string }
  ): Promise<NFTMetadata> {
    // Generate composite image
    const compositeImageUri = await this.generateCompositeImage(
      collectionId,
      tokenId,
      combination,
      imageUris
    );

    // Generate attributes
    const attributes = Object.entries(combination).map(([trait_type, value]) => ({
      trait_type,
      value
    }));

    // Calculate rarity score
    const rarityScore = this.calculateRarityScore(combination, config.traits);

    const metadata: NFTMetadata = {
      name: `${config.name} #${tokenId}`,
      description: config.description,
      image: compositeImageUri,
      external_url: `https://analos-nft-launcher.com/collection/${collectionId}/${tokenId}`,
      attributes: [
        ...attributes,
        {
          trait_type: 'Rarity Score',
          value: rarityScore
        }
      ],
      properties: {
        files: [
          {
            uri: compositeImageUri,
            type: 'image/png'
          }
        ],
        category: 'image',
        creators: [
          {
            address: config.creator,
            share: 100,
            verified: true
          }
        ]
      },
      collection: {
        name: config.name,
        family: config.symbol
      }
    };

    return metadata;
  }

  /**
   * Generate composite image
   */
  private async generateCompositeImage(
    collectionId: string,
    tokenId: number,
    combination: { [key: string]: string },
    imageUris: { [key: string]: string }
  ): Promise<string> {
    try {
      // Create canvas
      const canvas = createCanvas(512, 512);
      const ctx = canvas.getContext('2d');

      // Set transparent background
      ctx.clearRect(0, 0, 512, 512);

      // Layer images based on combination
      const layerOrder = Object.keys(combination).sort(); // Sort for consistent layering
      
      for (const traitType of layerOrder) {
        const value = combination[traitType];
        const key = `${traitType}_${traitType}_${value}`;
        const imageUri = imageUris[key];

        if (imageUri) {
          try {
            const image = await loadImage(imageUri);
            ctx.drawImage(image, 0, 0, 512, 512);
          } catch (error) {
            console.warn(`Failed to load image for ${traitType}: ${value}`, error);
          }
        }
      }

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');

      // Upload composite image
      if (this.bundlr) {
        const response = await this.bundlr.upload(buffer, {
          tags: [
            { name: 'Content-Type', value: 'image/png' },
            { name: 'Collection', value: collectionId },
            { name: 'TokenId', value: tokenId.toString() },
            { name: 'Type', value: 'composite' }
          ]
        });
        return `https://arweave.net/${response.id}`;
      } else {
        // Mock upload
        const mockUri = `https://mock-storage.com/composite/${collectionId}/${tokenId}.png`;
        imageStorage.set(mockUri, buffer.toString('base64'));
        return mockUri;
      }

    } catch (error) {
      console.error('Composite image generation error:', error);
      // Return a placeholder image
      return `https://via.placeholder.com/512x512/000000/FFFFFF?text=${collectionId}+${tokenId}`;
    }
  }

  /**
   * Calculate rarity score
   */
  private calculateRarityScore(combination: { [key: string]: string }, traits: any[]): number {
    let totalRarity = 0;
    let traitCount = 0;

    for (const [traitType, value] of Object.entries(combination)) {
      const trait = traits.find(t => t.name === traitType);
      if (trait) {
        const traitValue = trait.values.find(v => v.name === value);
        if (traitValue) {
          totalRarity += traitValue.weight;
          traitCount++;
        }
      }
    }

    return traitCount > 0 ? Math.round(totalRarity / traitCount * 100) / 100 : 0;
  }

  /**
   * Upload metadata to storage
   */
  private async uploadMetadata(metadata: any, collectionId: string): Promise<string> {
    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(metadataJson, 'utf8');

      if (this.bundlr) {
        const response = await this.bundlr.upload(buffer, {
          tags: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Collection', value: collectionId },
            { name: 'Type', value: 'collection-metadata' }
          ]
        });
        return `https://arweave.net/${response.id}`;
      } else {
        // Mock upload
        const mockUri = `https://mock-storage.com/metadata/${collectionId}/collection.json`;
        metadataStorage.set(mockUri, metadata);
        return mockUri;
      }
    } catch (error) {
      console.error('Metadata upload error:', error);
      throw new Error('Failed to upload metadata');
    }
  }

  /**
   * Get collection metadata
   */
  async getCollectionMetadata(collectionId: string): Promise<any> {
    const metadata = metadataStorage.get(collectionId);
    if (!metadata) {
      throw new Error('Collection metadata not found');
    }
    return metadata;
  }

  /**
   * Get NFT metadata
   */
  async getNFTMetadata(collectionId: string, tokenId: number): Promise<NFTMetadata | null> {
    const collectionMetadata = await this.getCollectionMetadata(collectionId);
    const nftData = collectionMetadata.nfts?.find((nft: any) => nft.tokenId === tokenId);
    return nftData?.metadata || null;
  }

  /**
   * Get collection traits
   */
  async getCollectionTraits(collectionId: string): Promise<any[]> {
    const metadata = await this.getCollectionMetadata(collectionId);
    return metadata.attributes || [];
  }

  /**
   * Get rarity data
   */
  async getRarityData(collectionId: string, options: { sortBy: string; order: 'asc' | 'desc' }): Promise<RarityConfig[]> {
    const metadata = await this.getCollectionMetadata(collectionId);
    const traits = this.convertToTraitMap(metadata.attributes || []);
    const rarityData = calculateRarity(traits);

    // Sort by specified field
    rarityData.sort((a, b) => {
      const aValue = a[options.sortBy as keyof RarityConfig] as number;
      const bValue = b[options.sortBy as keyof RarityConfig] as number;
      return options.order === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return rarityData;
  }

  /**
   * Generate preview
   */
  async generatePreview(traits: any[], images: any[], config: any): Promise<any> {
    // Generate a few sample combinations for preview
    const traitMap = this.convertToTraitMap(traits);
    const sampleCombinations = generateUniqueCombinations(traitMap, 5);

    const previews = await Promise.all(
      sampleCombinations.map(async (combination, index) => {
        const compositeImageUri = await this.generateCompositeImage(
          'preview',
          index,
          combination,
          images.reduce((acc, img) => {
            const key = `${img.layer}_${img.trait}_${img.value}`;
            acc[key] = img.file; // Use base64 data directly for preview
            return acc;
          }, {} as { [key: string]: string })
        );

        return {
          tokenId: index,
          combination,
          image: compositeImageUri,
          rarityScore: this.calculateRarityScore(combination, traits)
        };
      })
    );

    return {
      previews,
      totalCombinations: this.calculateTotalCombinations(traitMap),
      rarityDistribution: this.calculateRarityDistribution(traitMap)
    };
  }

  /**
   * Update NFT metadata
   */
  async updateNFTMetadata(collectionId: string, tokenId: number, updates: Partial<NFTMetadata>): Promise<NFTMetadata> {
    const collectionMetadata = await this.getCollectionMetadata(collectionId);
    const nftIndex = collectionMetadata.nfts?.findIndex((nft: any) => nft.tokenId === tokenId);
    
    if (nftIndex === -1) {
      throw new Error('NFT not found');
    }

    // Update metadata
    collectionMetadata.nfts[nftIndex].metadata = {
      ...collectionMetadata.nfts[nftIndex].metadata,
      ...updates
    };

    // Re-upload metadata
    await this.uploadMetadata(collectionMetadata, collectionId);
    metadataStorage.set(collectionId, collectionMetadata);

    return collectionMetadata.nfts[nftIndex].metadata;
  }

  /**
   * Get metadata statistics
   */
  async getMetadataStats(collectionId: string): Promise<any> {
    const metadata = await this.getCollectionMetadata(collectionId);
    const nfts = metadata.nfts || [];

    const traitCounts: { [key: string]: { [key: string]: number } } = {};
    
    nfts.forEach((nft: any) => {
      nft.metadata.attributes.forEach((attr: any) => {
        if (attr.trait_type !== 'Rarity Score') {
          if (!traitCounts[attr.trait_type]) {
            traitCounts[attr.trait_type] = {};
          }
          traitCounts[attr.trait_type][attr.value] = (traitCounts[attr.trait_type][attr.value] || 0) + 1;
        }
      });
    });

    return {
      totalNFTs: nfts.length,
      traitCounts,
      averageRarity: nfts.reduce((sum: number, nft: any) => {
        const rarityAttr = nft.metadata.attributes.find((attr: any) => attr.trait_type === 'Rarity Score');
        return sum + (rarityAttr?.value || 0);
      }, 0) / nfts.length
    };
  }

  /**
   * Convert traits array to map
   */
  private convertToTraitMap(traits: any[]): { [key: string]: any[] } {
    const traitMap: { [key: string]: any[] } = {};
    
    traits.forEach(trait => {
      traitMap[trait.name] = trait.values;
    });

    return traitMap;
  }

  /**
   * Generate collection attributes
   */
  private generateCollectionAttributes(traits: any[]): any[] {
    return traits.map(trait => ({
      trait_type: trait.name,
      values: trait.values.map((value: any) => value.name)
    }));
  }

  /**
   * Calculate total possible combinations
   */
  private calculateTotalCombinations(traitMap: { [key: string]: any[] }): number {
    return Object.values(traitMap).reduce((total, values) => total * values.length, 1);
  }

  /**
   * Calculate rarity distribution
   */
  private calculateRarityDistribution(traitMap: { [key: string]: any[] }): any {
    const distribution: { [key: string]: number } = {};
    
    Object.entries(traitMap).forEach(([traitType, values]) => {
      const totalWeight = values.reduce((sum, value) => sum + value.weight, 0);
      values.forEach(value => {
        const rarity = (value.weight / totalWeight) * 100;
        distribution[`${traitType}:${value.name}`] = Math.round(rarity * 100) / 100;
      });
    });

    return distribution;
  }
}
