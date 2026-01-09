
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "../../lib/firebase.js";
import { toast } from "../../components/Toast.js";
import { isValidEmail, checkRateLimit } from "../../lib/security.js";

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
  const emailInput=document.getElementById('email');
  const passInput=document.getElementById('pass');
  
  btn?.addEventListener('click', async ()=>{
    const email=(emailInput?.value||'').trim();
    const pass=(passInput?.value||'').trim();
    
    if(!email||!pass){ 
      toast('Email dan kata sandi wajib diisi.'); 
      return; 
    }
    
    if(!isValidEmail(email)){
      toast('Format email tidak valid.');
      emailInput?.focus();
      return;
    }
    
    if(!checkRateLimit('login', 5, 60000)){
      toast('Terlalu banyak percobaan. Tunggu sebentar.');
      return;
    }
    
    btn.disabled=true; 
    btn.textContent='Memproses...';
    
    try{
      await signInWithEmailAndPassword(auth,email,pass);
      toast('Berhasil masuk!');
      location.hash = '#/home';
    }catch(e){
      console.error('Login error:', e);
      let msg = 'Gagal masuk. Periksa email/kata sandi.';
      if(e.code === 'auth/user-not-found') msg = 'Email tidak terdaftar.';
      else if(e.code === 'auth/wrong-password') msg = 'Kata sandi salah.';
      else if(e.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      else if(e.code === 'auth/network-request-failed') msg = 'Tidak ada koneksi internet.';
      toast(msg);
    }finally{
      btn.disabled=false; 
      btn.textContent='Masuk';
    }
  });
  
  passInput?.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') btn?.click();
  });
}
