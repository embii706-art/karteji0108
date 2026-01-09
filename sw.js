
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
  './assets/logo.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

// Network timeout for cache-first strategy
const NETWORK_TIMEOUT = 3000;

self.addEventListener('install', (e)=>{
  e.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(APP_SHELL).catch(err=>console.warn('Cache addAll failed:', err)))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (e)=>{
  const req = e.request;
  if(req.method!=='GET') return;
  
  // Skip caching for API calls
  if(req.url.includes('/api/') || req.url.includes('firestore.googleapis.com')){
    e.respondWith(fetch(req));
    return;
  }

  e.respondWith(
    caches.match(req).then(cached=>{
      const fetchPromise = fetch(req).then(res=>{
        // Only cache successful responses
        if(res && res.status === 200){
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(()=> cached || new Response('', {status: 504}));
      
      // Cache-first with network fallback and timeout
      return cached || fetchPromise;
    })
  );
});
