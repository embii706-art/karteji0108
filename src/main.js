/**
 * main.js (v2.5 PREMIUM)
 * Enhanced with glassmorphism, 3D effects, smart search, and social sharing
 */
import "./splashFinal.js";

import { initFirebase } from './lib/firebase.js';
import { router } from './router.js';
import { mountBottomNav } from './components/BottomNav.js';
import { toast } from './components/Toast.js';
import { theme } from './lib/theme.js';
import { net } from './lib/net.js';
import { themeEvents } from './lib/themeEvents.js';
import { initSearchData, openSearch } from './components/SmartSearch.js';
import { shareContent, mountShareButton } from './components/SocialShare.js';

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

    // Initialize v2.5 features
    initSearchData();
    
    // Expose global functions for UI
    window.openSmartSearch = openSearch;
    window.openShareDialog = shareContent;

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
    
    // Mount floating share button
    mountShareButton();

  }catch(err){
    console.error(err);
    toast('Terjadi kesalahan saat memuat aplikasi.');
  }finally{
    clearTimeout(watchdog);
    removeSplash("");
  }
})();
