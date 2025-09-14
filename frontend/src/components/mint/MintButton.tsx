'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUmi } from '@metaplex-foundation/umi-wallet-adapter-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-wallet-adapters';
import { createV1, mplCore } from '@metaplex-foundation/mpl-core';
import { toast } from 'react-hot-toast';
import { Loader2, Zap } from 'lucide-react';
import { MintRequest, MintResult } from '@analos-nft-launcher/shared';

interface MintButtonProps {
  collectionId: string;
  phase: string;
  price: number;
  maxMintsPerWallet: number;
  remainingSupply: number;
  onMintSuccess?: (result: MintResult) => void;
  disabled?: boolean;
}

export default function MintButton({
  collectionId,
  phase,
  price,
  maxMintsPerWallet,
  remainingSupply,
  onMintSuccess,
  disabled = false
}: MintButtonProps) {
  const { publicKey, connected } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintCount, setMintCount] = useState(0);

  // Initialize UMI
  const umi = createUmi(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.analos.io/')
    .use(mplCore());

  const handleMint = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (quantity > maxMintsPerWallet) {
      toast.error(`Maximum ${maxMintsPerWallet} mints per wallet`);
      return;
    }

    if (quantity > remainingSupply) {
      toast.error('Not enough remaining supply');
      return;
    }

    setIsMinting(true);

    try {
      // Create mint request
      const mintRequest: MintRequest = {
        collectionId,
        walletAddress: publicKey.toString(),
        quantity,
        phase
      };

      // Call backend to create mint transaction
      const response = await fetch('/api/mint/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mintRequest)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Mint failed');
      }

      // In a real implementation, this would sign and send the transaction
      // For now, we'll simulate success
      const mockResult: MintResult = {
        success: true,
        transactionSignature: `mock-tx-${Date.now()}`,
        nftAddresses: Array.from({ length: quantity }, (_, i) => `mock-nft-${i}`),
        explorerUrl: `https://explorer.analos.io/tx/mock-tx-${Date.now()}`
      };

      toast.success(`Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`);
      
      if (onMintSuccess) {
        onMintSuccess(mockResult);
      }

      // Update mint count
      setMintCount(prev => prev + quantity);

    } catch (error) {
      console.error('Mint error:', error);
      toast.error(error instanceof Error ? error.message : 'Mint failed');
    } finally {
      setIsMinting(false);
    }
  };

  const canMint = connected && 
    !disabled && 
    !isMinting && 
    remainingSupply > 0 && 
    mintCount < maxMintsPerWallet;

  const remainingMints = maxMintsPerWallet - mintCount;
  const maxQuantity = Math.min(quantity, remainingMints, remainingSupply);

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Quantity:</label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !canMint}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity || !canMint}
          >
            +
          </Button>
        </div>
        <span className="text-sm text-gray-500">
          Max: {maxQuantity}
        </span>
      </div>

      {/* Mint Button */}
      <Button
        onClick={handleMint}
        disabled={!canMint}
        size="lg"
        className="w-full"
      >
        {isMinting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Minting...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Mint {quantity} NFT{quantity > 1 ? 's' : ''} for {price * quantity} SOL
          </>
        )}
      </Button>

      {/* Mint Info */}
      <div className="text-sm text-gray-600 space-y-1">
        <div>Price: {price} SOL each</div>
        <div>Total: {price * quantity} SOL</div>
        <div>Remaining: {remainingSupply}</div>
        <div>Your mints: {mintCount}/{maxMintsPerWallet}</div>
      </div>

      {/* Wallet Status */}
      {!connected && (
        <div className="text-center text-sm text-gray-500">
          Connect your wallet to mint
        </div>
      )}
    </div>
  );
}
