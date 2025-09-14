# Launch On Los (LOL) - NFT Generator

A comprehensive NFT generation system inspired by LaunchMyNFT.io, built specifically for the Analos blockchain. This system allows users to create generative NFT collections by uploading layer folders, configuring rarity, and automatically generating unique combinations.

## 🚀 Features

### Core Functionality
- **ZIP Upload**: Upload ZIP files containing organized layer folders
- **Layer Processing**: Automatic extraction and validation of image layers
- **Rarity Configuration**: Set custom rarity weights for each trait
- **Image Generation**: High-performance image compositing using Sharp
- **Metadata Creation**: Automatic generation of Solana-standard metadata
- **Storage Integration**: Upload to Arweave via Bundlr Network
- **Blockchain Deployment**: Deploy collections to Analos blockchain

### Advanced Features
- **Parallel Processing**: Multi-threaded image generation using worker pools
- **Real-time Progress**: WebSocket updates for generation progress
- **Session Management**: Temporary storage with automatic cleanup
- **Validation**: Comprehensive input validation and error handling
- **Scalability**: Optimized for generating up to 10,000 NFTs

## 📁 Project Structure

```
backend/src/
├── routes/
│   └── nftGenerator.ts          # API routes for NFT generation
├── services/
│   ├── NFTGeneratorService.ts   # Core generation logic
│   ├── StorageService.ts        # Arweave/IPFS storage
│   ├── DeployService.ts         # Blockchain deployment
│   └── workers/
│       └── imageWorker.js       # Parallel image processing
├── utils/
│   ├── RarityUtils.ts           # Rarity calculation utilities
│   └── logger.ts                # Winston logging
└── test/
    └── generator.test.ts        # Test suite
```

## 🔧 API Endpoints

### Layer Upload
```http
POST /api/nft-generator/upload-layers
Content-Type: multipart/form-data

FormData:
- zipFile: ZIP file containing layer folders
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "layers": [
      {
        "name": "Backgrounds",
        "traits": ["blue.png", "red.png", "green.png"],
        "count": 3
      }
    ],
    "totalTraits": 15
  }
}
```

### Configuration
```http
POST /api/nft-generator/generate-config
Content-Type: application/json

{
  "sessionId": "uuid",
  "order": ["Backgrounds", "Eyes", "Hats"],
  "rarity": {
    "Backgrounds": {
      "blue": 50,
      "red": 30,
      "green": 20
    },
    "Eyes": {
      "normal": 70,
      "laser": 20,
      "glowing": 10
    }
  },
  "supply": 1000,
  "collection": {
    "name": "LOL Apes",
    "symbol": "LOLA",
    "description": "A collection of LOL Apes",
    "royalties": 5
  }
}
```

### Generation
```http
POST /api/nft-generator/generate-nfts
Content-Type: application/json

{
  "sessionId": "uuid"
}
```

### Progress Tracking
```http
GET /api/nft-generator/progress/:sessionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "generating",
    "progress": 45,
    "current": 450,
    "total": 1000,
    "message": "Generating images..."
  }
}
```

### Deployment
```http
POST /api/nft-generator/deploy-collection
Content-Type: application/json

{
  "sessionId": "uuid",
  "walletSignature": "base58_signature",
  "walletAddress": "wallet_address"
}
```

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+
- Yarn package manager
- Analos wallet with SOL for deployment
- Arweave wallet for storage (optional)

### Installation
```bash
# Install dependencies
yarn install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start development server
yarn dev
```

### Environment Variables
```env
# Required
RPC_URL=https://rpc.analos.io/
EXPLORER_URL=https://explorer.analos.io/
WALLET_PRIVATE_KEY=your_wallet_private_key

# Optional
ARWEAVE_WALLET_PRIVATE_KEY=your_arweave_wallet_private_key
BUNDLR_NETWORK_URL=https://node1.bundlr.network
```

## 🎨 Usage Guide

### 1. Prepare Your Artwork
Organize your artwork into folders within a ZIP file:
```
layers.zip
├── Backgrounds/
│   ├── blue.png
│   ├── red.png
│   └── green.png
├── Eyes/
│   ├── normal.png
│   ├── laser.png
│   └── glowing.png
└── Hats/
    ├── none.png
    ├── cap.png
    └── crown.png
```

