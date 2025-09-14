/**
 * Rarity calculation and weighted random selection utilities
 */

export interface TraitWeight {
  [traitName: string]: number;
}

export interface LayerWeights {
  [layerName: string]: TraitWeight;
}

export class RarityUtils {
  /**
   * Select a trait based on weighted random selection
   */
  static selectWeightedTrait(traits: string[], weights: TraitWeight): string {
    if (traits.length === 0) {
      throw new Error('No traits available');
    }

    // If no weights provided, use equal weights
    if (Object.keys(weights).length === 0) {
      const randomIndex = Math.floor(Math.random() * traits.length);
      return traits[randomIndex];
    }

    // Calculate total weight
    const totalWeight = traits.reduce((sum, trait) => {
      return sum + (weights[trait] || 0);
    }, 0);

    if (totalWeight === 0) {
      // If all weights are 0, use equal weights
      const randomIndex = Math.floor(Math.random() * traits.length);
      return traits[randomIndex];
    }

    // Generate random number between 0 and totalWeight
    const random = Math.random() * totalWeight;

    // Find the trait that corresponds to this random number
    let currentWeight = 0;
    for (const trait of traits) {
      currentWeight += weights[trait] || 0;
      if (random <= currentWeight) {
        return trait;
      }
    }

    // Fallback to last trait (shouldn't happen)
    return traits[traits.length - 1];
  }

  /**
   * Calculate rarity percentage for a trait
   */
  static calculateRarityPercentage(trait: string, weights: TraitWeight, totalWeight: number): number {
    const traitWeight = weights[trait] || 0;
    return (traitWeight / totalWeight) * 100;
  }

  /**
   * Calculate rarity scores for all traits in a layer
   */
  static calculateLayerRarity(layerName: string, weights: TraitWeight): Array<{
    trait: string;
    weight: number;
    rarity: number;
  }> {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    if (totalWeight === 0) {
      return Object.keys(weights).map(trait => ({
        trait,
        weight: 0,
        rarity: 0
      }));
    }

    return Object.entries(weights).map(([trait, weight]) => ({
      trait,
      weight,
      rarity: this.calculateRarityPercentage(trait, weights, totalWeight)
    })).sort((a, b) => b.rarity - a.rarity);
  }

  /**
   * Calculate rarity scores for all layers
   */
  static calculateAllRarity(weights: LayerWeights): Array<{
    layer: string;
    traits: Array<{
      trait: string;
      weight: number;
      rarity: number;
    }>;
  }> {
    return Object.entries(weights).map(([layerName, layerWeights]) => ({
      layer: layerName,
      traits: this.calculateLayerRarity(layerName, layerWeights)
    }));
  }

  /**
   * Generate rarity distribution for a collection
   */
  static generateRarityDistribution(
    totalSupply: number,
    weights: LayerWeights
  ): Array<{
    combination: { [layerName: string]: string };
    rarity: number;
    count: number;
  }> {
    const combinations: Array<{
      combination: { [layerName: string]: string };
      rarity: number;
      count: number;
    }> = [];

    // Generate sample combinations to estimate rarity
    const sampleSize = Math.min(totalSupply * 10, 100000);
    
    for (let i = 0; i < sampleSize; i++) {
      const combination: { [layerName: string]: string } = {};
      let totalRarity = 0;

      for (const [layerName, layerWeights] of Object.entries(weights)) {
        const traits = Object.keys(layerWeights);
        const selectedTrait = this.selectWeightedTrait(traits, layerWeights);
        combination[layerName] = selectedTrait;
        
        // Add to total rarity
        const traitRarity = this.calculateRarityPercentage(selectedTrait, layerWeights, 
          Object.values(layerWeights).reduce((sum, w) => sum + w, 0));
        totalRarity += traitRarity;
      }

      // Check if this combination already exists
      const existingIndex = combinations.findIndex(c => 
        JSON.stringify(c.combination) === JSON.stringify(combination)
      );

      if (existingIndex >= 0) {
        combinations[existingIndex].count++;
      } else {
        combinations.push({
          combination,
          rarity: totalRarity / Object.keys(weights).length, // Average rarity
          count: 1
        });
      }
    }

    // Sort by rarity (highest first)
    return combinations.sort((a, b) => b.rarity - a.rarity);
  }

  /**
   * Ensure unique combinations (remove duplicates)
   */
  static ensureUniqueCombinations(
    combinations: Array<{ [layerName: string]: string }>,
    maxSupply: number
  ): Array<{ [layerName: string]: string }> {
    const uniqueCombinations: Array<{ [layerName: string]: string }> = [];
    const seen = new Set<string>();

    for (const combination of combinations) {
      const key = JSON.stringify(combination);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCombinations.push(combination);
        
        if (uniqueCombinations.length >= maxSupply) {
          break;
        }
      }
    }

