@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  start "Chrono Adventure Server" /min py -m http.server 8000
  timeout /t 1 /nobreak >nul
  start "CHRONO ADVENTURE — AI MULTIVERSE" http://localhost:8000/index.html
  echo Game opened in your browser.
  echo You can close this window after finishing the game.
  exit /b
)
where python >nul 2>&1
if %errorlevel%==0 (
  start "Chrono Adventure Server" /min python -m http.server 8000
  timeout /t 1 /nobreak >nul
  start "CHRONO ADVENTURE — AI MULTIVERSE" http://localhost:8000/index.html
  echo Game opened in your browser.
  echo You can close this window after finishing the game.
  exit /b
)
start "CHRONO ADVENTURE — AI MULTIVERSE" "%~dp0index.html"
echo Python was not found, so the game was opened directly.
pause
