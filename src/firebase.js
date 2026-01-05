import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * FIREBASE CONFIGURATION
 * ------------------------------------------------
 * 1. Go to: https://console.firebase.google.com/
 * 2. Click "Add Project" and follow the steps.
 * 3. Once created, click the Web icon (</>) to add an app.
 * 4. Copy the "firebaseConfig" object they show you.
 * 5. REPLACE the object below with YOURS.
 */

// --- PASTE YOUR CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyD...",             // <--- Replace with YOUR real apiKey
  authDomain: "jaybesin-logistics.firebaseapp.com",
  projectId: "jaybesin-logistics",
  storageBucket: "jaybesin-logistics.appspot.com",
  messagingSenderId: "123456789",   // <--- Replace with YOUR real ID
  appId: "1:123456789:web:abcdef"   // <--- Replace with YOUR real appId
};
// ------------------------------

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Database (Firestore) - Used for Shipments, Vehicles, Products
export const db = getFirestore(app);

// Initialize Storage - Ready for future image hosting upgrades
export const storage = getStorage(app);