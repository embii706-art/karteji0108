import { skeletonList } from '../components/Skeleton.js';
import { emptyState } from '../components/EmptyState.js';

export async function minutes(){
  setTimeout(() => loadMinutes(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">description</span>
          Notulen Rapat
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Notulen Baru
        </button>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="text-sm opacity-70">
          <strong>Tips:</strong> Notulen rapat dapat di-export ke PDF untuk dokumentasi resmi.
        </div>
      </div>
      
      <div id="minutesContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadMinutes() {
  const container = document.getElementById('minutesContent');
  if (!container) return;
  
  const minutes = [];
  
  if (minutes.length === 0) {
    container.innerHTML = emptyState({
      icon: 'description',
      title: 'Belum ada notulen',
      description: 'Catat hasil rapat dan keputusan penting di sini untuk dokumentasi organisasi.',
      actionText: 'Buat Notulen',
      actionHash: '#/minutes/create'
    });
  }
}