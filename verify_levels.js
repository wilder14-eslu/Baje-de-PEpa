const assert = require('node:assert/strict');
const { LEVELS } = require('./js/levels.js');
const saved = require('./levels.json');
const { LongcatSolver } = require('./js/solver.js');

assert.deepEqual(LEVELS, saved, 'The browser and JSON level lists must match');
assert.equal(LEVELS.length, 70);

const directions = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
for (const [index, level] of LEVELS.entries()) {
  assert.equal(level.id, index + 1);
  assert.equal(level.moves, level.solution.length);
  assert.equal(level.walkable, level.w * level.h - level.walls.length);
  const solver = new LongcatSolver(level.w, level.h, level.walls, level.start);
  const shortest = solver.solve();
  assert.ok(shortest, `Level ${level.id} needs a solution within the hint budget`);
  assert.equal(shortest.length, level.moves, `Level ${level.id} should have the listed minimum move count`);

  let head = level.start;
  const occupied = new Set([head.join(',')]);
  for (const direction of level.solution) {
    const delta = directions[direction];
    assert.ok(delta, `Unknown direction in level ${level.id}`);
    const result = solver.simulateMove(head, occupied, ...delta);
    assert.ok(result, `Invalid move in level ${level.id}`);
    head = result.newHead;
    for (const cell of result.newCells) occupied.add(cell.join(','));
  }
  assert.equal(occupied.size, level.walkable, `Level ${level.id} is not completely covered`);
}

console.log(`Verified ${LEVELS.length} levels and their shortest solutions.`);
