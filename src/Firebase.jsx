
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBExlTcBfJyHnhDWUHCeo7Abcd92iTZyHk",
  authDomain: "mwananchi-survey.firebaseapp.com",
  projectId: "mwananchi-survey",
  storageBucket: "mwananchi-survey.firebasestorage.app",
  messagingSenderId: "878308398319",
  appId: "1:878308398319:web:4a81d26d2a99ca5ab4f71a",
  measurementId: "G-WRDP7KH7S0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export {  doc, getDoc, updateDoc };
