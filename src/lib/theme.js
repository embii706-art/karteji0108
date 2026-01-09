
import { toast } from '../components/Toast.js';

const KEY='karteji_theme'; // terang|gelap|sistem

function apply(mode){
  const root = document.documentElement;
  root.dataset.theme = mode;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = (mode==='gelap') || (mode==='sistem' && prefersDark);
  root.classList.toggle('dark', dark);
}

export const theme = {
  init(){
    const saved = localStorage.getItem(KEY) || 'sistem';
    apply(saved);

    const btn = document.getElementById('themeBtn');
    const cycle = ['sistem','gelap','terang'];
    btn?.addEventListener('click', ()=>{
      const cur = localStorage.getItem(KEY) || 'sistem';
      const next = cycle[(cycle.indexOf(cur)+1)%cycle.length];
      localStorage.setItem(KEY, next);
      apply(next);
      toast(`Tema: ${next==='sistem'?'Sistem':next==='gelap'?'Gelap':'Terang'}`);
    });

    // react to system change
    if(window.matchMedia){
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
        const cur = localStorage.getItem(KEY) || 'sistem';
        apply(cur);
      });
    }
  },
  setAccent(rgb){ // "34 197 94"
    document.documentElement.style.setProperty('--primary', rgb);
  }
};
