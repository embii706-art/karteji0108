
export async function admin(){
  return `
  <section class="space-y-3">
    <a href="#/admin/users" class="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 active:scale-[0.99] transition">
      <div class="font-bold">Kelola Pengguna</div>
      <div class="text-sm opacity-70 mt-1">Approve/reject, cari & filter, lihat status.</div>
    </a>
    <a href="#/admin/roles" class="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 active:scale-[0.99] transition">
      <div class="font-bold">Role Tambahan</div>
      <div class="text-sm opacity-70 mt-1">Assign role via extraRoles (ketua/bendahara/dll).</div>
    </a>
    <a href="#/admin/inbox" class="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 active:scale-[0.99] transition">
      <div class="font-bold">Surat Masuk/Keluar</div>
      <div class="text-sm opacity-70 mt-1">v1.8: pencatatan surat resmi + lampiran.</div>
    </a>
  </section>`;
}
