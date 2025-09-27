@echo off
echo 🚀 Deploying Analos NFT Launcher...

REM Build frontend
echo 📦 Building frontend...
cd frontend
call npm run build
cd ..

REM Build backend  
echo 📦 Building backend...
cd backend
call npm run build
cd ..

echo ✅ Build complete!
echo.
echo 🌐 Ready for deployment:
echo   - Frontend: ./frontend/out (static files)
echo   - Backend: ./backend/dist (Node.js server)
echo.
echo 📋 Next steps:
echo   1. Upload frontend/out to your hosting service
echo   2. Deploy backend to a Node.js hosting service
echo   3. Update environment variables for production
echo   4. Test the live deployment!
pause
