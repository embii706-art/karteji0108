import { skeletonList } from '../components/Skeleton.js';
import { emptyFeed, errorState } from '../components/EmptyState.js';

export async function feed(){
  setTimeout(() => loadFeed(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">newspaper</span>
          Feed & Pengumuman
        </h1>
        <button id="btnNewPost" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Posting
        </button>
      </div>
      
      <div id="feedContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

async function loadFeed() {
  const container = document.getElementById('feedContent');
  if (!container) return;
  
  try {
    // Lazy import to avoid blocking
    const { db, auth } = await import('../lib/firebase.js');
    const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { cloudinarySmart } = await import('../lib/cloudinary.js');
    
    const user = auth?.currentUser;
    if (!user) {
      container.innerHTML = emptyFeed();
      bindNewPostButton();
      return;
    }

    // Fetch posts from Firestore
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      container.innerHTML = emptyFeed();
      bindNewPostButton();
      return;
    }

    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Render posts
    container.innerHTML = posts.map(post => {
      const authorPhoto = post.authorPhoto ? cloudinarySmart(post.authorPhoto, 200) : '/apple-touch-icon.png';
      const postDate = post.createdAt ? formatDate(post.createdAt.toDate()) : 'Baru saja';
      
      return `
        <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-md transition">
          <div class="flex items-start gap-3 mb-3">
            <img src="${authorPhoto}" alt="${post.authorName}" class="w-10 h-10 rounded-full object-cover" onerror="this.src='/apple-touch-icon.png'" />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">${post.authorName || 'Pengguna'}</div>
              <div class="text-xs opacity-70">${postDate}</div>
            </div>
            ${post.important ? '<span class="px-2 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center">Penting</span>' : ''}
          </div>
          <div class="text-sm whitespace-pre-wrap">${post.content || ''}</div>
          ${post.imageUrl ? `<img src="${cloudinarySmart(post.imageUrl, 600)}" alt="Post image" class="mt-3 w-full rounded-xl object-cover max-h-96" />` : ''}
          <div class="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            <button class="flex items-center gap-1 text-sm opacity-70 hover:opacity-100 transition">
              <span class="material-symbols-rounded text-[18px]">favorite</span>
              <span>${post.likes || 0}</span>
            </button>
            <button class="flex items-center gap-1 text-sm opacity-70 hover:opacity-100 transition">
              <span class="material-symbols-rounded text-[18px]">comment</span>
              <span>${post.comments || 0}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    bindNewPostButton();
  } catch (error) {
    console.error('Error loading feed:', error);
    container.innerHTML = emptyFeed();
    bindNewPostButton();
  }
}

function bindNewPostButton() {
  const btn = document.getElementById('btnNewPost');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => {
      window.location.hash = '#/feed/create';
    });
  }
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit yang lalu`;
  if (hours < 24) return `${hours} jam yang lalu`;
  if (days < 7) return `${days} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function feedCreate(){
  // Role gate: admin or editor
  try {
    const { auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const user = auth?.currentUser;
    if(!user) return errorState('Silakan masuk untuk membuat posting.');
    const profile = await getProfile(user.uid);
    if(!hasRole(profile, ['admin','editor'])){
      return errorState('Anda tidak memiliki izin untuk membuat posting. Hubungi admin.');
    }
  } catch {}
  setTimeout(() => bindCreatePostForm(), 0);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/feed'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Buat Posting</h1>
      </div>
      <form id="postForm" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <textarea name="content" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Tulis pengumuman atau informasi..."></textarea>
        <input type="file" name="image" accept="image/*" class="w-full text-sm" />
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="important" /> Tandai sebagai penting
        </label>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Simpan</button>
          <button type="button" id="btnCancel" class="px-4 h-10 rounded-xl border border-[var(--border)] text-sm">Batal</button>
        </div>
      </form>
    </section>
  `;
}

function bindCreatePostForm(){
  const form = document.getElementById('postForm');
  const btnCancel = document.getElementById('btnCancel');
  if(btnCancel){ btnCancel.addEventListener('click', ()=> location.hash = '#/feed'); }
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    try{
      const { db, auth } = await import('../lib/firebase.js');
      const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      const { uploadToCloudinary } = await import('../lib/cloudinary.js');
      const { sanitizeHtml } = await import('../lib/security.js');
      const user = auth?.currentUser; if(!user) return;
      const fd = new FormData(form);
      const contentRaw = String(fd.get('content')||'');
      const content = sanitizeHtml(contentRaw);
      const imgFile = fd.get('image');
      let imageUrl = '';
      if(imgFile && imgFile.size){ imageUrl = await uploadToCloudinary(imgFile); }
      const important = fd.get('important') === 'on';
      await addDoc(collection(db,'posts'),{
        authorId: user.uid,
        authorName: user.displayName || 'Pengguna',
        authorPhoto: user.photoURL || '',
        content, imageUrl, important,
        likes: 0, comments: 0,
        createdAt: serverTimestamp()
      });
      location.hash = '#/feed';
    }catch(err){ console.error('Create post error:', err); alert('Gagal menyimpan posting'); }
  });
}

export async function feedEdit(){
  const params = new URLSearchParams((location.hash.split('?')[1])||'');
  const id = params.get('id');
  // Role gate: admin/editor or author
  try{
    const { db, auth } = await import('../lib/firebase.js');
    const { getProfile, hasRole } = await import('../lib/gates.js');
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const user = auth?.currentUser; if(!user) return errorState('Silakan masuk untuk mengedit posting.');
    const profile = await getProfile(user.uid);
    if(!hasRole(profile, ['admin','editor'])){
      // allow author to edit own post
      try{
        const snap = await getDoc(doc(db,'posts', id));
        if(!snap.exists() || snap.data().authorId !== user.uid){
          return errorState('Anda tidak memiliki izin untuk mengedit posting ini.');
        }
      }catch{ return errorState('Posting tidak ditemukan.'); }
    }
  }catch{}
  setTimeout(()=> bindEditPostForm(), 100);
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center gap-2">
        <button onclick="location.hash='#/feed'" class="rounded-xl border border-[var(--border)] px-3 h-10 flex items-center">
          <span class="material-symbols-rounded text-[20px]">chevron_left</span>
        </button>
        <h1 class="text-xl font-bold">Edit Posting</h1>
      </div>
      <form id="postEditForm" data-id="${id||''}" class="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <textarea name="content" rows="4" class="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm" placeholder="Konten..."></textarea>
        <input type="file" name="image" accept="image/*" class="w-full text-sm" />
        <label class="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="important" /> Penting
        </label>
        <div class="flex gap-2">
          <button type="submit" class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Update</button>
          <button type="button" id="btnDeletePost" class="px-4 h-10 rounded-xl border border-red-400 text-red-600 text-sm">Hapus</button>
        </div>
      </form>
    </section>
  `;
}

async function bindEditPostForm(){
  const form = document.getElementById('postEditForm');
  if(!form || form.dataset.bound) return; form.dataset.bound = 'true';
  const id = form.dataset.id;
  try{
    const { db, auth } = await import('../lib/firebase.js');
    const { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { uploadToCloudinary } = await import('../lib/cloudinary.js');
    const { sanitizeHtml } = await import('../lib/security.js');
    const ref = doc(db,'posts', id);
    const snap = await getDoc(ref);
    if(snap.exists()){
      const data = snap.data();
      form.content.value = data.content||'';
      form.important.checked = !!data.important;
    }
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      try{
        const fd = new FormData(form);
        const content = sanitizeHtml(String(fd.get('content')||''));
        const important = fd.get('important') === 'on';
        const imgFile = fd.get('image');
        const update = { content, important, updatedAt: serverTimestamp() };
        if(imgFile && imgFile.size){ update.imageUrl = await uploadToCloudinary(imgFile); }
        await updateDoc(ref, update);
        location.hash = '#/feed';
      }catch(err){ console.error('Update post error:', err); alert('Gagal update'); }
    });
    const btnDel = document.getElementById('btnDeletePost');
    if(btnDel){
      btnDel.addEventListener('click', async ()=>{
        try{ await deleteDoc(ref); location.hash = '#/feed'; }
        catch(err){ console.error('Delete post error:', err); alert('Gagal hapus'); }
      });
    }
  }catch(err){ console.error('Bind edit form error:', err); }
}