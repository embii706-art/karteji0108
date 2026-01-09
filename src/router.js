
import { render } from './render.js';
import * as pages from './pages/index.js';
import { setTitle } from './lib/ui.js';
import { authGate } from './lib/gates.js';

const routes = {
  '#/auth/masuk': pages.authMasuk,
  '#/auth/daftar': pages.authDaftar,
  '#/auth/buat-profil': pages.authBuatProfil,
  '#/pending': pages.pending,
  '#/home': pages.home,
  '#/feed': pages.feed,
  '#/feed/create': pages.feedCreate,
  '#/feed/edit': pages.feedEdit,
  '#/activities': pages.activities,
  '#/activities/create': pages.activitiesCreate,
  '#/activities/edit': pages.activitiesEdit,
  '#/finance': pages.finance,
  '#/calendar': pages.calendar,
  '#/members': pages.members,
  '#/members/create': pages.membersCreate,
  '#/members/edit': pages.membersEdit,
  '#/minutes': pages.minutes,
  '#/documents': pages.documents,
  '#/documents/upload': pages.documentsUpload,
  '#/documents/edit': pages.documentsEdit,
  '#/periods': pages.periods,
  '#/admin': pages.admin,
  '#/admin/users': pages.adminUsers,
  '#/admin/roles': pages.adminRoles,
  '#/admin/inbox': pages.adminInbox,
};

function normalizeHash(){
  const h = location.hash || '#/home';
  if(h === '#') return '#/home';
  return h;
}

export const router = {
  start(){
    window.addEventListener('hashchange', ()=> this.go(normalizeHash()));
    this.go(normalizeHash());
  },
  async go(hash){
    try {
      const fn = routes[hash] || pages.notFound;
      const gatedHash = await authGate(hash);
      if(gatedHash && gatedHash !== hash){
        location.hash = gatedHash;
        return;
      }
      
      // Track page view
      try {
        const { analytics } = await import('./lib/analytics.js');
        analytics.trackPageView(hash);
      } catch {}
      
      // bottom nav visibility handled by render()
      const html = await fn();
      render(html, hash);
      setTitle(hash);
    } catch (err) {
      console.error('Router error:', err);
      try {
        const { analytics } = await import('./lib/analytics.js');
        analytics.trackError('router_error', err.message);
      } catch {}
      
      // Show error page
      const errorHtml = `
        <section class="p-4 max-w-md mx-auto">
          <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div class="font-bold text-red-500">Terjadi Kesalahan</div>
            <div class="text-sm opacity-70 mt-1">Halaman gagal dimuat. Silakan coba lagi.</div>
            <button onclick="location.hash='#/home'" class="mt-3 w-full h-10 rounded-xl bg-[rgb(var(--primary))] text-white">
              Kembali ke Beranda
            </button>
          </div>
        </section>
      `;
      render(errorHtml, hash);
    }
  }
};
