@echo off
rem Monta as paginas do site a partir da pasta fonte.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0montar.ps1"
echo.
pause
