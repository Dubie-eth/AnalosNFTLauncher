# Launch On Los (LOL) - Production Deployment Guide

This guide covers deploying the Launch On Los platform to production with all components properly configured.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Vercel)      │    │   (Render)      │    │   (Analos)      │
│   launchonlos.com│    │   api.launchonlos.com│  rpc.analos.io  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Storage       │
                    │   (Arweave)     │
                    │   bundlr.network│
                    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+
- Yarn package manager
- Git repository access
- Vercel account
- Render/Heroku account
- Analos wallet with SOL
- Arweave wallet (optional)

## 🚀 Deployment Steps

### 1. Environment Configuration

#### Create Production Environment File

```bash
# Copy the example environment file
cp .env.example .env.production

# Edit with production values
nano .env.production
```

#### Required Environment Variables

```env
# Blockchain Configuration
RPC_URL=https://rpc.analos.io/
EXPLORER_URL=https://explorer.analos.io/
CHAIN_ID=analos

# Wallet Configuration (REQUIRED)
WALLET_PRIVATE_KEY=your_deployer_wallet_private_key_here
FEE_WALLET=your_fee_collection_wallet_here

# Storage Configuration
BUNDLR_NETWORK_URL=https://node1.bundlr.network
ARWEAVE_WALLET_PRIVATE_KEY=your_arweave_wallet_private_key_base64_encoded

# Server Configuration
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://launchonlos.com

# Security (REQUIRED for production)
JWT_SECRET=your_secure_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Production URLs
NEXT_PUBLIC_APP_URL=https://launchonlos.com
BACKEND_URL=https://api.launchonlos.com
```

### 2. Smart Contract Deployment

#### Deploy Anchor Contracts

```bash
# Navigate to contracts directory
cd contracts

# Update Anchor.toml for production
cat > Anchor.toml << EOF
[features]
seeds = false
skip-lint = false

[programs.analos_nft_launcher]
analos_nft_launcher = "NFTLauncher1111111111111111111111111111111"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "analos"
wallet = "~/.config/solana/id.json"

[workspace]
members = [
    "programs/analos-nft-launcher"
]
EOF

# Build the program
anchor build

# Deploy to Analos
anchor deploy --provider.cluster analos

# Verify deployment
solana program show NFTLauncher1111111111111111111111111111111 --url https://rpc.analos.io/
```

#### Update Program ID

After deployment, update the program ID in the code:

```bash
# Update the program ID in the contract
sed -i 's/NFTLauncher1111111111111111111111111111111/YOUR_ACTUAL_PROGRAM_ID/g' programs/analos-nft-launcher/src/lib.rs

# Rebuild and redeploy
anchor build
anchor deploy --provider.cluster analos
```

### 3. Backend Deployment (Render)

#### Create Render Service

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```yaml
   Name: lol-backend-api
   Environment: Node
   Build Command: cd backend && yarn install && yarn build
   Start Command: cd backend && yarn start
   ```

3. **Set Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3001
   RPC_URL=https://rpc.analos.io/
   EXPLORER_URL=https://explorer.analos.io/
   WALLET_PRIVATE_KEY=your_deployer_wallet_private_key
   BUNDLR_NETWORK_URL=https://node1.bundlr.network
   ARWEAVE_WALLET_PRIVATE_KEY=your_arweave_wallet_private_key
   JWT_SECRET=your_secure_jwt_secret
   ENCRYPTION_KEY=your_32_character_encryption_key
   CORS_ORIGIN=https://launchonlos.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://lol-backend-api.onrender.com`)

#### Health Check

```bash
# Test the backend health
curl https://your-backend-url.onrender.com/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

### 4. Frontend Deployment (Vercel)

#### Create Vercel Project

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   ```json
   {
     "buildCommand": "cd frontend && yarn build",
     "outputDirectory": "frontend/.next",
     "installCommand": "yarn install",
     "framework": "nextjs"
   }
   ```

3. **Set Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://launchonlos.com
   NEXT_PUBLIC_BACKEND_URL=https://api.launchonlos.com
   NEXT_PUBLIC_RPC_URL=https://rpc.analos.io/
   NEXT_PUBLIC_EXPLORER_URL=https://explorer.analos.io/
   NEXT_PUBLIC_CHAIN_ID=analos
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the domain (e.g., `https://launchonlos.vercel.app`)

#### Custom Domain Setup

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add `launchonlos.com`
   - Add `www.launchonlos.com`

2. **Configure DNS**
   ```dns
   # A record
   @ 300 A 76.76.19.61
   
   # CNAME record
   www CNAME cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working: `https://launchonlos.com`

### 5. Database Setup (Optional)

#### PostgreSQL on Render

1. **Create Database**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Configure database settings

2. **Set Connection String**
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. **Run Migrations**
   ```bash
   # Connect to your backend service
   cd backend
   yarn migrate
   ```

### 6. Storage Setup

#### Arweave Configuration

1. **Create Arweave Wallet**
   ```bash
   # Install Arweave CLI
   npm install -g arweave

   # Create wallet
   arweave wallet generate

   # Get private key
   arweave wallet export /path/to/wallet.json
   ```

