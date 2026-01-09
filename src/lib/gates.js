
/**
 * gates.js - KARTEJI Auth & Role System
 * Role: admin_utama, pengurus, anggota, warga, ketua_rt
 */

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

let cachedProfile = null;
let cachedUid = null;

// KARTEJI Role Definitions
export const ROLES = {
  ADMIN_UTAMA: 'admin_utama',
  PENGURUS: 'pengurus',
  ANGGOTA: 'anggota',
  WARGA: 'warga',
  KETUA_RT: 'ketua_rt'
};

// Role Hierarchy (untuk permission checking)
const ROLE_HIERARCHY = {
  admin_utama: 5,
  ketua_rt: 4,
  pengurus: 3,
  anggota: 2,
  warga: 1
};

async function getProfile(uid) {
  if (cachedUid === uid && cachedProfile) return cachedProfile;
  
  // Try users collection first (KARTEJI structure)
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    cachedProfile = userSnap.data();
    cachedUid = uid;
    return cachedProfile;
  }
  
  // Fallback to profiles collection
  const profileRef = doc(db, 'profiles', uid);
  const profileSnap = await getDoc(profileRef);
  
  if (profileSnap.exists()) {
    cachedProfile = profileSnap.data();
    cachedUid = uid;
    return cachedProfile;
  }
  
  return null;
}

function isAuthRoute(hash) {
  return hash.startsWith('#/auth');
}

function isAppRoute(hash) {
  return !isAuthRoute(hash);
}

export async function authGate(hash) {
  // wait for auth state once
  const user = await new Promise(res => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      res(u || null);
    });
  });

  if (!user) {
    if (isAuthRoute(hash)) return null;
    return '#/auth/masuk';
  }

  // signed in
  if (isAuthRoute(hash)) return '#/home';

  const profile = await getProfile(user.uid);
  
  if (!profile) {
    if (hash === '#/auth/buat-profil' || hash === '#/auth/buatProfil') return null;
    return '#/auth/buat-profil';
  }

  // Check approval status
  const approvalStatus = profile.approvalStatus || profile.status;
  if (approvalStatus !== 'approved' && approvalStatus !== 'aktif') {
    if (hash === '#/pending') return null;
    return '#/pending';
  }

  return null;
}

/**
 * Get current user role
 */
export async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null;
  
  const profile = await getProfile(user.uid);
  return profile?.role || 'warga';
}

/**
 * Check if user has specific role
 */
export async function hasRole(role) {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Check if user has minimum role level
 */
export async function hasMinimumRole(minimumRole) {
  const userRole = await getUserRole();
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Check multiple roles (OR condition)
 */
export async function hasAnyRole(roles) {
  const userRole = await getUserRole();
  return roles.includes(userRole);
}

/**
 * Get user permissions based on role
 */
export async function getUserPermissions() {
  const role = await getUserRole();
  
  const permissions = {
    // Manajemen User & Role
    canManageUsers: ['admin_utama'].includes(role),
    canManageRoles: ['admin_utama'].includes(role),
    
    // Manajemen Anggota
    canManageMembers: ['admin_utama', 'pengurus'].includes(role),
    canViewMembers: ['admin_utama', 'pengurus', 'anggota', 'ketua_rt'].includes(role),
    
    // Kegiatan
    canManageActivities: ['admin_utama', 'pengurus'].includes(role),
    canJoinActivities: ['admin_utama', 'pengurus', 'anggota'].includes(role),
    canViewActivities: true, // Semua bisa lihat
    
    // Keuangan
    canManageFinance: ['admin_utama', 'pengurus'].includes(role),
    canViewFinance: ['admin_utama', 'pengurus', 'anggota', 'ketua_rt'].includes(role),
    
    // Dokumen
    canManageDocuments: ['admin_utama', 'pengurus'].includes(role),
    canViewDocuments: true, // Semua bisa lihat
    
    // Notulen
    canManageMinutes: ['admin_utama', 'pengurus'].includes(role),
    canViewMinutes: ['admin_utama', 'pengurus', 'anggota', 'ketua_rt'].includes(role),
    
    // Berita & Pengumuman
    canManageNews: ['admin_utama', 'pengurus'].includes(role),
    canViewNews: true, // Semua bisa lihat
    
    // Aspirasi
    canManageAspirations: ['admin_utama', 'pengurus'].includes(role),
    canReplyAspirations: ['admin_utama', 'pengurus'].includes(role),
    canSubmitAspirations: true, // Semua bisa kirim
    
    // Laporan
    canViewReports: ['admin_utama', 'pengurus', 'ketua_rt'].includes(role),
    canExportReports: ['admin_utama', 'pengurus', 'ketua_rt'].includes(role),
    
    // System
    canAccessAdmin: ['admin_utama'].includes(role),
    canViewLogs: ['admin_utama', 'ketua_rt'].includes(role),
    
    // Current role info
    role,
    roleLevel: ROLE_HIERARCHY[role] || 0
  };
  
  return permissions;
}

/**
 * Clear cache (useful after profile update)
 */
export function clearProfileCache() {
  cachedProfile = null;
  cachedUid = null;
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;
  return await getProfile(user.uid);
}

