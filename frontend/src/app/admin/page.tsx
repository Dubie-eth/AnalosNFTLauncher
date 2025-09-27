'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface CollectionData {
  name: string;
  description: string;
  imageUrl: string;
  totalSupply: number;
  mintPrice: number;
  currency: string;
}

interface DeployResult {
  success: boolean;
  collectionId: string;
  mintPageUrl: string;
  message: string;
}

export default function AdminPage() {
  const { publicKey, connected } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [collectionData, setCollectionData] = useState<CollectionData>({
    name: 'My Analos Collection',
    description: 'A unique NFT collection on the Analos blockchain',
    imageUrl: 'https://picsum.photos/500/500?random=1',
    totalSupply: 1000,
    mintPrice: 100,
    currency: '$LOS'
  });

  const handleImageUrlChange = (url: string) => {
    setCollectionData(prev => ({ ...prev, imageUrl: url }));
  };

  const generateRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    return `https://picsum.photos/500/500?random=${randomId}`;
  };

  const handleDeploy = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!collectionData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    setIsDeploying(true);
    setError(null);
    setDeployResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/admin/deploy-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...collectionData,
          adminWallet: publicKey.toString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deploy collection');
      }

      setDeployResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy collection');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Admin Dashboard
            </h1>
            <p className="text-gray-300 text-lg">
              Deploy NFT collections for public minting
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Admin Wallet
                </h2>
                <p className="text-gray-300">
                  Connect your wallet to deploy collections
                </p>
              </div>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
            </div>
          </div>

          {/* Collection Creation Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              🎨 Create Collection
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Collection Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={collectionData.name}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter collection name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={collectionData.description}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe your collection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Supply
                  </label>
                  <input
                    type="number"
                    value={collectionData.totalSupply}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, totalSupply: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1000"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mint Price ($LOS)
                  </label>
                  <input
                    type="number"
                    value={collectionData.mintPrice}
                    onChange={(e) => setCollectionData(prev => ({ ...prev, mintPrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              {/* Right Column - Image Selection */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collection Image
                </label>
                
                {/* Image URL Input */}
                <div>
                  <input
                    type="url"
                    value={collectionData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter image URL"
                  />
                </div>

                {/* Random Image Button */}
                <button
                  onClick={() => handleImageUrlChange(generateRandomImage())}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  🎲 Generate Random Image
                </button>

                {/* Image Preview */}
                {collectionData.imageUrl && (
                  <div className="relative">
                    <img
                      src={collectionData.imageUrl}
                      alt="Collection preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/500x500?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deploy Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleDeploy}
              disabled={!connected || isDeploying || !collectionData.name.trim()}
              className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform ${
                connected && !isDeploying && collectionData.name.trim()
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isDeploying ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Deploying Collection...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Deploy Collection
                </div>
              )}
            </button>
            
            {!connected && (
              <p className="text-gray-400 text-sm mt-2">
                Connect your wallet to deploy collections
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
          {deployResult && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-200 mb-4">
                🎉 Collection Deployed Successfully!
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-300">Collection ID:</span>
                  <span className="text-white ml-2 font-mono text-sm">
                    {deployResult.collectionId}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-300">Mint Page URL:</span>
                  <a
                    href={deployResult.mintPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 ml-2 underline"
                  >
                    {deployResult.mintPageUrl}
                  </a>
                </div>

                <div className="mt-4">
                  <img
                    src={collectionData.imageUrl}
                    alt={collectionData.name}
                    className="w-32 h-32 rounded-lg mx-auto object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mt-6">
            <div className="text-center text-gray-400 text-sm space-y-1">
              <p>🌐 Network: Analos</p>
              <p>🔗 RPC: https://rpc.analos.io</p>
              <p>🔍 Explorer: https://explorer.analos.io</p>
              <p className="text-yellow-400">💰 Fee Wallet: EmioyGerk...xpcR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
