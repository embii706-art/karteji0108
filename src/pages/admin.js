
export async function admin(){
  return `
  <section class="space-y-3">
    <a href="#/admin/users" class="block glass-card rounded-2xl p-4 active:scale-[0.99] transition card-3d">
      <div class="font-bold">Kelola Pengguna</div>
      <div class="text-sm opacity-70 mt-1">Approve/reject, cari & filter, lihat status.</div>
    </a>
    <a href="#/admin/roles" class="block glass-card rounded-2xl p-4 active:scale-[0.99] transition card-3d">
      <div class="font-bold">Role Tambahan</div>
      <div class="text-sm opacity-70 mt-1">Assign role via extraRoles (ketua/bendahara/dll).</div>
    </a>
    <a href="#/admin/inbox" class="block glass-card rounded-2xl p-4 active:scale-[0.99] transition card-3d">
      <div class="font-bold">Surat Masuk/Keluar</div>
      <div class="text-sm opacity-70 mt-1">v2.5: pencatatan surat resmi + lampiran dengan premium UI.</div>
    </a>
  </section>`;
}
