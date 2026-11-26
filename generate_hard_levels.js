// Generate an extra world without changing the original 50 puzzles.
// Run on the original 50-level dataset: node generate_hard_levels.js
const fs = require('node:fs');
const { LongcatSolver } = require('./js/solver.js');

const levels = JSON.parse(fs.readFileSync('levels.json', 'utf8'));
if (levels.length === 70) {
  console.log('The 20 hard levels are already present.');
  process.exit(0);
}
if (levels.length !== 50) throw new Error('Expected the original 50 levels; inspect before regenerating.');

let seed = 20261126;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
function connected(w, h, walls, start) {
  const blocked = new Set(walls.map(([x, y]) => `${x},${y}`));
  const seen = new Set([`${start[0]},${start[1]}`]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && !blocked.has(key) && !seen.has(key)) {
        seen.add(key); queue.push([nx, ny]);
      }
    }
  }
  return seen.size === w * h - walls.length;
}

const seenBoards = new Set();
function findCandidates(w, h, minMoves, target, maxAttempts) {
  const candidates = [];
  for (let attempt = 0; attempt < maxAttempts && candidates.length < target; attempt++) {
    const cells = shuffle(Array.from({ length: w * h }, (_, i) => [i % w, Math.floor(i / w)]));
    const count = w === 7 && h === 6 ? 2 + Math.floor(random() * 4) : 2 + Math.floor(random() * 3);
    const walls = cells.slice(0, count);
    const start = cells[count];
    if (!connected(w, h, walls, start)) continue;
    const boardKey = `${w}x${h}|${walls.map(p => p.join(',')).sort().join(';')}|${start.join(',')}`;
    if (seenBoards.has(boardKey)) continue;
    seenBoards.add(boardKey);
    const solution = new LongcatSolver(w, h, walls, start).solve();
    if (!solution || solution.length < minMoves) continue;
    candidates.push({ w, h, walls, start, solution, moves: solution.length, walkable: w * h - walls.length });
  }
  if (candidates.length < 10) throw new Error(`Found only ${candidates.length} hard ${w}x${h} boards.`);
  console.log(`${w}x${h}: ${candidates.length} solvable candidates`);
  return candidates.sort((a, b) => a.moves - b.moves || a.walls.length - b.walls.length).slice(0, 10);
}

const selected = [
  ...findCandidates(7, 6, 16, 35, 30000),
  ...findCandidates(7, 7, 17, 35, 45000)
];
const bonus = selected.map((level, index) => ({
  ...level,
  id: 51 + index,
  name: `Nivel ${51 + index}`,
  world: index < 10 ? 6 : 7,
  worldName: index < 10 ? 'La Galaxia Enredada' : 'El Laberinto Infinito'
}));
const source = fs.readFileSync('js/levels.js', 'utf8').replace(/\r\n/g, '\n');
const data = fs.readFileSync('levels.json', 'utf8').replace(/\r\n/g, '\n');
if (!source.includes('\n];') || !data.trimEnd().endsWith(']')) throw new Error('Unexpected level file format.');
const block = bonus.map(level => JSON.stringify(level, null, 2).split('\n').map(line => `  ${line}`).join('\n')).join(',\n');
fs.writeFileSync('js/levels.js', source.replace('// 50 Handcrafted and verified solvable levels for Longcat', '// 70 verified solvable levels for Longcat').replace('\n];', `,\n${block}\n];`));
fs.writeFileSync('levels.json', data.trimEnd().replace(/\s*\]$/, `,\n${block}\n]`));
console.log(`Added levels 51–70 (${selected[0].moves}–${selected.at(-1).moves} moves).`);
