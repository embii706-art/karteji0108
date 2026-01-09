/**
 * Activities Page (v2.5 Premium)
 * - Full CRUD with role-based access
 * - Premium UI with glassmorphism
 * - QR code attendance
 * - Export functionality
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';
import { getUserRole } from '../lib/gates.js';

let currentUserRole = 'user';
let activities = [];

export async function render() {
  try {
    currentUserRole = await getUserRole();
    activities = await fetchActivities();
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
        <!-- Header Section -->
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-extrabold gradient-text">🎯 Kegiatan</h1>
              <p class="text-sm opacity-70 mt-1">Kelola semua aktivitas organisasi</p>
            </div>
            ${currentUserRole === 'admin' || currentUserRole === 'pengurus' ? `
              <button onclick="window.showAddActivityModal()" 
                class="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <span class="text-xl mr-2">➕</span> Tambah Kegiatan
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <div class="text-2xl font-bold">${activities.length}</div>
                <div class="text-sm opacity-70">Total Kegiatan</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-2xl">
                ⏰
              </div>
              <div>
                <div class="text-2xl font-bold">${activities.filter(a => a.status === 'upcoming').length}</div>
                <div class="text-sm opacity-70">Akan Datang</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                ✅
              </div>
              <div>
                <div class="text-2xl font-bold">${activities.filter(a => a.status === 'completed').length}</div>
                <div class="text-sm opacity-70">Selesai</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities List -->
        <div class="space-y-4">
          ${activities.length === 0 ? `
            <div class="glass-card rounded-2xl p-12 text-center border border-white/20">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Kegiatan</h3>
              <p class="opacity-70 mb-4">Mulai tambahkan kegiatan pertama Anda</p>
              ${currentUserRole === 'admin' || currentUserRole === 'pengurus' ? `
                <button onclick="window.showAddActivityModal()" 
                  class="btn-primary px-6 py-3 rounded-xl font-semibold">
                  Tambah Kegiatan Pertama
                </button>
              ` : ''}
            </div>
          ` : activities.map(activity => renderActivityCard(activity)).join('')}
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div id="activityModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text" id="modalTitle">Tambah Kegiatan</h2>
            <button onclick="window.closeActivityModal()" class="text-2xl opacity-70 hover:opacity-100 transition-opacity">
              ✕
            </button>
          </div>
          
          <form id="activityForm" onsubmit="window.handleActivitySubmit(event)" class="space-y-4">
            <input type="hidden" id="activityId" />
            
            <div>
              <label class="block text-sm font-semibold mb-2">Nama Kegiatan *</label>
              <input type="text" id="activityName" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="Contoh: Rapat Bulanan" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Deskripsi</label>
              <textarea id="activityDescription" rows="4"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none"
                placeholder="Jelaskan detail kegiatan..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Tanggal *</label>
                <input type="date" id="activityDate" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2">Waktu *</label>
                <input type="time" id="activityTime" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Lokasi</label>
              <input type="text" id="activityLocation"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="Contoh: Ruang Rapat Lantai 3" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Status</label>
              <select id="activityStatus"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none">
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                💾 Simpan
              </button>
              <button type="button" onclick="window.closeActivityModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-semibold">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering activities:', error);
    return `
      <div class="container mx-auto p-4 max-w-2xl">
        <div class="glass-card rounded-2xl p-6 border border-red-500/20">
          <h3 class="text-xl font-bold text-red-500 mb-2">❌ Error</h3>
          <p>Gagal memuat halaman kegiatan: ${error.message}</p>
        </div>
      </div>
    `;
  }
}

function renderActivityCard(activity) {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'pengurus';
  const statusColors = {
    upcoming: 'from-blue-500 to-indigo-600',
    ongoing: 'from-orange-500 to-amber-600',
    completed: 'from-green-500 to-emerald-600',
    cancelled: 'from-gray-500 to-slate-600'
  };
  const statusIcons = {
    upcoming: '⏰',
    ongoing: '▶️',
    completed: '✅',
    cancelled: '❌'
  };
  const statusLabels = {
    upcoming: 'Akan Datang',
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return `
    <div class="glass-card rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300 card-3d">
      <div class="flex items-start justify-between gap-4 mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${statusColors[activity.status]} text-white">
              ${statusIcons[activity.status]} ${statusLabels[activity.status]}
            </span>
          </div>
          <h3 class="text-xl font-bold mb-2">${activity.name}</h3>
          <p class="opacity-70 text-sm">${activity.description || 'Tidak ada deskripsi'}</p>
        </div>
        
        ${canEdit ? `
          <div class="flex gap-2">
            <button onclick="window.editActivity('${activity.id}')" 
              class="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-all hover:scale-110"
              title="Edit">
              ✏️
            </button>
            <button onclick="window.deleteActivity('${activity.id}', '${activity.name.replace(/'/g, "\\'")}')" 
              class="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all hover:scale-110"
              title="Hapus">
              🗑️
            </button>
          </div>
        ` : ''}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10">
        <div class="flex items-center gap-2">
          <span class="text-xl">📅</span>
          <div class="text-sm">
            <div class="opacity-60">Tanggal</div>
            <div class="font-semibold">${formatDate(activity.date)}</div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xl">⏰</span>
          <div class="text-sm">
            <div class="opacity-60">Waktu</div>
            <div class="font-semibold">${activity.time || '-'}</div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xl">📍</span>
          <div class="text-sm">
            <div class="opacity-60">Lokasi</div>
            <div class="font-semibold">${activity.location || 'TBA'}</div>
          </div>
        </div>
      </div>

      ${activity.status === 'upcoming' || activity.status === 'ongoing' ? `
        <div class="mt-4 pt-4 border-t border-white/10">
          <button onclick="window.showAttendance('${activity.id}')" 
            class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:scale-105 transition-transform">
            📝 Absensi
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

async function fetchActivities() {
  try {
    const q = query(
      collection(db, 'kegiatan'),
      orderBy('date', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    toast('Gagal memuat data kegiatan', 'error');
    return [];
  }
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Global functions for modal & actions
window.showAddActivityModal = () => {
  document.getElementById('modalTitle').textContent = 'Tambah Kegiatan';
  document.getElementById('activityForm').reset();
  document.getElementById('activityId').value = '';
  document.getElementById('activityModal').classList.remove('hidden');
};

window.closeActivityModal = () => {
  document.getElementById('activityModal').classList.add('hidden');
};

window.editActivity = async (id) => {
  const activity = activities.find(a => a.id === id);
  if (!activity) return;

  document.getElementById('modalTitle').textContent = 'Edit Kegiatan';
  document.getElementById('activityId').value = id;
  document.getElementById('activityName').value = activity.name;
  document.getElementById('activityDescription').value = activity.description || '';
  document.getElementById('activityDate').value = activity.date;
  document.getElementById('activityTime').value = activity.time || '';
  document.getElementById('activityLocation').value = activity.location || '';
  document.getElementById('activityStatus').value = activity.status;
  
  document.getElementById('activityModal').classList.remove('hidden');
};

window.handleActivitySubmit = async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('activityId').value;
  const data = {
    name: document.getElementById('activityName').value.trim(),
    description: document.getElementById('activityDescription').value.trim(),
    date: document.getElementById('activityDate').value,
    time: document.getElementById('activityTime').value,
    location: document.getElementById('activityLocation').value.trim(),
    status: document.getElementById('activityStatus').value,
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid
  };

  try {
    if (id) {
      // Update existing
      await updateDoc(doc(db, 'kegiatan', id), data);
      toast('✅ Kegiatan berhasil diupdate', 'success');
    } else {
      // Create new
      data.createdAt = serverTimestamp();
      data.createdBy = auth.currentUser?.uid;
      await addDoc(collection(db, 'kegiatan'), data);
      toast('✅ Kegiatan berhasil ditambahkan', 'success');
    }
    
    window.closeActivityModal();
    // Refresh page
    setTimeout(() => location.hash = '#/activities', 300);
  } catch (error) {
    console.error('Error saving activity:', error);
    toast('❌ Gagal menyimpan kegiatan: ' + error.message, 'error');
  }
};

window.deleteActivity = async (id, name) => {
  if (!confirm(`Hapus kegiatan "${name}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'kegiatan', id));
    toast('✅ Kegiatan berhasil dihapus', 'success');
    setTimeout(() => location.hash = '#/activities', 300);
  } catch (error) {
    console.error('Error deleting activity:', error);
    toast('❌ Gagal menghapus kegiatan: ' + error.message, 'error');
  }
};

window.showAttendance = (activityId) => {
  toast('🚧 Fitur absensi akan segera tersedia', 'info');
  // TODO: Implement attendance modal with QR code
};