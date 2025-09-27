# 🚀 Analos NFT Launcher - Deployment Guide

## 🎯 **Ready to Deploy!**

Your NFT launcher is ready for deployment! Here's how to get it live and mint the first real NFT on Analos.

## 📋 **Deployment Options**

### **Option 1: Quick Deploy (Recommended)**
Deploy the current working version with mock transactions, then add real blockchain integration later.

### **Option 2: Full Blockchain Deploy**
Deploy with real Analos blockchain integration (requires Anchor CLI setup).

---

## 🚀 **Option 1: Quick Deploy**

### **Step 1: Build the Application**
```bash
# Run the build script
./deploy.bat  # Windows
# or
./deploy.sh   # Linux/Mac
```

### **Step 2: Deploy Frontend**
**Recommended Hosting Services:**
- **Vercel** (easiest for Next.js)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

**Vercel Deployment:**
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Deploy the `frontend/` folder
4. Set environment variables in Vercel dashboard

### **Step 3: Deploy Backend**
**Recommended Hosting Services:**
- **Railway** (easiest for Node.js)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS EC2**

**Railway Deployment:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `backend/` folder
4. Set environment variables in Railway dashboard

### **Step 4: Update Environment Variables**
Copy `env.production.example` to `.env` and update:
- `NEXT_PUBLIC_APP_URL` - Your frontend URL
- `BACKEND_URL` - Your backend API URL
- `CORS_ORIGIN` - Your frontend URL

---

## 🔗 **Option 2: Full Blockchain Deploy**

### **Step 1: Install Anchor CLI**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### **Step 2: Configure for Analos**
```bash
# Set Analos RPC
solana config set --url https://rpc.analos.io/

# Create wallet (if needed)
solana-keygen new --outfile ~/.config/solana/id.json

# Get some test tokens
solana airdrop 1
```

### **Step 3: Deploy Smart Contract**
```bash
cd contracts
anchor build
anchor deploy --provider.cluster analos
```

### **Step 4: Update Backend**
Update `backend/src/services/BlockchainService.ts` with:
- Real program ID from deployment
- Actual wallet integration
- Real transaction signing

---

## 🎨 **Quick Deploy Steps (5 minutes)**

### **1. Deploy to Vercel (Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### **2. Deploy to Railway (Backend)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

### **3. Update URLs**
- Update frontend to point to Railway backend URL
- Update backend CORS to allow frontend domain

---

## 🎯 **Test Your Deployment**

1. **Visit your live frontend URL**
2. **Connect your wallet** (make sure it's set to Analos network)
3. **Upload an image and mint an NFT**
4. **Check the transaction on Analos explorer**

---

## 🔧 **Troubleshooting**

### **Common Issues:**
- **CORS errors**: Update `CORS_ORIGIN` in backend
- **Wallet connection**: Ensure wallet is on Analos network
- **Image upload**: Check file size limits (5MB max)

### **Environment Variables:**
Make sure all required variables are set in your hosting service.

---

## 🎉 **Success!**

Once deployed, you'll have:
- ✅ **Live NFT launcher** on the web
- ✅ **Image upload** functionality
- ✅ **Cost optimization** features
- ✅ **Analos blockchain** integration
- ✅ **Ready to mint** real NFTs!

---

## 🚀 **Next Steps After Deployment**

1. **Test the full flow** end-to-end
2. **Add real blockchain integration** (if using mock)
3. **Set up analytics** and monitoring
4. **Add more features** (collections, marketplace, etc.)
5. **Market your NFT launcher** to the Analos community!

---

**Ready to deploy? Choose your option and let's get this live!** 🎨✨