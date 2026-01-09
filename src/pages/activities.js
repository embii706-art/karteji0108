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
        <a href="#/activities/create" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Kegiatan Baru
        </a>
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

async function loadActivities() {
  const container = document.getElementById('activitiesContent');
  if (!container) return;
  try{
    const { db, auth } = await import('../lib/firebase.js');
    const { collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const user = auth?.currentUser; if(!user){ container.innerHTML = emptyActivities(); return; }
    const q = query(collection(db,'activities'), orderBy('date','asc'));
    const snap = await getDocs(q);
    if(snap.empty){ container.innerHTML = emptyActivities(); return; }
    const rows = snap.docs.map(d=>({ id: d.id, ...d.data() }));
    container.innerHTML = rows.map(renderActivity).join('');
  }catch(err){ console.error('Load activities error:', err); container.innerHTML = emptyActivities(); }
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

export async function activitiesCreate(){
  // Role: admin or editor
  try{
    const { auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const u = auth?.currentUser; if(!u) return `<section class="p-4">Harus masuk.</section>`;
    const p = await getProfile(u.uid);
    if(!hasRole(p,['admin','editor'])) return `<section class="p-4">Akses ditolak.</section>`;
  }catch{}
  setTimeout(()=> bindActivityCreateForm(), 0);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/activities'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Buat Kegiatan</h1>
      </div>
      <form id="activityForm" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="title" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Judul kegiatan" />
        <input type="date" name="date" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" />
        <input name="time" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Waktu (contoh: 14:00 - 16:00)" />
        <input name="location" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Lokasi" />
        <textarea name="description" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Deskripsi"></textarea>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Simpan</button>
          <button type="button" onclick="location.hash='#/activities'" class="px-4 h-10 rounded-xl border border-[var(--border)] text-sm">Batal</button>
        </div>
      </form>
    </section>
  `;
}

function bindActivityCreateForm(){
  const form = document.getElementById('activityForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      const { db } = await import('../lib/firebase.js');
      const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { sanitizeHtml } = await import('../lib/security.js');
      const fd = new FormData(form);
      const title = sanitizeHtml(String(fd.get('title')||''));
      const dateStr = String(fd.get('date')||''); const date = dateStr? new Date(dateStr): new Date();
      const time = sanitizeHtml(String(fd.get('time')||''));
      const location = sanitizeHtml(String(fd.get('location')||''));
      const description = sanitizeHtml(String(fd.get('description')||''));
      if(!title){ alert('Judul wajib diisi'); return; }
      await addDoc(collection(db,'activities'),{
        title, date, time, location, description,
        createdAt: serverTimestamp()
      });
      location.hash = '#/activities';
    }catch(err){ console.error('Create activity error:', err); alert('Gagal menyimpan'); }
  });
}

export async function activitiesEdit(){
  const params = new URLSearchParams((location.hash.split('?')[1])||'');
  const id = params.get('id');
  // role gate admin/editor
  try{
    const { auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const u = auth?.currentUser; if(!u) return `<section class='p-4'>Harus masuk.</section>`;
    const p = await getProfile(u.uid); if(!hasRole(p,['admin','editor'])) return `<section class='p-4'>Akses ditolak.</section>`;
  }catch{}
  setTimeout(()=> bindActivityEditForm(), 100);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/activities'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Edit Kegiatan</h1>
      </div>
      <form id="activityEditForm" data-id="${id||''}" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="title" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Judul kegiatan" />
        <input type="date" name="date" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" />
        <input name="time" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Waktu" />
        <input name="location" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Lokasi" />
        <textarea name="description" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Deskripsi"></textarea>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Update</button>
          <button type="button" id="btnDeleteActivity" class="px-4 h-10 rounded-xl border border-red-400 text-red-600 text-sm">Hapus</button>
        </div>
      </form>
    </section>
  `;
}

async function bindActivityEditForm(){
  const form = document.getElementById('activityEditForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  const id = form.dataset.id;
  try{
    const { db } = await import('../lib/firebase.js');
    const { doc, getDoc, updateDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { sanitizeHtml } = await import('../lib/security.js');
    const ref = doc(db,'activities', id);
    const snap = await getDoc(ref);
    if(snap.exists()){
      const d = snap.data();
      form.title.value = d.title||'';
      form.date.value = (d.date?.toDate?.() || d.date || new Date()).toISOString().slice(0,10);
      form.time.value = d.time||'';
      form.location.value = d.location||'';
      form.description.value = d.description||'';
    }
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const title = sanitizeHtml(String(fd.get('title')||''));
      const dateStr = String(fd.get('date')||''); const date = dateStr? new Date(dateStr): new Date();
      const time = sanitizeHtml(String(fd.get('time')||''));
      const location = sanitizeHtml(String(fd.get('location')||''));
      const description = sanitizeHtml(String(fd.get('description')||''));
      await updateDoc(ref,{ title, date, time, location, description });
      location.hash = '#/activities';
    });
    const btnDel = document.getElementById('btnDeleteActivity');
    if(btnDel){ btnDel.addEventListener('click', async ()=>{ try{ await deleteDoc(ref); location.hash = '#/activities'; }catch(err){ alert('Gagal hapus'); } }); }
  }catch(err){ console.error('Bind activity edit error:', err); }
}