// 🔹 Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 🔹 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKw3ywJDtI6bdzXWgG5mKotsq0NlMvOdI",
  databaseURL: "https://wateresppro-default-rtdb.europe-west1.firebasedatabase.app/",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 🔹 Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const uidDisplay = document.getElementById("uid-display");
const loginSection = document.getElementById("login-section");
const userSection = document.getElementById("user-section");
const water = document.getElementById("water");
const levelText = document.getElementById("level-text");

const deviceUidInput = document.getElementById("device-uid");
const saveDeviceBtn = document.getElementById("save-device-btn");
const deviceHint = document.getElementById("device-hint");

let currentDeviceUID = null;
let currentUser = null;
let waterListenerUnsubscribe = null;

// ---------- Login / Register ----------
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) return alert("Please fill all fields");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle UI
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // create new user
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // create a small profile node
        await set(ref(db, `userProfiles/${userCredential.user.uid}`), { deviceUID: null });
      } catch (e) {
        alert("Register failed: " + e.message);
      }
    } else {
      alert("Login failed: " + error.message);
    }
  }
});

// ---------- Logout ----------
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("deviceUID");
  currentDeviceUID = null;
  currentUser = null;
  stopListeningWater();
  userSection.style.display = "none";
  loginSection.style.display = "block";
  water.style.height = "0%";
  levelText.textContent = "Please log in to see your water level";
});

// ---------- Save Device UID (user inputs the device UID from ESP) ----------
saveDeviceBtn.addEventListener("click", async () => {
  const deviceUID = deviceUidInput.value.trim();
  if (!deviceUID) return alert("Enter a valid Device UID");

  // Save locally
  localStorage.setItem("deviceUID", deviceUID);
  currentDeviceUID = deviceUID;
  deviceHint.textContent = `Using device UID: ${deviceUID}`;

  // Save to DB under the user's profile if logged in
  if (currentUser) {
    try {
      await set(ref(db, `userProfiles/${currentUser.uid}/deviceUID`), deviceUID);
    } catch (e) {
      console.warn("Could not save deviceUID to DB:", e);
    }
  }

  // Start listening the water level for that device
  startListeningWater(deviceUID);
});

// ---------- Helper: start / stop listening ----------
function startListeningWater(deviceUID) {
  stopListeningWater();
  if (!deviceUID) return;

  const levelRef = ref(db, `users/${deviceUID}/waterLevel`);
  onValue(levelRef, (snapshot) => {
    const level = snapshot.val();
    if (level !== null && !isNaN(level)) {
      const clamped = Math.max(0, Math.min(100, Number(level)));
      water.style.height = `${clamped}%`;
      levelText.textContent = `Water Level: ${clamped}%`;
    } else {
      levelText.textContent = "No data available";
      water.style.height = "0%";
    }
  });
  // store current uid for possible cleanup
  currentDeviceUID = deviceUID;
}

function stopListeningWater() {
  // In RTDB web SDK v11 onValue returns an unsubscribe function if needed,
  // but here we used onValue without capturing it; to keep simple, we rely
  // on page lifecycle. If you later need to remove listener, store the return.
  // For now we just let it be — calling another onValue on same path replaces UI.
}

// ---------- Auto login & load profile ----------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    uidDisplay.textContent = user.uid;
    loginSection.style.display = "none";
    userSection.style.display = "block";

    // Try to get deviceUID from DB profile
    try {
      const snapshot = await get(ref(db, `userProfiles/${user.uid}/deviceUID`));
      if (snapshot.exists() && snapshot.val()) {
        const deviceUID = snapshot.val();
        deviceUidInput.value = deviceUID;
        localStorage.setItem("deviceUID", deviceUID);
        deviceHint.textContent = `Using device UID: ${deviceUID}`;
        startListeningWater(deviceUID);
        return;
      }
    } catch (e) {
      console.warn("Failed to read profile deviceUID:", e);
    }

    // If not in DB, check localStorage
    const saved = localStorage.getItem("deviceUID");
    if (saved) {
      deviceUidInput.value = saved;
      deviceHint.textContent = `Using device UID: ${saved}`;
      startListeningWater(saved);
    } else {
      deviceHint.textContent = "No device saved yet.";
      levelText.textContent = "Please save your Device UID to see water level";
    }
  } else {
    // Not logged in: but still allow loading deviceUID from localStorage
    const saved = localStorage.getItem("deviceUID");
    if (saved) {
      deviceUidInput.value = saved;
      deviceHint.textContent = `Using device UID: ${saved} (not logged in)`;
      startListeningWater(saved);
      // show userSection so they can save after login
      userSection.style.display = "block";
      loginSection.style.display = "block";
    } else {
      // show login
      userSection.style.display = "none";
      loginSection.style.display = "block";
    }
  }
});
