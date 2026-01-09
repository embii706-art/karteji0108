import { skeletonGrid, skeletonList } from '../components/Skeleton.js';
import { emptyFinance } from '../components/EmptyState.js';

export async function finance(){
  setTimeout(() => loadFinance(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">account_balance_wallet</span>
          Kas & Keuangan
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Transaksi
        </button>
      </div>
      
      <div id="financeStats">
        ${skeletonGrid(3)}
      </div>
      
      <div class="flex items-center justify-between">
        <h2 class="font-bold">Riwayat Transaksi</h2>
        <button class="text-sm text-[rgb(var(--primary))] font-semibold">Lihat Semua</button>
      </div>
      
      <div id="financeTransactions">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadFinance() {
  const statsContainer = document.getElementById('financeStats');
  const transContainer = document.getElementById('financeTransactions');
  
  // Load stats
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div class="text-xs opacity-70">Saldo</div>
          <div class="text-xl font-bold mt-1">Rp 0</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div class="text-xs opacity-70">Pemasukan</div>
          <div class="text-xl font-bold text-green-600 mt-1">Rp 0</div>
        </div>
        <div class="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div class="text-xs opacity-70">Pengeluaran</div>
          <div class="text-xl font-bold text-red-600 mt-1">Rp 0</div>
        </div>
      </div>
    `;
  }
  
  // Load transactions
  const transactions = [];
  if (transContainer) {
    if (transactions.length === 0) {
      transContainer.innerHTML = emptyFinance();
    }
  }
}