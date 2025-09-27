@echo off
echo Starting Analos NFT Launcher Development Servers...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd backend && yarn dev"

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd frontend && yarn dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Mint Page: http://localhost:3000/mint
echo.
echo Press any key to exit...
pause > nul