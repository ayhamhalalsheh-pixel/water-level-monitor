import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const uidInput = document.getElementById("uid-input");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");

// 🔹 Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const uid = uidInput.value.trim();

  if (!uid) { alert("Enter Board UID"); return; }

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      localStorage.setItem("boardUID", uid);
      window.location.href = "dashboard.html"; // بعد الدخول يروح للصفحة الثانية
    })
    .catch(err => { alert(err.message); });
});

// 🔹 Sign Up
signupBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const uid = uidInput.value.trim();

  if (!uid) { alert("Enter Board UID"); return; }

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      localStorage.setItem("boardUID", uid);
      set(ref(db, `users/${uid}`), {
        owner: userCredential.user.uid,
        email: email,
        waterLevel: 0
      });
      alert("Account created!");
      window.location.href = "dashboard.html";
    })
    .catch(err => { alert(err.message); });
});
