
# KARTEJI SPA v2.5.0 (Premium Edition)

🎨 **Modern SPA with Premium UI, Glassmorphism & Advanced Features**

Teknologi: HTML + Tailwind (CDN) + Vanilla JS (ESM) + Firebase v9 + Cloudinary + PWA

## ✨ Fitur Baru v2.5

### 🎨 Premium UI & Design
- **Glassmorphism UI** - Efek kaca modern dengan backdrop blur
- **3D Interactive Cards** - Kartu dengan efek 3D hover yang smooth
- **Premium Color Palette** - Gradien modern dengan indigo, pink, dan purple
- **Sophisticated Dark Mode** - Dark mode yang elegan dengan gradien
- **Custom Animations** - 10+ animasi smooth (fade-in, slide-up, bounce, dll)
- **Enhanced Scrollbar** - Scrollbar dengan gradien premium

### 🚀 Fitur Canggih
- **Smart Search (⌘K)** - Pencarian cepat di seluruh aplikasi
- **Social Sharing** - Bagikan ke Facebook, Twitter, WhatsApp, Telegram
- **Enhanced PWA** - Service worker dengan strategi caching yang optimal
- **Floating Action Buttons** - Tombol aksi cepat yang mudah diakses
- **Smooth Animations** - Animasi halus dengan cubic-bezier timing
- **Splash Screen Optimized** - Loading screen dengan progress bar animasi

### 📋 CRUD Lengkap (Role-Based)
- **Activities** - Manajemen kegiatan dengan status & absensi
- **Finance** - Transaksi keuangan dengan statistik real-time
- **Documents** - Arsip dokumen dengan kategori & periode
- **Minutes** - Notulen rapat lengkap dengan export
- **Feed** - Social media feed dengan like & comment

## 📦 Fitur yang sudah siap:
- SPA Shell + Hash Router
- Bottom Nav Style Premium
- Tema terang/gelap/sistem dengan gradien
- Splash logo dengan glassmorphism & progress animation
- PWA + maskable icon Android
- Indikator offline + koneksi lambat (native-feel)
- Kalender (stub) + event harian (tanggal merah/hari penting) via API (fallback)
- Jadwal sholat + imsak (fallback API)
- Firestore Rules (hardening) + Cloud Functions (rate-limit + role delegation)
- **CRUD lengkap untuk semua modul dengan role-based access**
- **Animasi & transisi smooth di semua halaman**

## 🚀 Quick Start

### Development
```bash
# Install Firebase Functions dependencies
cd functions && npm install

# Run development server
npm run dev
# Aplikasi akan berjalan di http://localhost:3000
```

### Deploy

**Firebase Hosting:**
```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

**Vercel:**
```bash
vercel --prod
```

## 🎯 Optimized for Production
- ✅ Clean URLs & SPA routing
- ✅ No-cache headers for dynamic content
- ✅ Static asset optimization
- ✅ Service worker for offline support
- ✅ PWA ready dengan maskable icons
- ✅ Responsive design (mobile-first)

## 📚 Dokumentasi

Lihat [SETUP.md](SETUP.md) untuk panduan lengkap setup, konfigurasi, dan troubleshooting.

Catatan: Beberapa halaman (feed/kegiatan/kas/admin detail) disediakan sebagai starter/pengait (hook) agar Anda tinggal lanjutkan CRUD sesuai kebutuhan.
