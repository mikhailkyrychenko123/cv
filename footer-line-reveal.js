(() => {
  const line = document.querySelector('.footer-line-art');
  if (!line) return;

  const reveal = () => line.classList.add('is-visible');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveal();
    return;
  }

  if (!('IntersectionObserver' in window)) {
    reveal();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      reveal();
      observer.disconnect();
    }
  }, { threshold: 0.15 });

  observer.observe(line);
})();
