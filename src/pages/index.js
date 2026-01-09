
export { authMasuk } from './auth/masuk.js';
export { authDaftar } from './auth/daftar.js';
export { authBuatProfil } from './auth/buatProfil.js';
export { pending } from './pending.js';
export { home } from './home.js';
export { feed } from './feed.js';
export { activities } from './activities.js';
export { finance } from './finance.js';
export { calendar } from './calendar.js';
export { members } from './members.js';
export { minutes } from './minutes.js';
export { documents } from './documents.js';
export { periods } from './periods.js';
export { admin } from './admin.js';
export { adminUsers } from './admin/users.js';
export { adminRoles } from './admin/roles.js';
export { adminInbox } from './admin/inbox.js';
export async function notFound(){
  return `<div class="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
    <div class="font-bold">Halaman tidak ditemukan</div>
    <div class="text-sm opacity-70 mt-1">Cek menu navigasi di bawah.</div>
  </div>`;
}
