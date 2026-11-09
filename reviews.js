(() => {
  document.querySelectorAll('[data-review-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('.review-slide'));
    const dots = slider.querySelector('[data-review-dots]');
    const counter = slider.querySelector('[data-review-count]');
    const previous = slider.querySelector('[data-review-previous]');
    const next = slider.querySelector('[data-review-next]');
    if (slides.length < 2 || !dots || !counter || !previous || !next) return;

    let active = 0;
    const dotButtons = slides.map((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show review ${index + 1} of ${slides.length}`);
      button.addEventListener('click', () => show(index));
      dots.append(button);
      return button;
    });

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.setAttribute('aria-hidden', String(i !== active));
        slide.setAttribute('aria-label', `Review ${i + 1} of ${slides.length}`);
      });
      dotButtons.forEach((button, i) => {
        if (i === active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
      counter.textContent = `${active + 1} / ${slides.length}`;
    }

    previous.addEventListener('click', () => show(active - 1));
    next.addEventListener('click', () => show(active + 1));
    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(active - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(active + 1); }
    });

    let touchStart = null;
    slider.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') touchStart = event.clientX;
    });
    slider.addEventListener('pointerup', (event) => {
      if (touchStart === null) return;
      const distance = event.clientX - touchStart;
      touchStart = null;
      if (Math.abs(distance) > 48) show(active + (distance < 0 ? 1 : -1));
    });

    show(0);
  });
})();
