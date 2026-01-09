
export function setTitle(hash){
  const map = {
    '#/home':'Beranda',
    '#/feed':'Feed',
    '#/activities':'Kegiatan',
    '#/finance':'Kas',
    '#/profile':'Profil',
    '#/calendar':'Kalender',
    '#/members':'Anggota',
    '#/minutes':'Notulen',
    '#/documents':'Dokumen',
    '#/periods':'Periode',
    '#/admin':'Admin',
    '#/admin/users':'Admin • Pengguna',
    '#/admin/roles':'Admin • Role',
    '#/admin/inbox':'Admin • Surat Masuk/Keluar',
    '#/pending':'Menunggu Persetujuan',
    '#/auth/masuk':'Masuk',
    '#/auth/daftar':'Daftar',
    '#/auth/buat-profil':'Buat Profil',
  };
  const t = map[hash] || 'KARTEJI';
  const title = document.getElementById('title');
  if(title) title.textContent = t;
}
