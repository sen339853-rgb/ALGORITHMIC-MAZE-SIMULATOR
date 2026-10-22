@echo off
echo ========================================================
echo Building Maze Generator and BFS Solver (3rd Semester DSA)
echo ========================================================

if not exist bin mkdir bin

g++ -std=c++14 -O2 -Wall -Iinclude src/Cell.cpp src/Maze.cpp src/MazeGenerator.cpp src/Solver.cpp src/DFSSolver.cpp src/BFSSolver.cpp src/AStarSolver.cpp src/DijkstraSolver.cpp src/GreedyBestFirstSolver.cpp src/HttpServer.cpp src/Visualizer.cpp src/HtmlExporter.cpp src/Game.cpp src/main.cpp -lws2_32 -o bin\maze_game.exe

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Compilation succeeded!
    echo Executable generated at: bin\maze_game.exe
    echo.
    echo To run interactive console: bin\maze_game.exe
    echo To run web GUI server:      bin\maze_game.exe --server 8080
    echo To benchmark all solvers:   bin\maze_game.exe --benchmark
    echo To export Level 1 HTML:     bin\maze_game.exe --level 1 --solve --export index.html
) else (
    echo.
    echo [ERROR] Build failed with exit code %ERRORLEVEL%.
)
