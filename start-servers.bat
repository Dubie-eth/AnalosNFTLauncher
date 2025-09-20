@echo off
echo 🚀 Starting Launch On Los (LOL) Servers...
echo =========================================

echo.
echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd /d C:\Users\dusti\OneDrive\Desktop\LOL\backend && npx tsx src/simple-server.ts"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo 🌐 Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\Users\dusti\OneDrive\Desktop\LOL\frontend && npm run dev"

echo.
echo ✅ Servers are starting up!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
