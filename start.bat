@echo off
title GripFit Local Server
cd /d %~dp0

echo =========================================
echo Starting GripFit App Local Dev Server...
echo =========================================
echo.

npm run dev

pause
