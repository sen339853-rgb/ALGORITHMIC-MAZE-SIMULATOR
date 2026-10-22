@echo off
echo ========================================================
echo Launching Algorithmic Maze Simulator Server
echo ========================================================
echo.
echo Starting Web GUI on http://127.0.0.1:8080 ...
start "" "http://127.0.0.1:8080"
bin\maze_game.exe --server 8080
