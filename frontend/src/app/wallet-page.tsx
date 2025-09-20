'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionSymbol, setCollectionSymbol] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      // Auto-generate collection name from filename
      const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setCollectionName(name);
      setCollectionSymbol(name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 5));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !collectionName || !collectionSymbol) return;
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('collectionName', collectionName);
      formData.append('collectionSymbol', collectionSymbol);
      formData.append('launchType', 'fork');
      formData.append('walletAddress', publicKey.toString());

      console.log('Uploading file:', selectedFile.name, 'Size:', selectedFile.size);
      console.log('Wallet address:', publicKey.toString());
      
      const response = await fetch('http://localhost:3001/api/collections/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            margin: 0,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🚀 Launch On Los
          </h1>
          <WalletMultiButton />
        </div>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '40px',
          fontSize: '1.1rem'
        }}>
          Connect your Solana wallet and upload your NFT collection to launch on Analos blockchain
        </p>

        {!connected ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#f8f9fa',
            borderRadius: '15px',
            border: '2px dashed #667eea'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
              🔗 Connect Your Wallet
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Please connect your Solana wallet (Phantom, Solflare, or Backpack) to continue
            </p>
            <WalletMultiButton />
          </div>
        ) : (
          <>
            <div style={{
              background: '#e8f5e8',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#2d5a2d' }}>
                ✅ Connected: {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Collection Files
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.avi,.mov,.txt,.json,.pdf,.mp3,.wav"
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px dashed #667eea',
                  borderRadius: '10px',
                  background: '#f8f9fa',
                  cursor: 'pointer'
                }}
              />
              <p style={{
                fontSize: '0.9rem',
                color: '#666',
                marginTop: '10px'
              }}>
                Supports ZIP, RAR, images, videos, documents, and audio files up to 200MB
              </p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Collection Name
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="Enter collection name"
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Collection Symbol
              </label>
              <input
                type="text"
                value={collectionSymbol}
                onChange={(e) => setCollectionSymbol(e.target.value)}
                placeholder="Enter collection symbol"
                maxLength={5}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || !collectionName || !collectionSymbol || isUploading}
              style={{
                width: '100%',
                padding: '18px',
                background: isUploading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isUploading ? '⏳ Uploading...' : '🚀 Upload Collection'}
            </button>

            {result && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h3>🎉 Collection Uploaded Successfully!</h3>
                <p><strong>Collection Address:</strong> {result.collectionAddress}</p>
                <p><strong>Total Supply:</strong> {result.totalSupply} NFTs</p>
                <p><strong>File Type:</strong> {result.fileType}</p>
                <p><strong>File Size:</strong> {(result.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Wallet:</strong> {publicKey?.toString()}</p>
                <p>
                  <strong>View on Explorer:</strong>{' '}
                  <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                    {result.explorerUrl}
                  </a>
                </p>
                <p><em>{result.message}</em></p>
              </div>
            )}

            {error && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)',
                color: 'white',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <h3>❌ Error</h3>
                <p>{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
