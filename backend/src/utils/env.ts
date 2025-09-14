import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export function validateEnv() {
  const requiredEnvVars = [
    'RPC_URL',
    'EXPLORER_URL',
    'WALLET_PRIVATE_KEY',
    'FEE_WALLET'
  ];

  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate RPC URL format
  try {
    new URL(process.env.RPC_URL!);
  } catch {
    throw new Error('Invalid RPC_URL format. Must be a valid URL.');
  }

  // Validate Explorer URL format
  try {
    new URL(process.env.EXPLORER_URL!);
  } catch {
    throw new Error('Invalid EXPLORER_URL format. Must be a valid URL.');
  }

  // Validate wallet private key (should be base58 encoded)
  if (process.env.WALLET_PRIVATE_KEY!.length < 32) {
    throw new Error('WALLET_PRIVATE_KEY appears to be invalid. Should be a base58 encoded private key.');
  }

  console.log('✅ Environment variables validated successfully');
}

export const config = {
  // Blockchain configuration
  rpcUrl: process.env.RPC_URL!,
  explorerUrl: process.env.EXPLORER_URL!,
  chainId: process.env.CHAIN_ID || 'analos',
  
  // Wallet configuration
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY!,
  feeWallet: process.env.FEE_WALLET!,
  
  // Storage configuration
  bundlrNetworkUrl: process.env.BUNDLR_NETWORK_URL || 'https://node1.bundlr.network',
  arweaveWalletPrivateKey: process.env.ARWEAVE_WALLET_PRIVATE_KEY,
  
  // Server configuration
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // File upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/png,image/jpeg,image/gif,image/webp').split(','),
  
  // Collection settings
  maxCollectionSize: parseInt(process.env.MAX_COLLECTION_SIZE || '10000'),
  minMintPrice: parseFloat(process.env.MIN_MINT_PRICE || '0.001'),
  maxMintPrice: parseFloat(process.env.MAX_MINT_PRICE || '10'),
  defaultFeePercentage: parseFloat(process.env.DEFAULT_FEE_PERCENTAGE || '2.5'),
  
  // Feature flags
  features: {
    enableWhitelist: process.env.ENABLE_WHITELIST !== 'false',
    enableRoyalties: process.env.ENABLE_ROYALTIES !== 'false',
    enableBurning: process.env.ENABLE_BURNING !== 'false',
    enableUpdates: process.env.ENABLE_UPDATES !== 'false',
  }
};
