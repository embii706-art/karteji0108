
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "../lib/firebase.js";

export async function pending(){
  setTimeout(()=> bind(),0);
  return `
  <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
    <div class="font-bold text-lg">Menunggu Persetujuan</div>
    <div class="text-sm opacity-70 mt-1">Akun Anda sedang ditinjau. Setelah disetujui, aplikasi akan terbuka otomatis saat Anda masuk kembali.</div>
    <button id="out" class="mt-4 w-full h-12 rounded-xl border border-[var(--border)] active:scale-[0.99] transition">Keluar</button>
  </div>`;
}
function bind(){
  document.getElementById('out')?.addEventListener('click', async ()=>{
    await signOut(auth);
    location.hash='#/auth/masuk';
  });
}
