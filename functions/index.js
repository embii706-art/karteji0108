
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ---------- Helpers ----------
async function getProfile(uid){
  const snap = await db.doc(`profiles/${uid}`).get();
  return snap.exists ? snap.data() : null;
}

function hasAnyRole(profile, roles){
  const r = new Set([...(profile.roles||[]), ...(profile.extraRoles||[])]);
  return roles.some(x=>r.has(x));
}

async function rateLimit(uid, action, maxPerMinute=10){
  const key = `${uid}_${action}`;
  const ref = db.doc(`rate_limits/${key}`);
  const now = Date.now();
  const minute = Math.floor(now / 60000);

  await db.runTransaction(async (tx)=>{
    const snap = await tx.get(ref);
    let data = snap.exists ? snap.data() : { minute, count: 0 };
    if(data.minute !== minute){
      data = { minute, count: 0 };
    }
    data.count += 1;
    if(data.count > maxPerMinute){
      throw new functions.https.HttpsError('resource-exhausted', 'Terlalu banyak permintaan, coba lagi sebentar.');
    }
    tx.set(ref, data, { merge: true });
  });
}

// ---------- Auth create: auto super admin first ----------
exports.onAuthCreateProfile = functions.auth.user().onCreate(async (user)=>{
  const uid = user.uid;
  const profiles = await db.collection('profiles').limit(1).get();
  const isFirst = profiles.empty;

  const base = {
    uid,
    fullName: 'Pengguna Baru',
    roles: ['anggota'],
    extraRoles: [],
    approvalStatus: isFirst ? 'approved' : 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if(isFirst){
    base.roles = ['anggota','super_admin'];
  }

  await db.doc(`profiles/${uid}`).set(base, { merge: true });
});

// ---------- Admin approve (super_admin only) ----------
exports.adminApproveUser = functions.https.onCall(async (data, context)=>{
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated','Harus login.');
  const caller = await getProfile(context.auth.uid);
  if(!caller || !hasAnyRole(caller,['super_admin'])) throw new functions.https.HttpsError('permission-denied','Tidak punya akses.');
  await rateLimit(context.auth.uid, 'adminApproveUser', 10);

  const { uid, status } = data || {};
  if(!uid || !['approved','rejected','pending'].includes(status)) throw new functions.https.HttpsError('invalid-argument','Data tidak valid.');
  await db.doc(`profiles/${uid}`).set({ approvalStatus: status }, { merge: true });
  return { ok: true };
});

// ---------- Set extraRoles (super_admin OR ketua/wakil_ketua) with restrictions ----------
const ALLOWED_EXTRA = ['ketua','wakil_ketua','sekretaris','bendahara','koordinator_sie'];

exports.adminSetExtraRoles = functions.https.onCall(async (data, context)=>{
  if(!context.auth) throw new functions.https.HttpsError('unauthenticated','Harus login.');
  const callerUid = context.auth.uid;
  const caller = await getProfile(callerUid);
  if(!caller) throw new functions.https.HttpsError('permission-denied','Tidak punya akses.');

  const canManage = hasAnyRole(caller,['super_admin','ketua','wakil_ketua']);
  if(!canManage) throw new functions.https.HttpsError('permission-denied','Tidak punya akses.');
  await rateLimit(callerUid, 'adminSetExtraRoles', 12);

  const { uid, extraRoles } = data || {};
  if(!uid || !Array.isArray(extraRoles)) throw new functions.https.HttpsError('invalid-argument','Data tidak valid.');

  // Ketua/wakil: cannot change self, cannot touch super_admin
  if(hasAnyRole(caller,['ketua','wakil_ketua']) && !hasAnyRole(caller,['super_admin'])){
    if(uid === callerUid) throw new functions.https.HttpsError('permission-denied','Tidak boleh mengubah role diri sendiri.');
    const target = await getProfile(uid);
    if(target && hasAnyRole(target,['super_admin'])) throw new functions.https.HttpsError('permission-denied','Tidak boleh mengubah role super admin.');
  }

  const clean = [...new Set(extraRoles.filter(r=>ALLOWED_EXTRA.includes(r)))];
  // Never allow assigning super_admin via extraRoles
  if(clean.includes('super_admin')) throw new functions.https.HttpsError('permission-denied','Tidak boleh assign super admin.');

  await db.doc(`profiles/${uid}`).set({ extraRoles: clean }, { merge: true });
  return { ok:true, extraRoles: clean };
});

// ---------- Activity publish -> prepare attendance ----------
exports.onActivityPublishPrepareAttendance = functions.firestore
  .document('activities/{id}')
  .onUpdate(async (change, context)=>{
    const before = change.before.data();
    const after = change.after.data();
    if(before.status === after.status) return null;
    if(after.status !== 'published') return null;

    // fill attendance for all approved members
    const membersSnap = await db.collection('profiles').where('approvalStatus','==','approved').get();
    const batch = db.batch();
    membersSnap.forEach(doc=>{
      const uid = doc.id;
      const ref = db.doc(`activities/${context.params.id}/attendance/${uid}`);
      batch.set(ref, { uid, status:'belum_hadir', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    return null;
  });

// ---------- Calendar updater (scheduled) placeholder ----------
exports.refreshCalendarEvents = functions.pubsub.schedule('every 24 hours').timeZone('Asia/Jakarta').onRun(async ()=>{
  // Best practice: fetch from authoritative source & write to calendar_events.
  // This repo leaves this as placeholder because API sources may change.
  return null;
});
