# 🚀 Launch On Los (LOL)

**No-code NFT launchpad for Analos blockchain. Create, mint, and trade NFTs with ease.**

[![CI/CD Pipeline](https://github.com/Dubie-eth/AnalosNFTLauncher/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Dubie-eth/AnalosNFTLauncher/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-9945FF?logo=solana&logoColor=white)](https://solana.com/)

## 🌟 Features

### 🎨 **NFT Generation**
- **No-code interface** - Drag and drop layer uploads
- **Generative art** - Create up to 10,000 unique NFTs
- **Rarity configuration** - Visual rarity weight management
- **Real-time preview** - See your collection before generation
- **Batch processing** - Generate thousands of NFTs efficiently

### 🪙 **Public Minting**
- **Wallet integration** - Phantom, Solflare, and more
- **Presale phases** - Whitelist management with Merkle trees
- **Dynamic pricing** - Set different prices per phase
- **Batch minting** - Mint up to 10 NFTs per transaction
- **Real-time supply tracking** - Live updates on remaining supply

### 🏪 **Marketplace Integration**
- **Auto-verification** - Automatic Magic Eden listing
- **Multi-marketplace** - Tensor, OpenSea, and more
- **Shareable links** - Social media integration
- **Analytics** - Floor price and volume tracking

### 👨‍💻 **Creator Dashboard**
- **Collection management** - Full control over your collections
- **Phase management** - Create and manage presale/public phases
- **Analytics** - Detailed statistics and insights
- **Airdrop tools** - Distribute NFTs to your community

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Next.js)     │    │   (Express)     │    │   (Analos)      │
│   Port: 3000    │◄──►│   Port: 3001    │◄──►│   RPC: Analos   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Storage       │
                    │   (Arweave)     │
                    │   Bundlr Network│
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Yarn** 1.22.0 or higher
- **Git** for version control
- **Anchor CLI** for smart contract development
- **Solana CLI** for blockchain interaction
- **Analos wallet** with test tokens ready

### Analos Network Details
- **RPC URL**: https://rpc.analos.io
- **Explorer**: https://explorer.analos.io
- **Chain ID**: analos

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dubie-eth/AnalosNFTLauncher.git
   cd AnalosNFTLauncher
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🎯 Mint Test NFT

### Quick Test Flow

1. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && yarn dev
   
   # Terminal 2: Frontend  
   cd frontend && yarn dev
   ```

2. **Deploy contracts to Analos**
   ```bash
   cd contracts
   anchor build
   anchor deploy --provider.cluster analos
   ```

3. **Test the mint flow**
   - Open http://localhost:3000/mint
   - Connect your Analos wallet (Phantom/Solflare)
   - Click "Mint Random NFT"
   - Confirm transaction in wallet
   - View NFT on https://explorer.analos.io

### Troubleshooting

- **RPC Connection Issues**: Ensure `RPC_URL=https://rpc.analos.io/` in your `.env`
- **Wallet Connection**: Make sure your wallet is set to Analos network
- **Deployment Fails**: Run `solana config set --url https://rpc.analos.io` first

## 📁 Project Structure

```
AnalosNFTLauncher/
├── 📁 contracts/              # Anchor smart contracts
│   ├── programs/
│   │   └── analos-nft-launcher/
│   ├── tests/
│   └── migrations/
├── 📁 backend/                # Express.js API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── middleware/        # Express middleware
│   └── package.json
├── 📁 frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   └── lib/               # Utility libraries
│   └── package.json
├── 📁 shared/                 # Shared TypeScript types
│   ├── src/
│   │   └── types.ts
│   └── package.json
├── 📁 docs/                   # Project documentation
├── 📁 .github/                # GitHub workflows and templates
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
├── 📄 package.json            # Root package configuration
├── 📄 .gitignore              # Git ignore rules
└── 📄 README.md               # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn dev                    # Start all development servers
yarn dev:frontend          # Start frontend only
yarn dev:backend           # Start backend only
yarn dev:contracts         # Build contracts

# Building
yarn build                 # Build all packages
yarn build:frontend        # Build frontend
yarn build:backend         # Build backend
yarn build:contracts       # Build contracts

# Testing
yarn test                  # Run all tests
yarn test:frontend         # Test frontend
yarn test:backend          # Test backend
yarn test:contracts        # Test contracts

# Linting
yarn lint                  # Lint all packages
yarn lint:fix              # Fix linting issues

# Type checking
yarn type-check            # Check types in all packages

# Cleaning
yarn clean                 # Clean all build artifacts
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
RPC_URL=https://rpc.analos.io/
EXPLORER_URL=https://explorer.analos.io/

# Wallet Configuration
WALLET_PRIVATE_KEY=your_deployer_wallet_private_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run specific test suites
yarn test:frontend
yarn test:backend
yarn test:contracts

# Run tests in watch mode
yarn test:watch
```

### Test Coverage

```bash
# Generate coverage report
yarn test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `yarn build:frontend`
   - Set output directory: `frontend/.next`

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
   NEXT_PUBLIC_RPC_URL=https://rpc.analos.io/
   NEXT_PUBLIC_EXPLORER_URL=https://explorer.analos.io/
   ```

### Backend (Railway/Render)

1. **Railway Deployment**
   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set start command: `yarn start:backend`
   - Add environment variables

2. **Render Deployment**
   - Go to [Render.com](https://render.com)
   - Create new Web Service
   - Set build command: `yarn build:backend`
   - Set start command: `yarn start:backend`

### Smart Contracts (Analos)

1. **Deploy to Analos**
   ```bash
   cd contracts
   anchor build
   anchor deploy --provider.cluster analos
   ```

2. **Verify deployment**
   ```bash
   solana program show <PROGRAM_ID> --url https://rpc.analos.io/
   ```

## 📚 API Documentation

### Backend API Endpoints

#### Collections
- `GET /api/collections` - List all collections
- `GET /api/collections/:id` - Get collection details
- `POST /api/collections` - Create new collection

#### Minting
- `POST /api/mint` - Mint NFTs
- `GET /api/mint/collection/:id/stats` - Get minting stats
- `GET /api/mint/wallet/:address/count/:collectionId` - Get wallet mint count

#### NFT Generation
- `POST /api/nft-generator/upload-layers` - Upload layer files
- `POST /api/nft-generator/generate-config` - Configure generation
- `POST /api/nft-generator/generate-nfts` - Generate NFTs
- `POST /api/nft-generator/deploy-collection` - Deploy collection

#### Health
- `GET /health` - Health check endpoint

### Frontend Routes

- `/` - Homepage
- `/collection/[id]` - Collection mint page
- `/dashboard` - Creator dashboard
- `/generator` - NFT generation tool

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   yarn test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Analos Team** - For the amazing blockchain infrastructure
- **Metaplex** - For the NFT standards and tooling
- **Solana** - For the underlying blockchain technology
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support

- **GitHub Issues** - [Report bugs or request features](https://github.com/Dubie-eth/AnalosNFTLauncher/issues)
- **Discord** - [Join our community](https://discord.gg/launchonlos)
- **Email** - support@launchonlos.com

## 🔗 Links

- **Website** - https://launchonlos.com
- **Documentation** - https://docs.launchonlos.com
- **Analos Explorer** - https://explorer.analos.io
- **Analos RPC** - https://rpc.analos.io

---

**Built with ❤️ for the Analos ecosystem**