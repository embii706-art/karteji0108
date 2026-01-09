# KARTEJI v2.5 - Developer Guide

## 🏗️ Architecture Overview

KARTEJI is a Single Page Application (SPA) built with vanilla JavaScript and Firebase backend.

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Tailwind CSS (CDN)
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Media**: Cloudinary
- **Icons**: Material Symbols
- **PWA**: Service Worker, Web Manifest

### Project Structure

```
karteji0108/
├── index.html              # Main HTML shell
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── vercel.json            # Vercel configuration
├── firestore.rules        # Firestore security rules
├── assets/                # Static assets (logos, icons)
├── functions/             # Firebase Cloud Functions
│   ├── index.js          # Functions implementation
│   └── package.json      # Functions dependencies
└── src/
    ├── main.js           # Application entry point
    ├── router.js         # Client-side router
    ├── render.js         # DOM rendering
    ├── styles.css        # Custom CSS
    ├── splashFinal.js    # Splash screen logic
    ├── components/       # Reusable components
    │   ├── BottomNav.js  # Bottom navigation
    │   └── Toast.js      # Toast notifications
    ├── lib/              # Utility libraries
    │   ├── firebase.js   # Firebase initialization
    │   ├── gates.js      # Authentication gates
    │   ├── theme.js      # Theme management
    │   ├── themeEvents.js # Dynamic theme overlays
    │   ├── net.js        # Network status
    │   ├── ui.js         # UI helpers
    │   ├── cloudinary.js # Image upload
    │   ├── security.js   # Security utilities (NEW)
    │   └── analytics.js  # Analytics (NEW)
    └── pages/            # Page components
        ├── index.js      # Page exports
        ├── home.js       # Home page
        ├── feed.js       # Feed page
        ├── activities.js # Activities page
        ├── finance.js    # Finance page
        ├── calendar.js   # Calendar page
        ├── members.js    # Members page
        ├── minutes.js    # Minutes page
        ├── documents.js  # Documents page
        ├── periods.js    # Periods page
        ├── pending.js    # Pending approval page
        ├── admin.js      # Admin dashboard
        ├── auth/         # Authentication pages
        │   ├── masuk.js  # Login page
        │   ├── daftar.js # Registration page
        │   └── buatProfil.js # Profile creation
        └── admin/        # Admin subpages
            ├── users.js  # User management
            ├── roles.js  # Role management
            └── inbox.js  # Inbox management
```

## 🔄 Application Flow

### 1. Boot Sequence

1. **HTML Load** (`index.html`)
   - Splash screen shows immediately
   - Loads Tailwind CSS and Material Icons
   - Imports `src/main.js`

2. **Main Initialization** (`main.js`)
   - Watchdog timer (5s max splash)
   - Theme initialization
   - Network status monitoring
   - Router start (UI appears)
   - Firebase initialization (with timeout)
   - Service Worker registration
   - Theme events initialization
   - Analytics tracking

3. **Router Navigation** (`router.js`)
   - Hash-based routing
   - Authentication gate checking
   - Page component loading
   - DOM rendering
   - Page view tracking

### 2. Authentication Flow

```
User visits → authGate check → Redirect based on status:
  ├─ Not signed in → #/auth/masuk (login)
  ├─ No profile → #/auth/buat-profil (create profile)
  ├─ Not approved → #/pending (waiting approval)
  └─ Approved → #/home (app access)
```

### 3. Data Flow

```
Component → Firebase → Firestore/Auth
    ↓           ↑
  Render ←── Data
```

## 🔐 Security Implementation

### Input Validation

```javascript
import { isValidEmail, validatePassword } from './lib/security.js';

// Email validation
if (!isValidEmail(email)) {
  toast('Format email tidak valid.');
  return;
}

// Password validation
const result = validatePassword(password);
if (!result.valid) {
  toast(result.message);
  return;
}
```

### XSS Protection

```javascript
import { escapeHtml, sanitizeHtml } from './lib/security.js';

// Escape user input
const safe = escapeHtml(userInput);

// Sanitize HTML
const clean = sanitizeHtml(htmlContent);
```

### Rate Limiting

```javascript
import { checkRateLimit } from './lib/security.js';

// Check rate limit before action
if (!checkRateLimit('login', 5, 60000)) {
  toast('Terlalu banyak percobaan.');
  return;
}
```

## 📊 Analytics Usage

### Track Custom Events

```javascript
import { analytics } from './lib/analytics.js';

// Track event
analytics.trackEvent('user', 'button_click', 'export_data');

// Track page view
analytics.trackPageView('#/home');

// Track error
analytics.trackError('api_error', error.message);

// Track performance
analytics.trackPerformance('api_call', duration);
```

