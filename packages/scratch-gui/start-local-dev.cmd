@echo off
cd /d "%~dp0"
echo Starting Scratch GUI dev server...
echo Keep this window open, then visit http://127.0.0.1:8601/
start "Scratch AI help proxy" /min node scripts\ai-help-server.mjs
node ..\..\node_modules\webpack-cli\bin\cli.js serve --host 127.0.0.1
if errorlevel 1 (
  echo.
  echo Dev server exited with an error.
  pause
)
