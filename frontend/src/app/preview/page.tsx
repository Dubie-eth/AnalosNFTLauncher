'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '../components/Navigation';

interface CollectionData {
  collectionAddress?: string;
  collectionName: string;
  collectionSymbol: string;
  description: string;
  image: string;
  totalSupply: number;
  processedMetadata: number;
  launchType: 'fork' | 'new';
  originalAddress?: string;
  traitsPreserved?: number;
  traitsGenerated?: number;
  fileType?: string;
  fileSize?: number;
  traits?: Array<{
    trait_type: string;
    values: string[];
    distribution: number[];
  }>;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  externalUrl?: string;
  createdAt?: string;
}

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    totalSupply: 0
  });

  useEffect(() => {
    // Get collection data from URL params or localStorage
    const sessionId = searchParams.get('sessionId');
    const collectionJson = searchParams.get('collection');
    
    if (collectionJson) {
      try {
        const collection = JSON.parse(decodeURIComponent(collectionJson));
        setCollectionData(collection);
        setFormData({
          name: collection.collectionName || collection.name || '',
          symbol: collection.collectionSymbol || collection.symbol || '',
          description: collection.description || '',
          totalSupply: collection.totalSupply || 0
        });
      } catch (err) {
        setError('Invalid collection data');
      }
    } else if (sessionId) {
      // Try to get from localStorage
      const stored = localStorage.getItem(`collection_${sessionId}`);
      if (stored) {
        const collection = JSON.parse(stored);
        setCollectionData(collection);
        setFormData({
          name: collection.collectionName || collection.name || '',
          symbol: collection.collectionSymbol || collection.symbol || '',
          description: collection.description || '',
          totalSupply: collection.totalSupply || 0
        });
      }
    }
  }, [searchParams]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (collectionData) {
      const updatedCollection = {
        ...collectionData,
        collectionName: formData.name,
        collectionSymbol: formData.symbol,
        description: formData.description,
        totalSupply: formData.totalSupply
      };
      setCollectionData(updatedCollection);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (collectionData) {
      setFormData({
        name: collectionData.collectionName || collectionData.name || '',
        symbol: collectionData.collectionSymbol || collectionData.symbol || '',
        description: collectionData.description || '',
        totalSupply: collectionData.totalSupply || 0
      });
    }
    setIsEditing(false);
  };

  const handleLaunch = async () => {
    if (!collectionData) return;
    
    setIsLaunching(true);
    setError(null);
    setLaunchResult(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/collections/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...collectionData,
          collectionName: formData.name,
          collectionSymbol: formData.symbol,
          description: formData.description,
          totalSupply: formData.totalSupply
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setLaunchResult(data);
        setIsLaunching(false);
      } else {
        setError(data.error || 'Launch failed');
        setIsLaunching(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
      setIsLaunching(false);
    }
  };

  if (!collectionData) {
    return (
      <div className="container">
        <div className="error-message">
          <h3>❌ Collection Not Found</h3>
          <p>No collection data found. Please go back and upload a collection first.</p>
          <a href="/" className="launch-button" style={{ display: 'inline-block', marginTop: '20px' }}>
            ← Back to Upload
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container">
        <div className="hero">
        <h1>Collection Preview</h1>
        <p>Review and customize your collection before launching to Analos</p>
      </div>

      <div className="preview-card">
        <div className="preview-header">
          <div className="collection-image">
            <img 
              src={collectionData.image || 'https://via.placeholder.com/300x300/667eea/ffffff?text=Collection+Image'} 
              alt={collectionData.collectionName || collectionData.name}
              style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
          <div className="collection-info">
            <h2>{collectionData.collectionName || collectionData.name}</h2>
            <p className="collection-symbol">#{collectionData.collectionSymbol || collectionData.symbol}</p>
            <p className="collection-description">{collectionData.description}</p>
            
            <div className="collection-stats">
              <div className="stat">
                <span className="stat-label">Total Supply</span>
                <span className="stat-value">{collectionData.totalSupply}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Processed</span>
                <span className="stat-value">{collectionData.processedMetadata}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Launch Type</span>
                <span className="stat-value">{collectionData.launchType === 'fork' ? 'Fork Metadata' : 'New Collection'}</span>
              </div>
              {collectionData.fileType && (
                <div className="stat">
                  <span className="stat-label">File Type</span>
                  <span className="stat-value">{collectionData.fileType}</span>
                </div>
              )}
              {collectionData.fileSize && (
                <div className="stat">
                  <span className="stat-label">File Size</span>
                  <span className="stat-value">{(collectionData.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {collectionData.originalAddress && (
          <div className="original-info">
            <h3>🔗 Original Collection</h3>
            <p><strong>Solana Address:</strong> {collectionData.originalAddress}</p>
            {collectionData.externalUrl && (
              <p>
                <strong>View Original:</strong>{' '}
                <a href={collectionData.externalUrl} target="_blank" rel="noopener noreferrer">
                  {collectionData.externalUrl}
                </a>
              </p>
            )}
          </div>
        )}

        {collectionData.traits && collectionData.traits.length > 0 && (
          <div className="traits-section">
            <h3>🎨 Collection Traits</h3>
            <div className="traits-grid">
              {collectionData.traits.map((trait, index) => (
                <div key={index} className="trait-card">
                  <h4>{trait.trait_type}</h4>
                  <div className="trait-values">
                    {trait.values.map((value, valueIndex) => (
                      <span key={valueIndex} className="trait-value">
                        {value} ({trait.distribution[valueIndex]}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="edit-section">
          <div className="section-header">
            <h3>✏️ Edit Collection Details</h3>
            {!isEditing ? (
              <button onClick={handleEdit} className="edit-button">
                Edit Details
              </button>
            ) : (
              <div className="edit-buttons">
                <button onClick={handleSave} className="save-button">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Collection Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter collection name"
                />
              </div>
              <div className="form-group">
                <label>Collection Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="input-field"
                  placeholder="Enter collection symbol"
                  maxLength={5}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Enter collection description"
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Total Supply</label>
                <input
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({ ...formData, totalSupply: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="Enter total supply"
                  min="1"
                  max="10000"
                />
              </div>
            </div>
          ) : (
            <div className="readonly-details">
              <p><strong>Name:</strong> {formData.name}</p>
              <p><strong>Symbol:</strong> {formData.symbol}</p>
              <p><strong>Description:</strong> {formData.description}</p>
              <p><strong>Total Supply:</strong> {formData.totalSupply}</p>
            </div>
          )}
        </div>

        <div className="launch-section">
          <button
            onClick={handleLaunch}
            disabled={isLaunching || !formData.name || !formData.symbol}
            className="launch-button"
          >
            {isLaunching ? (
              <>
                <span className="loading"></span>
                Launching to Analos...
              </>
            ) : (
              '🚀 Launch Collection on Analos'
            )}
          </button>
        </div>
      </div>

      {launchResult && (
        <div className="success-message">
          <h3>🎉 Collection Launched Successfully!</h3>
          <p><strong>Collection Address:</strong> {launchResult.collectionAddress}</p>
          <p><strong>Total Supply:</strong> {launchResult.totalSupply} NFTs</p>
          <p><strong>Processed:</strong> {launchResult.processedMetadata} metadata files</p>
          {launchResult.originalAddress && (
            <p><strong>Original Solana Address:</strong> {launchResult.originalAddress}</p>
          )}
          {launchResult.traitsPreserved && (
            <p><strong>Traits Preserved:</strong> {launchResult.traitsPreserved} categories</p>
          )}
          {launchResult.traitsGenerated && (
            <p><strong>New Traits Generated:</strong> {launchResult.traitsGenerated} categories</p>
          )}
          <p>
            <strong>View on Explorer:</strong>{' '}
            <a href={launchResult.explorerUrl} target="_blank" rel="noopener noreferrer">
              {launchResult.explorerUrl}
            </a>
          </p>
          <p><em>{launchResult.message}</em></p>
          <div style={{ marginTop: '20px' }}>
            <a href="/" className="launch-button" style={{ display: 'inline-block', marginRight: '10px' }}>
              ← Upload Another Collection
            </a>
            <a href={launchResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="launch-button" style={{ display: 'inline-block' }}>
              View on Explorer →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)} className="launch-button" style={{ display: 'inline-block', marginTop: '10px' }}>
            Try Again
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
