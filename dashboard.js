import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKw3ywJDtI6bdzXWgG5mKotsq0NlMvOdI",
  authDomain: "wateresppro.firebaseapp.com",
  databaseURL: "https://wateresppro-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wateresppro",
  storageBucket: "wateresppro.firebasedestorage.app",
  messagingSenderId: "342671515655",
  appId: "1:342671515655:web:8890c1e7d597dd9a460aa2",
  measurementId: "G-CY55LPRKHF"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const waterLevelElement = document.getElementById("waterLevel");
const waterMask = document.querySelector(".water-mask");

// 🔹 Get UID from localStorage or URL
let uid = localStorage.getItem("uid");
if (!uid) {
  const params = new URLSearchParams(window.location.search);
  uid = params.get("uid");
  if (uid) localStorage.setItem("uid", uid);
}

function updateWaterLevel(level) {
  waterLevelElement.textContent = `${level}%`;
  waterMask.style.height = `${level}%`; // ارتفاع الماء يتناسب مع الرقم
}

// 🔹 Real-time listener
if (uid) {
  const waterRef = ref(database, `users/${uid}/waterLevel`);
  onValue(waterRef, (snapshot) => {
    if (snapshot.exists()) {
      updateWaterLevel(snapshot.val());
    } else {
      waterLevelElement.textContent = "--%";
      waterMask.style.height = "0%";
    }
  }, (error) => {
    console.error("Firebase read error:", error);
    waterLevelElement.textContent = "--%";
    waterMask.style.height = "0%";
  });
} else {
  waterLevelElement.textContent = "--%";
  waterMask.style.height = "0%";
}

// 🔹 logout
function logout() {
  signOut(auth).then(() => {
    localStorage.removeItem("uid");
    window.location.href = "index.html";
  });
}
window.logout = logout;
