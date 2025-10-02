@echo off
cd
curl -O -L https://github.com/vlskop/daily_planner/archive/refs/heads/main.zip
curl -O -L https://github.com/vlskop/daily_planner/blob/main/Launch.bat
tar -xf main.zip
echo Starting Planner Application...
start msedge --app="file:///%CD%/daily_planner-main/index.html"