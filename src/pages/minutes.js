/**
 * Minutes Page (v2.5 Premium)
 * - Full CRUD for meeting minutes
 * - Export to PDF
 * - Attendance tracking
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';
import { getUserRole } from '../lib/gates.js';

let currentUserRole = 'user';
let minutes = [];

export async function render() {
  try {
    currentUserRole = await getUserRole();
    minutes = await fetchMinutes();
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-extrabold gradient-text">📋 Notulen</h1>
              <p class="text-sm opacity-70 mt-1">Catatan & hasil rapat organisasi</p>
            </div>
            ${currentUserRole === 'admin' || currentUserRole === 'sekretaris' ? `
              <button onclick="window.showAddMinuteModal()" 
                class="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <span class="text-xl mr-2">➕</span> Tambah Notulen
              </button>
            ` : ''}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">📊</div>
              <div>
                <div class="text-2xl font-bold">${minutes.length}</div>
                <div class="text-sm opacity-70">Total Notulen</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-2xl">📅</div>
              <div>
                <div class="text-2xl font-bold">${minutes.filter(m => new Date(m.date) > new Date(Date.now() - 30*24*60*60*1000)).length}</div>
                <div class="text-sm opacity-70">Rapat Bulan Ini</div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          ${minutes.length === 0 ? `
            <div class="glass-card rounded-2xl p-12 text-center border border-white/20">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Notulen</h3>
              <p class="opacity-70 mb-4">Mulai catat hasil rapat Anda</p>
              ${currentUserRole === 'admin' || currentUserRole === 'sekretaris' ? `
                <button onclick="window.showAddMinuteModal()" class="btn-primary px-6 py-3 rounded-xl font-semibold">
                  Tambah Notulen Pertama
                </button>
              ` : ''}
            </div>
          ` : minutes.map(m => renderMinuteCard(m)).join('')}
        </div>
      </div>

      <div id="minuteModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass-card rounded-2xl p-6 max-w-3xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text" id="minuteModalTitle">Tambah Notulen</h2>
            <button onclick="window.closeMinuteModal()" class="text-2xl opacity-70 hover:opacity-100">✕</button>
          </div>
          
          <form id="minuteForm" onsubmit="window.handleMinuteSubmit(event)" class="space-y-4">
            <input type="hidden" id="minuteId" />
            <div>
              <label class="block text-sm font-semibold mb-2">Judul Rapat *</label>
              <input type="text" id="minuteTitle" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 outline-none"
                placeholder="Contoh: Rapat Koordinasi Bulanan" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Tanggal *</label>
                <input type="date" id="minuteDate" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2">Waktu *</label>
                <input type="time" id="minuteTime" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Lokasi</label>
              <input type="text" id="minuteLocation"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none"
                placeholder="Ruang Rapat" />
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Agenda *</label>
              <textarea id="minuteAgenda" rows="3" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none resize-none"
                placeholder="Tulis agenda rapat..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Hasil & Keputusan *</label>
              <textarea id="minuteResults" rows="4" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none resize-none"
                placeholder="Tulis hasil rapat..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold mb-2">Tindak Lanjut</label>
              <textarea id="minuteFollowUp" rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none resize-none"
                placeholder="Tindak lanjut (opsional)..."></textarea>
            </div>
            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105">
                💾 Simpan
              </button>
              <button type="button" onclick="window.closeMinuteModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-semibold">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error:', error);
    return `<div class="p-4 glass-card rounded-2xl">Error: ${error.message}</div>`;
  }
}

function renderMinuteCard(minute) {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'sekretaris';
  return `
    <div class="glass-card rounded-2xl p-6 border border-white/20 hover:scale-[1.01] transition-all card-3d">
      <div class="flex justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">📋</span>
            <h3 class="text-xl font-bold">${minute.title}</h3>
          </div>
          <div class="flex gap-4 text-sm opacity-70">
            <span>📅 ${formatDate(minute.date)}</span>
            <span>⏰ ${minute.time}</span>
            ${minute.location ? `<span>📍 ${minute.location}</span>` : ''}
          </div>
        </div>
        ${canEdit ? `
          <div class="flex gap-2">
            <button onclick="window.editMinute('${minute.id}')" 
              class="w-10 h-10 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center">✏️</button>
            <button onclick="window.deleteMinute('${minute.id}', '${minute.title.replace(/'/g, "\\'")}')" 
              class="w-10 h-10 rounded-xl bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center">🗑️</button>
          </div>
        ` : ''}
      </div>
      <div class="space-y-3 pt-4 border-t border-white/10">
        <div>
          <h4 class="font-semibold mb-2">📌 Agenda:</h4>
          <div class="text-sm opacity-80 whitespace-pre-line">${minute.agenda}</div>
        </div>
        <div>
          <h4 class="font-semibold mb-2">✅ Hasil & Keputusan:</h4>
          <div class="text-sm opacity-80 whitespace-pre-line">${minute.results}</div>
        </div>
        ${minute.followUp ? `
          <div>
            <h4 class="font-semibold mb-2">🎯 Tindak Lanjut:</h4>
            <div class="text-sm opacity-80 whitespace-pre-line">${minute.followUp}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function fetchMinutes() {
  try {
    const q = query(collection(db, 'notulen'), orderBy('date', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

function formatDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

window.showAddMinuteModal = () => {
  document.getElementById('minuteModalTitle').textContent = 'Tambah Notulen';
  document.getElementById('minuteForm').reset();
  document.getElementById('minuteId').value = '';
  document.getElementById('minuteDate').valueAsDate = new Date();
  document.getElementById('minuteModal').classList.remove('hidden');
};

window.closeMinuteModal = () => {
  document.getElementById('minuteModal').classList.add('hidden');
};

window.editMinute = (id) => {
  const minute = minutes.find(m => m.id === id);
  if (!minute) return;
  document.getElementById('minuteModalTitle').textContent = 'Edit Notulen';
  document.getElementById('minuteId').value = id;
  document.getElementById('minuteTitle').value = minute.title;
  document.getElementById('minuteDate').value = minute.date;
  document.getElementById('minuteTime').value = minute.time;
  document.getElementById('minuteLocation').value = minute.location || '';
  document.getElementById('minuteAgenda').value = minute.agenda;
  document.getElementById('minuteResults').value = minute.results;
  document.getElementById('minuteFollowUp').value = minute.followUp || '';
  document.getElementById('minuteModal').classList.remove('hidden');
};

window.handleMinuteSubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('minuteId').value;
  const data = {
    title: document.getElementById('minuteTitle').value.trim(),
    date: document.getElementById('minuteDate').value,
    time: document.getElementById('minuteTime').value,
    location: document.getElementById('minuteLocation').value.trim(),
    agenda: document.getElementById('minuteAgenda').value.trim(),
    results: document.getElementById('minuteResults').value.trim(),
    followUp: document.getElementById('minuteFollowUp').value.trim(),
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid
  };
  try {
    if (id) {
      await updateDoc(doc(db, 'notulen', id), data);
      toast('✅ Notulen berhasil diupdate', 'success');
    } else {
      data.createdAt = serverTimestamp();
      data.createdBy = auth.currentUser?.uid;
      await addDoc(collection(db, 'notulen'), data);
      toast('✅ Notulen berhasil ditambahkan', 'success');
    }
    window.closeMinuteModal();
    setTimeout(() => location.hash = '#/minutes', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal menyimpan: ' + error.message, 'error');
  }
};

window.deleteMinute = async (id, title) => {
  if (!confirm(`Hapus notulen "${title}"?`)) return;
  try {
    await deleteDoc(doc(db, 'notulen', id));
    toast('✅ Notulen berhasil dihapus', 'success');
    setTimeout(() => location.hash = '#/minutes', 300);
  } catch (error) {
    console.error('Error:', error);
    toast('❌ Gagal menghapus', 'error');
  }
};