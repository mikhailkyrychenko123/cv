(() => {
  const stage = document.querySelector('.co-full-slide[data-co-slide="2"] [data-shop82]');
  if (!stage) return;

  const scenes = [
    { tag: '01 · THE SHARED WASTELAND', title: 'A world built for players.', text: 'Build a stronghold, explore a vast map and encounter other players along the way.', motion: 'right' },
    { tag: '02 · THE TRADE DISTRICT', title: 'Commerce has a place in the world.', text: 'A dedicated district brings player-owned stores into the shared Rusty Drop map.', motion: 'hinge-left' },
    { tag: '03 · YOUR BRANDED STOREFRONT', title: 'Your logo. Your flag. Your shop.', text: 'Give your business its own recognisable storefront inside the game.', motion: 'pop' },
    { tag: '04 · A WALKABLE SHOWROOM', title: 'Let players browse your real products.', text: 'Connect your catalogue and present products in a shop players can explore.', motion: 'top' },
    { tag: '05 · OFFERS MEET GAMEPLAY', title: 'Give the community a reason to return.', text: 'Use shop updates, product launches and promotions to bring players back.', motion: 'bottom' }
  ];
  const shots = [...stage.querySelectorAll('[data-shop82-shot]')];
  const clock = stage.querySelector('[data-shop82-clock]');
  const toggle = stage.querySelector('[data-shop82-toggle]');
  const toggleLabel = stage.querySelector('[data-shop82-toggle-label]');
  const replay = stage.querySelector('[data-shop82-replay]');
  const copy = stage.querySelector('[data-shop82-copy]');
  const tag = stage.querySelector('[data-shop82-tag]');
  const title = stage.querySelector('[data-shop82-title]');
  const text = stage.querySelector('[data-shop82-text]');
  const progress = stage.querySelector('[data-shop82-progress]');
  const slide = stage.closest('.co-full-slide');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 32;
  const beat = duration / scenes.length;
  let elapsed = 0;
  let lastTime = 0;
  let frame = 0;
  let started = false;
  let paused = reducedMotion.matches;
  let pausedByVisibility = false;
  let finished = false;

  const formatTime = value => {
    const seconds = Math.min(duration, Math.floor(value));
    return `00:${String(seconds).padStart(2, '0')}`;
  };

  function updateClock() {
    if (clock) clock.textContent = `${formatTime(elapsed)} / 00:32`;
    if (progress) progress.style.width = `${Math.min(100, elapsed / duration * 100)}%`;
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? (finished ? 'Presentation complete' : 'Resume presentation') : 'Pause presentation');
      toggle.title = paused ? (finished ? 'Presentation complete — replay to start again' : 'Resume 32-second presentation') : 'Pause 32-second presentation';
      toggle.disabled = finished;
    }
    if (toggleLabel) toggleLabel.textContent = finished ? 'DONE' : paused ? 'RESUME' : 'PAUSE';
  }

  function setScene(index, animateCopy = true) {
    const scene = scenes[index];
    shots.forEach((shot, i) => {
      shot.classList.toggle('is-active', i === index);
      shot.classList.toggle('is-underlay', i === index - 1);
    });
    if (copy) {
      copy.classList.remove('is-entering');
      copy.dataset.motion = scene.motion;
      if (tag) tag.textContent = scene.tag;
      if (title) title.textContent = scene.title;
      if (text) text.textContent = scene.text;
      if (animateCopy && !paused && !reducedMotion.matches) {
        void copy.offsetWidth;
        copy.classList.add('is-entering');
        window.setTimeout(() => copy.classList.remove('is-entering'), 1000);
      }
    }
  }

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function draw(now) {
    if (paused || finished || document.hidden || slide.hidden) {
      frame = 0;
      return;
    }
    if (!lastTime) lastTime = now;
    elapsed = Math.min(duration, elapsed + (now - lastTime) / 1000);
    lastTime = now;
    const nextScene = Math.min(scenes.length - 1, Math.floor(elapsed / beat));
    if (stage._shop82Scene !== nextScene) {
      stage._shop82Scene = nextScene;
      setScene(nextScene);
    }
    updateClock();
    if (elapsed >= duration) {
      finished = true;
      paused = true;
      stage.classList.add('is-paused', 'is-finished');
      updateClock();
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(draw);
  }

  function play(reset = false) {
    if (reset || finished) {
      stopFrame();
      elapsed = 0;
      finished = false;
      stage._shop82Scene = -1;
      stage.classList.remove('is-playing', 'is-paused', 'is-finished');
      shots.forEach(shot => shot.classList.remove('is-active', 'is-underlay'));
      setScene(0, false);
      void stage.offsetWidth;
      stage.classList.add('is-playing');
      started = true;
    }
    if (slide.hidden || document.hidden) {
      paused = true;
      stage.classList.add('is-paused');
      updateClock();
      return;
    }
    paused = false;
    lastTime = 0;
    stage.classList.remove('is-paused');
    if (!started) {
      stage._shop82Scene = 0;
      setScene(0, true);
      stage.classList.add('is-playing');
      started = true;
    }
    updateClock();
    stopFrame();
    frame = requestAnimationFrame(draw);
  }

  function pause() {
    if (paused || finished) return;
    if (lastTime) elapsed = Math.min(duration, elapsed + (performance.now() - lastTime) / 1000);
    paused = true;
    stage.classList.add('is-paused');
    stopFrame();
    updateClock();
  }

  toggle?.addEventListener('click', () => {
    pausedByVisibility = false;
    paused ? play() : pause();
  });
  replay?.addEventListener('click', () => play(true));

  const visibilityObserver = new MutationObserver(() => {
    if (slide.hidden) {
      if (!paused) {
        pause();
        pausedByVisibility = true;
      }
      return;
    }
    if (!started && !reducedMotion.matches) play(true);
    else if (pausedByVisibility && !finished) {
      pausedByVisibility = false;
      play();
    }
    else if (!paused && !finished) play();
  });
  visibilityObserver.observe(slide, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!paused) {
        pause();
        pausedByVisibility = true;
      }
    } else if (!slide.hidden && pausedByVisibility && !finished) {
      pausedByVisibility = false;
      play();
    }
  });
  if (!slide.hidden && !reducedMotion.matches) play(true);
  else {
    setScene(0, false);
    paused = true;
    updateClock();
  }
  reducedMotion.addEventListener?.('change', event => {
    if (event.matches && !paused) pause();
  });
})();
