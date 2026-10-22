# Maze Generator & BFS Solver

> **Semester 3 Data Structures & Algorithms (DSA) & Object-Oriented Programming (OOP) Project**  
> **Core Language:** C++ (Standard Library)  
> **Frontend:** Pure HTML5 & Vanilla CSS3 *(Zero JavaScript required)*  

---

## 1. Project Overview

This project is a 3rd-semester computer science project that integrates **Data Structures & Algorithms (DSA)** with **Object-Oriented Programming (OOP)** in C++ alongside a clean web-based visualizer in pure HTML and CSS.

The system features:
1. **Procedural Maze Generation:** Generates randomized, solvable 2D mazes using Depth-First Search (DFS) with recursive backtracking.
2. **Breadth-First Search (BFS) Solver:** Finds and reconstructs the **guaranteed shortest path** from Start (S) to Goal (E) using a FIFO Queue (`std::queue`) and parent pointer backtracking.
3. **Interactive Console Mode:** Playable terminal mode with WASD / Arrow key movement and wall collision detection.
4. **Pure HTML & CSS Web Visualizer:** Generates an interactive web interface using CSS Grid and CSS state tabs—**requiring zero JavaScript or external web servers**.

---

## 2. Difficulty Levels (Up to Level 3)

The project is structured with exactly 3 progressive difficulty levels:

| Level | Difficulty | Grid Dimensions | Explored Complexity |
|---|---|---|---|
| **Level 1** | **Easy** | 11 &times; 11 | Compact grid, instant traversal |
| **Level 2** | **Medium** | 15 &times; 15 | Moderate labyrinth with multiple branches |
| **Level 3** | **Hard** | 21 &times; 21 | Dense corridors testing queue expansion |

---

## 3. Data Structures & Algorithms (DSA) Concepts

### A. Breadth-First Search (BFS) & FIFO Queue
- **Data Structure:** `std::queue<Cell*>`
- **Mechanism:** Explores unweighted grid coordinates level-by-level in radial layers from the Start node.
- **Optimality:** Mathematically guarantees finding the shortest path because all nodes at distance $k$ are evaluated before nodes at distance $k+1$.
- **Time Complexity:** $\mathcal{O}(V + E) = \mathcal{O}(R \times C)$
- **Space Complexity:** $\mathcal{O}(V)$ for the FIFO queue and visited matrix.

### B. Path Reconstruction (Parent Pointers)
- Each `Cell` contains a pointer `Cell* parent`.
- When neighbor `v` is discovered from `u`, `v->setParent(u)`.
- Once the Goal node `E` is dequeued, the shortest path is reconstructed by following parent pointers backward from `E` to `S`, then reversed.

### C. Procedural Maze Generation (DFS Passage Carver)
- Starts with a solid grid of walls (`#`).
- Uses a stack to carve open pathways 2 steps at a time to maintain grid partitions, ensuring that a valid path always exists between Start and End.

---

## 4. Object-Oriented Programming (OOP) Architecture

```
                  +-------------------+
                  |      <<App>>      |
                  |       Game        |
                  +---------+---------+
                            |
         +------------------+------------------+
         | (Composition)    | (Composition)    | (Composition)
         v                  v                  v
   +-----------+    +---------------+    +-------------------+
   |   Maze    |    | MazeGenerator |    |     BFSSolver     |
   +-----+-----+    +---------------+    +---------+---------+
         | (Composition)                           | (Inheritance)
         v                                         v
   +-----------+                         +-------------------+
   |   Cell    |                         |  Solver (Abstract)|
   +-----------+                         +-------------------+
```

- **Encapsulation:** Cell states (`WALL`, `PATH`, `START`, `END`, `VISITED`, `SOLUTION`) and grid coordinates are protected within classes with strict getter/setter interfaces.
- **Composition:** `Maze` contains a 2D matrix of `Cell` objects; `Game` aggregates `Maze`, `MazeGenerator`, `BFSSolver`, and `Visualizer`.
- **Inheritance:** `BFSSolver` derives from abstract base class `Solver`.

---

## 5. How to Compile and Run

### Prerequisites
- Windows OS
- MinGW / GCC C++ compiler (`g++`)

### Step 1: Compile the C++ Program
Run the provided batch script:
```powershell
.\build.bat
```
or use `make`:
```powershell
make
```
This generates the executable at `bin\maze_game.exe`.

### Step 2: Run Interactive Console Mode
```powershell
bin\maze_game.exe
```

**Console Menu Options:**
- `[1]` Manual Play (WASD controls)
- `[2]` Solve using BFS (Queue - Guaranteed Shortest Path)
- `[3]` Select Difficulty Level (Level 1 to 3)
- `[4]` Regenerate Current Maze
- `[5]` Export to HTML/CSS & Open in Web Browser
- `[6]` Next Level
- `[7]` Preview Maze Grid in Console
- `[8]` Exit

### Step 3: View the Pure HTML & CSS Visualizer
Simply double-click [`index.html`](file:///c:/Users/ASPIRE/OneDrive/Documents/Desktop/maze%20generator/index.html) or open it in any web browser!

- Click **Level 1**, **Level 2**, or **Level 3** in the sidebar to switch difficulty levels instantly.
- Click **Toggle BFS Solution Path** to view or hide the BFS shortest path.
- *Zero JavaScript is used — the entire UI operates seamlessly via pure CSS Grid and CSS state tabs!*
