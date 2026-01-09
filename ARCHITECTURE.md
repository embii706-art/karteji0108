# KARTEJI Architecture Documentation
## Karang Taruna RT 01 - Complete System Architecture

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Firebase + Cloudinary Architecture](#firebase-cloudinary-architecture)
4. [Database Schema](#database-schema)
5. [Security Rules](#security-rules)
6. [Role-Based Access Control](#role-based-access-control)
7. [Integration Flow](#integration-flow)
8. [Project Structure](#project-structure)
9. [MVP Roadmap](#mvp-roadmap)
10. [Deployment Guide](#deployment-guide)

---

## 1. System Overview

**KARTEJI** adalah aplikasi manajemen organisasi Karang Taruna RT 01 berbasis web progresif (PWA) yang menggabungkan Firebase sebagai backend dan Cloudinary untuk manajemen media.

### Core Features:
- 👥 **Manajemen Anggota** - Profile lengkap dengan NIK, TTL, jabatan
- 🎯 **Kegiatan** - CRUD kegiatan dengan absensi & foto dokumentasi
- 💰 **Kas** - Manajemen keuangan in/out dengan bukti transfer
- 📰 **Berita/Feed** - Social feed dengan like & comment
- 🗳️ **Aspirasi Warga** - Sistem pengaduan & balasan pengurus
- 📄 **Dokumen** - Arsip dokumen organisasi
- 📝 **Notulen** - Catatan rapat lengkap
- 📊 **Laporan** - Statistik & export PDF/Excel

### Key Characteristics:
- **Mobile-First Design** - Responsif untuk semua device
- **Offline-First PWA** - Bekerja tanpa internet
- **Real-time Updates** - Firebase Firestore real-time sync
- **Role-Based Security** - 5 tingkat akses berbeda
- **Media Optimization** - Cloudinary untuk kompresi otomatis

---

## 2. Technology Stack

### Frontend:
```javascript
{
  "framework": "Vanilla JavaScript (ESM)",
  "styling": "Tailwind CSS 3.4+ (CDN)",
  "routing": "Hash-based SPA Router",
  "icons": "Material Symbols Rounded",
  "ui": "Glassmorphism Design"
}
```

### Backend:
```javascript
{
  "platform": "Firebase",
  "services": [
    "Authentication (Email/Password)",
    "Firestore Database (NoSQL)",
    "Cloud Functions",
    "Cloud Messaging (FCM)",
    "Hosting"
  ]
}
```

### Media Management:
```javascript
{
  "platform": "Cloudinary",
  "cloud_name": "dbxktcwug",
  "upload_preset": "Karteji",
  "folders": [
    "/karteji/anggota",
    "/karteji/kegiatan",
    "/karteji/keuangan",
    "/karteji/dokumen"
  ]
}
```

### Development Tools:
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Firebase CLI**: v12+
- **Code Editor**: VS Code

---

## 3. Firebase + Cloudinary Architecture

### Data Flow Diagram:

```
┌─────────────┐
│   Client    │ (Browser/PWA)
│  (React-    │
│   less JS)  │
└──────┬──────┘
       │
       ├─────────────────────┬─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Firebase   │      │  Firebase   │      │ Cloudinary  │
│    Auth     │      │  Firestore  │      │    CDN      │
└─────────────┘      └─────────────┘      └─────────────┘
       │                     │                     │
       │                     │                     │
       └─────────┬───────────┴─────────────────────┘
                 │
                 ▼
          ┌─────────────┐
          │  Firebase   │
          │  Functions  │
          └─────────────┘
```

### Authentication Flow:

```
User Input (Email + Password)
       │
       ▼
Firebase Authentication
       │
       ├─── Success ───► Create/Update User Document (Firestore)
       │                        │
       │                        ▼
       │                 Check User Role & Status
       │                        │
       │                        ├─── approved ───► Home Page
       │                        │
       │                        └─── pending ───► Pending Page
       │
       └─── Failure ───► Error Toast
```

### Media Upload Flow:

```
User Selects File
       │
       ▼
Client-side Validation (size, type)
       │
       ▼
Upload to Cloudinary (unsigned upload)
       │
       ├─── Parameters:
       │    - cloud_name: dbxktcwug
       │    - upload_preset: Karteji
       │    - folder: /karteji/{category}
       │
       ▼
Cloudinary Processing
       │
       ├─── Auto-optimize
       ├─── Generate thumbnails
       └─── Return secure_url
       │
       ▼
Save secure_url to Firestore
       │
       ▼
Display Optimized Image (with cloudinarySmart)
```

---

## 4. Database Schema

### Firestore Collections:

#### 4.1 Users Collection
```javascript
// Collection: users
{
  uid: "firebase_auth_uid", // document ID
  email: "user@example.com",
  nama: "John Doe",
  nik: "3275012345678901",
  tanggal_lahir: "1995-05-15",
  tempat_lahir: "Bandung",
  no_hp: "081234567890",
  alamat: "Jl. Contoh No. 123",
  jenis_kelamin: "L", // L/P
  foto_profil: "https://res.cloudinary.com/...",
  
  // Role & Status
  role: "anggota", // admin_utama | pengurus | anggota | warga | ketua_rt
  jabatan: "Sekretaris", // specific position
  status: "approved", // approved | pending | inactive
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLogin: Timestamp
}
```

#### 4.2 Kegiatan Collection
```javascript
// Collection: kegiatan
{
  id: "auto_generated_id",
  judul: "Kerja Bakti RT 01",
  deskripsi: "Gotong royong membersihkan lingkungan",
  tanggal: "2024-01-15",
  waktu: "08:00",
  lokasi: "Balai RT 01",
  kategori: "sosial", // sosial | olahraga | pendidikan | keagamaan
  status: "aktif", // aktif | selesai | dibatalkan
  
  // Media
  foto: "https://res.cloudinary.com/...",
  qr_code: "data:image/png;base64,...",
  
  // Metadata
  createdBy: "user_uid",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Sub-collection: attendance (see below)
}

// Sub-collection: kegiatan/{id}/attendance
{
  userId: "user_uid", // document ID
  nama: "John Doe",
  hadir: true,
  keterangan: "Datang tepat waktu",
  scanTime: Timestamp
}
```

#### 4.3 Kas Collection
```javascript
// Collection: kas
{
  id: "auto_generated_id",
  tipe: "masuk", // masuk | keluar
  jumlah: 100000,
  kategori: "iuran", // iuran | donasi | belanja | operasional
  keterangan: "Iuran bulanan Januari",
  tanggal: "2024-01-01",
  
  // Evidence
  bukti_transfer: "https://res.cloudinary.com/...",
  
  // Metadata
  createdBy: "user_uid",
  createdAt: Timestamp
}
```

#### 4.4 Berita Collection
```javascript
// Collection: berita
{
  id: "auto_generated_id",
  judul: "Pengumuman Kegiatan",
  konten: "Isi berita/pengumuman...",
  kategori: "pengumuman", // pengumuman | artikel | info
  
  // Media
  foto: "https://res.cloudinary.com/...",
  
  // Engagement
  likes: 15,
  commentCount: 5,
  
  // Metadata
  userId: "user_uid",
  userName: "John Doe",
  createdAt: Timestamp,
  
  // Sub-collections: likes, comments
}

// Sub-collection: berita/{id}/likes
{
  userId: "user_uid", // document ID
  createdAt: Timestamp
}

// Sub-collection: berita/{id}/comments
{
  id: "auto_generated_id",
  userId: "user_uid",
  userName: "Jane Doe",
  text: "Komentar...",
  createdAt: Timestamp
}
```

#### 4.5 Aspirasi Collection
```javascript
// Collection: aspirasi
{
  id: "auto_generated_id",
  nama: "John Doe",
  phone: "081234567890",
  category: "fasilitas", // kegiatan | fasilitas | keuangan | kebersihan | keamanan | sosial | lainnya
  title: "Perbaikan Jalan RT",
  content: "Mohon diperbaiki jalan berlubang...",
  
  // Status & Reply
  status: "pending", // pending | diproses | selesai | ditolak
  reply: "Sedang kami proses...",
  repliedAt: Timestamp,
  repliedBy: "admin_uid",
  
  // Metadata
  userId: "user_uid",
  createdAt: Timestamp
}
```

#### 4.6 Dokumen Collection
```javascript
// Collection: dokumen
{
  id: "auto_generated_id",
  judul: "SK Pengurus 2024",
  kategori: "sk", // sk | surat | laporan | proposal
  periode: "2024",
  file_url: "https://res.cloudinary.com/...",
  
  // Metadata
  createdBy: "user_uid",
  createdAt: Timestamp
}
```

#### 4.7 Notulen Collection
```javascript
// Collection: notulen
{
  id: "auto_generated_id",
  tanggal: "2024-01-10",
  waktu: "19:00",
  tempat: "Balai RT",
  jenis: "rapat_rutin", // rapat_rutin | rapat_khusus | musyawarah
  
  agenda: "1. Pembahasan kegiatan\n2. Evaluasi keuangan",
  hasil: "Disepakati untuk...",
  tindak_lanjut: "Ketua akan...",
  
  peserta: ["uid1", "uid2", "uid3"],
  
  // Metadata
  createdBy: "user_uid",
  createdAt: Timestamp
}
```

#### 4.8 Notifications Collection
```javascript
// Collection: notifications
{
  id: "auto_generated_id",
  userId: "user_uid",
  title: "Kegiatan Baru",
  body: "Ada kegiatan Kerja Bakti besok pagi",
  type: "kegiatan", // kegiatan | kas | berita | aspirasi | umum
  link: "#/activities",
  
  read: false,
  createdAt: Timestamp
}
```

---

## 5. Security Rules

File: `firestore.rules`

### Role Hierarchy:
```
Level 5: admin_utama    (Full Access)
Level 4: pengurus       (Manage Activities, Reply Aspirations)
Level 3: anggota        (View All, Submit Aspirations)
Level 2: ketua_rt       (View, Limited Edit)
Level 1: warga          (View Public, Submit Aspirations)
```

### Key Rules:
1. **Authentication Required** - Semua endpoint butuh login kecuali public read (berita)
2. **Role-Based Write** - Write access tergantung role minimum
3. **Owner-Based Edit** - User bisa edit data sendiri
4. **Immutable Logs** - Activity logs tidak bisa di-update
5. **Status Validation** - Hanya approved user yang akses penuh

Example Rule:
```javascript
function hasMinimumRole(minLevel) {
  let roleHierarchy = {
    'admin_utama': 5,
    'pengurus': 4,
    'anggota': 3,
    'ketua_rt': 2,
    'warga': 1
  };
  return isAuthenticated() && 
    (getUserData().role in roleHierarchy) && 
    roleHierarchy[getUserData().role] >= minLevel;
}
```

---

## 6. Role-Based Access Control

File: `src/lib/gates.js`

### Roles Definition:

| Role | Level | Permissions |
|------|-------|-------------|
| `admin_utama` | 5 | Full access, manage users, delete anything |
| `pengurus` | 4 | Manage activities, reply aspirations, view reports |
| `anggota` | 3 | View all, create content, submit aspirations |
| `ketua_rt` | 2 | View all, limited edit own profile |
| `warga` | 1 | View public content, submit aspirations |

### Permission Matrix:

```javascript
const permissions = {
  // Admin
  canManageUsers: role === 'admin_utama',
  canManageRoles: role === 'admin_utama',
  canDeleteAnything: role === 'admin_utama',
  
  // Activities
  canCreateActivities: level >= 4, // pengurus+
  canEditActivities: level >= 4,
  canDeleteActivities: role === 'admin_utama',
  canViewActivities: level >= 1, // all
  
  // Finance
  canManageFinance: ['admin_utama', 'bendahara'].includes(role),
  canViewFinance: level >= 3, // anggota+
  
  // Aspirations
  canSubmitAspirations: level >= 1, // all
  canReplyAspirations: level >= 4, // pengurus+
  canManageAspirations: level >= 4,
  
  // Documents & Minutes
  canManageDocuments: ['admin_utama', 'sekretaris'].includes(role),
  canViewDocuments: level >= 3,
  
  // Reports
  canViewReports: level >= 4,
  canExportReports: level >= 4
};
```

---

## 7. Integration Flow

### Complete User Journey:

#### Registration Flow:
```
1. User visits app → Show splash screen
2. Click "Daftar" → auth/daftar page
3. Enter email & password → Firebase Auth createUser
4. Auth success → Redirect to auth/buat-profil
5. Fill complete profile (NIK, TTL, dll)
6. Submit → Create document in users collection (status: pending)
7. Redirect to #/pending → Wait approval
8. Admin approves → Update user status to 'approved'
9. User refreshes → Redirect to #/home
```

#### Activity Creation Flow (Pengurus):
```
1. Login as pengurus → Navigate to #/activities
2. Click "Tambah Kegiatan"
3. Fill form:
   - Judul, deskripsi, tanggal, lokasi
   - Upload foto → Cloudinary upload
   - Generate QR code (optional)
4. Submit → Add document to kegiatan collection
5. Firebase Function → Send FCM notification to all members
6. Members receive push notification
7. Click notification → Open activity detail
```

#### Aspiration Submission Flow (Warga):
```
1. Login as warga → Navigate to #/aspirations
2. Click "Kirim Aspirasi"
3. Fill form: nama, kategori, judul, isi
4. Submit → Add document to aspirasi collection (status: pending)
5. Pengurus sees new aspiration in dashboard
6. Pengurus clicks "Balas"
7. Update status (diproses/selesai) + add reply
8. Warga sees reply in their aspirations list
```

---

## 8. Project Structure

```
karteji0108/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── firebase.json           # Firebase config
├── firestore.rules         # Security rules
├── vercel.json            # Vercel deployment
├── package.json           # Dependencies
│
├── assets/                # Static files
│   ├── logo.png
│   ├── icon-512.png
│   └── splash/
│
├── functions/             # Firebase Functions
│   ├── index.js          # Cloud Functions
│   └── package.json
│
└── src/
    ├── main.js           # App entry
    ├── router.js         # SPA router
    ├── render.js         # DOM renderer
    ├── authGate.js       # Auth middleware
    ├── styles.css        # Global styles
    │
    ├── lib/              # Utilities
    │   ├── firebase.js   # Firebase init
    │   ├── cloudinary.js # Cloudinary helper
    │   ├── gates.js      # RBAC system
    │   ├── ui.js         # UI helpers
    │   ├── net.js        # Network utils
    │   └── theme.js      # Theme manager
    │
    ├── components/       # Reusable components
    │   ├── BottomNav.js
    │   ├── Toast.js
    │   ├── SmartSearch.js
    │   └── SocialShare.js
    │
    └── pages/            # Route pages
        ├── home.js
        ├── feed.js
        ├── activities.js
        ├── finance.js
        ├── aspirations.js
        ├── members.js
        ├── documents.js
        ├── minutes.js
        ├── calendar.js
        ├── pending.js
        │
        ├── auth/
        │   ├── masuk.js
        │   ├── daftar.js
        │   └── buatProfil.js
        │
        └── admin/
            ├── users.js
            ├── roles.js
            └── inbox.js
```

---

## 9. MVP Roadmap

### Phase 1: Core Foundation (Week 1-2) ✅
- [x] Firebase Authentication
- [x] User registration & profile
- [x] Role-based access control
- [x] Basic routing & navigation
- [x] Splash screen & PWA setup

### Phase 2: Essential Features (Week 3-4) ✅
- [x] Activities CRUD with role check
- [x] Finance management
- [x] Feed/News with likes
- [x] Documents archive
- [x] Meeting minutes
- [x] Aspirations system

### Phase 3: Enhanced Features (Week 5-6) 🔄
- [x] Cloudinary integration
- [x] Firestore Security Rules
- [ ] QR Code attendance
- [ ] Push notifications (FCM)
- [ ] Export PDF/Excel
- [ ] Advanced search & filters

### Phase 4: Polish & Deploy (Week 7-8)
- [ ] Performance optimization
- [ ] Offline functionality
- [ ] UI/UX refinement
- [ ] Testing & bug fixes
- [ ] Production deployment
- [ ] User documentation

---

## 10. Deployment Guide

### Prerequisites:
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Select project
firebase use katar-9cac3
```

### Deploy to Firebase Hosting:
```bash
# Build & Deploy
firebase deploy --only hosting

# Deploy with functions
firebase deploy --only hosting,functions,firestore:rules
```

### Deploy to Vercel (Alternative):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables:
```javascript
// Auto-loaded from firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCGsFMrvRRvxNIZMNfAFJ3fKbS8ycRlqlM",
  authDomain: "katar-9cac3.firebaseapp.com",
  projectId: "katar-9cac3",
  // ...
};
```

### Post-Deployment Checklist:
- [ ] Test authentication flow
- [ ] Verify Firestore rules working
- [ ] Check Cloudinary uploads
- [ ] Test role-based access
- [ ] Validate PWA install
- [ ] Test offline mode
- [ ] Monitor Firebase usage
- [ ] Setup Firebase Analytics

---

## 📊 Performance Metrics

### Target Metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse PWA Score: 90+
- Firebase Read/Write: < 500ms
- Cloudinary Image Load: < 800ms

### Optimization Techniques:
1. **Code Splitting** - Dynamic imports for pages
2. **Lazy Loading** - Images load on demand
3. **Caching Strategy** - Service Worker cache-first
4. **Image Optimization** - Cloudinary auto-format & quality
5. **Firestore Indexing** - Composite indexes for queries

---

## 🔐 Security Best Practices

1. **Never expose API keys** in client-side code (Firebase keys are safe for web)
2. **Always validate input** on client & server (Firebase Functions)
3. **Use Firestore Security Rules** - Never trust client-side checks
4. **Implement rate limiting** - Prevent abuse
5. **Sanitize user content** - XSS protection
6. **Secure file uploads** - Validate file type & size
7. **Monitor Firebase usage** - Set up alerts

---

## 🐛 Troubleshooting

### Common Issues:

**1. "Permission denied" error:**
```javascript
// Solution: Check user role and Firestore rules
const perms = await getUserPermissions();
console.log('Current permissions:', perms);
```

**2. Cloudinary upload fails:**
```javascript
// Solution: Verify upload preset is unsigned
// Check cloud_name & preset name spelling
```

**3. PWA not installing:**
```javascript
// Solution: Check manifest.json & service worker
// Must be served over HTTPS
```

**4. Real-time updates not working:**
```javascript
// Solution: Use onSnapshot instead of getDocs
const unsubscribe = onSnapshot(collection(db, 'kegiatan'), (snapshot) => {
  // Handle real-time updates
});
```

---

## 📚 References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## 👥 Support & Contact

- **Project Repository**: [GitHub karteji0108]
- **Firebase Project**: katar-9cac3
- **Cloudinary Cloud**: dbxktcwug
- **Email Support**: admin@karteji.com (placeholder)

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

*This documentation is auto-generated for the KARTEJI project as per requirement specifications.*
