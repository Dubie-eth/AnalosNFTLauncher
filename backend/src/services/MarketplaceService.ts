import axios from 'axios';
import { logger } from '../utils/logger';
import { config } from '../utils/env';
import { MarketplaceListing } from '@analos-nft-launcher/shared';

export class MarketplaceService {
  private magicEdenApiKey: string;
  private magicEdenBaseUrl: string;

  constructor() {
    this.magicEdenApiKey = process.env.MAGIC_EDEN_API_KEY || '';
    this.magicEdenBaseUrl = 'https://api-mainnet.magiceden.io/v2';
  }

  /**
   * Verify collection on Magic Eden
   */
  async verifyCollectionOnMagicEden(collectionAddress: string): Promise<{
    success: boolean;
    listingUrl?: string;
    error?: string;
  }> {
    try {
      if (!this.magicEdenApiKey) {
        logger.warn('Magic Eden API key not provided, skipping verification');
        return {
          success: false,
          error: 'Magic Eden API key not configured'
        };
      }

      // Check if collection already exists on Magic Eden
      const existingCollection = await this.getCollectionFromMagicEden(collectionAddress);
      if (existingCollection) {
        return {
          success: true,
          listingUrl: existingCollection.listingUrl
        };
      }

      // Submit collection for verification
      const response = await axios.post(
        `${this.magicEdenBaseUrl}/collections/verify`,
        {
          collectionAddress,
          chain: 'analos', // Custom chain identifier
          metadata: {
            name: 'LOL Collection',
            symbol: 'LOL',
            description: 'Generated with Launch On Los'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.magicEdenApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          listingUrl: `https://magiceden.io/collections/analos/${collectionAddress}`
        };
      }

      return {
        success: false,
        error: 'Failed to verify collection'
      };
    } catch (error) {
      logger.error('Failed to verify collection on Magic Eden:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get collection from Magic Eden
   */
  private async getCollectionFromMagicEden(collectionAddress: string): Promise<{
    listingUrl: string;
    floorPrice?: number;
    volume?: number;
  } | null> {
    try {
      const response = await axios.get(
        `${this.magicEdenBaseUrl}/collections/${collectionAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.magicEdenApiKey}`
          }
        }
      );

      if (response.status === 200) {
        return {
          listingUrl: `https://magiceden.io/collections/analos/${collectionAddress}`,
          floorPrice: response.data.floorPrice,
          volume: response.data.volume
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to get collection from Magic Eden:', error);
      return null;
    }
  }

  /**
   * Get all marketplace listings for a collection
   */
  async getCollectionListings(collectionAddress: string): Promise<MarketplaceListing[]> {
    const listings: MarketplaceListing[] = [];

    try {
      // Magic Eden
      const magicEdenListing = await this.getMagicEdenListing(collectionAddress);
      if (magicEdenListing) {
        listings.push(magicEdenListing);
      }

      // Tensor (if available)
      const tensorListing = await this.getTensorListing(collectionAddress);
      if (tensorListing) {
        listings.push(tensorListing);
      }

      // OpenSea (if available)
      const openSeaListing = await this.getOpenSeaListing(collectionAddress);
      if (openSeaListing) {
        listings.push(openSeaListing);
      }

      // Analos Explorer (always available)
      listings.push({
        marketplace: 'analos-explorer',
        url: `https://explorer.analos.io/collection/${collectionAddress}`,
        verified: true
      });

    } catch (error) {
      logger.error('Failed to get collection listings:', error);
    }

    return listings;
  }

  /**
   * Get Magic Eden listing
   */
  private async getMagicEdenListing(collectionAddress: string): Promise<MarketplaceListing | null> {
    try {
      const response = await axios.get(
        `${this.magicEdenBaseUrl}/collections/${collectionAddress}`,
        {
          headers: {
            'Authorization': `Bearer ${this.magicEdenApiKey}`
          }
        }
      );

      if (response.status === 200) {
        return {
          marketplace: 'magic-eden',
          url: `https://magiceden.io/collections/analos/${collectionAddress}`,
          verified: true,
          floorPrice: response.data.floorPrice,
          volume: response.data.volume
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to get Magic Eden listing:', error);
      return null;
    }
  }

  /**
   * Get Tensor listing
   */
  private async getTensorListing(collectionAddress: string): Promise<MarketplaceListing | null> {
    try {
      // Tensor API integration would go here
      // For now, return a mock listing
      return {
        marketplace: 'tensor',
        url: `https://tensor.trade/collection/${collectionAddress}`,
        verified: false
      };
    } catch (error) {
      logger.error('Failed to get Tensor listing:', error);
      return null;
    }
  }

  /**
   * Get OpenSea listing
   */
  private async getOpenSeaListing(collectionAddress: string): Promise<MarketplaceListing | null> {
    try {
      // OpenSea API integration would go here
      // For now, return a mock listing
      return {
        marketplace: 'opensea',
        url: `https://opensea.io/collection/${collectionAddress}`,
        verified: false
      };
    } catch (error) {
      logger.error('Failed to get OpenSea listing:', error);
      return null;
    }
  }

  /**
   * Create shareable links for a collection
   */
  async createShareableLinks(collectionAddress: string, collectionName: string): Promise<{
    twitter: string;
    discord: string;
    telegram: string;
    direct: string;
  }> {
    const baseUrl = `https://launchonlos.com/collection/${collectionAddress}`;
    const encodedName = encodeURIComponent(collectionName);
    const encodedUrl = encodeURIComponent(baseUrl);

    return {
      twitter: `https://twitter.com/intent/tweet?text=Check%20out%20${encodedName}%20on%20Launch%20On%20Los!&url=${encodedUrl}`,
      discord: `https://discord.com/channels/@me`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=Check%20out%20${encodedName}%20on%20Launch%20On%20Los!`,
      direct: baseUrl
    };
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(collectionAddress: string): Promise<{
    totalListings: number;
    verifiedListings: number;
    averageFloorPrice: number;
    totalVolume: number;
    lastUpdated: Date;
  }> {
    try {
      const listings = await this.getCollectionListings(collectionAddress);
      const verifiedListings = listings.filter(l => l.verified);
      const floorPrices = listings
        .map(l => l.floorPrice)
        .filter(p => p !== undefined) as number[];

      return {
        totalListings: listings.length,
        verifiedListings: verifiedListings.length,
        averageFloorPrice: floorPrices.length > 0 
          ? floorPrices.reduce((sum, price) => sum + price, 0) / floorPrices.length 
          : 0,
        totalVolume: listings
          .map(l => l.volume || 0)
          .reduce((sum, volume) => sum + volume, 0),
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Failed to get marketplace stats:', error);
      throw new Error('Failed to fetch marketplace statistics');
    }
  }

  /**
   * Monitor collection for new listings
   */
  async monitorCollection(collectionAddress: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // In a real implementation, this would set up monitoring
      // For now, just log the request
      logger.info(`Started monitoring collection: ${collectionAddress}`);
      
      return {
        success: true,
        message: 'Collection monitoring started'
      };
    } catch (error) {
      logger.error('Failed to start collection monitoring:', error);
      return {
        success: false,
        message: 'Failed to start monitoring'
      };
    }
  }

  /**
   * Get trending collections
   */
  async getTrendingCollections(): Promise<Array<{
    address: string;
    name: string;
    symbol: string;
    floorPrice: number;
    volume24h: number;
    change24h: number;
    image: string;
  }>> {
    try {
      // In a real implementation, this would fetch from various marketplaces
      // For now, return mock data
      return [
        {
          address: 'mock-address-1',
          name: 'LOL Apes',
          symbol: 'LOLA',
          floorPrice: 1.2,
          volume24h: 5000,
          change24h: 15.5,
          image: 'https://arweave.net/mock-image-1'
        },
        {
          address: 'mock-address-2',
          name: 'LOL Punks',
          symbol: 'LOLP',
          floorPrice: 2.1,
          volume24h: 3200,
          change24h: -8.2,
          image: 'https://arweave.net/mock-image-2'
        }
      ];
    } catch (error) {
      logger.error('Failed to get trending collections:', error);
      return [];
    }
  }
}
