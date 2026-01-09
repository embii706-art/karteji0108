/**
 * Empty State Component
 * Provides friendly illustrations and CTAs when no data is available
 * @version 2.5.0
 */

/**
 * Generic empty state
 * @param {object} options - Configuration options
 * @returns {string} HTML for empty state
 */
export function emptyState({ 
  icon = 'inbox', 
  title = 'Tidak ada data', 
  description = 'Belum ada item untuk ditampilkan.',
  actionText = '',
  actionHash = '',
  illustration = ''
}) {
  return `
    <div class="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      ${illustration || `
        <div class="w-32 h-32 rounded-full bg-[var(--border)] flex items-center justify-center mb-4">
          <span class="material-symbols-rounded text-[64px] opacity-30">${icon}</span>
        </div>
      `}
      <h3 class="font-bold text-lg mb-2">${title}</h3>
      <p class="text-sm opacity-70 mb-4">${description}</p>
      ${actionText ? `
        <a href="${actionHash}" class="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-[rgb(var(--primary))] text-white font-semibold hover:shadow-lg transition active:scale-[0.98]">
          <span class="material-symbols-rounded text-[20px]">add</span>
          ${actionText}
        </a>
      ` : ''}
    </div>
  `;
}

/**
 * Empty inbox state
 */
export function emptyInbox() {
  return emptyState({
    icon: 'mail',
    title: 'Kotak masuk kosong',
    description: 'Anda belum memiliki surat masuk. Surat baru akan muncul di sini.',
    illustration: `
      <svg class="w-32 h-32 mb-4 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="60" width="160" height="100" rx="8" fill="var(--border)" opacity="0.3"/>
        <path d="M20 80 L100 120 L180 80" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.5"/>
        <circle cx="100" cy="50" r="12" fill="rgb(var(--primary))" opacity="0.8"/>
      </svg>
    `
  });
}

/**
 * Empty activities/events state
 */
export function emptyActivities() {
  return emptyState({
    icon: 'event',
    title: 'Belum ada kegiatan',
    description: 'Mulai dengan membuat kegiatan pertama untuk organisasi Anda.',
    actionText: 'Buat Kegiatan',
    actionHash: '#/activities/create',
    illustration: `
      <svg class="w-32 h-32 mb-4 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="40" width="140" height="140" rx="12" fill="var(--border)" opacity="0.3"/>
        <line x1="30" y1="80" x2="170" y2="80" stroke="currentColor" stroke-width="3" opacity="0.5"/>
        <circle cx="60" cy="60" r="8" fill="rgb(var(--primary))" opacity="0.8"/>
        <circle cx="100" cy="60" r="8" fill="rgb(var(--primary))" opacity="0.8"/>
        <circle cx="140" cy="60" r="8" fill="rgb(var(--primary))" opacity="0.8"/>
        <rect x="50" y="100" width="40" height="40" rx="6" fill="rgb(var(--primary))" opacity="0.6"/>
        <rect x="110" y="100" width="40" height="40" rx="6" fill="var(--border)" opacity="0.4"/>
      </svg>
    `
  });
}

/**
 * Empty finance/transactions state
 */
export function emptyFinance() {
  return emptyState({
    icon: 'account_balance_wallet',
    title: 'Belum ada transaksi',
    description: 'Catat pemasukan dan pengeluaran kas organisasi Anda di sini.',
    actionText: 'Tambah Transaksi',
    actionHash: '#/finance/add',
    illustration: `
      <svg class="w-32 h-32 mb-4 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="70" width="120" height="80" rx="8" fill="var(--border)" opacity="0.3"/>
        <circle cx="100" cy="110" r="20" fill="rgb(var(--primary))" opacity="0.6"/>
        <path d="M100 95 L100 125 M85 110 L115 110" stroke="white" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `
  });
}

/**
 * Empty feed/posts state
 */
export function emptyFeed() {
  return emptyState({
    icon: 'newspaper',
    title: 'Belum ada postingan',
    description: 'Feed akan menampilkan pengumuman dan update terbaru dari organisasi.',
    illustration: `
      <svg class="w-32 h-32 mb-4 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="40" width="140" height="120" rx="8" fill="var(--border)" opacity="0.3"/>
        <rect x="50" y="60" width="100" height="12" rx="4" fill="currentColor" opacity="0.4"/>
        <rect x="50" y="85" width="80" height="8" rx="4" fill="currentColor" opacity="0.3"/>
        <rect x="50" y="100" width="100" height="8" rx="4" fill="currentColor" opacity="0.3"/>
        <rect x="50" y="115" width="70" height="8" rx="4" fill="currentColor" opacity="0.3"/>
      </svg>
    `
  });
}

/**
 * Empty members state
 */
export function emptyMembers() {
  return emptyState({
    icon: 'group',
    title: 'Belum ada anggota',
    description: 'Anggota yang terdaftar akan muncul di sini setelah disetujui admin.',
    illustration: `
      <svg class="w-32 h-32 mb-4 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="80" cy="80" r="24" fill="var(--border)" opacity="0.4"/>
        <circle cx="120" cy="80" r="24" fill="rgb(var(--primary))" opacity="0.5"/>
        <path d="M80 110 Q80 140 100 140 Q120 140 120 110" fill="var(--border)" opacity="0.3"/>
      </svg>
    `
  });
}

/**
 * Empty documents state
 */
export function emptyDocuments() {
  return emptyState({
    icon: 'folder',
    title: 'Belum ada dokumen',
    description: 'Upload dokumen penting organisasi untuk diarsipkan di sini.',
    actionText: 'Upload Dokumen',
    actionHash: '#/documents/upload'
  });
}

/**
 * Search/filter no results
 */
export function noResults(searchTerm = '') {
  return emptyState({
    icon: 'search_off',
    title: 'Tidak ditemukan',
    description: searchTerm 
      ? `Tidak ada hasil untuk "${searchTerm}". Coba kata kunci lain.`
      : 'Tidak ada data yang sesuai dengan filter Anda.'
  });
}

/**
 * Error state
 */
export function errorState(message = 'Terjadi kesalahan saat memuat data.') {
  return `
    <div class="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div class="w-32 h-32 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <span class="material-symbols-rounded text-[64px] text-red-500">error</span>
      </div>
      <h3 class="font-bold text-lg mb-2">Oops!</h3>
      <p class="text-sm opacity-70 mb-4">${message}</p>
      <button onclick="location.reload()" class="inline-flex items-center gap-2 px-6 h-12 rounded-xl border border-[var(--border)] hover:bg-[var(--border)] transition active:scale-[0.98]">
        <span class="material-symbols-rounded text-[20px]">refresh</span>
        Muat Ulang
      </button>
    </div>
  `;
}
