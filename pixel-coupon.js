(() => {
  const offer = document.querySelector('[data-pixel-offer]');
  if (!offer) return;

  const trigger = offer.querySelector('[data-pixel-trigger]');
  const panel = offer.querySelector('[data-pixel-panel]');
  const copyButton = offer.querySelector('[data-pixel-copy]');
  const status = offer.querySelector('[data-pixel-status]');
  const code = '0111001';

  const closeOffer = () => {
    offer.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    status.textContent = '';
  };

  trigger.addEventListener('click', () => {
    const opening = !offer.classList.contains('is-open');
    if (opening) {
      offer.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      closeOffer();
    }
  });

  panel.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'touch') closeOffer();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && offer.classList.contains('is-open')) {
      closeOffer();
      trigger.focus();
    }
  });

  copyButton.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const field = document.createElement('textarea');
        field.value = code;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      }
      status.textContent = 'Copied — send it to me with your order.';
    } catch {
      status.textContent = 'Code 0111001 — send it to me with your order.';
    }
  });
})();
