
import { theme } from './theme.js';
import { net } from './net.js';

const state = {
  todayISO: new Date().toISOString().slice(0,10),
  events: [],
  prayer: null,
  locale: { city:'Semarang', lat:-6.9667, lon:110.4167 },
};

function setDecor(kind){
  const host = document.getElementById('themeDecor');
  if(!host) return;
  host.innerHTML = '';
  if(!kind) return;

  // minimal SVG + CSS animations (no heavy libs)
  if(kind==='ramadhan'){
    host.innerHTML = `
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-10 left-6 opacity-25" style="animation: floatSlow 4.2s ease-in-out infinite">
          ${lanternSvg()}
        </div>
        <div class="absolute top-8 right-6 opacity-20" style="animation: floatSlow 5.0s ease-in-out infinite">
          ${lanternSvg()}
        </div>
        <div class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-10">
          ${crescentSvg()}
        </div>
      </div>`;
  } else if(kind==='independence'){
    host.innerHTML = `
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-6 left-4 opacity-15">${confettiSvg()}</div>
        <div class="absolute top-10 right-4 opacity-15">${confettiSvg()}</div>
        <div class="absolute bottom-6 left-6 opacity-10">${flagWaveSvg()}</div>
      </div>`;
  } else if(kind==='nyepi'){
    host.innerHTML = `
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-10 left-1/2 -translate-x-1/2 opacity-10">${silentWaveSvg()}</div>
      </div>`;
  } else if(kind==='newyear'){
    host.innerHTML = `
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-8 left-8 opacity-12">${sparkleSvg()}</div>
        <div class="absolute top-20 right-8 opacity-12">${sparkleSvg()}</div>
      </div>`;
  }
}

function lanternSvg(){ return `<svg width="110" height="140" viewBox="0 0 110 140" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M55 10c10 0 18 8 18 18v4H37v-4c0-10 8-18 18-18Z" fill="rgb(var(--primary))"/>
<path d="M30 32h50v68c0 18-11 32-25 32S30 118 30 100V32Z" fill="rgba(255,255,255,.10)" stroke="rgb(var(--primary))" stroke-width="2"/>
<path d="M55 0v10" stroke="rgb(var(--primary))" stroke-width="2" stroke-linecap="round"/>
<path d="M55 132v8" stroke="rgb(var(--primary))" stroke-width="2" stroke-linecap="round"/>
</svg>`;}
function crescentSvg(){ return `<svg width="260" height="260" viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
<path d="M165 35c-45 10-75 52-65 98 10 46 56 76 101 66-41 24-94 10-122-32-28-42-21-99 17-133 18-16 42-25 69-29Z" fill="rgb(var(--primary))"/>
</svg>`;}
function confettiSvg(){ return `<svg width="180" height="120" viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="6" fill="rgb(var(--primary))"/><circle cx="80" cy="20" r="4" fill="rgb(var(--primary))"/>
<circle cx="140" cy="32" r="5" fill="rgb(var(--primary))"/><rect x="52" y="60" width="10" height="10" transform="rotate(15 52 60)" fill="rgb(var(--primary))"/>
<rect x="110" y="70" width="10" height="10" transform="rotate(-20 110 70)" fill="rgb(var(--primary))"/>
<path d="M20 90c20-30 60-30 80 0" stroke="rgb(var(--primary))" stroke-width="4" stroke-linecap="round"/>
</svg>`;}
function flagWaveSvg(){ return `<svg width="260" height="120" viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg">
<path d="M20 20v90" stroke="rgb(var(--primary))" stroke-width="6" stroke-linecap="round"/>
<path d="M26 24c40 20 80-20 120 0s80-20 108 0v52c-40-20-80 20-120 0S66 96 26 76V24Z" fill="rgba(255,255,255,.10)" stroke="rgb(var(--primary))" stroke-width="2"/>
</svg>`;}
function silentWaveSvg(){ return `<svg width="360" height="220" viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
<path d="M40 140c40-50 80 50 120 0s80 50 120 0" stroke="rgb(var(--primary))" stroke-width="6" stroke-linecap="round" fill="none"/>
<path d="M60 180c30-35 60 35 90 0s60 35 90 0" stroke="rgb(var(--primary))" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>
</svg>`;}
function sparkleSvg(){ return `<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
<path d="M80 18l8 38 38 8-38 8-8 38-8-38-38-8 38-8 8-38Z" fill="rgb(var(--primary))" opacity=".9"/>
</svg>`;}

