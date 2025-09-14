@echo off
echo 🚀 Launch On Los (LOL) - Quick Setup
echo ====================================

echo [INFO] Setting up simplified version...

REM Backup original package.json files
if exist package.json (
    copy package.json package.json.backup
    echo [INFO] Backed up original package.json
)

if exist backend\package.json (
    copy backend\package.json backend\package.json.backup
    echo [INFO] Backed up original backend package.json
)

if exist frontend\package.json (
    copy frontend\package.json frontend\package.json.backup
    echo [INFO] Backed up original frontend package.json
)

REM Replace with simplified versions
copy package-simple.json package.json
copy backend\package-simple.json backend\package.json
copy frontend\package-simple.json frontend\package.json

echo [INFO] Using simplified package.json files

REM Install root dependencies
echo [INFO] Installing root dependencies...
npm install

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Create .env file
echo [INFO] Creating .env file...
if not exist .env (
    (
        echo # Launch On Los (LOL) - Environment Configuration
        echo RPC_URL=https://rpc.analos.io/
        echo EXPLORER_URL=https://explorer.analos.io/
        echo PORT=3001
        echo NODE_ENV=development
        echo CORS_ORIGIN=http://localhost:3000
        echo JWT_SECRET=your_jwt_secret_here
        echo ENCRYPTION_KEY=your_32_character_encryption_key_here
    ) > .env
    echo [SUCCESS] .env file created
) else (
    echo [WARNING] .env file already exists
)

REM Create start script
echo [INFO] Creating start script...
(
    echo @echo off
    echo echo 🚀 Starting Launch On Los (LOL) - All Services
    echo echo ==============================================
    echo.
    echo echo Starting backend server...
    echo start "LOL Backend Server" cmd /k "cd backend && npm run dev"
    echo.
    echo timeout /t 3 /nobreak ^>nul
    echo.
    echo echo Starting frontend server...
    echo start "LOL Frontend Server" cmd /k "cd frontend && npm run dev"
    echo.
    echo echo ✅ All services started!
    echo echo Backend: http://localhost:3001
    echo echo Frontend: http://localhost:3000
    echo echo.
    echo echo Press any key to exit...
    echo pause ^>nul
) > start-all.bat

echo.
echo [SUCCESS] 🎉 Quick setup completed!
echo.
echo Next steps:
echo 1. Run 'start-all.bat' to start both servers
echo 2. Visit http://localhost:3000 to access the frontend
echo 3. Visit http://localhost:3001 to access the backend API
echo.
echo Note: This is a simplified version for quick testing.
echo For full functionality, restore the original package.json files.
echo.
pause
