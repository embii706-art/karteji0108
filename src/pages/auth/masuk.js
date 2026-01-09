
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "../../lib/firebase.js";
import { toast } from "../../components/Toast.js";

export async function authMasuk(){
  setTimeout(()=> bind(), 0);
  return `
  <section class="space-y-4">
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div class="font-bold text-lg">Masuk</div>
      <div class="text-sm opacity-70 mt-1">Gunakan email & kata sandi Anda.</div>
      <div class="mt-4 space-y-3">
        <label class="block text-sm font-semibold">Email</label>
        <input id="email" type="email" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]" placeholder="nama@email.com"/>
        <label class="block text-sm font-semibold">Kata sandi</label>
        <input id="pass" type="password" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)]" placeholder="••••••••"/>
        <button id="btn" class="w-full h-12 rounded-xl bg-[rgb(var(--primary))] text-white font-bold active:scale-[0.99] transition">Masuk</button>
      </div>
    </div>

    <div class="text-center text-sm opacity-80">
      Belum punya akun? <a class="underline" href="#/auth/daftar">Daftar</a>
    </div>
  </section>`;
}

function bind(){
  const btn=document.getElementById('btn');
  btn?.addEventListener('click', async ()=>{
    const email=(document.getElementById('email')?.value||'').trim();
    const pass=(document.getElementById('pass')?.value||'').trim();
    if(!email||!pass){ toast('Email dan kata sandi wajib diisi.'); return; }
    btn.disabled=true; btn.textContent='Memproses...';
    try{
      await signInWithEmailAndPassword(auth,email,pass);
      location.hash = '#/home';
    }catch(e){
      toast('Gagal masuk. Periksa email/kata sandi.');
    }finally{
      btn.disabled=false; btn.textContent='Masuk';
    }
  });
}
