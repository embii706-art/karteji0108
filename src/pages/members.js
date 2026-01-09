
import { emptyMembers } from '../components/EmptyState.js';
import { db, auth } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, getCountFromServer } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { cloudinarySmart } from '../lib/cloudinary.js';

export async function members(){
  setTimeout(() => loadMembers(), 100);
  
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
          <input type="search" id="memberSearch" placeholder="Cari anggota..." class="flex-1 h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:border-[rgb(var(--primary))] focus:outline-none" />
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

async function loadMembers() {
  const container = document.getElementById('membersContent');
  if (!container) return;
  
  try {
    const user = auth?.currentUser;
    if (!user) {
      container.innerHTML = emptyMembers();
      return;
    }

    // Fetch members from Firestore
    const q = query(collection(db, 'members'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = emptyMembers();
      return;
    }

    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Render members list
    container.innerHTML = members.map(member => {
      const photoUrl = member.photoURL ? cloudinarySmart(member.photoURL, 200) : '/apple-touch-icon.png';
      const isOnline = member.lastSeen && (Date.now() - member.lastSeen?.toDate?.() < 300000); // 5 min
      
      return `
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-md transition">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img src="${photoUrl}" alt="${member.name}" class="w-12 h-12 rounded-full object-cover" onerror="this.src='/apple-touch-icon.png'" />
              ${isOnline ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>' : ''}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold truncate">${member.name || 'Anggota'}</div>
              <div class="text-xs opacity-70 mt-0.5">${member.role || 'Member'}</div>
            </div>
            <a href="#/members/${member.id}" class="px-3 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--bg)] transition flex items-center gap-1 text-sm">
              Detail
              <span class="material-symbols-rounded text-[16px]">chevron_right</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Update stats
    updateMemberStats(members);
    
    // Search functionality
    bindSearchEvents(members);
  } catch (error) {
    console.error('Error loading members:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-rounded text-[48px] opacity-30">error</span>
        <p class="text-sm opacity-70 mt-2">Gagal memuat data anggota</p>
      </div>
    `;
  }
}

function updateMemberStats(members) {
  const totalEl = document.querySelector('#membersContent')?.parentElement?.querySelector('.text-2xl.font-bold');
  const onlineEl = document.querySelector('.text-2xl.font-bold.text-green-600');
  
  if (totalEl) totalEl.textContent = members.length;
  
  const onlineCount = members.filter(m => {
    return m.lastSeen && (Date.now() - m.lastSeen?.toDate?.() < 300000);
  }).length;
  
  if (onlineEl) onlineEl.textContent = onlineCount;
}

function bindSearchEvents(members) {
  const searchInput = document.getElementById('memberSearch');
  const container = document.getElementById('membersContent');
  
  if (searchInput && container) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const filtered = members.filter(m => 
        m.name?.toLowerCase().includes(keyword) || 
        m.role?.toLowerCase().includes(keyword)
      );
      
      // Re-render filtered members (simplified version)
      if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-8 opacity-70">Tidak ada hasil pencarian</div>`;
      } else {
        // Re-render with filtered data (same logic as loadMembers)
        container.innerHTML = filtered.map(member => {
          const photoUrl = member.photoURL ? cloudinarySmart(member.photoURL, 200) : '/apple-touch-icon.png';
          const isOnline = member.lastSeen && (Date.now() - member.lastSeen?.toDate?.() < 300000);
          
          return `
            <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-md transition">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <img src="${photoUrl}" alt="${member.name}" class="w-12 h-12 rounded-full object-cover" onerror="this.src='/apple-touch-icon.png'" />
                  ${isOnline ? '<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold truncate">${member.name || 'Anggota'}</div>
                  <div class="text-xs opacity-70 mt-0.5">${member.role || 'Member'}</div>
                </div>
                <a href="#/members/${member.id}" class="px-3 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--bg)] transition flex items-center gap-1 text-sm">
                  Detail
                  <span class="material-symbols-rounded text-[16px]">chevron_right</span>
                </a>
              </div>
            </div>
          `;
        }).join('');
      }
    });
  }
}
  }
}
