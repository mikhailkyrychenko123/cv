(() => {
  const breakpoint = window.matchMedia('(max-width: 760px)');
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