async function fetchWithSlow(url, opts={}){
  const start = performance.now();
  const timeout = new Promise((_,rej)=> setTimeout(()=>rej(new Error('timeout')), 1800));
  try{
    const res = await Promise.race([fetch(url, opts), timeout]);
    const dur = performance.now()-start;
    net.markSlow(dur>900);
    return res;
  }catch(e){
    net.markSlow(true);
    throw e;
  }
}

async function loadHolidays(year){
  // Use Indonesia-focused free holiday API (vercel). Fallback: Nager.Date.
  try{
    const res = await fetchWithSlow(`https://api-harilibur.vercel.app/api?year=${year}`);
    const arr = await res.json();
    // normalize
    return (arr||[]).map(x=>({
      date: x.holiday_date || x.date || x.tanggal,
      title: x.holiday_name || x.keterangan || x.name || 'Hari Libur',
      isHoliday: true,
      type: 'nasional'
    })).filter(e=>e.date);
  }catch{
    try{
      const res = await fetchWithSlow(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
      const arr = await res.json();
      return (arr||[]).map(x=>({date:x.date, title:x.localName||x.name, isHoliday:true, type:'nasional'}));
    }catch{
      return [];
    }
  }
}

async function loadPrayerTimes(dateISO){
  const {lat, lon} = state.locale;
  // Prefer Indonesia Kemenag-based API if available; fallback to Aladhan.
  try{
    const res = await fetchWithSlow(`https://waktu-sholat.vercel.app/prayer?latitude=${lat}&longitude=${lon}`);
    const data = await res.json();
    const d = data?.data?.time;
    if(d) return {
      imsak: d.imsak, subuh: d.subuh, terbit: d.terbit, dhuha: d.dhuha,
      dzuhur: d.dzuhur, ashar: d.ashar, maghrib: d.maghrib, isya: d.isya,
      source: 'Kemenag'
    };
  }catch{}
  try{
    const res = await fetchWithSlow(`https://api.aladhan.com/v1/timings/${dateISO}?latitude=${lat}&longitude=${lon}&method=11`);
    const data = await res.json();
    const t = data?.data?.timings;
    if(t) return {
      imsak: t.Imsak, subuh: t.Fajr, terbit: t.Sunrise, dhuha: t.Dhuha || '-', 
      dzuhur: t.Dhuhr, ashar: t.Asr, maghrib: t.Maghrib, isya: t.Isha,
      source: 'Aladhan'
    };
  }catch{}
  return null;
}

function detectSeasonalTheme(events){
  const today = state.todayISO;
  const names = (events||[]).map(e=>(e.title||'').toLowerCase());
  // heuristic: ramadhan/puasa
  const ramadhan = names.some(n=> n.includes('ramadhan') || n.includes('ramadan') || n.includes('idul fitri') || n.includes('idulfitri'));
  if(ramadhan) return {accent:"34 197 94", decor:"ramadhan"}; // emerald-500
  // independence week
  if(today.slice(5,10) >= '08-10' && today.slice(5,10) <= '08-25') return {accent:"239 68 68", decor:"independence"}; // red-500
  const nyepi = names.some(n=> n.includes('nyepi'));
  if(nyepi) return {accent:"148 163 184", decor:"nyepi"}; // slate-400
  if(today.slice(5,10) === '01-01') return {accent:"59 130 246", decor:"newyear"}; // blue-500
  return null;
}

export const themeEvents = {
  async init(){
    const year = new Date().getFullYear();
    const holidays = await loadHolidays(year);
    const todayEvents = holidays.filter(e=>e.date === state.todayISO);

    // add locally important recurring events (updateable later via Firestore)
    const recurring = [
      { date: `${year}-10-28`, title:'Hari Sumpah Pemuda', isHoliday:false, type:'nasional' },
      { date: `${year}-11-10`, title:'Hari Pahlawan', isHoliday:false, type:'nasional' },
    ];
    const events = [...todayEvents, ...recurring.filter(e=>e.date===state.todayISO)];
    state.events = events;

    // theme overlay
    const overlay = detectSeasonalTheme([...todayEvents, ...recurring]);
    if(overlay){
      theme.setAccent(overlay.accent);
      setDecor(overlay.decor);
    }

    // prayer times & imsak
    state.prayer = await loadPrayerTimes(state.todayISO);

    // expose for pages
    window.__KARTEJI_CTX__ = { todayISO: state.todayISO, events: state.events, prayer: state.prayer, locale: state.locale };
  }
};
