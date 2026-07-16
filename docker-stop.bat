@echo off
cd /d %~dp0
echo Stopping TechMart AI Support...
docker-compose down
echo All containers stopped.
pause