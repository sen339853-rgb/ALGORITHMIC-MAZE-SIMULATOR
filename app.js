/**
 * Algorithmic Maze Simulator - Core Engine & Interactive Controller
 * Multi-algorithm maze generation and pathfinding platform.
 * Connects directly to native C++ backend when online, with pure DSA fallback when standalone.
 */

// ==========================================
// 1. DATA STRUCTURES & DSA IMPLEMENTATIONS
// ==========================================

class MinHeap {
    constructor(comparator = (a, b) => a - b) {
        this.heap = [];
        this.comparator = comparator;
    }
    size() { return this.heap.length; }
    isEmpty() { return this.heap.length === 0; }
    peek() { return this.heap[0] || null; }
    push(val) {
        this.heap.push(val);
        this._bubbleUp(this.heap.length - 1);
    }
    pop() {
        if (this.isEmpty()) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this._sinkDown(0);
        }
        return top;
    }
    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.comparator(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else break;
        }
    }
    _sinkDown(idx) {
        const len = this.heap.length;
        while (true) {
            let left = 2 * idx + 1;
            let right = 2 * idx + 2;
            let smallest = idx;
            if (left < len && this.comparator(this.heap[left], this.heap[smallest]) < 0) smallest = left;
            if (right < len && this.comparator(this.heap[right], this.heap[smallest]) < 0) smallest = right;
            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else break;
        }
    }
}

// Helpers
function manhattan(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function getWalkableNeighbors(grid, rows, cols, r, c) {
    const dr = [-1, 1, 0, 0];
    const dc = [0, 0, -1, 1];
    const neighbors = [];
    for (let i = 0; i < 4; i++) {
        const nr = r + dr[i];
        const nc = c + dc[i];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (grid[nr][nc] !== 0) { // 0 is wall
                neighbors.push({ r: nr, c: nc });
            }
        }
    }
    return neighbors;
}

// Reconstruct path from parent map
function reconstructPathFromMap(parentMap, start, end) {
    const path = [];
    let curKey = `${end.r},${end.c}`;
    const startKey = `${start.r},${start.c}`;

    while (curKey) {
        const [r, c] = curKey.split(',').map(Number);
        path.push({ r, c });
        if (curKey === startKey) break;
        curKey = parentMap.get(curKey) || null;
    }

    if (path.length === 0 || `${path[path.length - 1].r},${path[path.length - 1].c}` !== startKey) {
        return [];
    }
    return path.reverse();
}

// Client-side DSA Solvers (Exact match to C++ Solvers)
const ClientSolvers = {
    bfs(grid, rows, cols, start, end) {
        const t0 = performance.now();
        const queue = [{ r: start.r, c: start.c }];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parentMap = new Map();
        const explorationTrace = [];
        let cellsDiscovered = 1;
        let nodesExplored = 0;
        let reached = false;

        visited[start.r][start.c] = true;

        while (queue.length > 0) {
            const cur = queue.shift();
            nodesExplored++;
            explorationTrace.push({ r: cur.r, c: cur.c });

            if (cur.r === end.r && cur.c === end.c) {
                reached = true;
                break;
            }

            const neighbors = getWalkableNeighbors(grid, rows, cols, cur.r, cur.c);
            for (const n of neighbors) {
                if (!visited[n.r][n.c]) {
                    visited[n.r][n.c] = true;
                    parentMap.set(`${n.r},${n.c}`, `${cur.r},${cur.c}`);
                    cellsDiscovered++;
                    queue.push(n);
                }
            }
        }

        const t1 = performance.now();
        const path = reached ? reconstructPathFromMap(parentMap, start, end) : [];

        return {
            success: reached,
            algorithm: 'Breadth-First Search (BFS)',
            dataStructure: 'std::queue (FIFO Queue)',
            nodesExplored,
            cellsDiscovered,
            pathLength: path.length > 0 ? path.length - 1 : 0,
            executionTimeMs: +(t1 - t0).toFixed(4),
            explorationTrace,
            solutionPath: path
        };
    },

    dfs(grid, rows, cols, start, end) {
        const t0 = performance.now();
        const stack = [{ r: start.r, c: start.c }];
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parentMap = new Map();
        const explorationTrace = [];
        let cellsDiscovered = 1;
        let nodesExplored = 0;
        let reached = false;

        visited[start.r][start.c] = true;

        while (stack.length > 0) {
            const cur = stack.pop();
            nodesExplored++;
            explorationTrace.push({ r: cur.r, c: cur.c });

            if (cur.r === end.r && cur.c === end.c) {
                reached = true;
                break;
            }

            const neighbors = getWalkableNeighbors(grid, rows, cols, cur.r, cur.c);
            for (const n of neighbors) {
                if (!visited[n.r][n.c]) {
                    visited[n.r][n.c] = true;
                    parentMap.set(`${n.r},${n.c}`, `${cur.r},${cur.c}`);
                    cellsDiscovered++;
                    stack.push(n);
                }
            }
        }

        const t1 = performance.now();
        const path = reached ? reconstructPathFromMap(parentMap, start, end) : [];

        return {
            success: reached,
            algorithm: 'Depth-First Search (DFS)',
            dataStructure: 'std::stack (LIFO Stack)',
            nodesExplored,
            cellsDiscovered,
            pathLength: path.length > 0 ? path.length - 1 : 0,
            executionTimeMs: +(t1 - t0).toFixed(4),
            explorationTrace,
            solutionPath: path
        };
    },

    astar(grid, rows, cols, start, end) {
        const t0 = performance.now();
        const pq = new MinHeap((a, b) => a.f === b.f ? a.g - b.g : a.f - b.f);
        const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parentMap = new Map();
        const explorationTrace = [];
        let cellsDiscovered = 1;
        let nodesExplored = 0;
        let reached = false;

        gScore[start.r][start.c] = 0;
        pq.push({ r: start.r, c: start.c, g: 0, f: manhattan(start.r, start.c, end.r, end.c) });

        while (!pq.isEmpty()) {
            const cur = pq.pop();
            if (visited[cur.r][cur.c]) continue;
            visited[cur.r][cur.c] = true;
            nodesExplored++;
            explorationTrace.push({ r: cur.r, c: cur.c });

            if (cur.r === end.r && cur.c === end.c) {
                reached = true;
                break;
            }

            const neighbors = getWalkableNeighbors(grid, rows, cols, cur.r, cur.c);
            for (const n of neighbors) {
                if (visited[n.r][n.c]) continue;
                const tentG = cur.g + 1;
                if (tentG < gScore[n.r][n.c]) {
                    gScore[n.r][n.c] = tentG;
                    parentMap.set(`${n.r},${n.c}`, `${cur.r},${cur.c}`);
                    const h = manhattan(n.r, n.c, end.r, end.c);
                    pq.push({ r: n.r, c: n.c, g: tentG, f: tentG + h });
                    cellsDiscovered++;
                }
            }
        }

        const t1 = performance.now();
        const path = reached ? reconstructPathFromMap(parentMap, start, end) : [];

        return {
            success: reached,
            algorithm: 'A* Search',
            dataStructure: 'std::priority_queue (Min-Heap f = g + h)',
            nodesExplored,
            cellsDiscovered,
            pathLength: path.length > 0 ? path.length - 1 : 0,
            executionTimeMs: +(t1 - t0).toFixed(4),
            explorationTrace,
            solutionPath: path
        };
    },

    dijkstra(grid, rows, cols, start, end) {
        const t0 = performance.now();
        const pq = new MinHeap((a, b) => a.dist - b.dist);
        const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parentMap = new Map();
        const explorationTrace = [];
        let cellsDiscovered = 1;
        let nodesExplored = 0;
        let reached = false;

        dist[start.r][start.c] = 0;
        pq.push({ r: start.r, c: start.c, dist: 0 });

        while (!pq.isEmpty()) {
            const cur = pq.pop();
            if (visited[cur.r][cur.c]) continue;
            visited[cur.r][cur.c] = true;
            nodesExplored++;
            explorationTrace.push({ r: cur.r, c: cur.c });

            if (cur.r === end.r && cur.c === end.c) {
                reached = true;
                break;
            }

            const neighbors = getWalkableNeighbors(grid, rows, cols, cur.r, cur.c);
            for (const n of neighbors) {
                if (visited[n.r][n.c]) continue;
                const newDist = cur.dist + 1;
                if (newDist < dist[n.r][n.c]) {
                    dist[n.r][n.c] = newDist;
                    parentMap.set(`${n.r},${n.c}`, `${cur.r},${cur.c}`);
                    pq.push({ r: n.r, c: n.c, dist: newDist });
                    cellsDiscovered++;
                }
            }
        }

        const t1 = performance.now();
        const path = reached ? reconstructPathFromMap(parentMap, start, end) : [];

        return {
            success: reached,
            algorithm: "Dijkstra's Algorithm",
            dataStructure: 'std::priority_queue (Min-Heap dist)',
            nodesExplored,
            cellsDiscovered,
            pathLength: path.length > 0 ? path.length - 1 : 0,
            executionTimeMs: +(t1 - t0).toFixed(4),
            explorationTrace,
            solutionPath: path
        };
    },

    greedy(grid, rows, cols, start, end) {
        const t0 = performance.now();
        const pq = new MinHeap((a, b) => a.h - b.h);
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const inQueue = Array.from({ length: rows }, () => Array(cols).fill(false));
        const parentMap = new Map();
        const explorationTrace = [];
        let cellsDiscovered = 1;
        let nodesExplored = 0;
        let reached = false;

        pq.push({ r: start.r, c: start.c, h: manhattan(start.r, start.c, end.r, end.c) });
        inQueue[start.r][start.c] = true;

        while (!pq.isEmpty()) {
            const cur = pq.pop();
            if (visited[cur.r][cur.c]) continue;
            visited[cur.r][cur.c] = true;
            nodesExplored++;
            explorationTrace.push({ r: cur.r, c: cur.c });

            if (cur.r === end.r && cur.c === end.c) {
                reached = true;
                break;
            }

            const neighbors = getWalkableNeighbors(grid, rows, cols, cur.r, cur.c);
            for (const n of neighbors) {
                if (!visited[n.r][n.c] && !inQueue[n.r][n.c]) {
                    inQueue[n.r][n.c] = true;
                    parentMap.set(`${n.r},${n.c}`, `${cur.r},${cur.c}`);
                    const h = manhattan(n.r, n.c, end.r, end.c);
                    pq.push({ r: n.r, c: n.c, h });
                    cellsDiscovered++;
                }
            }
        }

        const t1 = performance.now();
        const path = reached ? reconstructPathFromMap(parentMap, start, end) : [];

        return {
            success: reached,
            algorithm: 'Greedy Best-First Search',
            dataStructure: 'std::priority_queue (Min-Heap h)',
            nodesExplored,
            cellsDiscovered,
            pathLength: path.length > 0 ? path.length - 1 : 0,
            executionTimeMs: +(t1 - t0).toFixed(4),
            explorationTrace,
            solutionPath: path
        };
    }
};

