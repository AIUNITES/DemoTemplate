@echo off
echo Killing Python tray monitors...
taskkill /F /IM pythonw.exe 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *tray*" 2>nul
echo Done.
timeout /t 2
