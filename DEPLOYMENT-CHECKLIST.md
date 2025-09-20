# ✅ Launch On Los Deployment Checklist

## 🎯 Current Status
- ✅ Frontend files prepared (`hostinger-upload` folder)
- ✅ Backend CORS configured for `launchonlos.fun`
- ✅ Static HTML file ready for upload
- 🔄 **NEXT: Deploy backend to Render**

## 📋 Step-by-Step Checklist

### Step 1: Deploy Backend (Do This First)
- [ ] Go to [Render.com](https://render.com)
- [ ] Create new Web Service
- [ ] Connect your GitHub repository
- [ ] Set build command: `cd backend && npm install`
- [ ] Set start command: `cd backend && npx tsx src/simple-server.ts`
- [ ] Add environment variables:
  - `NODE_ENV=production`
  - `PORT=10000`
  - `CORS_ORIGIN=https://launchonlos.fun`
  - `RPC_URL=https://rpc.analos.io/`
  - `EXPLORER_URL=https://explorer.analos.io/`
- [ ] Deploy and wait for completion
- [ ] Test health endpoint: `https://your-backend-url.onrender.com/health`
- [ ] Note your backend URL

### Step 2: Upload Frontend to Hostinger
- [ ] Login to Hostinger control panel
- [ ] Go to File Manager
- [ ] Navigate to `public_html` folder
- [ ] Delete all existing files
- [ ] Upload `index.html` from `hostinger-upload` folder
- [ ] Set `index.html` as default page

### Step 3: Configure DNS
- [ ] In Hostinger DNS settings:
  - [ ] A Record: `@` → Your hosting IP
  - [ ] CNAME: `www` → `launchonlos.fun`
- [ ] Wait for DNS propagation (5-30 minutes)

### Step 4: Enable SSL
- [ ] In Hostinger control panel
- [ ] Go to SSL section
- [ ] Enable Let's Encrypt SSL
- [ ] Force HTTPS redirect

### Step 5: Test Everything
- [ ] Visit https://launchonlos.fun
- [ ] Test the upload functionality
- [ ] Check browser console for errors
- [ ] Verify API calls are working

## 🚨 Important Notes

1. **Deploy backend FIRST** - Frontend needs the API to work
2. **Update frontend URL** if your backend URL is different from `https://lol-backend-api.onrender.com`
3. **Wait for DNS propagation** before testing
4. **Check CORS errors** in browser console if API calls fail

## 🎉 Success!

Once all steps are complete, your Launch On Los NFT launchpad will be live at:
**https://launchonlos.fun**

---

**Ready to start? Begin with Step 1: Deploy Backend to Render!**
