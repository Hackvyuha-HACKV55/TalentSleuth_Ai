
// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Added for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4E6KYyo-66-IR6eCxvQ7AzE6eWGyGaRc",
  authDomain: "talentsleuth-ai.firebaseapp.com",
  projectId: "talentsleuth-ai",
  storageBucket: "talentsleuth-ai.appspot.com", // Ensure this is correct for Storage
  messagingSenderId: "166933748182",
  appId: "1:166933748182:web:f44470489f1a7c055eec77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export storage instance

