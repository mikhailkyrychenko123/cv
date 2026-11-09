(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const makeGearPath = (teeth, rootRadius, tipRadius, phaseDegrees) => {
    const points = [];
    const step = (Math.PI * 2) / teeth;
    const phase = (phaseDegrees * Math.PI) / 180;
    for (let tooth = 0; tooth < teeth; tooth += 1) {
      const center = tooth * step - Math.PI / 2 + phase;
      [[-.5, rootRadius], [-.28, rootRadius], [-.16, tipRadius], [.16, tipRadius], [.28, rootRadius], [.5, rootRadius]].forEach(([offset, radius]) => {
        const angle = center + offset * step;
        points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
      });
    }
    return `${points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')} Z`;
  };
  document.querySelectorAll('[data-story-gear], [data-gear-teeth]').forEach((gear) => {
    const teeth = Number(gear.dataset.gearTeeth || gear.dataset.teeth);
    const root = Number(gear.dataset.gearRoot || gear.dataset.root);
    const tip = Number(gear.dataset.gearTip || gear.dataset.tip);
    const phase = Number(gear.dataset.gearPhase || gear.dataset.phase) || 0;
    gear.setAttribute('d', makeGearPath(teeth, root, tip, phase));
  });
  document.querySelectorAll('[data-story]').forEach((story) => {
    const button = story.querySelector('.story-replay');
    const status = story.querySelector('[data-story-status]');
    if (!button) return;
    let timer = null;
    let autoStart = null;

    const finish = () => {
      window.clearTimeout(timer);
      story.classList.remove('is-playing', 'is-static');
      story.dataset.state = 'idle';
      button.hidden = false;
      if (status) status.textContent = 'The short story is complete. Activate play to see it again.';
    };

    const play = () => {
      window.clearTimeout(timer);
      window.clearTimeout(autoStart);
      button.hidden = true;
      story.dataset.state = 'playing';
      story.classList.remove('is-playing', 'is-static');
      void story.offsetHeight;
      if (reducedMotion) {
        story.classList.add('is-static');
        timer = window.setTimeout(finish, 1700);
        return;
      }
      window.requestAnimationFrame(() => {
        story.classList.add('is-playing');
      timer = window.setTimeout(finish, Number(story.dataset.duration) || 7000);
      });
    };

    button.addEventListener('click', play);
    if (reducedMotion) {
      story.dataset.state = 'idle';
      button.hidden = false;
    } else {
      button.hidden = true;
      autoStart = window.setTimeout(play, 380);
    }
  });
})();
