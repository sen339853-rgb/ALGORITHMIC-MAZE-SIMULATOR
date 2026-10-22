CXX = g++
CXXFLAGS = -std=c++14 -O2 -Wall -Iinclude
TARGET = bin/maze_game.exe

SRCS = src/Cell.cpp \
       src/Maze.cpp \
       src/MazeGenerator.cpp \
       src/Solver.cpp \
       src/DFSSolver.cpp \
       src/BFSSolver.cpp \
       src/AStarSolver.cpp \
       src/DijkstraSolver.cpp \
       src/GreedyBestFirstSolver.cpp \
       src/HttpServer.cpp \
       src/Visualizer.cpp \
       src/HtmlExporter.cpp \
       src/Game.cpp \
       src/main.cpp

LDFLAGS = -lws2_32

all: $(TARGET)

$(TARGET): $(SRCS)
	@if not exist bin mkdir bin
	$(CXX) $(CXXFLAGS) $(SRCS) $(LDFLAGS) -o $(TARGET)

clean:
	@if exist bin rmdir /s /q bin

run: $(TARGET)
	@$(TARGET)

.PHONY: all clean run
