(() => {
  'use strict';

  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');
  const arena = document.querySelector('.arena');
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlayTitle');
  const message = document.getElementById('overlayText');
  const playButton = document.getElementById('playButton');
  const boostButton = document.getElementById('boostButton');
  const soundButton = document.getElementById('soundButton');
  const lengthValue = document.getElementById('lengthValue');
  const bestValue = document.getElementById('bestValue');
  const rankValue = document.getElementById('rankValue');
  const leaderboardList = document.getElementById('leaderboardList');
  const WORLD = 2800;
  const COLORS = ['#fc8f83', '#9f9cf5', '#66cbeb', '#ffd36b', '#ef91d5', '#9ddb73', '#ffad61', '#78d9bb'];
  const NAMES = ['Chispa', 'Mora', 'Rayo', 'Mango', 'Luna', 'Kiwi', 'Canela', 'Burbujas'];
  const FOOD = ['🍕', '🍩', '🍔', '🍫', '🍓', '🍒', '🧀', '🍪'];
  let width = 1, height = 1, dpr = 1;
  let running = false, lastTime = 0, lastHud = 0, best = 0, muted = false;
  let player, snakes = [], food = [], particles = [];
  let pointer = null, keys = new Set(), mouseBoost = false, touchBoost = false;
  let audio;

  try { best = Number(localStorage.getItem('pepa_snake_best')) || 0; } catch (_) { /* private storage */ }
  bestValue.textContent = best;

  function random(min, max) { return min + Math.random() * (max - min); }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function angleDifference(a, b) { return Math.atan2(Math.sin(b - a), Math.cos(b - a)); }
  function point(x, y) { return { x, y }; }
  function resize() {
    const bounds = arena.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(arena);
  resize();

  function makeSnake(name, color, x, y, length, bot) {
    const angle = random(-Math.PI, Math.PI);
    const trail = [];
    for (let i = 0; i < length; i += 7) trail.push(point(x - Math.cos(angle) * i, y - Math.sin(angle) * i));
    return { name, color, x, y, angle, target: angle, length, trail, sample: 0, bot, alive: true, turnIn: 0, boosting: false };
  }

  function addFood(x = random(25, WORLD - 25), y = random(25, WORLD - 25), rich = false) {
    food.push({ x, y, value: rich ? 15 : 7, icon: FOOD[Math.floor(Math.random() * FOOD.length)], phase: random(0, 7) });
  }

  function spawnBot(index) {
    const a = random(0, Math.PI * 2);
    const radius = random(300, 900);
    const x = Math.max(100, Math.min(WORLD - 100, WORLD / 2 + Math.cos(a) * radius));
    const y = Math.max(100, Math.min(WORLD - 100, WORLD / 2 + Math.sin(a) * radius));
    return makeSnake(NAMES[index], COLORS[index], x, y, random(110, 230), true);
  }

  function start() {
    food = []; particles = []; keys.clear(); pointer = null;
    mouseBoost = false; touchBoost = false;
    player = makeSnake('Tú', '#9bf090', WORLD / 2, WORLD / 2, 126, false);
    snakes = [player, ...NAMES.map((_, i) => spawnBot(i))];
    for (let i = 0; i < 330; i++) addFood();
    running = true;
    overlay.hidden = true;
    lastTime = performance.now();
    updateHud();
  }

  function sound(frequency, duration) {
    if (muted) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + duration);
    } catch (_) { /* audio is optional */ }
  }

  function dropSnake(snake) {
    for (let i = 0; i < snake.trail.length; i += 3) {
      const p = snake.trail[i];
      addFood(p.x + random(-8, 8), p.y + random(-8, 8), true);
    }
    snake.alive = false;
    if (snake === player) {
      running = false;
      const score = Math.round(player.length);
      if (score > best) {
        best = score;
        try { localStorage.setItem('pepa_snake_best', String(best)); } catch (_) { /* private storage */ }
      }
      title.textContent = '¡Fin de la partida!';
      message.textContent = `Alcanzaste una longitud de ${score}. Come bocados y haz que los rivales choquen contra tu cuerpo para crecer más.`;
      playButton.textContent = 'Volver a jugar';
      overlay.hidden = false;
      sound(180, .35);
      updateHud();
    } else {
      sound(320, .12);
      const index = NAMES.indexOf(snake.name);
      window.setTimeout(() => {
        if (running && index >= 0) snakes.push(spawnBot(index));
      }, 2600);
    }
  }

  function botDirection(snake, dt) {
    snake.turnIn -= dt;
    if (snake.turnIn > 0) return;
    snake.turnIn = random(.25, .7);
    let chosen = null, nearest = 200;
    for (const snack of food) {
      const d = distance(snake, snack);
      if (d < nearest) { nearest = d; chosen = snack; }
    }
    if (chosen) snake.target = Math.atan2(chosen.y - snake.y, chosen.x - snake.x);
    else snake.target += random(-.65, .65);
    if (snake.x < 180) snake.target = 0;
    if (snake.x > WORLD - 180) snake.target = Math.PI;
    if (snake.y < 180) snake.target = Math.PI / 2;
    if (snake.y > WORLD - 180) snake.target = -Math.PI / 2;
    for (const other of snakes) {
      if (!other.alive || other === snake) continue;
      for (let i = 0; i < other.trail.length; i += 5) {
        const p = other.trail[i];
        if (distance(snake, p) < 65) {
          snake.target = Math.atan2(snake.y - p.y, snake.x - p.x);
          return;
        }
      }
    }
  }

  function playerDirection() {
    let dx = 0, dy = 0;
    if (keys.has('a') || keys.has('arrowleft')) dx--;
    if (keys.has('d') || keys.has('arrowright')) dx++;
    if (keys.has('w') || keys.has('arrowup')) dy--;
    if (keys.has('s') || keys.has('arrowdown')) dy++;
    if (dx || dy) player.target = Math.atan2(dy, dx);
    else if (pointer) player.target = Math.atan2(pointer.y - height / 2, pointer.x - width / 2);
  }

  function moveSnake(snake, dt) {
    if (!snake.alive) return;
    if (snake.bot) botDirection(snake, dt);
    else playerDirection();
    snake.angle += Math.max(-2.9 * dt, Math.min(2.9 * dt, angleDifference(snake.angle, snake.target)));
    snake.boosting = !snake.bot && (mouseBoost || touchBoost || keys.has(' ') || keys.has('shift')) && snake.length > 85;
    const speed = snake.boosting ? 230 : snake.bot ? 110 : 125;
    const traveled = speed * dt;
    snake.x += Math.cos(snake.angle) * traveled;
    snake.y += Math.sin(snake.angle) * traveled;
    if (snake.boosting) {
      snake.length = Math.max(85, snake.length - 14 * dt);
      if (Math.random() < dt * 7) addFood(snake.x - Math.cos(snake.angle) * 20, snake.y - Math.sin(snake.angle) * 20);
    }
    snake.sample += traveled;
    if (snake.sample >= 7) {
      snake.trail.unshift(point(snake.x, snake.y));
      snake.sample %= 7;
    }
    snake.trail[0] = point(snake.x, snake.y);
    while (snake.trail.length > Math.ceil(snake.length / 7)) snake.trail.pop();
  }

  function collisions(snake) {
    if (!snake.alive) return;
    if (snake.x < 13 || snake.x > WORLD - 13 || snake.y < 13 || snake.y > WORLD - 13) {
      dropSnake(snake); return;
    }
    for (let i = food.length - 1; i >= 0; i--) {
      if (distance(snake, food[i]) < 19) {
        snake.length += food[i].value;
        for (let j = 0; j < 5; j++) particles.push({ x: food[i].x, y: food[i].y, vx: random(-55, 55), vy: random(-55, 55), life: .45 });
        food.splice(i, 1);
        if (snake === player) sound(480 + Math.min(260, snake.length), .07);
      }
    }
    for (const other of snakes) {
      if (!other.alive) continue;
      for (let i = other === snake ? 10 : 0; i < other.trail.length; i += 2) {
        if (distance(snake, other.trail[i]) < 17) { dropSnake(snake); return; }
      }
    }
  }

  function update(dt) {
    for (const snake of snakes) moveSnake(snake, dt);
    for (const snake of [...snakes]) collisions(snake);
    snakes = snakes.filter(s => s.alive);
    for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    while (food.length < 330) addFood();
  }

  function drawBackground(cameraX, cameraY) {
    ctx.fillStyle = '#203c3c'; ctx.fillRect(0, 0, width, height);
    const grid = 80;
    ctx.strokeStyle = '#9fe4bd10'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = ((-cameraX % grid) + grid) % grid; x < width; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = ((-cameraY % grid) + grid) % grid; y < height; y += grid) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();
    ctx.strokeStyle = '#7fe0ae'; ctx.lineWidth = 8;
    ctx.strokeRect(-cameraX, -cameraY, WORLD, WORLD);
  }

  function drawSnake(snake) {
    if (snake.trail.length < 2) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(snake.trail[0].x, snake.trail[0].y);
    for (let i = 1; i < snake.trail.length; i++) ctx.lineTo(snake.trail[i].x, snake.trail[i].y);
    ctx.strokeStyle = '#071b1c88'; ctx.lineWidth = 30; ctx.stroke();
    ctx.strokeStyle = snake.color; ctx.lineWidth = 23; ctx.stroke();
    ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 5; ctx.stroke();
    ctx.save(); ctx.translate(snake.x, snake.y); ctx.rotate(snake.angle);
    ctx.fillStyle = snake.color; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    for (const y of [-7, 7]) { ctx.beginPath(); ctx.arc(6, y, 4.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#1c3334';
    for (const y of [-7, 7]) { ctx.beginPath(); ctx.arc(8, y, 2.1, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.font = '700 13px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = '#12272c'; ctx.fillText(snake.name, snake.x + 1, snake.y - 23 + 1);
    ctx.fillStyle = '#ffffff'; ctx.fillText(snake.name, snake.x, snake.y - 23);
  }

  function render(time) {
    const cameraX = player ? player.x - width / 2 : WORLD / 2 - width / 2;
    const cameraY = player ? player.y - height / 2 : WORLD / 2 - height / 2;
    drawBackground(cameraX, cameraY);
    ctx.save(); ctx.translate(-cameraX, -cameraY);
    for (const snack of food) {
      if (snack.x < cameraX - 25 || snack.x > cameraX + width + 25 || snack.y < cameraY - 25 || snack.y > cameraY + height + 25) continue;
      ctx.fillStyle = '#102d2a88'; ctx.beginPath(); ctx.arc(snack.x, snack.y + 3, 12, 0, Math.PI * 2); ctx.fill();
      ctx.font = `${18 + Math.sin(time / 380 + snack.phase) * 1.5}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(snack.icon, snack.x, snack.y);
    }
    for (const snake of snakes) drawSnake(snake);
    for (const p of particles) { ctx.globalAlpha = p.life / .45; ctx.fillStyle = '#ffe286'; ctx.fillRect(p.x, p.y, 4, 4); }
    ctx.globalAlpha = 1; ctx.restore();
    if (player && running) {
      const x = width - 94, y = height - 104, size = 72;
      ctx.fillStyle = '#0d292bd9'; ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = '#80c49a'; ctx.strokeRect(x, y, size, size);
      ctx.fillStyle = '#9bf090';
      ctx.beginPath(); ctx.arc(x + player.x / WORLD * size, y + player.y / WORLD * size, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function updateHud() {
    const ranking = [...snakes].sort((a, b) => b.length - a.length);
    lengthValue.textContent = player ? Math.round(player.length) : 0;
    bestValue.textContent = Math.max(best, player ? Math.round(player.length) : 0);
    rankValue.textContent = player && player.alive ? `${ranking.indexOf(player) + 1} / ${ranking.length}` : '—';
    leaderboardList.replaceChildren(...ranking.slice(0, 5).map(snake => {
      const item = document.createElement('li');
      item.textContent = `${snake.name} · ${Math.round(snake.length)}`;
      if (snake === player) item.className = 'you';
      return item;
    }));
    boostButton.classList.toggle('active', Boolean(player?.boosting));
  }

  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000 || 0, .033);
    lastTime = time;
    if (running) update(dt);
    render(time);
    if (time - lastHud > 150) { updateHud(); lastHud = time; }
    requestAnimationFrame(loop);
  }

  playButton.addEventListener('click', start);
  soundButton.addEventListener('click', () => {
    muted = !muted;
    soundButton.textContent = muted ? '🔇' : '🔊';
    soundButton.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
  });
  window.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift', 'w', 'a', 's', 'd'].includes(key)) {
      if (running) event.preventDefault();
      keys.add(key);
    }
  });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => { keys.clear(); mouseBoost = false; touchBoost = false; });
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pointer = point(event.clientX - rect.left, event.clientY - rect.top);
  });
  canvas.addEventListener('pointerdown', event => {
    const rect = canvas.getBoundingClientRect();
    pointer = point(event.clientX - rect.left, event.clientY - rect.top);
    if (event.pointerType === 'mouse') mouseBoost = true;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup', () => { mouseBoost = false; });
  canvas.addEventListener('pointercancel', () => { mouseBoost = false; });
  boostButton.addEventListener('pointerdown', event => { event.preventDefault(); touchBoost = true; boostButton.setPointerCapture(event.pointerId); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) boostButton.addEventListener(type, () => { touchBoost = false; });

  requestAnimationFrame(loop);
})();
