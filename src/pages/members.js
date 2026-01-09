
import { emptyMembers } from '../components/EmptyState.js';

export async function members(){
  setTimeout(() => bindEvents(), 0);
  
  return `
    <section class="p-4 max-w-5xl mx-auto space-y-4">
      <!-- Header -->
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <span class="material-symbols-rounded text-[28px] text-orange-600 dark:text-orange-400">group</span>
            </div>
            <div>
              <h2 class="font-bold text-xl">Anggota</h2>
              <p class="text-sm opacity-70">Daftar anggota dan status presence</p>
            </div>
          </div>
        </div>
        
        <!-- Search & Filter -->
        <div class="mt-4 flex gap-2">
          <input type="search" placeholder="Cari anggota..." class="flex-1 h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:border-[rgb(var(--primary))] focus:outline-none" />
          <button class="px-4 h-10 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] transition">
            <span class="material-symbols-rounded text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div class="text-3xl font-bold text-[rgb(var(--primary))]">24</div>
          <div class="text-xs opacity-70 mt-1">Total Anggota</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400">18</div>
          <div class="text-xs opacity-70 mt-1">Aktif</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">3</div>
          <div class="text-xs opacity-70 mt-1">Pending</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
          <div class="text-xs opacity-70 mt-1">Online</div>
        </div>
      </div>

      <!-- Members List Placeholder -->
      <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="font-semibold mb-3">Daftar Anggota Aktif</div>
        <div class="text-center py-8 opacity-70">
          <span class="material-symbols-rounded text-[48px] mb-2">account_circle</span>
          <p class="text-sm">Daftar anggota akan ditampilkan di sini</p>
          <p class="text-xs mt-1">Implementasi presence: <code>presence/{uid}</code></p>
        </div>
      </div>

      <!-- Info -->
      <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="font-semibold mb-2 flex items-center gap-2">
          <span class="material-symbols-rounded text-[20px]">info</span>
          Tentang Presence
        </div>
        <p class="text-sm opacity-70">
          Semua role dapat melihat status online/offline dan role anggota.
          Sistem presence otomatis melacak aktivitas dan waktu terakhir terlihat.
        </p>
      </div>
    </section>
  `;
}

function bindEvents() {
  // Events will be added heress="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">group</span>
          Anggota
        </h1>
        <button class="px-4 h-10 rounded-xl border border-[var(--border)] text-sm font-semibold active:scale-[0.98] transition">
          <span class="material-symbols-rounded text-[18px]">filter_list</span>
        </button>
      </div>
      
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-[20px] opacity-50">search</span>
          <input type="text" placeholder="Cari anggota..." class="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm" />
        </div>
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <div class="text-2xl font-bold">0</div>
          <div class="text-xs opacity-70 mt-1">Total Anggota</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
          <div class="text-2xl font-bold text-green-600">0</div>
          <div class="text-xs opacity-70 mt-1">Online</div>
        </div>
      </div>
      
      <div id="membersContent">
        ${skeletonList(5)}
      </div>
    </section>
  `;
}

function loadMembers() {
  const container = document.getElementById('membersContent');
  if (!container) return;
  
  const members = [];
  
  if (members.length === 0) {
    container.innerHTML = emptyMembers();
  }
}
