
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

let cachedProfile=null;
let cachedUid=null;

async function getProfile(uid){
  if(cachedUid===uid && cachedProfile) return cachedProfile;
  const ref = doc(db,'profiles',uid);
  const snap = await getDoc(ref);
  cachedProfile = snap.exists()? snap.data(): null;
  cachedUid = uid;
  return cachedProfile;
}

function isAuthRoute(hash){ return hash.startsWith('#/auth'); }
function isAppRoute(hash){ return !isAuthRoute(hash); }

export async function authGate(hash){
  // wait for auth state once
  const user = await new Promise(res=>{
    const unsub = onAuthStateChanged(auth,(u)=>{unsub();res(u||null);});
  });

  if(!user){
    if(isAuthRoute(hash)) return null;
    return '#/auth/masuk';
  }

  // signed in
  if(isAuthRoute(hash)) return '#/home';

  const profile = await getProfile(user.uid);
  if(!profile){
    if(hash==='#/auth/buat-profil') return null;
    return '#/auth/buat-profil';
  }

  if(profile.approvalStatus !== 'approved'){
    if(hash==='#/pending') return null;
    return '#/pending';
  }

  return null;
}
