
export async function members(){
  return `
  <section class="space-y-4">
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="font-bold text-lg">Anggota</div>
      <div class="text-sm opacity-70 mt-1">Semua role dapat melihat status online/offline dan role anggota (presence).</div>
      <div class="mt-3 text-sm opacity-70">Implementasi presence: <code>presence/{uid}</code> (online, lastSeen).</div>
    </div>
  </section>`;
}
