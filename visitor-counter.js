(() => {
  "use strict";

  const endpoint = "/api/visitor-stats";
  const visitorKey = "basturma_visitor_id_v1";
  const digitShapes = {
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  };

  const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  let visitorId;

  const nodes = Object.fromEntries(
    [...document.querySelectorAll("[data-counter]")].map((node) => [node.dataset.counter, node])
  );

  function renderDigits(node, value, accessibleLabel) {
    if (!node) return;
    const digits = String(Math.max(0, Math.trunc(Number(value) || 0)));
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const width = digits.length * 6 - 1;
    svg.setAttribute("viewBox", `0 0 ${width} 7`);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("shape-rendering", "crispEdges");
    digits.split("").forEach((digit, index) => {
      digitShapes[digit].forEach((row, y) => {
        [...row].forEach((on, x) => {
          if (on !== "1") return;
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", String(index * 6 + x));
          rect.setAttribute("y", String(y));
          rect.setAttribute("width", "1");
          rect.setAttribute("height", "1");
          svg.append(rect);
        });
      });
    });
    node.replaceChildren(svg);
    node.setAttribute("aria-label", accessibleLabel);
  }

  function paint(stats) {
    if (!stats) return;
    renderDigits(nodes["visits-today"], stats.today?.visits, `${stats.today?.visits || 0} visits today`);
    renderDigits(nodes["visits-yesterday"], stats.yesterday?.visits, `${stats.yesterday?.visits || 0} visits yesterday`);
    renderDigits(nodes["unique-today"], stats.today?.uniqueVisitors, `${stats.today?.uniqueVisitors || 0} unique visitors today`);
    renderDigits(nodes["unique-yesterday"], stats.yesterday?.uniqueVisitors, `${stats.yesterday?.uniqueVisitors || 0} unique visitors yesterday`);
    renderDigits(nodes.online, stats.onlineNow, `${stats.onlineNow || 0} visitors online now`);
  }

  async function post(type) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, visitorId }),
        credentials: "same-origin",
        cache: "no-store",
        keepalive: true,
      });
      if (!response.ok) {
        const detail = await response.clone().json().catch(() => null);
        console.warn("Site traffic counter event failed:", response.status, detail?.error || "Request failed");
      }
      return response;
    } catch {
      console.warn("Site traffic counter event could not reach the server.");
      return null;
    }
  }

  async function refresh() {
    try {
      const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
      if (response.ok) paint(await response.json());
      else console.warn("Site traffic counter could not load stats:", response.status);
    } catch {
      console.warn("Site traffic counter could not reach the server.");
      // Keep the compact counter at its neutral zero state if the network is unavailable.
    }
  }

  if (dnt) {
    refresh();
    return;
  }

  try {
    visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(visitorKey, visitorId);
    }
  } catch {
    // Still count this page view and show this tab as online when persistent storage is blocked.
    visitorId = crypto.randomUUID();
  }

  post("view").finally(refresh);
  window.setInterval(() => {
    if (document.visibilityState === "visible") post("heartbeat").finally(refresh);
  }, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") post("heartbeat").finally(refresh);
  });
})();
