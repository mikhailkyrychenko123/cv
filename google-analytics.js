(() => {
  const measurementId = "G-50CWF8HW6V";

  // These game pages are embedded in iframes on the portfolio homepage.
  // Track only top-level visits so embedded demos do not inflate page views.
  if (window.top !== window.self) return;
  const dnt = String(navigator.doNotTrack || window.doNotTrack || "").toLowerCase();
  if (navigator.globalPrivacyControl === true || dnt === "1" || dnt === "yes") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(tag);
})();
