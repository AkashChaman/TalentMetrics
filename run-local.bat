@echo off
echo Starting TalentMetrics localhost servers...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd /d d:\Work\TalentMetrics\TalentMetrics\backend && npm run dev"

REM Start frontend in new window
start "Frontend Server" cmd /k "cd /d d:\Work\TalentMetrics\TalentMetrics\frontend && npm start"

echo.
echo Servers starting... 
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul