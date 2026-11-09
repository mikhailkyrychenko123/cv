(() => {
  const app = document.querySelector('.hop-app');
  const canvas = app?.querySelector('[data-canvas]');
  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!app || !canvas || !ctx) return;

  const W = 960;
  const H = 540;
  const PLAYER_W = 22;
  const PLAYER_H = 30;
  const GRAVITY = 1450;
  const JUMP = 600;
  const SPEED = 245;
  const towerLetters = (p, r, i, z, e) => [
    { letter: 'P', x: p, y: 1710 }, { letter: 'R', x: r, y: 1580 }, { letter: 'I', x: i, y: 1320 },
    { letter: 'Z', x: z, y: 720 }, { letter: 'E', x: e, y: 120 }
  ];
  const stages = [
    {
      type: 'climb', name: 'CONCRETE ASCENT', width: 960, height: 1960, portal: 740, exitY: 160,
      colors: { sky: '#687483', far: '#a3b5aa', wall: '#bdc4bd', wall2: '#acb5b2', tile: '#929f9f', stone: '#728793', stoneDark: '#485e6c', moss: '#9fb883', light: '#e7c47d', portal: '#f3d27c' },
      platforms: [
        { x: 0, y: 1880, w: 330 }, { x: 365, y: 1750, w: 180 }, { x: 560, y: 1620, w: 180 },
        { x: 365, y: 1490, w: 180, kind: 'spring' }, { x: 170, y: 1360, w: 175 }, { x: 20, y: 1230, w: 170 },
        { x: 215, y: 1100, w: 180, kind: 'spring' }, { x: 410, y: 890, w: 180 }, { x: 610, y: 760, w: 180 },
        { x: 400, y: 630, w: 180, kind: 'spring' }, { x: 195, y: 420, w: 180 }, { x: 25, y: 290, w: 180 }, { x: 235, y: 160, w: 645 }
      ],
      units: [{ x: 125, platform: 11, kind: 'vending' }], letters: towerLetters(455, 650, 260, 690, 595),
      checkpoints: [{ x: 300, y: 1360 }, { x: 625, y: 760 }],
      hazards: [
        { kind: 'gear', x: 720, y: 1590, r: 18, phase: .2 }, { kind: 'piston', x: 100, railY: 1178, range: 42, phase: 1.2, speed: 2.3 },
        { kind: 'gear', x: 493, y: 868, r: 17, phase: 1.4 }, { kind: 'piston', x: 770, railY: 706, range: 43, phase: 2.1, speed: 2 },
        { kind: 'gear', x: 286, y: 397, r: 17, phase: .8 }
      ]
    },
    {
      type: 'climb', name: 'DUSTY SHAFT', width: 960, height: 1960, portal: 740, exitY: 160,
      colors: { sky: '#777184', far: '#b2aca7', wall: '#c9c2bf', wall2: '#b8afb6', tile: '#a8a0a8', stone: '#897f91', stoneDark: '#5d566a', moss: '#b0ae8b', light: '#e8bd7f', portal: '#d3a5d7' },
      platforms: [
        { x: 0, y: 1880, w: 330 }, { x: 390, y: 1750, w: 180 }, { x: 565, y: 1620, w: 180 },
        { x: 385, y: 1490, w: 180, kind: 'spring' }, { x: 190, y: 1360, w: 175 }, { x: 15, y: 1230, w: 170 },
        { x: 215, y: 1100, w: 180, kind: 'spring' }, { x: 420, y: 890, w: 180 }, { x: 620, y: 760, w: 180 },
        { x: 410, y: 630, w: 180, kind: 'spring' }, { x: 205, y: 420, w: 180 }, { x: 35, y: 290, w: 180 }, { x: 225, y: 160, w: 655 }
      ],
      units: [{ x: 135, platform: 11, kind: 'terminal' }], letters: towerLetters(480, 670, 280, 700, 590),
      checkpoints: [{ x: 315, y: 1360 }, { x: 635, y: 760 }],
      hazards: [
        { kind: 'gear', x: 715, y: 1590, r: 18, phase: 1.1 }, { kind: 'piston', x: 95, railY: 1176, range: 46, phase: .2, speed: 2.6 },
        { kind: 'gear', x: 505, y: 868, r: 18, phase: .4 }, { kind: 'piston', x: 780, railY: 704, range: 48, phase: 1.5, speed: 2.2 },
        { kind: 'gear', x: 295, y: 397, r: 18, phase: 1.7 }
      ]
    },
    {
      type: 'climb', name: 'MOSS ASCENT', width: 960, height: 1960, portal: 740, exitY: 160,
      colors: { sky: '#657887', far: '#a6b6a8', wall: '#c3c7b8', wall2: '#acb8aa', tile: '#98a493', stone: '#758d8b', stoneDark: '#4d686d', moss: '#a0bd7b', light: '#efd18e', portal: '#a7e2af' },
      platforms: [
        { x: 0, y: 1880, w: 350 }, { x: 380, y: 1750, w: 180 }, { x: 570, y: 1620, w: 180 },
        { x: 385, y: 1490, w: 180, kind: 'spring' }, { x: 185, y: 1360, w: 175 }, { x: 0, y: 1230, w: 170 },
        { x: 205, y: 1100, w: 180, kind: 'spring' }, { x: 400, y: 890, w: 180 }, { x: 605, y: 760, w: 180 },
        { x: 395, y: 630, w: 180, kind: 'spring' }, { x: 185, y: 420, w: 180 }, { x: 25, y: 290, w: 180 }, { x: 225, y: 160, w: 655 }
      ],
      units: [{ x: 140, platform: 11, kind: 'relay' }], letters: towerLetters(470, 660, 275, 690, 590),
      checkpoints: [{ x: 310, y: 1360 }, { x: 630, y: 760 }],
      hazards: [
        { kind: 'gear', x: 720, y: 1590, r: 19, phase: .7 }, { kind: 'piston', x: 90, railY: 1178, range: 43, phase: 2, speed: 2.1 },
        { kind: 'gear', x: 500, y: 868, r: 17, phase: 2.2 }, { kind: 'piston', x: 775, railY: 706, range: 45, phase: .3, speed: 2.5 },
        { kind: 'gear', x: 280, y: 397, r: 18, phase: .5 }
      ]
    }
  ];
  const keys = new Set();
  const held = new Set();
  let levelIndex = 0;
  let state;
  let animation = 0;
  let previous = 0;
  let dpr = 1;
  let gameScale = 1;
  let viewWidth = W;
  let viewOffsetX = 0;
  let toastTimer = 0;
  let won = false;

  const hud = {
    map: app.querySelector('[data-map]'), goalLabel: app.querySelector('[data-goal-label]'), units: app.querySelector('[data-units]'),
    nextWrap: app.querySelector('[data-next-wrap]'), nextLetter: app.querySelector('[data-next-letter]'), lives: app.querySelector('[data-lives]'), route: app.querySelector('[data-route]'),
    world: app.querySelector('[data-world]'), toast: app.querySelector('[data-toast]'), result: app.querySelector('[data-result]'),
    resultStamp: app.querySelector('[data-result-stamp]'), resultTitle: app.querySelector('[data-result-title]'), resultCopy: app.querySelector('[data-result-copy]'),
    help: app.querySelector('[data-help]')
  };
  const standardHelp = hud.help.innerHTML;

  function fit() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    gameScale = canvas.height / H;
    viewWidth = canvas.width / gameScale;
    viewOffsetX = Math.max(0, (viewWidth - W) / 2);
    ctx.imageSmoothingEnabled = false;
    draw();
  }

  function freshPlayer() { return { x: 48, y: 0, vy: 0, grounded: false, facing: 1, walk: 0, lives: 3, camera: 0, cameraY: 0 }; }

  function loadLevel(index) {
    levelIndex = index;
    const stage = stages[levelIndex];
    const player = state?.player || freshPlayer();
    const climbing = stage.type === 'climb';
    player.x = climbing ? 70 : 48; player.y = stage.platforms[0].y - PLAYER_H; player.vy = 0; player.grounded = true; player.walk = 0; player.camera = 0;
    player.cameraY = climbing ? Math.max(0, stage.height - H) : 0;
    if (climbing) player.lives = Math.max(player.lives, 3);
    state = {
      player, elapsed: 0,
      units: (stage.units || []).map(unit => ({ ...unit, baseY: stage.platforms[unit.platform].y, active: false })),
      letters: (stage.letters || []).map(letter => ({ ...letter, collected: false })), nextLetter: 0,
      checkpoint: climbing ? { x: 70, y: stage.platforms[0].y } : null, invulnerable: 0,
      transition: 0, live: true
    };
    hud.result.hidden = true;
    hud.result.setAttribute('aria-hidden', 'true');
    hud.world.textContent = stage.name;
    hud.goalLabel.textContent = climbing ? 'LETTERS' : 'UNITS';
    hud.nextWrap.hidden = !climbing;
    app.querySelector('[data-activate]').hidden = false;
    hud.help.innerHTML = climbing
      ? '<b>Move:</b> A / D or ← / → · <b>Jump:</b> W / ↑ / Space · <b>Order:</b> P → R → I → Z → E. Springs boost you; dodge gears and pistons. Press E / ACT at a machine for a life.'
      : standardHelp;
    updateHud();
    say(climbing ? `CLIMB · COLLECT PRIZE IN ORDER · LEVEL ${levelIndex + 1}` : levelIndex === 0 ? 'FIND BOTH UNITS · REACH THE PORTAL' : `MAP ${String(levelIndex + 1).padStart(2, '0')} · FIND THE UNITS`, 2.1);
    draw();
  }

  function resetRoute() {
    cancelAnimationFrame(animation);
    keys.clear(); held.clear();
    app.querySelectorAll('.is-held').forEach(button => button.classList.remove('is-held'));
    won = false;
    state = { player: freshPlayer(), units: [], elapsed: 0, transition: 0, live: true };
    loadLevel(0);
    previous = performance.now();
    animation = requestAnimationFrame(loop);
    canvas.focus({ preventScroll: true });
  }

  function say(message, seconds = 1.25) {
    hud.toast.textContent = message;
    hud.toast.hidden = false;
    toastTimer = seconds;
  }

  function updateHud() {
    if (!state) return;
    const climbing = stages[levelIndex].type === 'climb';
    const count = climbing ? state.letters.filter(letter => letter.collected).length : state.units.filter(unit => unit.active).length;
    const total = climbing ? state.letters.length : state.units.length;
    hud.map.textContent = `${String(levelIndex + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
    hud.units.textContent = `${count} / ${total}`;
    hud.nextWrap.hidden = !climbing;
    hud.nextLetter.textContent = climbing ? (state.nextLetter < 5 ? 'PRIZE'[state.nextLetter] : '✓') : '—';
    hud.lives.textContent = String(state.player.lives);
    hud.route.textContent = count === total ? 'OPEN' : 'LOCKED';
    hud.route.style.color = count === total ? '#50765c' : '';
  }

  function jump() {
    if (!state?.live || state.transition > 0 || !state.player.grounded) return;
    state.player.vy = -(stages[levelIndex].type === 'climb' ? 640 : JUMP);
    state.player.grounded = false;
  }

  function nearbyUnit() {
    if (!state) return null;
    const p = state.player;
    const foot = p.y + PLAYER_H;
    return state.units.find(unit => !unit.active && Math.abs((p.x + PLAYER_W / 2) - unit.x) < 66 && Math.abs(foot - unit.baseY) < 42) || null;
  }

  function activateUnit() {
    if (!state?.live || state.transition > 0) return;
    const unit = nearbyUnit();
    if (!unit) { say('MOVE CLOSE TO A MACHINE', .9); return; }
    unit.active = true;
    const activated = state.units.filter(item => item.active).length;
    const climbing = stages[levelIndex].type === 'climb';
    const refilled = climbing && state.player.lives < 5;
    if (climbing) state.player.lives = Math.min(5, state.player.lives + 1);
    const reward = climbing ? (refilled ? 'LIFE REFILLED' : 'LIVES FULL') : `${activated} / ${state.units.length}`;
    say(`${unit.kind.toUpperCase()} ONLINE · ${reward}`, 1.7);
    updateHud();
    draw();
  }

  function finishRoute(success) {
    if (!state?.live) return;
    state.live = false;
    won = success;
    hud.resultStamp.textContent = success ? 'ROUTE COMPLETE' : 'RUN ENDED';
    hud.resultTitle.textContent = success ? 'All three climbs cleared.' : 'Try the route again.';
    hud.resultCopy.textContent = success ? 'PRIZE is in order, the tower is clear, and the machines are humming again.' : 'Take another run through the Machine District.';
    hud.result.hidden = false;
    hud.result.setAttribute('aria-hidden', 'false');
    app.querySelector('[data-reset-result]').focus({ preventScroll: true });
    draw();
  }

  function update(dt) {
    if (!state?.live) return;
    const stage = stages[levelIndex];
    state.elapsed += dt;
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) hud.toast.hidden = true;
    }
    if (state.transition > 0) {
      state.transition -= dt;
      if (state.transition <= 0) {
        if (levelIndex < stages.length - 1) loadLevel(levelIndex + 1);
        else finishRoute(true);
      }
      return;
    }

    if (stage.type === 'climb') { updateClimb(dt, stage); return; }

    const p = state.player;
    const dir = (keys.has('arrowleft') || keys.has('a') || held.has('left') ? -1 : 0) + (keys.has('arrowright') || keys.has('d') || held.has('right') ? 1 : 0);
    if (dir) { p.x += dir * SPEED * dt; p.facing = dir; p.walk += dt * 11; }
    p.x = Math.max(0, Math.min(stage.width - PLAYER_W, p.x));

    const oldBottom = p.y + PLAYER_H;
    p.vy = Math.min(900, p.vy + GRAVITY * dt);
    p.y += p.vy * dt;
    p.grounded = false;
    for (const platform of stage.platforms) {
      const newBottom = p.y + PLAYER_H;
      if (p.vy >= 0 && oldBottom <= platform.y + 1 && newBottom >= platform.y && p.x + PLAYER_W - 3 > platform.x && p.x + 3 < platform.x + platform.w) {
        p.y = platform.y - PLAYER_H;
        p.vy = 0;
        p.grounded = true;
      }
    }

    if (p.y > H + 60) {
      p.lives -= 1;
      if (p.lives <= 0) { finishRoute(false); return; }
      p.x = 48; p.y = stage.platforms[0].y - PLAYER_H; p.vy = 0; p.grounded = true; p.camera = 0;
      say(`BACK TO THE ENTRANCE · ${p.lives} LEFT`, 1.5);
    }

    const cameraMax = Math.max(0, stage.width - (viewWidth - viewOffsetX));
    p.camera = Math.max(0, Math.min(cameraMax, p.x + viewOffsetX - viewWidth * .37));

    if (p.x + PLAYER_W > stage.portal - 28 && p.x < stage.portal + 42) {
      if (state.units.every(unit => unit.active)) {
        state.transition = .78;
        say(levelIndex < stages.length - 1 ? 'SECTOR CLEAR · NEXT MAP' : 'ROUTE COMPLETE', .78);
      } else if (!state.blockedHint) {
        say('THE PORTAL NEEDS BOTH UNITS', 1.5);
        state.blockedHint = true;
      }
    }
    if (p.x < stage.portal - 110) state.blockedHint = false;
  }

  function hazardBox(hazard, time) {
    if (hazard.kind === 'piston') {
      const y = hazard.railY + Math.sin(time * hazard.speed + hazard.phase) * hazard.range;
      return { x: hazard.x - 16, y, w: 32, h: 32 };
    }
    return { x: hazard.x - hazard.r, y: hazard.y - hazard.r, w: hazard.r * 2, h: hazard.r * 2 };
  }

  function hurtOnTower(reason) {
    const p = state.player;
    p.lives -= 1;
    if (p.lives <= 0) { finishRoute(false); return; }
    p.x = state.checkpoint.x;
    p.y = state.checkpoint.y - PLAYER_H;
    p.vy = 0;
    p.grounded = true;
    p.camera = Math.max(0, Math.min(Math.max(0, stages[levelIndex].width - (viewWidth - viewOffsetX)), p.x + viewOffsetX - viewWidth * .5));
    p.cameraY = Math.max(0, Math.min(stages[levelIndex].height - H, p.y - H * .68));
    state.invulnerable = 1.35;
    say(`${reason} · CHECKPOINT · ${p.lives} LIVES`, 1.4);
  }

  function updateClimb(dt, stage) {
    const p = state.player;
    const dir = (keys.has('arrowleft') || keys.has('a') || held.has('left') ? -1 : 0) + (keys.has('arrowright') || keys.has('d') || held.has('right') ? 1 : 0);
    if (dir) { p.x += dir * SPEED * dt; p.facing = dir; p.walk += dt * 11; }
    p.x = Math.max(0, Math.min(stage.width - PLAYER_W, p.x));
    state.invulnerable = Math.max(0, state.invulnerable - dt);

    const oldBottom = p.y + PLAYER_H;
    p.vy = Math.min(950, p.vy + GRAVITY * dt);
    p.y += p.vy * dt;
    p.grounded = false;
    for (const platform of stage.platforms) {
      const newBottom = p.y + PLAYER_H;
      if (p.vy >= 0 && oldBottom <= platform.y + 1 && newBottom >= platform.y && p.x + PLAYER_W - 3 > platform.x && p.x + 3 < platform.x + platform.w) {
        p.y = platform.y - PLAYER_H;
        if (platform.kind === 'spring') {
          p.vy = -850;
          say('SPRING BOOST!', .75);
        } else {
          p.vy = 0;
          p.grounded = true;
          for (const checkpoint of stage.checkpoints) {
            if (checkpoint.y === platform.y && p.x + PLAYER_W > checkpoint.x && p.x < checkpoint.x + 28 && state.checkpoint.y !== checkpoint.y) {
              state.checkpoint = { x: checkpoint.x, y: checkpoint.y };
              say('CHECKPOINT REACHED', 1.1);
            }
          }
        }
        break;
      }
    }

    if (state.invulnerable <= 0) {
      for (const hazard of stage.hazards) {
        const box = hazardBox(hazard, state.elapsed);
        if (p.x + PLAYER_W > box.x + 3 && p.x < box.x + box.w - 3 && p.y + PLAYER_H > box.y + 3 && p.y < box.y + box.h - 3) {
          hurtOnTower('MECHANICAL TRAP');
          return;
        }
      }
    }

    if (p.y > stage.height + 45) { hurtOnTower('MISSED A PLATFORM'); return; }

    const expected = 'PRIZE'[state.nextLetter];
    for (const letter of state.letters) {
      if (letter.collected) continue;
      const overlaps = p.x + PLAYER_W > letter.x - 14 && p.x < letter.x + 14 && p.y + PLAYER_H > letter.y - 16 && p.y < letter.y + 16;
      if (!overlaps) continue;
      if (letter.letter === expected) {
        letter.collected = true;
        state.nextLetter += 1;
        say(`LETTER ${letter.letter} · NICE CLIMB`, 1.1);
        updateHud();
      } else if (state.elapsed > (state.wrongHintUntil || 0)) {
        say(`NEXT LETTER IS ${expected}`, 1.05);
        state.wrongHintUntil = state.elapsed + 1.3;
      }
      break;
    }

    const cameraMax = Math.max(0, stage.height - H);
    const cameraMaxX = Math.max(0, stage.width - (viewWidth - viewOffsetX));
    p.camera = Math.max(0, Math.min(cameraMaxX, p.x + viewOffsetX - viewWidth * .5));
    p.cameraY = Math.max(0, Math.min(cameraMax, p.y - H * .68));
    if (p.x + PLAYER_W > stage.portal - 32 && p.x < stage.portal + 34 && p.y + PLAYER_H >= stage.exitY - 18 && p.y < stage.exitY + 8) {
      if (state.nextLetter === 5) {
        state.transition = .9;
        say('PRIZE COMPLETE · TOWER CLEAR', .9);
      } else if (state.elapsed > (state.exitHintUntil || 0)) {
        say(`FIND ${expected} NEXT`, 1.15);
        state.exitHintUntil = state.elapsed + 1.3;
      }
    }
  }

  function fill(color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }

  function drawBackground(stage, camera) {
    const c = stage.colors;
    const startX = -viewOffsetX;
    fill(c.sky, startX, 0, viewWidth, H);
    // Soft machine-made city silhouettes sit outside the central room.
    const drift = camera * .16;
    for (let i = -1; i < Math.ceil(viewWidth / 74) + 2; i++) {
      const x = startX + i * 74 - (drift % 74);
      const height = 96 + ((i * 47 + levelIndex * 29 + 700) % 145);
      fill(i % 2 ? c.far : c.wall2, x, 307 - height, 58, height);
      fill('rgba(240,235,220,.36)', x + 7, 320 - height, 9, 14);
      fill('rgba(240,235,220,.29)', x + 31, 343 - height, 9, 14);
      fill(c.sky, x + 4, 307 - height, 4, height);
    }
    // Tall, tiled room wall like a forgotten indoor world.
    fill(c.wall, startX + 74, 34, viewWidth - 148, 398);
    fill(c.wall2, startX + 74, 34, viewWidth - 148, 12);
    for (let row = 0; row < 12; row++) {
      const y = 72 + row * 29;
      const offset = row % 2 ? 18 : 0;
      for (let x = startX + 78; x < startX + viewWidth - 74; x += 64) {
        fill('rgba(83,101,119,.12)', x + offset, y, 58, 2);
        fill('rgba(83,101,119,.12)', x + offset, y, 2, 27);
        if ((row * 7 + x + levelIndex * 3) % 5 === 0) fill(c.tile, x + offset + 10, y + 7, 16, 9);
      }
    }
    // Receding side columns and tiny wall lights.
    for (let x = startX + 78 - ((camera * .32) % 208); x < startX + viewWidth - 65; x += 208) {
      fill(c.stone, x, 72, 14, 344);
      fill(c.stoneDark, x + 12, 72, 4, 344);
      fill(c.light, x + 4, 108 + ((Math.floor(x / 208) + levelIndex) % 3) * 86, 5, 8);
    }
    fill('rgba(48,48,56,.15)', startX, 405, viewWidth, 25);
    fill('#69616f', startX, 432, viewWidth, H - 432);
    fill('rgba(232,230,219,.12)', startX, 432, viewWidth, 2);
  }

  function drawPlatform(platform, stage, index) {
    const c = stage.colors;
    fill(c.stoneDark, platform.x, platform.y, platform.w, H - platform.y);
    fill(c.stone, platform.x, platform.y + 5, platform.w, Math.min(25, H - platform.y - 5));
    fill(c.moss, platform.x, platform.y, platform.w, 6);
    for (let x = platform.x; x < platform.x + platform.w; x += 32) {
      fill('rgba(35,46,57,.3)', x, platform.y + 13, 1, Math.min(22, H - platform.y - 13));
      fill('rgba(225,226,209,.18)', x + 2, platform.y + 8, 17, 2);
      fill('rgba(38,52,61,.35)', x + 15 + ((Math.floor(x / 32) + index) % 2) * 7, platform.y + 19, 4, 3);
    }
    for (let x = platform.x + 7; x < platform.x + platform.w; x += 29) fill(c.moss, x, platform.y - 1, 4, 2);
  }

  function drawClimbBackground(stage, cameraY, cameraX) {
    const c = stage.colors;
    fill(c.sky, cameraX - viewOffsetX, 0, viewWidth, H);
    fill('#78818c', 0, 0, 72, H); fill('#77818a', W - 72, 0, 72, H);
    fill(c.wall, 72, 0, W - 144, H);
    fill(c.wall2, 72, 0, 12, H); fill(c.wall2, W - 84, 0, 12, H);
    for (let row = -1; row < 10; row++) {
      const y = row * 72 - ((cameraY * .38) % 72);
      fill('rgba(61,79,91,.15)', 84, y, W - 168, 2);
      fill('rgba(61,79,91,.11)', 84, y + 34, W - 168, 1);
      fill(c.stone, 104, y + 16, 20, 15); fill(c.stone, W - 124, y + 16, 20, 15);
      fill(c.light, 110, y + 20, 5, 5); fill(c.light, W - 119, y + 20, 5, 5);
    }
    fill('#536674', 147, 0, 5, H); fill('#536674', W - 152, 0, 5, H);
    fill('rgba(243,237,218,.22)', 150, 0, 2, H); fill('rgba(243,237,218,.22)', W - 149, 0, 2, H);
    fill('#435763', 70, 0, 4, H); fill('#435763', W - 74, 0, 4, H);
    // Small window slits make the shaft feel tall as it scrolls past.
    for (let band = -1; band < 5; band++) {
      const y = band * 236 - ((cameraY * .72) % 236) + 32;
      fill('#778a91', 18, y, 37, 86); fill('#c2c9bd', 22, y + 5, 29, 75);
      fill('#9faeaa', W - 55, y, 37, 86); fill('#c2c9bd', W - 51, y + 5, 29, 75);
      fill('#83969b', 35, y + 7, 3, 70); fill('#83969b', W - 38, y + 7, 3, 70);
    }
  }

  function drawClimbPlatform(platform, stage, index) {
    const c = stage.colors;
    fill('#34454e', platform.x, platform.y, platform.w, 28);
    fill(c.stone, platform.x, platform.y + 5, platform.w, 22);
    fill(platform.kind === 'spring' ? '#d39d67' : c.moss, platform.x, platform.y, platform.w, 6);
    for (let x = platform.x + 7; x < platform.x + platform.w; x += 31) {
      fill('rgba(35,46,57,.3)', x, platform.y + 12, 2, 15);
      fill('rgba(235,232,213,.2)', x + 4, platform.y + 8, 14, 2);
    }
    if (platform.kind === 'spring') {
      fill('#3f4749', platform.x + 10, platform.y + 7, platform.w - 20, 8);
      for (let x = platform.x + 18; x < platform.x + platform.w - 20; x += 24) {
        fill('#d6b879', x, platform.y + 8, 6, 11);
        fill('#586c70', x + 6, platform.y + 14, 7, 5);
      }
      fill('#f2d690', platform.x + 8, platform.y - 2, platform.w - 16, 3);
    }
  }

  function drawTowerLetter(letter, expected, time) {
    if (letter.collected) return;
    const bob = Math.round(Math.sin(time * 3 + letter.x) * 3);
    const x = Math.round(letter.x - 15);
    const y = Math.round(letter.y - 19 + bob);
    const active = letter.letter === expected;
    fill(active ? '#f0d182' : '#9b9d92', x - 3, y - 3, 36, 42);
    fill('#343941', x, y, 30, 36);
    fill(active ? '#e5c577' : '#bbc0b5', x + 3, y + 3, 24, 30);
    fill(active ? '#fff0c8' : '#d4d4c8', x + 6, y + 6, 18, 24);
    ctx.fillStyle = '#31353a'; ctx.font = 'bold 20px "Courier New",monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letter.letter, letter.x, y + 18);
  }

  function drawCheckpoint(checkpoint, time, active) {
    const x = checkpoint.x;
    const y = checkpoint.y;
    fill('#39464c', x + 3, y - 38, 4, 38);
    fill(active ? '#e5d08a' : '#879992', x + 7, y - 36, 20, 10);
    fill(active ? '#edf0d7' : '#b5bbb1', x + 7, y - 26, 15, 2);
    fill(active ? '#e6d18b' : '#77857e', x, y - 3, 13, 4);
    if (active) fill('#f7e3a0', x + 7, y - 34 + Math.round(Math.sin(time * 4) * 2), 4, 4);
  }

  function drawTowerHazard(hazard, time) {
    const box = hazardBox(hazard, time);
    if (hazard.kind === 'gear') {
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      fill('#4a3e43', box.x - 3, box.y - 3, box.w + 6, box.h + 6);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(time * 2.5 + hazard.phase);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 4); fill('#e08860', -5, -24, 10, 9); ctx.restore();
      }
      fill('#b9564d', -17, -17, 34, 34); fill('#e28c65', -12, -12, 24, 24);
      fill('#42454a', -5, -5, 10, 10); fill('#f0c77d', -2, -2, 4, 4);
      ctx.restore();
    } else {
      fill('#44525b', hazard.x - 4, hazard.railY - 72, 40, 5);
      fill('#44525b', hazard.x + 8, hazard.railY - 68, 16, 144);
      fill('#8a9796', hazard.x + 11, hazard.railY - 66, 10, 136);
      fill('#ba5a50', box.x - 3, box.y - 3, box.w + 6, box.h + 6);
      fill('#d47b5c', box.x, box.y, box.w, box.h);
      fill('#f0cc7c', box.x + 3, box.y + 4, box.w - 6, 5);
      fill('#4a4e52', box.x + 5, box.y + 13, box.w - 10, 5);
    }
  }

  function drawTowerPortal(stage, active, time) {
    const x = stage.portal;
    const y = stage.exitY;
    const glow = active ? stage.colors.portal : '#71828c';
    fill('#485862', x - 27, y - 78, 54, 82);
    fill('#aeb8b1', x - 21, y - 72, 42, 70);
    fill('#323b45', x - 14, y - 65, 28, 64);
    fill(active ? glow : '#64747e', x - 10, y - 60, 20, 54);
    fill(active ? '#fff0c8' : '#485761', x - 6, y - 53, 12, 39);
    fill('#485862', x - 30, y - 4, 60, 7);
    fill(active ? '#e9d48d' : '#798987', x - 18, y - 92, 36, 8);
    ctx.fillStyle = '#384147'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(active ? 'PRIZE' : 'LOCKED', x, y - 88);
    if (active) {
      const pulse = Math.floor(1 + (Math.sin(time * 4) + 1) * 2);
      fill(glow, x - 31 - pulse, y - 80, 4, 77); fill(glow, x + 28 + pulse, y - 80, 4, 77);
    }
  }

  function drawElevator(time) {
    const travelDuration = 5.55;
    const leftStart = 1.3;
    const leftEnd = leftStart + travelDuration;
    const rightStart = leftEnd + 2.1;
    const rightEnd = rightStart + travelDuration;
    const cycle = rightEnd + 3.2;
    const phase = time % cycle;
    let x, y;
    const bannerWidth = 240;
    const cabinWidth = 132;
    if (phase > leftStart && phase < leftEnd) {
      const progress = (phase - leftStart) / travelDuration;
      x = 64 - viewOffsetX; y = H + 92 - progress * (H + 190);
    } else if (phase > rightStart && phase < rightEnd) {
      const progress = (phase - rightStart) / travelDuration;
      x = viewWidth - 10 - (bannerWidth + cabinWidth) / 2 - viewOffsetX;
      y = -190 + progress * (H + 282);
    } else return;
    x = Math.round(x); y = Math.round(y);
    // Lift rails and an open cabin; the pass is deliberately in the foreground.
    fill('#353a43', x + 4, y - 45, 5, 124); fill('#353a43', x + 122, y - 45, 5, 124);
    fill('#9da8a5', x + 7, y - 43, 2, 118); fill('#9da8a5', x + 122, y - 43, 2, 118);
    fill('#303640', x, y, 132, 69); fill('#a8b2ad', x + 4, y + 4, 124, 59);
    fill('#424d55', x + 7, y + 7, 7, 51); fill('#424d55', x + 118, y + 7, 7, 51);
    fill('#c8cec3', x + 15, y + 7, 102, 5); fill('#728188', x + 16, y + 12, 100, 42);
    fill('#53616a', x + 16, y + 51, 100, 7); fill('#e1d8b9', x + 21, y + 55, 89, 3);
    // White-coated pixel technician inside the open lift.
    fill('#493b35', x + 55, y + 13, 19, 16); fill('#d1a77e', x + 58, y + 16, 14, 13);
    fill('#383a3b', x + 54, y + 12, 20, 6); fill('#292d32', x + 60, y + 22, 3, 2); fill('#292d32', x + 68, y + 22, 3, 2);
    fill('#eeeae0', x + 51, y + 29, 27, 24); fill('#fffdf3', x + 56, y + 31, 17, 20);
    fill('#c5d0ca', x + 62, y + 32, 5, 9); fill('#f0c978', x + 63, y + 34, 3, 3);
    fill('#e8e6de', x + 45, y + 34, 8, 6); fill('#e8e6de', x + 77, y + 34, 8, 6);
    fill('#41484e', x + 55, y + 52, 8, 7); fill('#41484e', x + 68, y + 52, 8, 7);
    // The banner is fixed to the bottom of the moving cabin.
    fill('#343940', x + 14, y + 69, 3, 10); fill('#343940', x + 114, y + 69, 3, 10);
    const bannerX = x - (bannerWidth - cabinWidth) / 2;
    fill('#373a42', bannerX, y + 77, bannerWidth, 40);
    fill('#e4c475', bannerX + 4, y + 81, bannerWidth - 8, 32);
    ctx.fillStyle = '#353840'; ctx.font = 'bold 21px Arial,Helvetica,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('YOUR BRAND IN PLAY', x + cabinWidth / 2, y + 97, bannerWidth - 18);
  }

  function drawMachine(unit, stage, time, near) {
    const c = stage.colors;
    const x = Math.round(unit.x - 21);
    const y = Math.round(unit.baseY - 72);
    const accent = unit.active ? c.portal : unit.kind === 'terminal' ? '#d49c7c' : '#e0bd77';
    if (unit.active) {
      ctx.globalAlpha = .12 + Math.sin(time * 6 + unit.x) * .035;
      fill(accent, x - 9, y - 8, 60, 84);
      ctx.globalAlpha = 1;
    }
    fill('#343b46', x - 3, y + 4, 48, 68);
    fill('#8a969b', x, y, 42, 67);
    fill('#abb5b2', x, y, 42, 5);
    fill(unit.active ? accent : '#526879', x + 4, y + 7, 34, 31);
    fill('#272f37', x + 7, y + 10, 28, 24);
    fill(unit.active ? '#84e1cd' : '#697c88', x + 10, y + 12, 22, 17);
    fill('rgba(236,239,219,.65)', x + 12, y + 14, 4, 3);
    if (unit.kind === 'vending') {
      fill('#d5b97e', x + 8, y + 42, 26, 14);
      fill('#38424b', x + 11, y + 45, 20, 8);
      fill(accent, x + 14, y + 47, 6, 4);
      fill('#dce2d8', x + 35, y + 17, 2, 12);
    } else if (unit.kind === 'relay') {
      fill('#3e4850', x + 7, y + 43, 28, 12);
      fill(accent, x + 10, y + 46, 5, 5); fill('#536c76', x + 18, y + 46, 5, 5); fill(accent, x + 26, y + 46, 5, 5);
    } else {
      fill('#39424a', x + 7, y + 42, 27, 15);
      fill('#e2d3ad', x + 10, y + 45, 21, 2); fill('#a6b4ab', x + 10, y + 50, 13, 2);
    }
    fill('#48525a', x + 6, y + 61, 7, 8); fill('#48525a', x + 29, y + 61, 7, 8);
    fill(accent, x + 36, y + 8, 3, 3);
    if (near && !unit.active) {
      fill('#f3f0e7', x + 13, y - 24, 17, 16);
      fill('#25272b', x + 14, y - 23, 15, 14);
      ctx.fillStyle = '#f3f0e7'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('E', x + 21, y - 16);
    }
    if (unit.active) {
      fill(accent, x + 18, y - 7 + Math.sin(time * 3 + x) * 2, 6, 4);
    }
  }

  function drawPortal(stage, active, time) {
    const x = stage.portal;
    const c = stage.colors;
    const glow = active ? c.portal : '#81919b';
    fill('#475460', x - 23, 344, 48, 77);
    fill('#a6b0ab', x - 18, 350, 38, 66);
    fill('#313844', x - 12, 355, 26, 60);
    fill(active ? glow : '#667682', x - 9, 359, 20, 52);
    fill(active ? '#d1f2db' : '#53626e', x - 5, 365, 12, 35);
    fill('#4a5660', x - 22, 414, 46, 7);
    if (active) {
      const pulse = Math.floor(2 + (Math.sin(time * 4) + 1) * 2);
      fill(glow, x - 26 - pulse, 340 - pulse, 4, 82 + pulse * 2);
      fill(glow, x + 25 + pulse, 340 - pulse, 4, 82 + pulse * 2);
      fill(glow, x - 24, 336 - pulse, 50, 4);
    }
  }

  function drawPlayer(p, time) {
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    const step = p.grounded ? Math.sin(p.walk) > 0 ? 2 : 0 : 1;
    fill('rgba(30,34,39,.3)', x - 4, y + PLAYER_H, 29, 4);
    // Small white hooded hopper, drawn from original pixel blocks.
    fill('#e5e4dc', x + 5, y + 1, 12, 5);
    fill('#f5f4ec', x + 3, y + 5, 16, 10);
    fill('#c8d0cc', x + 1, y + 10, 19, 11);
    fill('#f1efe7', x + 4, y + 16, 15, 9);
    fill('#53616a', x + (p.facing > 0 ? 12 : 5), y + 8, 3, 4);
    fill('#20252a', x + (p.facing > 0 ? 13 : 6), y + 9, 1, 2);
    fill('#b9c2bd', x + 8, y + 21, 8, 3);
    if (step) {
      fill('#424a51', x + 4, y + 25, 5, 5);
      fill('#424a51', x + 14, y + 24, 5, 6);
    } else {
      fill('#424a51', x + 3, y + 25, 6, 5);
      fill('#424a51', x + 14, y + 25, 6, 5);
    }
    fill('#fffef3', x + 2, y + 7, 2, 4);
    if (nearbyUnit()) {
      fill('#e2d09a', x + 8, y - 8 - Math.round((Math.sin(time * 5) + 1) * 2), 6, 5);
    }
  }

  function draw() {
    if (!ctx || !state) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    ctx.setTransform(gameScale, 0, 0, gameScale, viewOffsetX * gameScale, 0);
    ctx.imageSmoothingEnabled = false;
    const stage = stages[levelIndex];
    const p = state.player;
    if (stage.type === 'climb') {
      const cameraY = Math.round(p.cameraY || 0);
      const cameraX = Math.round(p.camera || 0);
      ctx.save();
      ctx.translate(-cameraX, 0);
      drawClimbBackground(stage, cameraY, cameraX);
      ctx.restore();
      ctx.save();
      ctx.translate(-cameraX, -cameraY);
      stage.platforms.forEach(platform => drawClimbPlatform(platform, stage));
      stage.checkpoints.forEach(checkpoint => drawCheckpoint(checkpoint, state.elapsed, state.checkpoint.y === checkpoint.y));
      const near = nearbyUnit();
      state.units.forEach(unit => drawMachine(unit, stage, state.elapsed, unit === near));
      state.letters.forEach(letter => drawTowerLetter(letter, 'PRIZE'[state.nextLetter], state.elapsed));
      stage.hazards.forEach(hazard => drawTowerHazard(hazard, state.elapsed));
      drawTowerPortal(stage, state.nextLetter === 5, state.elapsed);
      if (state.invulnerable <= 0 || Math.floor(state.elapsed * 18) % 2 === 0) drawPlayer(p, state.elapsed);
      ctx.restore();
      drawElevator(state.elapsed);
      updateHud();
      return;
    }
    const camera = Math.round(p.camera || 0);
    drawBackground(stage, camera);
    ctx.save();
    ctx.translate(-camera, 0);
    stage.platforms.forEach((platform, index) => drawPlatform(platform, stage, index));
    drawPortal(stage, state.units.every(unit => unit.active), state.elapsed);
    const near = nearbyUnit();
    state.units.forEach(unit => drawMachine(unit, stage, state.elapsed, unit === near));
    // Little wall-mounted navigation markers add life without hiding the route.
    for (let i = 0; i < 5; i++) {
      const markerX = 95 + i * 310;
      if (markerX < stage.width) {
        fill('#747c83', markerX, 206 + (i % 2) * 17, 24, 13);
        fill('#d3c99f', markerX + 4, 210 + (i % 2) * 17, 4, 4);
        fill('#86948c', markerX + 12, 210 + (i % 2) * 17, 9, 4);
      }
    }
    drawPlayer(p, state.elapsed);
    ctx.restore();
    updateHud();
  }

  function loop(now) {
    if (!state?.live) { animation = 0; return; }
    const dt = Math.min(.034, Math.max(0, (now - previous) / 1000));
    previous = now;
    update(dt);
    draw();
    if (state?.live) animation = requestAnimationFrame(loop);
  }

  function normalizeKey(key) { return key.length === 1 ? key.toLowerCase() : key.toLowerCase(); }

  window.addEventListener('keydown', event => {
    const key = normalizeKey(event.key);
    if (['arrowleft', 'arrowright', 'arrowup', ' ', 'w', 'a', 'd', 'e'].includes(key)) event.preventDefault();
    keys.add(key);
    if ((key === ' ' || key === 'arrowup' || key === 'w') && !event.repeat) jump();
    if (key === 'e' && !event.repeat) activateUnit();
  });
  window.addEventListener('keyup', event => keys.delete(normalizeKey(event.key)));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', () => canvas.focus({ preventScroll: true }));

  function bindHold(selector, name) {
    const button = app.querySelector(selector);
    if (!button) return;
    const start = event => { event.preventDefault(); held.add(name); button.classList.add('is-held'); if (name === 'jump') jump(); if (name === 'activate') activateUnit(); };
    const end = event => { event.preventDefault(); held.delete(name); button.classList.remove('is-held'); };
    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', end);
    button.addEventListener('pointercancel', end);
    button.addEventListener('lostpointercapture', end);
    button.addEventListener('contextmenu', event => event.preventDefault());
  }

  bindHold('[data-left]', 'left');
  bindHold('[data-right]', 'right');
  bindHold('[data-jump]', 'jump');
  bindHold('[data-activate]', 'activate');
  app.querySelector('[data-reset]')?.addEventListener('click', resetRoute);
  app.querySelector('[data-reset-result]')?.addEventListener('click', resetRoute);
  window.addEventListener('resize', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(canvas);

  state = { player: freshPlayer(), units: [], elapsed: 0, transition: 0, live: true };
  loadLevel(0);
  fit();
  previous = performance.now();
  animation = requestAnimationFrame(loop);
})();
