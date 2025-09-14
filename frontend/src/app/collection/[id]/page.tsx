'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Clock, Users, Zap } from 'lucide-react';
import CollectionPreview from '@/components/mint/CollectionPreview';
import MintButton from '@/components/mint/MintButton';
import { MintResult, MarketplaceListing } from '@analos-nft-launcher/shared';

interface CollectionData {
  collection: {
    id: string;
    name: string;
    symbol: string;
    description: string;
    image: string;
    baseUri: string;
  };
  phases: Array<{
    id: string;
    name: string;
    type: 'presale' | 'public';
    startTime: Date;
    endTime?: Date;
    price: number;
    maxMintsPerWallet: number;
    isActive: boolean;
  }>;
  currentPhase: {
    id: string;
    name: string;
    type: 'presale' | 'public';
    startTime: Date;
    endTime?: Date;
    price: number;
    maxMintsPerWallet: number;
    isActive: boolean;
  } | null;
  stats: {
    totalSupply: number;
    minted: number;
    remaining: number;
    floorPrice?: number;
  };
}

export default function CollectionMintPage() {
  const params = useParams();
  const { publicKey, connected } = useWallet();
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintSuccess, setMintSuccess] = useState<MintResult | null>(null);

  const collectionId = params.id as string;

  useEffect(() => {
    fetchCollectionData();
    fetchMarketplaceListings();
  }, [collectionId]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/mint/collection/${collectionId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch collection');
      }

      setCollectionData(result.data);
    } catch (error) {
      console.error('Failed to fetch collection data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceListings = async () => {
    try {
      const response = await fetch(`/api/mint/collection/${collectionId}/listings`);
      const result = await response.json();

      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
    }
  };

  const handleMintSuccess = (result: MintResult) => {
    setMintSuccess(result);
    toast.success('Mint successful!');
    
    // Refresh collection data
    fetchCollectionData();
  };

  const openExplorer = (signature: string) => {
    window.open(`https://explorer.analos.io/tx/${signature}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collectionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collection Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This collection does not exist'}</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { collection, phases, currentPhase, stats } = collectionData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-xl font-bold">{collection.name}</h1>
                <p className="text-sm text-gray-600">{collection.symbol}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collection Preview */}
          <div className="lg:col-span-2">
            <CollectionPreview
              collection={collection}
              stats={stats}
              phases={phases}
              listings={listings}
            />
          </div>

          {/* Mint Section */}
          <div className="space-y-6">
            {/* Current Phase Card */}
            {currentPhase ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>{currentPhase.name}</span>
                    <Badge variant={currentPhase.type === 'presale' ? 'secondary' : 'default'}>
                      {currentPhase.type === 'presale' ? 'Whitelist' : 'Public'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="text-lg font-semibold">{currentPhase.price} SOL</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Max per Wallet</span>
                      <span className="text-sm font-medium">{currentPhase.maxMintsPerWallet}</span>
                    </div>

                    {currentPhase.endTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Ends in</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(currentPhase.endTime)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <MintButton
                        collectionId={collectionId}
                        phase={currentPhase.id}
                        price={currentPhase.price}
                        maxMintsPerWallet={currentPhase.maxMintsPerWallet}
                        remainingSupply={stats.remaining}
                        onMintSuccess={handleMintSuccess}
                        disabled={!connected}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Minting Not Available</h3>
                  <p className="text-gray-600">
                    No active minting phase at the moment.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mint Success Modal */}
            {mintSuccess && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Zap className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Mint Successful!</h3>
                      <p className="text-green-600">
                        You've successfully minted {mintSuccess.nftAddresses?.length} NFT(s)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => openExplorer(mintSuccess.transactionSignature!)}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on Explorer
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => setMintSuccess(null)}
                        className="w-full"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Collection Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Collection Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Supply</span>
                    <span className="font-medium">{stats.totalSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minted</span>
                    <span className="font-medium">{stats.minted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium text-orange-600">{stats.remaining.toLocaleString()}</span>
                  </div>
                  {stats.floorPrice && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Floor Price</span>
                      <span className="font-medium">{stats.floorPrice} SOL</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Links */}
            {listings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available on Marketplaces</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {listings.map((listing, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => window.open(listing.url, '_blank')}
                      >
                        <span className="capitalize">{listing.marketplace}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
