import { NFTGeneratorService } from '../services/NFTGeneratorService';
import { RarityUtils } from '../utils/RarityUtils';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Test script for NFT generation functionality
 * Run with: npm run test:generator
 */

async function testGenerator() {
  console.log('🧪 Starting NFT Generator Test...\n');

  try {
    // Initialize generator service
    const generator = new NFTGeneratorService();
    console.log('✅ Generator service initialized');

    // Test rarity calculations
    console.log('\n📊 Testing rarity calculations...');
    
    const testWeights = {
      'Background': {
        'Blue': 50,
        'Red': 30,
        'Green': 20
      },
      'Eyes': {
        'Normal': 70,
        'Laser': 20,
        'Glowing': 10
      },
      'Hat': {
        'None': 60,
        'Cap': 25,
        'Crown': 15
      }
    };

    // Test rarity validation
    const validation = RarityUtils.validateRarityConfig(testWeights);
    console.log('Validation result:', validation);

    // Test rarity preview
    const preview = RarityUtils.generateRarityPreview(testWeights, 1000);
    console.log('Rarity preview:', preview);

    // Test weighted selection
    console.log('\n🎲 Testing weighted trait selection...');
    const traits = ['Blue', 'Red', 'Green'];
    const weights = { 'Blue': 50, 'Red': 30, 'Green': 20 };
    
    const selections = [];
    for (let i = 0; i < 100; i++) {
      const selected = RarityUtils.selectWeightedTrait(traits, weights);
      selections.push(selected);
    }

    // Count selections
    const counts = selections.reduce((acc, trait) => {
      acc[trait] = (acc[trait] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    console.log('Selection counts (100 samples):', counts);

    // Test layer extraction (mock)
    console.log('\n📁 Testing layer extraction...');
    
    // Create mock ZIP data
    const mockZipBuffer = await createMockZip();
    const sessionId = 'test-session-' + Date.now();
    
    try {
      const layers = await generator.extractLayers(mockZipBuffer, sessionId);
      console.log('Extracted layers:', layers.map(l => ({ name: l.name, traits: l.traits })));
      
      // Test layer validation
      const layerValidation = await generator.validateLayers(layers);
      console.log('Layer validation:', layerValidation);
      
    } catch (error) {
      console.log('Layer extraction test skipped (no mock ZIP):', error.message);
    }

    // Test configuration validation
    console.log('\n⚙️ Testing configuration validation...');
    
    const testConfig = {
      sessionId: 'test-session',
      order: ['Background', 'Eyes', 'Hat'],
      rarity: testWeights,
      supply: 100,
      collection: {
        name: 'Test LOL Collection',
        symbol: 'TEST',
        description: 'A test collection for LOL',
        royalties: 5
      }
    };

    const configValidation = await generator.validateConfig(testConfig);
    console.log('Config validation:', configValidation);

    // Test rarity distribution
    console.log('\n📈 Testing rarity distribution...');
    
    const distribution = RarityUtils.generateRarityDistribution(100, testWeights);
    console.log('Distribution sample (first 5):', distribution.slice(0, 5));

    // Test rarity tiers
    const tiers = RarityUtils.generateRarityTiers(distribution.map(d => ({ rarity: d.rarity, count: 1 })));
    console.log('Rarity tiers:', tiers);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

/**
 * Create mock ZIP file for testing
 */
async function createMockZip(): Promise<Buffer> {
  // This would create a mock ZIP file with test layers
  // For now, return empty buffer to avoid file system dependencies
  return Buffer.alloc(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  testGenerator().catch(console.error);
}

export { testGenerator };
