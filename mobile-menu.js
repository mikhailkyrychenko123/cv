(() => {
  const breakpoint = window.matchMedia('(max-width: 760px)');
  const stickyHeader = document.querySelector('.v4-page.variant-13-pixel .v-top');

  if (stickyHeader) {
    let framePending = false;
    const updateStickyState = () => {
      framePending = false;
      stickyHeader.classList.toggle('is-stuck', stickyHeader.getBoundingClientRect().top <= 1);
    };
    const queueStickyState = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateStickyState);
    };

    window.addEventListener('scroll', queueStickyState, { passive: true });
    window.addEventListener('resize', queueStickyState, { passive: true });
    updateStickyState();
  }

  document.querySelectorAll('.mobile-menu-toggle').forEach((button) => {
    const header = button.closest('.v-top');
    const nav = document.getElementById(button.getAttribute('aria-controls'));
    if (!header || !nav) return;

    const setOpen = (open) => {
      const mobile = breakpoint.matches;
      const expanded = mobile && open;
      header.classList.toggle('mobile-nav-open', expanded);
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? 'Close sections menu' : 'Open sections menu');
      nav.setAttribute('aria-hidden', String(mobile && !expanded));
      nav.inert = mobile && !expanded;
    };

    setOpen(false);
    button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('pointerdown', (event) => {
      if (breakpoint.matches && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('mobile-nav-open')) {
        setOpen(false);
        button.focus();
      }
    });
    breakpoint.addEventListener('change', () => setOpen(false));
  });
})();
