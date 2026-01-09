import { skeletonList } from '../components/Skeleton.js';

export async function periods(){
  setTimeout(() => loadPeriods(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">history</span>
          Periode & Arsip
        </h1>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-[rgb(var(--primary))]/10 p-4">
        <div class="flex items-start gap-3">
          <span class="material-symbols-rounded text-[rgb(var(--primary))] text-[32px]">info</span>
          <div>
            <div class="font-bold text-[rgb(var(--primary))]">Periode Aktif</div>
            <div class="text-sm opacity-70 mt-1">Periode 2025/2026 sedang berjalan. Data arsip periode sebelumnya dapat diakses dalam mode read-only.</div>
          </div>
        </div>
      </div>
      
      <div id="periodsContent">
        ${skeletonList(2)}
      </div>
    </section>
  `;
}

function loadPeriods() {
  const container = document.getElementById('periodsContent');
  if (!container) return;
  
  const periods = [
    { year: '2025/2026', status: 'active', dataCount: 0 },
    { year: '2024/2025', status: 'archived', dataCount: 156 }
  ];
  
  container.innerHTML = periods.map(period => `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-bold flex items-center gap-2">
            Periode ${period.year}
            ${period.status === 'active' ? '<span class="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-semibold">Aktif</span>' : '<span class="px-2 py-1 rounded-full bg-gray-500 text-white text-xs font-semibold">Arsip</span>'}
          </div>
          <div class="text-sm opacity-70 mt-1">${period.dataCount} data tersimpan</div>
        </div>
        <button class="px-4 h-9 rounded-lg border border-[var(--border)] text-sm font-semibold">
          ${period.status === 'active' ? 'Kelola' : 'Lihat Arsip'}
        </button>
      </div>
    </div>
  `).join('');
}