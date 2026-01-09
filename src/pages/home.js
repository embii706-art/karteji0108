import { skeletonStats, skeletonList } from '../components/Skeleton.js';
import { gettingStarted } from '../components/EmptyState.js';
import { 
  quickStats, 
  recentActivities, 
  quickActions, 
  announcements, 
  upcomingEvents,
  loadDashboardData 
} from '../components/DashboardWidgets.js';

let dashboardData = null;
let isLoading = true;

export async function home() {
  // Start loading data in background
  if (!dashboardData) {
    loadDashboardData().then(data => {
      dashboardData = data;
      isLoading = false;
      // Re-render with actual data
      refreshDashboard();
    }).catch(() => {
      isLoading = false;
    });
  }

  setTimeout(() => bindEvents(), 0);

  // Show skeleton loading initially
  if (isLoading && !dashboardData) {
    return `
      <section class="p-4 max-w-6xl mx-auto space-y-4">
        <!-- Header -->
        <div class="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold mb-1">Selamat Datang di KARTEJI 👋</h1>
              <p class="text-sm opacity-70">Sistem Manajemen Organisasi v2.5</p>
            </div>
            <span class="material-symbols-rounded text-[48px] opacity-20">dashboard</span>
          </div>
        </div>

        <!-- Loading skeletons -->
        <div class="skeleton h-6 w-32 rounded mb-2"></div>
        ${skeletonStats()}
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="space-y-4">
            ${skeletonList(3)}
          </div>
          <div class="space-y-4">
            ${skeletonList(3)}
          </div>
        </div>
      </section>
    `;
  }

  // Show actual dashboard
  const data = dashboardData || {
    stats: { totalMembers: 0, totalActivities: 0, pendingApprovals: 0, balance: 0 },
    recentActivities: [],
    announcements: [],
    upcomingEvents: []
  };

  return `
    <section class="p-4 max-w-6xl mx-auto space-y-4" id="dashboardContent">
      <!-- Welcome Header -->
      <div class="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold mb-1">Selamat Datang di KARTEJI 👋</h1>
            <p class="text-sm opacity-70">Sistem Manajemen Organisasi v2.5</p>
          </div>
          <button id="refreshBtn" class="px-4 h-10 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] transition active:scale-95 flex items-center gap-2" title="Refresh data">
            <span class="material-symbols-rounded text-[20px]">refresh</span>
            <span class="hidden sm:inline text-sm">Refresh</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div>
        <h2 class="font-bold text-lg mb-3 px-1">📊 Dashboard</h2>
        ${quickStats(data.stats)}
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Left Column (2/3) -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Quick Actions -->
          ${quickActions()}
          
          <!-- Upcoming Events -->
          ${upcomingEvents(data.upcomingEvents)}
          
          <!-- Getting Started Guide -->
          ${gettingStarted()}
        </div>

        <!-- Right Column (1/3) -->
        <div class="space-y-4">
          <!-- Announcements -->
          ${announcements(data.announcements)}
          
          <!-- Recent Activities -->
          ${recentActivities(data.recentActivities)}
        </div>
      </div>

      <!-- Quick Navigation Cards -->
      <div>
        <h2 class="font-bold text-lg mb-3 px-1">🚀 Menu Utama</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <a href="#/activities" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-blue-600 dark:text-blue-400">event</span>
            </div>
            <div class="font-semibold text-sm">Kegiatan</div>
            <div class="text-xs opacity-70 mt-1">Jadwal & absensi</div>
          </a>

          <a href="#/feed" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-green-600 dark:text-green-400">newspaper</span>
            </div>
            <div class="font-semibold text-sm">Feed</div>
            <div class="text-xs opacity-70 mt-1">Berita & update</div>
          </a>

          <a href="#/finance" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-purple-600 dark:text-purple-400">account_balance_wallet</span>
            </div>
            <div class="font-semibold text-sm">Kas</div>
            <div class="text-xs opacity-70 mt-1">Keuangan</div>
          </a>

          <a href="#/members" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-orange-600 dark:text-orange-400">group</span>
            </div>
            <div class="font-semibold text-sm">Anggota</div>
            <div class="text-xs opacity-70 mt-1">Daftar anggota</div>
          </a>

          <a href="#/calendar" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-red-600 dark:text-red-400">calendar_month</span>
            </div>
            <div class="font-semibold text-sm">Kalender</div>
            <div class="text-xs opacity-70 mt-1">Hari penting</div>
          </a>

          <a href="#/documents" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-teal-600 dark:text-teal-400">description</span>
            </div>
            <div class="font-semibold text-sm">Dokumen</div>
            <div class="text-xs opacity-70 mt-1">Arsip dokumen</div>
          </a>

          <a href="#/minutes" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-indigo-600 dark:text-indigo-400">assignment</span>
            </div>
            <div class="font-semibold text-sm">Notulen</div>
            <div class="text-xs opacity-70 mt-1">Catatan rapat</div>
          </a>

          <a href="#/admin" class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-lg transition active:scale-[0.98] group">
            <div class="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <span class="material-symbols-rounded text-[28px] text-pink-600 dark:text-pink-400">admin_panel_settings</span>
            </div>
            <div class="font-semibold text-sm">Admin</div>
            <div class="text-xs opacity-70 mt-1">Kelola sistem</div>
          </a>
        </div>
      </div>
    </section>
  `;
}

function bindEvents() {
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn?.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    const icon = refreshBtn.querySelector('.material-symbols-rounded');
    icon?.classList.add('animate-spin');
    
    try {
      dashboardData = await loadDashboardData();
      await refreshDashboard();
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      refreshBtn.disabled = false;
      icon?.classList.remove('animate-spin');
    }
  });
}

async function refreshDashboard() {
  const content = document.getElementById('dashboardContent');
  if (content) {
    const newContent = await home();
    const parser = new DOMParser();
    const doc = parser.parseFromString(newContent, 'text/html');
    const newSection = doc.querySelector('section');
    if (newSection) {
      content.innerHTML = newSection.innerHTML;
      bindEvents();
    }
  }
}