// Procedural DFS Passage Carver (matches C++ MazeGenerator)
function generateMazeDFS(rows, cols) {
    const rCount = (rows % 2 === 0) ? rows + 1 : rows;
    const cCount = (cols % 2 === 0) ? cols + 1 : cols;

    const grid = Array.from({ length: rCount }, () => Array(cCount).fill(0)); // 0 = wall

    function carve(r, c) {
        grid[r][c] = 1;
        const dirs = [
            [-2, 0], [2, 0], [0, -2], [0, 2]
        ].sort(() => Math.random() - 0.5);

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 1 && nr < rCount - 1 && nc >= 1 && nc < cCount - 1) {
                if (grid[nr][nc] === 0) {
                    grid[r + dr / 2][c + dc / 2] = 1; // carve wall in between
                    carve(nr, nc);
                }
            }
        }
    }

    carve(1, 1);
    const start = { r: 1, c: 1 };
    const end = { r: rCount - 2, c: cCount - 2 };
    grid[start.r][start.c] = 2; // start
    grid[end.r][end.c] = 3;     // end

    return { grid, rows: rCount, cols: cCount, start, end };
}

// Quick reachability validator
function checkSolvability(grid, rows, cols, start, end) {
    const res = ClientSolvers.bfs(grid, rows, cols, start, end);
    return {
        solvable: res.success,
        pathMoves: res.pathLength,
        nodesExplored: res.nodesExplored
    };
}


// ==========================================
// 2. BACKEND INTEGRATION BRIDGE
// ==========================================

const BackendBridge = {
    serverUrl: 'http://127.0.0.1:8080',
    isOnline: false,

    async checkStatus() {
        try {
            const url = window.location.origin.includes('http') ? '/api/status' : `${this.serverUrl}/api/status`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.status === 'online') {
                    this.isOnline = true;
                    this.serverUrl = window.location.origin.includes('http') ? '' : this.serverUrl;
                    return true;
                }
            }
        } catch (e) {
            this.isOnline = false;
        }
        this.isOnline = false;
        return false;
    },

    async generate(rows, cols) {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.serverUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rows, cols })
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (e) {
                console.warn('Backend generate failed, falling back to client DSA:', e);
            }
        }
        return generateMazeDFS(rows, cols);
    },

    async solve(grid, rows, cols, start, end, algoId) {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.serverUrl}/api/solve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rows,
                        cols,
                        startR: start.r,
                        startC: start.c,
                        endR: end.r,
                        endC: end.c,
                        algorithm: algoId,
                        grid
                    })
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (e) {
                console.warn('Backend solve failed, falling back to client DSA:', e);
            }
        }

        const solverFn = ClientSolvers[algoId] || ClientSolvers.bfs;
        return solverFn(grid, rows, cols, start, end);
    },

    async benchmark(grid, rows, cols, start, end) {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.serverUrl}/api/benchmark`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rows,
                        cols,
                        startR: start.r,
                        startC: start.c,
                        endR: end.r,
                        endC: end.c,
                        grid
                    })
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (e) {
                console.warn('Backend benchmark failed, falling back to client DSA:', e);
            }
        }

        const algos = [
            { id: 'dfs', name: 'Depth-First Search (DFS)', ds: 'std::stack (LIFO)', optimal: false },
            { id: 'bfs', name: 'Breadth-First Search (BFS)', ds: 'std::queue (FIFO)', optimal: true },
            { id: 'astar', name: 'A* Search', ds: 'std::priority_queue (Min-Heap)', optimal: true },
            { id: 'dijkstra', name: "Dijkstra's Algorithm", ds: 'std::priority_queue (Min-Heap)', optimal: true },
            { id: 'greedy', name: 'Greedy Best-First Search', ds: 'std::priority_queue (Min-Heap)', optimal: false }
        ];

        return algos.map(item => {
            const solverFn = ClientSolvers[item.id];
            const res = solverFn(grid, rows, cols, start, end);
            return {
                id: item.id,
                algorithm: item.name,
                dataStructure: item.ds,
                nodesExplored: res.nodesExplored,
                cellsDiscovered: res.cellsDiscovered,
                pathMoves: res.pathLength,
                executionTimeMs: res.executionTimeMs,
                guaranteedShortest: item.optimal,
                success: res.success
            };
        });
    },

    async validate(grid, rows, cols, start, end) {
        if (this.isOnline) {
            try {
                const res = await fetch(`${this.serverUrl}/api/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rows,
                        cols,
                        startR: start.r,
                        startC: start.c,
                        endR: end.r,
                        endC: end.c,
                        grid
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    return {
                        solvable: data.valid,
                        pathMoves: data.pathLength,
                        nodesExplored: data.nodesExplored
                    };
                }
            } catch (e) {
                console.warn('Backend validate failed, falling back to client DSA:', e);
            }
        }
        return checkSolvability(grid, rows, cols, start, end);
    }
};


// ==========================================
// 3. PERSISTENT LEADERBOARD STORE
// ==========================================

const LeaderboardStore = {
    STORAGE_KEY: 'algorithmic_maze_leaderboard',

    getRecords() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) return { manual: [], algorithm: [] };
            return JSON.parse(data);
        } catch (e) {
            return { manual: [], algorithm: [] };
        }
    },

    saveRecord(record) {
        const records = this.getRecords();
        const dateStr = new Date().toLocaleString();
        const entry = { ...record, date: dateStr };

        if (record.mode === 'manual') {
            records.manual.push(entry);
            // Rank primarily by completion time, then by moves taken
            records.manual.sort((a, b) => {
                if (a.time !== b.time) return a.time - b.time;
                return a.moves - b.moves;
            });
            records.manual = records.manual.slice(0, 5); // Top 5
        } else {
            records.algorithm.push(entry);
            // Rank primarily by search execution time, then by nodes explored
            records.algorithm.sort((a, b) => {
                if (a.time !== b.time) return a.time - b.time;
                return a.explored - b.explored;
            });
            records.algorithm = records.algorithm.slice(0, 5); // Top 5
        }

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    },

    clearRecords() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {}
    }
};


