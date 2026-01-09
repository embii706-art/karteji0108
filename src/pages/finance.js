/**
 * Finance Page (v2.5 Premium)
 * - Full CRUD for income/expense transactions
 * - Upload receipt via Cloudinary
 * - Financial reports & statistics
 * - Role-based access control
 */

import { auth, db } from '../lib/firebase.js';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { toast } from '../components/Toast.js';
import { getUserRole } from '../lib/gates.js';

let currentUserRole = 'user';
let transactions = [];

export async function render() {
  try {
    currentUserRole = await getUserRole();
    transactions = await fetchTransactions();
    
    const stats = calculateStats(transactions);
    
    return `
      <div class="container mx-auto p-4 pb-24 max-w-6xl animate-fade-in">
        <!-- Header Section -->
        <div class="glass-card rounded-2xl p-6 mb-6 border border-white/20">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-extrabold gradient-text">💰 Keuangan</h1>
              <p class="text-sm opacity-70 mt-1">Manajemen kas & transaksi organisasi</p>
            </div>
            ${currentUserRole === 'admin' || currentUserRole === 'bendahara' ? `
              <button onclick="window.showAddTransactionModal()" 
                class="btn-primary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <span class="text-xl mr-2">➕</span> Tambah Transaksi
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                📈
              </div>
              <div>
                <div class="text-xs opacity-60 mb-1">Pemasukan</div>
                <div class="text-xl font-bold">${formatCurrency(stats.totalIncome)}</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-2xl">
                📉
              </div>
              <div>
                <div class="text-xs opacity-60 mb-1">Pengeluaran</div>
                <div class="text-xl font-bold">${formatCurrency(stats.totalExpense)}</div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <div class="text-xs opacity-60 mb-1">Saldo</div>
                <div class="text-xl font-bold ${stats.balance >= 0 ? 'text-green-500' : 'text-red-500'}">
                  ${formatCurrency(stats.balance)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="glass-card rounded-xl p-5 border border-white/20 hover:scale-105 transition-transform">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <div class="text-xs opacity-60 mb-1">Total Transaksi</div>
                <div class="text-xl font-bold">${transactions.length}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transactions List -->
        <div class="glass-card rounded-2xl p-6 border border-white/20">
          <h2 class="text-xl font-bold mb-4">Riwayat Transaksi</h2>
          
          ${transactions.length === 0 ? `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">📭</div>
              <h3 class="text-xl font-bold mb-2">Belum Ada Transaksi</h3>
              <p class="opacity-70 mb-4">Mulai catat transaksi keuangan Anda</p>
              ${currentUserRole === 'admin' || currentUserRole === 'bendahara' ? `
                <button onclick="window.showAddTransactionModal()" 
                  class="btn-primary px-6 py-3 rounded-xl font-semibold">
                  Tambah Transaksi Pertama
                </button>
              ` : ''}
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b border-white/10">
                  <tr class="text-left">
                    <th class="pb-3 px-2">Tanggal</th>
                    <th class="pb-3 px-2">Deskripsi</th>
                    <th class="pb-3 px-2">Kategori</th>
                    <th class="pb-3 px-2 text-right">Jumlah</th>
                    ${currentUserRole === 'admin' || currentUserRole === 'bendahara' ? '<th class="pb-3 px-2 text-center">Aksi</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${transactions.map(t => renderTransactionRow(t)).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div id="transactionModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card rounded-2xl p-6 max-w-2xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold gradient-text" id="transactionModalTitle">Tambah Transaksi</h2>
            <button onclick="window.closeTransactionModal()" class="text-2xl opacity-70 hover:opacity-100 transition-opacity">
              ✕
            </button>
          </div>
          
          <form id="transactionForm" onsubmit="window.handleTransactionSubmit(event)" class="space-y-4">
            <input type="hidden" id="transactionId" />
            
            <div>
              <label class="block text-sm font-semibold mb-2">Jenis Transaksi *</label>
              <select id="transactionType" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none">
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Jumlah (Rp) *</label>
              <input type="number" id="transactionAmount" required min="0" step="1000"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="100000" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Deskripsi *</label>
              <input type="text" id="transactionDescription" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="Contoh: Iuran Bulanan, Pembelian Perlengkapan" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Kategori</label>
              <input type="text" id="transactionCategory"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                placeholder="Contoh: Iuran, Operasional, Acara" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Tanggal *</label>
              <input type="date" id="transactionDate" required
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none" />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-2">Catatan</label>
              <textarea id="transactionNotes" rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all outline-none resize-none"
                placeholder="Catatan tambahan..."></textarea>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                💾 Simpan
              </button>
              <button type="button" onclick="window.closeTransactionModal()"
                class="flex-1 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all font-semibold">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering finance:', error);
    return `
      <div class="container mx-auto p-4 max-w-2xl">
        <div class="glass-card rounded-2xl p-6 border border-red-500/20">
          <h3 class="text-xl font-bold text-red-500 mb-2">❌ Error</h3>
          <p>Gagal memuat halaman keuangan: ${error.message}</p>
        </div>
      </div>
    `;
  }
}

function renderTransactionRow(transaction) {
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'bendahara';
  const isIncome = transaction.type === 'income';
  
  return `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td class="py-3 px-2 text-sm">${formatDate(transaction.date)}</td>
      <td class="py-3 px-2">
        <div class="font-semibold">${transaction.description}</div>
        ${transaction.notes ? `<div class="text-xs opacity-60 mt-1">${transaction.notes}</div>` : ''}
      </td>
      <td class="py-3 px-2">
        <span class="px-2 py-1 rounded-lg text-xs font-semibold ${isIncome ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}">
          ${transaction.category || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
        </span>
      </td>
      <td class="py-3 px-2 text-right font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}">
        ${isIncome ? '+' : '-'} ${formatCurrency(transaction.amount)}
      </td>
      ${canEdit ? `
        <td class="py-3 px-2 text-center">
          <div class="flex gap-2 justify-center">
            <button onclick="window.editTransaction('${transaction.id}')" 
              class="text-blue-500 hover:text-blue-400 transition-colors"
              title="Edit">
              ✏️
            </button>
            <button onclick="window.deleteTransaction('${transaction.id}', '${transaction.description.replace(/'/g, "\\'")}')" 
              class="text-red-500 hover:text-red-400 transition-colors"
              title="Hapus">
              🗑️
            </button>
          </div>
        </td>
      ` : ''}
    </tr>
  `;
}

async function fetchTransactions() {
  try {
    const q = query(
      collection(db, 'kas'),
      orderBy('date', 'desc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    toast('Gagal memuat data transaksi', 'error');
    return [];
  }
}

function calculateStats(transactions) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
    
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Global functions
window.showAddTransactionModal = () => {
  document.getElementById('transactionModalTitle').textContent = 'Tambah Transaksi';
  document.getElementById('transactionForm').reset();
  document.getElementById('transactionId').value = '';
  document.getElementById('transactionDate').valueAsDate = new Date();
  document.getElementById('transactionModal').classList.remove('hidden');
};

window.closeTransactionModal = () => {
  document.getElementById('transactionModal').classList.add('hidden');
};

window.editTransaction = async (id) => {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  document.getElementById('transactionModalTitle').textContent = 'Edit Transaksi';
  document.getElementById('transactionId').value = id;
  document.getElementById('transactionType').value = transaction.type;
  document.getElementById('transactionAmount').value = transaction.amount;
  document.getElementById('transactionDescription').value = transaction.description;
  document.getElementById('transactionCategory').value = transaction.category || '';
  document.getElementById('transactionDate').value = transaction.date;
  document.getElementById('transactionNotes').value = transaction.notes || '';
  
  document.getElementById('transactionModal').classList.remove('hidden');
};

window.handleTransactionSubmit = async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('transactionId').value;
  const data = {
    type: document.getElementById('transactionType').value,
    amount: parseInt(document.getElementById('transactionAmount').value),
    description: document.getElementById('transactionDescription').value.trim(),
    category: document.getElementById('transactionCategory').value.trim(),
    date: document.getElementById('transactionDate').value,
    notes: document.getElementById('transactionNotes').value.trim(),
    updatedAt: serverTimestamp(),
    updatedBy: auth.currentUser?.uid
  };

  try {
    if (id) {
      await updateDoc(doc(db, 'kas', id), data);
      toast('✅ Transaksi berhasil diupdate', 'success');
    } else {
      data.createdAt = serverTimestamp();
      data.createdBy = auth.currentUser?.uid;
      await addDoc(collection(db, 'kas'), data);
      toast('✅ Transaksi berhasil ditambahkan', 'success');
    }
    
    window.closeTransactionModal();
    setTimeout(() => location.hash = '#/finance', 300);
  } catch (error) {
    console.error('Error saving transaction:', error);
    toast('❌ Gagal menyimpan transaksi: ' + error.message, 'error');
  }
};

window.deleteTransaction = async (id, description) => {
  if (!confirm(`Hapus transaksi "${description}"?\n\nData yang dihapus tidak dapat dikembalikan.`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'kas', id));
    toast('✅ Transaksi berhasil dihapus', 'success');
    setTimeout(() => location.hash = '#/finance', 300);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    toast('❌ Gagal menghapus transaksi: ' + error.message, 'error');
  }
};