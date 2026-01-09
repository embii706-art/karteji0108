
import { skeletonList } from '../components/Skeleton.js';

export async function calendar(){
  const ctx = window.__KARTEJI_CTX__ || {};
  const today = ctx.todayISO || new Date().toISOString().slice(0,10);
  const prayer = ctx.prayer || {};
  const events = ctx.events || [];
  
  setTimeout(() => loadCalendar(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">calendar_month</span>
          Kalender
        </h1>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[rgb(var(--primary))]/10 to-transparent p-5">
        <div class="text-sm opacity-70 mb-2">Hari ini</div>
        <div class="text-3xl font-bold mb-1">${formatDate(today)}</div>
        ${events.length > 0 ? `<div class="text-sm font-semibold text-[rgb(var(--primary))]">${events[0].title}</div>` : ''}
      </div>
      
      ${prayer && prayer.subuh ? `
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="font-bold mb-3 flex items-center gap-2">
          <span class="material-symbols-rounded">mosque</span>
          Jadwal Sholat
        </div>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="text-xs opacity-70">Subuh</div>
            <div class="font-bold mt-1">${prayer.subuh || '-'}</div>
          </div>
          <div>
            <div class="text-xs opacity-70">Dzuhur</div>
            <div class="font-bold mt-1">${prayer.dzuhur || '-'}</div>
          </div>
          <div>
            <div class="text-xs opacity-70">Ashar</div>
            <div class="font-bold mt-1">${prayer.ashar || '-'}</div>
          </div>
          <div>
            <div class="text-xs opacity-70">Maghrib</div>
            <div class="font-bold mt-1">${prayer.maghrib || '-'}</div>
          </div>
          <div>
            <div class="text-xs opacity-70">Isya</div>
            <div class="font-bold mt-1">${prayer.isya || '-'}</div>
          </div>
          <div>
            <div class="text-xs opacity-70">Imsak</div>
            <div class="font-bold mt-1">${prayer.imsak || '-'}</div>
          </div>
        </div>
        <div class="text-xs opacity-60 mt-3 text-center">Sumber: ${prayer.source || 'Kemenag'}</div>
      </div>
      ` : ''}
      
      <div>
        <h2 class="font-bold mb-3">Hari Penting Bulan Ini</h2>
        <div id="calendarEvents">
          ${skeletonList(2)}
        </div>
      </div>
    </section>
  `;
}

function loadCalendar() {
  const container = document.getElementById('calendarEvents');
  if (!container) return;
  
  const importantDates = [
    { date: '2026-01-17', title: 'Maulid Nabi Muhammad SAW', type: 'holiday' },
    { date: '2026-01-28', title: 'Isra Mi\'raj', type: 'holiday' }
  ];
  
  if (importantDates.length === 0) {
    container.innerHTML = '<div class="text-sm opacity-70 text-center py-4">Tidak ada hari penting bulan ini</div>';
  } else {
    container.innerHTML = importantDates.map(event => `
      <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-[rgb(var(--primary))]/10 flex flex-col items-center justify-center flex-shrink-0">
          <div class="text-xs opacity-70">${new Date(event.date).toLocaleDateString('id', {month: 'short'}).toUpperCase()}</div>
          <div class="font-bold text-lg">${new Date(event.date).getDate()}</div>
        </div>
        <div class="flex-1">
          <div class="font-semibold">${event.title}</div>
          <div class="text-xs opacity-70">${event.type === 'holiday' ? 'Hari Libur' : 'Acara'}</div>
        </div>
      </div>
    `).join('');
  }
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
