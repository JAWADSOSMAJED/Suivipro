@echo off
setlocal
cd /d "%~dp0"
title ChantierPro - serveur local

where python >nul 2>nul
if errorlevel 1 goto nopython

echo.
echo  ChantierPro - demarrage du serveur local
echo  Adresse : http://localhost:8765
echo.
echo  Laissez cette fenetre ouverte pendant l'utilisation du site.
echo  Fermez-la pour arreter le serveur.
echo.

start "ChantierPro - serveur" /min cmd /c "python -m http.server 8765 --bind 127.0.0.1"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8765/"
echo  Le site est ouvert dans votre navigateur.
echo.
pause
exit /b 0

:nopython
echo.
echo  Python n'est pas installe sur ce poste.
echo  Ouverture directe du site avec le navigateur par defaut...
echo.
start "" "%~dp0index.html"
exit /b 0