### Measure Function Performance

```javascript
import { measurePerformance } from './lib/analytics.js';

const loadData = measurePerformance(async () => {
  const data = await fetchData();
  return data;
}, 'load_data');
```

## 🎨 Creating New Pages

### 1. Create Page Component

```javascript
// src/pages/mypage.js
export async function mypage() {
  // Bind events after render
  setTimeout(() => bindEvents(), 0);
  
  return `
    <section class="p-4 max-w-2xl mx-auto space-y-4">
      <div class="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 class="font-bold text-xl">My Page</h2>
        <p class="text-sm opacity-70 mt-2">Page content here</p>
        <button id="myButton" class="mt-4 px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-xl">
          Click Me
        </button>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.getElementById('myButton')?.addEventListener('click', () => {
    console.log('Button clicked!');
  });
}
```

### 2. Export from Index

```javascript
// src/pages/index.js
export { mypage } from './mypage.js';
```

### 3. Add Route

```javascript
// src/router.js
const routes = {
  // ... existing routes
  '#/mypage': pages.mypage,
};
```

### 4. Add Navigation

```javascript
// Link to page
<a href="#/mypage">My Page</a>

// Or bottom nav
const items = [
  { hash:'#/mypage', icon:'star', label:'My Page' }
];
```

## 🔥 Firebase Integration

### Reading Data

```javascript
import { db } from '../lib/firebase.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function loadData() {
  const q = query(
    collection(db, 'activities'),
    where('status', '==', 'published')
  );
  
  const snapshot = await getDocs(q);
  const data = [];
  snapshot.forEach(doc => {
    data.push({ id: doc.id, ...doc.data() });
  });
  
  return data;
}
```

### Writing Data

```javascript
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function saveData(id, data) {
  await setDoc(doc(db, 'collection', id), {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
```

### Calling Cloud Functions

```javascript
import { functions } from '../lib/firebase.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';

async function callFunction() {
  const fn = httpsCallable(functions, 'myFunction');
  const result = await fn({ param: 'value' });
  return result.data;
}
```

## 🎭 Theming

### CSS Variables

```css
:root {
  --primary: 37 99 235;  /* RGB values */
  --bg: rgb(248 250 252);
  --card: rgb(241 245 249);
  --text: rgb(15 23 42);
  --border: rgb(226 232 240);
}

.dark {
  --bg: rgb(15 23 42);
  --card: rgb(30 41 59);
  /* ... */
}
```

### Using Theme Colors

```html
<!-- Background -->
<div class="bg-[var(--bg)]">

<!-- Text -->
<span class="text-[var(--text)]">

<!-- Border -->
<div class="border border-[var(--border)]">

<!-- Primary color -->
<button class="bg-[rgb(var(--primary))]">
```

### Dynamic Accent Color

```javascript
import { theme } from './lib/theme.js';

// Set custom accent color (RGB string)
theme.setAccent('34 197 94'); // Green
```

## 📱 PWA Features

### Service Worker

Handles:
- App shell caching
- Offline support
- Background sync (future)
- Push notifications (future)

### Install Prompt

Automatically handled by browser when PWA criteria met:
- HTTPS
- Valid manifest
- Registered service worker
- User engagement

## 🧪 Testing

### Manual Testing Checklist

- [ ] Auth: Login, Register, Logout
- [ ] Navigation: All pages accessible
- [ ] Theme: Light/Dark switching
- [ ] Offline: App works offline
- [ ] PWA: Can be installed
- [ ] Mobile: Responsive on all sizes
- [ ] Forms: Validation works
- [ ] Errors: Handled gracefully

### Debug Mode

```javascript
// Check analytics data
import { analytics } from './src/lib/analytics.js';
console.log(analytics.getSummary());

// Export analytics
console.log(analytics.exportData());
```

## 🚀 Deployment

### Vercel (Static)

1. Connect repository to Vercel
2. Deploy automatically on push to main
3. No build step needed

### Firebase Hosting

```bash
# Install CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```

### Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## 🐛 Debugging

### Common Issues

1. **Splash stuck**
   - Clear browser cache
   - Unregister service worker
   - Check console for errors

2. **Firebase not initialized**
   - Check Firebase config
   - Verify project ID
   - Check network tab

3. **Routes not working**
   - Check hash format
   - Verify page export
   - Check router registration

### Browser DevTools

- **Console**: Error messages
- **Network**: API calls, failed requests
- **Application**: Service Worker, Cache, Storage
- **Performance**: Load times, bottlenecks

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

Happy coding! 🎉
