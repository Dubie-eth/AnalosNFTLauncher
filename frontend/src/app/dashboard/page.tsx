'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  ExternalLink,
  Users,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';
import { MintPhase } from '@analos-nft-launcher/shared';

interface Collection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  baseUri: string;
  maxSupply: number;
  minted: number;
  royalties: number;
  phases: MintPhase[];
}

export default function CreatorDashboard() {
  const { publicKey, connected } = useWallet();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhase, setNewPhase] = useState<Partial<MintPhase>>({
    name: '',
    type: 'public',
    price: 1.0,
    maxMintsPerWallet: 10,
    isActive: false
  });

  useEffect(() => {
    if (connected) {
      fetchCollections();
    }
  }, [connected]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, we'll use mock data
      const mockCollections: Collection[] = [
        {
          id: 'collection-1',
          name: 'LOL Apes',
          symbol: 'LOLA',
          description: 'A collection of LOL Apes',
          image: 'https://arweave.net/mock-image',
          baseUri: 'https://arweave.net/mock-metadata',
          maxSupply: 10000,
          minted: 2500,
          royalties: 5,
          phases: [
            {
              id: 'presale',
              name: 'Presale',
              type: 'presale',
              startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
              endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
              price: 0.5,
              maxMintsPerWallet: 3,
              whitelist: ['wallet1', 'wallet2', 'wallet3'],
              isActive: true
            },
            {
              id: 'public',
              name: 'Public Sale',
              type: 'public',
              startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
              price: 1.0,
              maxMintsPerWallet: 10,
              isActive: false
            }
          ]
        }
      ];
      
      setCollections(mockCollections);
      if (mockCollections.length > 0) {
        setSelectedCollection(mockCollections[0]);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhase = () => {
    if (!selectedCollection) return;

    const phase: MintPhase = {
      id: `phase-${Date.now()}`,
      name: newPhase.name || 'New Phase',
      type: newPhase.type || 'public',
      startTime: newPhase.startTime || new Date(),
      endTime: newPhase.endTime,
      price: newPhase.price || 1.0,
      maxMintsPerWallet: newPhase.maxMintsPerWallet || 10,
      whitelist: newPhase.whitelist,
      isActive: newPhase.isActive || false
    };

    const updatedCollection = {
      ...selectedCollection,
      phases: [...selectedCollection.phases, phase]
    };

    setSelectedCollection(updatedCollection);
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
    setShowAddPhase(false);
    setNewPhase({
      name: '',
      type: 'public',
      price: 1.0,
      maxMintsPerWallet: 10,
      isActive: false
    });
  };

  const handleUpdatePhase = (phaseId: string, updates: Partial<MintPhase>) => {
    if (!selectedCollection) return;

    const updatedPhases = selectedCollection.phases.map(phase =>
      phase.id === phaseId ? { ...phase, ...updates } : phase
    );

    const updatedCollection = {
      ...selectedCollection,
      phases: updatedPhases
    };

    setSelectedCollection(updatedCollection);
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
  };

  const handleDeletePhase = (phaseId: string) => {
    if (!selectedCollection) return;

    const updatedPhases = selectedCollection.phases.filter(phase => phase.id !== phaseId);
    const updatedCollection = {
      ...selectedCollection,
      phases: updatedPhases
    };

    setSelectedCollection(updatedCollection);
    setCollections(collections.map(c => c.id === selectedCollection.id ? updatedCollection : c));
  };

  const handleSaveChanges = async () => {
    if (!selectedCollection || !publicKey) return;

    try {
      setSaving(true);
      
      const response = await fetch(`/api/mint/collection/${selectedCollection.id}/phases`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phases: selectedCollection.phases,
          creatorWallet: publicKey.toString()
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Changes saved successfully');
      } else {
        throw new Error(result.error?.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Creator Dashboard</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to manage your collections</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-gray-600">Manage your NFT collections and minting phases</p>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Collections Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Collections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <Button
                      key={collection.id}
                      variant={selectedCollection?.id === collection.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{collection.name}</div>
                        <div className="text-sm text-gray-500">{collection.symbol}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedCollection ? (
              <div className="space-y-6">
                {/* Collection Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <img
                        src={selectedCollection.image}
                        alt={selectedCollection.name}
                        className="w-8 h-8 rounded"
                      />
                      <span>{selectedCollection.name}</span>
                      <Badge variant="secondary">{selectedCollection.symbol}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCollection.maxSupply.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Supply</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {selectedCollection.minted.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Minted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {(selectedCollection.maxSupply - selectedCollection.minted).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Remaining</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedCollection.royalties}%
                        </div>
                        <div className="text-sm text-gray-500">Royalties</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Minting Phases */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="w-5 h-5" />
                        <span>Minting Phases</span>
                      </CardTitle>
                      <Button
                        onClick={() => setShowAddPhase(true)}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Phase
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedCollection.phases.map((phase) => (
                        <div
                          key={phase.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{phase.name}</h3>
                              <Badge variant={phase.type === 'presale' ? 'secondary' : 'default'}>
                                {phase.type}
                              </Badge>
                              {phase.isActive && (
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePhase(phase.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm text-gray-600">Price (SOL)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={phase.price}
                                onChange={(e) => handleUpdatePhase(phase.id, { 
                                  price: parseFloat(e.target.value) 
                                })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Max per Wallet</Label>
                              <Input
                                type="number"
                                value={phase.maxMintsPerWallet}
                                onChange={(e) => handleUpdatePhase(phase.id, { 
                                  maxMintsPerWallet: parseInt(e.target.value) 
                                })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">Start Time</Label>
                              <Input
                                type="datetime-local"
                                value={new Date(phase.startTime.getTime() - phase.startTime.getTimezoneOffset() * 60000)
                                  .toISOString().slice(0, 16)}
                                onChange={(e) => handleUpdatePhase(phase.id, { 
                                  startTime: new Date(e.target.value) 
                                })}
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-600">End Time</Label>
                              <Input
                                type="datetime-local"
                                value={phase.endTime ? new Date(phase.endTime.getTime() - phase.endTime.getTimezoneOffset() * 60000)
                                  .toISOString().slice(0, 16) : ''}
                                onChange={(e) => handleUpdatePhase(phase.id, { 
                                  endTime: e.target.value ? new Date(e.target.value) : undefined 
                                })}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <Button
                              variant={phase.isActive ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdatePhase(phase.id, { 
                                isActive: !phase.isActive 
                              })}
                            >
                              {phase.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/collection/${selectedCollection.id}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Mint Page
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Save Changes */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
                  <p className="text-gray-600 mb-4">
                    You don't have any collections yet. Create one using the NFT generator.
                  </p>
                  <Button onClick={() => window.location.href = '/'}>
                    Create Collection
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Phase Modal */}
      {showAddPhase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Phase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phase Name</Label>
                <Input
                  value={newPhase.name}
                  onChange={(e) => setNewPhase({ ...newPhase, name: e.target.value })}
                  placeholder="e.g., Presale, Public Sale"
                />
              </div>
              
              <div>
                <Label>Type</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newPhase.type}
                  onChange={(e) => setNewPhase({ ...newPhase, type: e.target.value as 'presale' | 'public' })}
                >
                  <option value="public">Public</option>
                  <option value="presale">Presale</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (SOL)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPhase.price}
                    onChange={(e) => setNewPhase({ ...newPhase, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Max per Wallet</Label>
                  <Input
                    type="number"
                    value={newPhase.maxMintsPerWallet}
                    onChange={(e) => setNewPhase({ ...newPhase, maxMintsPerWallet: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddPhase(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPhase}>
                  Add Phase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