### 2. Upload Layers
```javascript
const formData = new FormData();
formData.append('zipFile', zipFile);

const response = await fetch('/api/nft-generator/upload-layers', {
  method: 'POST',
  body: formData
});

const { data } = await response.json();
const { sessionId, layers } = data;
```

### 3. Configure Generation
```javascript
const config = {
  sessionId,
  order: ['Backgrounds', 'Eyes', 'Hats'],
  rarity: {
    'Backgrounds': { 'blue': 50, 'red': 30, 'green': 20 },
    'Eyes': { 'normal': 70, 'laser': 20, 'glowing': 10 },
    'Hats': { 'none': 60, 'cap': 25, 'crown': 15 }
  },
  supply: 1000,
  collection: {
    name: 'LOL Apes',
    symbol: 'LOLA',
    description: 'A collection of LOL Apes',
    royalties: 5
  }
};

await fetch('/api/nft-generator/generate-config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config)
});
```

### 4. Generate NFTs
```javascript
// Start generation
await fetch('/api/nft-generator/generate-nfts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId })
});

// Monitor progress
const progressResponse = await fetch(`/api/nft-generator/progress/${sessionId}`);
const progress = await progressResponse.json();
console.log(`Progress: ${progress.data.progress}%`);
```

### 5. Deploy Collection
```javascript
const deployment = await fetch('/api/nft-generator/deploy-collection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId,
    walletSignature: signature,
    walletAddress: walletAddress
  })
});

const result = await deployment.json();
console.log(`Collection deployed: ${result.data.collectionAddress}`);
```

## 🔧 Configuration Options

### Rarity Weights
- **Percentage-based**: Weights are normalized to sum to 100%
- **Flexible**: Support for any number of traits per layer
- **Validation**: Automatic validation of rarity configuration

### Generation Settings
- **Supply**: 1 to 10,000 NFTs per collection
- **Image Size**: 512x512 pixels (configurable)
- **Format**: PNG with transparency support
- **Quality**: High-quality image compositing

### Storage Options
- **Primary**: Arweave via Bundlr Network
- **Fallback**: Mock storage for development
- **Cost**: ~0.0001 SOL per NFT for storage

## 🧪 Testing

### Run Tests
```bash
# Run all tests
yarn test

# Run generator tests
yarn test:generator

# Watch mode
yarn test:watch
```

### Test Coverage
- Unit tests for all utility functions
- Integration tests for API endpoints
- Performance tests for large collections
- Error handling tests

## 📊 Performance

### Benchmarks
- **Small Collection** (100 NFTs): ~30 seconds
- **Medium Collection** (1,000 NFTs): ~5 minutes
- **Large Collection** (10,000 NFTs): ~45 minutes

### Optimization
- **Parallel Processing**: Multi-threaded image generation
- **Memory Management**: Efficient buffer handling
- **Caching**: Layer image caching
- **Batching**: Optimized upload batching

## 🔒 Security

### Input Validation
- File type validation (PNG, JPG, GIF, WebP)
- File size limits (1MB per image, 500MB per ZIP)
- Rarity weight validation
- Supply limit validation

### Rate Limiting
- Upload rate limiting
- Generation rate limiting
- API endpoint protection

### Error Handling
- Comprehensive error messages
- Graceful failure handling
- Automatic cleanup on errors

## 🚀 Deployment

### Production Setup
```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Environment Configuration
- Set production environment variables
- Configure proper logging levels
- Set up monitoring and alerts
- Configure backup strategies

## 📈 Monitoring

### Logs
- Winston-based logging
- Structured JSON logs
- Error tracking and alerting
- Performance metrics

### Health Checks
- API health endpoint
- Storage connectivity checks
- Blockchain connectivity checks
- Resource usage monitoring

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Jest for testing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- API documentation
- Code examples
- Troubleshooting guide
- FAQ

### Community
- Discord server
- GitHub issues
- Community forum
- Developer chat

---

**Launch On Los (LOL)** - Making NFT creation accessible to everyone! 🚀
