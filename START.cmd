@echo off
cd /d "%~dp0app"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer from https://nodejs.org/
  pause
  exit /b 1
)
echo Open http://127.0.0.1:4173 in your browser.
echo Keep this window open while using the portfolio.
node scripts/local-preview.mjs
pause
