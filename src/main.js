/**
 * main.js (v1.8.5 HANGFIX)
 * Target: Vercel/PWA kadang stuck di splash karena promise hang (auth/themeEvents/fetch)
 * Solusi:
 * - Watchdog: splash hilang maksimal 5 detik apapun yang terjadi
 * - Timeout wrapper untuk initFirebase + themeEvents
 * - Router start dilakukan lebih awal agar UI pasti muncul
 * - Global error/unhandledrejection -> toast + hide splash
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
  try{
    theme.init();
    net.init();

    // Mulai router dulu supaya UI tidak kosong walau Firebase lambat
    mountBottomNav();
    router.start();

    // Firebase (timeout anti-hang)
    await withTimeout(initFirebase(), 8000, "initFirebase timeout");

    // PWA SW - pastikan path absolut (di Vercel sering gagal kalau relatif dari /src)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }

    // Dynamic theme overlay (timeout anti-hang)
    await withTimeout(themeEvents.init(), 5000, "themeEvents timeout").catch(()=>{});

  }catch(err){
    console.error(err);
    toast('Terjadi kesalahan saat memuat aplikasi.');
  }finally{
    clearTimeout(watchdog);
    removeSplash("");
  }
})();
