(() => {
  const canvas = document.querySelector('[data-lemming-sim]');
  const toggle = document.querySelector('[data-sim-toggle]');
  const toggleLabel = document.querySelector('[data-sim-toggle-label]');
  const clock = document.querySelector('[data-sim-clock]');
  const reward = document.querySelector('[data-sim-reward]');
  const rewardCopy = document.querySelector('[data-sim-copy]');
  const rewardApply = document.querySelector('[data-sim-apply]');
  if (!canvas || !toggle) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const WORLD_W = 1672;
  const WORLD_H = 941;
  const DURATION = 30;
  const ANIMATION_TIMELINE = 35;
  const EARLY_SEQUENCE_END = 14.6;
  const BARREL_SHOTS = [
    { launch: 6.0, flight: 2.3, target: { x: 1018, y: 414 } },
    { launch: 8.0, flight: 2.3, target: { x: 1090, y: 390 } }
  ];
  const FORTRESS_SHOTS = [
    { launch: 11.4, flight: 1.4, target: { x: 176, y: 444 } },
    { launch: 13.2, flight: 1.4, target: { x: 218, y: 464 } }
  ];
  const slide = canvas.closest('.co-full-slide');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0;
  let previousTime = 0;
  let frame = 0;
  let paused = reducedMotion.matches;
  let pixelRatio = 1;
  let cssWidth = 0;
  let cssHeight = 0;
  let copiedByUser = false;
  let manualApply = false;
  let copyUnavailable = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = p => { const t = clamp(p); return t * t * (3 - 2 * t); };

  function timelineTime(realTime) {
    if (realTime <= EARLY_SEQUENCE_END) return realTime;
    const lateScale = (ANIMATION_TIMELINE - EARLY_SEQUENCE_END) / (DURATION - EARLY_SEQUENCE_END);
    return EARLY_SEQUENCE_END + (realTime - EARLY_SEQUENCE_END) * lateScale;
  }

  function setClock(time) {
    if (!clock?.firstChild) return;
    const seconds = Math.min(DURATION, Math.floor(time));
    clock.firstChild.nodeValue = `00:${String(seconds).padStart(2, '0')} `;
  }

  function updateReward(time) {
    if (!reward) return;
    const isVisible = time >= 29.5;
    reward.hidden = !isVisible;
    if (!isVisible) {
      copiedByUser = false;
      manualApply = false;
      copyUnavailable = false;
      return;
    }

    const scheduledStage = time < 31.0 ? 'won' : time < 32.2 ? 'copied' : 'applied';
    const stage = manualApply ? 'applied' : copiedByUser ? 'copied' : scheduledStage;
    reward.dataset.stage = stage;
    const entry = reward.querySelector('[data-sim-reward-entry]');
    const badge = reward.querySelector('[data-sim-applied-badge]');
    const originalPrice = reward.querySelector('[data-sim-original-price]');
    const price = reward.querySelector('[data-sim-reward-price]');
    const applyLabel = reward.querySelector('[data-sim-apply-label]');

    if (entry) entry.textContent = stage === 'won' ? 'Paste code here' : 'LEMMING10';
    if (badge) badge.hidden = stage !== 'applied';
    if (originalPrice) originalPrice.hidden = stage !== 'applied';
    if (price) price.textContent = stage === 'applied' ? '₴170.10' : '₴189.00';
    if (applyLabel) applyLabel.textContent = stage === 'applied' ? '10% discount applied' : 'Apply to hoodie';
  }

  async function copyRewardCode() {
    const code = reward?.querySelector('[data-sim-coupon-code]')?.textContent.trim() || 'LEMMING10';
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      }
    } catch (_) {}
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = code;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      field.remove();
    }
    copiedByUser = copied;
    copyUnavailable = !copied;
    updateReward(timelineTime(elapsed));
  }

  function updateToggle() {
    const complete = elapsed >= DURATION;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? (complete ? 'Replay the completed simulation' : 'Resume simulation') : 'Pause simulation');
    if (toggleLabel) toggleLabel.textContent = paused ? 'RESUME' : 'PAUSE';
    toggle.title = paused ? (complete ? 'Replay the completed 30-second simulation' : 'Resume the 30-second game simulation') : 'Pause the 30-second game simulation';
  }

  function visible() {
    return !document.hidden && (!slide || !slide.hidden);
  }

  function stopLoop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function startLoop() {
    if (paused || !visible() || frame) return;
    previousTime = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    const widthChanged = Math.abs(rect.width - cssWidth) > 1;
    const heightChanged = Math.abs(rect.height - cssHeight) > 1;
    if (!widthChanged && !heightChanged && nextRatio === pixelRatio) return;
    cssWidth = rect.width;
    cssHeight = rect.height;
    pixelRatio = nextRatio;
    canvas.width = Math.round(cssWidth * pixelRatio);
    canvas.height = Math.round(cssHeight * pixelRatio);
    draw(timelineTime(elapsed));
  }

  function tick(now) {
    frame = 0;
    if (paused || !visible()) return;
    const dt = Math.min(.06, Math.max(0, (now - previousTime) / 1000));
    previousTime = now;
    elapsed = Math.min(DURATION, elapsed + dt);
    draw(timelineTime(elapsed));
    setClock(elapsed);
    updateReward(timelineTime(elapsed));
    if (elapsed >= DURATION) {
      paused = true;
      updateToggle();
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function line(points, color = '#141714', width = 4, dash = []) {
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function bezierPoint(p, a, b, c, d) {
    const q = 1 - p;
    return {
      x: q * q * q * a.x + 3 * q * q * p * b.x + 3 * q * p * p * c.x + p * p * p * d.x,
      y: q * q * q * a.y + 3 * q * q * p * b.y + 3 * q * p * p * c.y + p * p * p * d.y
    };
  }

  function drawOriginalFlightArc() {
    ctx.strokeStyle = '#151815';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.setLineDash([15, 14]);
    ctx.beginPath();
    ctx.moveTo(192, 423);
    ctx.bezierCurveTo(282, 290, 468, 199, 617, 218);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawDamageMark(x, y, size = 13) {
    ctx.save();
    ctx.fillStyle = 'rgba(95,83,65,.2)';
    ctx.beginPath(); ctx.ellipse(x, y, size * .72, size * .48, -.24, 0, Math.PI * 2); ctx.fill();
    line([[x - size * .65, y - size * .4], [x - size * .12, y + size * .05], [x - size * .34, y + size * .62], [x + size * .05, y + size * .22], [x + size * .6, y + size * .48]], '#353a32', 2.2);
    line([[x - size * .12, y + size * .05], [x + size * .12, y - size * .52]], '#353a32', 1.7);
    ctx.restore();
  }

  function drawBarrel(shot, time) {
    const progress = clamp((time - shot.launch) / shot.flight);
    const point = bezierPoint(progress,
      { x: 132, y: 454 }, { x: 300, y: 205 }, { x: 750, y: 185 }, shot.target);
    const before = bezierPoint(Math.max(0, progress - .025),
      { x: 132, y: 454 }, { x: 300, y: 205 }, { x: 750, y: 185 }, shot.target);
    const after = bezierPoint(Math.min(1, progress + .025),
      { x: 132, y: 454 }, { x: 300, y: 205 }, { x: 750, y: 185 }, shot.target);
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.fillStyle = '#a9785d'; ctx.strokeStyle = '#171a16'; ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-14, -12); ctx.lineTo(14, -12); ctx.quadraticCurveTo(19, -12, 19, -7);
    ctx.lineTo(19, 7); ctx.quadraticCurveTo(19, 12, 14, 12); ctx.lineTo(-14, 12);
    ctx.quadraticCurveTo(-19, 12, -19, 7); ctx.lineTo(-19, -7); ctx.quadraticCurveTo(-19, -12, -14, -12);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    line([[-9, -11], [-9, 11]], '#e0d5c3', 2.2);
    line([[8, -11], [8, 11]], '#e0d5c3', 2.2);
    line([[-15, -4], [15, -4]], '#543f34', 1.7);
    ctx.fillStyle = '#fffaf0'; ctx.font = '800 6px Arial, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('TNT', 0, 3);
    line([[0, -12], [5, -19]], '#171a16', 2.2);
    ctx.fillStyle = time * 20 % 2 < 1 ? '#d89a64' : '#f2cf7a';
    ctx.beginPath(); ctx.arc(6, -20, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawCannonShot(shot, time) {
    const progress = clamp((time - shot.launch) / shot.flight);
    const points = [
      { x: 1250, y: 408 }, { x: 1080, y: 275 }, { x: 445, y: 300 }, shot.target
    ];
    const point = bezierPoint(progress, ...points);
    const before = bezierPoint(Math.max(0, progress - .035), ...points);
    const after = bezierPoint(Math.min(1, progress + .035), ...points);
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    ctx.save();
    line([[before.x, before.y], [point.x, point.y]], 'rgba(62,68,60,.34)', 3.2);
    ctx.translate(point.x, point.y); ctx.rotate(angle);
    ctx.fillStyle = '#343a34'; ctx.strokeStyle = '#141714'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 6.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d59a67'; ctx.beginPath(); ctx.arc(-8, 0, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawImpact(point, time, impactAt, color = '#c78367') {
    const age = time - impactAt;
    if (age < 0 || age > .8) return;
    const p = clamp(age / .8);
    const radius = 12 + p * 38;
    ctx.save(); ctx.globalAlpha = 1 - p;
    ctx.fillStyle = 'rgba(190,133,100,.24)'; ctx.strokeStyle = color; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.arc(point.x, point.y, radius * .46, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 9; i += 1) {
      const angle = i * Math.PI * 2 / 9;
      line([[point.x + Math.cos(angle) * radius * .48, point.y + Math.sin(angle) * radius * .48], [point.x + Math.cos(angle) * radius, point.y + Math.sin(angle) * radius]], color, 3.1);
    }
    ctx.restore();
  }

  function drawSiege(time) {
    BARREL_SHOTS.forEach((shot, index) => {
      const impactAt = shot.launch + shot.flight;
      if (time >= shot.launch && time <= impactAt) drawBarrel(shot, time);
      if (time >= impactAt) drawDamageMark(shot.target.x, shot.target.y, 11 + index);
      drawImpact(shot.target, time, impactAt);
      if (time >= shot.launch && time < impactAt) drawActionTag(836, 509, 'DYNAMITE BARREL', true);
      if (time >= impactAt && time < impactAt + .8) drawActionTag(1015, 484, 'WALL HIT', true);
    });

    FORTRESS_SHOTS.forEach((shot, index) => {
      const impactAt = shot.launch + shot.flight;
      if (time >= shot.launch && time <= impactAt) drawCannonShot(shot, time);
      if (time >= impactAt) drawDamageMark(shot.target.x, shot.target.y, 9 + index * 2);
      drawImpact(shot.target, time, impactAt, '#777e70');
      if (time >= shot.launch && time < impactAt) drawActionTag(702, 331, 'FORTRESS RETURN FIRE', false);
      if (time >= impactAt && time < impactAt + .8) drawActionTag(164, 493, 'CATAPULT HIT', true);
    });
  }

  function drawLemming(x, footY, role, time, pose = 'walk', alpha = 1, airborne = false) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, footY);
    if (airborne) ctx.rotate(-.12);
    ctx.lineWidth = 4.1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#151714';

    // A clean redraw of the little olive lemmings in the source illustration.
    ctx.fillStyle = role === 'dynamite' ? '#c98b72' : '#b5bd99';
    ctx.beginPath();
    ctx.moveTo(-18, -48); ctx.lineTo(17, -48); ctx.lineTo(19, -21);
    ctx.lineTo(12, -15); ctx.lineTo(-13, -15); ctx.lineTo(-20, -23); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d8dac7';
    ctx.beginPath(); ctx.arc(0, -25, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#fbfaf6';
    ctx.beginPath(); ctx.arc(2, -68, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#aeb98a';
    ctx.beginPath();
    ctx.moveTo(-18, -73); ctx.lineTo(-22, -87); ctx.lineTo(-12, -83); ctx.lineTo(-8, -96);
    ctx.lineTo(-1, -85); ctx.lineTo(7, -96); ctx.lineTo(12, -83); ctx.lineTo(21, -87);
    ctx.lineTo(18, -72); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#151714';
    ctx.beginPath(); ctx.arc(8, -68, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(24, -66, 6, 3.7, .1, 0, Math.PI * 2); ctx.stroke();

    // Arms and legs move with the selected ability.
    if (pose === 'dig') {
      line([[-15, -43], [-29, -29], [-35, -37]], '#151714', 4);
      line([[14, -43], [31, -32], [39, -43]], '#151714', 4);
      line([[-9, -16], [-18, 0]], '#151714', 4);
      line([[10, -16], [17, 0]], '#151714', 4);
      line([[31, -52], [48, -73]], '#584d3e', 4);
      line([[43, -74], [54, -71], [49, -62]], '#584d3e', 4);
    } else if (pose === 'panic') {
      const wave = Math.sin(time * 19) * 8;
      line([[-15, -43], [-26, -71], [-22 + wave, -108]], '#151714', 4.2);
      line([[15, -43], [27, -72], [22 - wave, -108]], '#151714', 4.2);
      line([[-9, -16], [-13, 0]], '#151714', 4);
      line([[10, -16], [14, 0]], '#151714', 4);
    } else if (pose === 'plant' || pose === 'build') {
      line([[-15, -43], [-31, -30], [-43, -31]], '#151714', 4);
      line([[14, -43], [29, -30], [38, -30]], '#151714', 4);
      line([[-9, -16], [-13, 0]], '#151714', 4);
      line([[10, -16], [14, 0]], '#151714', 4);
    } else if (pose === 'parachute') {
      line([[-15, -43], [-28, -60], [-36, -74]], '#151714', 4);
      line([[15, -43], [28, -60], [36, -74]], '#151714', 4);
      line([[-9, -16], [-18, 0]], '#151714', 4);
      line([[10, -16], [20, 0]], '#151714', 4);
    } else if (airborne) {
      line([[-15, -43], [-32, -48], [-43, -43]], '#151714', 4);
      line([[15, -43], [31, -48], [38, -43]], '#151714', 4);
      line([[-9, -16], [-19, -7]], '#151714', 4);
      line([[10, -16], [20, -9]], '#151714', 4);
    } else {
      const step = Math.sin(time * 12 + x * .025) * 7;
      line([[-15, -43], [-27, -30], [-30, -22]], '#151714', 4);
      line([[15, -43], [25, -31], [30, -38]], '#151714', 4);
      line([[-9, -16], [-13 + step, 0]], '#151714', 4);
      line([[10, -16], [13 - step, 0]], '#151714', 4);
    }
    if (pose === 'plant') {
      ctx.fillStyle = '#c77e65'; ctx.strokeStyle = '#151714'; ctx.lineWidth = 3;
      ctx.save(); ctx.translate(0, -113);
      ctx.fillRect(-7, 0, 14, 34); ctx.strokeRect(-7, 0, 14, 34);
      line([[0, 0], [8, -13]], '#514c3e', 3);
      if (Math.sin(time * 28) > 0) { ctx.fillStyle = '#d49568'; ctx.beginPath(); ctx.arc(9, -15, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (pose === 'build') {
      ctx.save(); ctx.translate(0, -116); ctx.rotate(-.08);
      ctx.fillStyle = '#d0c7b5'; ctx.strokeStyle = '#151714'; ctx.lineWidth = 3;
      ctx.fillRect(-34, -5, 68, 11); ctx.strokeRect(-34, -5, 68, 11);
      ctx.restore();
    }
    if (pose === 'parachute') {
      ctx.save();
      ctx.fillStyle = '#d4d9c3'; ctx.strokeStyle = '#151714'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-51, -158); ctx.quadraticCurveTo(-43, -217, 0, -222);
      ctx.quadraticCurveTo(41, -217, 51, -158); ctx.quadraticCurveTo(0, -181, -51, -158); ctx.closePath();
      ctx.fill(); ctx.stroke();
      line([[-47, -160], [-29, -82]], '#343a32', 3.2);
      line([[-20, -178], [-10, -84]], '#343a32', 3.2);
      line([[20, -178], [10, -84]], '#343a32', 3.2);
      line([[47, -160], [29, -82]], '#343a32', 3.2);
      ctx.restore();
    }
    ctx.restore();
  }

  function flight(launch, landing, time) {
    if (time < launch || time > landing) return null;
    const p = smooth((time - launch) / (landing - launch));
    const point = bezierPoint(p,
      { x: 131, y: 466 }, { x: 192, y: 227 }, { x: 493, y: 160 }, { x: 649, y: 210 });
    return { x: point.x, y: point.y + 20, pose: 'air', airborne: true };
  }

  function characterAt(time, role) {
    if (role === 'runner') {
      if (time < 1.35) {
        const p = smooth(time / 1.35);
        const point = bezierPoint(p,
          { x: 131, y: 454 }, { x: 310, y: 184 }, { x: 745, y: 215 }, { x: 916, y: 520 });
        return { x: point.x, y: point.y, pose: 'air', airborne: true };
      }
      if (time < 1.8) {
        const p = smooth((time - 1.35) / .45);
        return { x: mix(916, 972, p), y: mix(520, 650, p), pose: 'walk' };
      }
      if (time < 4.0) return { x: 972, y: 650, pose: time >= 2.0 ? 'panic' : 'plant' };
      return null;
    }

    const config = {
      digger: { launch: 14.9, land: 16.0 },
      builder: { launch: 20.8, land: 21.9 },
      stairbuilder: { launch: 23.0, land: 24.1 }
    }[role];
    if (!config) return null;
    if (time < config.launch) return null;
    const airborne = flight(config.launch, config.land, time);
    if (airborne) return airborne;
    const age = time - config.land;
    if (age < .45) return { x: mix(649, 670, smooth(age / .45)), y: mix(230, 330, smooth(age / .45)), pose: 'walk' };
    if (age < 1.0) return { x: mix(670, 610, smooth((age - .45) / .55)), y: mix(330, 650, smooth((age - .45) / .55)), pose: 'walk' };

    if (role === 'digger') {
      if (age < 2.0) return { x: mix(610, 730, smooth((age - 1.0) / 1.0)), y: 650, pose: 'walk' };
      if (age < 4.2) {
        const p = smooth((age - 2.0) / 2.2);
        return { x: mix(730, 860, p), y: 650 + Math.sin(p * Math.PI) * 96, pose: 'dig' };
      }
      if (age < 4.7) return { x: mix(860, 930, smooth((age - 4.2) / .5)), y: 650, pose: 'walk' };
      if (time < 20.8) return { x: 930, y: 650, pose: 'walk' };
      if (time < 22.0) return { x: mix(930, 1045, smooth((time - 20.8) / 1.2)), y: 650, pose: 'walk' };
      return null;
    }
    if (role === 'builder') {
      if (age < 2.0) return { x: mix(610, 760, smooth((age - 1.0) / 1.0)), y: 650, pose: 'walk' };
      if (time < 25.8) return { x: 760, y: 650, pose: 'build' };
      if (time < 27.3) return { x: mix(760, 1045, smooth((time - 25.8) / 1.5)), y: 650, pose: 'walk' };
      return null;
    }
    if (role === 'stairbuilder') {
      if (age < 2.0) return { x: mix(610, 620, smooth((age - 1.0) / 1.0)), y: 650, pose: 'walk' };
      if (time < 27.2) return { x: 620, y: 650, pose: 'build' };
      if (time < 27.9) {
        const p = smooth((time - 27.2) / .7);
        return { x: mix(620, 746, p), y: mix(650, 545, p), pose: 'walk' };
      }
      if (time < 29.5) {
        const p = smooth((time - 27.9) / 1.6);
        return { x: mix(746, 900, p), y: mix(545, 650, p), pose: 'parachute' };
      }
      if (time < 30.6) return { x: mix(900, 1045, smooth((time - 29.5) / 1.1)), y: 650, pose: 'walk' };
      return null;
    }
    return null;
  }

  function drawBridge(time) {
    const p = clamp((time - 23.9) / 1.9);
    const count = Math.floor(p * 8);
    for (let i = 0; i < count; i += 1) {
      const x = 760 + i * 21;
      const y = 647 - Math.sin(i / 7 * Math.PI) * 4;
      ctx.fillStyle = i % 2 ? '#c6c0ad' : '#d6d0be';
      ctx.strokeStyle = '#171a16'; ctx.lineWidth = 3.3;
      ctx.fillRect(x, y - 8, 24, 14); ctx.strokeRect(x, y - 8, 24, 14);
      ctx.beginPath(); ctx.arc(x + 5, y - 1, 1.5, 0, Math.PI * 2); ctx.arc(x + 19, y - 1, 1.5, 0, Math.PI * 2); ctx.stroke();
      line([[x + 4, y + 7], [x + 8, 671]], '#565d51', 2.8);
    }
    if (p > .96) line([[755, 648], [930, 648]], '#171a16', 3.4);
  }

  function drawStaircase(time) {
    const p = clamp((time - 26.1) / 1.1);
    const count = Math.floor(p * 7);
    for (let i = 0; i < count; i += 1) {
      const x = 615 + i * 18;
      const y = 650 - (i + 1) * 15;
      ctx.fillStyle = i % 2 ? '#c8c1ae' : '#d8d1bf';
      ctx.strokeStyle = '#171a16'; ctx.lineWidth = 3.2;
      ctx.fillRect(x, y, 25, 17); ctx.strokeRect(x, y, 25, 17);
      line([[x + 4, y + 3], [x + 20, y + 3]], '#6e7468', 1.8);
    }
    if (p > .98) line([[615, 651], [741, 546]], '#41473e', 2.6);
  }

  function drawTunnel(time) {
    const p = clamp((time - 18.0) / 2.2);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha = .96;
    ctx.fillStyle = '#f6f3e9';
    ctx.strokeStyle = '#171a16'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(728, 655); ctx.quadraticCurveTo(748, 710, 795, 718);
    ctx.quadraticCurveTo(875, 730, 930, 655);
    ctx.lineTo(930, 681); ctx.quadraticCurveTo(870, 750, 795, 744);
    ctx.quadraticCurveTo(745, 735, 728, 682); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.setLineDash([7, 10]);
    ctx.beginPath(); ctx.moveTo(737, 670); ctx.quadraticCurveTo(820, 729, 922, 670); ctx.strokeStyle = '#77796b'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (p < .9) {
      ctx.fillStyle = 'rgba(173,149,112,.75)';
      for (let i = 0; i < 6; i += 1) {
        const phase = time * 18 + i * 2.5;
        const x = 730 + ((phase * 9) % 100);
        const y = 659 + Math.sin(phase) * 15;
        ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawDynamite(time) {
    const fuseStart = 1.8;
    const impactAt = 4.0;
    if (time < fuseStart || time > impactAt + .8) return;
    if (time < impactAt) {
      const countdown = Math.max(1, Math.ceil(impactAt - time));
      drawActionTag(927, 491, `TNT · 0${countdown}`, true);
      ctx.save(); ctx.translate(972, 650);
      ctx.fillStyle = '#c77d65'; ctx.strokeStyle = '#141714'; ctx.lineWidth = 3.2;
      ctx.fillRect(-8, -32, 16, 29); ctx.strokeRect(-8, -32, 16, 29);
      line([[0, -32], [8, -44]], '#433f34', 3);
      if (Math.sin(time * 25) > 0) { ctx.fillStyle = '#f1c57a'; ctx.beginPath(); ctx.arc(9, -46, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    } else {
      const fade = 1 - clamp((time - impactAt) / .8);
      const r = 18 + (1 - fade) * 86;
      ctx.save(); ctx.globalAlpha = Math.max(.12, fade);
      ctx.fillStyle = 'rgba(206,160,123,.32)'; ctx.strokeStyle = '#bd8065'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(972, 634, r * .55, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI * 2 / 12;
        line([[972 + Math.cos(a) * r * .42, 634 + Math.sin(a) * r * .42], [972 + Math.cos(a) * r, 634 + Math.sin(a) * r]], '#bd8065', 4);
      }
      ctx.restore();
    }
  }

  function drawActionTag(x, y, text, accent = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(2.2, 2.2);
    ctx.font = '800 8px Arial, sans-serif'; ctx.letterSpacing = '1.4px';
    const width = ctx.measureText(text).width + 18;
    ctx.fillStyle = 'rgba(255,255,255,.93)'; ctx.strokeStyle = '#242a23'; ctx.lineWidth = 2.4;
    ctx.fillRect(0, 0, width, 23); ctx.strokeRect(0, 0, width, 23);
    ctx.fillStyle = accent ? '#a65e4d' : '#41483f';
    ctx.fillText(text, 9, 15);
    ctx.restore();
  }

  function drawAbilityTags(time) {
    if (time > 17.9 && time < 20.7) drawActionTag(750, 693, 'DIGGING TUNNEL');
    if (time > 23.8 && time < 26.0) drawActionTag(790, 575, 'BUILDING BRIDGE');
    if (time > 26.0 && time < 27.3) drawActionTag(635, 507, 'BUILDING STAIRS');
    if (time > 27.8 && time < 29.6) drawActionTag(787, 470, 'PARACHUTE');
  }

  function drawCouponPulse(time) {
    const rewardMoment = time >= 29.3 && time < ANIMATION_TIMELINE;
    if (!rewardMoment) return;
    const strength = .18 + .22 * (Math.sin(time * 8) + 1) / 2;
    ctx.save(); ctx.globalAlpha = strength;
    ctx.strokeStyle = '#c78367'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.ellipse(1047, 454, 98 + Math.sin(time * 5) * 6, 76 + Math.sin(time * 5) * 4, -.08, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    if (time > 31.0) {
      for (let i = 0; i < 8; i += 1) {
        const a = i * Math.PI / 4 + time * .7;
        const radius = 102 + Math.sin(time * 10 + i) * 7;
        ctx.fillStyle = i % 2 ? '#b1b994' : '#c78367';
        ctx.beginPath(); ctx.arc(1047 + Math.cos(a) * radius, 454 + Math.sin(a) * radius * .72, 4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawLaunchPulse(time) {
    const launches = [0, 6, 8, 14.9, 20.8, 23.0];
    let pulse = 0;
    launches.forEach(start => {
      if (time >= start - .25 && time <= start + .3) pulse = Math.max(pulse, 1 - Math.abs(time - start) / .55);
    });
    if (!pulse) return;
    ctx.save(); ctx.globalAlpha = pulse * .8;
    ctx.strokeStyle = '#c78367'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(128, 462, 45 + (1 - pulse) * 18, 0, Math.PI * 2); ctx.stroke();
    line([[82, 412], [72, 398]], '#c78367', 4);
    line([[174, 411], [187, 399]], '#c78367', 4);
    ctx.restore();
  }

  function draw(time) {
    if (cssWidth < 2 || cssHeight < 2) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    const scale = Math.min(cssWidth / WORLD_W, cssHeight / WORLD_H);
    const offsetX = (cssWidth - WORLD_W * scale) / 2;
    const offsetY = (cssHeight - WORLD_H * scale) / 2;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawLaunchPulse(time);
    drawSiege(time);
    drawBridge(time);
    drawTunnel(time);
    drawDynamite(time);
    drawStaircase(time);
    drawCouponPulse(time);
    drawAbilityTags(time);

    const roles = ['runner', 'digger', 'builder', 'stairbuilder'];
    roles.forEach(role => {
      const person = characterAt(time, role);
      if (!person) return;
      const lemmingRole = role === 'stairbuilder' ? 'builder' : role;
      drawLemming(person.x, person.y, lemmingRole, time, person.pose, person.alpha ?? 1, person.airborne ?? false);
    });
    ctx.restore();
  }

  toggle.addEventListener('click', () => {
    if (elapsed >= DURATION) {
      elapsed = 0;
      draw(timelineTime(elapsed));
      setClock(elapsed);
      updateReward(timelineTime(elapsed));
    }
    paused = !paused;
    updateToggle();
    if (paused) stopLoop(); else startLoop();
  });
  rewardCopy?.addEventListener('click', copyRewardCode);
  rewardApply?.addEventListener('click', () => {
    copiedByUser = true;
    manualApply = true;
    copyUnavailable = false;
    updateReward(timelineTime(elapsed));
  });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop(); else { resize(); startLoop(); }
  });
  if (slide && 'MutationObserver' in window) {
    const observer = new MutationObserver(() => {
      if (visible()) { resize(); startLoop(); }
      else stopLoop();
    });
    observer.observe(slide, { attributes: true, attributeFilter: ['hidden'] });
  }

  resize();
  draw(timelineTime(elapsed));
  setClock(elapsed);
  updateReward(timelineTime(elapsed));
  updateToggle();
  startLoop();
})();
