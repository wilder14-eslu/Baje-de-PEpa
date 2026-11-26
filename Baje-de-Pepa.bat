@echo off
title Baje de Pepa
cd /d "%~dp0"

echo Iniciando Baje de Pepa...

:: Intentar abrir en modo aplicacion de ventana con Microsoft Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="file:///%~dp0index.html" --window-size=680,840
    exit
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="file:///%~dp0index.html" --window-size=680,840
    exit
)

:: Intentar con Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="file:///%~dp0index.html" --window-size=680,840
    exit
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="file:///%~dp0index.html" --window-size=680,840
    exit
)

:: Si no se encuentra Edge ni Chrome, abrir con el navegador predeterminado
start "" "%~dp0index.html"
exit
