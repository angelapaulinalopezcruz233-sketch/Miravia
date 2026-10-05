@echo off
setlocal EnableDelayedExpansion
title ABRIR PROYECTO MIRAVIA
echo ============================================
echo   ABRIENDO EL PROYECTO MIRAVIA
echo ============================================
echo.

set "XAMPP=C:\xampp"
set "MYSQL=%XAMPP%\mysql\bin\mysql.exe"
set "PROYECTO_WEB=%~dp0"
set "PROYECTO_WEB=%PROYECTO_WEB:C:\xampp\htdocs\=%"
set "PROYECTO_WEB=%PROYECTO_WEB:\=/%"

if not exist "%MYSQL%" (
    echo No se encontro MySQL en %XAMPP%.
    echo Instala XAMPP en C:\xampp o ajusta esta ruta en ABRIR-PROYECTO.bat.
    pause
    exit /b 1
)

REM Enciende MySQL para que el registro y el acceso puedan usar la base.
tasklist /FI "IMAGENAME eq mysqld.exe" | find /I "mysqld.exe" >nul
if errorlevel 1 (
    echo MySQL esta apagado. Encendiendolo...
    start "" "%XAMPP%\mysql_start.bat"
) else (
    echo MySQL ya esta encendido.
)
set /a INTENTOS=0

:ESPERAR_MYSQL
"%MYSQL%" -u root -N -s -e "SELECT 1" >nul 2>&1
if not errorlevel 1 goto MYSQL_LISTO
set /a INTENTOS+=1
if !INTENTOS! GEQ 15 goto MYSQL_ERROR
timeout /t 2 /nobreak >nul
goto ESPERAR_MYSQL

:MYSQL_ERROR
echo MySQL no inicio. Revisa XAMPP y vuelve a intentar.
pause
exit /b 1

:MYSQL_LISTO

REM Crea las tablas solo si todavia no existe la tabla de usuarios.
set "USUARIOS_LISTOS="
for /f "delims=" %%A in ('"%MYSQL%" -u root -N -s -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='miravia_db' AND TABLE_NAME='usuarios'" 2^>nul') do set "USUARIOS_LISTOS=%%A"
if not "%USUARIOS_LISTOS%"=="1" (
    echo Inicializando la base de datos MIRAVIA...
    "%MYSQL%" -u root < "%~dp0database\miravia.sql"
    if errorlevel 1 (
        echo No se pudo inicializar miravia_db. Revisa el error anterior.
        pause
        exit /b 1
    )
) else (
    echo La base miravia_db ya existe; se conservan sus cuentas y datos.
)

REM Enciende Apache si esta apagado.
tasklist /FI "IMAGENAME eq httpd.exe" | find /I "httpd.exe" >nul
if errorlevel 1 (
    echo Apache esta apagado. Encendiendolo...
    start "" "%XAMPP%\apache_start.bat"
    timeout /t 6 /nobreak >nul
) else (
    echo Apache ya esta encendido.
)

REM Abre el proyecto desde su ruta actual dentro de htdocs.
start "" "http://localhost/%PROYECTO_WEB%inicio.html"

echo.
echo Listo. Si la pagina no carga, espera unos
echo segundos y oprime F5 (o Ctrl+F5).
timeout /t 5 /nobreak >nul
           