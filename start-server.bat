@echo off
echo.
echo ========================================
echo   GlucoBalance Development Server
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo.
    echo 💡 Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is available
echo.

REM Start the server
echo 🚀 Starting GlucoBalance server...
echo.
node server.js

pause