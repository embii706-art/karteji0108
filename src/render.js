
import { shouldShowBottomNav } from './components/BottomNav.js';

export function render(html, hash){
  const app = document.getElementById('app');
  app.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'page-enter';
  wrap.innerHTML = html;
  app.appendChild(wrap);

  const nav = document.getElementById('bottomNav');
  nav.classList.toggle('hidden', !shouldShowBottomNav(hash));
}
