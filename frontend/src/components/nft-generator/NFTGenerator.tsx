'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Zap, Eye, Settings, Rocket } from 'lucide-react';

interface Layer {
  name: string;
  traits: string[];
  count: number;
}

interface GenerationProgress {
  sessionId: string;
  status: 'pending' | 'generating' | 'uploading' | 'completed' | 'error';
  progress: number;
  current: number;
  total: number;
  message: string;
  error?: string;
}

export default function NFTGenerator() {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string>('');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [config, setConfig] = useState({
    order: [] as string[],
    rarity: {} as { [layerName: string]: { [traitName: string]: number } },
    supply: 1000,
    collection: {
      name: '',
      symbol: '',
      description: '',
      royalties: 5
    }
  });
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Upload ZIP file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setZipFile(file);
    
    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const response = await fetch('/api/nft-generator/upload-layers', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setSessionId(result.data.sessionId);
        setLayers(result.data.layers);
        setStep(2);
      } else {
        alert('Upload failed: ' + result.error.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  // Step 2: Configure generation
  const handleConfigSubmit = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/nft-generator/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...config
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStep(3);
      } else {
        alert('Configuration failed: ' + result.error.message);
      }
    } catch (error) {
      console.error('Config error:', error);
      alert('Configuration failed');
    }
  };

  // Step 3: Generate NFTs
  const handleGenerate = async () => {
    if (!sessionId) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/nft-generator/generate-nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const result = await response.json();
      
      if (result.success) {
        // Start polling for progress
        pollProgress();
      } else {
        alert('Generation failed: ' + result.error.message);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Generation failed');
      setIsGenerating(false);
    }
  };

  // Poll for generation progress
  const pollProgress = async () => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/nft-generator/progress/${sessionId}`);
        const result = await response.json();
        
        if (result.success) {
          setProgress(result.data);
          
          if (result.data.status === 'completed') {
            setIsGenerating(false);
            setStep(4);
          } else if (result.data.status === 'error') {
            setIsGenerating(false);
            alert('Generation failed: ' + result.data.error);
          } else {
            // Continue polling
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('Progress polling error:', error);
        setIsGenerating(false);
      }
    };

    poll();
  };

  // Update rarity weight
  const updateRarityWeight = (layerName: string, traitName: string, weight: number) => {
    setConfig(prev => ({
      ...prev,
      rarity: {
        ...prev.rarity,
        [layerName]: {
          ...prev.rarity[layerName],
          [traitName]: weight
        }
      }
    }));
  };

  // Add layer to order
  const addLayerToOrder = (layerName: string) => {
    if (!config.order.includes(layerName)) {
      setConfig(prev => ({
        ...prev,
        order: [...prev.order, layerName]
      }));
    }
  };

  // Remove layer from order
  const removeLayerFromOrder = (layerName: string) => {
    setConfig(prev => ({
      ...prev,
      order: prev.order.filter(name => name !== layerName)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">LOL NFT Generator</h1>
        <p className="text-gray-600">Create generative NFT collections in minutes</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div
            key={stepNum}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step >= stepNum
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white text-blue-500 flex items-center justify-center text-sm font-bold">
              {stepNum}
            </span>
            <span className="text-sm font-medium">
              {stepNum === 1 && 'Upload'}
              {stepNum === 2 && 'Configure'}
              {stepNum === 3 && 'Generate'}
              {stepNum === 4 && 'Deploy'}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Layer ZIP</span>
            </CardTitle>
            <CardDescription>
              Upload a ZIP file containing your layer folders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mb-4"
                >
                  Choose ZIP File
                </Button>
                <p className="text-sm text-gray-500">
                  Drag and drop your ZIP file here or click to browse
                </p>
              </div>
              
              {zipFile && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">File selected: {zipFile.name}</p>
                  <p className="text-green-600 text-sm">Size: {(zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Layer Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Layer Order</span>
              </CardTitle>
              <CardDescription>
                Arrange layers in the order they should be composited
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {config.order.map((layerName, index) => (
                    <Badge key={layerName} variant="default" className="px-3 py-1">
                      {index + 1}. {layerName}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {layers.map((layer) => (
                    <div key={layer.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{layer.name}</h3>
                        <Button
                          size="sm"
                          variant={config.order.includes(layer.name) ? "destructive" : "default"}
                          onClick={() => 
                            config.order.includes(layer.name)
                              ? removeLayerFromOrder(layer.name)
                              : addLayerToOrder(layer.name)
                          }
                        >
                          {config.order.includes(layer.name) ? 'Remove' : 'Add'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">{layer.count} traits</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rarity Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Rarity Weights</span>
              </CardTitle>
              <CardDescription>
                Set rarity weights for each trait (percentages will be normalized)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {layers.map((layer) => (
                  <div key={layer.name} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">{layer.name}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {layer.traits.map((trait) => (
                        <div key={trait} className="flex items-center space-x-2">
                          <Label className="w-20 text-sm">{trait}</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={config.rarity[layer.name]?.[trait] || 0}
                            onChange={(e) => updateRarityWeight(layer.name, trait, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collection Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Rocket className="w-5 h-5" />
                <span>Collection Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    value={config.collection.name}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      collection: { ...prev.collection, name: e.target.value }
                    }))}
                    placeholder="LOL Apes"
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={config.collection.symbol}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      collection: { ...prev.collection, symbol: e.target.value }
                    }))}
                    placeholder="LOLA"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={config.collection.description}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      collection: { ...prev.collection, description: e.target.value }
                    }))}
                    placeholder="A collection of LOL Apes..."
                  />
                </div>
                <div>
                  <Label htmlFor="supply">Supply</Label>
                  <Input
                    id="supply"
                    type="number"
                    min="1"
                    max="10000"
                    value={config.supply}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      supply: parseInt(e.target.value) || 1000
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="royalties">Royalties (%)</Label>
                  <Input
                    id="royalties"
                    type="number"
                    min="0"
                    max="25"
                    value={config.collection.royalties}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      collection: { ...prev.collection, royalties: parseInt(e.target.value) || 5 }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleConfigSubmit} size="lg">
              Continue to Generation
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generate */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Generate NFTs</span>
            </CardTitle>
            <CardDescription>
              Generate {config.supply} unique NFTs based on your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {progress && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{progress.message}</span>
                    <span className="text-sm text-gray-500">
                      {progress.current} / {progress.total}
                    </span>
                  </div>
                  <Progress value={progress.progress} className="w-full" />
                  <div className="text-center text-sm text-gray-500">
                    {progress.progress}% complete
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  size="lg"
                  className="px-8"
                >
                  {isGenerating ? 'Generating...' : 'Start Generation'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Deploy */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Deploy Collection</span>
            </CardTitle>
            <CardDescription>
              Deploy your collection to the Analos blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-green-600">
                <Eye className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Generation Complete!</h3>
                <p className="text-gray-600">
                  Your {config.supply} NFTs have been generated and uploaded to storage.
                </p>
              </div>
              
              <Button size="lg" className="px-8">
                Deploy to Analos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
