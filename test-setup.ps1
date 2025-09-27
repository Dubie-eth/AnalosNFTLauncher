# Test Setup Script for Analos NFT Launcher
Write-Host "🧪 Testing Analos NFT Launcher Setup..." -ForegroundColor Green
Write-Host ""

# Test 1: Check if Node.js is installed
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Test 2: Check if Yarn is installed
Write-Host "2. Checking Yarn..." -ForegroundColor Yellow
try {
    $yarnVersion = yarn --version
    Write-Host "   ✅ Yarn version: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Yarn not found. Please install Yarn" -ForegroundColor Red
    exit 1
}

# Test 3: Check if directories exist
Write-Host "3. Checking project structure..." -ForegroundColor Yellow
$directories = @("backend", "frontend", "contracts", "shared")
foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir directory exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir directory missing" -ForegroundColor Red
    }
}

# Test 4: Check if dependencies are installed
Write-Host "4. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Backend dependencies not installed. Run: cd backend && yarn install" -ForegroundColor Yellow
}

if (Test-Path "frontend/node_modules") {
    Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend dependencies not installed. Run: cd frontend && yarn install" -ForegroundColor Yellow
}

# Test 5: Check if ports are available
Write-Host "5. Checking port availability..." -ForegroundColor Yellow
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "   ⚠️  Port $port is in use" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Port $port is available" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start the servers: Double-click start-dev.bat or run manually" -ForegroundColor White
Write-Host "2. Open http://localhost:3000/mint in your browser" -ForegroundColor White
Write-Host "3. Connect your wallet (set to Analos network)" -ForegroundColor White
Write-Host "4. Test the mint flow" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
