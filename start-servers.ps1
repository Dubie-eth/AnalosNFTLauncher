# Launch On Los - Server Startup Script
# This script starts both frontend and backend servers

Write-Host "🚀 Starting Launch On Los (LOL) Servers..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Start Backend Server
Write-Host "`n📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\dusti\OneDrive\Desktop\LOL\backend'; npx tsx src/simple-server.ts"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\dusti\OneDrive\Desktop\LOL\frontend'; npm run dev"

Write-Host "`n✅ Servers are starting up!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "`nPress any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
