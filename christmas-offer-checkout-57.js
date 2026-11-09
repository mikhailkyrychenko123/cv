(() => {
  const offer = document.querySelector('.co-offer[data-checkout-copy]');
  if (!offer) return;

  const checkout = offer.querySelector('[data-co-checkout]');
  const overlay = offer.querySelector('[data-co18-checkout]');
  const sheet = overlay?.querySelector('.co18-sheet');
  const note = offer.querySelector('[data-co-animation-note]');
  const panels = [...(overlay?.querySelectorAll('[data-co18-step]') || [])];
  const crumbs = [...(overlay?.querySelectorAll('[data-co18-crumb]') || [])];
  let currentStep = 'information';

  const cursorCopy = Number(offer.dataset.cursorCopy || 0);
  const checkoutCopy = Number(offer.dataset.checkoutCopy || 0);
  const notes = {
    20: 'A refined finger cursor glides in, presses Add to Cart, and marks the click with a precise ripple.',
    21: 'A soft screen-recording halo follows the finger cursor into Add to Cart and blooms on contact.',
    22: 'A warm spotlight cursor taps Add to Cart with a crisp, cinematic click pulse.'
  };
  const checkoutNotes = {
    22: 'A warm spotlight finger taps Add to Cart; the upside-down checkout turns 3° to the left.',
    23: 'A soft recording halo marks the tap; the upside-down checkout turns 3° to the left.',
    24: 'A soft recording halo marks the tap; the upside-down checkout turns 3° to the left.',
    25: 'A soft recording halo marks the tap; the upside-down checkout turns 3° to the left.',
    26: 'A soft recording halo marks the tap; the upside-down checkout turns 3° to the left.',
    39: 'BuyMore combines quantity deals, Mix & Match choices and clear bundle savings on one fast WooCommerce product page.',
    40: 'BuyMore combines quantity deals, Mix & Match choices and clear bundle savings on a fast WooCommerce landing page, built for Google PageSpeed scores of 98–100.',
    55: 'BuyMore combines quantity deals, Mix & Match choices and clear bundle savings on a fast WooCommerce landing page, built for Google PageSpeed scores of 98–100.',
    57: 'Fully optimized for top Google PageSpeed scores. Choose a ready-made landing page, add your products, duplicate it, and launch Buy More, Mix & Match, and bundle offers.'
  };
  if (note) note.textContent = checkoutNotes[checkoutCopy] || notes[cursorCopy] || 'The cart lands upside down. Checkout opens as a full order preview, flipped 180°.';

  function setStep(step) {
    currentStep = step;
    panels.forEach(panel => { panel.hidden = panel.dataset.co18Step !== step; });
    const progressOrder = ['cart', 'information', 'shipping', 'payment'];
    const compactMode = !crumbs.some(crumb => crumb.dataset.co18Crumb === 'shipping');
    const currentProgress = step === 'complete' ? (compactMode ? 'information' : 'payment') : step;
    crumbs.forEach(crumb => {
      const active = crumb.dataset.co18Crumb === currentProgress;
      const passed = progressOrder.indexOf(crumb.dataset.co18Crumb) < progressOrder.indexOf(currentProgress);
      crumb.classList.toggle('is-complete', passed);
      if (active) crumb.setAttribute('aria-current', 'step');
      else crumb.removeAttribute('aria-current');
    });
    const heading = overlay?.querySelector(`[data-co18-step="${step}"] h2`);
    if (heading && step !== 'information') { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }

  function openCheckout() {
    if (!overlay) return;
    setStep('information');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      sheet?.focus({ preventScroll: true });
    });
  }

  function closeCheckout() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    checkout?.focus({ preventScroll: true });
  }

  checkout?.addEventListener('click', openCheckout);
  overlay?.querySelectorAll('[data-co18-close]').forEach(button => button.addEventListener('click', closeCheckout));
  overlay?.querySelectorAll('[data-co18-next]').forEach(button => button.addEventListener('click', () => setStep(button.dataset.co18Next)));
  overlay?.querySelectorAll('[data-co18-prev]').forEach(button => button.addEventListener('click', () => setStep(button.dataset.co18Prev)));
  overlay?.querySelector('[data-co18-email]')?.addEventListener('click', event => {
    event.currentTarget.textContent = 'Guest checkout selected';
    event.currentTarget.disabled = true;
  });

  const promoToggle = overlay?.querySelector('[data-co18-promo-toggle]');
  const promoForm = overlay?.querySelector('[data-co18-promo-form]');
  promoToggle?.addEventListener('click', () => {
    const expanded = promoToggle.getAttribute('aria-expanded') === 'true';
    promoToggle.setAttribute('aria-expanded', String(!expanded));
    promoForm.hidden = expanded;
    promoToggle.querySelector('span').textContent = expanded ? '＋' : '−';
    if (!expanded) promoForm.querySelector('input')?.focus();
  });
  overlay?.querySelector('[data-co18-apply]')?.addEventListener('click', () => {
    const code = overlay.querySelector('#co18-promo-code')?.value.trim();
    const status = overlay.querySelector('[data-co18-promo-status]');
    if (status) status.textContent = code ? 'Promo code will be checked when the offer is finalized.' : 'Enter a code to preview it here.';
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay && !overlay.hidden) {
      event.stopImmediatePropagation();
      closeCheckout();
    }
    if (event.key === 'Tab' && overlay && !overlay.hidden && sheet) {
      const focusable = [...sheet.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')]
        .filter(element => !element.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();



