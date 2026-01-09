export function renderHome() {
  return `
    <section class="p-4 space-y-4">
      <div class="rounded-xl bg-card p-4 shadow">
        <h2 class="text-lg font-semibold">Beranda</h2>
        <p class="text-sm opacity-70">
          Selamat datang di KARTEJI 👋
        </p>
      </div>

      <div class="rounded-xl border border-border p-4 text-center">
        <p class="text-sm">
          Belum ada data ditampilkan.<br/>
          Mulai dengan membuat <b>Pengumuman</b> atau <b>Kegiatan</b>.
        </p>
      </div>
    </section>
  `;
}
