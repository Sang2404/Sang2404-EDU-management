@echo off
echo ========================================
echo   Student Management System
echo   Starting Backend and Frontend...
echo ========================================
echo.

REM Start Backend
echo [1/2] Starting Backend (Port 5001)...
start "Backend Server" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend (Port 3000)...
start "Frontend Dev Server" cmd /k "cd web-app && npm run dev"

echo.
echo ========================================
echo   Application Started!
echo ========================================
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
