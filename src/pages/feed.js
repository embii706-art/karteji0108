import { skeletonList } from '../components/Skeleton.js';
import { emptyFeed } from '../components/EmptyState.js';
import { db, auth } from '../lib/firebase.js';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { cloudinarySmart } from '../lib/cloudinary.js';

export async function feed(){
  // Simulate loading
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
    const user = auth?.currentUser;
    if (!user) {
      container.innerHTML = emptyFeed();
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
    container.innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-rounded text-[48px] opacity-30">error</span>
        <p class="text-sm opacity-70 mt-2">Gagal memuat feed</p>
      </div>
    `;
  }
}

function bindNewPostButton() {
  const btn = document.getElementById('btnNewPost');
  if (btn) {
    btn.addEventListener('click', () => {
      // Navigate to create post page or open modal
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
  // Simulate empty state (replace with actual Firestore query)
  const posts = [];
  
  if (posts.length === 0) {
    container.innerHTML = emptyFeed();
  } else {
    // Render posts here
    container.innerHTML = posts.map(post => renderPost(post)).join('');
  }
}

function renderPost(post) {
  return `
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white font-bold">
          ${post.author.charAt(0)}
        </div>
        <div class="flex-1">
          <div class="font-semibold">${post.author}</div>
          <div class="text-xs opacity-70">${post.timestamp}</div>
          <div class="mt-2 text-sm">${post.content}</div>
        </div>
      </div>
    </div>
  `;
}