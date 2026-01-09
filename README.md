
# KARTEJI SPA v1.8.0 (Starter Produksi)
Teknologi: HTML + Tailwind (CDN) + Vanilla JS (ESM) + Firebase v9 + Cloudinary + PWA

## Fitur yang sudah siap:
- SPA Shell + Hash Router
- Bottom Nav Style No.5
- Tema terang/gelap/sistem
- Splash logo (logo Anda)
- PWA + maskable icon Android
- Indikator offline + koneksi lambat (native-feel)
- Kalender (stub) + event harian (tanggal merah/hari penting) via API (fallback)
- Jadwal sholat + imsak (fallback API)
- Firestore Rules (hardening) + Cloud Functions (rate-limit + role delegation)

## Deploy cepat
- Static hosting: Firebase Hosting / Vercel static
- Deploy functions: `firebase deploy --only functions`
- Deploy rules: `firebase deploy --only firestore:rules`

Catatan: Beberapa halaman (feed/kegiatan/kas/admin detail) disediakan sebagai starter/pengait (hook) agar Anda tinggal lanjutkan CRUD sesuai kebutuhan.
