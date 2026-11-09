(() => {
  const modal = document.querySelector('[data-hopworld-modal]');
  const frame = modal?.querySelector('[data-hopworld-frame]');
  if (!modal || !frame) return;

  let returnFocus = null;

  function open(button) {
    returnFocus = button;
    frame.onload = () => {
      try {
        frame.contentWindow.focus();
        frame.contentDocument.querySelector('[data-canvas]')?.focus({ preventScroll: true });
      } catch (_) { /* Same-origin local game frame should be focusable. */ }
    };
    frame.src = frame.dataset.src;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hw60-open');
    modal.querySelector('.hw60-dialog')?.focus({ preventScroll: true });
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('hw60-open');
    frame.src = 'about:blank';
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-hopworld-open]').forEach(button => {
    button.addEventListener('click', () => open(button));
  });
  modal.querySelectorAll('[data-hopworld-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (!modal.hidden && event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });
})();
