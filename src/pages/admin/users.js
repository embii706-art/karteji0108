import { skeletonList } from '../../components/Skeleton.js';
import { emptyState } from '../../components/EmptyState.js';

export async function adminUsers(){
  setTimeout(() => loadUsers(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">manage_accounts</span>
          Kelola Pengguna
        </h1>
      </div>
      
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <div class="text-2xl font-bold">0</div>
          <div class="text-xs opacity-70 mt-1">Pending</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <div class="text-2xl font-bold text-green-600">0</div>
          <div class="text-xs opacity-70 mt-1">Approved</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <div class="text-2xl font-bold text-red-600">0</div>
          <div class="text-xs opacity-70 mt-1">Rejected</div>
        </div>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[20px] opacity-50">search</span>
          <input type="text" placeholder="Cari pengguna..." class="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm" />
        </div>
      </div>
      
      <div id="usersContent">
        ${skeletonList(5)}
      </div>
    </section>
  `;
}

function loadUsers() {
  const container = document.getElementById('usersContent');
  if (!container) return;
  
  const users = [];
  
  if (users.length === 0) {
    container.innerHTML = emptyState({
      icon: 'person_add',
      title: 'Belum ada pengguna pending',
      description: 'Pengguna baru yang mendaftar akan muncul di sini untuk disetujui.'
    });
  }
}