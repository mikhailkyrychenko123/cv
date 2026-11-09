(() => {
  const offer = document.querySelector('.co-offer');
  if (!offer) return;

  const variant = Number(offer.dataset.variant || 1);
  const cursorCopy = Number(offer.dataset.cursorCopy || 0);
  const slides = [...offer.querySelectorAll('[data-co-slide]')];
  const dots = [...offer.querySelectorAll('[data-co-dot]')];
  const previousButtons = [...offer.querySelectorAll('[data-co-prev]')];
  const nextButtons = [...offer.querySelectorAll('[data-co-next]')];
  const mobileCounters = [...offer.querySelectorAll('[data-co-mobile-counter]')];
  const title = offer.querySelector('[data-co-slide-title]');
  const caption = offer.querySelector('[data-co-slide-caption]');
  const note = offer.querySelector('[data-co-animation-note]');
  const addButtons = [...offer.querySelectorAll('[data-co-add]')];
  const addButton = addButtons[0];
  const replayButtons = [...offer.querySelectorAll('[data-co-replay]')];
  const pointer = offer.querySelector('[data-co-pointer]');
  const cart = offer.querySelector('[data-co-cart]');
  const cartItem = offer.querySelector('[data-co-item]');
  const quantityText = offer.querySelector('[data-co-quantity]');
  const countText = offer.querySelector('[data-co-count]');
  const linePrice = offer.querySelector('[data-co-line-price]');
  const subtotal = offer.querySelector('[data-co-subtotal]');
  const cartStatus = offer.querySelector('[data-co-status]');
  const checkout = offer.querySelector('[data-co-checkout]');
  const restore = offer.querySelector('[data-co-restore]');
  const inspectCart = offer.querySelector('[data-co-cart-inspect]');
  const checkoutTicket = offer.querySelector('[data-co-checkout-ticket]');
  const checkoutRoute = offer.querySelector('[data-co-checkout-route]');
  const routeTrack = offer.querySelector('[data-co-route-track]');
  const routeCopy = offer.querySelector('[data-co-route-copy]');
  let activeSlide = 0;
  let quantity = 1;
  let removed = false;
  let runId = 0;
  let lastTrigger = null;
  let cartTimer = 0;
  let touchStart = null;

  const animationNotes = {
    1: 'Fully optimized for top Google PageSpeed scores. Choose a ready-made landing page, add your products, duplicate it, and launch Buy More, Mix & Match, and bundle offers.',
    2: 'The oversized cursor clicks, the cart spins through a full orbit, and rebounds into place.',
    3: 'A playful cursor click launches the tilted cart like a holiday postcard from the upper-right corner.',
    4: 'The hoodie becomes the centre of a snow globe; the cart floats in through a little winter flurry.',
    5: 'Holiday ribbon wraps the product into a gift before the cart unfolds into view.',
    6: 'A hand-printed receipt rolls out, stamps itself, and flips into the cart preview.',
    7: 'The oversized cursor clicks Add to Cart; the cart drops into view upside down and clipped at the browser edge.',
    8: 'The oversized cursor clicks Add to Cart; the cart makes a broad orbit and lands inverted at the top edge.',
    9: 'The oversized cursor clicks Add to Cart; the cart swings in like a hinged panel and stops upside down.',
    10: 'The oversized cursor clicks Add to Cart; a springy flip lands the tilted cart half-hidden at the top.',
    11: 'After the cart opens, Checkout wraps the offer like a small holiday gift.',
    12: 'After Checkout, a printed receipt slips out with the sample total.',
    13: 'After Checkout, a delivery route advances from cart to doorstep.'
  };
  if (note) note.textContent = animationNotes[variant] || animationNotes[1];

  function showSlide(index) {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === activeSlide;
      slide.hidden = !active;
      slide.setAttribute('aria-hidden', String(!active));
      slide.classList.toggle('is-active', active);
    });
    dots.forEach(dot => dot.setAttribute('aria-current', String(Number(dot.dataset.coDot) === activeSlide)));
    mobileCounters.forEach(counter => {
      counter.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    });
    if (title) title.textContent = activeSlide === 0 ? 'Hoodie · Graphite black' : 'Campaign · Mobile performance';
    if (caption) caption.textContent = activeSlide === 0 ? 'One cosy pick for the holiday edit' : 'Campaign score · 98 mobile performance';
  }

  function bringActiveSlideIntoViewOnMobile() {
    if (!window.matchMedia('(max-width: 720px)').matches) return;
    const active = slides[activeSlide];
    if (!active) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    requestAnimationFrame(() => active.scrollIntoView({ behavior, block: 'start' }));
  }

  function formatPrice(value) {
    return `${new Intl.NumberFormat('uk-UA').format(value)} ₴`;
  }

  function updateCart() {
    const total = removed ? 0 : 189 * quantity;
    if (quantityText) quantityText.textContent = String(quantity);
    if (countText) countText.textContent = `(${removed ? 0 : quantity})`;
    if (linePrice) linePrice.textContent = formatPrice(total);
    if (subtotal) subtotal.textContent = formatPrice(total);
    if (cartItem) cartItem.hidden = removed;
    if (restore) restore.hidden = !removed;
    if (checkout) checkout.disabled = removed;
  }

  function closeCart(restoreFocus = false) {
    offer.classList.remove('co-cart-open');
    offer.classList.remove('co-cart-inspected', 'co-checkout-gift', 'co-checkout-receipt', 'co-checkout-route');
    if (cart) cart.setAttribute('aria-hidden', 'true');
    if (cart) cart.inert = false;
    if (inspectCart) inspectCart.hidden = true;
    if (checkoutTicket) checkoutTicket.hidden = true;
    if (checkoutRoute) checkoutRoute.hidden = true;
    if (routeTrack) routeTrack.dataset.progress = '0';
    if (routeCopy) routeCopy.textContent = 'Order received';
    if (pointer) pointer.hidden = true;
    if (restoreFocus && lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function showCart() {
    offer.classList.add('co-cart-open');
    if (cart) cart.setAttribute('aria-hidden', 'false');
    const needsInspect = variant >= 7 && variant <= 10;
    if (cart) cart.inert = needsInspect;
    if (inspectCart) inspectCart.hidden = !needsInspect;
    updateCart();
    if (needsInspect && lastTrigger) window.setTimeout(() => inspectCart?.focus({ preventScroll: true }), 350);
  }

  function wait(ms) {
    return new Promise(resolve => { cartTimer = window.setTimeout(resolve, ms); });
  }

  async function playAnimation(trigger, automatic = false) {
    const currentRun = ++runId;
    const actionButton = trigger?.matches?.('[data-co-add]')
      ? trigger
      : (trigger?.closest?.('[data-co-slide]')?.querySelector('[data-co-add]') || addButton);
    window.clearTimeout(cartTimer);
    closeCart(false);
    lastTrigger = automatic ? null : trigger;
    addButtons.forEach(button => button.classList.remove('co-is-pressed'));
    pointer?.classList.remove('co-pointer-clicked');
    offer.classList.remove('co-is-running');
    void offer.offsetWidth;
    offer.classList.add('co-is-running');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointerConcept = variant <= 3 || (variant >= 7 && variant <= 13);
    const skipPointer = offer.dataset.noPointerAnimation === 'true';
    if (pointerConcept && !skipPointer && !reduceMotion && pointer && actionButton) {
      const target = actionButton.getBoundingClientRect();
      const startX = Math.max(18, window.innerWidth - 80);
      const startY = Math.max(18, Math.min(70, window.innerHeight * .08));
      const targetX = target.left + target.width * .65;
      const targetY = target.top + target.height * .5;
      pointer.hidden = false;
      let pointerFrames = [
        { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) scale(.55) rotate(-18deg)` },
        { opacity: 1, offset: .14, transform: `translate3d(${startX}px,${startY}px,0) scale(.95) rotate(-5deg)` },
        { opacity: 1, offset: .78, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` },
        { opacity: 1, offset: .86, transform: `translate3d(${targetX}px,${targetY}px,0) scale(.76) rotate(-3deg)` },
        { opacity: 1, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` }
      ];
      let pointerDuration = 1120;
      if (cursorCopy === 20) {
        pointerFrames = [
          { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) scale(.72) rotate(-9deg)` },
          { opacity: 1, offset: .16, transform: `translate3d(${startX}px,${startY}px,0) scale(.94) rotate(0)` },
          { opacity: 1, offset: .76, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` },
          { opacity: 1, offset: .86, transform: `translate3d(${targetX}px,${targetY}px,0) scale(.84) rotate(-2deg)` },
          { opacity: 1, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` }
        ];
        pointerDuration = 1240;
      } else if (cursorCopy === 21) {
        pointerFrames = [
          { opacity: 0, transform: `translate3d(${startX}px,${startY + 24}px,0) scale(.62) rotate(-12deg)` },
          { opacity: 1, offset: .2, transform: `translate3d(${startX - 32}px,${startY + 28}px,0) scale(.92) rotate(-3deg)` },
          { opacity: 1, offset: .66, transform: `translate3d(${targetX - 18}px,${targetY + 16}px,0) scale(1) rotate(2deg)` },
          { opacity: 1, offset: .82, transform: `translate3d(${targetX}px,${targetY}px,0) scale(.78) rotate(0)` },
          { opacity: 1, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` }
        ];
        pointerDuration = 1510;
      } else if (cursorCopy === 22) {
        pointerFrames = [
          { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) scale(.46) rotate(8deg)` },
          { opacity: 1, offset: .12, transform: `translate3d(${startX}px,${startY}px,0) scale(.88) rotate(0)` },
          { opacity: 1, offset: .7, transform: `translate3d(${targetX + 8}px,${targetY - 10}px,0) scale(1.02) rotate(-2deg)` },
          { opacity: 1, offset: .84, transform: `translate3d(${targetX}px,${targetY}px,0) scale(.72) rotate(0)` },
          { opacity: 1, transform: `translate3d(${targetX}px,${targetY}px,0) scale(1) rotate(0)` }
        ];
        pointerDuration = 1030;
      }
      const flight = pointer.animate(pointerFrames, {
        duration: pointerDuration,
        easing: cursorCopy === 21 ? 'cubic-bezier(.2,.72,.24,1)' : 'cubic-bezier(.18,.78,.25,1)',
        fill: 'forwards'
      });
      try { await flight.finished; } catch (_) { return; }
      if (currentRun !== runId) return;
      pointer.classList.add('co-pointer-clicked');
      actionButton.classList.add('co-is-pressed');
      await wait(cursorCopy === 20 ? 480 : cursorCopy === 21 ? 640 : cursorCopy === 22 ? 740 : 230);
    } else {
      await wait(skipPointer || reduceMotion ? 0 : (variant === 4 ? 980 : variant === 5 ? 930 : 1060));
    }
    if (currentRun !== runId) return;
    pointer && (pointer.hidden = true);
    actionButton?.classList.remove('co-is-pressed');
    showCart();
  }

  previousButtons.forEach(button => button.addEventListener('click', () => {
    showSlide(activeSlide - 1);
    bringActiveSlideIntoViewOnMobile();
  }));
  nextButtons.forEach(button => button.addEventListener('click', () => {
    showSlide(activeSlide + 1);
    bringActiveSlideIntoViewOnMobile();
  }));
  dots.forEach(dot => dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.coDot));
    bringActiveSlideIntoViewOnMobile();
  }));

  const slideRegion = offer.querySelector('.co-section-slider');
  slideRegion?.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('button, a, input, select, textarea, canvas, .co-shop82-controls, .co-branded-games')) return;
    touchStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  slideRegion?.addEventListener('pointerup', event => {
    if (!touchStart || event.pointerType !== 'touch') return;
    const dx = event.clientX - touchStart.x;
    const dy = event.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    showSlide(activeSlide + (dx < 0 ? 1 : -1));
    bringActiveSlideIntoViewOnMobile();
  }, { passive: true });
  slideRegion?.addEventListener('pointercancel', () => { touchStart = null; }, { passive: true });
  addButtons.forEach(button => button.addEventListener('click', event => playAnimation(event.currentTarget)));
  offer.querySelectorAll('[data-co-demo-trigger]').forEach(button => button.addEventListener('click', () => {
    button.closest('[data-co-slide]')?.querySelector('[data-co-add]')?.click();
  }));
  replayButtons.forEach(button => button.addEventListener('click', event => playAnimation(event.currentTarget)));
  offer.querySelectorAll('[data-co-close]').forEach(button => button.addEventListener('click', () => closeCart(true)));
  inspectCart?.addEventListener('click', () => {
    offer.classList.add('co-cart-inspected');
    cart.inert = false;
    inspectCart.hidden = true;
    cart.querySelector('[data-co-close]')?.focus({ preventScroll: true });
  });
  offer.querySelector('[data-co-minus]')?.addEventListener('click', () => {
    if (!removed && quantity > 1) quantity -= 1;
    updateCart();
  });
  offer.querySelector('[data-co-plus]')?.addEventListener('click', () => {
    if (!removed && quantity < 9) quantity += 1;
    updateCart();
  });
  offer.querySelector('[data-co-remove]')?.addEventListener('click', () => {
    removed = true;
    quantity = 0;
    if (cartStatus) cartStatus.textContent = 'Hoodie removed from this preview.';
    updateCart();
  });
  restore?.addEventListener('click', () => {
    removed = false;
    quantity = 1;
    if (cartStatus) cartStatus.textContent = 'The hoodie is back in your cart preview.';
    updateCart();
  });
  checkout?.addEventListener('click', () => {
    offer.classList.remove('co-checkout-gift', 'co-checkout-receipt', 'co-checkout-route');
    if (checkoutTicket) checkoutTicket.hidden = true;
    if (checkoutRoute) checkoutRoute.hidden = true;
    if (routeTrack) routeTrack.dataset.progress = '0';
    if (variant === 11) {
      offer.classList.add('co-checkout-gift');
      if (cartStatus) cartStatus.textContent = 'A little gift wrap, just for the bundle. Preview only — no order or payment was sent.';
    } else if (variant === 12) {
      offer.classList.add('co-checkout-receipt');
      if (checkoutTicket) {
        const total = subtotal?.textContent || '189 ₴';
        const ticketTotal = checkoutTicket.querySelector('[data-co-ticket-total]');
        if (ticketTotal) ticketTotal.textContent = total;
        checkoutTicket.hidden = false;
      }
      if (cartStatus) cartStatus.textContent = 'A visual receipt is ready. Preview only — no order or payment was sent.';
    } else if (variant === 13) {
      offer.classList.add('co-checkout-route');
      if (checkoutRoute) checkoutRoute.hidden = false;
      const stages = [
        { progress: '1', copy: 'Packed with care' },
        { progress: '2', copy: 'On its way' },
        { progress: '3', copy: 'At your doorstep · concept preview' }
      ];
      stages.forEach((stage, index) => window.setTimeout(() => {
        if (!offer.classList.contains('co-checkout-route') || !routeTrack) return;
        routeTrack.dataset.progress = stage.progress;
        if (routeCopy) routeCopy.textContent = stage.copy;
      }, 350 + index * 650));
      if (cartStatus) cartStatus.textContent = 'Follow the sample parcel through a short delivery animation. Preview only — no shipment was started.';
    } else if (cartStatus) {
      cartStatus.textContent = 'Preview only — no order was placed.';
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && offer.classList.contains('co-cart-open')) closeCart(true);
  });
  updateCart();

  if (!offer.hasAttribute('data-disable-auto-preview') && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        window.setTimeout(() => playAnimation(null, true), 420);
      }
    }, { threshold: .12, rootMargin: '0px 0px -10% 0px' });
    observer.observe(offer);
  }
})();
