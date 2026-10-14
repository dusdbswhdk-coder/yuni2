@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:8765 in your browser.
py -3 -m uvicorn app:app --host 127.0.0.1 --port 8765
if errorlevel 1 pause
