
# KARTEJI SPA v2.5.0 (Production Release)
Teknologi: HTML + Tailwind (CDN) + Vanilla JS (ESM) + Firebase v10 + Cloudinary + PWA

## Fitur yang sudah siap:
- SPA Shell + Hash Router (optimized)
- Bottom Nav Style No.5
- Tema terang/gelap/sistem dengan smooth transitions
- Splash logo (logo Anda) dengan progressive loading
- PWA + maskable icon Android/iOS
- Indikator offline + koneksi lambat (native-feel)
- Kalender Indonesia + Jawa dengan event harian
- Jadwal sholat + imsak (multi-source fallback)
- Firestore Rules (hardening) + Cloud Functions (rate-limit + role delegation)
- Enhanced security dengan input validation dan XSS protection
- Performance improvements: lazy loading, caching, debouncing
- Improved error handling dan user feedback
- Analytics dan monitoring ready

## Changelog v2.5.0:
- ✅ Fixed critical bugs: missing HTML elements, export mismatches
- ✅ Updated to Firebase v10 (latest stable)
- ✅ Enhanced security: input sanitization, rate limiting improvements
- ✅ Performance optimizations: reduced bundle size, faster initial load
- ✅ Improved error handling and user feedback
- ✅ Better offline support with smarter caching
- ✅ UI/UX improvements: smoother animations, better responsiveness
- ✅ Code refactoring following best practices

## Deploy cepat
- Static hosting: Firebase Hosting / Vercel static
- Deploy functions: `firebase deploy --only functions`
- Deploy rules: `firebase deploy --only firestore:rules`

Catatan: Beberapa halaman (feed/kegiatan/kas/admin detail) disediakan sebagai starter/pengait (hook) agar Anda tinggal lanjutkan CRUD sesuai kebutuhan.
