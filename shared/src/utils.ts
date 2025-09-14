import { PublicKey } from '@solana/web3.js';
import { CollectionConfig, TraitValue, RarityConfig } from './types';

/**
 * Generate a random trait combination based on weights
 */
export function generateTraitCombination(traits: { [key: string]: TraitValue[] }): { [key: string]: string } {
  const combination: { [key: string]: string } = {};
  
  for (const [traitType, values] of Object.entries(traits)) {
    const totalWeight = values.reduce((sum, value) => sum + value.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const value of values) {
      currentWeight += value.weight;
      if (random <= currentWeight) {
        combination[traitType] = value.name;
        break;
      }
    }
  }
  
  return combination;
}

/**
 * Calculate rarity percentages for traits
 */
export function calculateRarity(traits: { [key: string]: TraitValue[] }): RarityConfig[] {
  const rarityConfigs: RarityConfig[] = [];
  
  for (const [traitType, values] of Object.entries(traits)) {
    const totalWeight = values.reduce((sum, value) => sum + value.weight, 0);
    
    for (const value of values) {
      const rarity = (value.weight / totalWeight) * 100;
      rarityConfigs.push({
        traitType,
        traitValue: value.name,
        weight: value.weight,
        rarity: Math.round(rarity * 100) / 100
      });
    }
  }
  
  return rarityConfigs.sort((a, b) => b.rarity - a.rarity);
}

/**
 * Generate unique trait combinations for a collection
 */
export function generateUniqueCombinations(
  traits: { [key: string]: TraitValue[] },
  maxSupply: number
): { [key: string]: string }[] {
  const combinations: { [key: string]: string }[] = [];
  const seen = new Set<string>();
  const maxAttempts = maxSupply * 10; // Prevent infinite loops
  let attempts = 0;
  
  while (combinations.length < maxSupply && attempts < maxAttempts) {
    const combination = generateTraitCombination(traits);
    const key = JSON.stringify(combination);
    
    if (!seen.has(key)) {
      seen.add(key);
      combinations.push(combination);
    }
    
    attempts++;
  }
  
  // If we couldn't generate enough unique combinations, fill with random ones
  while (combinations.length < maxSupply) {
    combinations.push(generateTraitCombination(traits));
  }
  
  return combinations;
}

/**
 * Validate collection configuration
 */
export function validateCollectionConfig(config: CollectionConfig): string[] {
  const errors: string[] = [];
  
  if (!config.name || config.name.length < 1 || config.name.length > 32) {
    errors.push('Collection name must be between 1 and 32 characters');
  }
  
  if (!config.symbol || config.symbol.length < 1 || config.symbol.length > 10) {
    errors.push('Collection symbol must be between 1 and 10 characters');
  }
  
  if (config.supply < 1 || config.supply > 10000) {
    errors.push('Supply must be between 1 and 10,000');
  }
  
  if (config.mintPrice < 0.001 || config.mintPrice > 10) {
    errors.push('Mint price must be between 0.001 and 10 ANALOS');
  }
  
  if (config.royalties < 0 || config.royalties > 25) {
    errors.push('Royalties must be between 0 and 25%');
  }
  
  if (!config.traits || config.traits.length === 0) {
    errors.push('At least one trait category is required');
  }
  
  // Validate traits
  for (const trait of config.traits) {
    if (!trait.name || trait.name.length === 0) {
      errors.push('Trait name cannot be empty');
    }
    
    if (!trait.values || trait.values.length === 0) {
      errors.push(`Trait "${trait.name}" must have at least one value`);
    }
    
    const totalWeight = trait.values.reduce((sum, value) => sum + value.weight, 0);
    if (totalWeight === 0) {
      errors.push(`Trait "${trait.name}" must have at least one value with weight > 0`);
    }
  }
  
  return errors;
}

/**
 * Generate collection ID
 */
export function generateCollectionId(): string {
  return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format SOL/ANALOS amount
 */
export function formatAmount(amount: number, decimals: number = 9): string {
  return (amount / Math.pow(10, decimals)).toFixed(4);
}

/**
 * Parse SOL/ANALOS amount
 */
export function parseAmount(amount: string, decimals: number = 9): number {
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

/**
 * Generate metadata URI
 */
export function generateMetadataUri(collectionId: string, tokenId: number): string {
  return `https://metadata.analos-nft-launcher.com/${collectionId}/${tokenId}.json`;
}

/**
 * Generate collection URI
 */
export function generateCollectionUri(collectionId: string): string {
  return `https://metadata.analos-nft-launcher.com/${collectionId}/collection.json`;
}

/**
 * Check if address is valid Solana/Analos address
 */
export function isValidAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Generate explorer URL for transaction
 */
export function getExplorerTxUrl(signature: string): string {
  return `https://explorer.analos.io/tx/${signature}`;
}

/**
 * Generate explorer URL for address
 */
export function getExplorerAddressUrl(address: string): string {
  return `https://explorer.analos.io/address/${address}`;
}

/**
 * Calculate mint cost including fees
 */
export function calculateMintCost(mintPrice: number, feePercentage: number = 2.5): number {
  return mintPrice + (mintPrice * feePercentage / 100);
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Generate trait hash for uniqueness
 */
export function generateTraitHash(combination: { [key: string]: string }): string {
  const sorted = Object.keys(combination)
    .sort()
    .map(key => `${key}:${combination[key]}`)
    .join('|');
  
  return btoa(sorted).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}
