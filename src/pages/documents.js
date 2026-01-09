import { skeletonGrid } from '../components/Skeleton.js';
import { emptyDocuments } from '../components/EmptyState.js';

export async function documents(){
  setTimeout(() => loadDocuments(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">folder</span>
          Dokumen
        </h1>
        <a href="#/documents/upload" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          <span class="material-symbols-rounded text-[18px]">upload</span>
        </a>
      </div>
      
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button class="px-4 h-9 rounded-full bg-[rgb(var(--primary))] text-white text-sm font-semibold whitespace-nowrap">Semua</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Surat</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Notulen</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Laporan</button>
      </div>
      
      <div id="documentsContent">${skeletonGrid(6)}</div>
    </section>
  `;
}

async function loadDocuments() {
  const container = document.getElementById('documentsContent');
  if (!container) return;
  try{
    container.innerHTML = skeletonGrid(6);
    const { db } = await import('../lib/firebase.js');
    const { collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const q = query(collection(db,'documents'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    if(snap.empty){ container.innerHTML = emptyDocuments(); return; }
    const items = snap.docs.map(d=>({ id: d.id, ...d.data() }));
    container.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        ${items.map(renderDocCard).join('')}
      </div>
    `;
  }catch(err){ console.error('Load documents error:', err); container.innerHTML = emptyDocuments(); }
}

function renderDocCard(doc){
  const title = doc.title || 'Tanpa Judul';
  const category = doc.category || '';
  const thumb = doc.thumb || '';
  const url = doc.url || '';
  const id = doc.id;
  return `
    <a href="${url || '#'}" target="_blank" rel="noopener" class="block rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      ${thumb? `<img src="${thumb}" alt="${title}" class="w-full h-36 object-cover">` : ''}
      <div class="p-3">
        <div class="font-semibold text-sm">${title}</div>
        <div class="text-xs opacity-70 mt-1">${category}</div>
        <div class="flex gap-2 mt-3">
          <a href="#/documents/edit?id=${encodeURIComponent(id)}" class="px-3 h-8 rounded-xl border border-[var(--border)] text-xs flex items-center">Edit</a>
        </div>
      </div>
    </a>
  `;
}

export async function documentsUpload(){
  try{
    const { auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const u = auth?.currentUser; if(!u) return `<section class="p-4">Harus masuk.</section>`;
    const p = await getProfile(u.uid);
    if(!hasRole(p,['admin','editor'])) return `<section class="p-4">Akses ditolak.</section>`;
  }catch{}
  setTimeout(()=> bindDocumentsUploadForm(), 0);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/documents'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Unggah Dokumen</h1>
      </div>
      <form id="documentUploadForm" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="title" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Judul" />
        <input name="category" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Kategori (Notulen, Surat, Laporan)" />
        <input type="file" name="file" accept="application/pdf,image/*" class="w-full" />
        <textarea name="description" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Deskripsi (opsional)"></textarea>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Unggah</button>
          <button type="button" onclick="location.hash='#/documents'" class="px-4 h-10 rounded-xl border border-[var(--border)] text-sm">Batal</button>
        </div>
      </form>
    </section>
  `;
}

function bindDocumentsUploadForm(){
  const form = document.getElementById('documentUploadForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      const { db } = await import('../lib/firebase.js');
      const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { uploadToCloudinary, cloudinarySmart } = await import('../lib/cloudinary.js');
      const { sanitizeHtml } = await import('../lib/security.js');
      const fd = new FormData(form);
      const title = sanitizeHtml(String(fd.get('title')||''));
      const category = sanitizeHtml(String(fd.get('category')||''));
      const description = sanitizeHtml(String(fd.get('description')||''));
      const file = fd.get('file');
      if(!title){ alert('Judul wajib diisi'); return; }
      if(!file || !(file instanceof File)){ alert('Pilih file untuk diunggah'); return; }
      const uploadRes = await uploadToCloudinary(file);
      const url = uploadRes?.secure_url || uploadRes?.url;
      const thumb = url? cloudinarySmart(url, 400): '';
      await addDoc(collection(db,'documents'),{
        title, category, description, url, thumb,
        mime: file.type, size: file.size,
        createdAt: serverTimestamp()
      });
      location.hash = '#/documents';
    }catch(err){ console.error('Upload document error:', err); alert('Gagal mengunggah'); }
  });
}

export async function documentsEdit(){
  const params = new URLSearchParams((location.hash.split('?')[1])||'');
  const id = params.get('id');
  try{
    const { auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const u = auth?.currentUser; if(!u) return `<section class='p-4'>Harus masuk.</section>`;
    const p = await getProfile(u.uid); if(!hasRole(p,['admin','editor'])) return `<section class='p-4'>Akses ditolak.</section>`;
  }catch{}
  setTimeout(()=> bindDocumentsEditForm(), 100);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/documents'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Edit Dokumen</h1>
      </div>
      <form id="documentEditForm" data-id="${id||''}" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input name="title" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Judul" />
        <input name="category" class="w-full h-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm" placeholder="Kategori" />
        <textarea name="description" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Deskripsi"></textarea>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Update</button>
          <button type="button" id="btnDeleteDocument" class="px-4 h-10 rounded-xl border border-red-400 text-red-600 text-sm">Hapus</button>
        </div>
      </form>
    </section>
  `;
}

async function bindDocumentsEditForm(){
  const form = document.getElementById('documentEditForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  const id = form.dataset.id;
  try{
    const { db } = await import('../lib/firebase.js');
    const { doc, getDoc, updateDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { sanitizeHtml } = await import('../lib/security.js');
    const ref = doc(db,'documents', id);
    const snap = await getDoc(ref);
    if(snap.exists()){
      const d = snap.data();
      form.title.value = d.title||'';
      form.category.value = d.category||'';
      form.description.value = d.description||'';
    }
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const title = sanitizeHtml(String(fd.get('title')||''));
      const category = sanitizeHtml(String(fd.get('category')||''));
      const description = sanitizeHtml(String(fd.get('description')||''));
      await updateDoc(ref,{ title, category, description });
      location.hash = '#/documents';
    });
    const btnDel = document.getElementById('btnDeleteDocument');
    if(btnDel){ btnDel.addEventListener('click', async ()=>{ try{ await deleteDoc(ref); location.hash = '#/documents'; }catch(err){ alert('Gagal hapus'); } }); }
  }catch(err){ console.error('Bind document edit error:', err); }
}