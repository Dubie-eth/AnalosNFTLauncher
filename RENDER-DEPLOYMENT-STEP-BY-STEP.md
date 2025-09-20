# 🚀 Render Deployment - Step by Step Guide

## Prerequisites
- GitHub account
- Your code pushed to GitHub repository
- Render account (free)

## Step 1: Prepare Your Repository

1. **Make sure your code is on GitHub:**
   - Push all your changes to GitHub
   - Ensure the `render.yaml` file is in the root directory

## Step 2: Create Render Account

1. **Go to [Render.com](https://render.com)**
2. **Click "Get Started for Free"**
3. **Sign up with GitHub** (recommended)
4. **Authorize Render to access your repositories**

## Step 3: Create New Web Service

1. **Click "New +" button** (top right)
2. **Select "Web Service"**
3. **Connect your repository:**
   - Find your "AnalosNFTLauncher" repository
   - Click "Connect"

## Step 4: Configure the Service

### Basic Settings:
- **Name**: `lol-backend-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (or closest to you)
- **Branch**: `main` (or your default branch)

### Build & Deploy Settings:
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npx tsx src/simple-server.ts`
- **Node Version**: `18` (or latest available)

### Environment Variables:
Click "Advanced" and add these environment variables:

```
NODE_ENV = production
PORT = 10000
CORS_ORIGIN = https://launchonlos.fun
RPC_URL = https://rpc.analos.io/
EXPLORER_URL = https://explorer.analos.io/
```

## Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Watch the build logs** for any errors

## Step 6: Test Your Deployment

Once deployed, you'll get a URL like: `https://lol-backend-api.onrender.com`

Test these endpoints:
- **Health Check**: `https://lol-backend-api.onrender.com/health`
- **API Info**: `https://lol-backend-api.onrender.com/api`
- **Collections**: `https://lol-backend-api.onrender.com/api/collections`

## Step 7: Update Frontend (if needed)

If your backend URL is different from `https://lol-backend-api.onrender.com`, update the frontend:

1. **Open `hostinger-upload/index.html`**
2. **Find this line:**
   ```javascript
   const response = await fetch('https://lol-backend-api.onrender.com/api/collections/upload', {
   ```
3. **Replace with your actual backend URL**

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in `backend/package.json`
   - Verify the build command is correct

2. **Service Won't Start**
   - Check the start command: `cd backend && npx tsx src/simple-server.ts`
   - Verify tsx is installed as a dev dependency

3. **CORS Errors**
   - Ensure `CORS_ORIGIN` environment variable is set to `https://launchonlos.fun`
   - Check that your domain is in the CORS origins list

4. **Service Keeps Restarting**
   - Check the logs for errors
   - Verify all environment variables are set correctly

## Success Indicators

✅ **Service is running** (green status in Render dashboard)
✅ **Health check returns 200** (`/health` endpoint works)
✅ **API endpoints respond** (`/api` endpoint works)
✅ **No CORS errors** in browser console

## Next Steps

Once your backend is deployed and working:
1. ✅ **Backend deployed and tested**
2. 🔄 **Upload frontend to Hostinger**
3. 🔄 **Configure DNS settings**
4. 🔄 **Enable SSL certificate**

---

**Your backend will be live at**: `https://lol-backend-api.onrender.com`
