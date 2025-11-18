@echo off
echo Setting up Glammy Salon Website...

echo.
echo ========================================
echo Setting up Backend (Django)
echo ========================================
cd backend
call setup.bat
cd ..

echo.
echo ========================================
echo Setting up Frontend (React)
echo ========================================
cd frontend
call setup.bat
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Run 'start-both.bat' to start both servers
echo 2. Or run 'start-backend.bat' and 'start-frontend.bat' separately
echo.
echo Backend: http://localhost:8000/
echo Frontend: http://localhost:5173/
echo.
pause
