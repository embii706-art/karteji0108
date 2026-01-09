/**
 * Dashboard Widgets for Home Page
 * Quick stats, recent activity, and useful shortcuts
 */

import { db, auth } from '../lib/firebase.js';
import { collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { skeletonStats, skeletonList } from './Skeleton.js';

/**
 * Quick stats widget
 * @param {object} stats - Stats data
 * @returns {string} HTML string
 */
export function quickStats(stats = {}) {
  const {
    totalMembers = 0,
    totalActivities = 0,
    pendingApprovals = 0,
    balance = 0
  } = stats;

  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-rounded text-[24px]">bar_chart</span>
        Statistik Cepat
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-center">
          <div class="text-3xl font-bold text-[rgb(var(--primary))] mb-1">${totalMembers}</div>
          <div class="text-xs opacity-70">Anggota</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-center">
          <div class="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">${totalActivities}</div>
          <div class="text-xs opacity-70">Kegiatan</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-center">
          <div class="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">${pendingApprovals}</div>
          <div class="text-xs opacity-70">Pending</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-center">
          <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            ${balance > 0 ? 'Rp ' + balance.toLocaleString('id-ID') : 'Rp 0'}
          </div>
          <div class="text-xs opacity-70">Saldo Kas</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Recent activities widget
 * @param {Array} activities - Recent activities
 * @returns {string} HTML string
 */
export function recentActivities(activities = []) {
  if (activities.length === 0) {
    return `
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="material-symbols-rounded text-[24px]">history</span>
          Aktivitas Terbaru
        </h3>
        <div class="text-center py-8 opacity-70">
          <span class="material-symbols-rounded text-[48px] mb-2">event_busy</span>
          <p class="text-sm">Belum ada aktivitas terbaru</p>
        </div>
      </div>
    `;
  }

  const items = activities.slice(0, 5).map(activity => `
    <div class="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--bg)] transition">
      <div class="w-10 h-10 rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-rounded text-[20px] text-[rgb(var(--primary))]">
          ${activity.type === 'activity' ? 'event' : activity.type === 'member' ? 'person' : 'notifications'}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm">${activity.title}</div>
        <div class="text-xs opacity-70 mt-0.5">${activity.time}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-rounded text-[24px]">history</span>
        Aktivitas Terbaru
      </h3>
      <div class="space-y-2">
        ${items}
      </div>
      <a href="#/activities" class="block mt-4 text-center text-sm text-[rgb(var(--primary))] font-semibold hover:underline">
        Lihat Semua →
      </a>
    </div>
  `;
}

/**
 * Quick actions widget
 * @returns {string} HTML string
 */
export function quickActions() {
  const actions = [
    { icon: 'event', label: 'Buat Kegiatan', hash: '#/activities', color: 'blue' },
    { icon: 'description', label: 'Upload Dokumen', hash: '#/documents', color: 'green' },
    { icon: 'account_balance_wallet', label: 'Catat Transaksi', hash: '#/finance', color: 'purple' },
    { icon: 'group', label: 'Lihat Anggota', hash: '#/members', color: 'orange' },
  ];

  const items = actions.map(action => {
    const colorMap = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
      green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30',
    };
    
    return `
      <a href="${action.hash}" class="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:shadow-md transition active:scale-[0.98]">
        <div class="w-10 h-10 rounded-full ${colorMap[action.color]} flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-rounded text-[20px]">${action.icon}</span>
        </div>
        <span class="font-semibold text-sm">${action.label}</span>
      </a>
    `;
  }).join('');

  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-rounded text-[24px]">bolt</span>
        Aksi Cepat
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Announcements widget
 * @param {Array} announcements - Announcements list
 * @returns {string} HTML string
 */
export function announcements(announcements = []) {
  if (announcements.length === 0) {
    return `
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="material-symbols-rounded text-[24px]">campaign</span>
          Pengumuman
        </h3>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
          <p class="text-sm opacity-70">
            ✨ Selamat datang di KARTEJI v2.5! Nikmati fitur-fitur baru dan performa yang lebih baik.
          </p>
        </div>
      </div>
    `;
  }

  const items = announcements.slice(0, 3).map(ann => `
    <div class="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="font-semibold text-sm">${ann.title}</div>
        ${ann.important ? '<span class="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">Penting</span>' : ''}
      </div>
      <p class="text-sm opacity-70">${ann.message}</p>
      <div class="text-xs opacity-50 mt-2">${ann.date}</div>
    </div>
  `).join('');

  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-rounded text-[24px]">campaign</span>
        Pengumuman
      </h3>
      <div class="space-y-3">
        ${items}
      </div>
    </div>
  `;
}

/**
 * Upcoming events widget
 * @param {Array} events - Upcoming events
 * @returns {string} HTML string
 */
export function upcomingEvents(events = []) {
  if (events.length === 0) {
    return `
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="material-symbols-rounded text-[24px]">event_upcoming</span>
          Kegiatan Mendatang
        </h3>
        <div class="text-center py-8 opacity-70">
          <span class="material-symbols-rounded text-[48px] mb-2">event_available</span>
          <p class="text-sm">Belum ada kegiatan yang dijadwalkan</p>
          <a href="#/activities" class="inline-block mt-3 text-sm text-[rgb(var(--primary))] font-semibold hover:underline">
            Buat Kegiatan Baru →
          </a>
        </div>
      </div>
    `;
  }

  const items = events.slice(0, 4).map(event => `
    <div class="flex gap-3 p-3 rounded-xl border border-[var(--border)] hover:shadow-md transition">
      <div class="text-center flex-shrink-0 w-14">
        <div class="text-2xl font-bold text-[rgb(var(--primary))]">${event.day}</div>
        <div class="text-xs opacity-70">${event.month}</div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm truncate">${event.title}</div>
        <div class="text-xs opacity-70 mt-1 flex items-center gap-1">
          <span class="material-symbols-rounded text-[14px]">schedule</span>
          ${event.time}
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="material-symbols-rounded text-[24px]">event_upcoming</span>
        Kegiatan Mendatang
      </h3>
      <div class="space-y-3">
        ${items}
      </div>
      <a href="#/activities" class="block mt-4 text-center text-sm text-[rgb(var(--primary))] font-semibold hover:underline">
        Lihat Semua →
      </a>
    </div>
  `;
}

/**
 * Load dashboard data
 * @returns {Promise<object>} Dashboard data
 */
export async function loadDashboardData() {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    // In a real app, fetch from Firestore
    // For now, return mock data
    return {
      stats: {
        totalMembers: 24,
        totalActivities: 12,
        pendingApprovals: 3,
        balance: 5420000
      },
      recentActivities: [
        { type: 'activity', title: 'Rapat Bulanan dijadwalkan', time: '2 jam yang lalu' },
        { type: 'member', title: 'Ahmad Fauzi bergabung', time: '5 jam yang lalu' },
        { type: 'notification', title: 'Dokumen baru diupload', time: '1 hari yang lalu' },
      ],
      announcements: [
        { 
          title: 'Update Sistem v2.5', 
          message: 'Sistem telah diperbarui dengan fitur baru dan peningkatan performa.',
          date: '9 Jan 2026',
          important: true
        }
      ],
      upcomingEvents: [
        { day: '15', month: 'Jan', title: 'Rapat Bulanan', time: '14:00 - 16:00' },
        { day: '20', month: 'Jan', title: 'Kegiatan Sosial', time: '09:00 - 12:00' },
      ]
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return null;
  }
}
