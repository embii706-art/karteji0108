/**
 * Splash Final (v1.8.3)
 * - Tidak mungkin stuck: ada timeout fail-safe
 * - Animasi halus (fade + scale)
 * - Dark/Light/System friendly
 * - Respect prefers-reduced-motion
 * - Bisa dipanggil manual: window.KARTEJI_SPLASH.done()
 */
(function () {
  const MOTION_OK = !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const HIDE_MS = MOTION_OK ? 220 : 0;

  function ensureStyle() {
    if (document.getElementById("splash-style")) return;
    const s = document.createElement("style");
    s.id = "splash-style";
    s.textContent = `
      :root{--k-bg:#F8FAFC;--k-fg:#0F172A;--k-muted:#64748B;--k-card:rgba(255,255,255,.92)}
      @media (prefers-color-scheme: dark){:root{--k-bg:#0B1220;--k-fg:#E2E8F0;--k-muted:#94A3B8;--k-card:rgba(15,23,42,.72)}}
      .k-splash{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--k-bg);z-index:9999}
      .k-splash-card{width:min(360px,92vw);padding:22px 18px;border-radius:18px;background:var(--k-card);backdrop-filter:blur(10px);box-shadow:0 18px 50px rgba(0,0,0,.12);text-align:center;border:1px solid rgba(148,163,184,.25)}
      .k-splash-logo{width:72px;height:72px;border-radius:16px;display:block;margin:0 auto 12px auto;object-fit:cover;box-shadow:0 10px 24px rgba(0,0,0,.18)}
      .k-splash-title{margin:0;font-size:18px;font-weight:800;letter-spacing:.4px;color:var(--k-fg)}
      .k-splash-sub{margin:6px 0 14px 0;font-size:13px;color:var(--k-muted)}
      .k-bar{height:8px;border-radius:999px;background:rgba(148,163,184,.25);overflow:hidden}
      .k-bar > i{display:block;height:100%;width:44%;border-radius:999px;background:rgba(59,130,246,.85);
        animation:kbar 1.05s ease-in-out infinite}
      @keyframes kbar{0%{transform:translateX(-110%)}50%{transform:translateX(70%)}100%{transform:translateX(220%)}}
      .k-fadeout{opacity:0;transform:scale(.985);transition:opacity 220ms ease, transform 220ms ease}
      @media (prefers-reduced-motion: reduce){
        .k-bar > i{animation:none;width:100%}
        .k-fadeout{transition:none}
      }
    `;
    document.head.appendChild(s);
  }

  function ensureSplash() {
    ensureStyle();
    let el = document.getElementById("splash");
    if (el) {
      // normalize classes for transition
      el.classList.add("k-splash");
      return el;
    }

    el = document.createElement("div");
    el.id = "splash";
    el.className = "k-splash";
    const logoSrc =
      document.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      "/apple-touch-icon.png";

    el.innerHTML = `
      <div class="k-splash-card" role="status" aria-live="polite">
        <img class="k-splash-logo" src="${logoSrc}" alt="Logo KARTEJI" />
        <h1 class="k-splash-title">KARTEJI</h1>
        <p class="k-splash-sub">Memuat…</p>
        <div class="k-bar" aria-hidden="true"><i></i></div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function hideNow(reason) {
    const el = document.getElementById("splash");
    if (!el) return;
    if (el.dataset.hiding === "1") return;
    el.dataset.hiding = "1";

    // Optional: update subtitle before hiding
    const sub = el.querySelector?.(".k-splash-sub");
    if (sub && reason) sub.textContent = reason;

    if (MOTION_OK) el.classList.add("k-fadeout");
    setTimeout(() => el.remove(), HIDE_MS);
  }

  // Public API (optional)
  window.KARTEJI_SPLASH = {
    ensure: ensureSplash,
    done: (reason) => hideNow(reason || ""),
  };

  // Auto ensure splash exists on load (so no HTML dependency)
  document.addEventListener("DOMContentLoaded", () => {
    ensureSplash();
  });

  // Fail-safe: kalau init/auth/firestore nge-hang, tetap masuk UI
  setTimeout(() => {
    // Jangan nunggu selamanya. Hilangkan splash, tampilkan UI.
    hideNow("Menyiapkan aplikasi…");
  }, 4500);
})();
