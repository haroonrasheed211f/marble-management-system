// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyACSECfSOvvsKVUPKudKqRsV_naSUGWBWg",
  authDomain: "marble-management.firebaseapp.com",
  projectId: "marble-management",
  storageBucket: "marble-management.firebasestorage.app",
  messagingSenderId: "341555466382",
  appId: "1:341555466382:web:01f65a6204c89e629bf9df",
  measurementId: "G-41L9F6ZF9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };