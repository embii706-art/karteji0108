
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "../../lib/firebase.js";
import { toast } from "../../components/Toast.js";
import { isValidEmail, validatePassword, checkRateLimit } from "../../lib/security.js";

export async function authDaftar(){
  setTimeout(()=> bind(), 0);
  return `
  <section class="space-y-4 max-w-md mx-auto">
    <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg">
      <div class="font-bold text-xl mb-1">Daftar</div>
      <div class="text-sm opacity-70 mt-1 mb-4">Buat akun untuk bergabung.</div>
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-semibold mb-1.5">Email</label>
          <input id="email" type="email" autocomplete="email" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:border-[rgb(var(--primary))] focus:outline-none transition" placeholder="nama@email.com"/>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1.5">Kata sandi</label>
          <input id="pass" type="password" autocomplete="new-password" class="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] focus:border-[rgb(var(--primary))] focus:outline-none transition" placeholder="minimal 6 karakter"/>
          <div id="passStrength" class="text-xs mt-1 opacity-70"></div>
        </div>
        <button id="btn" class="w-full h-12 rounded-xl bg-[rgb(var(--primary))] text-white font-bold active:scale-[0.98] transition shadow-lg hover:shadow-xl">
          Daftar
        </button>
      </div>
    </div>

    <div class="text-center text-sm opacity-80">
      Sudah punya akun? <a class="underline text-[rgb(var(--primary))] font-semibold" href="#/auth/masuk">Masuk</a>
    </div>
  </section>`;
}

function bind(){
  const btn=document.getElementById('btn');
  const emailInput=document.getElementById('email');
  const passInput=document.getElementById('pass');
  const passStrength=document.getElementById('passStrength');
  
  // Real-time password strength indicator
  passInput?.addEventListener('input', ()=>{
    const pass = passInput.value;
    if(!pass){
      passStrength.textContent = '';
      return;
    }
    const result = validatePassword(pass);
    passStrength.textContent = result.message;
    passStrength.className = result.valid ? 'text-xs mt-1 text-green-600 dark:text-green-400' : 'text-xs mt-1 text-red-600 dark:text-red-400';
  });
  
  btn?.addEventListener('click', async ()=>{
    const email=(emailInput?.value||'').trim();
    const pass=(passInput?.value||'').trim();
    
    // Validation
    if(!email || !pass){
      toast('Email dan kata sandi wajib diisi.'); 
      return;
    }
    
    if(!isValidEmail(email)){
      toast('Format email tidak valid.');
      emailInput?.focus();
      return;
    }
    
    const passValidation = validatePassword(pass);
    if(!passValidation.valid){
      toast(passValidation.message);
      passInput?.focus();
      return;
    }
    
    // Rate limiting
    if(!checkRateLimit('register', 3, 300000)){
      toast('Terlalu banyak percobaan pendaftaran. Tunggu 5 menit.');
      return;
    }
    
    btn.disabled=true; 
    btn.textContent='Memproses...';
    
    try{
      await createUserWithEmailAndPassword(auth,email,pass);
      toast('Pendaftaran berhasil!');
      location.hash = '#/auth/buat-profil';
    }catch(e){
      console.error('Registration error:', e);
      let msg = 'Gagal daftar. Coba email lain atau periksa koneksi.';
      if(e.code === 'auth/email-already-in-use'){
        msg = 'Email sudah terdaftar. Silakan login.';
      } else if(e.code === 'auth/invalid-email'){
        msg = 'Format email tidak valid.';
      } else if(e.code === 'auth/weak-password'){
        msg = 'Kata sandi terlalu lemah.';
      } else if(e.code === 'auth/network-request-failed'){
        msg = 'Tidak ada koneksi internet.';
      }
      toast(msg);
    }finally{
      btn.disabled=false; 
      btn.textContent='Daftar';
    }
  });
  
  // Enter key support
  passInput?.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') btn?.click();
  });
}
