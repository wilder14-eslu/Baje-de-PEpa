(() => {
  'use strict';

  const canvas = document.getElementById('pacdashCanvas');
  const ctx = canvas.getContext('2d');
  const shell = document.querySelector('.game-shell');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayMessage = document.getElementById('overlayMessage');
  const playButton = document.getElementById('playButton');
  const statusText = document.getElementById('statusText');
  const livesValue = document.getElementById('livesValue');
  const scoreValue = document.getElementById('scoreValue');
  const routesValue = document.getElementById('routesValue');
  const jumpButton = document.getElementById('jumpButton');
  const soundButton = document.getElementById('soundButton');
  const W = 25, H = 17;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const ROUTES = [
    { name: 'Ruta Neón', color: '#63e7ff', x: W - 2, y: 1, count: 5 },
    { name: 'Ruta Tormenta', color: '#ff9dd8', x: 1, y: H - 2, count: 6 },
    { name: 'Ruta Prisma', color: '#ffe081', x: W - 2, y: H - 2, count: 7 }
  ];
  let width = 1, height = 1, dpr = 1, frame = 0, lastTime = 0, animationFrame = 0, skipped = false;
  let mode = 'menu', maze, pellets, powerPellets, player, ghosts, dash;
  let score = 0, lives = 3, powered = 0, completed = new Set();
  let desired = 'right', facing = 'right', moveTimer = 0, ghostTimer = 0;
  let muted = false, audio, jumpBuffer = 0;

  function key(x, y) { return `${x},${y}`; }
  function seededRandom() {
    let seed = 83127;
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function createMaze() {
    const random = seededRandom();
    const board = Array.from({ length: H }, () => Array(W).fill('#'));
    const stack = [[1, 1]];
    board[1][1] = ' ';
    while (stack.length) {
      const [x, y] = stack.at(-1);
      const choices = [[2, 0], [-2, 0], [0, 2], [0, -2]]
        .filter(([dx, dy]) => x + dx > 0 && x + dx < W - 1 && y + dy > 0 && y + dy < H - 1 && board[y + dy][x + dx] === '#');
      if (!choices.length) { stack.pop(); continue; }
      const [dx, dy] = choices[Math.floor(random() * choices.length)];
      board[y + dy / 2][x + dx / 2] = ' ';
      board[y + dy][x + dx] = ' ';
      stack.push([x + dx, y + dy]);
    }
    // Open a few connections so each quadrant offers more than one way through.
    let opened = 0;
    for (let y = 2; y < H - 2 && opened < 19; y++) {
      for (let x = 2; x < W - 2 && opened < 19; x++) {
        if (board[y][x] !== '#' || random() > .17) continue;
        if ((board[y][x - 1] === ' ' && board[y][x + 1] === ' ') ||
            (board[y - 1][x] === ' ' && board[y + 1][x] === ' ')) {
          board[y][x] = ' ';
          opened++;
        }
      }
    }
    return board;
  }
  function walkable(x, y) { return x >= 0 && x < W && y >= 0 && y < H && maze[y][x] === ' '; }
  function updateHud() {
    livesValue.textContent = '♥'.repeat(lives) || '—';
    scoreValue.textContent = score;
    routesValue.textContent = `${completed.size}/3`;
  }
  function announce(text) { statusText.textContent = text; }
  function resize() {
    const rect = shell.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(shell);
  resize();

  function sound(frequency, duration) {
    if (muted) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'triangle'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.045, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + duration);
    } catch (_) { /* Sound is optional. */ }
  }
  function resetPositions() {
    player = { x: 1, y: 1 };
    ghosts = [
      { x: W - 4, y: H - 4, home: [W - 4, H - 4], color: '#ff7b97' },
      { x: W - 6, y: 3, home: [W - 6, 3], color: '#a6a1ff' }
    ];
    desired = 'right'; facing = 'right';
  }
  function start() {
    maze = createMaze();
    pellets = new Set(); powerPellets = new Set();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (walkable(x, y) && !(x === 1 && y === 1) && !ROUTES.some(r => r.x === x && r.y === y)) pellets.add(key(x, y));
    }
    for (const [x, y] of [[W - 4, 3], [3, H - 4], [W - 4, H - 4]]) {
      if (walkable(x, y)) { pellets.delete(key(x, y)); powerPellets.add(key(x, y)); }
    }
    score = 0; lives = 3; powered = 0; completed = new Set();
    moveTimer = 0; ghostTimer = 0; jumpBuffer = 0;
    resetPositions();
    mode = 'maze'; shell.dataset.mode = mode;
    overlay.hidden = true;
    announce('Encuentra los tres portales de colores. Los puntos grandes ahuyentan fantasmas.');
    updateHud();
  }
  function gameOver() {
    mode = 'over'; shell.dataset.mode = mode;
    overlayTitle.textContent = '¡Inténtalo otra vez!';
    overlayMessage.textContent = `Conseguiste ${score} puntos y completaste ${completed.size} de 3 rutas.`;
    playButton.textContent = 'Reiniciar'; overlay.hidden = false;
    announce('Partida terminada.'); sound(150, .35);
  }
  function loseLife() {
    lives--; updateHud(); sound(180, .3);
    if (lives <= 0) { gameOver(); return; }
    if (mode === 'dash') {
      const route = dash.route;
      enterDash(route);
      announce(`Choque en ${route.name}. Quedan ${lives} vidas; vuelve a saltar.`);
    } else {
      resetPositions(); powered = 0;
      announce(`Te alcanzó un fantasma. Quedan ${lives} vidas.`);
    }
  }
  function checkGhosts() {
    for (const ghost of ghosts) {
      if (ghost.x !== player.x || ghost.y !== player.y) continue;
      if (powered > 0) {
        score += 100;
        [ghost.x, ghost.y] = ghost.home;
        sound(650, .12);
        updateHud();
      } else loseLife();
      return;
    }
  }
  function stepMaze() {
    let direction = desired;
    if (!direction || !walkable(player.x + DIRS[direction][0], player.y + DIRS[direction][1])) direction = facing;
    if (!direction || !walkable(player.x + DIRS[direction][0], player.y + DIRS[direction][1])) return;
    player.x += DIRS[direction][0]; player.y += DIRS[direction][1]; facing = direction;
    const position = key(player.x, player.y);
    if (pellets.delete(position)) { score += 10; sound(360, .045); }
    if (powerPellets.delete(position)) { score += 50; powered = 8; sound(660, .15); announce('¡Superpoder! Puedes atrapar fantasmas durante unos segundos.'); }
    updateHud(); checkGhosts();
    if (mode !== 'maze') return;
    const route = ROUTES.find(r => r.x === player.x && r.y === player.y && !completed.has(r.name));
    if (route) enterDash(route);
  }
  function distancesFromPlayer() {
    const distance = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const queue = [[player.x, player.y]]; distance[player.y][player.x] = 0;
    for (let index = 0; index < queue.length; index++) {
      const [x, y] = queue[index];
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        if (walkable(nx, ny) && distance[ny][nx] === Infinity) {
          distance[ny][nx] = distance[y][x] + 1; queue.push([nx, ny]);
        }
      }
    }
    return distance;
  }
  function stepGhosts() {
    const distances = distancesFromPlayer();
    for (const ghost of ghosts) {
      const options = Object.values(DIRS).map(([dx, dy]) => [ghost.x + dx, ghost.y + dy])
        .filter(([x, y]) => walkable(x, y));
      if (!options.length) continue;
      options.sort((a, b) => powered > 0 ? distances[b[1]][b[0]] - distances[a[1]][a[0]] : distances[a[1]][a[0]] - distances[b[1]][b[0]]);
      [ghost.x, ghost.y] = options[0];
      checkGhosts();
      if (mode !== 'maze') return;
    }
  }
  function enterDash(route) {
    dash = {
      route, distance: 0, y: 0, vy: 0,
      obstacles: Array.from({ length: route.count }, (_, i) => ({
        x: 340 + i * 235,
        width: i % 3 === 1 ? 38 : 32,
        height: i % 3 === 1 ? 48 : 35,
        block: i % 3 === 1
      }))
    };
    mode = 'dash'; shell.dataset.mode = mode; jumpBuffer = 0;
    announce(`${route.name}: salta los ${route.count} obstáculos. Espacio, ↑, W o botón Saltar.`);
    sound(520, .16);
  }
  function finishDash() {
    completed.add(dash.route.name); score += 500;
    sound(850, .3); updateHud();
    if (completed.size === ROUTES.length) {
      mode = 'won'; shell.dataset.mode = mode;
      overlayTitle.textContent = '¡Todas las rutas superadas!';
      overlayMessage.textContent = `Terminaste el laberinto y sus tres tramos Dash con ${score} puntos.`;
      playButton.textContent = 'Jugar de nuevo'; overlay.hidden = false;
      announce('¡Victoria! Completaste las tres rutas.');
    } else {
      mode = 'maze'; shell.dataset.mode = mode;
      announce(`${dash.route.name} superada. Busca los otros portales (${completed.size}/3).`);
    }
  }
  function stepDash(dt) {
    jumpBuffer = Math.max(0, jumpBuffer - dt);
    if (jumpBuffer > 0 && dash.y === 0) {
      dash.vy = 575; jumpBuffer = 0; sound(520, .07);
    }
    dash.distance += 226 * dt;
    dash.y += dash.vy * dt;
    dash.vy -= 1500 * dt;
    if (dash.y < 0) { dash.y = 0; dash.vy = 0; }
    const x = dash.distance + 90;
    for (const obstacle of dash.obstacles) {
      if (x + 13 > obstacle.x && x - 13 < obstacle.x + obstacle.width && dash.y < obstacle.height - 4) {
        loseLife(); return;
      }
    }
    if (x > dash.obstacles.at(-1).x + 190) finishDash();
  }
  function update(dt) {
    frame += dt; powered = Math.max(0, powered - dt);
    if (mode === 'maze') {
      moveTimer += dt; ghostTimer += dt;
      while (moveTimer >= .13 && mode === 'maze') { moveTimer -= .13; stepMaze(); }
      while (ghostTimer >= .24 && mode === 'maze') { ghostTimer -= .24; stepGhosts(); }
    } else if (mode === 'dash') stepDash(dt);
  }

  function mazeLayout() {
    const tile = Math.max(1, Math.min((width - 16) / W, (height - 135) / H, 34));
    return { tile, ox: (width - tile * W) / 2, oy: (height - tile * H) / 2 + 12 };
  }
  function drawMaze() {
    ctx.fillStyle = '#0c1231'; ctx.fillRect(0, 0, width, height);
    if (!maze) return;
    const { tile, ox, oy } = mazeLayout();
    ctx.save(); ctx.translate(ox, oy);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = x * tile, py = y * tile;
      if (maze[y][x] === '#') {
        ctx.fillStyle = '#29358b'; ctx.fillRect(px + 1, py + 1, tile - 2, tile - 2);
        ctx.strokeStyle = '#6478df'; ctx.lineWidth = Math.max(1, tile * .06);
        ctx.strokeRect(px + 2, py + 2, tile - 4, tile - 4);
      } else {
        ctx.fillStyle = '#141c4b'; ctx.fillRect(px, py, tile, tile);
        if (pellets.has(key(x, y))) {
          ctx.fillStyle = '#ffe09b'; ctx.beginPath(); ctx.arc(px + tile / 2, py + tile / 2, Math.max(1.5, tile * .095), 0, Math.PI * 2); ctx.fill();
        }
        if (powerPellets.has(key(x, y))) {
          ctx.fillStyle = '#91eaff'; ctx.beginPath(); ctx.arc(px + tile / 2, py + tile / 2, tile * .22 + Math.sin(frame * 6) * 1.3, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    for (const route of ROUTES) {
      const cx = (route.x + .5) * tile, cy = (route.y + .5) * tile;
      ctx.strokeStyle = completed.has(route.name) ? '#79e5a4' : route.color;
      ctx.lineWidth = Math.max(2, tile * .12);
      ctx.beginPath(); ctx.arc(cx, cy, tile * .36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = completed.has(route.name) ? '#79e5a4' : route.color;
      ctx.font = `900 ${Math.max(8, tile * .45)}px system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(completed.has(route.name) ? '✓' : String(ROUTES.indexOf(route) + 1), cx, cy + 1);
    }
    for (const ghost of ghosts) {
      const cx = (ghost.x + .5) * tile, cy = (ghost.y + .5) * tile;
      ctx.fillStyle = powered > 0 ? '#78c8ff' : ghost.color;
      ctx.beginPath(); ctx.arc(cx, cy, tile * .34, Math.PI, 0); ctx.lineTo(cx + tile * .34, cy + tile * .28); ctx.lineTo(cx - tile * .34, cy + tile * .28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      for (const dx of [-.13, .13]) { ctx.beginPath(); ctx.arc(cx + dx * tile, cy - tile * .04, tile * .08, 0, Math.PI * 2); ctx.fill(); }
    }
    const cx = (player.x + .5) * tile, cy = (player.y + .5) * tile;
    const angle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[facing];
    const mouth = .22 + (Math.sin(frame * 12) + 1) * .16;
    ctx.fillStyle = '#ffe178'; ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, tile * .37, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function drawDash() {
    const route = dash.route;
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#111639'); sky.addColorStop(1, '#35347b');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
    const ground = height * .73;
    ctx.strokeStyle = '#ffffff18'; ctx.lineWidth = 1;
    for (let x = -((dash.distance * .35) % 55); x < width; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ground); ctx.stroke(); }
    ctx.fillStyle = route.color; ctx.globalAlpha = .22;
    for (let i = 0; i < 15; i++) {
      const x = (i * 121 - dash.distance * .2) % (width + 150);
      ctx.fillRect(x < -30 ? x + width + 150 : x, 100 + i % 5 * 52, 18, 18);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#151b4b'; ctx.fillRect(0, ground, width, height - ground);
    ctx.strokeStyle = route.color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(width, ground); ctx.stroke();
    for (const obstacle of dash.obstacles) {
      const x = obstacle.x - dash.distance;
      if (x < -60 || x > width + 60) continue;
      ctx.fillStyle = obstacle.block ? '#ff9bd7' : '#ff715e';
      ctx.strokeStyle = '#fff5'; ctx.lineWidth = 2;
      if (obstacle.block) { ctx.fillRect(x, ground - obstacle.height, obstacle.width, obstacle.height); ctx.strokeRect(x, ground - obstacle.height, obstacle.width, obstacle.height); }
      else { ctx.beginPath(); ctx.moveTo(x, ground); ctx.lineTo(x + obstacle.width / 2, ground - obstacle.height); ctx.lineTo(x + obstacle.width, ground); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    }
    const avatarY = ground - dash.y - 28;
    ctx.save(); ctx.translate(90, avatarY + 14); ctx.rotate(Math.min(.45, dash.y / 300));
    ctx.fillStyle = '#ffe178'; ctx.fillRect(-14, -14, 28, 28);
    ctx.fillStyle = '#29315d'; ctx.fillRect(1, -6, 4, 4); ctx.fillRect(8, -6, 4, 4);
    ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = '800 18px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(route.name, 22, 120);
    const finish = dash.obstacles.at(-1).x + 190;
    ctx.fillStyle = '#ffffff44'; ctx.fillRect(22, 135, Math.min(230, width - 44), 7);
    ctx.fillStyle = route.color; ctx.fillRect(22, 135, Math.min(230, width - 44) * Math.min(1, (dash.distance + 90) / finish), 7);
  }
  function render() {
    if (mode === 'dash') drawDash(); else drawMaze();
  }
  function loop(now) {
    animationFrame = 0;
    const dt = Math.min((now - lastTime) / 1000 || 0, .033);
    lastTime = now;
    if (mode === 'maze' || mode === 'dash') update(dt);
    render();
    if (!document.hidden && !skipped) animationFrame = requestAnimationFrame(loop);
  }
  function updateVisibility() {
    if (document.hidden || skipped) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else if (!animationFrame) {
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(loop);
    }
  }
  function setDirection(direction) { desired = direction; }
  function jump() { if (mode === 'dash') jumpBuffer = .14; }

  playButton.addEventListener('click', start);
  soundButton.addEventListener('click', () => {
    muted = !muted; soundButton.textContent = muted ? '🔇' : '🔊';
    soundButton.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
  });
  window.addEventListener('keydown', event => {
    const mapping = { arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right' };
    const keyName = event.key.toLowerCase();
    if (mapping[keyName] || keyName === ' ') {
      if (mode === 'maze' || mode === 'dash') event.preventDefault();
      if (mode === 'maze' && mapping[keyName]) setDirection(mapping[keyName]);
      if (mode === 'dash' && !event.repeat && (keyName === ' ' || keyName === 'arrowup' || keyName === 'w')) jump();
    }
  });
  for (const button of document.querySelectorAll('[data-direction]')) {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); setDirection(button.dataset.direction);
      button.setPointerCapture(event.pointerId);
    });
  }
  jumpButton.addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
  canvas.addEventListener('pointerdown', event => { if (mode === 'dash') { event.preventDefault(); jump(); } });
  document.addEventListener('visibilitychange', updateVisibility);
  shell.addEventListener('contentvisibilityautostatechange', event => {
    skipped = event.skipped;
    updateVisibility();
  });
  updateVisibility();
})();
