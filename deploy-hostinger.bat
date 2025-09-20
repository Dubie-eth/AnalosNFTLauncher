@echo off
echo 🚀 Deploying Launch On Los to Hostinger...
echo.

echo 📦 Building frontend for production...
cd frontend
call npm install
call npm run build
echo ✅ Frontend build complete!

echo.
echo 📁 Preparing files for upload...
cd ..
if exist "hostinger-upload" rmdir /s /q "hostinger-upload"
mkdir "hostinger-upload"

echo Copying frontend build files...
xcopy "frontend\out\*" "hostinger-upload\" /E /I /Y

echo.
echo 📋 Creating upload instructions...
echo # Hostinger Upload Instructions > hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo. >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 1. Login to your Hostinger control panel >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 2. Go to File Manager >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 3. Navigate to public_html folder >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 4. Delete all existing files in public_html >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 5. Upload all files from this folder to public_html >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 6. Set index.html as your default page >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo 7. Enable SSL certificate in Hostinger panel >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo. >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt
echo Your site will be available at: https://launchonlos.fun >> hostinger-upload\UPLOAD-INSTRUCTIONS.txt

echo.
echo ✅ Deployment files ready in 'hostinger-upload' folder!
echo.
echo 📝 Next steps:
echo 1. Upload the contents of 'hostinger-upload' folder to your Hostinger public_html directory
echo 2. Make sure your backend is deployed to Railway/Render
echo 3. Update DNS settings to point launchonlos.fun to your Hostinger hosting
echo 4. Enable SSL certificate
echo.
echo 🎉 Your Launch On Los app will be live at https://launchonlos.fun
pause
