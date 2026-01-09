
# KARTEJI SPA v2.5.0 (Premium Edition)

🎨 **Modern SPA with Premium UI, Glassmorphism & Advanced Features**

Teknologi: HTML + Tailwind (CDN) + Vanilla JS (ESM) + Firebase v9 + Cloudinary + PWA

## ✨ Fitur Baru v2.5

### 🎨 Premium UI & Design
- **Glassmorphism UI** - Efek kaca modern dengan backdrop blur
- **3D Interactive Cards** - Kartu dengan efek 3D hover yang smooth
- **Premium Color Palette** - Gradien modern dengan indigo, pink, dan purple
- **Sophisticated Dark Mode** - Dark mode yang elegan dengan gradien

### 🚀 Fitur Canggih
- **Smart Search (⌘K)** - Pencarian cepat di seluruh aplikasi
- **Social Sharing** - Bagikan ke Facebook, Twitter, WhatsApp, Telegram
- **Enhanced PWA** - Service worker dengan strategi caching yang optimal
- **Floating Action Buttons** - Tombol aksi cepat yang mudah diakses
- **Smooth Animations** - Animasi halus dengan cubic-bezier timing

## 📦 Fitur yang sudah siap:
- SPA Shell + Hash Router
- Bottom Nav Style Premium
- Tema terang/gelap/sistem dengan gradien
- Splash logo dengan glassmorphism
- PWA + maskable icon Android
- Indikator offline + koneksi lambat (native-feel)
- Kalender (stub) + event harian (tanggal merah/hari penting) via API (fallback)
- Jadwal sholat + imsak (fallback API)
- Firestore Rules (hardening) + Cloud Functions (rate-limit + role delegation)

## 🚀 Deploy cepat
- Static hosting: Firebase Hosting / Vercel static
- Deploy functions: `firebase deploy --only functions`
- Deploy rules: `firebase deploy --only firestore:rules`

## 🎯 Optimized for Vercel
- ✅ Clean URLs
- ✅ SPA routing configured
- ✅ No-cache headers for dynamic content
- ✅ Static asset optimization
- ✅ Service worker for offline support

Catatan: Beberapa halaman (feed/kegiatan/kas/admin detail) disediakan sebagai starter/pengait (hook) agar Anda tinggal lanjutkan CRUD sesuai kebutuhan.
