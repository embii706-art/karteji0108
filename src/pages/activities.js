import { skeletonList } from '../components/Skeleton.js';
import { emptyActivities } from '../components/EmptyState.js';

export async function activities(){
  setTimeout(() => loadActivities(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">event</span>
          Kegiatan
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Kegiatan Baru
        </button>
      </div>
      
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button class="filter-btn active px-4 h-9 rounded-full border border-[var(--border)] text-sm font-semibold whitespace-nowrap">Semua</button>
        <button class="filter-btn px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Upcoming</button>
        <button class="filter-btn px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Selesai</button>
      </div>
      
      <div id="activitiesContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadActivities() {
  const container = document.getElementById('activitiesContent');
  if (!container) return;
  
  // Simulate data (replace with Firestore query)
  const activities = [];
  
  if (activities.length === 0) {
    container.innerHTML = emptyActivities();
  } else {
    container.innerHTML = activities.map(activity => renderActivity(activity)).join('');
  }
}

function renderActivity(activity) {
  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-md transition">
      <div class="flex items-start gap-3">
        <div class="w-12 h-12 rounded-xl bg-[rgb(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-rounded text-[rgb(var(--primary))]">event</span>
        </div>
        <div class="flex-1">
          <h3 class="font-bold">${activity.title}</h3>
          <div class="text-sm opacity-70 mt-1">${activity.date} • ${activity.location}</div>
          <div class="flex gap-2 mt-3">
            <button class="px-3 h-8 rounded-lg bg-[rgb(var(--primary))] text-white text-xs font-semibold">Detail</button>
            <button class="px-3 h-8 rounded-lg border border-[var(--border)] text-xs font-semibold">Absensi</button>
          </div>
        </div>
      </div>
    </div>
  `;
}