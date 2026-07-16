@echo off
cd /d %~dp0
echo.
echo Starting TechMart AI Support...
echo.
docker-compose up -d
echo.
echo ========================================
echo   TechMart AI Support is RUNNING!
echo ========================================
echo   App       ^>^>  http://localhost:3000
echo   API       ^>^>  http://localhost:8000
echo   API Docs  ^>^>  http://localhost:8000/docs
echo ========================================
echo.
pause