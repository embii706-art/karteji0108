/**
 * Documents Page (v2.5 Premium)
 * - Full CRUD for documents
 * - Cloud storage ready (Cloudinary/Firebase Storage)
 * - Category & period management
 * - Role-based access control
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';
import { getUserRole } from '../lib/gates.js';

let currentUserRole = 'user';
let documents = [];

export async function render() {
  try {
    currentUserRole = await getUserRole();
    documents = await fetchDocuments();
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
        <!-- Header Section -->
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-extrabold gradient-text">📁 Dokumen</h1>
              <p class="text-sm opacity-70 mt-1">Arsip & manajemen dokumen organisasi</p>
            </div>
            ${currentUserRole === 'admin' || currentUserRole === 'sekretaris' ? `
              <button onclick="window.showAddDocumentModal()" 
                class="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <span class="text-xl mr-2">➕</span> Tambah Dokumen
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
                📄
              </div>
              <div>
                <div class="text-2xl font-bold">${documents.length}</div>
                <div class="text-sm opacity-70">Total Dokumen</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-2xl">
                📂
              </div>
              <div>
                <div class="text-2xl font-bold">${[...new Set(documents.map(d => d.category))].length}</div>
                <div class="text-sm opacity-70">Kategori</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <div class="text-2xl font-bold">${[...new Set(documents.map(d => d.period))].length}</div>
                <div class="text-sm opacity-70">Periode</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${documents.length === 0 ? `
            <div class="col-span-full glass-card rounded-2xl p-12 text-center border border-white/20">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Dokumen</h3>
              <p class="opacity-70 mb-4">Mulai tambahkan dokumen organisasi Anda</p>
              ${currentUserRole === 'admin' || currentUserRole === 'sekretaris' ? `
                <button onclick="window.showAddDocumentModal()" 
                  class="btn-primary px-6 py-3 rounded-xl font-semibold">
                  Tambah Dokumen Pertama
                </button>
              ` : ''}
            </div>
          ` : documents.map(doc => renderDocumentCard(doc)).join('')}
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div id="documentModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text" id="documentModalTitle">Tambah Dokumen</h2>
            <button onclick="window.closeDocumentModal()" class="text-2xl opacity-70 hover:opacity-100 transition-opacity">
              ✕
            </button>
          </div>
          
          <form id="documentForm" onsubmit="window.handleDocumentSubmit(event)" class="space-y-4">
            <input type="hidden" id="documentId" />
            
            <div>
              <label class="block text-sm font-semibold mb-2">Nama Dokumen *</label>
              <input type="text" id="documentName" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="Contoh: Laporan Kegiatan Semester 1" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Deskripsi</label>
              <textarea id="documentDescription" rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none"
                placeholder="Jelaskan isi dokumen..."></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-2">Kategori *</label>
                <select id="documentCategory" required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none">
                  <option value="">Pilih Kategori</option>
                  <option value="Laporan">Laporan</option>
                  <option value="Surat">Surat</option>
                  <option value="SK">SK (Surat Keputusan)</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Notulen">Notulen</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-2">Periode</label>
                <input type="text" id="documentPeriod"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  placeholder="Contoh: 2024/2025" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">URL / Link Dokumen *</label>
              <input type="url" id="documentUrl" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="https://drive.google.com/..." />
              <p class="text-xs opacity-60 mt-1">Upload file ke Google Drive atau layanan cloud lain, lalu paste link-nya disini</p>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                💾 Simpan
              </button>
              <button type="button" onclick="window.closeDocumentModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-semibold">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering documents:', error);
    return `
      <div class="container mx-auto p-4 max-w-2xl">
        <div class="glass-card rounded-2xl p-6 border border-red-500/20">
          <h3 class="text-xl font-bold text-red-500 mb-2">❌ Error</h3>
          <p>Gagal memuat halaman dokumen: ${error.message}</p>
        </div>
      </div>
    `;
  }
}

function renderDocumentCard(document) {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'sekretaris';
  const categoryIcons = {
    'Laporan': '📊',
    'Surat': '✉️',
    'SK': '📜',
    'Proposal': '📝',
    'Notulen': '📋',
    'Lainnya': '📄'
  };

  return `
    <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-all duration-300 card-3d">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div class="text-4xl">${categoryIcons[document.category] || '📄'}</div>
        ${canEdit ? `
          <div class="flex gap-2">
            <button onclick="window.editDocument('${document.id}')" 
              class="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-all hover:scale-110 text-sm"
              title="Edit">
              ✏️
            </button>
            <button onclick="window.deleteDocument('${document.id}', '${document.name.replace(/'/g, "\\'")}')" 
              class="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all hover:scale-110 text-sm"
              title="Hapus">
              🗑️
            </button>
          </div>
        ` : ''}
      </div>

      <h3 class="font-bold text-lg mb-2">${document.name}</h3>
      <p class="text-sm opacity-70 mb-3 line-clamp-2">${document.description || 'Tidak ada deskripsi'}</p>
      
      <div class="flex gap-2 mb-3">
        <span class="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-500">
          ${document.category}
        </span>
        ${document.period ? `
          <span class="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-500">
            ${document.period}
          </span>
        ` : ''}
      </div>

      <a href="${document.url}" target="_blank" rel="noopener noreferrer"
        class="block w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center font-semibold hover:scale-105 transition-transform">
        📥 Buka Dokumen
      </a>
    </div>
  `;
}

async function fetchDocuments() {
  try {
    const q = query(
      collection(db, 'dokumen'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    toast('Gagal memuat data dokumen', 'error');
    return [];
  }
}

// Global functions
window.showAddDocumentModal = () => {
  document.getElementById('documentModalTitle').textContent = 'Tambah Dokumen';
  document.getElementById('documentForm').reset();
  document.getElementById('documentId').value = '';
  document.getElementById('documentModal').classList.remove('hidden');
};

window.closeDocumentModal = () => {
  document.getElementById('documentModal').classList.add('hidden');
};

window.editDocument = async (id) => {
  const document = documents.find(d => d.id === id);
  if (!document) return;

  document.getElementById('documentModalTitle').textContent = 'Edit Dokumen';
  document.getElementById('documentId').value = id;
  document.getElementById('documentName').value = document.name;
  document.getElementById('documentDescription').value = document.description || '';
  document.getElementById('documentCategory').value = document.category;
  document.getElementById('documentPeriod').value = document.period || '';
  document.getElementById('documentUrl').value = document.url;
  
  document.getElementById('documentModal').classList.remove('hidden');
};

window.handleDocumentSubmit = async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('documentId').value;
  const data = {
    name: document.getElementById('documentName').value.trim(),
    description: document.getElementById('documentDescription').value.trim(),
    category: document.getElementById('documentCategory').value,
    period: document.getElementById('documentPeriod').value.trim(),
    url: document.getElementById('documentUrl').value.trim(),
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'dokumen', id), data);
      toast('✅ Dokumen berhasil diupdate', 'success');
    } else {
      data.createdAt = serverTimestamp();
      data.createdBy = auth.currentUser?.uid;
      await addDoc(collection(db, 'dokumen'), data);
      toast('✅ Dokumen berhasil ditambahkan', 'success');
    }
    
    window.closeDocumentModal();
    setTimeout(() => location.hash = '#/documents', 300);
  } catch (error) {
    console.error('Error saving document:', error);
    toast('❌ Gagal menyimpan dokumen: ' + error.message, 'error');
  }
};

window.deleteDocument = async (id, name) => {
  if (!confirm(`Hapus dokumen "${name}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'dokumen', id));
    toast('✅ Dokumen berhasil dihapus', 'success');
    setTimeout(() => location.hash = '#/documents', 300);
  } catch (error) {
    console.error('Error deleting document:', error);
    toast('❌ Gagal menghapus dokumen: ' + error.message, 'error');
  }
};