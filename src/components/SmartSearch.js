/**
 * SmartSearch Component v2.5
 * Provides intelligent search across all app content
 */

let searchData = [];
let isSearchOpen = false;

// Initialize search data from all pages
export function initSearchData() {
  searchData = [
    { title: 'Beranda', description: 'Halaman utama aplikasi', path: '#/home', category: 'Navigation' },
    { title: 'Feed', description: 'Lihat postingan dan update terbaru', path: '#/feed', category: 'Content' },
    { title: 'Kegiatan', description: 'Kelola kegiatan dan acara', path: '#/activities', category: 'Management' },
    { title: 'Kas', description: 'Kelola keuangan dan transaksi', path: '#/finance', category: 'Finance' },
    { title: 'Profil', description: 'Pengaturan akun dan profil', path: '#/profile', category: 'Account' },
    { title: 'Kalender', description: 'Lihat kalender dan jadwal', path: '#/calendar', category: 'Schedule' },
    { title: 'Anggota', description: 'Kelola data anggota', path: '#/members', category: 'Management' },
    { title: 'Notulen', description: 'Catat dan lihat notulen rapat', path: '#/minutes', category: 'Documentation' },
    { title: 'Dokumen', description: 'Kelola dokumen penting', path: '#/documents', category: 'Documentation' },
    { title: 'Admin', description: 'Panel administrasi', path: '#/admin', category: 'Administration' },
  ];
}

export function openSearch() {
  isSearchOpen = true;
  const modal = document.createElement('div');
  modal.id = 'searchModal';
  modal.className = 'fixed inset-0 z-[9998] flex items-start justify-center pt-20 px-4';
  modal.style.background = 'rgba(0, 0, 0, 0.6)';
  modal.style.backdropFilter = 'blur(8px)';
  
  modal.innerHTML = `
    <div class="w-full max-w-2xl glass-card rounded-2xl shadow-2xl page-enter">
      <div class="p-4 border-b border-border">
        <div class="flex items-center gap-3">
          <span class="material-symbols-rounded text-2xl text-[rgb(var(--primary))]">search</span>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Cari halaman, fitur, atau konten..." 
            class="flex-1 bg-transparent outline-none text-base"
            autocomplete="off"
          />
          <button id="closeSearch" class="material-symbols-rounded text-2xl text-muted hover:text-[rgb(var(--primary))] transition">close</button>
        </div>
      </div>
      <div id="searchResults" class="max-h-[60vh] overflow-y-auto p-2">
        <div class="text-center py-8 text-muted text-sm">
          Ketik untuk mencari...
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const input = modal.querySelector('#searchInput');
  const results = modal.querySelector('#searchResults');
  const closeBtn = modal.querySelector('#closeSearch');
  
  input.focus();
  
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      results.innerHTML = `
        <div class="text-center py-8 text-muted text-sm">
          Ketik untuk mencari...
        </div>
      `;
      return;
    }
    
    const filtered = searchData.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
    
    if (filtered.length === 0) {
      results.innerHTML = `
        <div class="text-center py-8 text-muted text-sm">
          Tidak ada hasil untuk "${query}"
        </div>
      `;
      return;
    }
    
    results.innerHTML = filtered.map((item, idx) => `
      <a href="${item.path}" 
         class="block p-3 rounded-xl hover:bg-[rgba(var(--primary),0.1)] transition group card-3d-interactive"
         style="animation-delay: ${idx * 0.05}s"
         onclick="window.closeSearch()">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-rounded text-white text-xl">arrow_forward</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm">${highlightMatch(item.title, query)}</div>
            <div class="text-xs text-muted mt-0.5">${item.description}</div>
          </div>
          <div class="text-xs px-2 py-1 rounded-full bg-[rgba(var(--accent),0.2)] text-[rgb(var(--accent))]">
            ${item.category}
          </div>
        </div>
      </a>
    `).join('');
  });
  
  closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });
  
  document.addEventListener('keydown', handleEscape);
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-[rgba(var(--primary),0.3)] px-1 rounded">$1</mark>');
}

function handleEscape(e) {
  if (e.key === 'Escape') closeSearch();
}

function closeSearch() {
  isSearchOpen = false;
  const modal = document.getElementById('searchModal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s';
    setTimeout(() => modal.remove(), 200);
  }
  document.removeEventListener('keydown', handleEscape);
}

// Expose globally for inline onclick handlers
window.closeSearch = closeSearch;

// Keyboard shortcut: Cmd/Ctrl + K
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (!isSearchOpen) openSearch();
  }
});
