# SEMESTER 3 DATA STRUCTURES & ALGORITHMS PROJECT REPORT
## Maze Generator & BFS Shortest Path Solver

---

### Project Title:
**Procedural Maze Generator and BFS Pathfinding Visualizer**

### Academic Level:
**Semester 3 — Data Structures and Algorithms (DSA) + Object-Oriented Programming (OOP)**

### Core Languages & Technologies:
- **C++ (C++14 / Standard Library):** Core procedural maze generation, BFS algorithm, queue management, parent pointer reconstruction, and interactive CLI.
- **HTML5 & Vanilla CSS3:** Modern graphical visualization using CSS Grid and state tabs *(Zero JavaScript required)*.

---

## 1. Project Objectives & Scope

1. **Procedural Maze Generation:** Generate non-trivial, randomized, solvable mazes using Depth-First Search with backtracking.
2. **Breadth-First Search (BFS) Solver:** Implement the BFS graph traversal algorithm using a FIFO Queue (`std::queue`) to find the mathematically proven shortest path in unweighted 2D grid graphs.
3. **Parent Pointer Backtracking:** Reconstruct the exact path from Start `(1,1)` to End `(rows-2, cols-2)` using cell parent pointers.
4. **Three Difficulty Levels:**
   - **Level 1 (Easy):** 11 &times; 11 grid
   - **Level 2 (Medium):** 15 &times; 15 grid
   - **Level 3 (Hard):** 21 &times; 21 grid
5. **Interactive Console & Pure HTML/CSS UI:** Provide both an interactive C++ console experience and a web visualizer that requires no client-side JavaScript.

---

## 2. Data Structures & Algorithms (DSA) Analysis

### A. 2D Matrix Grid Representation
- The maze is stored as a 2-dimensional vector of `Cell` objects: `std::vector<std::vector<Cell>>`.
- Each cell contains its `(row, col)` coordinate, `CellState` (`WALL`, `PATH`, `START`, `END`, `VISITED`, `SOLUTION`), and a pointer `Cell* parent`.

### B. BFS Algorithm Using a FIFO Queue
- **Initialization:** Enqueue Start node `(1, 1)`, mark as visited, set parent to `nullptr`.
- **Level-Order Traversal:** While queue is not empty:
  - Dequeue current cell `cur`.
  - If `cur == end`, terminate search.
  - For each unvisited orthogonal walkable neighbor `next`:
    - Mark `next` as visited.
    - Set `next->parent = cur`.
    - Enqueue `next`.
- **Shortest Path Guarantee:** In unweighted graphs, BFS explores vertices in strictly non-decreasing order of their distance from the source.
- **Complexity:**
  - **Time:** $\mathcal{O}(V + E) = \mathcal{O}(R \times C)$
  - **Space:** $\mathcal{O}(V)$ for queue and visited storage.

---

## 3. Object-Oriented Design (OOP) Principles

1. **Encapsulation:** Cell states and private grid dimensions are protected with accessors (`getState()`, `setParent()`, `isWalkable()`).
2. **Composition:** The `Game` class composes `Maze`, `MazeGenerator`, `BFSSolver`, and `Visualizer`.
3. **Inheritance & Polymorphism:** `BFSSolver` inherits from the abstract `Solver` base class and overrides `bool solve()`.
4. **Single Responsibility Principle (SRP):** `HtmlExporter` handles HTML/CSS generation independently from algorithm logic.

---

## 4. Compilation and Usage

- **Build:** `cmd.exe /c build.bat` or `make`
- **Console Application:** `bin\maze_game.exe`
- **Web Interface:** Open `index.html` in any web browser.
