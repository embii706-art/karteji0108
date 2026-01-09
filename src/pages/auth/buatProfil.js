
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { auth, db } from "../../lib/firebase.js";
import { toast } from "../../components/Toast.js";

export async function authBuatProfil(){
  setTimeout(()=> bind(), 0);
  return `
  <section class="space-y-4">
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="font-bold text-lg">Buat Profil</div>
      <div class="text-sm opacity-70 mt-1">Lengkapi data agar bisa diproses admin.</div>
      <div class="mt-4 space-y-3">
        <label class="block text-sm font-semibold">Nama lengkap</label>
        <input id="fullName" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]" placeholder="Nama Anda"/>
        <label class="block text-sm font-semibold">Sie (opsional)</label>
        <input id="sie" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]" placeholder="Contoh: Humas"/>
        <button id="btn" class="w-full h-12 rounded-xl bg-[rgb(var(--primary))] text-white font-bold active:scale-[0.99] transition">Simpan Profil</button>
      </div>
    </div>
    <div class="text-xs opacity-70">Catatan: Status persetujuan dan role akan ditentukan server (Cloud Functions).</div>
  </section>`;
}

function bind(){
  const btn=document.getElementById('btn');
  btn?.addEventListener('click', async ()=>{
    const fullName=(document.getElementById('fullName')?.value||'').trim();
    const sie=(document.getElementById('sie')?.value||'').trim();
    if(!fullName){ toast('Nama lengkap wajib diisi.'); return; }

    const user = await new Promise(res=>{
      const u = onAuthStateChanged(auth,(x)=>{u();res(x||null);});
    });
    if(!user){ location.hash='#/auth/masuk'; return; }

    btn.disabled=true; btn.textContent='Menyimpan...';
    try{
      await setDoc(doc(db,'profiles',user.uid), {
        uid: user.uid,
        fullName,
        sie: sie || null,
        // roles & approvalStatus will be enforced/filled by Cloud Functions
        roles: ["anggota"],
        extraRoles: [],
        approvalStatus: "pending",
        createdAt: serverTimestamp()
      }, { merge: true });
      location.hash = '#/pending';
    }catch(e){
      toast('Gagal menyimpan profil. Coba lagi.');
    }finally{
      btn.disabled=false; btn.textContent='Simpan Profil';
    }
  });
}
