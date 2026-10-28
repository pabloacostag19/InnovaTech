// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDbwTk8xbVP5z4Dm0Tg7RZAAWMNafeHVeQ",
    authDomain: "innovatech-f0ff5.firebaseapp.com",
    projectId: "innovatech-f0ff5",
    storageBucket: "innovatech-f0ff5.firebasestorage.app",
    messagingSenderId: "672971551796",
    appId: "1:672971551796:web:18e398b06cb2fc24d90661"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

export const auth = getAuth(app);
export const db = getFirestore(app);