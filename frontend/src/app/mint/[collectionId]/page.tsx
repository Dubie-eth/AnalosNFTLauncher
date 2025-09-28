'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useParams } from 'next/navigation';

interface MintResult {
  mintAddress: string;
  metadataUri: string;
  transactionSignature: string;
  explorerUrl: string;
  estimatedCost: number;
  currency?: string;
  imageInfo: {
    size: number;
    format: string;
    optimized: boolean;
  };
  nft: {
    name: string;
    description: string;
    image: string;
  };
}

interface MintStatus {
  isOpenMint: boolean;
  canMint: boolean;
  mintedCount: number;
  totalMinted: number;
  mintPrice: number;
  currency: string;
  isMintingActive: boolean;
  mintStartTime: string;
  feeWalletAddress: string;
}

interface CollectionData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalSupply: number;
  mintPrice: number;
  currency: string;
  adminWallet: string;
  deployedAt: string;
  isActive: boolean;
  collectionMintAddress?: string;
  collectionMetadataUri?: string;
  blockchainInfo?: {
    network: string;
    rpcUrl: string;
    explorerUrl: string;
    deployed: boolean;
    verified: boolean;
  };
}

export default function CollectionMintPage() {
  const { publicKey, connected } = useWallet();
  const params = useParams();
  const collectionId = params.collectionId as string;
  
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftName, setNftName] = useState('Analos NFT');
  const [nftDescription, setNftDescription] = useState('A unique NFT minted on the Analos blockchain');
  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);
  const [isCheckingMintStatus, setIsCheckingMintStatus] = useState(false);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);

  const generateRandomImage = () => {
    return `https://picsum.photos/500/500?random=${Date.now()}`;
  };

  // Helper function to safely check if minting is allowed
  const canUserMint = (): boolean => {
    if (!connected || isMinting || !nftName.trim()) {
      return false;
    }
    if (mintStatus === null) {
      return true; // Default to allowing mint if status is not loaded yet
    }
    return mintStatus.canMint;
  };

  // Load collection data (mock for now)
  useEffect(() => {
    const loadCollectionData = async () => {
      setIsLoadingCollection(true);
      try {
        // Mock collection data - in real implementation, fetch from backend
        const mockCollectionData: CollectionData = {
          id: collectionId,
          name: 'Analos Collection',
          description: 'A unique NFT collection on the Analos blockchain',
          imageUrl: generateRandomImage(),
          totalSupply: 1000,
          mintPrice: 100,
          currency: '$LOS',
          adminWallet: 'EmioyGerkTLmGST11cpboakmoE7Y5fraHCtosVu8xpcR',
          deployedAt: new Date().toISOString(),
          isActive: true
        };
        setCollectionData(mockCollectionData);
      } catch (error) {
        console.error('Error loading collection:', error);
        setError('Failed to load collection data');
      } finally {
        setIsLoadingCollection(false);
      }
    };

    if (collectionId) {
      loadCollectionData();
    }
  }, [collectionId]);

  const checkMintStatus = async (walletAddress: string) => {
    setIsCheckingMintStatus(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/mint-status/${walletAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setMintStatus(data.data);
      } else {
        console.error('Failed to check mint status:', data.error);
      }
    } catch (error) {
      console.error('Error checking mint status:', error);
    } finally {
      setIsCheckingMintStatus(false);
    }
  };

  // Check mint status when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkMintStatus(publicKey.toString());
    }
  }, [connected, publicKey]);

  const handleMint = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!nftName.trim()) {
      setError('Please enter an NFT name');
      return;
    }

    setIsMinting(true);
    setError(null);
    setMintResult(null);

    try {
      // Create JSON payload (no file upload)
      const payload = {
        name: nftName.trim(),
        description: nftDescription.trim(),
        walletAddress: publicKey.toString(),
        imageUrl: collectionData?.imageUrl || generateRandomImage(),
        collectionId: collectionId
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      setMintResult(data.data);
      
      // Refresh mint status after successful minting
      if (publicKey) {
        checkMintStatus(publicKey.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoadingCollection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collectionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Collection Not Found</h1>
          <p className="text-gray-300 text-lg">The collection "{collectionId}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Mint {collectionData.name}
            </h1>
            <p className="text-gray-300 text-lg">
              Collection ID: <span className="font-mono text-blue-400">{collectionId}</span>
            </p>
            <p className="text-gray-300 text-sm mt-2">
              {collectionData.description}
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Connect Wallet
                </h2>
                <p className="text-gray-300">
                  Connect your wallet to mint NFTs on Analos
                </p>
              </div>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
            </div>
            
            {/* Open Mint Status */}
            {connected && publicKey && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                {isCheckingMintStatus ? (
                  <div className="flex items-center text-gray-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking mint status...
                  </div>
                ) : mintStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Mint Price:</span>
                      <span className="text-green-400 font-semibold">
                        {mintStatus.mintPrice} {mintStatus.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Your Mints:</span>
                      <span className="text-blue-400 font-semibold">
                        {mintStatus.mintedCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Total Minted:</span>
                      <span className="text-purple-400 font-semibold">
                        {mintStatus.totalMinted}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className={`font-semibold ${mintStatus.isMintingActive ? 'text-green-400' : 'text-red-400'}`}>
                        {mintStatus.isMintingActive ? '🟢 LIVE' : '🔴 ENDED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Fee Wallet:</span>
                      <span className="text-yellow-400 font-mono text-xs">
                        {mintStatus.feeWalletAddress.slice(0, 8)}...{mintStatus.feeWalletAddress.slice(-8)}
                      </span>
                    </div>
                    {mintStatus && !mintStatus.canMint && !mintStatus.isMintingActive && (
                      <div className="text-red-400 text-sm">
                        🚫 Minting has ended
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Collection Display */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              🎨 Collection NFT
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Collection Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    NFT Name *
                  </label>
                  <input
                    type="text"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter NFT name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your NFT..."
                  />
                </div>
              </div>

              {/* Right Column - Collection Image */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collection Image
                </label>
                
                {/* Collection Image */}
                <div className="relative">
                  <img
                    src={collectionData.imageUrl}
                    alt="Collection NFT"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                    {collectionData.name}
                  </div>
                </div>

                {/* Collection Info */}
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                  <p className="text-blue-200 text-sm">
                    🎨 <strong>Collection:</strong> {collectionData.name}
                  </p>
                  <p className="text-blue-200 text-sm">
                    📊 <strong>Total Supply:</strong> {collectionData.totalSupply}
                  </p>
                  <p className="text-blue-200 text-sm">
                    💰 <strong>Price:</strong> {collectionData.mintPrice} {collectionData.currency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleMint}
              disabled={!canUserMint()}
              className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform ${
                canUserMint()
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isMinting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Minting NFT...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Mint Collection NFT ({collectionData.mintPrice} {collectionData.currency})
                </div>
              )}
            </button>
            
            {!connected && (
              <p className="text-gray-400 text-sm mt-2">
                Connect your wallet to start minting
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {mintResult && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-200 mb-4">
                🎉 NFT Minted Successfully!
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-300">NFT Name:</span>
                  <span className="text-white ml-2">{mintResult.nft.name}</span>
                </div>
                
                <div>
                  <span className="text-gray-300">Mint Address:</span>
                  <span className="text-white ml-2 font-mono text-sm">
                    {mintResult.mintAddress}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-300">Transaction:</span>
                  <a
                    href={mintResult.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2 underline"
                  >
                    View on Explorer
                  </a>
                </div>

                <div>
                  <span className="text-gray-300">Mint Cost:</span>
                  <span className="text-green-400 ml-2 font-semibold">
                    {mintResult.estimatedCost} {mintResult.currency || '$LOS'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <img
                  src={mintResult.nft.image}
                  alt={mintResult.nft.name}
                  className="w-32 h-32 rounded-lg mx-auto object-cover"
                />
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mt-6">
            <div className="text-center text-gray-400 text-sm space-y-1">
              <p>🌐 Network: Analos</p>
              <p>🔗 RPC: https://rpc.analos.io</p>
              <p>🔍 Explorer: https://explorer.analos.io</p>
              <p className="text-yellow-400">💰 Fees: {collectionData.mintPrice} {collectionData.currency} → {collectionData.adminWallet.slice(0, 8)}...{collectionData.adminWallet.slice(-8)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
