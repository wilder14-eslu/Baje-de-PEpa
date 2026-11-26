/**
 * Longcat - High-Performance Canvas Renderer
 * Renders the 2.5D voxel-styled game board, animated stretching cat,
 * facial expressions, particles, and visual juice.
 */

class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.skin = localStorage.getItem('longcat_skin') || 'orange';

    this.skins = {
      orange: {
        name: 'Naranjito (Clásico)',
        body: '#f59e0b',
        bodyDark: '#d97706',
        bodyHighlight: '#fbbf24',
        stripe: '#b45309',
        belly: '#fef3c7',
        earInner: '#f472b6',
        eyeColor: '#1e293b',
        noseColor: '#f43f5e'
      },
      white: {
        name: 'Copito de Nieve',
        body: '#f8fafc',
        bodyDark: '#cbd5e1',
        bodyHighlight: '#ffffff',
        stripe: '#e2e8f0',
        belly: '#ffffff',
        earInner: '#f472b6',
        eyeColor: '#0284c7',
        noseColor: '#fb7185'
      },
      black: {
        name: 'Michi Medianoche',
        body: '#1e293b',
        bodyDark: '#0f172a',
        bodyHighlight: '#334155',
        stripe: '#0f172a',
        belly: '#334155',
        earInner: '#f43f5e',
        eyeColor: '#facc15',
        noseColor: '#fb7185'
      },
      calico: {
        name: 'Calicó de la Suerte',
        body: '#ea580c',
        bodyDark: '#c2410c',
        bodyHighlight: '#fb923c',
        stripe: '#18181b',
        belly: '#ffffff',
        earInner: '#f472b6',
        eyeColor: '#15803d',
        noseColor: '#f43f5e'
      },
      cyber: {
        name: 'Cyber Michi 2077',
        body: '#06b6d4',
        bodyDark: '#0891b2',
        bodyHighlight: '#67e8f9',
        stripe: '#d946ef',
        belly: '#a5f3fc',
        earInner: '#ec4899',
        eyeColor: '#f43f5e',
        noseColor: '#a855f7'
      }
    };

    this.particles = [];
    this.confetti = [];
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.tailAngle = 0;
    this.wigglePhase = 0;
    this.hintDirection = null; // 'U', 'D', 'L', 'R'
    this.hintPulse = 0;
  }

  setSkin(skinId) {
    if (this.skins[skinId]) {
      this.skin = skinId;
      localStorage.setItem('longcat_skin', skinId);
    }
  }

  getSkin() {
    return this.skins[this.skin] || this.skins.orange;
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height, 680);

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;

    this.ctx.scale(dpr, dpr);
    this.cssSize = size;
  }

  addConfetti() {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: this.cssSize / 2,
        y: this.cssSize / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16 - 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        life: 1
      });
    }
  }

  setHint(dir) {
    this.hintDirection = dir;
    this.hintPulse = 0;
  }

  clearHint() {
    this.hintDirection = null;
  }

  render(gameState, animState) {
    const size = this.cssSize || 500;
    this.ctx.clearRect(0, 0, size, size);

    if (!gameState || !gameState.currentLevel) return;

    const level = gameState.currentLevel;
    const padding = 28;
    const boardArea = size - padding * 2;
    const cellSize = Math.min(boardArea / level.w, boardArea / level.h, 72);

    const boardW = level.w * cellSize;
    const boardH = level.h * cellSize;
    const offsetX = (size - boardW) / 2;
    const offsetY = (size - boardH) / 2;

    this.updateAnimations();

    // 1. Draw outer board shadow & base
    this.drawBoardBase(offsetX, offsetY, boardW, boardH, cellSize, level);

    // 2. Draw grid tiles
    this.drawGridTiles(offsetX, offsetY, cellSize, level, gameState);

    // 3. Draw hint arrow if active
    if (this.hintDirection && !gameState.isWon) {
      this.drawHintArrow(offsetX, offsetY, cellSize, gameState);
    }

    // 4. Draw cat (tail, body, head)
    this.drawCat(offsetX, offsetY, cellSize, gameState, animState);

    // 5. Draw walls (3D voxel blocks)
    this.drawWalls(offsetX, offsetY, cellSize, level);

    // 6. Draw particles & confetti
    this.drawParticles();
  }

  updateAnimations() {
    this.wigglePhase += 0.05;
    this.tailAngle = Math.sin(this.wigglePhase) * 0.35;

    // Blinking logic
    this.blinkTimer++;
    if (!this.isBlinking && this.blinkTimer > 180 + Math.random() * 80) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    } else if (this.isBlinking && this.blinkTimer > 10) {
      this.isBlinking = false;
      this.blinkTimer = 0;
    }

    if (this.hintDirection) {
      this.hintPulse = (this.hintPulse + 0.08) % (Math.PI * 2);
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    if (r < 0) r = 0;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  drawBoardBase(x, y, w, h, cellSize, level) {
    const ctx = this.ctx;
    const r = 18;
    const depth = 12;

    // Deep drop shadow
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;

    // Bottom 3D slab
    ctx.fillStyle = '#cbd5e1';
    this.roundRect(ctx, x - 10, y - 10 + depth, w + 20, h + 20, r);
    ctx.fill();
    ctx.restore();

    // Board rim
    ctx.fillStyle = '#e2e8f0';
    this.roundRect(ctx, x - 8, y - 8, w + 16, h + 16, r);
    ctx.fill();

    // Board floor background
    ctx.fillStyle = '#f1f5f9';
    this.roundRect(ctx, x - 4, y - 4, w + 8, h + 8, r - 4);
    ctx.fill();
  }

  drawGridTiles(ox, oy, cellSize, level, gameState) {
    const ctx = this.ctx;
    const wallsSet = new Set(level.walls.map(([wx, wy]) => `${wx},${wy}`));
    const occupiedSet = gameState.occupiedSet || new Set();

    for (let gy = 0; gy < level.h; gy++) {
      for (let gx = 0; gx < level.w; gx++) {
        const key = `${gx},${gy}`;
        if (wallsSet.has(key)) continue;

        const tx = ox + gx * cellSize;
        const ty = oy + gy * cellSize;
        const inset = 3;
        const tileSize = cellSize - inset * 2;

        const isFilled = occupiedSet.has(key);

        // Tile base
        ctx.fillStyle = isFilled ? '#fef08a' : ((gx + gy) % 2 === 0 ? '#ffffff' : '#f8fafc');
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;

        this.roundRect(ctx, tx + inset, ty + inset, tileSize, tileSize, 8);
        ctx.fill();
        ctx.stroke();

        // Subtle dot target on unfilled tiles
        if (!isFilled) {
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(tx + cellSize / 2, ty + cellSize / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  drawWalls(ox, oy, cellSize, level) {
    const ctx = this.ctx;
    const depth = cellSize * 0.22;
    const inset = 2;

    // Draw wall blocks with 3D bevel (isometric-like voxel appearance)
    for (const [wx, wy] of level.walls) {
      const wxPos = ox + wx * cellSize + inset;
      const wyPos = oy + wy * cellSize + inset;
      const wSize = cellSize - inset * 2;
      const r = 8;

      // Drop shadow of the wall
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      this.roundRect(ctx, wxPos, wyPos + depth + 2, wSize, wSize, r);
      ctx.fill();

      // Front shadow side
      ctx.fillStyle = '#64748b';
      this.roundRect(ctx, wxPos, wyPos + depth, wSize, wSize, r);
      ctx.fill();

      // Top face
      ctx.fillStyle = '#94a3b8';
      this.roundRect(ctx, wxPos, wyPos, wSize, wSize, r);
      ctx.fill();

      // Top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(wxPos + 8, wyPos + 8, 4, 0, Math.PI * 2);
      ctx.fill();

      // Decorative block pattern (brick cross)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wxPos + wSize * 0.3, wyPos + wSize * 0.5);
      ctx.lineTo(wxPos + wSize * 0.7, wyPos + wSize * 0.5);
      ctx.stroke();
    }
  }

  drawCat(ox, oy, cellSize, gameState, animState) {
    const ctx = this.ctx;
    const skin = this.getSkin();
    const segments = gameState.segments || [];
    if (segments.length === 0) return;

    const catRadius = (cellSize * 0.72) / 2;

    // 1. Draw Tail at the starting segment
    const startCell = segments[0];
    const tailX = ox + startCell[0] * cellSize + cellSize / 2;
    const tailY = oy + startCell[1] * cellSize + cellSize / 2;
    this.drawTail(tailX, tailY, catRadius, skin);

    // 2. Draw Body Segments (connected pill tubes with seamless joints)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Drop shadow under the body
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.lineWidth = catRadius * 2;
    ctx.beginPath();
    for (let i = 0; i < segments.length; i++) {
      const cx = ox + segments[i][0] * cellSize + cellSize / 2;
      const cy = oy + segments[i][1] * cellSize + cellSize / 2 + 4;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    // If sliding smoothly, interpolate to animated head
    if (animState && animState.isAnimating) {
      const animX = ox + animState.headX * cellSize + cellSize / 2;
      const animY = oy + animState.headY * cellSize + cellSize / 2 + 4;
      ctx.lineTo(animX, animY);
    }
    ctx.stroke();

    // Main cat body color
    ctx.strokeStyle = skin.body;
    ctx.lineWidth = catRadius * 2;
    ctx.beginPath();
    for (let i = 0; i < segments.length; i++) {
      const cx = ox + segments[i][0] * cellSize + cellSize / 2;
      const cy = oy + segments[i][1] * cellSize + cellSize / 2;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    if (animState && animState.isAnimating) {
      const animX = ox + animState.headX * cellSize + cellSize / 2;
      const animY = oy + animState.headY * cellSize + cellSize / 2;
      ctx.lineTo(animX, animY);
    }
    ctx.stroke();

    // Top highlight along body
    ctx.strokeStyle = skin.bodyHighlight;
    ctx.lineWidth = catRadius * 0.7;
    ctx.beginPath();
    for (let i = 0; i < segments.length; i++) {
      const cx = ox + segments[i][0] * cellSize + cellSize / 2;
      const cy = oy + segments[i][1] * cellSize + cellSize / 2 - 3;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    if (animState && animState.isAnimating) {
      const animX = ox + animState.headX * cellSize + cellSize / 2;
      const animY = oy + animState.headY * cellSize + cellSize / 2 - 3;
      ctx.lineTo(animX, animY);
    }
    ctx.stroke();

    // Decorative stripes on corners / mid-segments
    for (let i = 1; i < segments.length - 1; i++) {
      const cx = ox + segments[i][0] * cellSize + cellSize / 2;
      const cy = oy + segments[i][1] * cellSize + cellSize / 2;
      ctx.fillStyle = skin.stripe;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Cat Head
    let headX, headY;
    if (animState && animState.isAnimating) {
      headX = ox + animState.headX * cellSize + cellSize / 2;
      headY = oy + animState.headY * cellSize + cellSize / 2;
    } else {
      const last = segments[segments.length - 1];
      headX = ox + last[0] * cellSize + cellSize / 2;
      headY = oy + last[1] * cellSize + cellSize / 2;
    }

    this.drawHead(headX, headY, catRadius * 1.15, skin, gameState, animState);
  }

  drawTail(x, y, r, skin) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.tailAngle);

    ctx.strokeStyle = skin.bodyDark;
    ctx.lineWidth = r * 0.6;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-r * 0.8, -r * 0.6, -r * 1.2, -r * 0.2);
    ctx.stroke();

    ctx.fillStyle = skin.bodyHighlight;
    ctx.beginPath();
    ctx.arc(-r * 1.2, -r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawHead(x, y, r, skin, gameState, animState) {
    const ctx = this.ctx;
    const dir = gameState.lastDirection || 'D';

    ctx.save();
    ctx.translate(x, y);

    // Subtle head tilt / breathing wiggle
    const bounce = Math.sin(this.wigglePhase * 1.5) * 1.5;
    ctx.translate(0, bounce);

    // Head base drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    ctx.beginPath();
    ctx.arc(0, 4, r, 0, Math.PI * 2);
    ctx.fill();

    // 1. Ears
    const earDist = r * 0.72;
    const earH = r * 0.85;

    // Left Ear
    ctx.fillStyle = skin.body;
    ctx.beginPath();
    ctx.moveTo(-earDist, -r * 0.3);
    ctx.lineTo(-earDist * 1.05, -r * 0.3 - earH);
    ctx.lineTo(-earDist * 0.2, -r * 0.8);
    ctx.closePath();
    ctx.fill();

    // Left Ear Inner Pink
    ctx.fillStyle = skin.earInner;
    ctx.beginPath();
    ctx.moveTo(-earDist * 0.9, -r * 0.35);
    ctx.lineTo(-earDist * 0.95, -r * 0.35 - earH * 0.7);
    ctx.lineTo(-earDist * 0.35, -r * 0.7);
    ctx.closePath();
    ctx.fill();

    // Right Ear
    ctx.fillStyle = skin.body;
    ctx.beginPath();
    ctx.moveTo(earDist, -r * 0.3);
    ctx.lineTo(earDist * 1.05, -r * 0.3 - earH);
    ctx.lineTo(earDist * 0.2, -r * 0.8);
    ctx.closePath();
    ctx.fill();

    // Right Ear Inner Pink
    ctx.fillStyle = skin.earInner;
    ctx.beginPath();
    ctx.moveTo(earDist * 0.9, -r * 0.35);
    ctx.lineTo(earDist * 0.95, -r * 0.35 - earH * 0.7);
    ctx.lineTo(earDist * 0.35, -r * 0.7);
    ctx.closePath();
    ctx.fill();

    // 2. Head circle
    ctx.fillStyle = skin.body;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Head highlight
    ctx.fillStyle = skin.bodyHighlight;
    ctx.beginPath();
    ctx.arc(0, -r * 0.3, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Cheeks / Blush
    ctx.fillStyle = 'rgba(251, 113, 133, 0.45)'; // soft pink
    ctx.beginPath();
    ctx.arc(-r * 0.55, r * 0.18, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.55, r * 0.18, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Eyes & Expression
    const eyeOffset = r * 0.36;
    let lookDx = 0, lookDy = 0;
    if (dir === 'R') lookDx = 2;
    else if (dir === 'L') lookDx = -2;
    else if (dir === 'U') lookDy = -2;
    else if (dir === 'D') lookDy = 1.5;

    if (this.isBlinking) {
      // Blinking closed eye line
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-eyeOffset - 4, -r * 0.05);
      ctx.lineTo(-eyeOffset + 4, -r * 0.05);
      ctx.moveTo(eyeOffset - 4, -r * 0.05);
      ctx.lineTo(eyeOffset + 4, -r * 0.05);
      ctx.stroke();
    } else if (gameState.isWon) {
      // Happy curved eyes ^ ^
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-eyeOffset, -r * 0.02, 5, Math.PI, 0);
      ctx.arc(eyeOffset, -r * 0.02, 5, Math.PI, 0);
      ctx.stroke();
    } else if (gameState.isStuck) {
      // Confused / sweat eyes > <
      ctx.strokeStyle = skin.eyeColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-eyeOffset - 3, -r * 0.08);
      ctx.lineTo(-eyeOffset + 3, -r * 0.02);
      ctx.lineTo(-eyeOffset - 3, r * 0.04);

      ctx.moveTo(eyeOffset + 3, -r * 0.08);
      ctx.lineTo(eyeOffset - 3, -r * 0.02);
      ctx.lineTo(eyeOffset + 3, r * 0.04);
      ctx.stroke();

      // Sweat droplet
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(r * 0.78, -r * 0.5, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal cute round eyes with bright pupils
      ctx.fillStyle = skin.eyeColor;
      ctx.beginPath();
      ctx.arc(-eyeOffset + lookDx, -r * 0.05 + lookDy, r * 0.2, 0, Math.PI * 2);
      ctx.arc(eyeOffset + lookDx, -r * 0.05 + lookDy, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // White sparkle catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-eyeOffset + lookDx - 1.5, -r * 0.05 + lookDy - 1.5, r * 0.08, 0, Math.PI * 2);
      ctx.arc(eyeOffset + lookDx - 1.5, -r * 0.05 + lookDy - 1.5, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Pink Nose
    ctx.fillStyle = skin.noseColor;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.12);
    ctx.lineTo(-3, r * 0.22);
    ctx.lineTo(3, r * 0.22);
    ctx.closePath();
    ctx.fill();

    // 6. Whiskers
    ctx.strokeStyle = skin.bodyDark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Left whiskers
    ctx.moveTo(-r * 0.35, r * 0.18);
    ctx.lineTo(-r * 0.95, r * 0.12);
    ctx.moveTo(-r * 0.35, r * 0.24);
    ctx.lineTo(-r * 0.95, r * 0.30);
    // Right whiskers
    ctx.moveTo(r * 0.35, r * 0.18);
    ctx.lineTo(r * 0.95, r * 0.12);
    ctx.moveTo(r * 0.35, r * 0.24);
    ctx.lineTo(r * 0.95, r * 0.30);
    ctx.stroke();

    // 7. Small cute mouth
    ctx.strokeStyle = skin.bodyDark;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(-2.5, r * 0.30, 2.5, 0, Math.PI);
    ctx.arc(2.5, r * 0.30, 2.5, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  drawHintArrow(ox, oy, cellSize, gameState) {
    const ctx = this.ctx;
    const head = gameState.head;
    if (!head) return;

    const cx = ox + head[0] * cellSize + cellSize / 2;
    const cy = oy + head[1] * cellSize + cellSize / 2;

    let dx = 0, dy = 0;
    if (this.hintDirection === 'U') dy = -1;
    else if (this.hintDirection === 'D') dy = 1;
    else if (this.hintDirection === 'L') dx = -1;
    else if (this.hintDirection === 'R') dx = 1;

    const scale = 1 + Math.sin(this.hintPulse) * 0.18;
    const arrowX = cx + dx * cellSize * 0.85;
    const arrowY = cy + dy * cellSize * 0.85;

    ctx.save();
    ctx.translate(arrowX, arrowY);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;

    const angle = Math.atan2(dy, dx);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-6, -8);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, 8);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  drawParticles() {
    const ctx = this.ctx;

    // Confetti particles
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.rotation += p.rotSpeed;
      p.life -= 0.015;

      if (p.life <= 0) {
        this.confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
  }
}

if (typeof window !== 'undefined') {
  window.GameRenderer = GameRenderer;
}
