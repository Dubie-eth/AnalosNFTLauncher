'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface MintResult {
  mintAddress: string;
  metadataUri: string;
  transactionSignature: string;
  explorerUrl: string;
  estimatedCost: number;
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

export default function MintPage() {
  const { publicKey, connected } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nftName, setNftName] = useState('Test Analos NFT');
  const [nftDescription, setNftDescription] = useState('A test NFT minted on the Analos blockchain');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const generateRandomImage = () => {
    // Use a more reliable image service
    return `https://picsum.photos/500/500?random=${Date.now()}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB for cost efficiency)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB for cost efficiency');
      return;
    }

    setSelectedImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', nftName.trim());
      formData.append('description', nftDescription.trim());
      formData.append('walletAddress', publicKey.toString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else {
        // Use random image if no file selected
        formData.append('imageUrl', generateRandomImage());
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/mint`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mint NFT');
      }

      setMintResult(data.data);
      
      // Clear the form after successful minting
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🚀 Mint Your Analos NFT
            </h1>
            <p className="text-gray-300 text-lg">
              Create and mint a unique NFT on the Analos blockchain
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
          </div>

          {/* NFT Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              🎨 Create Your NFT
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
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

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  NFT Image
                </label>
                
                {/* Upload Area */}
                {!imagePreview ? (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/30 rounded-lg cursor-pointer bg-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-300">
                          <span className="font-semibold">Upload Image</span>
                        </p>
                        <p className="text-xs text-gray-400 text-center">
                          PNG, JPG, GIF, WebP<br/>
                          Max 5MB for cost efficiency
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Cost Info */}
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-200 text-sm">
                    💰 <strong>Cost Efficient:</strong> Small images = Lower minting fees
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleMint}
              disabled={!connected || isMinting || !nftName.trim()}
              className={`px-12 py-4 rounded-xl font-bold text-xl transition-all duration-200 transform ${
                connected && !isMinting && nftName.trim()
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
                  {selectedImage ? 'Mint My NFT' : 'Mint Random NFT'}
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
                  <span className="text-gray-300">Estimated Cost:</span>
                  <span className="text-green-400 ml-2 font-semibold">
                    {mintResult.estimatedCost} ANALOS
                  </span>
                </div>

                <div>
                  <span className="text-gray-300">Image Info:</span>
                  <div className="ml-2 text-sm">
                    <div className="text-white">
                      Size: {(mintResult.imageInfo.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="text-white">
                      Format: {mintResult.imageInfo.format.split('/')[1].toUpperCase()}
                    </div>
                    <div className={`${mintResult.imageInfo.optimized ? 'text-green-400' : 'text-yellow-400'}`}>
                      {mintResult.imageInfo.optimized ? '✅ Cost Optimized' : '⚠️ Large File'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <img
                  src={selectedImage ? (imagePreview || mintResult.nft.image) : mintResult.nft.image}
                  alt={mintResult.nft.name}
                  className="w-32 h-32 rounded-lg mx-auto object-cover"
                />
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 mt-6">
            <div className="text-center text-gray-400 text-sm">
              <p>🌐 Network: Analos</p>
              <p>🔗 RPC: https://rpc.analos.io</p>
              <p>🔍 Explorer: https://explorer.analos.io</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