2. **Fund Wallet**
   - Send AR tokens to your wallet address
   - Minimum 0.1 AR recommended

3. **Configure Backend**
   ```env
   ARWEAVE_WALLET_PRIVATE_KEY=your_base64_encoded_private_key
   BUNDLR_NETWORK_URL=https://node1.bundlr.network
   ```

### 7. Monitoring Setup

#### Sentry Error Tracking

1. **Create Sentry Project**
   - Go to [Sentry.io](https://sentry.io)
   - Create new project
   - Select Node.js and React

2. **Configure Backend**
   ```env
   SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
   ```

3. **Configure Frontend**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
   ```

#### Logging

1. **Configure Winston Logging**
   ```env
   LOG_LEVEL=info
   LOG_FILE_PATH=./logs/app.log
   ```

2. **Set up Log Rotation**
   ```bash
   # Install logrotate
   sudo apt-get install logrotate

   # Configure log rotation
   sudo nano /etc/logrotate.d/lol-backend
   ```

### 8. Security Configuration

#### SSL/TLS

1. **Vercel (Frontend)**
   - Automatic SSL provisioning
   - Force HTTPS redirect

2. **Render (Backend)**
   - Automatic SSL provisioning
   - Custom domain with SSL

#### Security Headers

1. **Backend Security**
   ```javascript
   // helmet configuration
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
   }));
   ```

2. **Frontend Security**
   ```javascript
   // next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'X-Frame-Options',
               value: 'DENY',
             },
             {
               key: 'X-Content-Type-Options',
               value: 'nosniff',
             },
           ],
         },
       ];
     },
   };
   ```

### 9. Performance Optimization

#### CDN Setup

1. **Vercel Edge Network**
   - Automatic global CDN
   - Edge functions for API routes

2. **Image Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ['arweave.net', 'ipfs.io'],
       formats: ['image/webp', 'image/avif'],
     },
   };
   ```

#### Caching

1. **Redis Cache (Optional)**
   ```env
   REDIS_URL=redis://your-redis-url
   ```

2. **API Caching**
   ```javascript
   // Cache collection data
   app.get('/api/collections/:id', cache('5 minutes'), getCollection);
   ```

### 10. Testing Production Deployment

#### Health Checks

```bash
# Backend health
curl https://api.launchonlos.com/health

# Frontend health
curl https://launchonlos.com

# Database health
curl https://api.launchonlos.com/health/database
```

#### Functional Tests

```bash
# Test NFT generation
curl -X POST https://api.launchonlos.com/api/nft-generator/upload-layers \
  -F "zipFile=@test-layers.zip"

# Test minting
curl -X POST https://api.launchonlos.com/api/mint/mint \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"test","walletAddress":"test","quantity":1,"phase":"public"}'
```

#### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### 11. Monitoring & Maintenance

#### Uptime Monitoring

1. **UptimeRobot**
   - Monitor frontend: `https://launchonlos.com`
   - Monitor backend: `https://api.launchonlos.com/health`
   - Set up alerts for downtime

2. **Application Monitoring**
   - Sentry for error tracking
   - Vercel Analytics for frontend metrics
   - Render metrics for backend performance

#### Backup Strategy

1. **Database Backups**
   ```bash
   # Daily automated backups
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **Code Backups**
   - GitHub repository as primary backup
   - Regular releases with tags

#### Update Process

1. **Staging Environment**
   - Deploy to staging first
   - Test all functionality
   - Run integration tests

2. **Production Deployment**
   - Deploy during low-traffic hours
   - Monitor error rates
   - Rollback plan ready

### 12. Troubleshooting

#### Common Issues

1. **CORS Errors**
   ```env
   CORS_ORIGIN=https://launchonlos.com
   ```

2. **Database Connection Issues**
   ```bash
   # Check connection string
   echo $DATABASE_URL
   
   # Test connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Wallet Connection Issues**
   ```bash
   # Check wallet balance
   solana balance YOUR_WALLET_ADDRESS --url https://rpc.analos.io/
   
   # Check RPC connection
   curl https://rpc.analos.io/ -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

#### Log Analysis

```bash
# View backend logs
tail -f logs/app.log

# View error logs
grep "ERROR" logs/app.log

# View access logs
grep "GET\|POST" logs/app.log
```

## 📊 Post-Deployment Checklist

- [ ] Frontend accessible at `https://launchonlos.com`
- [ ] Backend API responding at `https://api.launchonlos.com`
- [ ] SSL certificates valid
- [ ] Database connected and responsive
- [ ] Wallet connection working
- [ ] NFT generation functional
- [ ] Minting process working
- [ ] Marketplace integration active
- [ ] Error tracking configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented
- [ ] Documentation updated

## 🎉 Success!

Your Launch On Los platform is now live and ready for users! 

- **Frontend**: https://launchonlos.com
- **Backend API**: https://api.launchonlos.com
- **Documentation**: https://launchonlos.com/docs
- **Support**: https://discord.gg/launchonlos

## 📞 Support

For deployment issues or questions:
- GitHub Issues: https://github.com/your-org/analos-nft-launcher/issues
- Discord: https://discord.gg/launchonlos
- Email: support@launchonlos.com
