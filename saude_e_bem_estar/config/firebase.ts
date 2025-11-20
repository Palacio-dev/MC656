// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCF_54skKOLHWKt6B2W3fWVF0qBbR2ndec",
  authDomain: "nutrime-mc656.firebaseapp.com",
  projectId: "nutrime-mc656",
  storageBucket: "nutrime-mc656.firebasestorage.app",
  messagingSenderId: "191950966848",
  appId: "1:191950966848:web:7eb7fdeffd3914fc8e8fa5",
  measurementId: "G-JFSKC6SWW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);