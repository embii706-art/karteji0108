/**
 * Aspirations Page - KARTEJI
 * Sistem aspirasi warga untuk Karang Taruna RT 01
 * - Warga bisa kirim aspirasi
 * - Pengurus bisa balas & update status
 * - Kategori: Kegiatan, Fasilitas, Keuangan, Lainnya
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, where, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';
import { getUserRole, getUserPermissions } from '../lib/gates.js';

let currentUser = null;
let permissions = {};
let aspirations = [];

export async function render() {
  try {
    currentUser = auth.currentUser;
    permissions = await getUserPermissions();
    aspirations = await fetchAspirations();
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
        <!-- Header -->
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-extrabold gradient-text">🗳️ Aspirasi Warga</h1>
              <p class="text-sm opacity-70 mt-1">Sampaikan aspirasi Anda untuk kemajuan RT 01</p>
            </div>
            <button onclick="window.showAspirationModal()" 
              class="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <span class="text-xl mr-2">✍️</span> Kirim Aspirasi
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">📊</div>
              <div>
                <div class="text-2xl font-bold">${aspirations.length}</div>
                <div class="text-sm opacity-70">Total Aspirasi</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-2xl">⏳</div>
              <div>
                <div class="text-2xl font-bold">${aspirations.filter(a => a.status === 'pending').length}</div>
                <div class="text-sm opacity-70">Menunggu</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl">🔄</div>
              <div>
                <div class="text-2xl font-bold">${aspirations.filter(a => a.status === 'diproses').length}</div>
                <div class="text-sm opacity-70">Diproses</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">✅</div>
              <div>
                <div class="text-2xl font-bold">${aspirations.filter(a => a.status === 'selesai').length}</div>
                <div class="text-sm opacity-70">Selesai</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter -->
        <div class="glass-card rounded-xl p-4 mb-6 border border-white/20">
          <div class="flex flex-wrap gap-3">
            <button onclick="window.filterAspirations('all')" id="filter-all"
              class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all font-semibold">
              Semua
            </button>
            <button onclick="window.filterAspirations('pending')" id="filter-pending"
              class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              ⏳ Menunggu
            </button>
            <button onclick="window.filterAspirations('diproses')" id="filter-diproses"
              class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              🔄 Diproses
            </button>
            <button onclick="window.filterAspirations('selesai')" id="filter-selesai"
              class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
              ✅ Selesai
            </button>
          </div>
        </div>

        <!-- Aspirations List -->
        <div class="space-y-4" id="aspirationsList">
          ${aspirations.length === 0 ? `
            <div class="glass-card rounded-2xl p-12 text-center border border-white/20">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Aspirasi</h3>
              <p class="opacity-70 mb-4">Jadilah yang pertama menyampaikan aspirasi</p>
              <button onclick="window.showAspirationModal()" 
                class="btn-primary px-6 py-3 rounded-xl font-semibold">
                Kirim Aspirasi Pertama
              </button>
            </div>
          ` : aspirations.map(asp => renderAspirationCard(asp)).join('')}
        </div>
      </div>

      <!-- Modal Submit Aspirasi -->
      <div id="aspirationModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass-card rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text">✍️ Kirim Aspirasi</h2>
            <button onclick="window.closeAspirationModal()" class="text-2xl opacity-70 hover:opacity-100">✕</button>
          </div>
          
          <form id="aspirationForm" onsubmit="window.handleAspirationSubmit(event)" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold mb-2">Nama Anda *</label>
              <input type="text" id="aspirationName" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none"
                placeholder="Nama lengkap" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">No. HP / WhatsApp</label>
              <input type="tel" id="aspirationPhone"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none"
                placeholder="08xxxxxxxxxx" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Kategori *</label>
              <select id="aspirationCategory" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none">
                <option value="">Pilih Kategori</option>
                <option value="kegiatan">Kegiatan</option>
                <option value="fasilitas">Fasilitas RT</option>
                <option value="keuangan">Keuangan</option>
                <option value="kebersihan">Kebersihan</option>
                <option value="keamanan">Keamanan</option>
                <option value="sosial">Sosial</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Judul Aspirasi *</label>
              <input type="text" id="aspirationTitle" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none"
                placeholder="Judul singkat aspirasi Anda" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Isi Aspirasi *</label>
              <textarea id="aspirationContent" rows="5" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none resize-none"
                placeholder="Sampaikan aspirasi Anda dengan detail..."></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105">
                📤 Kirim Aspirasi
              </button>
              <button type="button" onclick="window.closeAspirationModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-semibold">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Balas (Pengurus Only) -->
      ${permissions.canReplyAspirations ? `
        <div id="replyModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-card rounded-2xl p-6 max-w-2xl w-full border border-white/20">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold gradient-text">💬 Balas Aspirasi</h2>
              <button onclick="window.closeReplyModal()" class="text-2xl opacity-70 hover:opacity-100">✕</button>
            </div>
            
            <form id="replyForm" onsubmit="window.handleReplySubmit(event)" class="space-y-4">
              <input type="hidden" id="replyAspirationId" />
              
              <div>
                <label class="block text-sm font-semibold mb-2">Status *</label>
                <select id="replyStatus" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none">
                  <option value="pending">⏳ Menunggu</option>
                  <option value="diproses">🔄 Sedang Diproses</option>
                  <option value="selesai">✅ Selesai</option>
                  <option value="ditolak">❌ Ditolak</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2">Balasan *</label>
                <textarea id="replyContent" rows="5" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none resize-none"
                  placeholder="Tulis balasan untuk warga..."></textarea>
              </div>

              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105">
                  💾 Kirim Balasan
                </button>
                <button type="button" onclick="window.closeReplyModal()"
                  class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-semibold">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      ` : ''}
    `;
  } catch (error) {
    console.error('Error:', error);
    return `<div class="p-4 glass-card">Error: ${error.message}</div>`;
  }
}

function renderAspirationCard(aspiration) {
  const canManage = permissions.canManageAspirations;
  const isOwner = currentUser?.uid === aspiration.userId;
  
  const statusColors = {
    pending: { bg: 'from-yellow-500 to-orange-600', text: 'Menunggu', icon: '⏳' },
    diproses: { bg: 'from-blue-500 to-indigo-600', text: 'Diproses', icon: '🔄' },
    selesai: { bg: 'from-green-500 to-emerald-600', text: 'Selesai', icon: '✅' },
    ditolak: { bg: 'from-gray-500 to-slate-600', text: 'Ditolak', icon: '❌' }
  };
  
  const categoryIcons = {
    kegiatan: '🎯',
    fasilitas: '🏠',
    keuangan: '💰',
    kebersihan: '🧹',
    keamanan: '🛡️',
    sosial: '🤝',
    lainnya: '📝'
  };
  
  const status = statusColors[aspiration.status] || statusColors.pending;

  return `
    <div class="glass-card rounded-2xl p-6 border border-white/20 hover:scale-[1.01] transition-all card-3d" data-status="${aspiration.status}">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${status.bg} text-white">
              ${status.icon} ${status.text}
            </span>
            <span class="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-500">
              ${categoryIcons[aspiration.category] || '📝'} ${aspiration.category}
            </span>
          </div>
          <h3 class="text-xl font-bold mb-2">${aspiration.title}</h3>
          <div class="text-sm opacity-70 mb-2">
            <span>👤 ${aspiration.nama}</span>
            ${aspiration.phone ? ` • <span>📱 ${aspiration.phone}</span>` : ''}
            <span> • 📅 ${formatDate(aspiration.createdAt)}</span>
          </div>
        </div>
        
        ${canManage ? `
          <button onclick="window.showReplyModal('${aspiration.id}')" 
            class="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 flex items-center gap-2 transition-all hover:scale-105">
            <span>💬</span>
            <span class="text-sm font-semibold">Balas</span>
          </button>
        ` : ''}
      </div>

      <div class="p-4 rounded-xl bg-white/5 mb-4">
        <p class="whitespace-pre-line">${aspiration.content}</p>
      </div>

      ${aspiration.reply ? `
        <div class="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-bold text-blue-500">💬 Balasan Pengurus:</span>
            <span class="text-xs opacity-70">${formatDate(aspiration.repliedAt)}</span>
          </div>
          <p class="whitespace-pre-line opacity-90">${aspiration.reply}</p>
        </div>
      ` : ''}
    </div>
  `;
}

async function fetchAspirations() {
  try {
    let q;
    
    // Pengurus lihat semua, user lain hanya milik sendiri atau yang public
    if (permissions.canManageAspirations) {
      q = query(collection(db, 'aspirasi'), orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(
        collection(db, 'aspirasi'),
        where('userId', '==', currentUser?.uid || 'none'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error:', error);
    // Fallback: get all if permission query fails
    const q = query(collection(db, 'aspirasi'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Global functions
window.showAspirationModal = () => {
  document.getElementById('aspirationForm').reset();
  // Pre-fill name if logged in
  if (currentUser) {
    permissions.then(p => {
      if (p.role !== 'warga') {
        getCurrentUserProfile().then(profile => {
          document.getElementById('aspirationName').value = profile?.nama || '';
          document.getElementById('aspirationPhone').value = profile?.no_hp || '';
        });
      }
    });
  }
  document.getElementById('aspirationModal').classList.remove('hidden');
};

window.closeAspirationModal = () => {
  document.getElementById('aspirationModal').classList.add('hidden');
};

window.handleAspirationSubmit = async (e) => {
  e.preventDefault();
  
  const data = {
    nama: document.getElementById('aspirationName').value.trim(),
    phone: document.getElementById('aspirationPhone').value.trim(),
    category: document.getElementById('aspirationCategory').value,
    title: document.getElementById('aspirationTitle').value.trim(),
    content: document.getElementById('aspirationContent').value.trim(),
    status: 'pending',
    userId: currentUser?.uid || 'anonymous',
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'aspirasi'), data);
    toast('✅ Aspirasi berhasil dikirim', 'success');
    window.closeAspirationModal();
    setTimeout(() => location.hash = '#/aspirations', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal mengirim aspirasi', 'error');
  }
};

window.showReplyModal = (aspirationId) => {
  const aspiration = aspirations.find(a => a.id === aspirationId);
  if (!aspiration) return;
  
  document.getElementById('replyAspirationId').value = aspirationId;
  document.getElementById('replyStatus').value = aspiration.status;
  document.getElementById('replyContent').value = aspiration.reply || '';
  document.getElementById('replyModal').classList.remove('hidden');
};

window.closeReplyModal = () => {
  document.getElementById('replyModal').classList.add('hidden');
};

window.handleReplySubmit = async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('replyAspirationId').value;
  const data = {
    status: document.getElementById('replyStatus').value,
    reply: document.getElementById('replyContent').value.trim(),
    repliedAt: serverTimestamp(),
    repliedBy: currentUser?.uid
  };

  try {
    await updateDoc(doc(db, 'aspirasi', id), data);
    toast('✅ Balasan berhasil dikirim', 'success');
    window.closeReplyModal();
    setTimeout(() => location.hash = '#/aspirations', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal mengirim balasan', 'error');
  }
};

window.filterAspirations = (status) => {
  const cards = document.querySelectorAll('[data-status]');
  const buttons = document.querySelectorAll('[id^="filter-"]');
  
  // Update button states
  buttons.forEach(btn => btn.classList.remove('font-semibold', 'bg-blue-500/20'));
  document.getElementById(`filter-${status}`).classList.add('font-semibold', 'bg-blue-500/20');
  
  // Filter cards
  cards.forEach(card => {
    if (status === 'all' || card.dataset.status === status) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
};

async function getCurrentUserProfile() {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    return userDoc.data();
  } catch (error) {
    return null;
  }
}

import { getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
