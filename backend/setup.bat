@echo off
echo Setting up Django Backend...

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running database migrations...
python manage.py migrate

echo Creating superuser (optional)...
echo You can skip this step by pressing Ctrl+C
python manage.py createsuperuser

echo Backend setup complete!
echo Run 'python manage.py runserver' to start the server
pause
