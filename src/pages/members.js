
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

export async function membersCreate(){
  setTimeout(()=> bindMemberCreateForm(), 0);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/members'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Tambah Anggota</h1>
      </div>
      <form id="memberForm" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="name" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Nama lengkap" />
        <input name="email" type="email" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Email" />
        <input name="role" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Peran (role)" />
        <input type="file" name="photo" accept="image/*" class="w-full text-sm" />
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Simpan</button>
          <button type="button" onclick="location.hash='#/members'" class="px-4 h-10 rounded-xl border border-[var(--border)] text-sm">Batal</button>
        </div>
      </form>
    </section>
  `;
}

function bindMemberCreateForm(){
  const form = document.getElementById('memberForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      const { db } = await import('../lib/firebase.js');
      const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { sanitizeHtml, isValidEmail } = await import('../lib/security.js');
      const { uploadToCloudinary } = await import('../lib/cloudinary.js');
      const fd = new FormData(form);
      const name = sanitizeHtml(String(fd.get('name')||''));
      const email = String(fd.get('email')||'');
      const role = sanitizeHtml(String(fd.get('role')||''));
      if(!name){ alert('Nama wajib diisi'); return; }
      if(email && !isValidEmail(email)){ alert('Email tidak valid'); return; }
      let photoURL = '';
      const photoFile = fd.get('photo');
      if(photoFile && photoFile.size){ photoURL = await uploadToCloudinary(photoFile); }
      await addDoc(collection(db,'members'),{
        name, email, role, photoURL,
        status: 'active', createdAt: serverTimestamp()
      });
      location.hash = '#/members';
    }catch(err){ console.error('Create member error:', err); alert('Gagal menyimpan'); }
  });
}

export async function membersEdit(){
  setTimeout(()=> bindMemberEditForm(), 100);
  const params = new URLSearchParams((location.hash.split('?')[1])||'');
  const id = params.get('id');
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/members'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Edit Anggota</h1>
      </div>
      <form id="memberEditForm" data-id="${id||''}" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="name" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Nama lengkap" />
        <input name="email" type="email" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Email" />
        <input name="role" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Peran (role)" />
        <input type="file" name="photo" accept="image/*" class="w-full text-sm" />
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Update</button>
          <button type="button" id="btnDeleteMember" class="px-4 h-10 rounded-xl border border-red-400 text-red-600 text-sm">Hapus</button>
        </div>
      </form>
    </section>
  `;
}

async function bindMemberEditForm(){
  const form = document.getElementById('memberEditForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  const id = form.dataset.id;
  try{
    const { db } = await import('../lib/firebase.js');
    const { doc, getDoc, updateDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { sanitizeHtml, isValidEmail } = await import('../lib/security.js');
    const { uploadToCloudinary } = await import('../lib/cloudinary.js');
    const ref = doc(db,'members', id);
    const snap = await getDoc(ref);
    if(snap.exists()){
      const data = snap.data();
      form.name.value = data.name||'';
      form.email.value = data.email||'';
      form.role.value = data.role||'';
    }
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const name = sanitizeHtml(String(fd.get('name')||''));
      const email = String(fd.get('email')||'');
      const role = sanitizeHtml(String(fd.get('role')||''));
      if(!name){ alert('Nama wajib diisi'); return; }
      if(email && !isValidEmail(email)){ alert('Email tidak valid'); return; }
      const update = { name, email, role };
      const photoFile = fd.get('photo');
      if(photoFile && photoFile.size){ update.photoURL = await uploadToCloudinary(photoFile); }
      await updateDoc(ref, update);
      location.hash = '#/members';
    });
    const btnDel = document.getElementById('btnDeleteMember');
    if(btnDel){ btnDel.addEventListener('click', async ()=>{
      try{ await deleteDoc(ref); location.hash = '#/members'; }
      catch(err){ console.error('Delete member error:', err); alert('Gagal hapus'); }
    }); }
  }catch(err){ console.error('Bind member edit error:', err); }
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
