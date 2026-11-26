/**
 * Longcat - Client-side Solver & Validator
 * Computes exact solutions using BFS graph search over game states.
 * Provides hints for the player and validates custom user-created levels.
 */

class LongcatSolver {
  constructor(w, h, walls, start) {
    this.w = w;
    this.h = h;
    this.walls = new Set(walls.map(([x, y]) => `${x},${y}`));
    this.start = [start[0], start[1]];
    this.walkable = (w * h) - this.walls.size;
  }

  isValid(x, y, occupiedSet) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
    const key = `${x},${y}`;
    if (this.walls.has(key)) return false;
    if (occupiedSet.has(key)) return false;
    return true;
  }

  simulateMove(head, occupiedSet, dx, dy) {
    const [hx, hy] = head;
    if (!this.isValid(hx + dx, hy + dy, occupiedSet)) return null;

    let curX = hx;
    let curY = hy;
    const newCells = [];
    const tempOcc = new Set(occupiedSet);

    while (this.isValid(curX + dx, curY + dy, tempOcc)) {
      curX += dx;
      curY += dy;
      newCells.push([curX, curY]);
      tempOcc.add(`${curX},${curY}`);
    }

    return {
      newHead: [curX, curY],
      newCells,
      totalCount: occupiedSet.size + newCells.length
    };
  }

  solveFromCurrent(head, currentOccupiedList, maxStates = 4000) {
    const startOccSet = new Set(currentOccupiedList.map(([x, y]) => `${x},${y}`));
    if (startOccSet.size === this.walkable) return [];

    const dirs = [
      { name: 'U', dx: 0, dy: -1 },
      { name: 'D', dx: 0, dy: 1 },
      { name: 'L', dx: -1, dy: 0 },
      { name: 'R', dx: 1, dy: 0 }
    ];

    const queue = [];
    queue.push({
      head,
      occSet: startOccSet,
      path: []
    });

    const visited = new Set();
    const makeKey = (h, occ) => {
      // Create canonical representation
      return `${h[0]},${h[1]}|${Array.from(occ).sort().join(';')}`;
    };

    visited.add(makeKey(head, startOccSet));
    let explored = 0;

    while (queue.length > 0 && explored < maxStates) {
      explored++;
      const current = queue.shift();

      if (current.occSet.size === this.walkable) {
        return current.path;
      }

      for (const d of dirs) {
        const res = this.simulateMove(current.head, current.occSet, d.dx, d.dy);
        if (res) {
          const nextOcc = new Set(current.occSet);
          for (const cell of res.newCells) {
            nextOcc.add(`${cell[0]},${cell[1]}`);
          }
          const key = makeKey(res.newHead, nextOcc);
          if (!visited.has(key)) {
            visited.add(key);
            queue.push({
              head: res.newHead,
              occSet: nextOcc,
              path: [...current.path, d.name]
            });
          }
        }
      }
    }

    return null; // No solution found or search budget reached
  }

  solve() {
    return this.solveFromCurrent(this.start, [this.start]);
  }
}

if (typeof window !== 'undefined') {
  window.LongcatSolver = LongcatSolver;
}
if (typeof module !== 'undefined') {
  module.exports = { LongcatSolver };
}
