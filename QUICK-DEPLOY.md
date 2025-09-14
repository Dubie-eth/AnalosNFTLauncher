# Quick Deploy Guide - Launch On Los (LOL)

## 🚀 Fastest Options to Get Your Backend Running

### Option 1: Railway (Recommended - 2 minutes)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your LOL repository**
5. **Railway will auto-detect the backend and deploy it**
6. **Get your URL (e.g., `https://lol-backend-production.up.railway.app`)**

**That's it!** Your backend will be live in 2 minutes.

---

### Option 2: Render (Also 2 minutes)

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repo**
5. **Configure:**
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npx tsx src/simple-server.ts`
   - **Health Check Path:** `/health`
6. **Click "Create Web Service"**

**Your backend will be live at:** `https://lol-backend-api.onrender.com`

---

### Option 3: Netlify Functions (1 minute)

1. **Go to [Netlify.com](https://netlify.com)**
2. **Sign up with GitHub**
3. **Click "New site from Git"**
4. **Select your repository**
5. **Deploy settings:**
   - **Build command:** `npm install`
   - **Publish directory:** `public` (or leave empty)
6. **Click "Deploy site"**

**Your API will be available at:** `https://your-site.netlify.app/api/`

---

### Option 4: Vercel (1 minute)

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Vercel will auto-detect and deploy**

**Your API will be available at:** `https://your-project.vercel.app/api/`

---

## 🔧 Update Frontend to Use External Backend

Once you have your backend URL, update the frontend:

### 1. Create a simple frontend config

```javascript
// frontend/src/config/api.js
export const API_BASE_URL = 'https://your-backend-url.com';
// or for local testing: 'http://localhost:3001'
```

### 2. Update API calls in frontend

```javascript
// Example API call
const response = await fetch(`${API_BASE_URL}/api/collections`);
const data = await response.json();
```

### 3. Test the connection

```bash
# Test your deployed backend
curl https://your-backend-url.com/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0"
}
```

---

## 🎯 Quick Test URLs

Once deployed, test these endpoints:

- **Health Check:** `https://your-backend-url.com/health`
- **API Info:** `https://your-backend-url.com/api`
- **Collections:** `https://your-backend-url.com/api/collections`
- **Test Collection:** `https://your-backend-url.com/api/collections/testCollection123`
- **Mint Test:** `https://your-backend-url.com/api/mint` (POST)

---

## 🚀 Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Import your repository**
3. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
4. **Deploy**

**Your full app will be live at:** `https://your-frontend.vercel.app`

---

## 📱 Test the Full App

1. **Visit your frontend URL**
2. **Try the collection page:** `/collection/testCollection123`
3. **Test minting functionality**
4. **Check the dashboard:** `/dashboard`

---

## 🔍 Troubleshooting

### Backend not starting?
- Check the logs in your hosting platform
- Make sure all dependencies are installed
- Verify the start command is correct

### CORS errors?
- Update `CORS_ORIGIN` in your backend environment
- Add your frontend URL to allowed origins

### API not responding?
- Check the health endpoint first
- Verify the URL is correct
- Check for typos in the endpoint paths

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ **Backend API** running on external hosting
- ✅ **Frontend** connecting to the API
- ✅ **Full functionality** for testing
- ✅ **Public URLs** to share with others

**Next steps:**
1. Test all functionality
2. Share the URLs with others
3. Iterate and improve
4. Add real blockchain integration

---

**Need help?** Check the logs in your hosting platform or reach out for support!
