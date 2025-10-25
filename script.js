import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://wateresppro-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const levelRef = ref(db, "waterLevel"); 

const water = document.getElementById("water");
const levelText = document.getElementById("level-text");

onValue(levelRef, (snapshot) => {
  const level = snapshot.val();
  if (level !== null) {
    water.style.height = `${level}%`;
    levelText.textContent = `Water Level: ${level}%`;
  } else {
    levelText.textContent = "No data available";
  }
});
