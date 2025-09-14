import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

// Collection Configuration Schema
export const CollectionConfigSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  description: z.string().max(500),
  supply: z.number().min(1).max(10000),
  mintPrice: z.number().min(0.001).max(10),
  royalties: z.number().min(0).max(25),
  whitelist: z.array(z.string()).optional(),
  traits: z.array(z.object({
    name: z.string(),
    type: z.string(),
    values: z.array(z.object({
      name: z.string(),
      weight: z.number().min(0).max(100),
      image: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
  })),
  images: z.array(z.object({
    layer: z.string(),
    trait: z.string(),
    value: z.string(),
    file: z.string(), // base64 or file path
    weight: z.number()
  })),
  creator: z.string(), // wallet address
  feeWallet: z.string().optional(),
  isPublic: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional()
});

export type CollectionConfig = z.infer<typeof CollectionConfigSchema>;

// NFT Metadata Schema
export const NFTMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  external_url: z.string().optional(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.union([z.string(), z.number()])
  })),
  properties: z.object({
    files: z.array(z.object({
      uri: z.string(),
      type: z.string()
    })),
    category: z.string().default('image'),
    creators: z.array(z.object({
      address: z.string(),
      share: z.number(),
      verified: z.boolean().default(false)
    }))
  }),
  collection: z.object({
    name: z.string(),
    family: z.string()
  }).optional()
});

export type NFTMetadata = z.infer<typeof NFTMetadataSchema>;

// Trait Configuration
export interface TraitConfig {
  name: string;
  type: string;
  values: TraitValue[];
}

export interface TraitValue {
  name: string;
  weight: number;
  image?: string;
  metadata?: Record<string, any>;
}

// Collection Status
export enum CollectionStatus {
  DRAFT = 'draft',
  UPLOADING = 'uploading',
  GENERATING = 'generating',
  DEPLOYING = 'deploying',
  READY = 'ready',
  MINTING = 'minting',
  SOLD_OUT = 'sold_out',
  ERROR = 'error'
}

// Collection Database Model
export interface Collection {
  id: string;
  config: CollectionConfig;
  status: CollectionStatus;
  mintAddress?: PublicKey;
  collectionAddress?: PublicKey;
  masterMintAddress?: PublicKey;
  metadataUri?: string;
  createdAt: Date;
  updatedAt: Date;
  totalMinted: number;
  totalRevenue: number;
  error?: string;
}

// Mint Request
export interface MintRequest {
  collectionId: string;
  walletAddress: string;
  quantity: number;
  signature?: string;
}

// Mint Response
export interface MintResponse {
  success: boolean;
  signature?: string;
  nftAddresses?: string[];
  error?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Rarity Configuration
export interface RarityConfig {
  traitType: string;
  traitValue: string;
  weight: number;
  rarity: number; // calculated percentage
}

// Generation Progress
export interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
  percentage: number;
}

// Wallet Connection
export interface WalletConnection {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  wallet: string | null;
}

// File Upload
export interface FileUpload {
  file: File;
  preview: string;
  layer: string;
  trait: string;
  value: string;
  weight: number;
}

// Collection Stats
export interface CollectionStats {
  totalSupply: number;
  minted: number;
  remaining: number;
  floorPrice?: number;
  volume?: number;
  holders?: number;
}

export interface MintConfig {
  phase: 'presale' | 'public';
  whitelist: string[];
  price: number;
  maxSupply: number;
  presalePrice?: number;
  presaleStart?: Date;
  publicStart?: Date;
  maxMintsPerWallet?: number;
  royalties: number;
}

export interface MintPhase {
  id: string;
  name: string;
  type: 'presale' | 'public';
  startTime: Date;
  endTime?: Date;
  price: number;
  maxMintsPerWallet: number;
  whitelist?: string[];
  isActive: boolean;
}

export interface MintRequest {
  collectionId: string;
  walletAddress: string;
  quantity: number;
  phase: string;
  signature?: string;
}

export interface MintResult {
  success: boolean;
  transactionSignature?: string;
  nftAddresses?: string[];
  error?: string;
  explorerUrl?: string;
}

export interface MarketplaceListing {
  marketplace: 'magic-eden' | 'tensor' | 'opensea' | 'analos-explorer';
  url: string;
  verified: boolean;
  floorPrice?: number;
  volume?: number;
}

// Error Types
export class CollectionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CollectionError';
  }
}

export class MintError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'MintError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Constants
export const ANALOS_RPC_URL = 'https://rpc.analos.io';
export const ANALOS_EXPLORER_URL = 'https://explorer.analos.io';
export const MAX_COLLECTION_SIZE = 10000;
export const MIN_MINT_PRICE = 0.001;
export const MAX_MINT_PRICE = 10;
export const DEFAULT_FEE_PERCENTAGE = 2.5;
export const BUNDLR_NETWORK_URL = 'https://node1.bundlr.network';

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp'
] as const;

export type SupportedFileType = typeof SUPPORTED_FILE_TYPES[number];
