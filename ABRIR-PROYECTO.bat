@echo off
title ABRIR PROYECTO MIRAVIA
echo ============================================
echo   ABRIENDO EL PROYECTO MIRAVIA
echo ============================================
echo.

REM 1) Enciende Apache si esta apagado
tasklist /FI "IMAGENAME eq httpd.exe" | find /I "httpd.exe" >nul
if errorlevel 1 (
    echo Apache esta apagado. Encendiendolo...
    start "" "C:\xampp\apache_start.bat"
    timeout /t 6 /nobreak >nul
) else (
    echo Apache ya esta encendido.
)

REM 2) Abre la pagina de viaje en tu navegador
start "" "http://localhost/Turismo/inicio.html"

echo.
echo Listo. Si la pagina no carga, espera unos
echo segundos y oprime F5 (o Ctrl+F5).
timeout /t 5 /nobreak >nul
           