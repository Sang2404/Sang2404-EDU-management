@echo off
echo ========================================
echo   Stopping Student Management System
echo ========================================
echo.

echo Stopping Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause
