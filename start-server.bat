@echo off
title DemoTemplate Local Server
cd /d "%~dp0"
echo ========================================
echo   DemoTemplate Local Server
echo   http://localhost:8000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000 --bind 127.0.0.1
pause
