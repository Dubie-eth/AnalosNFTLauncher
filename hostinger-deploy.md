# 🚀 Hostinger Deployment Guide for launchonlos.fun

## Overview
This guide will help you deploy your Launch On Los NFT launchpad to your Hostinger domain `launchonlos.fun`.

## Prerequisites
- Hostinger hosting account with domain `launchonlos.fun`
- Node.js 18+ installed locally
- Git repository access

## Deployment Steps

### 1. Frontend Deployment (Static Site)

#### Option A: Static Export (Recommended for Hostinger)
1. Build the frontend as a static site
2. Upload the `out` folder to your Hostinger public_html directory

#### Option B: Node.js Hosting (If available)
1. Upload the entire frontend folder
2. Run `npm install` and `npm start` on the server

### 2. Backend Deployment

#### Option A: Railway/Render (Recommended)
- Deploy backend to Railway or Render
- Use the provided URLs in frontend configuration

#### Option B: Hostinger VPS (If you have VPS hosting)
- Upload backend files
- Install Node.js and dependencies
- Run with PM2 for process management

## Configuration Files

### Frontend Environment Variables
```env
NEXT_PUBLIC_APP_URL=https://launchonlos.fun
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_RPC_URL=https://rpc.analos.io
NEXT_PUBLIC_EXPLORER_URL=https://explorer.analos.io
```

### Backend Environment Variables
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://launchonlos.fun
RPC_URL=https://rpc.analos.io/
EXPLORER_URL=https://explorer.analos.io/
```

## DNS Configuration
1. Point your domain to Hostinger nameservers
2. Set up A record for `launchonlos.fun` to your hosting IP
3. Set up CNAME for `www.launchonlos.fun` to `launchonlos.fun`

## SSL Certificate
- Enable SSL through Hostinger control panel
- Use Let's Encrypt free SSL certificate

## File Structure on Hostinger
```
public_html/
├── index.html (or Next.js build output)
├── _next/ (Next.js static assets)
├── api/ (if using static API routes)
└── assets/ (images, CSS, JS)
```

## Testing
1. Visit https://launchonlos.fun
2. Test NFT upload functionality
3. Verify wallet connections
4. Test collection creation

## Troubleshooting
- Check browser console for errors
- Verify API endpoints are accessible
- Ensure CORS is properly configured
- Check SSL certificate status
