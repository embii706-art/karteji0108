/* FIX v1.8.1
 * Auth gate anti race-condition
 */
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { auth } from "./lib/firebase.js";
import { router } from "./router.js";
import { loadProfile } from "./lib/profile.js";

export async function initAuthGate() {
  await router.init();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.go("/auth/masuk");
      return;
    }

    const profile = await loadProfile(user.uid);

    if (!profile) {
      router.go("/auth/buat-profil");
      return;
    }

    if (profile.approvalStatus !== "approved") {
      router.go("/pending");
      return;
    }

    router.go("/home");
  });
}
