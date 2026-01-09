
import { hapticTap } from '../lib/net.js';

const items = [
  { hash:'#/home', icon:'home', label:'Beranda' },
  { hash:'#/feed', icon:'newspaper', label:'Feed' },
  { hash:'#/activities', icon:'event', label:'Kegiatan' },
  { hash:'#/finance', icon:'account_balance_wallet', label:'Kas' },
  { hash:'#/profile', icon:'person', label:'Profil' },
];

export function shouldShowBottomNav(hash){
  return ['#/home','#/feed','#/activities','#/finance','#/profile','#/admin','#/calendar','#/members','#/minutes','#/documents','#/periods','#/admin/users','#/admin/roles','#/admin/inbox'].includes(hash);
}

export function mountBottomNav(){
  const root = document.querySelector('#bottomNav .h-16');
  root.innerHTML = '';
  items.forEach(it=>{
    const btn = document.createElement('a');
    btn.href = it.hash;
    btn.dataset.hash = it.hash;
    btn.className = 'flex-1 h-12 mx-1 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition active:scale-[0.96]';
    btn.innerHTML = `
      <span class="material-symbols-rounded text-[20px]">${it.icon}</span>
      <span class="hidden xs:inline">${it.label}</span>
    `;
    btn.addEventListener('click', ()=> hapticTap());
    root.appendChild(btn);
  });

  const updateActive = ()=>{
    const current = location.hash || '#/home';
    [...root.querySelectorAll('a')].forEach(a=>{
      const active = a.dataset.hash === current;
      a.classList.toggle('bg-[rgb(var(--primary))]', active);
      a.classList.toggle('text-white', active);
      a.classList.toggle('text-[var(--muted)]', !active);
    });
  };
  window.addEventListener('hashchange', updateActive);
  updateActive();
}
