@echo off
echo Starting both Backend and Frontend...

echo Starting Django Backend...
start "Backend" cmd /k "cd backend && python manage.py runserver"

timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting...
echo Backend: http://localhost:8000/
echo Frontend: http://localhost:5173/
pause
