import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKw3ywJDtI6bdzXWgG5mKotsq0NlMvOdI",
  authDomain: "wateresppro.firebaseapp.com",
  databaseURL: "https://wateresppro-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wateresppro",
  storageBucket: "wateresppro.firebasestorage.app",
  messagingSenderId: "342671515655",
  appId: "1:342671515655:web:8890c1e7d597dd9a460aa2",
  measurementId: "G-CY55LPRKHF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const water = document.getElementById("water");
const levelText = document.getElementById("level-text");
const logoutBtn = document.getElementById("logout-btn");

// قراءة الـ UID من localStorage
const uid = localStorage.getItem("boardUID");
if (!uid) { levelText.textContent = "No UID found!"; throw new Error("UID missing"); }

// 🔹 تحديث مستوى الماء
const levelRef = ref(db, `users/${uid}/waterLevel`);
onValue(levelRef, snapshot => {
  const level = snapshot.val();
  const clamped = Math.max(0, Math.min(100, Number(level || 0)));
  water.style.height = `${clamped}%`;
  levelText.textContent = `Water Level: ${clamped}%`;
});

// 🔹 Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    localStorage.removeItem("boardUID");
    window.location.href = "login.html";
  });
});
