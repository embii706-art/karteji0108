
import { emptyMembers } from '../components/EmptyState.js';
import { skeletonList } from '../components/Skeleton.js';

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
              <p class="text-sm opacity-70">Daftar anggota organisasi</p>
            </div>
          </div>
        </div>
        
        <!-- Search -->
        <div class="mt-4">
          <input type="search" id="memberSearch" placeholder="Cari anggota..." class="w-full h-10 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:border-[rgb(var(--primary))] focus:outline-none" />
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div id="totalMembers" class="text-3xl font-bold text-[rgb(var(--primary))]">0</div>
          <div class="text-xs opacity-70 mt-1">Total Anggota</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div id="activeMembers" class="text-3xl font-bold text-green-600 dark:text-green-400">0</div>
          <div class="text-xs opacity-70 mt-1">Aktif</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">0</div>
          <div class="text-xs opacity-70 mt-1">Pending</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <div id="onlineMembers" class="text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
          <div class="text-xs opacity-70 mt-1">Online</div>
        </div>
      </div>

      <!-- Members List -->
      <div id="membersContent">
        ${skeletonList(5)}
      </div>
    </section>
  `;
}

async function loadMembers() {
  const container = document.getElementById('membersContent');
  if (!container) return;
  
  try {
    // Import Firebase here to avoid blocking initial render
    const { db, auth } = await import('../lib/firebase.js');
    const { collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { cloudinarySmart } = await import('../lib/cloudinary.js');
    
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

    // Update stats
    document.getElementById('totalMembers').textContent = members.length;
    document.getElementById('activeMembers').textContent = members.filter(m => m.status === 'active').length;
    
    const onlineCount = members.filter(m => {
      return m.lastSeen && (Date.now() - m.lastSeen?.toDate?.() < 300000);
    }).length;
    document.getElementById('onlineMembers').textContent = onlineCount;

    // Render members list
    container.innerHTML = members.map(member => {
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
            </a>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading members:', error);
    container.innerHTML = emptyMembers();
  }
}
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
