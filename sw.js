
const CACHE = 'karteji-v2.5.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './src/main.js',
  './src/router.js',
  './src/render.js',
  './src/styles.css',
  './src/pages/index.js',
  './src/components/SmartSearch.js',
  './src/components/SocialShare.js',
  './src/components/BottomNav.js',
  './src/components/Toast.js',
  './assets/logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (e)=>{
  console.log('[SW] Installing v2.5.0...');
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
      .catch(err=>console.error('[SW] Install failed:', err))
  );
});

self.addEventListener('activate', (e)=>{
  console.log('[SW] Activating v2.5.0...');
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method!=='GET') return;
  
  // Network-first for API calls, cache-first for assets
  const isAPI = req.url.includes('/api/') || req.url.includes('firestore') || req.url.includes('firebase');
  
  if (isAPI) {
    // Network-first strategy for API
    e.respondWith(
      fetch(req)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
          return res;
        })
        .catch(()=> caches.match(req).then(cached=> cached || new Response('{"error":"offline"}', {
          status: 503,
          headers: {'Content-Type': 'application/json'}
        })))
    );
  } else {
    // Cache-first strategy for assets
    e.respondWith(
      caches.match(req).then(cached=>{
        const fetchPromise = fetch(req).then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
          return res;
        }).catch(()=> cached || new Response('', {status: 504}));
        return cached || fetchPromise;
      })
    );
  }
});
