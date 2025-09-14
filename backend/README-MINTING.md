# Launch On Los (LOL) - Public Minting & Marketplace Integration

A comprehensive public minting system with marketplace integration for the Launch On Los platform. This system enables users to mint NFTs from collections with whitelist/presale phases, dynamic pricing, and automatic marketplace listing.

## 🚀 Features

### Core Minting Features
- **Public Minting**: Open minting for all users with wallet connection
- **Presale Phases**: Whitelist-only minting with discounted prices
- **Dynamic Pricing**: Different prices for different phases
- **Supply Tracking**: Real-time supply counters and remaining NFT tracking
- **Wallet Integration**: Phantom and Solflare wallet support
- **Batch Minting**: Mint up to 10 NFTs in a single transaction

### Marketplace Integration
- **Magic Eden Integration**: Automatic collection verification and listing
- **Multi-Marketplace Support**: Tensor, OpenSea, and Analos Explorer
- **Shareable Links**: Social media sharing for collections
- **Real-time Stats**: Floor price, volume, and trending data

### Creator Tools
- **Phase Management**: Create and manage presale/public phases
- **Pricing Control**: Set different prices for different phases
- **Whitelist Management**: Manage whitelist for presale phases
- **Analytics Dashboard**: Track minting statistics and performance

## 📁 Project Structure

```
backend/src/
├── routes/
│   └── mint.ts                    # Minting API routes
├── services/
│   ├── MintService.ts            # Core minting logic
│   └── MarketplaceService.ts     # Marketplace integration
└── test/
    └── mint.test.ts              # Comprehensive test suite

frontend/src/
├── app/
│   ├── collection/[id]/
│   │   └── page.tsx              # Dynamic mint page
│   └── dashboard/
│       └── page.tsx              # Creator dashboard
└── components/mint/
    ├── MintButton.tsx            # Mint button component
    └── CollectionPreview.tsx     # Collection preview
```

## 🔧 API Endpoints

### Collection Information
```http
GET /api/mint/collection/:id
```
Get collection minting information including phases, stats, and current status.

**Response:**
```json
{
  "success": true,
  "data": {
    "collection": {
      "id": "collection-123",
      "name": "LOL Apes",
      "symbol": "LOLA",
      "description": "A collection of LOL Apes",
      "image": "https://arweave.net/image",
      "baseUri": "https://arweave.net/metadata"
    },
    "phases": [
      {
        "id": "presale",
        "name": "Presale",
        "type": "presale",
        "startTime": "2024-01-01T00:00:00Z",
        "endTime": "2024-01-02T00:00:00Z",
        "price": 0.5,
        "maxMintsPerWallet": 3,
        "whitelist": ["wallet1", "wallet2"],
        "isActive": true
      }
    ],
    "currentPhase": { /* active phase */ },
    "stats": {
      "totalSupply": 10000,
      "minted": 2500,
      "remaining": 7500,
      "floorPrice": 1.2
    }
  }
}
```

### Minting
```http
POST /api/mint/mint
Content-Type: application/json

{
  "collectionId": "collection-123",
  "walletAddress": "wallet-address",
  "quantity": 1,
  "phase": "public",
  "signature": "optional-signature"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionSignature": "tx-signature",
    "nftAddresses": ["nft-address-1"],
    "explorerUrl": "https://explorer.analos.io/tx/tx-signature"
  }
}
```

### Wallet Information
```http
GET /api/mint/wallet/:address/mint-count/:collectionId
```
Get wallet mint count for a specific collection.

```http
GET /api/mint/wallet/:address/whitelist/:collectionId/:phase
```
Check if wallet is whitelisted for a specific phase.

### Phase Management (Creator Only)
```http
PUT /api/mint/collection/:id/phases
Content-Type: application/json

{
  "phases": [
    {
      "id": "presale",
      "name": "Presale",
      "type": "presale",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-02T00:00:00Z",
      "price": 0.5,
      "maxMintsPerWallet": 3,
      "whitelist": ["wallet1", "wallet2"],
      "isActive": true
    }
  ],
  "creatorWallet": "creator-wallet-address"
}
```

### Marketplace Integration
```http
POST /api/mint/collection/:id/verify-marketplace
Content-Type: application/json

{
  "marketplace": "magic-eden"
}
```

