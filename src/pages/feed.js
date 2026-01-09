/**
 * Feed Page (v2.5 Premium)
 * - Social media-like feed
 * - Post, like functionality
 * - Real-time updates
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment, limit, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';

let currentUser = null;
let posts = [];

export async function render() {
  try {
    currentUser = auth.currentUser;
    posts = await fetchPosts();
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-4xl animate-fade-in">
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <h1 class="text-3xl font-extrabold gradient-text">📢 Feed</h1>
          <p class="text-sm opacity-70 mt-1">Timeline aktivitas & pengumuman</p>
        </div>

        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <form onsubmit="window.handleNewPost(event)" class="space-y-4">
            <textarea id="newPostContent" rows="3" placeholder="Apa yang ingin Anda bagikan?" required
              class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none resize-none"></textarea>
            
            <div class="flex justify-between items-center">
              <div class="flex gap-2">
                <button type="button" onclick="toast('🚧 Upload gambar akan segera tersedia', 'info')" 
                  class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2">
                  🖼️ <span class="text-sm">Gambar</span>
                </button>
              </div>
              <button type="submit" class="btn-primary px-6 py-3 rounded-xl font-semibold hover:scale-105">
                📤 Posting
              </button>
            </div>
          </form>
        </div>

        <div class="space-y-4">
          ${posts.length === 0 ? `
            <div class="glass-card rounded-2xl p-12 text-center border border-white/20">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Postingan</h3>
              <p class="opacity-70">Jadilah yang pertama membuat postingan!</p>
            </div>
          ` : posts.map(post => renderPostCard(post)).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    return `<div class="p-4 glass-card">Error: ${error.message}</div>`;
  }
}

function renderPostCard(post) {
  const isOwner = currentUser?.uid === post.userId;
  const timeAgo = getTimeAgo(post.createdAt);
  const hasLiked = post.likes?.includes(currentUser?.uid);

  return `
    <div class="glass-card rounded-2xl p-6 border border-white/20 hover:scale-[1.01] transition-all card-3d">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-xl font-bold">
          ${post.userName?.[0] || '👤'}
        </div>
        <div class="flex-1">
          <div class="font-bold">${post.userName || 'Pengguna'}</div>
          <div class="text-xs opacity-60">${timeAgo}</div>
        </div>
        ${isOwner ? `
          <button onclick="window.deletePost('${post.id}')" 
            class="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-sm">
            🗑️
          </button>
        ` : ''}
      </div>

      <div class="mb-4 whitespace-pre-line">${post.content}</div>

      ${post.imageUrl ? `
        <div class="mb-4 rounded-xl overflow-hidden">
          <img src="${post.imageUrl}" alt="Post image" class="w-full" />
        </div>
      ` : ''}

      <div class="flex items-center gap-4 pt-4 border-t border-white/10">
        <button onclick="window.toggleLike('${post.id}', ${hasLiked})" 
          class="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 ${hasLiked ? 'text-red-500' : ''}">
          <span class="text-xl">${hasLiked ? '❤️' : '🤍'}</span>
          <span class="text-sm font-semibold">${post.likesCount || 0}</span>
        </button>
        
        <button onclick="toast('🚧 Fitur komentar akan segera tersedia', 'info')" 
          class="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10">
          <span class="text-xl">💬</span>
          <span class="text-sm font-semibold">${post.commentsCount || 0}</span>
        </button>
        
        <button onclick="window.openShareDialog({title: 'Feed Post', text: '${post.content.substring(0, 100)}...', url: location.href})" 
          class="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 ml-auto">
          <span class="text-xl">📤</span>
        </button>
      </div>
    </div>
  `;
}

async function fetchPosts() {
  try {
    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

function getTimeAgo(timestamp) {
  if (!timestamp) return 'Baru saja';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

window.handleNewPost = async (e) => {
  e.preventDefault();
  const content = document.getElementById('newPostContent').value.trim();
  if (!content) return;
  try {
    const userData = await getUserData();
    await addDoc(collection(db, 'feed'), {
      content,
      userId: currentUser.uid,
      userName: userData?.nama || currentUser.email,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp()
    });
    toast('✅ Postingan berhasil dipublikasi', 'success');
    document.getElementById('newPostContent').value = '';
    setTimeout(() => location.hash = '#/feed', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal membuat postingan', 'error');
  }
};

window.toggleLike = async (postId, hasLiked) => {
  try {
    const postRef = doc(db, 'feed', postId);
    const likes = posts.find(p => p.id === postId)?.likes || [];
    if (hasLiked) {
      await updateDoc(postRef, {
        likes: likes.filter(uid => uid !== currentUser.uid),
        likesCount: increment(-1)
      });
    } else {
      await updateDoc(postRef, {
        likes: [...likes, currentUser.uid],
        likesCount: increment(1)
      });
    }
    setTimeout(() => location.hash = '#/feed', 100);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal memproses like', 'error');
  }
};

window.deletePost = async (postId) => {
  if (!confirm('Hapus postingan ini?')) return;
  try {
    await deleteDoc(doc(db, 'feed', postId));
    toast('✅ Postingan berhasil dihapus', 'success');
    setTimeout(() => location.hash = '#/feed', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal menghapus postingan', 'error');
  }
};

async function getUserData() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    return userDoc.data();
  } catch (error) {
    return null;
  }
}