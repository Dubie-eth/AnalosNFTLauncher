# 🚀 Backend Deployment Guide for Launch On Los

## Step 1: Deploy Backend to Render

### Option A: Render (Recommended - Free Tier Available)

1. **Go to [Render.com](https://render.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   **Basic Settings:**
   - **Name**: `lol-backend-api`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main` (or your default branch)

   **Build & Deploy:**
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npx tsx src/simple-server.ts`
   - **Node Version**: `18` (or latest)

6. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://launchonlos.fun
   RPC_URL=https://rpc.analos.io/
   EXPLORER_URL=https://explorer.analos.io/
   ```

7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Note your service URL** (e.g., `https://lol-backend-api.onrender.com`)

### Option B: Railway (Alternative)

1. **Go to [Railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Deploy with these settings:**
   - **Start Command**: `cd backend && npx tsx src/simple-server.ts`
   - **Environment Variables**: Same as Render

## Step 2: Test Your Backend

Once deployed, test these endpoints:

- **Health Check**: `https://your-backend-url.onrender.com/health`
- **API Info**: `https://your-backend-url.onrender.com/api`
- **Collections**: `https://your-backend-url.onrender.com/api/collections`

## Step 3: Update Frontend (if needed)

If your backend URL is different from `https://lol-backend-api.onrender.com`, update the frontend-simple.html file:

```javascript
// Change this line in frontend-simple.html:
const response = await fetch('YOUR_ACTUAL_BACKEND_URL/api/collections/upload', {
```

## Step 4: Verify CORS

Make sure your backend allows requests from `https://launchonlos.fun`. The backend is already configured with:

```javascript
origin: [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  'https://launchonlos.fun',
  'https://www.launchonlos.fun'
]
```

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Service Won't Start**
   - Check the start command is correct
   - Verify environment variables are set

3. **CORS Errors**
   - Ensure your domain is in the CORS origins list
   - Check that the backend URL is correct in frontend

4. **API Not Responding**
   - Check Render/Railway logs
   - Verify the service is running
   - Test the health endpoint

## Next Steps

Once your backend is deployed and working:

1. ✅ **Backend deployed and tested**
2. 🔄 **Upload frontend to Hostinger** (next step)
3. 🔄 **Configure DNS settings**
4. 🔄 **Enable SSL certificate**

---

**Your backend will be live at**: `https://lol-backend-api.onrender.com`
