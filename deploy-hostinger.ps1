#!/usr/bin/env pwsh

Write-Host "🚀 Deploying Launch On Los to Hostinger..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm install
npm run build
Write-Host "✅ Frontend build complete!" -ForegroundColor Green

Write-Host ""
Write-Host "📁 Preparing files for upload..." -ForegroundColor Yellow
Set-Location ..

if (Test-Path "hostinger-upload") {
    Remove-Item -Recurse -Force "hostinger-upload"
}
New-Item -ItemType Directory -Name "hostinger-upload"

Write-Host "Copying frontend build files..." -ForegroundColor Yellow
Copy-Item -Path "frontend\out\*" -Destination "hostinger-upload\" -Recurse -Force

Write-Host ""
Write-Host "📋 Creating upload instructions..." -ForegroundColor Yellow
$instructions = @"
# Hostinger Upload Instructions

1. Login to your Hostinger control panel
2. Go to File Manager
3. Navigate to public_html folder
4. Delete all existing files in public_html
5. Upload all files from this folder to public_html
6. Set index.html as your default page
7. Enable SSL certificate in Hostinger panel

Your site will be available at: https://launchonlos.fun

## Backend Configuration
Make sure your backend is deployed to Railway or Render with these environment variables:
- NODE_ENV=production
- CORS_ORIGIN=https://launchonlos.fun
- RPC_URL=https://rpc.analos.io/
- EXPLORER_URL=https://explorer.analos.io/

## DNS Configuration
Point your domain launchonlos.fun to your Hostinger hosting IP address.
"@

$instructions | Out-File -FilePath "hostinger-upload\UPLOAD-INSTRUCTIONS.txt" -Encoding UTF8

Write-Host ""
Write-Host "✅ Deployment files ready in 'hostinger-upload' folder!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload the contents of 'hostinger-upload' folder to your Hostinger public_html directory" -ForegroundColor White
Write-Host "2. Make sure your backend is deployed to Railway/Render" -ForegroundColor White
Write-Host "3. Update DNS settings to point launchonlos.fun to your Hostinger hosting" -ForegroundColor White
Write-Host "4. Enable SSL certificate" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your Launch On Los app will be live at https://launchonlos.fun" -ForegroundColor Green
