import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * JAY-BESIN | FIREBASE UPLINK 
 * ------------------------------------------------
 * STATUS: CONNECTED
 * PROJECT ID: jaybesin-logistics
 */

const firebaseConfig = {
  apiKey: "AIzaSyBalkWvwfQdb7gAFr6vf6fIFqM5TBzHEPg",
  authDomain: "jaybesin-logistics.firebaseapp.com",
  projectId: "jaybesin-logistics",
  storageBucket: "jaybesin-logistics.firebasestorage.app",
  messagingSenderId: "887610003602",
  appId: "1:887610003602:web:62c4574b81de463cff964b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Services for the App to use
export const db = getFirestore(app);
export const storage = getStorage(app);