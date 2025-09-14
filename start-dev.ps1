# Launch On Los (LOL) - Development Server Startup Script
# PowerShell script to start development servers

Write-Host "🚀 Starting Launch On Los (LOL) development servers..." -ForegroundColor Green

# Function to start a process in a new window
function Start-ProcessInNewWindow {
    param(
        [string]$WorkingDirectory,
        [string]$Command,
        [string]$Title
    )
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host '$Title' -ForegroundColor Yellow; $Command" -WindowStyle Normal
}

# Start Backend Server
Write-Host "Starting backend server..." -ForegroundColor Blue
Start-ProcessInNewWindow -WorkingDirectory "backend" -Command "npm run dev" -Title "LOL Backend Server"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "Starting frontend server..." -ForegroundColor Blue
Start-ProcessInNewWindow -WorkingDirectory "frontend" -Command "npm run dev" -Title "LOL Frontend Server"

Write-Host "✅ Development servers started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Demo Page: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
