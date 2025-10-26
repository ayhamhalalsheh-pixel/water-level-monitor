// 🔹 Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// 🔹 Firebase config (القيم تبعك)
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


// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 🔹 Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const uidInput = document.getElementById("uid-input");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const water = document.getElementById("water");
const levelText = document.getElementById("level-text");

// ---------------------------
// LOGIN
// ---------------------------
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const boardUID = uidInput.value || localStorage.getItem("boardUID");
      if (!boardUID) {
        alert("Please enter your board UID!");
        return;
      }
      localStorage.setItem("boardUID", boardUID);
      loadWaterLevel(boardUID);
      levelText.textContent = "Logged in! Loading water level...";
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});

// ---------------------------
// SIGN UP
// ---------------------------
signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const boardUID = uidInput.value;

  if (!boardUID) {
    alert("Please enter your board UID!");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // حفظ UID المستخدم واللوحة
      localStorage.setItem("boardUID", boardUID);
      // إنشاء مدخل جديد في قاعدة البيانات
      set(ref(db, `users/${boardUID}`), {
        owner: user.uid,
        email: user.email,
        waterLevel: 0
      });
      alert("Account created successfully!");
      loadWaterLevel(boardUID);
    })
    .catch((error) => {
      alert("Sign up failed: " + error.message);
    });
});

// ---------------------------
// تحميل بيانات الماء
// ---------------------------
function loadWaterLevel(uid) {
  const levelRef = ref(db, `users/${uid}/waterLevel`);
  onValue(levelRef, (snapshot) => {
    const level = snapshot.val();
    if (level !== null) {
      const clamped = Math.max(0, Math.min(100, Number(level)));
      water.style.height = `${clamped}%`;
      levelText.textContent = `Water Level: ${clamped}%`;
    } else {
      levelText.textContent = "No data available";
      water.style.height = "0%";
    }
  });
}

// ---------------------------
// Auto login if already authenticated
// ---------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = localStorage.getItem("boardUID");
    if (uid) {
      loadWaterLevel(uid);
      levelText.textContent = "Logged in! Loading water level...";
    } else {
      levelText.textContent = "Please enter your board UID";
    }
  }
});
