@echo off
echo ========================================
echo   Dung ung dung quan ly sinh vien
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
