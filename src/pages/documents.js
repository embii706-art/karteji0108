import { skeletonGrid } from '../components/Skeleton.js';
import { emptyDocuments } from '../components/EmptyState.js';

export async function documents(){
  setTimeout(() => loadDocuments(), 100);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold flex items-center gap-2">
          <span class="material-symbols-rounded text-[28px]">folder</span>
          Dokumen
        </h1>
        <button class="px-4 h-10 rounded-xl bg-[rgb(var(--primary))] text-white text-sm font-semibold active:scale-[0.98] transition">
          <span class="material-symbols-rounded text-[18px]">upload</span>
        </button>
      </div>
      
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button class="px-4 h-9 rounded-full bg-[rgb(var(--primary))] text-white text-sm font-semibold whitespace-nowrap">Semua</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Surat</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Notulen</button>
        <button class="px-4 h-9 rounded-full border border-[var(--border)] text-sm whitespace-nowrap">Laporan</button>
      </div>
      
      <div id="documentsContent">
        ${skeletonGrid(6)}
      </div>
    </section>
  `;
}

function loadDocuments() {
  const container = document.getElementById('documentsContent');
  if (!container) return;
  
  const documents = [];
  
  if (documents.length === 0) {
    container.innerHTML = emptyDocuments();
  }
}