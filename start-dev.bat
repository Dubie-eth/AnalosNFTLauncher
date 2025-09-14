@echo off
echo 🚀 Starting Launch On Los (LOL) development servers...

echo Starting backend server...
start "LOL Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "LOL Frontend Server" cmd /k "cd frontend && npm run dev"

echo ✅ Development servers started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Demo Page: http://localhost:8000
echo.
echo Press any key to exit...
pause >nul
