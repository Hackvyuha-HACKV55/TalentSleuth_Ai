// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4E6KYyo-66-IR6eCxvQ7AzE6eWGyGaRc",
  authDomain: "talentsleuth-ai.firebaseapp.com",
  projectId: "talentsleuth-ai",
  storageBucket: "talentsleuth-ai.firebasestorage.app",
  messagingSenderId: "166933748182",
  appId: "1:166933748182:web:f44470489f1a7c055eec77"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
