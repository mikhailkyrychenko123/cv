(() => {
  'use strict';
  const W = 960, H = 600, PLAYER_Y = H - 150, COUPON = 'LEMMING10';
  const $ = id => document.getElementById(id);
  const mount = $('vs-game');
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  canvas.setAttribute('aria-label', 'Void Striker space shooter');
  mount.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) { $('vs-error').hidden = false; return; }

  const waves = [
    { name: 'Outer watch', count: 5 },
    { name: 'Red belt', count: 6 },
    { name: 'Drift field', count: 7 },
    { name: 'Escort route', count: 8 },
    { name: 'Command ship', count: 5, boss: true },
  ];
  const enemyPools = [
    ['drone'],
    ['drone','fighter'],
    ['drone','fighter','twin'],
    ['drone','fighter','bomber','twin'],
    ['fighter','bomber','twin','drone'],
  ];
  const weapons = [
    { name: 'PULSE', cooldown: 210, speed: 560, damage: 2, spread: 0 },
    { name: 'SPREAD', cooldown: 360, speed: 485, damage: 1, spread: 0.2 },
    { name: 'LASER', cooldown: 105, speed: 725, damage: 1, spread: 0 },
  ];
  const keys = new Set(), touch = { left: false, right: false, fire: false };
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.6,
    speed: 20 + Math.random() * 62, alpha: 0.25 + Math.random() * 0.5
  }));
  const game = {
    mode: 'ready', lives: 4, score: 0, kills: 0, sector: 0, weapon: 0,
    player: { x: W / 2, y: PLAYER_Y, vx: 0, vy: 0, angle: 0, invuln: 0, shield: 0, r: 17 },
    enemies: [], shots: [], hostile: [], pickups: [], sparks: [], queue: [], spawnIn: 0,
    clearIn: 0, fireIn: 0, pickupIn: 6, aim: { x: W / 2, y: 100 }, firing: false,
    overdrive: 0,
    brandX: -220, brandTimer: 2, brandActive: false, lastFrame: 0,
    announcementTimer: 0, hudTimer: 0
  };

  function fitCanvas() {
    const rect = mount.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = Math.min(rect.width / W, rect.height / H);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * ratio));
    canvas.height = Math.max(1, Math.round(H * ratio));
    canvas.style.width = Math.floor(W * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  fitCanvas();
  if ('ResizeObserver' in window) new ResizeObserver(fitCanvas).observe(mount);
  else window.addEventListener('resize', fitCanvas);

  function hud() {
    $('vs-level').textContent = String(game.sector + 1).padStart(2, '0') + ' / 05';
    $('vs-kills').textContent = String(game.kills).padStart(2, '0');
    $('vs-hull').textContent = game.lives
      ? ('♥ '.repeat(game.lives) + '· '.repeat(4 - game.lives)).trim()
      : '— — — —';
    $('vs-weapon').textContent = game.overdrive > 0 ? 'OVERDRIVE' : weapons[game.weapon].name;
    $('vs-score').textContent = String(game.score).padStart(6, '0');
    $('vs-final-score').textContent = String(game.score).padStart(6, '0');
  }

  function announce() {
    const panel = $('vs-announcement'), wave = waves[game.sector];
    panel.querySelector('span').textContent = 'SECTOR 0' + (game.sector + 1);
    panel.querySelector('strong').textContent = wave.name;
    panel.querySelector('small').textContent = wave.boss ? 'Command signature confirmed' : 'Incoming signatures detected';
    panel.hidden = false;
    panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
    clearTimeout(game.announcementTimer);
    game.announcementTimer = setTimeout(() => { panel.hidden = true; }, 1800);
  }

  function clearEntities() {
    game.enemies.length = 0; game.shots.length = 0; game.pickups.length = 0;
    game.hostile.length = 0; game.sparks.length = 0; game.queue.length = 0;
  }
  function startWave(index) {
    game.sector = index;
    const wave = waves[index];
    const pool = enemyPools[index];
    game.queue = Array.from({ length: wave.count }, (_, i) =>
      wave.boss && i === wave.count - 1 ? 'boss' : pool[i % pool.length]);
    game.spawnIn = 0.35; game.clearIn = 0;
    game.hostile.length = 0;
    announce(); hud();
  }
  function restart() {
    clearTimeout(game.announcementTimer);
    clearEntities();
    game.mode = 'playing'; game.lives = 4; game.score = 0; game.kills = 0; game.weapon = 0;
    game.fireIn = 0; game.overdrive = 0; game.pickupIn = 4.5 + Math.random() * 2.5;
    game.brandX = -220; game.brandTimer = 2; game.brandActive = false;
    game.player = { x: W / 2, y: PLAYER_Y, vx: 0, vy: 0, angle: 0, invuln: 0, shield: 0, r: 17 };
    game.aim = { x: W / 2, y: 100 };
    game.firing = false; game.clearIn = 0;
    keys.clear(); touch.left = touch.right = touch.fire = false;
    $('vs-start').hidden = true; $('vs-pause-screen').hidden = true; $('vs-result').hidden = true;
    $('vs-coupon').hidden = true; $('vs-copy-status').textContent = '';
    $('vs-pause').setAttribute('aria-pressed', 'false');
    startWave(0);
  }
  function finish(won) {
    if (game.mode === 'over') return;
    game.mode = 'over';
    game.player.x = W / 2; game.player.y = H - 55;
    game.player.vx = game.player.vy = 0; game.player.angle = 0; game.player.invuln = 0;
    game.firing = false; keys.clear();
    $('vs-result').hidden = false;
    $('vs-coupon').hidden = !won;
    $('vs-copy-status').textContent = won ? 'Copy the code for checkout.' : '';
    $('vs-result-kicker').textContent = won ? 'MISSION COMPLETE' : 'SHIP LOST';
    $('vs-result-title').textContent = won ? 'The void is quiet.' : 'Lost in the dark.';
    $('vs-result-copy').textContent = won
      ? 'Five sectors cleared. Your ship and crew made it home.'
      : 'Run ended after ' + game.kills + ' threats. The flight deck is ready.';
    $('vs-pause').setAttribute('aria-pressed', 'false');
  }
  function pause(force) {
    if (game.mode === 'ready' || game.mode === 'over') return;
    const next = force === undefined ? game.mode !== 'paused' : force;
    if (next && game.mode === 'playing') {
      game.mode = 'paused'; $('vs-pause-screen').hidden = false;
      $('vs-pause').setAttribute('aria-pressed', 'true');
    } else if (!next && game.mode === 'paused') {
      game.mode = 'playing'; $('vs-pause-screen').hidden = true;
      $('vs-pause').setAttribute('aria-pressed', 'false');
    }
  }

  function spawnEnemy(type) {
    const stats = {
      drone: { r:16, hp:2, speed:69, score:100, color:'#ff638c' },
      fighter: { r:19, hp:4, speed:56, score:220, color:'#ffad63' },
      bomber: { r:24, hp:7, speed:39, score:360, color:'#b58aff' },
      twin: { r:18, hp:3, speed:78, score:260, color:'#58d5f5' },
      boss: { r:46, hp:35, speed:28, score:4200, color:'#ff65ad' },
    }[type];
    const boss = type === 'boss';
    game.enemies.push({
      type, x: boss ? W / 2 : 75 + Math.random() * (W - 150),
      y: boss ? -70 : -30, baseX: 0, r:stats.r, hp:stats.hp, maxHp:stats.hp,
      speed:stats.speed, score:stats.score, color:stats.color,
      phase: Math.random() * 7, age: 0, shootIn: 1.3 + Math.random() * 1.7
    });
    const enemy = game.enemies[game.enemies.length - 1]; enemy.baseX = enemy.x;
  }
  function shoot(x, y, angle, speed, owner, damage, color) {
    (owner === 'player' ? game.shots : game.hostile).push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: owner === 'player' ? 5 : 7, damage: damage || 1,
      color: color || (owner === 'player' ? '#c4fff6' : '#ff86b5')
    });
  }
  function fire(now) {
    if (game.fireIn > 0) return;
    const gun = weapons[game.weapon], p = game.player;
    const boosted = game.overdrive > 0;
    game.fireIn = gun.cooldown * (boosted ? 0.72 : 1) / 1000;
    const angle = Math.atan2(game.aim.y - p.y, game.aim.x - p.x);
    const spread = boosted ? Math.max(gun.spread,0.18) : gun.spread;
    const offsets = spread ? [-spread,0,spread] : [0];
    offsets.forEach(offset => shoot(
      p.x + Math.cos(angle) * 20, p.y + Math.sin(angle) * 20,
      angle + offset, gun.speed, 'player', gun.damage, boosted ? '#ffd36b' : undefined
    ));
  }
  function burst(x, y, color) {
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 145;
      game.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.25, color });
    }
  }
  function hitPlayer(now) {
    const p = game.player;
    if (game.mode !== 'playing') return;
    if (p.shield > 0) {
      p.shield = Math.max(0,p.shield - 1.35);
      burst(p.x,p.y,'#59e7ff'); game.hostile.length = 0;
      return;
    }
    if (p.invuln > 0) return;
    game.lives--; p.invuln = 1.55;
    burst(p.x, p.y, '#ff866d');
    p.x = W / 2; p.y = PLAYER_Y; p.vx = p.vy = 0;
    game.hostile.length = 0;
    hud();
    if (game.lives <= 0) finish(false);
  }
  function removeEnemy(index, award) {
    const e = game.enemies[index]; if (!e) return;
    const x = e.x, y = e.y;
    burst(x,y,e.color);
    game.enemies.splice(index, 1);
    if (award) {
      game.kills++; game.score += e.score;
      if (Math.random() < 0.26) spawnPickup(x,y,Math.random() < 0.52 ? 'shield' : 'overdrive');
      hud();
    }
  }

  function spawnPickup(x,y,type) {
    game.pickups.push({ x,y,type,age:0,r:14,sway:Math.random()*Math.PI*2 });
  }

  function collectPickup(item) {
    const p = game.player;
    if (item.type === 'shield') {
      p.shield = Math.max(p.shield,9);
      announcePower('SHIELD ONLINE','Absorbs incoming hits for 9 seconds');
      burst(item.x,item.y,'#59e7ff');
    } else {
      game.overdrive = Math.max(game.overdrive,10);
      announcePower('FIRE OVERDRIVE','Triple shots · faster fire · 10 seconds');
      burst(item.x,item.y,'#ffd36b');
    }
    game.score += 50; hud();
  }

  function announcePower(title,description) {
    const panel = $('vs-announcement');
    panel.querySelector('span').textContent = 'SUPPLY RECOVERED';
    panel.querySelector('strong').textContent = title;
    panel.querySelector('small').textContent = description;
    panel.hidden = false; panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = '';
    clearTimeout(game.announcementTimer);
    game.announcementTimer = setTimeout(() => { panel.hidden = true; },1800);
  }

  function update(dt) {
    if (game.mode !== 'playing') return;
    const p = game.player;
    p.invuln = Math.max(0, p.invuln - dt);
    p.shield = Math.max(0,p.shield - dt);
    const hadOverdrive = game.overdrive > 0;
    game.overdrive = Math.max(0,game.overdrive - dt);
    if (hadOverdrive && game.overdrive === 0) hud();
    game.fireIn = Math.max(0, game.fireIn - dt);
    game.pickupIn -= dt;
    if (game.pickupIn <= 0) {
      spawnPickup(70 + Math.random() * (W - 140),-18,Math.random() < 0.5 ? 'shield' : 'overdrive');
      game.pickupIn = 9 + Math.random() * 6;
    }
    const left = keys.has('KeyA') || keys.has('ArrowLeft') || touch.left;
    const right = keys.has('KeyD') || keys.has('ArrowRight') || touch.right;
    const up = keys.has('KeyW') || keys.has('ArrowUp');
    const down = keys.has('KeyS') || keys.has('ArrowDown');
    let dx = Number(right) - Number(left), dy = Number(down) - Number(up);
    const norm = Math.hypot(dx, dy) || 1;
    dx /= norm; dy /= norm;
    const targetX = dx * 280, targetY = dy * 280;
    const ease = 1 - Math.exp(-dt / (dx || dy ? 0.16 : 0.24));
    p.vx += (targetX - p.vx) * ease; p.vy += (targetY - p.vy) * ease;
    p.x = Math.max(25, Math.min(W - 25, p.x + p.vx * dt));
    p.y = Math.max(32, Math.min(H - 26, p.y + p.vy * dt));
    p.angle = Math.atan2(game.aim.y - p.y, game.aim.x - p.x) + Math.PI / 2;
    if (keys.has('Space') || game.firing || touch.fire) fire();

    game.spawnIn -= dt;
    if (game.queue.length && game.spawnIn <= 0) {
      spawnEnemy(game.queue.shift()); game.spawnIn = 0.9 + Math.random() * 0.35;
    }
    for (let i = game.enemies.length - 1; i >= 0; i--) {
      const e = game.enemies[i]; e.age += dt; e.shootIn -= dt;
      if (e.type === 'boss') {
        e.x += (W / 2 + Math.sin(e.age * 0.83) * 220 - e.x) * Math.min(1, dt * 1.55);
        e.y += (100 - e.y) * Math.min(1, dt);
      } else {
        e.x = e.baseX + Math.sin(e.age * (e.type === 'fighter' ? 1.65 : 1.22) + e.phase) * 38;
        e.y += e.speed * dt;
      }
      if (e.shootIn <= 0 && e.y > 10) {
        const a = Math.atan2(p.y - e.y, p.x - e.x);
        const speed = e.type === 'boss' ? 185 : e.type === 'twin' ? 172 : 158;
        if (e.type === 'twin' || e.type === 'bomber') {
          const offset = e.r * 0.42;
          shoot(e.x - offset,e.y + e.r * 0.5,a - 0.045,speed,'enemy',1,e.color);
          shoot(e.x + offset,e.y + e.r * 0.5,a + 0.045,speed,'enemy',1,e.color);
        } else shoot(e.x,e.y + e.r * 0.6,a,speed,'enemy',1,e.color);
        e.shootIn = e.type === 'boss' ? 1.15 : (e.type === 'twin' || e.type === 'bomber') ? 2.15 + Math.random() * 0.6 : 2.4 + Math.random() * 0.7;
      }
      if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < (e.r + p.r) ** 2) {
        removeEnemy(i, false); hitPlayer(performance.now());
        if (game.mode !== 'playing') return;
      } else if (e.y > H + 60) game.enemies.splice(i, 1);
    }

    for (let i = game.shots.length - 1; i >= 0; i--) {
      const b = game.shots[i]; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { game.shots.splice(i, 1); continue; }
      for (let j = game.enemies.length - 1; j >= 0; j--) {
        const e = game.enemies[j];
        if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < (b.r + e.r) ** 2) {
          e.hp -= b.damage; game.shots.splice(i, 1);
          if (e.hp <= 0) removeEnemy(j, true);
          break;
        }
      }
    }
    for (let i = game.hostile.length - 1; i >= 0; i--) {
      const b = game.hostile[i]; b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { game.hostile.splice(i, 1); continue; }
      if (p.invuln <= 0 && (b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (b.r + p.r) ** 2) {
        game.hostile.splice(i, 1); hitPlayer(performance.now());
        if (game.mode !== 'playing') return;
        break;
      }
    }
    for (let i = game.pickups.length - 1; i >= 0; i--) {
      const item = game.pickups[i];
      item.age += dt; item.y += 48 * dt;
      item.x += Math.sin(item.age * 2.2 + item.sway) * 18 * dt;
      if ((item.x - p.x) ** 2 + (item.y - p.y) ** 2 < (item.r + p.r + 4) ** 2) {
        game.pickups.splice(i,1); collectPickup(item);
      } else if (item.y > H + 24) game.pickups.splice(i,1);
    }
    for (let i = game.sparks.length - 1; i >= 0; i--) {
      const s = game.sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (s.life <= 0) game.sparks.splice(i, 1);
    }
    if (game.mode !== 'playing') return;
    if (!game.queue.length && !game.enemies.length) {
      game.clearIn += dt;
      if (game.clearIn > 0.8) {
        if (game.sector < 4) startWave(game.sector + 1);
        else finish(true);
      }
    }
  }

  function polygon(points, fill, stroke) {
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function drawShip(x, y, angle, player, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    if (player) ctx.scale(1.28, 1.28);
    ctx.shadowBlur = player ? 20 : 12; ctx.shadowColor = player ? '#54f2dc' : '#ff638c';
    if (player) {
      polygon([[0,-22],[-15,15],[-5,10],[0,14],[5,10],[15,15]], '#173a60', '#57f3df');
      polygon([[0,-17],[-6,9],[0,6],[6,9]], '#d9fff8');
      polygon([[-5,14],[0,24],[5,14]], '#ffab70');
    } else {
      polygon([[0,-18],[15,-3],[10,14],[0,17],[-10,14],[-15,-3]], '#ff638c', '#ffb4ca');
      ctx.fillStyle = '#220f27'; ctx.fillRect(-6,-3,12,5);
      ctx.fillStyle = '#ffe2ec'; ctx.fillRect(-2,-2,4,2);
    }
    ctx.restore();
  }
  function drawEnemy(e) {
    ctx.save(); ctx.translate(e.x,e.y);
    ctx.rotate(Math.PI + Math.sin(e.age * 1.6 + e.phase) * 0.08);
    ctx.shadowBlur = 16; ctx.shadowColor = e.color;
    if (e.type === 'drone') {
      polygon([[0,-17],[14,-5],[11,10],[0,16],[-11,10],[-14,-5]],'#672b4e',e.color);
      polygon([[0,-12],[9,-4],[7,7],[0,11],[-7,7],[-9,-4]],e.color,'#ffd4e2');
      ctx.fillStyle = '#271023'; ctx.fillRect(-5,-3,10,5);
    } else if (e.type === 'fighter') {
      polygon([[0,-21],[7,-3],[22,8],[9,7],[0,17],[-9,7],[-22,8],[-7,-3]],'#70412f',e.color);
      polygon([[0,-17],[5,-2],[15,5],[5,5],[0,11],[-5,5],[-15,5],[-5,-2]],e.color,'#ffe5c7');
      ctx.fillStyle = '#fff1d7'; ctx.fillRect(-2,-7,4,11);
    } else if (e.type === 'bomber') {
      polygon([[0,-24],[17,-15],[23,-2],[17,16],[0,22],[-17,16],[-23,-2],[-17,-15]],'#49356b',e.color);
      polygon([[0,-17],[12,-10],[16,0],[10,12],[0,16],[-10,12],[-16,0],[-12,-10]],e.color,'#eee2ff');
      ctx.fillStyle = '#261c3e'; ctx.fillRect(-11,-2,22,7);
      ctx.fillStyle = '#ffe4a5'; ctx.fillRect(-7,0,5,3); ctx.fillRect(2,0,5,3);
    } else {
      polygon([[-13,-17],[-4,-7],[-3,14],[-17,8]],'#28536c',e.color);
      polygon([[13,-17],[4,-7],[3,14],[17,8]],'#28536c',e.color);
      polygon([[0,-20],[9,-4],[7,12],[0,18],[-7,12],[-9,-4]],e.color,'#d9fbff');
      ctx.fillStyle = '#133343'; ctx.fillRect(-4,-5,8,7);
      ctx.fillStyle = '#e7ffff'; ctx.fillRect(-2,-4,4,3);
    }
    ctx.restore();
  }
  function drawPickup(item) {
    const pulse = 1 + Math.sin(item.age * 5) * 0.12;
    const color = item.type === 'shield' ? '#59e7ff' : '#ffd36b';
    ctx.save(); ctx.translate(item.x,item.y); ctx.rotate(item.age * 0.8); ctx.scale(pulse,pulse);
    ctx.shadowBlur = 20; ctx.shadowColor = color;
    ctx.fillStyle = 'rgba(8,18,39,.88)'; ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0,0,15,0,Math.PI*2); ctx.fill(); ctx.stroke();
    if (item.type === 'shield') {
      polygon([[0,-11],[9,-7],[7,2],[0,10],[-7,2],[-9,-7]],'#1c7186','#b5f7ff');
      ctx.fillStyle = '#eaffff'; ctx.fillRect(-2,-5,4,8);
    } else {
      polygon([[-2,-11],[7,-2],[2,-1],[4,9],[-7,0],[-2,-1]],'#ffd36b','#fff2bd');
    }
    ctx.restore();
  }
  function drawPowerStatus() {
    let y = 24;
    const rows = [];
    if (game.overdrive > 0) rows.push(['OVERDRIVE  ' + Math.ceil(game.overdrive) + 's','#ffd36b']);
    if (game.player.shield > 0) rows.push(['SHIELD  ' + Math.ceil(game.player.shield) + 's','#59e7ff']);
    for (const [label,color] of rows) {
      ctx.fillStyle = 'rgba(5,12,29,.82)'; ctx.fillRect(14,y - 12,132,19);
      ctx.fillStyle = color; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'left'; ctx.fillText(label,21,y + 1);
      y += 23;
    }
  }
  function drawBoss(e) {
    ctx.save(); ctx.translate(e.x, e.y); ctx.shadowBlur = 24; ctx.shadowColor = '#ff55a7';
    polygon([[0,-48],[22,-25],[50,-20],[34,-3],[43,22],[16,15],[9,43],[0,27],[-9,43],[-16,15],[-43,22],[-34,-3],[-50,-20],[-22,-25]], '#a63883', '#ff75b8');
    polygon([[0,-29],[-15,-2],[0,12],[15,-2]], '#ff83bd');
    ctx.fillStyle = '#ffdbef'; ctx.fillRect(-10,-9,20,6);
    ctx.shadowBlur = 0; ctx.fillStyle = '#172340'; ctx.fillRect(-42,-61,84,7);
    ctx.fillStyle = '#ff65ad'; ctx.fillRect(-41,-60,82 * Math.max(0,e.hp/e.maxHp),5);
    ctx.restore();
  }
  function drawCarrier() {
    const x = game.brandX, y = 165 + Math.sin(performance.now() * 0.0011) * 8;
    ctx.save(); ctx.translate(x, y);
    polygon([[-275,-19],[-76,-16],[-49,0],[-76,16],[-275,19]], '#122b49', '#e8c275');
    ctx.fillStyle = '#f7e5bd'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'center'; ctx.fillText('YOUR BRAND IN ORBIT', -170, -1);
    ctx.fillStyle = '#82dcd2'; ctx.font = 'bold 7px Arial'; ctx.fillText('MAKE YOUR MARK ACROSS THE GALAXY', -170, 10);
    ctx.shadowBlur = 16; ctx.shadowColor = '#e5b96c';
    polygon([[-55,-26],[-23,-33],[23,-28],[63,-12],[83,0],[63,12],[23,28],[-23,33],[-55,25],[-38,0]], '#d6ad67', '#ffe5ae');
    ctx.fillStyle = '#253e5a'; ctx.fillRect(-23,-13,38,13);
    ctx.fillStyle = '#8ee9e1'; ctx.fillRect(-17,-10,7,6); ctx.fillRect(-6,-10,7,6); ctx.fillRect(5,-10,7,6);
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#080d20'; ctx.fillRect(0, 0, W, H);
    const now = performance.now();
    ctx.fillStyle = 'rgba(42,70,145,.045)'; ctx.beginPath(); ctx.arc(240,270,230,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(12,102,129,.045)'; ctx.beginPath(); ctx.arc(770,355,290,0,Math.PI*2); ctx.fill();
    for (const s of stars) {
      ctx.globalAlpha = s.alpha; ctx.fillStyle = '#a9caff'; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (game.brandActive) drawCarrier();
    for (const e of game.enemies) {
      if (e.type === 'boss') drawBoss(e);
      else {
        ctx.globalAlpha = 0.18; ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(e.x,e.y,e.r+8,0,Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
        drawEnemy(e);
      }
    }
    for (const item of game.pickups) drawPickup(item);
    for (const b of game.shots) {
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);
      ctx.shadowBlur = 11; ctx.shadowColor = b.color; ctx.fillStyle = b.color; ctx.fillRect(-3,-9,6,18); ctx.restore();
    }
    for (const b of game.hostile) {
      ctx.shadowBlur = 10; ctx.shadowColor = b.color; ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r * 0.72,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    }
    for (const s of game.sparks) {
      ctx.globalAlpha = Math.max(0,s.life*2); ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(s.x,s.y,2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const p = game.player;
    if (game.mode !== 'ready') {
      const alpha = game.mode === 'playing' && p.invuln > 0 && Math.floor(now / 90) % 2 ? 0.72 : 1;
      if (p.shield > 0) {
        ctx.save(); ctx.globalAlpha = 0.52 + Math.sin(now * 0.008) * 0.12;
        ctx.strokeStyle = '#59e7ff'; ctx.lineWidth = 2; ctx.shadowBlur = 18; ctx.shadowColor = '#59e7ff';
        ctx.beginPath(); ctx.arc(p.x,p.y,36 + Math.sin(now * 0.005) * 2,0,Math.PI*2); ctx.stroke(); ctx.restore();
      }
      drawShip(p.x,p.y,p.angle,true,alpha);
      drawPowerStatus();
      if (game.mode === 'playing') {
        ctx.strokeStyle = 'rgba(84,242,220,.6)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(game.aim.x,game.aim.y,9,0,Math.PI*2);
        ctx.moveTo(game.aim.x-14,game.aim.y); ctx.lineTo(game.aim.x-5,game.aim.y);
        ctx.moveTo(game.aim.x+5,game.aim.y); ctx.lineTo(game.aim.x+14,game.aim.y);
        ctx.moveTo(game.aim.x,game.aim.y-14); ctx.lineTo(game.aim.x,game.aim.y-5);
        ctx.moveTo(game.aim.x,game.aim.y+5); ctx.lineTo(game.aim.x,game.aim.y+14); ctx.stroke();
      }
    }
    ctx.strokeStyle = '#344c72'; ctx.strokeRect(.5,.5,W-1,H-1);
  }

  function frame(t) {
    const dt = game.lastFrame ? Math.min((t - game.lastFrame) / 1000, 0.04) : 0;
    game.lastFrame = t;
    if (game.mode === 'playing') update(dt);
    for (const star of stars) {
      star.y += star.speed * dt * (game.mode === 'paused' ? 0.15 : 1);
      if (star.y > H) { star.y = 0; star.x = Math.random() * W; }
    }
    if (game.brandActive) {
      game.brandX += 112 * dt;
      if (game.brandX > W + 310) { game.brandActive = false; game.brandTimer = 7 + Math.random() * 5; }
    } else if (game.mode === 'playing') {
      game.brandTimer -= dt;
      if (game.brandTimer <= 0) { game.brandActive = true; game.brandX = -80; }
    }
    draw();
    requestAnimationFrame(frame);
  }
  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    game.aim.x = (event.clientX - rect.left) / rect.width * W;
    game.aim.y = (event.clientY - rect.top) / rect.height * H;
  }
  canvas.addEventListener('pointermove', pointerPosition);
  canvas.addEventListener('pointerdown', event => {
    pointerPosition(event); if (event.button === 0) game.firing = true;
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointerup', () => { game.firing = false; });
  canvas.addEventListener('pointercancel', () => { game.firing = false; });
  window.addEventListener('keydown', event => {
    const codes = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE','Digit1','Digit2','Digit3','KeyP'];
    if (!codes.includes(event.code)) return;
    keys.add(event.code);
    if (game.mode === 'playing') event.preventDefault();
    if (event.code === 'KeyE' && !event.repeat) { game.weapon = (game.weapon + 1) % weapons.length; hud(); }
    if (event.code === 'Digit1') { game.weapon = 0; hud(); }
    if (event.code === 'Digit2') { game.weapon = 1; hud(); }
    if (event.code === 'Digit3') { game.weapon = 2; hud(); }
    if (event.code === 'KeyP' && !event.repeat) pause();
  }, true);
  window.addEventListener('keyup', event => keys.delete(event.code), true);
  window.addEventListener('blur', () => { keys.clear(); game.firing = false; });
  $('vs-start-button').addEventListener('click', restart);
  $('vs-replay').addEventListener('click', restart);
  $('vs-result-replay').addEventListener('click', restart);
  $('vs-pause').addEventListener('click', () => pause());
  $('vs-resume').addEventListener('click', () => pause(false));
  document.querySelectorAll('[data-vs-hold]').forEach(button => {
    const control = button.dataset.vsHold;
    const release = () => { touch[control] = false; };
    button.addEventListener('pointerdown', event => { event.preventDefault(); button.setPointerCapture?.(event.pointerId); touch[control] = true; });
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
  });
  $('vs-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(COUPON); $('vs-copy-status').textContent = 'Copied · ready for checkout'; }
    catch {
      const field = document.createElement('textarea'); field.value = COUPON;
      field.setAttribute('readonly',''); field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.appendChild(field); field.select();
      let copied = false; try { copied = document.execCommand('copy'); } catch {}
      field.remove(); $('vs-copy-status').textContent = copied ? 'Copied · ready for checkout' : 'Copy ' + COUPON + ' manually';
    }
  });
  hud();
  requestAnimationFrame(frame);
})();
