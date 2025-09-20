# 🚀 Launch On Los - Complete Deployment Guide for launchonlos.fun

## Overview
This guide will help you deploy your Launch On Los NFT launchpad to your Hostinger domain `launchonlos.fun`.

## 🎯 What We've Set Up

### ✅ Frontend Configuration
- **Static Export**: Configured Next.js for static site generation
- **Custom Domain**: Updated all URLs to use `launchonlos.fun`
- **API Integration**: Connected to production backend
- **Build Scripts**: Created deployment automation

### ✅ Backend Configuration  
- **CORS**: Added your domain to allowed origins
- **Environment**: Production-ready configuration
- **API Endpoints**: All endpoints ready for production

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend to Render (Recommended)

1. **Go to [Render.com](https://render.com)**
2. **Create New Web Service**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npx tsx src/simple-server.ts`
   - **Environment**: Node.js
   - **Plan**: Free tier is fine for testing

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://launchonlos.fun
   RPC_URL=https://rpc.analos.io/
   EXPLORER_URL=https://explorer.analos.io/
   ```

6. **Deploy and note the URL** (e.g., `https://lol-backend-api.onrender.com`)

### Step 2: Build Frontend for Production

Run the deployment script:
```bash
# Windows
deploy-hostinger.bat

# Or PowerShell
.\deploy-hostinger.ps1
```

This will:
- Build the frontend for production
- Create a `hostinger-upload` folder
- Prepare all files for upload

### Step 3: Upload to Hostinger

1. **Login to Hostinger Control Panel**
2. **Go to File Manager**
3. **Navigate to `public_html` folder**
4. **Delete all existing files**
5. **Upload all files from `hostinger-upload` folder**
6. **Set `index.html` as default page**

### Step 4: Configure DNS

1. **In Hostinger DNS settings:**
   - **A Record**: `@` → Your hosting IP
   - **CNAME**: `www` → `launchonlos.fun`

2. **Wait for DNS propagation** (5-30 minutes)

### Step 5: Enable SSL

1. **In Hostinger Control Panel**
2. **Go to SSL section**
3. **Enable Let's Encrypt SSL**
4. **Force HTTPS redirect**

## 🔧 Alternative Backend Deployment (Railway)

If you prefer Railway:

1. **Go to [Railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Deploy with these settings:**
   - **Start Command**: `cd backend && npx tsx src/simple-server.ts`
   - **Environment Variables**: Same as Render

## 📁 File Structure After Deployment

```
public_html/
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── assets/
└── UPLOAD-INSTRUCTIONS.txt
```

## 🌐 URLs After Deployment

- **Frontend**: https://launchonlos.fun
- **Backend API**: https://lol-backend-api.onrender.com
- **Health Check**: https://lol-backend-api.onrender.com/health

## 🧪 Testing Your Deployment

1. **Visit https://launchonlos.fun**
2. **Test the upload functionality**
3. **Check browser console for errors**
4. **Verify API calls are working**

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify domain is in allowed origins

2. **API Not Responding**
   - Check backend deployment status
   - Verify environment variables

3. **SSL Issues**
   - Wait for SSL certificate activation
   - Check DNS propagation

4. **404 Errors**
   - Verify all files uploaded correctly
   - Check file permissions

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify backend health at `/health` endpoint
3. Test API endpoints directly
4. Check Hostinger error logs

## 🎉 Success!

Once deployed, your Launch On Los NFT launchpad will be live at:
**https://launchonlos.fun**

Your users can now:
- Upload NFT collections
- Create and mint NFTs
- Launch collections on Analos blockchain
- Connect their wallets

---

**Built with ❤️ for the Analos ecosystem**

