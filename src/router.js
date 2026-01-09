
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
  '#/activities': pages.activities,
  '#/finance': pages.finance,
  '#/calendar': pages.calendar,
  '#/members': pages.members,
  '#/minutes': pages.minutes,
  '#/documents': pages.documents,
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
    const fn = routes[hash] || pages.notFound;
    const gatedHash = await authGate(hash);
    if(gatedHash && gatedHash !== hash){
      location.hash = gatedHash;
      return;
    }
    // bottom nav visibility handled by render()
    const html = await fn();
    render(html, hash);
    setTitle(hash);
  }
};
