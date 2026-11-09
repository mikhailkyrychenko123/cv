(() => {
  const modal = document.querySelector('[data-rd-lead-modal]');
  const form = modal?.querySelector('[data-rd-lead-form]');
  const status = modal?.querySelector('[data-rd-lead-status]');
  const email = modal?.querySelector('#rd-lead-email');
  const submit = modal?.querySelector('.rd-lead-submit');
  const openers = [...document.querySelectorAll('[data-rd-lead-open]')];
  const closers = [...(modal?.querySelectorAll('[data-rd-lead-close]') || [])];
  if (!modal || !form || !email || !submit) return;

  let returnFocus = null;

  function openModal(trigger) {
    returnFocus = trigger || document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('rd-lead-open');
    requestAnimationFrame(() => email.focus({ preventScroll: true }));
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('rd-lead-open');
    returnFocus?.focus?.({ preventScroll: true });
  }

  openers.forEach(button => button.addEventListener('click', () => openModal(button)));
  closers.forEach(button => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')]
      .filter(element => !element.closest('[hidden]') && element.tabIndex >= 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.querySelector('span').textContent = 'Sending…';
    try {
      const response = await fetch('/api/game-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value.trim(),
          consent: form.elements.consent.checked,
          website: form.elements.website.value
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Please try again in a moment.');
      form.reset();
      status.textContent = 'Thank you! I’ll be in touch as soon as possible.';
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = error.message || 'The request could not be sent. Please try again.';
    } finally {
      submit.disabled = false;
      submit.querySelector('span').textContent = 'Send request';
    }
  });
})();
