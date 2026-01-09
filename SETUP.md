# 🚀 Panduan Setup & Penggunaan KARTEJI v2.5

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- Node.js (v18 atau lebih tinggi)
- npm atau yarn
- Firebase CLI (optional, untuk deploy)

## ⚙️ Setup Lokal

### 1. Install Dependensi Firebase Functions

```bash
cd functions
npm install
```

### 2. Jalankan Development Server

```bash
# Dari root directory
npm run dev

# Atau langsung dengan npx
npx http-server -p 3000 -c-1
```

Aplikasi akan berjalan di: `http://localhost:3000`

## 🔥 Setup Firebase (Optional untuk Deploy)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login ke Firebase

```bash
firebase login
```

### 3. Deploy ke Firebase Hosting

```bash
# Deploy semua (hosting, functions, firestore rules)
firebase deploy

# Deploy hanya hosting
firebase deploy --only hosting

# Deploy hanya functions
firebase deploy --only functions

# Deploy hanya firestore rules
firebase deploy --only firestore:rules
```

## 🌐 Deploy ke Vercel

### Quick Deploy

1. Push ke GitHub repository
2. Import project di Vercel dashboard
3. Deploy otomatis akan berjalan

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy production
vercel --prod
```

## 📱 Fitur yang Tersedia

### ✅ Sudah Lengkap
- ✅ SPA dengan Hash Router
- ✅ Bottom Navigation
- ✅ Dark/Light Theme
- ✅ PWA dengan Service Worker
- ✅ Offline Support
- ✅ Smart Search (⌘K / Ctrl+K)
- ✅ Social Sharing
- ✅ Firebase Authentication
- ✅ Firestore Database
- ✅ Cloud Functions
- ✅ Glassmorphism UI
- ✅ 3D Interactive Cards
- ✅ Toast Notifications
- ✅ Network Status Indicator

### 📝 Halaman Aplikasi
1. **Home** - Dashboard utama
2. **Kegiatan** - Daftar kegiatan/aktivitas
3. **Kalender** - Jadwal dan tanggal penting
4. **Anggota** - Daftar anggota organisasi
5. **Keuangan** - Manajemen kas dan transaksi
6. **Dokumen** - Manajemen dokumen
7. **Notulen** - Catatan rapat
8. **Feed** - Timeline aktivitas
9. **Admin Panel** - Panel administrasi

## 🔑 Konfigurasi Firebase

Konfigurasi Firebase sudah tersimpan di:
- **File**: `src/lib/firebase.js`
- **Project ID**: `katar-9cac3`
- **Auth Domain**: `katar-9cac3.firebaseapp.com`

### Firestore Rules

Rules sudah dikonfigurasi di `firestore.rules` dengan:
- Proteksi untuk pengguna yang sudah login
- Role-based access control
- Rate limiting

### Cloud Functions

Functions sudah dikonfigurasi di `functions/index.js`:
- `doLogin` - Handle login dengan rate limiting
- `delegateRole` - Role management
- `triggerAbsensi` - Trigger absensi harian

## 🎨 Customization

### Mengubah Tema

Edit file `src/lib/theme.js` untuk mengubah:
- Warna primary/secondary
- Dark mode behavior
- Custom CSS variables

### Menambah Halaman Baru

1. Buat file di `src/pages/namaHalaman.js`
2. Export fungsi `render()`
3. Daftarkan route di `src/router.js`

Contoh:
```javascript
// src/pages/example.js
export async function render(){
  return `
    <div class="p-4">
      <h1 class="text-2xl font-bold">Halaman Example</h1>
    </div>
  `;
}

// src/router.js
import { render as renderExample } from './pages/example.js';
routes['example'] = renderExample;
```

### Menambah Komponen

Buat file di `src/components/NamaKomponen.js` dan export fungsi yang dibutuhkan.

## 🛠 Troubleshooting

### Port 3000 sudah digunakan

Gunakan port lain:
```bash
npx http-server -p 8080 -c-1
```

### Service Worker tidak update

1. Buka DevTools
2. Application > Service Workers
3. Klik "Unregister"
4. Reload halaman

### Firebase Functions error

1. Pastikan sudah install dependensi: `cd functions && npm install`
2. Cek node version di `functions/package.json` (engine: node 18)
3. Cek Firebase project ID di `.firebaserc`

### CORS error saat development

Jalankan server dengan flag `--cors`:
```bash
npx http-server -p 3000 -c-1 --cors
```

## 📚 Struktur Project

```
karteji0108/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── firebase.json           # Firebase config
├── firestore.rules         # Firestore security rules
├── vercel.json             # Vercel config
├── assets/                 # Static assets
├── functions/              # Cloud Functions
│   ├── index.js
│   └── package.json
└── src/                    # Source code
    ├── main.js             # App initialization
    ├── router.js           # SPA router
    ├── authGate.js         # Auth guard
    ├── render.js           # Render engine
    ├── splashFinal.js      # Splash screen
    ├── styles.css          # Global styles
    ├── components/         # Reusable components
    │   ├── BottomNav.js
    │   ├── SmartSearch.js
    │   ├── SocialShare.js
    │   └── Toast.js
    ├── lib/                # Utility libraries
    │   ├── firebase.js
    │   ├── theme.js
    │   ├── net.js
    │   └── ui.js
    └── pages/              # Page components
        ├── home.js
        ├── activities.js
        ├── calendar.js
        ├── members.js
        ├── finance.js
        ├── documents.js
        ├── minutes.js
        ├── feed.js
        ├── admin.js
        └── auth/
            ├── masuk.js
            ├── daftar.js
            └── buatProfil.js
```

## 🔐 Security

- Firestore rules sudah dikonfigurasi dengan role-based access
- Cloud Functions menggunakan rate limiting
- Authentication required untuk akses data sensitif
- CORS dikonfigurasi untuk production

## 📄 License

MIT

## 💬 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository.

---

Dibuat dengan ❤️ oleh KARTEJI Team
