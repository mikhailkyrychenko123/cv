(() => {
  const modal = document.querySelector('[data-zombie-defense-modal]');
  const frame = modal?.querySelector('[data-zombie-defense-frame]');
  if (!modal || !frame) return;
  let returnFocus = null;
  const open = button => {
    returnFocus = button;
    frame.src = frame.dataset.src;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('zd60-open');
    modal.querySelector('.zd60-dialog').focus({preventScroll:true});
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('zd60-open');
    frame.src = 'about:blank';
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  };
  document.querySelectorAll('[data-zombie-defense-open]').forEach(button => button.addEventListener('click', () => open(button)));
  modal.querySelectorAll('[data-zombie-defense-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (!modal.hidden && event.key === 'Escape') { event.preventDefault(); close(); }
  });
})();
