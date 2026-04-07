import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_QJWwatWQQM9zA1I6DXAJqGIVcBIF0is",
  authDomain: "drop-c86e6.firebaseapp.com",
  projectId: "drop-c86e6",
  storageBucket: "drop-c86e6.firebasestorage.app",
  messagingSenderId: "52725323219",
  appId: "1:52725323219:web:20fe198349791316e7cb26",
  measurementId: "G-TR0V43MRK0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);