(() => {
  const modal = document.querySelector('[data-shooter-modal]');
  const frame = modal?.querySelector('[data-shooter-frame]');
  if (!modal || !frame) return;
  let returnFocus = null;
  const open = (button) => {
    returnFocus = button;
    frame.src = frame.dataset.src;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('vs59-open');
    modal.querySelector('.vs59-dialog').focus({preventScroll:true});
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vs59-open');
    frame.src = 'about:blank';
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  };
  document.querySelectorAll('[data-shooter-open]').forEach(button => button.addEventListener('click', () => open(button)));
  modal.querySelectorAll('[data-shooter-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (!modal.hidden && event.key === 'Escape') { event.preventDefault(); close(); }
  });
})();
