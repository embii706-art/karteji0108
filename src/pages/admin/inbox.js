import { skeletonList } from '../../components/Skeleton.js';
import { emptyInbox } from '../../components/EmptyState.js';

export async function adminInbox(){
  setTimeout(() => loadInbox(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">mail</span>
          Surat Masuk/Keluar
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          + Surat Baru
        </button>
      </div>
      
      <div class="flex gap-2">
        <button class="flex-1 px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold">Masuk</button>
        <button class="flex-1 px-4 h-10 rounded-xl border border-[var(--border)] text-sm font-semibold">Keluar</button>
      </div>
      
      <div id="inboxContent">
        ${skeletonList(3)}
      </div>
    </section>
  `;
}

function loadInbox() {
  const container = document.getElementById('inboxContent');
  if (!container) return;
  
  const mails = [];
  
  if (mails.length === 0) {
    container.innerHTML = emptyInbox();
  }
}