```http
GET /api/mint/collection/:id/listings
```
Get all marketplace listings for a collection.

```http
GET /api/mint/collection/:id/share-links?name=Collection%20Name
```
Get shareable links for social media.

## 🎨 Frontend Components

### MintButton Component
```tsx
<MintButton
  collectionId="collection-123"
  phase="public"
  price={1.0}
  maxMintsPerWallet={10}
  remainingSupply={7500}
  onMintSuccess={(result) => console.log(result)}
  disabled={false}
/>
```

**Props:**
- `collectionId`: Collection identifier
- `phase`: Current minting phase
- `price`: Price per NFT in SOL
- `maxMintsPerWallet`: Maximum mints allowed per wallet
- `remainingSupply`: Number of NFTs remaining
- `onMintSuccess`: Callback for successful mint
- `disabled`: Whether the button is disabled

### CollectionPreview Component
```tsx
<CollectionPreview
  collection={collectionData}
  stats={statsData}
  phases={phasesData}
  listings={marketplaceListings}
/>
```

**Props:**
- `collection`: Collection information
- `stats`: Collection statistics
- `phases`: Array of minting phases
- `listings`: Marketplace listings

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+
- Yarn package manager
- Analos wallet with SOL for testing
- Magic Eden API key (optional)

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
MAGIC_EDEN_API_KEY=your_magic_eden_api_key
```

## 🎯 Usage Guide

### For Users (Minting)

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select Phantom or Solflare
   - Approve connection

2. **Browse Collections**
   - Visit `/collection/[id]` for any collection
   - View collection preview and stats
   - Check current minting phase

3. **Mint NFTs**
   - Select quantity (1-10)
   - Click "Mint" button
   - Sign transaction in wallet
   - View success message with explorer link

### For Creators (Management)

1. **Access Dashboard**
   - Visit `/dashboard`
   - Connect creator wallet
   - View your collections

2. **Manage Phases**
   - Add new minting phases
   - Set prices and limits
   - Configure whitelist for presale
   - Activate/deactivate phases

3. **Monitor Performance**
   - View minting statistics
   - Track wallet mint counts
   - Monitor marketplace listings

## 🔧 Configuration Options

### Minting Phases
- **Presale**: Whitelist-only with discounted pricing
- **Public**: Open to all users
- **Time-based**: Start and end times
- **Quantity Limits**: Max mints per wallet
- **Pricing**: Different prices per phase

### Marketplace Integration
- **Magic Eden**: Primary marketplace integration
- **Tensor**: Secondary marketplace support
- **OpenSea**: Cross-chain marketplace
- **Analos Explorer**: Native blockchain explorer

### Security Features
- **Wallet Validation**: Signature verification
- **Rate Limiting**: 5 mints per minute per wallet
- **Supply Validation**: Real-time supply checking
- **Phase Validation**: Time and whitelist checks

## 🧪 Testing

### Run Tests
```bash
# Run all tests
yarn test

# Run minting tests
yarn test:mint

# Run generator tests
yarn test:generator

# Watch mode
yarn test:watch
```

### Test Coverage
- Unit tests for all services
- Integration tests for API endpoints
- Performance tests for concurrent minting
- Error handling tests
- Wallet integration tests

## 📊 Performance

### Benchmarks
- **Single Mint**: ~2-3 seconds
- **Batch Mint (10 NFTs)**: ~5-8 seconds
- **Concurrent Mints (100)**: ~30-45 seconds
- **API Response Time**: <200ms average

### Optimization
- **RPC Batching**: Efficient blockchain queries
- **Caching**: Redis for frequently accessed data
- **Rate Limiting**: Prevents abuse
- **Error Handling**: Graceful failure recovery

## 🔒 Security

### Input Validation
- Wallet address validation
- Quantity limits (1-10 per transaction)
- Phase validation
- Supply validation

### Rate Limiting
- 5 mints per minute per wallet
- 100 API requests per minute per IP
- 1000 mints per hour per collection

### Error Handling
- Comprehensive error messages
- Graceful failure recovery
- Transaction retry logic
- Network error handling

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
- Blockchain connectivity checks
- Marketplace API status
- Resource usage monitoring

### Analytics
- Minting statistics
- User engagement metrics
- Collection performance data
- Marketplace listing status

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

**Launch On Los (LOL)** - Making NFT minting accessible to everyone! 🚀
