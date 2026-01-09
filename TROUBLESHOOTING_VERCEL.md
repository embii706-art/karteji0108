# Troubleshooting Vercel/PWA (KARTEJI)
Jika masih stuck di splash:
1) Hapus cache browser (Safari iOS): Settings > Safari > Clear History and Website Data.
2) Jika PWA sudah di-install: hapus app PWA lalu install ulang.
3) Unregister Service Worker:
   - buka site di desktop Chrome -> DevTools -> Application -> Service Workers -> Unregister
4) Pastikan file tersedia di deploy:
   - /src/main.js
   - /sw.js
