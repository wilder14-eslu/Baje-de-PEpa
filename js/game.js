/**
 * Longcat - Main Game Engine
 * Orchestrates game rules, state transitions, animations, inputs, and UI modals.
 */

class LongcatGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new GameRenderer(this.canvas);
    this.levels = window.LEVELS || [];
    this.currentLevelIndex = parseInt(localStorage.getItem('longcat_current_level') || '0', 10);
    if (this.currentLevelIndex < 0 || this.currentLevelIndex >= this.levels.length) {
      this.currentLevelIndex = 0;
    }

    this.unlockedLevel = parseInt(localStorage.getItem('longcat_unlocked_level') || '1', 10);
    this.levelStars = JSON.parse(localStorage.getItem('longcat_stars') || '{}');

    // Game State
    this.currentLevel = null;
    this.head = [0, 0];
    this.segments = [];
    this.occupiedSet = new Set();
    this.lastDirection = 'D';
    this.moveCount = 0;
    this.history = [];
    this.isWon = false;
    this.isStuck = false;
    this.isSliding = false;

    // Slide animation state
    this.animState = {
      isAnimating: false,
      startX: 0,
      startY: 0,
      headX: 0,
      headY: 0,
      targetX: 0,
      targetY: 0,
      progress: 1
    };

    this.solver = null;
    this.setupEventListeners();
    this.setupModals();
    this.loadLevel(this.currentLevelIndex);
    this.startLoop();
  }

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) index = 0;
    this.currentLevelIndex = index;
    localStorage.setItem('longcat_current_level', index);

    this.currentLevel = this.levels[index];
    this.head = [...this.currentLevel.start];
    this.segments = [[...this.head]];
    this.occupiedSet = new Set([`${this.head[0]},${this.head[1]}`]);
    this.lastDirection = 'D';
    this.moveCount = 0;
    this.history = [];
    this.isWon = false;
    this.isStuck = false;
    this.isSliding = false;

    this.animState.isAnimating = false;
    this.animState.headX = this.head[0];
    this.animState.headY = this.head[1];

    this.renderer.clearHint();
    this.solver = new LongcatSolver(
      this.currentLevel.w,
      this.currentLevel.h,
      this.currentLevel.walls,
      this.currentLevel.start
    );

    this.updateUI();
    this.renderer.resize();
  }

  restartLevel() {
    this.loadLevel(this.currentLevelIndex);
    window.Audio.playUndo();
  }

  nextLevel() {
    if (this.currentLevelIndex + 1 < this.levels.length) {
      this.loadLevel(this.currentLevelIndex + 1);
    } else {
      this.loadLevel(0); // Loop back or show congratulations
    }
  }

  undo() {
    if (this.isSliding || this.history.length === 0 || this.isWon) return;

    const prevState = this.history.pop();
    this.head = [...prevState.head];
    this.segments = prevState.segments.map(s => [...s]);
    this.occupiedSet = new Set(prevState.occupied);
    this.moveCount = prevState.moveCount;
    this.lastDirection = prevState.lastDirection;
    this.isStuck = false;

    this.animState.isAnimating = false;
    this.animState.headX = this.head[0];
    this.animState.headY = this.head[1];

    this.renderer.clearHint();
    window.Audio.playUndo();
    this.updateUI();
  }

  giveHint() {
    if (this.isWon || this.isSliding) return;
    if (!this.solver) return;

    const solution = this.solver.solveFromCurrent(this.head, this.segments);
    if (solution && solution.length > 0) {
      const nextDir = solution[0];
      this.renderer.setHint(nextDir);
      window.Audio.playPurr();
    } else {
      window.Audio.playStuck();
    }
  }

  tryMove(dir) {
    if (this.isWon || this.isSliding) return;

    window.Audio.init();
    this.renderer.clearHint();

    const dirMap = {
      'U': { dx: 0, dy: -1 },
      'D': { dx: 0, dy: 1 },
      'L': { dx: -1, dy: 0 },
      'R': { dx: 1, dy: 0 }
    };

    const d = dirMap[dir];
    if (!d) return;

    const [hx, hy] = this.head;
    const nx = hx + d.dx;
    const ny = hy + d.dy;

    // Check if immediately blocked
    if (!this.isValidCell(nx, ny, this.occupiedSet)) {
      window.Audio.playBump();
      return;
    }

    // Save history snapshot before move
    this.history.push({
      head: [...this.head],
      segments: this.segments.map(s => [...s]),
      occupied: Array.from(this.occupiedSet),
      moveCount: this.moveCount,
      lastDirection: this.lastDirection
    });

    this.moveCount++;
    this.lastDirection = dir;

    // Collect all cells in this continuous slide
    let curX = hx;
    let curY = hy;
    const newCells = [];
    const tempOcc = new Set(this.occupiedSet);

    while (this.isValidCell(curX + d.dx, curY + d.dy, tempOcc)) {
      curX += d.dx;
      curY += d.dy;
      newCells.push([curX, curY]);
      tempOcc.add(`${curX},${curY}`);
    }

    // Trigger animated slide
    this.animateSlide(newCells, d);
  }

  isValidCell(x, y, occSet) {
    if (x < 0 || x >= this.currentLevel.w || y < 0 || y >= this.currentLevel.h) return false;
    const key = `${x},${y}`;
    const wallsSet = new Set(this.currentLevel.walls.map(([wx, wy]) => `${wx},${wy}`));
    if (wallsSet.has(key)) return false;
    if (occSet.has(key)) return false;
    return true;
  }

  animateSlide(newCells, dir) {
    this.isSliding = true;
    const totalSteps = newCells.length;
    let stepIndex = 0;

    const startX = this.head[0];
    const startY = this.head[1];
    const targetX = newCells[newCells.length - 1][0];
    const targetY = newCells[newCells.length - 1][1];

    const startTime = performance.now();
    // Fast, crisp animation: ~45ms per tile traversed, min 110ms, max 320ms
    const duration = Math.min(Math.max(totalSteps * 45, 110), 320);

    const stepInterval = duration / totalSteps;
    let lastAudioStep = -1;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease-out quad interpolation
      const ease = t * (2 - t);

      this.animState.isAnimating = true;
      this.animState.headX = startX + (targetX - startX) * ease;
      this.animState.headY = startY + (targetY - startY) * ease;

      // Check which cell we are currently passing
      const currentCellIndex = Math.min(Math.floor(elapsed / stepInterval), totalSteps - 1);
      if (currentCellIndex > lastAudioStep && currentCellIndex < totalSteps) {
        lastAudioStep = currentCellIndex;
        const cell = newCells[currentCellIndex];
        this.segments.push([...cell]);
        this.occupiedSet.add(`${cell[0]},${cell[1]}`);
        window.Audio.playStep(this.occupiedSet.size);
        this.updateUI();
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Complete the slide
        this.animState.isAnimating = false;
        this.head = [targetX, targetY];

        // Ensure all cells are added to segments & occupiedSet
        for (const cell of newCells) {
          const key = `${cell[0]},${cell[1]}`;
          if (!this.occupiedSet.has(key)) {
            this.segments.push([...cell]);
            this.occupiedSet.add(key);
          }
        }

        window.Audio.playBump();
        this.isSliding = false;
        this.checkGameStatus();
        this.updateUI();
      }
    };

    requestAnimationFrame(animate);
  }

  checkGameStatus() {
    const totalWalkable = this.currentLevel.walkable;

    // 1. Win Check
    if (this.occupiedSet.size === totalWalkable) {
      this.isWon = true;
      this.isStuck = false;

      // Calculate stars (3 stars if moves <= optimal moves, 2 stars if <= optimal + 3, else 1 star)
      const optimal = this.currentLevel.moves || 5;
      let stars = 1;
      if (this.moveCount <= optimal) stars = 3;
      else if (this.moveCount <= optimal + 3) stars = 2;

      const lvlId = this.currentLevel.id;
      const prevStars = this.levelStars[lvlId] || 0;
      if (stars > prevStars) {
        this.levelStars[lvlId] = stars;
        localStorage.setItem('longcat_stars', JSON.stringify(this.levelStars));
      }

      // Unlock next level
      if (this.currentLevelIndex + 2 > this.unlockedLevel) {
        this.unlockedLevel = Math.min(this.currentLevelIndex + 2, this.levels.length);
        localStorage.setItem('longcat_unlocked_level', this.unlockedLevel);
      }

      window.Audio.playVictory();
      this.renderer.addConfetti();

      // Show victory modal after short delay
      setTimeout(() => {
        this.showVictoryModal(stars);
      }, 650);
      return;
    }

    // 2. Stuck Check (no valid moves in any of 4 cardinal directions)
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    let hasMove = false;
    for (const d of dirs) {
      if (this.isValidCell(this.head[0] + d.dx, this.head[1] + d.dy, this.occupiedSet)) {
        hasMove = true;
        break;
      }
    }

    if (!hasMove) {
      this.isStuck = true;
      window.Audio.playStuck();
    }
  }

  updateUI() {
    const level = this.currentLevel;
    if (!level) return;

    // Header updates
    document.getElementById('levelTitle').textContent = `Nivel ${level.id}`;
    document.getElementById('worldBadge').textContent = level.worldName || `Mundo ${level.world}`;
    document.getElementById('moveCounter').textContent = `${this.moveCount}`;

    // Progress bar
    const filled = this.occupiedSet.size;
    const total = level.walkable;
    const pct = Math.round((filled / total) * 100);
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
      progressBar.setAttribute('aria-valuenow', pct);
    }
    const progressLabel = document.getElementById('progressLabel');
    if (progressLabel) {
      progressLabel.textContent = `${filled} / ${total} (${pct}%)`;
    }

    // Undo button state
    const undoBtn = document.getElementById('btnUndo');
    if (undoBtn) {
      undoBtn.disabled = this.history.length === 0 || this.isWon || this.isSliding;
    }

    // Stuck indicator
    const stuckNotice = document.getElementById('stuckNotice');
    if (stuckNotice) {
      stuckNotice.classList.toggle('visible', this.isStuck);
    }
  }

  showVictoryModal(stars) {
    const modal = document.getElementById('victoryModal');
    if (!modal) return;

    const starsContainer = document.getElementById('victoryStars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const star = document.createElement('span');
        star.className = `star-icon ${i <= stars ? 'active' : ''}`;
        star.textContent = '★';
        starsContainer.appendChild(star);
      }
    }

    document.getElementById('victoryMoves').textContent = `${this.moveCount}`;
    document.getElementById('victoryOptimal').textContent = `${this.currentLevel.moves || '-'}`;

    modal.showModal();
  }

  setupEventListeners() {
    // 1. Keyboard Controls
    window.addEventListener('keydown', (e) => {
      // Don't intercept if typing in modal input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          this.tryMove('U');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          this.tryMove('D');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          this.tryMove('L');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          this.tryMove('R');
          break;
        case 'z':
        case 'Z':
        case 'u':
        case 'U':
          e.preventDefault();
          this.undo();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.restartLevel();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          this.giveHint();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.toggleSound();
          break;
      }
    });

    // 2. Touch & Swipe Controls on Canvas
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDist = 24;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 0) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) > minSwipeDist) {
        if (absX > absY) {
          this.tryMove(dx > 0 ? 'R' : 'L');
        } else {
          this.tryMove(dy > 0 ? 'D' : 'U');
        }
      }
    }, { passive: true });

    // 3. Mouse Drag Swipe on Canvas
    let mouseStartX = 0;
    let mouseStartY = 0;
    let isMouseDown = false;

    this.canvas.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) > minSwipeDist) {
        if (absX > absY) {
          this.tryMove(dx > 0 ? 'R' : 'L');
        } else {
          this.tryMove(dy > 0 ? 'D' : 'U');
        }
      } else {
        // Handle direct tap/click on adjacent tile
        this.handleCanvasClick(e);
      }
    });

    // 4. On-screen action buttons
    document.getElementById('btnUndo')?.addEventListener('click', () => this.undo());
    document.getElementById('btnRestart')?.addEventListener('click', () => this.restartLevel());
    document.getElementById('btnHint')?.addEventListener('click', () => this.giveHint());

    // 5. Virtual D-Pad buttons
    document.getElementById('dpadUp')?.addEventListener('click', () => this.tryMove('U'));
    document.getElementById('dpadDown')?.addEventListener('click', () => this.tryMove('D'));
    document.getElementById('dpadLeft')?.addEventListener('click', () => this.tryMove('L'));
    document.getElementById('dpadRight')?.addEventListener('click', () => this.tryMove('R'));

    // 6. Sound Toggle Button
    const soundBtn = document.getElementById('btnSound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
      this.updateSoundButton();
    }

    // 7. Window resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });
  }

  handleCanvasClick(e) {
    if (this.isWon || this.isSliding) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const size = this.renderer.cssSize || 500;
    const level = this.currentLevel;
    const padding = 28;
    const boardArea = size - padding * 2;
    const cellSize = Math.min(boardArea / level.w, boardArea / level.h, 72);
    const boardW = level.w * cellSize;
    const boardH = level.h * cellSize;
    const ox = (size - boardW) / 2;
    const oy = (size - boardH) / 2;

    const gx = Math.floor((clickX - ox) / cellSize);
    const gy = Math.floor((clickY - oy) / cellSize);

    // If clicked on an adjacent cell to head, move towards it!
    const [hx, hy] = this.head;
    if (gx === hx && gy === hy - 1) this.tryMove('U');
    else if (gx === hx && gy === hy + 1) this.tryMove('D');
    else if (gx === hx - 1 && gy === hy) this.tryMove('L');
    else if (gx === hx + 1 && gy === hy) this.tryMove('R');
  }

  toggleSound() {
    const isMuted = window.Audio.toggleMute();
    this.updateSoundButton();
  }

  updateSoundButton() {
    const soundBtn = document.getElementById('btnSound');
    if (!soundBtn) return;
    const isMuted = window.Audio.isMuted();
    soundBtn.textContent = isMuted ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-label', isMuted ? 'Activar Sonido' : 'Silenciar');
  }

  setupModals() {
    // Implementing modern-web-guidance for <dialog closedby="any">
    const modals = document.querySelectorAll('dialog');

    modals.forEach((dialog) => {
      // Light-dismiss fallback for browsers without native closedby support
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (event) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isDialogContent) return;
          dialog.close();
        });
      }
    });

    // Level Select Modal setup
    const btnLevelSelect = document.getElementById('btnLevelSelect');
    const levelSelectModal = document.getElementById('levelSelectModal');
    if (btnLevelSelect && levelSelectModal) {
      btnLevelSelect.addEventListener('click', () => {
        this.populateLevelSelect();
        levelSelectModal.showModal();
      });
    }

    // Victory Modal button
    document.getElementById('btnVictoryNext')?.addEventListener('click', () => {
      document.getElementById('victoryModal')?.close();
      this.nextLevel();
    });

    // Settings Modal
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    if (btnSettings && settingsModal) {
      btnSettings.addEventListener('click', () => {
        this.populateSkinSelector();
        settingsModal.showModal();
      });
    }

    // Help Modal
    const btnHelp = document.getElementById('btnHelp');
    const helpModal = document.getElementById('helpModal');
    if (btnHelp && helpModal) {
      btnHelp.addEventListener('click', () => {
        helpModal.showModal();
      });
    }

    // Editor Modal
    const btnEditor = document.getElementById('btnEditor');
    const editorModal = document.getElementById('editorModal');
    if (btnEditor && editorModal) {
      btnEditor.addEventListener('click', () => {
        this.setupEditorUI();
        editorModal.showModal();
      });
    }
  }

  populateLevelSelect() {
    const container = document.getElementById('levelGrid');
    if (!container) return;
    container.innerHTML = '';

    const worlds = [
      { id: 1, name: 'Mundo 1: El Jardín Soleado' },
      { id: 2, name: 'Mundo 2: La Sala Acogedora' },
      { id: 3, name: 'Mundo 3: Los Tejados al Atardecer' },
      { id: 4, name: 'Mundo 4: El Templo Antiguo' },
      { id: 5, name: 'Mundo 5: El Espacio Estelar' },
      { id: 6, name: 'Mundo 6: La Galaxia Enredada' },
      { id: 7, name: 'Mundo 7: El Laberinto Infinito' },
    ];

    worlds.forEach(w => {
      const header = document.createElement('h3');
      header.className = 'world-section-title';
      header.textContent = w.name;
      container.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'levels-world-grid';

      const worldLevels = this.levels.filter(l => l.world === w.id);
      worldLevels.forEach(lvl => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'level-card';

        const isCurrent = (lvl.id - 1) === this.currentLevelIndex;
        const isUnlocked = lvl.id <= this.unlockedLevel;
        const stars = this.levelStars[lvl.id] || 0;

        if (isCurrent) btn.classList.add('current');
        if (!isUnlocked) {
          btn.classList.add('locked');
          btn.disabled = true;
        }

        btn.innerHTML = `
          <div class="lvl-num">${lvl.id}</div>
          <div class="lvl-stars">${isUnlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒'}</div>
        `;

        if (isUnlocked) {
          btn.addEventListener('click', () => {
            this.loadLevel(lvl.id - 1);
            document.getElementById('levelSelectModal')?.close();
          });
        }

        grid.appendChild(btn);
      });

      container.appendChild(grid);
    });
  }

  populateSkinSelector() {
    const container = document.getElementById('skinSelectorList');
    if (!container) return;
    container.innerHTML = '';

    const currentSkin = this.renderer.skin;
    const skins = this.renderer.skins;

    Object.keys(skins).forEach(skinId => {
      const skin = skins[skinId];
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `skin-card ${skinId === currentSkin ? 'active' : ''}`;
      card.innerHTML = `
        <div class="skin-preview" style="background: ${skin.body}; border-color: ${skin.bodyDark};">
          <div class="skin-ear" style="background: ${skin.earInner}"></div>
          <div class="skin-eye" style="background: ${skin.eyeColor}"></div>
        </div>
        <div class="skin-name">${skin.name}</div>
      `;

      card.addEventListener('click', () => {
        this.renderer.setSkin(skinId);
        window.Audio.playMeow();
        this.populateSkinSelector();
      });

      container.appendChild(card);
    });
  }

  setupEditorUI() {
    // Custom Level Creator
    const editorCanvas = document.getElementById('editorCanvas');
    if (!editorCanvas) return;

    let eW = 5, eH = 5;
    let eWalls = new Set();
    let eStart = [0, 0];
    let mode = 'wall'; // 'wall' or 'start'

    const size = 300;
    editorCanvas.width = size;
    editorCanvas.height = size;
    const eCtx = editorCanvas.getContext('2d');

    const drawEditor = () => {
      eCtx.clearRect(0, 0, size, size);
      const cSize = Math.min((size - 20) / eW, (size - 20) / eH);
      const ox = (size - eW * cSize) / 2;
      const oy = (size - eH * cSize) / 2;

      for (let y = 0; y < eH; y++) {
        for (let x = 0; x < eW; x++) {
          const tx = ox + x * cSize;
          const ty = oy + y * cSize;
          const key = `${x},${y}`;

          if (eWalls.has(key)) {
            eCtx.fillStyle = '#64748b';
          } else if (x === eStart[0] && y === eStart[1]) {
            eCtx.fillStyle = '#f59e0b';
          } else {
            eCtx.fillStyle = '#ffffff';
          }

          eCtx.strokeStyle = '#cbd5e1';
          eCtx.lineWidth = 1;
          eCtx.fillRect(tx, ty, cSize, cSize);
          eCtx.strokeRect(tx, ty, cSize, cSize);

          if (x === eStart[0] && y === eStart[1]) {
            eCtx.fillStyle = '#ffffff';
            eCtx.beginPath();
            eCtx.arc(tx + cSize / 2, ty + cSize / 2, cSize * 0.25, 0, Math.PI * 2);
            eCtx.fill();
          }
        }
      }
    };

    drawEditor();

    editorCanvas.onclick = (e) => {
      const rect = editorCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const cSize = Math.min((size - 20) / eW, (size - 20) / eH);
      const ox = (size - eW * cSize) / 2;
      const oy = (size - eH * cSize) / 2;

      const gx = Math.floor((clickX - ox) / cSize);
      const gy = Math.floor((clickY - oy) / cSize);

      if (gx >= 0 && gx < eW && gy >= 0 && gy < eH) {
        const key = `${gx},${gy}`;
        if (mode === 'wall') {
          if (gx === eStart[0] && gy === eStart[1]) return;
          if (eWalls.has(key)) eWalls.delete(key);
          else eWalls.add(key);
        } else if (mode === 'start') {
          if (eWalls.has(key)) eWalls.delete(key);
          eStart = [gx, gy];
        }
        drawEditor();
      }
    };

    document.getElementById('editorModeWall')?.addEventListener('click', () => { mode = 'wall'; });
    document.getElementById('editorModeStart')?.addEventListener('click', () => { mode = 'start'; });

    document.getElementById('editorTestBtn')?.addEventListener('click', () => {
      const wallsList = Array.from(eWalls).map(k => k.split(',').map(Number));
      const testSolver = new LongcatSolver(eW, eH, wallsList, eStart);
      const sol = testSolver.solve();

      const resultBox = document.getElementById('editorResult');
      if (resultBox) resultBox.style.display = 'block';
      if (sol) {
        resultBox.textContent = `¡Nivel Válido! Solución en ${sol.length} movimientos: ${sol.join(' → ')}`;
        resultBox.className = 'editor-result success';

        const customLvl = {
          id: 999,
          name: 'Nivel Personalizado',
          world: 0,
          worldName: 'Creador de Niveles',
          w: eW,
          h: eH,
          walls: wallsList,
          start: eStart,
          solution: sol,
          moves: sol.length,
          walkable: (eW * eH) - wallsList.length
        };

        // Add play button
        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'btn-primary';
        playBtn.style.marginTop = '10px';
        playBtn.textContent = '▶ Jugar Este Nivel';
        playBtn.onclick = () => {
          this.levels.push(customLvl);
          this.loadLevel(this.levels.length - 1);
          document.getElementById('editorModal')?.close();
        };
        resultBox.appendChild(document.createElement('br'));
        resultBox.appendChild(playBtn);
      } else {
        resultBox.textContent = 'Nivel imposible de resolver. Asegúrate de que todas las casillas sean alcanzables.';
        resultBox.className = 'editor-result error';
      }
    });
  }

  startLoop() {
    const loop = () => {
      this.renderer.render(this, this.animState);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.Game = new LongcatGame();
});
