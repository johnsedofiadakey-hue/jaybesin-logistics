// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- JAY-BESIN LOGISTICS CLOUD CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA2HzVUp5QIzAwl2bjeoNX8wmZ8VrL3W-8",
  authDomain: "jaybesinlogistics-38770.firebaseapp.com",
  projectId: "jaybesinlogistics-38770",
  storageBucket: "jaybesinlogistics-38770.firebasestorage.app",
  messagingSenderId: "873061880012",
  appId: "1:873061880012:web:4a32a452d51890d7133269"
};

// 1. Initialize the Firebase Application
const app = initializeApp(firebaseConfig);

// 2. Export the Database Connection so the App can use it
export const db = getFirestore(app);