// ==========================================
// 4. APPLICATION STATE & CONTROLLER
// ==========================================

const App = {
    // Multi-Step Workflow State
    currentStep: 1, // 1: Welcome, 2: Setup, 3: Design, 4: Mode, 5: Ready, 6: Simulation

    // Maze Configuration
    selectedDifficulty: 'beginner', // 'beginner' (11x11), 'intermediate' (15x15), 'advanced' (21x21), 'custom'
    rows: 11,
    cols: 11,
    start: { r: 1, c: 1 },
    end: { r: 9, c: 9 },
    creationMethod: 'generated', // 'generated' or 'manual'
    grid: [], // 0 = wall, 1 = corridor, 2 = start, 3 = end
    historyStack: [],
    isSolvable: true,
    lastPathMoves: 0,

    // Active Modes & Tools
    selectedMode: 'bfs', // 'manual', 'bfs', 'dfs', 'astar', 'dijkstra', 'greedy'
    editorTool: 'wall',  // 'wall', 'erase', 'start', 'goal'
    isDrawing: false,

    // Animation & Playback
    animState: 'ready',  // 'ready', 'running', 'paused', 'completed', 'stopped'
    animSpeed: 35,       // ms per step (slow: 120, normal: 35, fast: 8, instant: 0)
    animTimer: null,
    animIndex: 0,
    animTrace: [],
    animPath: [],
    solverStats: null,

    // Manual Gameplay
    playerPos: { r: 1, c: 1 },
    manualMoves: 0,
    manualVisited: new Set(),
    manualTimerId: null,
    manualStartTime: null,
    manualElapsedSec: 0,

    // ------------------------------------------
    // INITIALIZATION
    // ------------------------------------------
    async init() {
        this.bindEvents();
        await this.updateEngineStatus();
        this.setSpeed('normal');
        // Initialize default maze
        await this.generateNewMaze();
        // Start on Step 1 (Welcome Screen)
        this.goToStep(1);
    },

    async updateEngineStatus() {
        const badge = document.getElementById('engine-status-badge');
        if (!badge) return;
        badge.innerHTML = '<span class="status-pulse ping"></span> Testing C++ Engine...';
        badge.className = 'badge-engine checking';

        const online = await BackendBridge.checkStatus();
        if (online) {
            badge.innerHTML = '<span class="status-pulse online"></span> C++ Native Engine';
            badge.className = 'badge-engine online';
            badge.title = 'Algorithms execute directly via high-speed native C++ MinGW backend';
        } else {
            badge.innerHTML = '<span class="status-pulse offline"></span> Standalone Engine';
            badge.className = 'badge-engine offline';
            badge.title = 'Using high-performance client DSA engine. Run run_server.bat to connect C++ server.';
        }
    },

    // ------------------------------------------
    // STEP NAVIGATION CONTROLLER
    // ------------------------------------------
    goToStep(targetStep) {
        if (targetStep < 1 || targetStep > 6) return;

        // Validation checks before advancing
        if (targetStep === 3 && this.currentStep === 2) {
            // Apply custom dimensions if selected
            if (this.selectedDifficulty === 'custom') {
                this.validateCustomDimensions();
            }
        }

        this.currentStep = targetStep;

        // Update progress bar UI
        document.querySelectorAll('.step-progress-bar .step-item').forEach(item => {
            const stepNum = parseInt(item.dataset.step, 10);
            item.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) {
                item.classList.add('active');
            } else if (stepNum < this.currentStep) {
                item.classList.add('completed');
            }
        });

        // Toggle Step Views
        for (let i = 1; i <= 6; i++) {
            const view = document.getElementById(`step-view-${i}`);
            if (view) {
                if (i === this.currentStep) {
                    view.style.display = 'block';
                    view.classList.add('active');
                } else {
                    view.style.display = 'none';
                    view.classList.remove('active');
                }
            }
        }

        // Contextual hooks per step
        if (this.currentStep === 3) {
            // Mount grid inside Step 3 Design Workspace
            const designWrap = document.getElementById('design-grid-viewport');
            const gridContainer = document.getElementById('maze-grid-container');
            if (designWrap && gridContainer && gridContainer.parentElement !== designWrap) {
                designWrap.appendChild(gridContainer);
            }
            this.renderGrid();
            this.validateSolvability();
            const dimTag = document.getElementById('design-dim-tag');
            if (dimTag) dimTag.innerText = `${this.rows} × ${this.cols}`;
        } else if (this.currentStep === 4) {
            this.selectMode(this.selectedMode);
        } else if (this.currentStep === 5) {
            this.updateReadySummary();
        } else if (this.currentStep === 6) {
            // Mount grid inside Step 6 Simulation Stage
            const simWrap = document.getElementById('grid-viewport');
            const gridContainer = document.getElementById('maze-grid-container');
            if (simWrap && gridContainer && gridContainer.parentElement !== simWrap) {
                simWrap.appendChild(gridContainer);
            }
            this.startSimulation();
        }
    },

    // ------------------------------------------
    // STEP 2: DIFFICULTY & CUSTOM SETUP
    // ------------------------------------------
    setDifficulty(diff) {
        this.selectedDifficulty = diff;

        document.querySelectorAll('.diff-card').forEach(card => {
            card.classList.toggle('active', card.dataset.difficulty === diff);
        });

        const customPanel = document.getElementById('custom-config-panel');

        if (diff === 'beginner') {
            this.rows = 11;
            this.cols = 11;
            this.start = { r: 1, c: 1 };
            this.end = { r: 9, c: 9 };
            if (customPanel) customPanel.style.display = 'none';
            this.generateNewMaze();
        } else if (diff === 'intermediate') {
            this.rows = 15;
            this.cols = 15;
            this.start = { r: 1, c: 1 };
            this.end = { r: 13, c: 13 };
            if (customPanel) customPanel.style.display = 'none';
            this.generateNewMaze();
        } else if (diff === 'advanced') {
            this.rows = 21;
            this.cols = 21;
            this.start = { r: 1, c: 1 };
            this.end = { r: 19, c: 19 };
            if (customPanel) customPanel.style.display = 'none';
            this.generateNewMaze();
        } else if (diff === 'custom') {
            if (customPanel) customPanel.style.display = 'flex';
            this.validateCustomDimensions();
        }
    },

    validateCustomDimensions() {
        const rInp = document.getElementById('custom-rows');
        const cInp = document.getElementById('custom-cols');
        const srInp = document.getElementById('custom-start-r');
        const scInp = document.getElementById('custom-start-c');
        const grInp = document.getElementById('custom-goal-r');
        const gcInp = document.getElementById('custom-goal-c');

        let r = parseInt(rInp ? rInp.value : 15, 10);
        let c = parseInt(cInp ? cInp.value : 15, 10);

        if (isNaN(r) || r < 5) r = 5;
        if (r > 35) r = 35;
        if (isNaN(c) || c < 5) c = 5;
        if (c > 35) c = 35;

        // Ensure odd dimensions for proper labyrinth wall partitions
        if (r % 2 === 0) r += 1;
        if (c % 2 === 0) c += 1;

        if (rInp) rInp.value = r;
        if (cInp) cInp.value = c;

        let sr = parseInt(srInp ? srInp.value : 1, 10);
        let sc = parseInt(scInp ? scInp.value : 1, 10);
        let gr = parseInt(grInp ? grInp.value : r - 2, 10);
        let gc = parseInt(gcInp ? gcInp.value : c - 2, 10);

        if (isNaN(sr) || sr < 1 || sr >= r - 1) sr = 1;
        if (isNaN(sc) || sc < 1 || sc >= c - 1) sc = 1;
        if (isNaN(gr) || gr < 1 || gr >= r - 1) gr = r - 2;
        if (isNaN(gc) || gc < 1 || gc >= c - 1) gc = c - 2;

        // Prevent identical start and goal positions
        if (sr === gr && sc === gc) {
            gr = (sr + 2 < r - 1) ? sr + 2 : sr - 2;
            if (gr < 1) gr = r - 2;
        }

        if (srInp) srInp.value = sr;
        if (scInp) scInp.value = sc;
        if (grInp) grInp.value = gr;
        if (gcInp) gcInp.value = gc;

        this.rows = r;
        this.cols = c;
        this.start = { r: sr, c: sc };
        this.end = { r: gr, c: gc };

        const dimDisplay = document.getElementById('custom-dim-display');
        if (dimDisplay) dimDisplay.innerText = `${r} × ${c} Grid`;

        const isManual = document.getElementById('custom-method-manual')?.checked;
        this.creationMethod = isManual ? 'manual' : 'generated';

        if (this.creationMethod === 'manual') {
            this.clearGrid();
        } else {
            this.generateNewMaze();
        }
    },

    // ------------------------------------------
    // STEP 3: MAZE DESIGN & EDITING
    // ------------------------------------------
    async generateNewMaze() {
        this.stopAnimation();
        this.resetDashboardStats();

        const res = await BackendBridge.generate(this.rows, this.cols);
        this.rows = res.rows;
        this.cols = res.cols;
        this.start = res.start;
        this.end = res.end;
        this.grid = res.grid;
        this.historyStack = [this.cloneGrid(this.grid)];

        this.renderGrid();
        await this.validateSolvability();

        if (this.selectedMode === 'manual') {
            this.initManualPlay();
        }
    },

    clearGrid() {
        this.stopAnimation();
        this.resetDashboardStats();

        this.grid = Array.from({ length: this.rows }, (v, r) =>
            Array.from({ length: this.cols }, (w, c) => {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) return 0; // Border wall
                return 1; // Open corridor
            })
        );
        this.grid[this.start.r][this.start.c] = 2; // Start
        this.grid[this.end.r][this.end.c] = 3;     // End

        this.pushHistory();
        this.renderGrid();
        this.validateSolvability();

        if (this.selectedMode === 'manual') {
            this.initManualPlay();
        }
    },

    cloneGrid(g) {
        return g.map(row => [...row]);
    },

    pushHistory() {
        if (this.historyStack.length > 25) this.historyStack.shift();
        this.historyStack.push(this.cloneGrid(this.grid));
    },

    undoAction() {
        if (this.historyStack.length > 1) {
            this.historyStack.pop();
            this.grid = this.cloneGrid(this.historyStack[this.historyStack.length - 1]);

            // Re-locate start and end
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c] === 2) this.start = { r, c };
                    if (this.grid[r][c] === 3) this.end = { r, c };
                }
            }
            this.renderGrid();
            this.validateSolvability();
        }
    },

    setEditorTool(tool) {
        this.editorTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool);
        });
    },

    renderGrid() {
        const container = document.getElementById('maze-grid-container');
        if (!container) return;

        container.innerHTML = '';
        container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        const maxDim = Math.max(this.rows, this.cols);
        const cellSize = Math.max(14, Math.min(38, Math.floor(480 / maxDim)));
        container.style.width = `${this.cols * cellSize}px`;
        container.style.height = `${this.rows * cellSize}px`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'sim-cell';
                cell.id = `sim-c-${r}-${c}`;
                cell.dataset.r = r;
                cell.dataset.c = c;

                this.applyCellType(cell, this.grid[r][c]);

                // Interactive Drawing & Editing
                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (this.animState === 'running') return;
                    this.isDrawing = true;
                    this.handleCellAction(r, c);
                });

                cell.addEventListener('mouseenter', () => {
                    if (this.isDrawing && this.animState !== 'running') {
                        this.handleCellAction(r, c);
                    }
                });

                container.appendChild(cell);
            }
        }
    },

    applyCellType(cellEl, val) {
        cellEl.className = 'sim-cell';
        cellEl.innerText = '';

        if (val === 0) {
            cellEl.classList.add('cell-wall');
        } else if (val === 1) {
            cellEl.classList.add('cell-path');
        } else if (val === 2) {
            cellEl.classList.add('cell-start');
            cellEl.innerText = 'S';
        } else if (val === 3) {
            cellEl.classList.add('cell-end');
            cellEl.innerText = 'E';
        }
    },

    handleCellAction(r, c) {
        // Outer boundaries are locked
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) return;

        let changed = false;

        if (this.editorTool === 'wall') {
            // Cannot place wall on start or goal
            if (this.grid[r][c] !== 2 && this.grid[r][c] !== 3 && this.grid[r][c] !== 0) {
                this.grid[r][c] = 0;
                changed = true;
            }
        } else if (this.editorTool === 'erase') {
            // Cannot erase start or goal to plain corridor directly
            if (this.grid[r][c] === 0) {
                this.grid[r][c] = 1;
                changed = true;
            }
        } else if (this.editorTool === 'start') {
            // Cannot place start over goal
            if (this.grid[r][c] !== 3 && (r !== this.start.r || c !== this.start.c)) {
                this.grid[this.start.r][this.start.c] = 1; // old start becomes corridor
                this.start = { r, c };
                this.grid[r][c] = 2;
                changed = true;
            }
        } else if (this.editorTool === 'goal') {
            // Cannot place goal over start
            if (this.grid[r][c] !== 2 && (r !== this.end.r || c !== this.end.c)) {
                this.grid[this.end.r][this.end.c] = 1; // old goal becomes corridor
                this.end = { r, c };
                this.grid[r][c] = 3;
                changed = true;
            }
        }

        if (changed) {
            this.pushHistory();
            this.renderGrid();
            this.validateSolvability();

            if (this.selectedMode === 'manual') {
                this.playerPos = { r: this.start.r, c: this.start.c };
                this.renderManualPlayerCell();
            }
        }
    },

    async validateSolvability() {
        const banner = document.getElementById('design-solvability-banner');
        const textSpan = document.getElementById('design-solvability-text');
        const simPill = document.getElementById('maze-solvability-pill');

        const res = await BackendBridge.validate(this.grid, this.rows, this.cols, this.start, this.end);
        this.isSolvable = res.solvable;
        this.lastPathMoves = res.pathMoves;

        const label = res.solvable
            ? `Solvable Maze (${res.pathMoves} moves)`
            : `Path Blocked (No solution to goal)`;

        if (banner) {
            banner.className = `solvability-banner ${res.solvable ? 'valid' : 'invalid'}`;
            if (textSpan) textSpan.innerText = label;
        }

        if (simPill) {
            simPill.className = `solvability-pill ${res.solvable ? 'valid' : 'invalid'}`;
            const pillText = simPill.querySelector('.solvability-text');
            if (pillText) pillText.innerText = label;
        }

        return res;
    },

    // ------------------------------------------
    // STEP 4: MODE & ALGORITHM SELECTION
    // ------------------------------------------
    selectMode(modeId) {
        this.selectedMode = modeId;

        document.querySelectorAll('.algo-card').forEach(card => {
            card.classList.toggle('active', card.dataset.mode === modeId);
        });

        // Update ribbon mode pill in Step 6
        const modeTag = document.getElementById('sim-active-mode-tag');
        if (modeTag) {
            const names = {
                manual: 'Manual Play',
                bfs: 'BFS Solver',
                dfs: 'DFS Solver',
                astar: 'A* Solver',
                dijkstra: 'Dijkstra Solver',
                greedy: 'Greedy Solver'
            };
            modeTag.innerText = names[modeId] || 'Solver';
        }
    },

    // ------------------------------------------
    // STEP 5: READY SCREEN & SUMMARY
    // ------------------------------------------
    updateReadySummary() {
        const diffLabels = {
            beginner: 'Beginner (11 × 11 Predefined)',
            intermediate: 'Intermediate (15 × 15 Predefined)',
            advanced: 'Advanced (21 × 21 Predefined)',
            custom: `Custom Maze (${this.rows} × ${this.cols})`
        };
        const elDiff = document.getElementById('ready-difficulty');
        if (elDiff) elDiff.innerText = diffLabels[this.selectedDifficulty] || 'Predefined';

        const elDim = document.getElementById('ready-dimensions');
        if (elDim) elDim.innerText = `${this.rows} × ${this.cols} (${this.rows * this.cols} cells)`;

        const elStart = document.getElementById('ready-start-pos');
        if (elStart) elStart.innerText = `(${this.start.r}, ${this.start.c}) [S]`;

        const elGoal = document.getElementById('ready-goal-pos');
        if (elGoal) elGoal.innerText = `(${this.end.r}, ${this.end.c}) [E]`;

        const elSolv = document.getElementById('ready-solvability');
        if (elSolv) {
            elSolv.innerText = this.isSolvable
                ? `Verified Reachable (${this.lastPathMoves} moves)`
                : `Blocked (Unsolvable Configuration)`;
            elSolv.className = `s-val ${this.isSolvable ? 'highlight-cyan' : 'highlight-pink'}`;
        }

        const modeNames = {
            manual: 'Manual Play Mode',
            bfs: 'Breadth-First Search (BFS)',
            dfs: 'Depth-First Search (DFS)',
            astar: 'A* Search Algorithm',
            dijkstra: "Dijkstra's Algorithm",
            greedy: 'Greedy Best-First Search'
        };
        const dsNames = {
            manual: 'Keyboard Controller (Real-Time)',
            bfs: 'std::queue (FIFO Queue)',
            dfs: 'std::stack (LIFO Stack)',
            astar: 'std::priority_queue (Min-Heap f = g + h)',
            dijkstra: 'std::priority_queue (Min-Heap dist)',
            greedy: 'std::priority_queue (Min-Heap h)'
        };
        const elMode = document.getElementById('ready-mode-name');
        if (elMode) elMode.innerText = modeNames[this.selectedMode] || 'BFS';

        const elDs = document.getElementById('ready-ds-name');
        if (elDs) elDs.innerText = dsNames[this.selectedMode] || 'std::queue';

        const elEng = document.getElementById('ready-engine-info');
        if (elEng) {
            elEng.innerText = BackendBridge.isOnline ? 'C++ Native Winsock Engine' : 'Client DSA Engine (Standalone)';
        }

        const checkItemSolv = document.getElementById('check-item-solvable');
        const checkItemSolvText = document.getElementById('check-item-solvable-text');
        if (checkItemSolv && checkItemSolvText) {
            if (this.isSolvable) {
                checkItemSolv.className = 'check-item ok';
                checkItemSolvText.innerText = `Path connectivity verified (${this.lastPathMoves} moves)`;
            } else {
                checkItemSolv.className = 'check-item';
                checkItemSolvText.innerText = 'Warning: Start and Goal are not connected (testing unsolvable maze)';
            }
        }
    },

    // ------------------------------------------
    // STEP 6: SIMULATION WORKSPACE & CONTROLLER
    // ------------------------------------------
    startSimulation() {
        this.stopAnimation();
        this.resetSimGridMarkers();
        this.resetDashboardStats();

        // Update headline
        const algoNames = {
            manual: 'Manual Gameplay Mode',
            bfs: 'Breadth-First Search (BFS)',
            dfs: 'Depth-First Search (DFS)',
            astar: 'A* Search (AStar)',
            dijkstra: "Dijkstra's Algorithm",
            greedy: 'Greedy Best-First Search'
        };
        const algoDs = {
            manual: 'WASD / Arrow Keys',
            bfs: 'std::queue (FIFO Queue)',
            dfs: 'std::stack (LIFO Stack)',
            astar: 'std::priority_queue (Min-Heap f = g + h)',
            dijkstra: 'std::priority_queue (Min-Heap dist)',
            greedy: 'std::priority_queue (Min-Heap h)'
        };

        const titleEl = document.getElementById('active-algo-name');
        if (titleEl) titleEl.innerText = algoNames[this.selectedMode] || 'Solver';

        const dsEl = document.getElementById('active-algo-ds');
        if (dsEl) dsEl.innerText = algoDs[this.selectedMode] || 'Queue';

        // Toggle Manual vs Solver widgets
        const manualHint = document.getElementById('manual-mode-hint');
        const manualPad = document.getElementById('manual-pad-card');
        const manualMovesRow = document.getElementById('manual-moves-row');
        const speedGroup = document.getElementById('speed-control-group');
        const solveLabel = document.getElementById('btn-solve-label');
        const pauseBtn = document.getElementById('btn-pause-sim');
        const optTag = document.getElementById('stat-optimality-tag');

        if (this.selectedMode === 'manual') {
            if (manualHint) manualHint.style.display = 'inline-flex';
            if (manualPad) manualPad.style.display = 'flex';
            if (manualMovesRow) manualMovesRow.style.display = 'flex';
            if (speedGroup) speedGroup.style.display = 'none';
            if (solveLabel) solveLabel.innerText = 'Start Game';
            if (pauseBtn) pauseBtn.disabled = true;
            if (optTag) optTag.innerHTML = '<span class="tag-opt non-opt">Interactive</span>';

            this.initManualPlay();
        } else {
            if (manualHint) manualHint.style.display = 'none';
            if (manualPad) manualPad.style.display = 'none';
            if (manualMovesRow) manualMovesRow.style.display = 'none';
            if (speedGroup) speedGroup.style.display = 'flex';
            if (solveLabel) solveLabel.innerText = 'Solve Maze';
            if (pauseBtn) pauseBtn.disabled = true;

            const isOptimal = ['bfs', 'astar', 'dijkstra'].includes(this.selectedMode);
            if (optTag) {
                optTag.innerHTML = isOptimal
                    ? '<span class="tag-opt optimal">Optimal (Shortest)</span>'
                    : '<span class="tag-opt non-opt">Non-Optimal</span>';
            }

            clearInterval(this.manualTimerId);
            this.renderGrid();
        }
    },

    async startAlgorithmSolving() {
        if (this.animState === 'running') return; // Prevent multiple simultaneous runs

        this.stopAnimation();
        this.resetSimGridMarkers();
        this.resetDashboardStats();

        this.updateStat('stat-status', 'Solving...', 'status-running');

        const pauseBtn = document.getElementById('btn-pause-sim');
        const stopBtn = document.getElementById('btn-stop-sim');
        if (pauseBtn) {
            pauseBtn.disabled = false;
            pauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        if (stopBtn) stopBtn.disabled = false;

        const res = await BackendBridge.solve(
            this.grid, this.rows, this.cols, this.start, this.end, this.selectedMode
        );

        this.solverStats = res;
        this.animTrace = res.explorationTrace || [];
        this.animPath = res.solutionPath || [];
        this.animIndex = 0;
        this.animState = 'running';

        this.updateStat('stat-exec-time', `${res.executionTimeMs.toFixed(3)} ms`);
        this.updateStat('stat-discovered', `${res.cellsDiscovered}`);

        if (this.animSpeed === 0) {
            this.finishInstantVisualization();
        } else {
            this.runAnimationTick();
        }
    },

    runAnimationTick() {
        if (this.animState !== 'running') return;

        if (this.animIndex < this.animTrace.length) {
            const cur = this.animTrace[this.animIndex];

            // Turn previous head cell into visited cell
            if (this.animIndex > 0) {
                const prev = this.animTrace[this.animIndex - 1];
                if ((prev.r !== this.start.r || prev.c !== this.start.c) &&
                    (prev.r !== this.end.r || prev.c !== this.end.c)) {
                    const prevEl = document.getElementById(`sim-c-${prev.r}-${prev.c}`);
                    if (prevEl) {
                        prevEl.className = 'sim-cell cell-visited';
                        prevEl.innerText = '•';
                    }
                }
            }

            // Current exploration head
            if ((cur.r !== this.start.r || cur.c !== this.start.c) &&
                (cur.r !== this.end.r || cur.c !== this.end.c)) {
                const curEl = document.getElementById(`sim-c-${cur.r}-${cur.c}`);
                if (curEl) {
                    curEl.className = 'sim-cell cell-current';
                    curEl.innerText = '•';
                }
            }

            this.animIndex++;
            this.updateStat('stat-explored', `${this.animIndex}`);
            this.updateStat('stat-visited-count', `${this.animIndex}`);
            this.updateStat('stat-cur-pos', `(${cur.r}, ${cur.c})`);

            this.animTimer = setTimeout(() => this.runAnimationTick(), this.animSpeed);
        } else {
            this.renderSolutionPath();
        }
    },

    renderSolutionPath() {
        if (!this.solverStats || !this.solverStats.success) {
            this.animState = 'completed';
            this.updateStat('stat-status', 'No Path Found', 'status-error');
            this.showResultBanner(false, 'No path exists between Start and Goal for this configuration.');
            this.disablePauseBtn();
            return;
        }

        let pathIdx = 0;
        const animatePath = () => {
            if (pathIdx < this.animPath.length) {
                const p = this.animPath[pathIdx];
                if ((p.r !== this.start.r || p.c !== this.start.c) &&
                    (p.r !== this.end.r || p.c !== this.end.c)) {
                    const el = document.getElementById(`sim-c-${p.r}-${p.c}`);
                    if (el) {
                        el.className = 'sim-cell cell-solution';
                        el.innerText = '★';
                    }
                }
                pathIdx++;
                setTimeout(animatePath, Math.min(22, Math.max(5, this.animSpeed)));
            } else {
                this.animState = 'completed';
                this.updateStat('stat-status', 'Solved!', 'status-solved');
                this.updateStat('stat-path-len', `${this.solverStats.pathLength} moves`);
                this.showResultBanner(true, `Goal reached in ${this.solverStats.pathLength} moves with ${this.solverStats.nodesExplored} nodes explored.`);
                this.disablePauseBtn();

                const saveBtn = document.getElementById('btn-save-leaderboard-record');
                if (saveBtn) saveBtn.style.display = 'inline-flex';
            }
        };
        animatePath();
    },

    finishInstantVisualization() {
        // Render all visited cells
        for (const pt of this.animTrace) {
            if ((pt.r !== this.start.r || pt.c !== this.start.c) &&
                (pt.r !== this.end.r || pt.c !== this.end.c)) {
                const el = document.getElementById(`sim-c-${pt.r}-${pt.c}`);
                if (el) {
                    el.className = 'sim-cell cell-visited';
                    el.innerText = '•';
                }
            }
        }

        // Render solution path
        if (this.solverStats && this.solverStats.success) {
            for (const pt of this.animPath) {
                if ((pt.r !== this.start.r || pt.c !== this.start.c) &&
                    (pt.r !== this.end.r || pt.c !== this.end.c)) {
                    const el = document.getElementById(`sim-c-${pt.r}-${pt.c}`);
                    if (el) {
                        el.className = 'sim-cell cell-solution';
                        el.innerText = '★';
                    }
                }
            }
            this.updateStat('stat-status', 'Solved!', 'status-solved');
            this.updateStat('stat-path-len', `${this.solverStats.pathLength} moves`);
            this.showResultBanner(true, `Goal reached in ${this.solverStats.pathLength} moves with ${this.solverStats.nodesExplored} nodes explored.`);

            const saveBtn = document.getElementById('btn-save-leaderboard-record');
            if (saveBtn) saveBtn.style.display = 'inline-flex';
        } else {
            this.updateStat('stat-status', 'No Path Found', 'status-error');
            this.showResultBanner(false, 'No valid path found from Start to Goal.');
        }

        this.animState = 'completed';
        this.updateStat('stat-explored', `${this.animTrace.length}`);
        this.updateStat('stat-visited-count', `${this.animTrace.length}`);
        this.disablePauseBtn();
    },

    showResultBanner(success, msg) {
        const banner = document.getElementById('sim-result-banner');
        const badge = document.getElementById('sim-result-badge');
        const msgEl = document.getElementById('sim-result-msg');
        if (!banner || !badge || !msgEl) return;

        banner.style.display = 'flex';
        badge.className = `result-badge ${success ? 'success' : 'fail'}`;
        badge.innerText = success ? 'Solved!' : 'No Path Found';
        msgEl.innerText = msg;
    },

    pauseAnimation() {
        if (this.animState === 'running') {
            this.animState = 'paused';
            clearTimeout(this.animTimer);
            this.updateStat('stat-status', 'Paused', 'status-paused');

            const pauseBtn = document.getElementById('btn-pause-sim');
            if (pauseBtn) pauseBtn.innerHTML = '&#9654; Resume';
        } else if (this.animState === 'paused') {
            this.animState = 'running';
            this.updateStat('stat-status', 'Solving...', 'status-running');

            const pauseBtn = document.getElementById('btn-pause-sim');
            if (pauseBtn) pauseBtn.innerHTML = '&#10074;&#10074; Pause';

            this.runAnimationTick();
        }
    },

    stopAnimation() {
        this.animState = 'stopped';
        clearTimeout(this.animTimer);
        this.disablePauseBtn();
        const stopBtn = document.getElementById('btn-stop-sim');
        if (stopBtn) stopBtn.disabled = true;
    },

    disablePauseBtn() {
        const pauseBtn = document.getElementById('btn-pause-sim');
        if (pauseBtn) {
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        const stopBtn = document.getElementById('btn-stop-sim');
        if (stopBtn) stopBtn.disabled = true;
    },

    setSpeed(speedMode) {
        document.querySelectorAll('.speed-pill').forEach(b => {
            b.classList.toggle('active', b.dataset.speed === speedMode);
        });

        if (speedMode === 'slow') this.animSpeed = 120;
        else if (speedMode === 'normal') this.animSpeed = 35;
        else if (speedMode === 'fast') this.animSpeed = 8;
        else if (speedMode === 'instant') {
            this.animSpeed = 0;
            if (this.animState === 'running') {
                clearTimeout(this.animTimer);
                this.finishInstantVisualization();
            }
        }
    },

    resetSimGridMarkers() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.getElementById(`sim-c-${r}-${c}`);
                if (!cell) continue;
                this.applyCellType(cell, this.grid[r][c]);
            }
        }
        const banner = document.getElementById('sim-result-banner');
        if (banner) banner.style.display = 'none';
    },

    resetDashboardStats() {
        this.updateStat('stat-status', 'Ready', 'status-ready');
        this.updateStat('stat-explored', '0');
        this.updateStat('stat-discovered', '0');
        this.updateStat('stat-path-len', '-');
        this.updateStat('stat-exec-time', '0.00 ms');
        this.updateStat('stat-cur-pos', `(${this.start.r}, ${this.start.c})`);
        this.updateStat('stat-visited-count', '0');
        this.updateStat('stat-player-moves', '0');

        const saveBtn = document.getElementById('btn-save-leaderboard-record');
        if (saveBtn) saveBtn.style.display = 'none';

        const banner = document.getElementById('sim-result-banner');
        if (banner) banner.style.display = 'none';
    },

    updateStat(id, text, statusClass) {
        const el = document.getElementById(id);
        if (el) {
            el.innerText = text;
            if (statusClass) el.className = 'status-indicator-badge ' + statusClass;
        }
    },

    // ------------------------------------------
    // MANUAL GAMEPLAY LOGIC
    // ------------------------------------------
    initManualPlay() {
        this.playerPos = { r: this.start.r, c: this.start.c };
        this.manualMoves = 0;
        this.manualVisited = new Set([`${this.start.r},${this.start.c}`]);
        this.manualStartTime = null;
        this.manualElapsedSec = 0;
        clearInterval(this.manualTimerId);

        this.resetSimGridMarkers();
        this.renderManualPlayerCell();
        this.updateDashboardManual();
        this.updateStat('stat-status', 'Ready (WASD)', 'status-ready');
    },

    renderManualPlayerCell() {
        document.querySelectorAll('.sim-cell.cell-player').forEach(c => {
            c.classList.remove('cell-player');
            c.innerText = '';
            const r = parseInt(c.dataset.r, 10);
            const col = parseInt(c.dataset.c, 10);
            if (r === this.start.r && col === this.start.c) {
                c.classList.add('cell-start');
                c.innerText = 'S';
            } else {
                c.classList.add('cell-visited');
                c.innerText = '•';
            }
        });

        const curEl = document.getElementById(`sim-c-${this.playerPos.r}-${this.playerPos.c}`);
        if (curEl) {
            curEl.className = 'sim-cell cell-player';
            curEl.innerText = 'P';
        }
    },

    handleManualMove(dr, dc) {
        if (this.selectedMode !== 'manual' || this.currentStep !== 6) return;

        // Start timer on first move
        if (!this.manualStartTime) {
            this.manualStartTime = Date.now();
            this.updateStat('stat-status', 'Playing...', 'status-running');
            this.manualTimerId = setInterval(() => {
                this.manualElapsedSec = ((Date.now() - this.manualStartTime) / 1000);
                this.updateStat('stat-exec-time', `${this.manualElapsedSec.toFixed(1)} s`);
            }, 100);
        }

        const newR = this.playerPos.r + dr;
        const newC = this.playerPos.c + dc;

        // Collision & boundary detection
        if (newR >= 0 && newR < this.rows && newC >= 0 && newC < this.cols) {
            if (this.grid[newR][newC] !== 0) { // Walkable corridor
                this.playerPos = { r: newR, c: newC };
                this.manualMoves++;
                this.manualVisited.add(`${newR},${newC}`);

                this.renderManualPlayerCell();
                this.updateDashboardManual();

                // Goal reached!
                if (newR === this.end.r && newC === this.end.c) {
                    this.finishManualVictory();
                }
            }
        }
    },

    updateDashboardManual() {
        this.updateStat('stat-player-moves', `${this.manualMoves}`);
        this.updateStat('stat-visited-count', `${this.manualVisited.size}`);
        this.updateStat('stat-cur-pos', `(${this.playerPos.r}, ${this.playerPos.c})`);
    },

    finishManualVictory() {
        clearInterval(this.manualTimerId);
        this.updateStat('stat-status', 'Victory!', 'status-solved');

        const modal = document.getElementById('victory-modal');
        if (modal) {
            const vMoves = document.getElementById('modal-vic-moves');
            const vVisited = document.getElementById('modal-vic-visited');
            const vTime = document.getElementById('modal-vic-time');

            if (vMoves) vMoves.innerText = `${this.manualMoves}`;
            if (vVisited) vVisited.innerText = `${this.manualVisited.size}`;
            if (vTime) vTime.innerText = `${this.manualElapsedSec.toFixed(2)}s`;

            modal.style.display = 'flex';
        }
    },

    // ------------------------------------------
    // BENCHMARK MODAL
    // ------------------------------------------
    async openBenchmarkModal() {
        const modal = document.getElementById('benchmark-modal');
        if (!modal) return;
        modal.style.display = 'flex';

        const tbody = document.getElementById('benchmark-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Benchmarking DFS, BFS, A*, Dijkstra, Greedy...</td></tr>';
        }

        const results = await BackendBridge.benchmark(
            this.grid, this.rows, this.cols, this.start, this.end
        );

        this.renderBenchmarkTable(results);
        this.renderBenchmarkChart(results);
    },

    renderBenchmarkTable(results) {
        const tbody = document.getElementById('benchmark-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        results.forEach(res => {
            const tr = document.createElement('tr');
            const shortestTag = res.guaranteedShortest
                ? '<span class="tag-opt optimal">Optimal</span>'
                : '<span class="tag-opt non-opt">Heuristic</span>';

            tr.innerHTML = `
                <td><strong>${res.algorithm}</strong></td>
                <td><span class="code-badge font-mono">${res.dataStructure}</span></td>
                <td><strong>${res.nodesExplored}</strong></td>
                <td>${res.cellsDiscovered}</td>
                <td><strong>${res.pathMoves}</strong></td>
                <td><strong class="highlight-cyan font-mono">${res.executionTimeMs.toFixed(3)} ms</strong></td>
                <td>${shortestTag}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    renderBenchmarkChart(results) {
        const container = document.getElementById('benchmark-chart');
        if (!container) return;

        container.innerHTML = '';
        const maxExplored = Math.max(...results.map(r => r.nodesExplored), 1);
        const maxMoves = Math.max(...results.map(r => r.pathMoves), 1);

        results.forEach(res => {
            const row = document.createElement('div');
            row.className = 'chart-bar-row';

            const expPct = Math.round((res.nodesExplored / maxExplored) * 100);
            const pathPct = Math.round((res.pathMoves / maxMoves) * 100);

            row.innerHTML = `
                <div class="chart-label">${res.algorithm}</div>
                <div class="chart-bars">
                    <div class="bar-group">
                        <div class="bar bar-explored" style="width: ${Math.max(6, expPct)}%;">
                            ${res.nodesExplored} explored
                        </div>
                    </div>
                    <div class="bar-group">
                        <div class="bar bar-path" style="width: ${Math.max(6, pathPct)}%;">
                            ${res.pathMoves} moves
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });
    },

    // ------------------------------------------
    // LEADERBOARD MODAL
    // ------------------------------------------
    openLeaderboardModal(tab = 'manual') {
        const modal = document.getElementById('leaderboard-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.renderLeaderboard(tab);
    },

    renderLeaderboard(tab = 'manual') {
        const records = LeaderboardStore.getRecords();

        document.querySelectorAll('.tab-pill').forEach(b => {
            b.classList.toggle('active', b.id === `tab-lb-${tab}`);
        });

        const tbody = document.getElementById('leaderboard-table-body');
        const headers = document.getElementById('leaderboard-table-headers');
        if (!tbody || !headers) return;

        tbody.innerHTML = '';

        if (tab === 'manual') {
            headers.innerHTML = `
                <th>Rank</th>
                <th>Player</th>
                <th>Grid</th>
                <th>Moves</th>
                <th>Visited</th>
                <th>Completion Time</th>
                <th>Date</th>
            `;

            if (records.manual.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No manual games recorded yet. Play WASD mode and reach the goal!</td></tr>';
                return;
            }

            records.manual.forEach((rec, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="rank-badge rank-${idx + 1}">#${idx + 1}</span></td>
                    <td><strong>${rec.name || 'Explorer'}</strong></td>
                    <td class="font-mono">${rec.dimensions || '15 × 15'}</td>
                    <td>${rec.moves}</td>
                    <td>${rec.visited}</td>
                    <td><strong class="highlight-gold font-mono">${rec.time.toFixed(2)}s</strong></td>
                    <td style="color: var(--text-dim); font-size: 0.76rem;">${rec.date}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            headers.innerHTML = `
                <th>Rank</th>
                <th>Runner</th>
                <th>Algorithm</th>
                <th>Grid</th>
                <th>Nodes Explored</th>
                <th>Path Moves</th>
                <th>Search Latency</th>
                <th>Date</th>
            `;

            if (records.algorithm.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="loading-cell">No algorithm runs saved yet. Run a solver and click "Save Result"!</td></tr>';
                return;
            }

            records.algorithm.forEach((rec, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="rank-badge rank-${idx + 1}">#${idx + 1}</span></td>
                    <td><strong>${rec.name || 'Runner'}</strong></td>
                    <td><strong>${rec.algo}</strong></td>
                    <td class="font-mono">${rec.dimensions || '15 × 15'}</td>
                    <td>${rec.explored}</td>
                    <td>${rec.pathLength}</td>
                    <td><strong class="highlight-cyan font-mono">${rec.time.toFixed(3)} ms</strong></td>
                    <td style="color: var(--text-dim); font-size: 0.76rem;">${rec.date}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    },

    saveCurrentAlgorithmRun(name) {
        if (!this.solverStats) return;

        LeaderboardStore.saveRecord({
            mode: 'algorithm',
            name: name || 'Solver',
            algo: this.solverStats.algorithm,
            dataStructure: this.solverStats.dataStructure,
            dimensions: `${this.rows} × ${this.cols}`,
            explored: this.solverStats.nodesExplored,
            pathLength: this.solverStats.pathLength,
            time: this.solverStats.executionTimeMs
        });

        const saveModal = document.getElementById('save-algo-modal');
        if (saveModal) saveModal.style.display = 'none';

        this.openLeaderboardModal('algo');
    },

    saveCurrentManualRun(name) {
        LeaderboardStore.saveRecord({
            mode: 'manual',
            name: name || 'Player 1',
            dimensions: `${this.rows} × ${this.cols}`,
            moves: this.manualMoves,
            visited: this.manualVisited.size,
            time: this.manualElapsedSec
        });

        const vicModal = document.getElementById('victory-modal');
        if (vicModal) vicModal.style.display = 'none';

        this.openLeaderboardModal('manual');
    },

    // ------------------------------------------
    // EVENT BINDINGS
    // ------------------------------------------
    bindEvents() {
        // Global mouseup to stop drawing
        window.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });

        // Step Progress Bar Item Clicks
        document.querySelectorAll('.step-progress-bar .step-item').forEach(item => {
            item.addEventListener('click', () => {
                const stepNum = parseInt(item.dataset.step, 10);
                // Allow jumping to any step if already completed or current
                this.goToStep(stepNum);
            });
        });

        // Keyboard navigation (WASD & Arrows)
        window.addEventListener('keydown', (e) => {
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

            let handled = false;
            let keyId = null;

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.handleManualMove(-1, 0);
                keyId = 'key-w';
                handled = true;
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                this.handleManualMove(1, 0);
                keyId = 'key-s';
                handled = true;
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.handleManualMove(0, -1);
                keyId = 'key-a';
                handled = true;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.handleManualMove(0, 1);
                keyId = 'key-d';
                handled = true;
            }

            if (keyId) {
                const keyEl = document.getElementById(keyId);
                if (keyEl) keyEl.classList.add('pressed');
            }

            if (handled) e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            let keyId = null;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keyId = 'key-w';
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keyId = 'key-s';
            else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyId = 'key-a';
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyId = 'key-d';

            if (keyId) {
                const keyEl = document.getElementById(keyId);
                if (keyEl) keyEl.classList.remove('pressed');
            }
        });

        // STEP 1: Welcome CTA
        const btnStartExp = document.getElementById('btn-start-exploring');
        if (btnStartExp) btnStartExp.addEventListener('click', () => this.goToStep(2));

        // STEP 2: Difficulty Selection & Navigation
        document.querySelectorAll('.diff-card').forEach(card => {
            card.addEventListener('click', () => {
                this.setDifficulty(card.dataset.difficulty);
            });
        });

        // Custom Inputs auto-validate on change
        ['custom-rows', 'custom-cols', 'custom-start-r', 'custom-start-c', 'custom-goal-r', 'custom-goal-c'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.validateCustomDimensions());
        });

        document.querySelectorAll('input[name="maze-creation-method"]').forEach(radio => {
            radio.addEventListener('change', () => this.validateCustomDimensions());
        });

        const btnStep2Back = document.getElementById('btn-step2-back');
        if (btnStep2Back) btnStep2Back.addEventListener('click', () => this.goToStep(1));

        const btnStep2Next = document.getElementById('btn-step2-next');
        if (btnStep2Next) btnStep2Next.addEventListener('click', () => this.goToStep(3));

        // STEP 3: Design Maze Workspace
        document.querySelectorAll('.tool-btn').forEach(btn => {
            if (btn.dataset.tool) {
                btn.addEventListener('click', () => this.setEditorTool(btn.dataset.tool));
            }
        });

        const btnDesignGen = document.getElementById('btn-design-generate');
        if (btnDesignGen) btnDesignGen.addEventListener('click', () => this.generateNewMaze());

        const btnDesignClear = document.getElementById('btn-design-clear');
        if (btnDesignClear) btnDesignClear.addEventListener('click', () => this.clearGrid());

        const btnDesignUndo = document.getElementById('btn-design-undo');
        if (btnDesignUndo) btnDesignUndo.addEventListener('click', () => this.undoAction());

        const btnDesignValidate = document.getElementById('btn-design-validate');
        if (btnDesignValidate) btnDesignValidate.addEventListener('click', () => this.validateSolvability());

        const btnStep3Back = document.getElementById('btn-step3-back');
        if (btnStep3Back) btnStep3Back.addEventListener('click', () => this.goToStep(2));

        const btnStep3Next = document.getElementById('btn-step3-next');
        if (btnStep3Next) btnStep3Next.addEventListener('click', () => this.goToStep(4));

        // STEP 4: Mode Selection & Navigation
        document.querySelectorAll('.algo-card').forEach(card => {
            card.addEventListener('click', () => this.selectMode(card.dataset.mode));
        });

        const btnStep4Compare = document.getElementById('btn-step4-compare');
        if (btnStep4Compare) btnStep4Compare.addEventListener('click', () => this.openBenchmarkModal());

        const btnStep4Back = document.getElementById('btn-step4-back');
        if (btnStep4Back) btnStep4Back.addEventListener('click', () => this.goToStep(3));

        const btnStep4Next = document.getElementById('btn-step4-next');
        if (btnStep4Next) btnStep4Next.addEventListener('click', () => this.goToStep(5));

        // STEP 5: Ready & Launch
        const btnStep5Back = document.getElementById('btn-step5-back');
        if (btnStep5Back) btnStep5Back.addEventListener('click', () => this.goToStep(4));

        const btnStartSim = document.getElementById('btn-start-simulation');
        if (btnStartSim) btnStartSim.addEventListener('click', () => this.goToStep(6));

        // STEP 6: Simulation Ribbon Reconfiguration Buttons
        const btnReconfSetup = document.getElementById('btn-reconfigure-setup');
        if (btnReconfSetup) btnReconfSetup.addEventListener('click', () => this.goToStep(2));

        const btnReconfEdit = document.getElementById('btn-reconfigure-edit-maze');
        if (btnReconfEdit) btnReconfEdit.addEventListener('click', () => this.goToStep(3));

        const btnReconfMode = document.getElementById('btn-reconfigure-change-mode');
        if (btnReconfMode) btnReconfMode.addEventListener('click', () => this.goToStep(4));

        // Step 6 Playback Controls
        const btnSolve = document.getElementById('btn-solve-maze');
        if (btnSolve) {
            btnSolve.addEventListener('click', () => {
                if (this.selectedMode === 'manual') {
                    this.initManualPlay();
                } else {
                    this.startAlgorithmSolving();
                }
            });
        }

        const btnPause = document.getElementById('btn-pause-sim');
        if (btnPause) btnPause.addEventListener('click', () => this.pauseAnimation());

        const btnReset = document.getElementById('btn-reset-sim');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.stopAnimation();
                this.resetSimGridMarkers();
                this.resetDashboardStats();
                if (this.selectedMode === 'manual') {
                    this.initManualPlay();
                }
            });
        }

        const btnStop = document.getElementById('btn-stop-sim');
        if (btnStop) {
            btnStop.addEventListener('click', () => {
                this.stopAnimation();
                this.updateStat('stat-status', 'Stopped', 'status-error');
            });
        }

        // Speed Pills
        document.querySelectorAll('.speed-pill').forEach(btn => {
            btn.addEventListener('click', () => this.setSpeed(btn.dataset.speed));
        });

        // Header Modal Triggers
        const btnOpenBench = document.getElementById('btn-open-benchmark');
        if (btnOpenBench) btnOpenBench.addEventListener('click', () => this.openBenchmarkModal());

        const btnSideBench = document.getElementById('btn-side-benchmark');
        if (btnSideBench) btnSideBench.addEventListener('click', () => this.openBenchmarkModal());

        const btnCloseBench = document.getElementById('btn-close-benchmark');
        if (btnCloseBench) {
            btnCloseBench.addEventListener('click', () => {
                const m = document.getElementById('benchmark-modal');
                if (m) m.style.display = 'none';
            });
        }

        const btnOpenLb = document.getElementById('btn-open-leaderboard');
        if (btnOpenLb) btnOpenLb.addEventListener('click', () => this.openLeaderboardModal('manual'));

        const btnCloseLb = document.getElementById('btn-close-leaderboard');
        if (btnCloseLb) {
            btnCloseLb.addEventListener('click', () => {
                const m = document.getElementById('leaderboard-modal');
                if (m) m.style.display = 'none';
            });
        }

        // Leaderboard Tabs & Clear
        const tabLbManual = document.getElementById('tab-lb-manual');
        if (tabLbManual) tabLbManual.addEventListener('click', () => this.renderLeaderboard('manual'));

        const tabLbAlgo = document.getElementById('tab-lb-algo');
        if (tabLbAlgo) tabLbAlgo.addEventListener('click', () => this.renderLeaderboard('algo'));

        const btnClearLb = document.getElementById('btn-clear-leaderboard');
        if (btnClearLb) {
            btnClearLb.addEventListener('click', () => {
                if (confirm('Clear all saved leaderboard records?')) {
                    LeaderboardStore.clearRecords();
                    this.renderLeaderboard('manual');
                }
            });
        }

        // Save Algorithm Run
        const btnSaveRecord = document.getElementById('btn-save-leaderboard-record');
        if (btnSaveRecord) {
            btnSaveRecord.addEventListener('click', () => {
                const modal = document.getElementById('save-algo-modal');
                if (modal) modal.style.display = 'flex';
            });
        }

        const btnConfirmSaveAlgo = document.getElementById('btn-modal-confirm-save-algo');
        if (btnConfirmSaveAlgo) {
            btnConfirmSaveAlgo.addEventListener('click', () => {
                const nameInp = document.getElementById('modal-algo-runner-name');
                const name = (nameInp && nameInp.value.trim()) || 'Solver';
                this.saveCurrentAlgorithmRun(name);
            });
        }

        const btnCancelSaveAlgo = document.getElementById('btn-modal-cancel-save-algo');
        if (btnCancelSaveAlgo) {
            btnCancelSaveAlgo.addEventListener('click', () => {
                const modal = document.getElementById('save-algo-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        // Victory Modal
        const btnSaveVic = document.getElementById('btn-modal-save-victory');
        if (btnSaveVic) {
            btnSaveVic.addEventListener('click', () => {
                const nameInp = document.getElementById('modal-player-name');
                const name = (nameInp && nameInp.value.trim()) || 'Player 1';
                this.saveCurrentManualRun(name);
            });
        }

        const btnPlayAgain = document.getElementById('btn-modal-play-again');
        if (btnPlayAgain) {
            btnPlayAgain.addEventListener('click', () => {
                const m = document.getElementById('victory-modal');
                if (m) m.style.display = 'none';
                this.initManualPlay();
            });
        }

        const btnReturnSetup = document.getElementById('btn-modal-return-setup');
        if (btnReturnSetup) {
            btnReturnSetup.addEventListener('click', () => {
                const m = document.getElementById('victory-modal');
                if (m) m.style.display = 'none';
                this.goToStep(2);
            });
        }

        // Close modals on clicking backdrop
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            });
        });
    }
};

// Auto-initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
