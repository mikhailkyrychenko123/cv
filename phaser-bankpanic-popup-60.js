(() => {
  const modal = document.querySelector('[data-bankpanic-modal]');
  const frame = modal?.querySelector('[data-bankpanic-frame]');
  if (!modal || !frame) return;
  let returnFocus = null;
  const open = button => {
    returnFocus = button;
    frame.src = frame.dataset.src;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('bp60-open');
    document.body.classList.add('bp60-open');
    modal.querySelector('.bp60-dialog').focus({preventScroll:true});
  };
  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('bp60-open');
    document.body.classList.remove('bp60-open');
    frame.src = 'about:blank';
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  };
  document.querySelectorAll('[data-bankpanic-open]').forEach(button => button.addEventListener('click', () => open(button)));
  modal.querySelectorAll('[data-bankpanic-close]').forEach(button => button.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (!modal.hidden && event.key === 'Escape') { event.preventDefault(); close(); }
  });
})();
