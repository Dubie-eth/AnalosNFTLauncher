'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MarketplaceListing } from '@analos-nft-launcher/shared';

interface CollectionPreviewProps {
  collection: {
    id: string;
    name: string;
    symbol: string;
    description: string;
    image: string;
    baseUri: string;
  };
  stats: {
    totalSupply: number;
    minted: number;
    remaining: number;
    floorPrice?: number;
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
  listings?: MarketplaceListing[];
}

export default function CollectionPreview({
  collection,
  stats,
  phases,
  listings = []
}: CollectionPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState<any>(null);

  useEffect(() => {
    // Generate preview images from base URI
    const generatePreviewImages = () => {
      const images = [];
      for (let i = 1; i <= 8; i++) {
        images.push(`${collection.baseUri}/${i}.png`);
      }
      setPreviewImages(images);
    };

    generatePreviewImages();
  }, [collection.baseUri]);

  useEffect(() => {
    // Find current active phase
    const activePhase = phases.find(phase => phase.isActive);
    setCurrentPhase(activePhase);
  }, [phases]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const shareCollection = () => {
    if (navigator.share) {
      navigator.share({
        title: collection.name,
        text: collection.description,
        url: window.location.href
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <img
            src={collection.image}
            alt={collection.name}
            className="w-32 h-32 mx-auto rounded-lg object-cover"
          />
          <div className="absolute -top-2 -right-2">
            <Badge variant="secondary" className="bg-green-500 text-white">
              {collection.symbol}
            </Badge>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
          <p className="text-gray-600 mt-2">{collection.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(collection.id)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy ID
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareCollection}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSupply.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Supply</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.minted.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Minted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.remaining.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.floorPrice ? `${stats.floorPrice} SOL` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Floor Price</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase */}
      {currentPhase && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{currentPhase.name}</h3>
                <p className="text-sm text-gray-600">
                  {currentPhase.type === 'presale' ? 'Whitelist Only' : 'Public Sale'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{currentPhase.price} SOL</div>
                <div className="text-sm text-gray-500">per NFT</div>
              </div>
            </div>
            
            {currentPhase.endTime && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Ends in</div>
                <div className="text-lg font-semibold">
                  {getTimeUntil(currentPhase.endTime)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewImages.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder
                    e.currentTarget.src = `https://via.placeholder.com/200x200?text=NFT+${index + 1}`;
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Marketplace Listings */}
      {listings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available on Marketplaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium capitalize">{listing.marketplace}</h4>
                      {listing.floorPrice && (
                        <p className="text-sm text-gray-600">
                          Floor: {listing.floorPrice} SOL
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {listing.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(listing.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Phase Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mint Timeline</h3>
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <Card key={phase.id} className={phase.isActive ? 'ring-2 ring-blue-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      phase.isActive ? 'bg-green-500' : 
                      new Date() > phase.startTime ? 'bg-gray-400' : 'bg-blue-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{phase.name}</h4>
                      <p className="text-sm text-gray-600">
                        {phase.type === 'presale' ? 'Whitelist Only' : 'Public Sale'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{phase.price} SOL</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(phase.startTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
