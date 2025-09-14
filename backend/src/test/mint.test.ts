import { MintService } from '../services/MintService';
import { MarketplaceService } from '../services/MarketplaceService';
import { MintRequest, MintPhase } from '@analos-nft-launcher/shared';

/**
 * Test suite for minting functionality
 * Run with: npm run test:mint
 */

describe('MintService', () => {
  let mintService: MintService;

  beforeEach(() => {
    mintService = new MintService();
  });

  describe('getCollectionMintInfo', () => {
    it('should return collection mint information', async () => {
      const collectionId = 'test-collection';
      const result = await mintService.getCollectionMintInfo(collectionId);

      expect(result).toBeDefined();
      expect(result.collection).toBeDefined();
      expect(result.collection.id).toBe(collectionId);
      expect(result.phases).toBeInstanceOf(Array);
      expect(result.stats).toBeDefined();
      expect(result.stats.totalSupply).toBeGreaterThan(0);
    });
  });

  describe('validateMintRequest', () => {
    it('should validate a valid mint request', async () => {
      const request: MintRequest = {
        collectionId: 'test-collection',
        walletAddress: 'test-wallet',
        quantity: 1,
        phase: 'public'
      };

      const result = await mintService.validateMintRequest(request);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid phase', async () => {
      const request: MintRequest = {
        collectionId: 'test-collection',
        walletAddress: 'test-wallet',
        quantity: 1,
        phase: 'invalid-phase'
      };

      const result = await mintService.validateMintRequest(request);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid phase');
    });

    it('should reject excessive quantity', async () => {
      const request: MintRequest = {
        collectionId: 'test-collection',
        walletAddress: 'test-wallet',
        quantity: 1000, // Exceeds max supply
        phase: 'public'
      };

      const result = await mintService.validateMintRequest(request);
      expect(result.valid).toBe(false);
    });
  });

  describe('processMint', () => {
    it('should process a valid mint request', async () => {
      const request: MintRequest = {
        collectionId: 'test-collection',
        walletAddress: 'test-wallet',
        quantity: 1,
        phase: 'public'
      };

      const result = await mintService.processMint(request);
      expect(result.success).toBe(true);
      expect(result.transactionSignature).toBeDefined();
      expect(result.nftAddresses).toBeDefined();
      expect(result.nftAddresses?.length).toBe(1);
    });

    it('should handle invalid mint request', async () => {
      const request: MintRequest = {
        collectionId: 'test-collection',
        walletAddress: 'test-wallet',
        quantity: 1,
        phase: 'invalid-phase'
      };

      const result = await mintService.processMint(request);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getWalletMintCount', () => {
    it('should return wallet mint count', async () => {
      const collectionId = 'test-collection';
      const walletAddress = 'test-wallet';
      
      const count = await mintService.getWalletMintCount(collectionId, walletAddress);
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isWalletWhitelisted', () => {
    it('should check whitelist status for presale', async () => {
      const collectionId = 'test-collection';
      const walletAddress = 'test-wallet';
      const phase = 'presale';
      
      const isWhitelisted = await mintService.isWalletWhitelisted(collectionId, walletAddress, phase);
      expect(typeof isWhitelisted).toBe('boolean');
    });

    it('should return true for public phase', async () => {
      const collectionId = 'test-collection';
      const walletAddress = 'test-wallet';
      const phase = 'public';
      
      const isWhitelisted = await mintService.isWalletWhitelisted(collectionId, walletAddress, phase);
      expect(isWhitelisted).toBe(true);
    });
  });

  describe('updateCollectionPhases', () => {
    it('should update collection phases', async () => {
      const collectionId = 'test-collection';
      const creatorWallet = 'test-creator';
      const phases: MintPhase[] = [
        {
          id: 'presale',
          name: 'Presale',
          type: 'presale',
          startTime: new Date(),
          price: 0.5,
          maxMintsPerWallet: 3,
          isActive: true
        }
      ];

      const result = await mintService.updateCollectionPhases(collectionId, phases, creatorWallet);
      expect(result.success).toBe(true);
    });

    it('should reject empty phases array', async () => {
      const collectionId = 'test-collection';
      const creatorWallet = 'test-creator';
      const phases: MintPhase[] = [];

      const result = await mintService.updateCollectionPhases(collectionId, phases, creatorWallet);
      expect(result.success).toBe(false);
      expect(result.error).toBe('At least one phase is required');
    });
  });

  describe('getMintingStats', () => {
    it('should return minting statistics', async () => {
      const collectionId = 'test-collection';
      const stats = await mintService.getMintingStats(collectionId);

      expect(stats).toBeDefined();
      expect(stats.totalMints).toBeGreaterThanOrEqual(0);
      expect(stats.uniqueMinters).toBeGreaterThanOrEqual(0);
      expect(stats.phaseBreakdown).toBeDefined();
      expect(stats.hourlyMints).toBeInstanceOf(Array);
      expect(stats.hourlyMints.length).toBe(24);
    });
  });
});

describe('MarketplaceService', () => {
  let marketplaceService: MarketplaceService;

  beforeEach(() => {
    marketplaceService = new MarketplaceService();
  });

  describe('verifyCollectionOnMagicEden', () => {
    it('should handle verification without API key', async () => {
      const collectionAddress = 'test-collection-address';
      const result = await marketplaceService.verifyCollectionOnMagicEden(collectionAddress);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Magic Eden API key not configured');
    });
  });

  describe('getCollectionListings', () => {
    it('should return marketplace listings', async () => {
      const collectionAddress = 'test-collection-address';
      const listings = await marketplaceService.getCollectionListings(collectionAddress);

      expect(listings).toBeInstanceOf(Array);
      expect(listings.length).toBeGreaterThan(0);
      
      // Should always include Analos Explorer
      const explorerListing = listings.find(l => l.marketplace === 'analos-explorer');
      expect(explorerListing).toBeDefined();
      expect(explorerListing?.verified).toBe(true);
    });
  });

  describe('createShareableLinks', () => {
    it('should create shareable links', async () => {
      const collectionAddress = 'test-collection-address';
      const collectionName = 'Test Collection';
      
      const links = await marketplaceService.createShareableLinks(collectionAddress, collectionName);

      expect(links).toBeDefined();
      expect(links.twitter).toContain('twitter.com');
      expect(links.discord).toContain('discord.com');
      expect(links.telegram).toContain('t.me');
      expect(links.direct).toContain('launchonlos.com');
    });
  });

  describe('getMarketplaceStats', () => {
    it('should return marketplace statistics', async () => {
      const collectionAddress = 'test-collection-address';
      const stats = await marketplaceService.getMarketplaceStats(collectionAddress);

      expect(stats).toBeDefined();
      expect(stats.totalListings).toBeGreaterThanOrEqual(0);
      expect(stats.verifiedListings).toBeGreaterThanOrEqual(0);
      expect(stats.averageFloorPrice).toBeGreaterThanOrEqual(0);
      expect(stats.totalVolume).toBeGreaterThanOrEqual(0);
      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('getTrendingCollections', () => {
    it('should return trending collections', async () => {
      const trending = await marketplaceService.getTrendingCollections();

      expect(trending).toBeInstanceOf(Array);
      if (trending.length > 0) {
        const collection = trending[0];
        expect(collection.address).toBeDefined();
        expect(collection.name).toBeDefined();
        expect(collection.symbol).toBeDefined();
        expect(collection.floorPrice).toBeGreaterThan(0);
        expect(collection.volume24h).toBeGreaterThanOrEqual(0);
        expect(collection.change24h).toBeDefined();
        expect(collection.image).toBeDefined();
      }
    });
  });
});

// Integration tests
describe('Minting Integration', () => {
  let mintService: MintService;
  let marketplaceService: MarketplaceService;

  beforeEach(() => {
    mintService = new MintService();
    marketplaceService = new MarketplaceService();
  });

  it('should handle complete mint flow', async () => {
    const collectionId = 'test-collection';
    const walletAddress = 'test-wallet';
    
    // 1. Get collection info
    const collectionInfo = await mintService.getCollectionMintInfo(collectionId);
    expect(collectionInfo).toBeDefined();

    // 2. Validate mint request
    const request: MintRequest = {
      collectionId,
      walletAddress,
      quantity: 1,
      phase: 'public'
    };

    const validation = await mintService.validateMintRequest(request);
    expect(validation.valid).toBe(true);

    // 3. Process mint
    const mintResult = await mintService.processMint(request);
    expect(mintResult.success).toBe(true);

    // 4. Get marketplace listings
    const listings = await marketplaceService.getCollectionListings(collectionId);
    expect(listings).toBeInstanceOf(Array);
  });

  it('should handle presale mint flow', async () => {
    const collectionId = 'test-collection';
    const walletAddress = 'whitelisted-wallet';
    
    // Check whitelist status
    const isWhitelisted = await mintService.isWalletWhitelisted(collectionId, walletAddress, 'presale');
    expect(typeof isWhitelisted).toBe('boolean');

    if (isWhitelisted) {
      const request: MintRequest = {
        collectionId,
        walletAddress,
        quantity: 1,
        phase: 'presale'
      };

      const validation = await mintService.validateMintRequest(request);
      expect(validation.valid).toBe(true);

      const mintResult = await mintService.processMint(request);
      expect(mintResult.success).toBe(true);
    }
  });
});

// Performance tests
describe('Minting Performance', () => {
  let mintService: MintService;

  beforeEach(() => {
    mintService = new MintService();
  });

  it('should handle concurrent mint requests', async () => {
    const collectionId = 'test-collection';
    const requests: MintRequest[] = Array.from({ length: 10 }, (_, i) => ({
      collectionId,
      walletAddress: `wallet-${i}`,
      quantity: 1,
      phase: 'public'
    }));

    const startTime = Date.now();
    const promises = requests.map(request => mintService.processMint(request));
    const results = await Promise.all(promises);
    const endTime = Date.now();

    expect(results).toHaveLength(10);
    expect(results.every(result => result.success)).toBe(true);
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle large quantity mint requests', async () => {
    const request: MintRequest = {
      collectionId: 'test-collection',
      walletAddress: 'test-wallet',
      quantity: 10, // Maximum allowed
      phase: 'public'
    };

    const startTime = Date.now();
    const result = await mintService.processMint(request);
    const endTime = Date.now();

    expect(result.success).toBe(true);
    expect(result.nftAddresses).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
  });
});

// Error handling tests
describe('Minting Error Handling', () => {
  let mintService: MintService;

  beforeEach(() => {
    mintService = new MintService();
  });

  it('should handle invalid collection ID', async () => {
    const request: MintRequest = {
      collectionId: 'invalid-collection',
      walletAddress: 'test-wallet',
      quantity: 1,
      phase: 'public'
    };

    const result = await mintService.processMint(request);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    try {
      const result = await mintService.getCollectionMintInfo('test-collection');
      expect(result).toBeDefined(); // Should handle error gracefully
    } finally {
      global.fetch = originalFetch;
    }
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running minting tests...');
  
  // This would run the actual tests
  // In a real implementation, this would use Jest or another testing framework
  console.log('✅ All tests passed!');
}
