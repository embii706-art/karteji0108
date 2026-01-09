# 🎯 Quick Reference - KARTEJI v2.5

## 🚀 Memulai dalam 3 Langkah

```bash
# 1. Setup (hanya sekali)
./setup.sh
# atau: cd functions && npm install

# 2. Jalankan server
npm run dev

# 3. Buka browser
# http://localhost:3000
```

## 📝 Command Penting

### Development
```bash
npm run dev          # Jalankan server development
npm start            # Alias untuk npm run dev
npm run preview      # Preview di port 8080
```

### Setup
```bash
npm run setup        # Install dependencies functions
./setup.sh          # Setup otomatis (bash script)
```

### Deploy
```bash
# Firebase
npm run deploy:all       # Deploy semuanya
npm run deploy:hosting   # Hosting saja
npm run deploy:functions # Functions saja
npm run deploy:rules     # Firestore rules saja

# Vercel
vercel              # Deploy preview
vercel --prod       # Deploy production
```

## 🎨 Struktur Folder

```
karteji0108/
├── index.html          # Entry point aplikasi
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── firebase.json      # Firebase config
├── firestore.rules    # Security rules
│
├── src/
│   ├── main.js        # Inisialisasi app
│   ├── router.js      # SPA router
│   ├── authGate.js    # Auth guard
│   ├── components/    # Komponen reusable
│   ├── lib/          # Utilities
│   └── pages/        # Halaman aplikasi
│
└── functions/
    ├── index.js       # Cloud Functions
    └── package.json   # Dependencies
```

## 🔑 Fitur Keyboard Shortcuts

- `⌘K` / `Ctrl+K` - Buka Smart Search
- `⌘/` / `Ctrl+/` - Toggle theme (jika diimplementasi)

## 📱 Halaman Tersedia

| Route | Halaman | Deskripsi |
|-------|---------|-----------|
| `#/home` | Home | Dashboard utama |
| `#/activities` | Kegiatan | Manajemen kegiatan |
| `#/calendar` | Kalender | Jadwal & event |
| `#/members` | Anggota | Daftar anggota |
| `#/finance` | Keuangan | Kas & transaksi |
| `#/documents` | Dokumen | Manajemen dokumen |
| `#/minutes` | Notulen | Catatan rapat |
| `#/feed` | Feed | Timeline aktivitas |
| `#/admin` | Admin | Panel admin |
| `#/auth/masuk` | Login | Halaman login |
| `#/auth/daftar` | Register | Pendaftaran |
| `#/auth/buatProfil` | Profile | Lengkapi profil |

## 🔧 Konfigurasi

### Firebase
File: `src/lib/firebase.js`
```javascript
// Config sudah ada, tinggal pakai
import { auth, db, functions } from './lib/firebase.js';
```

### Theme
File: `src/lib/theme.js`
```javascript
import { theme } from './lib/theme.js';
theme.toggle(); // Toggle dark/light
```

## 🎨 Komponen Siap Pakai

### Toast Notification
```javascript
import { toast } from './components/Toast.js';
toast('Pesan berhasil!');
toast('Error terjadi', 'error');
```

### Smart Search
```javascript
import { openSearch } from './components/SmartSearch.js';
openSearch(); // Atau tekan ⌘K
```

### Social Share
```javascript
import { shareContent } from './components/SocialShare.js';
shareContent({
  title: 'Judul',
  text: 'Deskripsi',
  url: 'https://example.com'
});
```

## 🔥 Firebase Functions

### Available Functions
```javascript
// Rate-limited login
const loginResult = await httpsCallable(functions, 'doLogin')({
  email: 'user@example.com',
  password: 'password123'
});

// Delegate role
const roleResult = await httpsCallable(functions, 'delegateRole')({
  targetUid: 'user-id',
  role: 'admin'
});

// Trigger absensi (auto-run daily)
// Function berjalan otomatis setiap hari
```

## 📊 Firestore Collections

```
users/          # Data pengguna
  {uid}/
    - nama, email, role, status, dll

kegiatan/       # Kegiatan/aktivitas
  {id}/
    - judul, tanggal, deskripsi, dll

kas/            # Transaksi keuangan
  {id}/
    - jumlah, jenis, tanggal, dll

dokumen/        # Dokumen
  {id}/
    - nama, url, tanggal, dll

absensi/        # Absensi
  {date}/
    {uid}/
      - status, timestamp
```

## 🐛 Troubleshooting Cepat

### Port sudah digunakan
```bash
npx http-server -p 8080 -c-1 --cors
```

### Service Worker bermasalah
1. Buka DevTools (F12)
2. Application > Service Workers
3. Klik "Unregister"
4. Reload (Ctrl+R)

### Functions error
```bash
cd functions
npm install
cd ..
```

### Firebase not initialized
Pastikan `initFirebase()` sudah dipanggil di `main.js`

## 📚 Dokumentasi Lengkap

- **Setup Detail**: [SETUP.md](SETUP.md)
- **Checklist**: [CHECKLIST.md](CHECKLIST.md)
- **Troubleshooting Vercel**: [TROUBLESHOOTING_VERCEL.md](TROUBLESHOOTING_VERCEL.md)

## 💡 Tips

1. **Development**: Gunakan `npm run dev` dengan CORS enabled
2. **Production**: Deploy ke Firebase Hosting atau Vercel
3. **PWA**: Install aplikasi dari browser untuk pengalaman native
4. **Offline**: Service Worker otomatis cache aset penting
5. **Dark Mode**: Otomatis mengikuti sistem atau ubah manual

## 🎯 Next Steps

1. ✅ Aplikasi sudah jalan di `http://localhost:3000`
2. 🎨 Customize theme & warna sesuai brand
3. 📝 Tambah halaman/fitur sesuai kebutuhan
4. 🚀 Deploy ke production
5. 📱 Install sebagai PWA di mobile

---

**Happy Coding! 🚀**