    return uniqueCombinations;
  }

  /**
   * Generate rarity tiers (Common, Uncommon, Rare, etc.)
   */
  static generateRarityTiers(combinations: Array<{ rarity: number; count: number }>): {
    [tier: string]: {
      minRarity: number;
      maxRarity: number;
      count: number;
      percentage: number;
    };
  } {
    const totalCount = combinations.reduce((sum, c) => sum + c.count, 0);
    const sortedCombinations = combinations.sort((a, b) => b.rarity - a.rarity);

    const tiers = {
      'Legendary': { minRarity: 90, maxRarity: 100, count: 0, percentage: 0 },
      'Epic': { minRarity: 70, maxRarity: 89.99, count: 0, percentage: 0 },
      'Rare': { minRarity: 40, maxRarity: 69.99, count: 0, percentage: 0 },
      'Uncommon': { minRarity: 20, maxRarity: 39.99, count: 0, percentage: 0 },
      'Common': { minRarity: 0, maxRarity: 19.99, count: 0, percentage: 0 }
    };

    for (const combination of sortedCombinations) {
      for (const [tierName, tier] of Object.entries(tiers)) {
        if (combination.rarity >= tier.minRarity && combination.rarity <= tier.maxRarity) {
          tier.count += combination.count;
          break;
        }
      }
    }

    // Calculate percentages
    for (const tier of Object.values(tiers)) {
      tier.percentage = (tier.count / totalCount) * 100;
    }

    return tiers;
  }

  /**
   * Validate rarity configuration
   */
  static validateRarityConfig(weights: LayerWeights): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const [layerName, layerWeights] of Object.entries(weights)) {
      const totalWeight = Object.values(layerWeights).reduce((sum, weight) => sum + weight, 0);
      
      if (totalWeight === 0) {
        errors.push(`Layer "${layerName}" has no valid weights`);
      }

      // Check for negative weights
      for (const [trait, weight] of Object.entries(layerWeights)) {
        if (weight < 0) {
          errors.push(`Trait "${trait}" in layer "${layerName}" has negative weight`);
        }
      }

      // Check for very high weights that might cause issues
      const maxWeight = Math.max(...Object.values(layerWeights));
      if (maxWeight > 1000) {
        errors.push(`Layer "${layerName}" has very high weights (max: ${maxWeight})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Normalize weights to ensure they sum to 100
   */
  static normalizeWeights(weights: LayerWeights): LayerWeights {
    const normalized: LayerWeights = {};

    for (const [layerName, layerWeights] of Object.entries(weights)) {
      const totalWeight = Object.values(layerWeights).reduce((sum, weight) => sum + weight, 0);
      
      if (totalWeight === 0) {
        // If no weights, use equal weights
        const traits = Object.keys(layerWeights);
        const equalWeight = 100 / traits.length;
        normalized[layerName] = {};
        for (const trait of traits) {
          normalized[layerName][trait] = equalWeight;
        }
      } else {
        // Normalize to sum to 100
        normalized[layerName] = {};
        for (const [trait, weight] of Object.entries(layerWeights)) {
          normalized[layerName][trait] = (weight / totalWeight) * 100;
        }
      }
    }

    return normalized;
  }

  /**
   * Generate preview of rarity distribution
   */
  static generateRarityPreview(
    weights: LayerWeights,
    sampleSize: number = 1000
  ): {
    totalCombinations: number;
    estimatedUnique: number;
    rarityDistribution: Array<{
      tier: string;
      count: number;
      percentage: number;
    }>;
  } {
    // Calculate total possible combinations
    const totalCombinations = Object.values(weights).reduce((total, layerWeights) => {
      return total * Object.keys(layerWeights).length;
    }, 1);

    // Generate sample combinations
    const sampleCombinations: Array<{ rarity: number }> = [];
    
    for (let i = 0; i < sampleSize; i++) {
      let totalRarity = 0;
      
      for (const [layerName, layerWeights] of Object.entries(weights)) {
        const traits = Object.keys(layerWeights);
        const selectedTrait = this.selectWeightedTrait(traits, layerWeights);
        const traitRarity = this.calculateRarityPercentage(selectedTrait, layerWeights,
          Object.values(layerWeights).reduce((sum, w) => sum + w, 0));
        totalRarity += traitRarity;
      }
      
      sampleCombinations.push({
        rarity: totalRarity / Object.keys(weights).length
      });
    }

    // Generate rarity tiers
    const rarityTiers = this.generateRarityTiers(sampleCombinations.map(c => ({ rarity: c.rarity, count: 1 })));

    return {
      totalCombinations,
      estimatedUnique: Math.min(totalCombinations, sampleSize),
      rarityDistribution: Object.entries(rarityTiers).map(([tier, data]) => ({
        tier,
        count: data.count,
        percentage: data.percentage
      }))
    };
  }
}
