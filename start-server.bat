@echo off
title DemoTemplate Local Server
cd /d "C:\Users\Tom\Documents\GitHub\DemoTemplate"
echo ========================================
echo   DemoTemplate Local Server
echo   http://127.0.0.1:8080
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080 --bind 127.0.0.1
pause
