@echo off
REM Production Initialization Script for Sustain ESG Platform (Windows)
REM This script sets up the database and loads all Excel data

echo 🚀 Starting Sustain ESG Platform Initialization...

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists
if not exist "env\" (
    echo ❌ Virtual environment not found. Please create it first:
    echo    python -m venv env
    echo    env\Scripts\activate
    echo    pip install -r requirements.txt
    exit /b 1
)

REM Activate virtual environment (Windows)
call env\Scripts\activate.bat

echo 📊 Running database migrations...
python manage.py migrate

echo 📋 Loading Excel data into database...
python manage.py load_excel_data --force

echo 👤 Creating superuser (if needed)...
python manage.py shell -c "from api.models import CustomUser; CustomUser.objects.filter(username='admin').exists() or CustomUser.objects.create_superuser('admin', 'admin@sustain.com', 'admin123') and print('✅ Superuser created: admin/admin123') or print('✅ Superuser already exists')"

echo 🎉 Initialization complete!
echo.
echo 🌐 To start the servers:
echo    Backend:  python manage.py runserver
echo    Frontend: cd ..\frontend ^&^& npm run dev
echo.
echo 🔑 Admin credentials: admin/admin123
echo 📊 Admin panel: http://127.0.0.1:8000/admin/
echo 🖥️  Frontend: http://localhost:3000