/**
 * main.js (v2.5.0)
 * Enhanced version with improved error handling, performance, and security
 * 
 * Features:
 * - Watchdog: splash auto-hide after 5s max
 * - Timeout wrapper for async operations (anti-hang)
 * - Router starts early for instant UI
 * - Global error handlers with user-friendly feedback
 * - Progressive enhancement approach
 */
import "./splashFinal.js";

import { initFirebase } from './lib/firebase.js';
import { router } from './router.js';
import { mountBottomNav } from './components/BottomNav.js';
import { toast } from './components/Toast.js';
import { theme } from './lib/theme.js';
import { net } from './lib/net.js';
import { themeEvents } from './lib/themeEvents.js';

function removeSplash(reason = "") {
  // 1) splashFinal API (jika ada)
  try { window.KARTEJI_SPLASH?.done(reason); } catch {}
  // 2) fallback: remove #splash element
  const splash = document.getElementById('splash');
  if (splash) {
    splash.classList.add('opacity-0');
    setTimeout(() => splash.remove(), 320);
  }
}

function withTimeout(promise, ms, label = "timeout") {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(label)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

// Watchdog: jangan pernah stuck lebih dari 5 detik
const watchdog = setTimeout(() => {
  removeSplash("Menyiapkan aplikasi…");
  // kalau app masih kosong, tampilkan fallback agar tidak putih
  const app = document.getElementById('app');
  if (app && !app.innerHTML.trim()) {
    app.innerHTML = `
      <section class="p-4 space-y-3 max-w-md mx-auto">
        <div class="rounded-2xl border border-border p-4">
          <h2 class="font-semibold">Aplikasi siap, namun UI belum muncul.</h2>
          <p class="text-sm opacity-80 mt-1">
            Ini biasanya karena modul JS terhambat (cache PWA / jaringan / hosting).
          </p>
          <div class="flex gap-2 mt-3">
            <button id="btnReload" class="w-full rounded-xl px-4 py-2 bg-primary text-white">Muat Ulang</button>
            <button id="btnHome" class="w-full rounded-xl px-4 py-2 border border-border">Buka Home</button>
          </div>
        </div>
      </section>
    `;
    app.querySelector('#btnReload')?.addEventListener('click', () => location.reload());
    app.querySelector('#btnHome')?.addEventListener('click', () => { location.hash = '#/home'; });
  }
}, 5000);

window.addEventListener('error', (e) => {
  console.error("GLOBAL ERROR", e?.error || e);
  toast('Terjadi kesalahan saat memuat aplikasi.');
  removeSplash("Terjadi kendala…");
});
window.addEventListener('unhandledrejection', (e) => {
  console.error("UNHANDLED", e?.reason || e);
  toast('Terjadi kesalahan saat memuat aplikasi.');
  removeSplash("Terjadi kendala…");
});

(async function boot(){
  const bootStart = performance.now();
  
  try{
    // Initialize analytics first
    const { analytics } = await import('./lib/analytics.js');
    analytics.init();
    analytics.trackEvent('app', 'boot_start');

    theme.init();
    net.init();

    // Mulai router dulu supaya UI tidak kosong walau Firebase lambat
    mountBottomNav();
    router.start();

    // Firebase (timeout anti-hang)
    await withTimeout(initFirebase(), 8000, "initFirebase timeout");
    analytics.trackEvent('app', 'firebase_ready');

    // PWA SW - pastikan path absolut (di Vercel sering gagal kalau relatif dari /src)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => analytics.trackEvent('pwa', 'sw_registered'))
        .catch((e) => {
          console.warn('SW registration failed:', e);
          analytics.trackError('sw_error', e.message);
        });
    }

    // Dynamic theme overlay (timeout anti-hang)
    await withTimeout(themeEvents.init(), 5000, "themeEvents timeout").catch((e)=>{
      console.warn('Theme events init failed:', e);
      analytics.trackError('theme_error', e.message);
    });

    const bootTime = performance.now() - bootStart;
    analytics.trackPerformance('boot_complete', bootTime);
    console.log(`[KARTEJI] Boot complete in ${Math.round(bootTime)}ms`);

  }catch(err){
    console.error('Boot error:', err);
    toast('Terjadi kesalahan saat memuat aplikasi.');
    try {
      const { analytics } = await import('./lib/analytics.js');
      analytics.trackError('boot_error', err.message);
    } catch {}
  }finally{
    clearTimeout(watchdog);
    removeSplash("");
  }
})();
