@echo off
echo 🚀 Deploying Launch On Los to Hostinger (Simple Version)...
echo.

echo 📁 Preparing files for upload...
if exist "hostinger-upload" rmdir /s /q "hostinger-upload"
mkdir "hostinger-upload"

echo Copying frontend files...
copy "frontend-simple.html" "hostinger-upload\index.html"

echo.
echo 📋 Creating upload instructions...
echo # Hostinger Upload Instructions > hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo. >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 1. Login to your Hostinger control panel >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 2. Go to File Manager >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 3. Navigate to public_html folder >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 4. Delete all existing files in public_html >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 5. Upload index.html to public_html >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 6. Set index.html as your default page >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 7. Enable SSL certificate in Hostinger panel >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo. >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo Your site will be available at: https://launchonlos.fun >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo. >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo Backend API: https://lol-backend-api.onrender.com >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt

echo.
echo ✅ Deployment files ready in 'hostinger-upload' folder!
echo.
echo 📝 Next steps:
echo 1. Upload index.html to your Hostinger public_html directory
echo 2. Make sure your backend is deployed to Render
echo 3. Update DNS settings to point launchonlos.fun to your Hostinger hosting
echo 4. Enable SSL certificate
echo.
echo 🎉 Your Launch On Los app will be live at https://launchonlos.fun
pause
