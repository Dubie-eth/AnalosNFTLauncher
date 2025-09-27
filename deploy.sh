#!/bin/bash

echo "🚀 Deploying Analos NFT Launcher..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "📦 Building backend..."
cd backend
npm run build
cd ..

echo "✅ Build complete!"
echo ""
echo "🌐 Ready for deployment:"
echo "  - Frontend: ./frontend/out (static files)"
echo "  - Backend: ./backend/dist (Node.js server)"
echo ""
echo "📋 Next steps:"
echo "  1. Upload frontend/out to your hosting service"
echo "  2. Deploy backend to a Node.js hosting service"
echo "  3. Update environment variables for production"
echo "  4. Test the live deployment!"
