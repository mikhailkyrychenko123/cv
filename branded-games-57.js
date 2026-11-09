(() => {
  const modal = document.querySelector('[data-tank-modal]');
  const openButton = document.querySelector('[data-tank-game-open]');
  if (!modal || !openButton) return;

  const dialog = modal.querySelector('.tg-dialog');
  const closeButtons = [...modal.querySelectorAll('[data-tank-close]')];
  const canvas = modal.querySelector('[data-tank-canvas]');
  const ctx = canvas?.getContext('2d');
  const status = modal.querySelector('[data-tank-status]');
  const enemyCount = modal.querySelector('[data-tank-enemies]');
  const baseHealth = modal.querySelector('[data-tank-fortress]');
  const roundLabel = modal.querySelector('[data-tank-round]');
  const result = modal.querySelector('[data-tank-result]');
  const resultLabel = modal.querySelector('[data-tank-result-label]');
  const resultTitle = modal.querySelector('[data-tank-result-title]');
  const resultCopy = modal.querySelector('[data-tank-result-copy]');
  const copyStatus = modal.querySelector('[data-tank-copy-status]');
  const W = 400;
  const H = 400;
  const TILE = 36;
  const ART_TILE = 40;
  const SCALE = TILE / ART_TILE;
  const COLS = 10;
  const ROWS = 10;
  const BOARD_X = 20;
  const BOARD_Y = 20;
  const BOARD_W = TILE * COLS;
  const BOARD_H = TILE * ROWS;
  const targetBase = { x: BOARD_X + 5 * TILE, y: BOARD_Y + 9.5 * TILE };
  const enemyStarts = [0, 2, 4, 6, 7].map(col => ({ x: BOARD_X + (col + .5) * TILE, y: BOARD_Y + .5 * TILE }));
  const spawnTimes = [0, 1100, 2200, 3300, 4400];
  const arena = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  function placeBlocks(col, row, width, height, type) {
    for (let y = row; y < row + height; y += 1) for (let x = col; x < col + width; x += 1) arena[y][x] = { type, hp: type === 'brick' ? 2 : Infinity };
  }
  [
    [1,1,2,1,'brick'], [8,0,2,2,'brand-square'],
    [0,3,1,2,'brick'], [3,3,1,2,'steel'], [6,3,1,2,'steel'], [9,3,1,2,'brick'],
    [2,3,1,2,'water'], [7,3,1,2,'water'],
    [1,5,2,1,'brick'], [7,5,2,1,'brick'],
    [0,6,2,1,'brick'], [2,6,2,1,'brick'], [8,6,2,1,'brick'], [3,7,1,2,'steel'], [6,7,1,2,'steel'],
    [1,8,2,1,'water'], [7,8,2,1,'water'], [0,9,4,1,'brand-wide'], [8,9,2,1,'brick'],
    [0,5,1,1,'forest'], [9,5,1,1,'forest'], [2,7,1,1,'forest'], [7,7,1,1,'forest']
  ].forEach(block => placeBlocks(...block));
  const directions = [
    { x: 0, y: -1, angle: 0 }, { x: 1, y: 0, angle: Math.PI / 2 },
    { x: 0, y: 1, angle: Math.PI }, { x: -1, y: 0, angle: -Math.PI / 2 }
  ];
  const keys = new Set();
  const heldDirections = new Set();
  const input = { firing: false, pointerAim: false, aimX: W / 2, aimY: 60 };
  let lastMoveAxis = 'horizontal';
  let state;
  let frame = 0;
  let lastTime = 0;
  let returnFocus = null;
  let dpr = 1;

  function makeState() {
    return {
      live: true,
      elapsed: 0,
      roundElapsed: 0,
      intermission: 0,
      round: 1,
      spawned: 0,
      kills: 0,
      breaches: 0,
      fortress: 5,
      player: { x: BOARD_X + 5 * TILE, y: BOARD_Y + 7.5 * TILE, angle: 0, nextShot: 0 },
      enemies: [],
      shots: [],
      sparks: [],
      lastStatus: ''
    };
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function announce(message) {
    if (status && status.textContent !== message) status.textContent = message;
  }

  function openGame() {
    returnFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tg-game-open');
    resetGame();
    modal.querySelector('.tg-close')?.focus({ preventScroll: true });
  }

  function closeGame() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tg-game-open');
    state.live = false;
    cancelAnimationFrame(frame);
    frame = 0;
    keys.clear();
    heldDirections.clear();
    input.firing = false;
    closeButtons.forEach(button => button.classList.remove('is-held'));
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function resetGame() {
    cancelAnimationFrame(frame);
    state = makeState();
    input.firing = false;
    input.pointerAim = false;
    lastMoveAxis = 'horizontal';
    keys.clear();
    heldDirections.clear();
    result.hidden = true;
    result.setAttribute('aria-hidden', 'true');
    if (copyStatus) copyStatus.textContent = '';
    if (enemyCount) enemyCount.textContent = '0 / 5';
    if (baseHealth) baseHealth.textContent = '5 / 5';
    if (roundLabel) roundLabel.textContent = '1 / 3';
    arena.forEach(row => row.forEach(tile => { if (tile?.type === 'brick') tile.hp = 2; }));
    announce('FIELD LIVE · DEFEND THE NORTHSTAR DEPOT');
    lastTime = performance.now();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function setFacing(dx, dy) {
    if (!dx && !dy) return;
    if (Math.abs(dx) > Math.abs(dy)) state.player.angle = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
    else state.player.angle = dy > 0 ? Math.PI : 0;
  }

  function aimAtPointer(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / W, rect.height / H);
    const drawnWidth = W * scale;
    const drawnHeight = H * scale;
    const offsetX = (rect.width - drawnWidth) / 2;
    const offsetY = (rect.height - drawnHeight) / 2;
    input.aimX = (event.clientX - rect.left - offsetX) / scale;
    input.aimY = (event.clientY - rect.top - offsetY) / scale;
    input.pointerAim = true;
    setFacing(input.aimX - state.player.x, input.aimY - state.player.y);
  }

  function addShot(owner, x, y, angle, speed) {
    const muzzle = (owner === 'player' ? 25 : 23) * SCALE;
    state.shots.push({
      owner,
      x: x + Math.sin(angle) * muzzle,
      y: y - Math.cos(angle) * muzzle,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      life: 1.9
    });
  }

  function firePlayer(now) {
    const player = state.player;
    if (now < player.nextShot) return;
    addShot('player', player.x, player.y, player.angle, 590 * SCALE);
    player.nextShot = now + 330;
  }

  function spawnEnemy(index, now) {
    const start = enemyStarts[index];
    state.enemies.push({
      id: index,
      x: start.x,
      y: start.y,
      hp: 1,
      direction: 2,
      turnIn: .16 + Math.random() * .25,
      speed: (176 + index * 12) * .56 * .7 * .9 * SCALE,
      nextShot: now + 2200 + index * 220,
      shotGap: 2550 + index * 120,
      stuckFor: 0
    });
    state.spawned += 1;
  }

  function hitsObstacle(x, y, radius = 11 * SCALE, shot = false) {
    if (x - radius < BOARD_X || x + radius > BOARD_X + BOARD_W || y - radius < BOARD_Y || y + radius > BOARD_Y + BOARD_H) return true;
    const left = Math.max(0, Math.floor((x - radius - BOARD_X) / TILE));
    const right = Math.min(COLS - 1, Math.floor((x + radius - BOARD_X) / TILE));
    const top = Math.max(0, Math.floor((y - radius - BOARD_Y) / TILE));
    const bottom = Math.min(ROWS - 1, Math.floor((y + radius - BOARD_Y) / TILE));
    for (let row = top; row <= bottom; row += 1) for (let col = left; col <= right; col += 1) {
      const tile = arena[row][col];
      if (!tile || tile.type === 'forest' || (shot && tile.type === 'water') || (shot && !['brick', 'steel', 'product', 'brand-wide', 'brand-square'].includes(tile.type))) continue;
      const rx = BOARD_X + col * TILE;
      const ry = BOARD_Y + row * TILE;
      const nearestX = Math.max(rx, Math.min(x, rx + TILE));
      const nearestY = Math.max(ry, Math.min(y, ry + TILE));
      if (Math.hypot(x - nearestX, y - nearestY) < radius + .4 * SCALE) return { col, row, tile };
    }
    return false;
  }

  function moveTank(tank, dx, dy, distance, radius = 11 * SCALE) {
    const startX = tank.x;
    const startY = tank.y;
    const nextX = tank.x + dx * distance;
    if (!hitsObstacle(nextX, tank.y, radius)) tank.x = nextX;
    const nextY = tank.y + dy * distance;
    if (!hitsObstacle(tank.x, nextY, radius)) tank.y = nextY;
    return Math.hypot(tank.x - startX, tank.y - startY);
  }

  function chooseEnemyDirection(enemy) {
    const options = directions.map((direction, index) => {
      const blocked = hitsObstacle(enemy.x + direction.x * TILE * .78, enemy.y + direction.y * TILE * .78, 9 * SCALE);
      const distance = Math.hypot(targetBase.x - (enemy.x + direction.x * TILE), targetBase.y - (enemy.y + direction.y * TILE));
      const reversal = index === (enemy.direction + 2) % 4 ? TILE * .55 : 0;
      return { index, score: distance + reversal + Math.random() * TILE * .25, blocked };
    }).filter(option => !option.blocked).sort((a, b) => a.score - b.score);
    if (options.length) {
      const wander = options.length > 1 && Math.random() < .05;
      enemy.direction = options[wander ? 1 + Math.floor(Math.random() * (options.length - 1)) : 0].index;
    } else {
      enemy.direction = (enemy.direction + 1 + Math.floor(Math.random() * 3)) % 4;
    }
    enemy.turnIn = .42 + Math.random() * .28;
  }

  function finish(won) {
    if (!state.live) return;
    state.live = false;
    cancelAnimationFrame(frame);
    announce(won ? 'VICTORY · NORTHSTAR DEPOT SAFE' : 'MISSION ENDED · NORTHSTAR DEPOT NEEDS REINFORCEMENT');
    if (resultLabel) resultLabel.textContent = won ? 'MISSION CLEARED · REWARD' : 'MISSION OVER · REWARD';
    if (resultTitle) resultTitle.textContent = won ? 'Northstar depot is secure.' : 'The rival tanks broke through.';
    if (resultCopy) resultCopy.textContent = won
      ? 'Three waves cleared. Your shared Northstar coupon is ready.'
      : 'Every run earns the same Northstar coupon. Copy it, regroup and defend the depot again.';
    const coupon = modal.querySelector('[data-tank-coupon]');
    if (coupon) {
      coupon.textContent = 'LEMMING10';
      coupon.closest('.tg-coupon').hidden = false;
    }
    if (copyStatus) copyStatus.textContent = 'Tap the copy icon to save your code.';
    const retry = modal.querySelector('[data-tank-retry]');
    if (retry) retry.textContent = won ? 'Play again' : 'Try again';
    result.hidden = false;
    result.setAttribute('aria-hidden', 'false');
    draw();
    modal.querySelector('[data-tank-retry]')?.focus({ preventScroll: true });
  }

  function advanceRound() {
    if (state.round >= 3) { finish(true); return; }
    state.round += 1;
    state.roundElapsed = 0;
    state.intermission = 1100;
    state.spawned = 0;
    state.kills = 0;
    state.breaches = 0;
    state.fortress = 5;
    state.enemies = [];
    state.shots = [];
    state.sparks = [];
    state.player.x = BOARD_X + 5 * TILE;
    state.player.y = BOARD_Y + 7.5 * TILE;
    state.player.angle = 0;
    state.player.nextShot = 0;
    arena.forEach(row => row.forEach(tile => { if (tile?.type === 'brick') tile.hp = 2; }));
    if (roundLabel) roundLabel.textContent = `${state.round} / 3`;
    if (enemyCount) enemyCount.textContent = '0 / 5';
    if (baseHealth) baseHealth.textContent = '5 / 5';
    announce(`WAVE ${state.round} / 3 · NORTHSTAR DEPOT REINFORCED`);
  }

  function update(dt, now) {
    if (!state.live) return;
    state.elapsed += dt * 1000;
    if (state.intermission > 0) {
      state.intermission = Math.max(0, state.intermission - dt * 1000);
      return;
    }
    state.roundElapsed += dt * 1000;
    while (state.spawned < spawnTimes.length && state.roundElapsed >= spawnTimes[state.spawned]) {
      spawnEnemy(state.spawned, now);
    }

    const player = state.player;
    let dx = 0;
    let dy = 0;
    if (keys.has('arrowleft') || keys.has('a') || heldDirections.has('left')) dx -= 1;
    if (keys.has('arrowright') || keys.has('d') || heldDirections.has('right')) dx += 1;
    if (keys.has('arrowup') || keys.has('w') || heldDirections.has('up')) dy -= 1;
    if (keys.has('arrowdown') || keys.has('s') || heldDirections.has('down')) dy += 1;
    if (dx || dy) {
      if (dx && dy) {
        if (lastMoveAxis === 'horizontal') dy = 0;
        else dx = 0;
      }
      const magnitude = Math.hypot(dx, dy) || 1;
      dx /= magnitude;
      dy /= magnitude;
      input.pointerAim = false;
      moveTank(player, dx, dy, 230 * SCALE * dt, 11 * SCALE);
      if (!input.pointerAim) setFacing(dx, dy);
    }
    if (input.firing || keys.has(' ')) firePlayer(now);

    state.enemies.forEach(enemy => {
      enemy.turnIn -= dt;
      if (enemy.turnIn <= 0 || hitsObstacle(enemy.x + directions[enemy.direction].x * TILE * .72, enemy.y + directions[enemy.direction].y * TILE * .72, 9 * SCALE)) chooseEnemyDirection(enemy);
      const heading = directions[enemy.direction];
      const travelled = moveTank(enemy, heading.x, heading.y, enemy.speed * dt, 9 * SCALE);
      enemy.stuckFor = travelled < enemy.speed * dt * .3 ? enemy.stuckFor + dt : 0;
      if (enemy.stuckFor > .18) {
        enemy.stuckFor = 0;
        chooseEnemyDirection(enemy);
      }
      if (now >= enemy.nextShot) {
        const angle = Math.atan2(targetBase.x - enemy.x, -(targetBase.y - enemy.y));
        addShot('enemy', enemy.x, enemy.y, angle, 205 * SCALE);
        enemy.nextShot = now + enemy.shotGap;
      }
      if (Math.hypot(targetBase.x - enemy.x, targetBase.y - enemy.y) < 26 * SCALE) {
        enemy.hp = 0;
        state.breaches += 1;
        state.fortress = Math.max(0, state.fortress - 1);
        state.sparks.push({ x: targetBase.x, y: targetBase.y, age: 0, color: '#444' });
      }
    });
    state.enemies = state.enemies.filter(enemy => enemy.hp > 0);

    state.shots.forEach(shot => {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      if (shot.x < BOARD_X || shot.x > BOARD_X + BOARD_W || shot.y < BOARD_Y || shot.y > BOARD_Y + BOARD_H) { shot.life = 0; return; }
      const obstacle = hitsObstacle(shot.x, shot.y, 4 * SCALE, true);
      if (obstacle) {
        if (obstacle.tile?.type === 'brick') {
          obstacle.tile.hp -= 1;
          if (obstacle.tile.hp <= 0) arena[obstacle.row][obstacle.col] = null;
        }
        shot.life = 0;
        state.sparks.push({ x: shot.x, y: shot.y, age: 0, color: '#777' });
        return;
      }
      if (shot.owner === 'player') {
        const hit = state.enemies.find(enemy => enemy.hp > 0 && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < 18 * SCALE);
        if (hit) {
          hit.hp -= 1;
          shot.life = 0;
          state.sparks.push({ x: shot.x, y: shot.y, age: 0, color: '#555' });
          if (hit.hp <= 0) {
            state.kills += 1;
            state.sparks.push({ x: hit.x, y: hit.y, age: 0, color: '#222' });
          }
        }
      } else if (Math.hypot(targetBase.x - shot.x, targetBase.y - shot.y) < 34 * SCALE) {
        state.fortress = Math.max(0, state.fortress - 1);
        shot.life = 0;
        state.sparks.push({ x: targetBase.x, y: targetBase.y - 12 * SCALE, age: 0, color: '#333' });
      }
    });
    state.enemies = state.enemies.filter(enemy => enemy.hp > 0);
    state.shots = state.shots.filter(shot => shot.life > 0 && shot.x > -10 && shot.x < W + 10 && shot.y > -10 && shot.y < H + 10);
    state.sparks.forEach(spark => { spark.age += dt; });
    state.sparks = state.sparks.filter(spark => spark.age < .42);

    if (enemyCount) enemyCount.textContent = `${state.kills} / 5`;
    if (baseHealth) baseHealth.textContent = `${state.fortress} / 5`;
    if (roundLabel) roundLabel.textContent = `${state.round} / 3`;
    if (state.fortress <= 0) finish(false);
    else if (state.spawned === 5 && state.enemies.length === 0) {
      if (state.kills === 5) advanceRound();
      else finish(false);
    }
    else if (state.elapsed >= 150000) finish(false);
  }

  function drawBackground() {
    ctx.fillStyle = '#fffefa'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff'; ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);
    ctx.strokeStyle = '#d9d8d1'; ctx.lineWidth = SCALE;
    for (let col = 0; col <= COLS; col += 1) { const x = BOARD_X + col * TILE; ctx.beginPath(); ctx.moveTo(x, BOARD_Y); ctx.lineTo(x, BOARD_Y + BOARD_H); ctx.stroke(); }
    for (let row = 0; row <= ROWS; row += 1) { const y = BOARD_Y + row * TILE; ctx.beginPath(); ctx.moveTo(BOARD_X, y); ctx.lineTo(BOARD_X + BOARD_W, y); ctx.stroke(); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2.2 * SCALE; ctx.strokeRect(BOARD_X - 4 * SCALE, BOARD_Y - 4 * SCALE, BOARD_W + 8 * SCALE, BOARD_H + 8 * SCALE);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.3 * SCALE;
    ctx.beginPath(); ctx.moveTo(BOARD_X, BOARD_Y + BOARD_H + 9 * SCALE); ctx.lineTo(BOARD_X + BOARD_W, BOARD_Y + BOARD_H + 9 * SCALE); ctx.stroke();
    arena.forEach((row, r) => row.forEach((tile, c) => { if (tile && !tile.type.startsWith('brand-')) drawTile(c, r, tile); }));
    drawBranding(8, 0, 2, 2, 'square');
    drawBranding(0, 9, 4, 1, 'wide');
    drawBase();
  }

  function drawBranding(col, row, columns, rows, shape) {
    ctx.save();
    ctx.translate(BOARD_X + col * TILE, BOARD_Y + row * TILE);
    ctx.scale(SCALE, SCALE);
    const x = 0;
    const y = 0;
    const width = columns * ART_TILE;
    const height = rows * ART_TILE;
    ctx.fillStyle = shape === 'square' ? '#eaf0e9' : '#f2e7d2';
    ctx.strokeStyle = '#173f37';
    ctx.lineWidth = 2;
    ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    ctx.strokeStyle = '#c39a55';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, width - 10, height - 10);
    ctx.fillStyle = '#173f37';
    ctx.textAlign = 'center';
    if (shape === 'wide') {
      ctx.beginPath(); ctx.arc(x + 20, y + height / 2, 12, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#c39a55'; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '900 9px Georgia,serif'; ctx.fillText('N*', x + 20, y + height / 2 + 3);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#173f37';
      ctx.font = '900 8px Arial,sans-serif'; ctx.fillText('NORTHSTAR ROAST', x + 38, y + 17);
      ctx.fillStyle = '#a56d35';
      ctx.font = '800 7px Arial,sans-serif'; ctx.fillText('SUMMIT BLEND · COFFEE', x + 38, y + 29);
    } else {
      ctx.beginPath(); ctx.arc(x + width / 2, y + 22, 13, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#c39a55'; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '900 10px Georgia,serif'; ctx.fillText('N*', x + width / 2, y + 26);
      ctx.fillStyle = '#173f37';
      ctx.font = '900 8px Arial,sans-serif'; ctx.fillText('NORTHSTAR', x + width / 2, y + 52);
      ctx.font = '800 7px Arial,sans-serif'; ctx.fillText('ROAST CO.', x + width / 2, y + 64);
      ctx.fillStyle = '#a56d35';
      ctx.font = '800 6px Arial,sans-serif'; ctx.fillText('SUMMIT BLEND', x + width / 2, y + 73);
    }
    ctx.restore();
  }

  function drawTile(col, row, tile) {
    const originX = BOARD_X + col * TILE;
    const originY = BOARD_Y + row * TILE;
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(SCALE, SCALE);
    const x = 0; const y = 0; const artTile = ART_TILE;
    ctx.lineWidth = 1.45; ctx.strokeStyle = '#111';
    if (tile.type === 'brick') {
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, artTile - 2, artTile - 2);
      ctx.strokeRect(x + 1, y + 1, artTile - 2, artTile - 2);
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x + 1, y + 13); ctx.lineTo(x + artTile - 1, y + 13); ctx.moveTo(x + 1, y + 27); ctx.lineTo(x + artTile - 1, y + 27);
      ctx.moveTo(x + 13, y + 1); ctx.lineTo(x + 13, y + 13); ctx.moveTo(x + 27, y + 13); ctx.lineTo(x + 27, y + 27); ctx.moveTo(x + 9, y + 27); ctx.lineTo(x + 9, y + artTile - 1); ctx.stroke();
      if (tile.hp === 1) { ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(x + 19, y + 3); ctx.lineTo(x + 16, y + 14); ctx.lineTo(x + 23, y + 20); ctx.stroke(); }
    } else if (tile.type === 'steel') {
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, artTile - 2, artTile - 2); ctx.strokeRect(x + 1, y + 1, artTile - 2, artTile - 2);
      ctx.fillStyle = '#fff'; [[4,4],[22,4],[4,22],[22,22]].forEach(([dx,dy])=>{ctx.fillRect(x+dx,y+dy,14,14);ctx.strokeRect(x+dx,y+dy,14,14);});
      ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + 17, y + 17); ctx.moveTo(x + 35, y + 5); ctx.lineTo(x + 23, y + 17); ctx.stroke();
    } else if (tile.type === 'water') {
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, artTile - 2, artTile - 2); ctx.strokeStyle = '#111';
      for (let yy = y + 9; yy < y + artTile - 2; yy += 11) { ctx.beginPath(); ctx.moveTo(x + 3, yy); ctx.quadraticCurveTo(x + 12, yy - 6, x + 20, yy); ctx.quadraticCurveTo(x + 29, yy + 6, x + artTile - 3, yy); ctx.stroke(); }
    } else if (tile.type === 'forest') {
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, artTile - 2, artTile - 2); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.3;
      for (let i = 0; i < 5; i += 1) { const px = x + 5 + ((i * 13) % 29); const py = y + 9 + ((i * 11) % 24); ctx.beginPath(); ctx.moveTo(px, py + 10); ctx.lineTo(px - 6, py + 1); ctx.quadraticCurveTo(px, py - 5, px + 6, py + 1); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(px, py + 9); ctx.lineTo(px, py + 14); ctx.stroke(); }
    } else if (tile.type === 'product') {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + 8, y + 5); ctx.lineTo(x + artTile - 8, y + 5); ctx.lineTo(x + artTile - 5, y + 11); ctx.lineTo(x + artTile - 5, y + artTile - 4); ctx.lineTo(x + 5, y + artTile - 4); ctx.lineTo(x + 5, y + 11); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 9, y + 7); ctx.lineTo(x + artTile - 9, y + 7); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '900 5px Arial,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SUMMIT', x + artTile / 2, y + 18);
      ctx.beginPath(); ctx.arc(x + artTile / 2, y + 27, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111'; ctx.font = '900 5px Arial,sans-serif'; ctx.fillText('N*', x + artTile / 2, y + 29);
    }
    ctx.restore();
  }

  function drawBase() {
    const x = targetBase.x;
    const y = targetBase.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(-24, 13); ctx.lineTo(-24, -6); ctx.lineTo(-18, -6); ctx.lineTo(-18, -15); ctx.lineTo(-8, -15);
    ctx.lineTo(-8, -7); ctx.lineTo(8, -7); ctx.lineTo(8, -15); ctx.lineTo(18, -15); ctx.lineTo(18, -6); ctx.lineTo(24, -6); ctx.lineTo(24, 13); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.fillRect(-5, -2, 10, 15); ctx.strokeRect(-5, -2, 10, 15);
    ctx.fillStyle = '#111'; ctx.font = '900 7px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N*', 0, 8);
    ctx.restore();
  }

  function drawTank(tank, palette, isPlayer) {
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);
    ctx.scale(SCALE, SCALE);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#111';
    ctx.fillStyle = palette.track;
    ctx.fillRect(-12, -13, 4, 26); ctx.strokeRect(-12, -13, 4, 26);
    ctx.fillRect(8, -13, 4, 26); ctx.strokeRect(8, -13, 4, 26);
    for (let y = -9; y <= 7; y += 8) {
      ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(-9, y + 2); ctx.moveTo(9, y); ctx.lineTo(11, y + 2); ctx.stroke();
    }
    ctx.fillStyle = palette.body;
    ctx.fillRect(-8, -11, 16, 22); ctx.strokeRect(-8, -11, 16, 22);
    ctx.fillStyle = palette.hull;
    ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(6, -8); ctx.lineTo(7, 6); ctx.lineTo(4, 9); ctx.lineTo(-4, 9); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = palette.turret;
    ctx.beginPath(); ctx.arc(0, -1, 4.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.4, -5); ctx.lineTo(-1.4, -17); ctx.lineTo(1.4, -17); ctx.lineTo(1.4, -5); ctx.closePath(); ctx.fillStyle = palette.hull; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(6, -7); ctx.lineTo(10, -13); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, -13); ctx.lineTo(15, -12); ctx.lineTo(10, -9); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.font = '900 4px Arial,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(isPlayer ? 'N*' : `R${(tank.id ?? 0) + 1}`, 12, -10.5);
    ctx.restore();
  }

  function draw() {
    if (!ctx || !state) return;
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawBrandPlane();
    state.shots.forEach(shot => {
      ctx.save(); ctx.translate(shot.x, shot.y); ctx.scale(SCALE, SCALE);
      ctx.beginPath(); ctx.arc(0, 0, shot.owner === 'player' ? 4 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#111';
      ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(17,17,17,.42)';
      ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    });
    state.enemies.forEach(enemy => {
      drawTank({ ...enemy, angle: directions[enemy.direction].angle }, { body: '#fff', track: '#fff', hull: '#fff', turret: '#fff', mark: '#fff' }, false);
    });
    drawTank(state.player, { body: '#fff', track: '#fff', hull: '#fff', turret: '#fff', mark: '#fff' }, true);
    state.sparks.forEach(spark => {
      const t = 1 - spark.age / .42;
      ctx.save(); ctx.translate(spark.x, spark.y); ctx.scale(SCALE, SCALE);
      ctx.globalAlpha = t;
      ctx.strokeStyle = spark.color;
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 2 / 5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
        ctx.lineTo(Math.cos(a) * (10 + (1 - t) * 12), Math.sin(a) * (10 + (1 - t) * 12));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  }

  function drawBrandPlane() {
    // A small flat crop-duster crosses the arena every 24 seconds with a branded banner in tow.
    const phase = state.elapsed % 24000;
    if (phase >= 14000) return;
    const progress = phase / 14000;
    const x = -280 + progress * 1060;
    const y = BOARD_Y + TILE * 2 + Math.sin(state.elapsed / 430) * 2.2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(2, 2);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // Banner trails behind the aircraft: sage field, slate logo panel and a muted red edge.
    ctx.strokeStyle = '#282b29'; ctx.lineWidth = 1.25;
    ctx.beginPath(); ctx.moveTo(-23, 3); ctx.quadraticCurveTo(-34, 8, -43, 4); ctx.stroke();
    ctx.fillStyle = '#7e8b78';
    ctx.beginPath(); ctx.moveTo(-42, -3); ctx.lineTo(-154, -1); ctx.lineTo(-145, 11); ctx.lineTo(-42, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#70859a'; ctx.fillRect(-148, 0, 8, 10);
    ctx.fillStyle = '#c96666'; ctx.fillRect(-44, -3, 3, 12);
    ctx.fillStyle = '#f1f0ec'; ctx.beginPath(); ctx.arc(-128, 4, 4.2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#282b29'; ctx.lineWidth = .8; ctx.stroke();
    ctx.fillStyle = '#70859a'; ctx.font = '900 4.1px Arial,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N*', -128, 5.4);
    ctx.fillStyle = '#282b29'; ctx.font = '900 4.5px Arial,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('NORTHSTAR ROAST', -120, 3);
    ctx.font = '800 3.3px Arial,sans-serif'; ctx.fillText('BREW BOLD · GO FURTHER', -120, 7.5);

    // Cream, slate and sage An-2-inspired biplane, kept deliberately flat and legible.
    ctx.strokeStyle = '#282b29'; ctx.lineWidth = 1.25;
    ctx.fillStyle = '#f1f0ec';
    ctx.beginPath(); ctx.moveTo(-22, -2); ctx.lineTo(-15, -6); ctx.lineTo(-8, -5); ctx.lineTo(3, -4); ctx.lineTo(14, -2); ctx.lineTo(21, 0); ctx.lineTo(14, 4); ctx.lineTo(0, 5); ctx.lineTo(-13, 4); ctx.lineTo(-22, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Upper and lower wings, plus the visible interplane struts.
    ctx.fillStyle = '#70859a';
    ctx.beginPath(); ctx.moveTo(-13, -9); ctx.lineTo(13, -9); ctx.lineTo(17, -6); ctx.lineTo(-17, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#7e8b78';
    ctx.beginPath(); ctx.moveTo(-12, 5); ctx.lineTo(12, 5); ctx.lineTo(15, 8); ctx.lineTo(-16, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(-5, 5); ctx.moveTo(8, -6); ctx.lineTo(6, 5); ctx.stroke();
    // Tailplane, rudder, cabin window and branded fuselage stripe.
    ctx.fillStyle = '#f1f0ec';
    ctx.beginPath(); ctx.moveTo(-20, -2); ctx.lineTo(-26, -7); ctx.lineTo(-24, -2); ctx.lineTo(-28, 1); ctx.lineTo(-21, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#70859a'; ctx.fillRect(-1, -3.2, 7, 3.8); ctx.strokeRect(-1, -3.2, 7, 3.8);
    ctx.fillStyle = '#c96666'; ctx.fillRect(8, 1, 6, 1.7);
    // Landing gear and the nose propeller mark the classic utility-plane silhouette.
    ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(-6, 10); ctx.moveTo(9, 4); ctx.lineTo(7, 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(-6, 10, 1.8, 0, Math.PI * 2); ctx.arc(7, 10, 1.8, 0, Math.PI * 2); ctx.fillStyle = '#f1f0ec'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(23, -7); ctx.lineTo(23, 7); ctx.moveTo(20, 0); ctx.lineTo(26, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(22, 0, 1.3, 0, Math.PI * 2); ctx.fillStyle = '#c96666'; ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function loop(time) {
    if (!state?.live) return;
    const dt = Math.min(.04, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    update(dt, time);
    draw();
    if (state.live) frame = requestAnimationFrame(loop);
  }

  async function copyCoupon() {
    const code = modal.querySelector('[data-tank-coupon]')?.textContent?.trim() || 'LEMMING10';
    try {
      await navigator.clipboard.writeText(code);
    } catch (_) {
      const field = document.createElement('textarea');
      field.value = code;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    if (copyStatus) copyStatus.textContent = 'Coupon copied: ' + code;
  }

  openButton.addEventListener('click', openGame);
  closeButtons.forEach(button => button.addEventListener('click', closeGame));
  modal.addEventListener('click', event => {
    if (event.target === modal) closeGame();
  });
  modal.querySelector('[data-tank-copy]')?.addEventListener('click', copyCoupon);
  modal.querySelector('[data-tank-retry]')?.addEventListener('click', () => {
    resetGame();
    modal.querySelector('.tg-close')?.focus({ preventScroll: true });
  });

  canvas?.addEventListener('pointermove', event => aimAtPointer(event));
  canvas?.addEventListener('pointerdown', event => {
    event.preventDefault();
    aimAtPointer(event);
    input.firing = true;
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas?.addEventListener('pointerup', event => {
    input.firing = false;
    canvas.releasePointerCapture?.(event.pointerId);
  });
  canvas?.addEventListener('pointercancel', () => { input.firing = false; });

  modal.querySelectorAll('[data-tank-dir]').forEach(button => {
    const direction = button.dataset.tankDir;
    const down = event => {
      event.preventDefault();
      lastMoveAxis = ['left', 'right'].includes(direction) ? 'horizontal' : 'vertical';
      heldDirections.add(direction);
      button.classList.add('is-held');
      button.setPointerCapture?.(event.pointerId);
    };
    const up = () => {
      heldDirections.delete(direction);
      button.classList.remove('is-held');
    };
    button.addEventListener('pointerdown', down);
    button.addEventListener('pointerup', up);
    button.addEventListener('pointercancel', up);
    button.addEventListener('lostpointercapture', up);
  });
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGame();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')]
        .filter(item => !item.hidden && item.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (!state?.live) return;
    const key = event.key.toLowerCase();
    const controlKeys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 'a', 's', 'd', ' '];
    if (!controlKeys.includes(key)) return;
    keys.add(key);
    if (key !== ' ') input.pointerAim = false;
    if (['arrowleft', 'arrowright', 'a', 'd'].includes(key)) lastMoveAxis = 'horizontal';
    else if (['arrowup', 'arrowdown', 'w', 's'].includes(key)) lastMoveAxis = 'vertical';
    if (key.startsWith('arrow') || key === ' ') event.preventDefault();
  });
  document.addEventListener('keyup', event => {
    keys.delete(event.key.toLowerCase());
  });
  function releaseControls() {
    keys.clear();
    heldDirections.clear();
    input.firing = false;
    modal.querySelectorAll('.is-held').forEach(button => button.classList.remove('is-held'));
  }
  window.addEventListener('blur', releaseControls);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseControls();
  });
  window.addEventListener('resize', () => { if (!modal.hidden) resizeCanvas(); });
  resizeCanvas();
})();

