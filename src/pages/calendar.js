
export async function calendar(){
  const ctx = window.__KARTEJI_CTX__ || {};
  const today = ctx.todayISO || new Date().toISOString().slice(0,10);
  return `
  <section class="space-y-4">
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="font-bold text-lg">Kalender Indonesia + Jawa</div>
      <div class="text-sm opacity-70 mt-1">Menampilkan tanggal merah, hari penting, dan info pasaran Jawa.</div>
      <div class="mt-3 text-sm">
        Hari ini: <span class="font-bold">${today}</span>
      </div>
      <div class="mt-3">
        <a href="#/home" class="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-[var(--border)] active:scale-95 transition">
          <span class="material-symbols-rounded">arrow_back</span> Kembali
        </a>
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="font-bold">Catatan</div>
      <div class="text-sm opacity-70 mt-1">Untuk daftar event satu tahun penuh, gunakan scheduler Cloud Function yang mengisi <code>calendar_events</code>.</div>
    </div>
  </section>`;
}
