// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq3RtBfbGDsjs54f2VDN0H9gSuw2sg9kI",
  authDomain: "student-management-cc48e.firebaseapp.com",
  projectId: "student-management-cc48e",
  storageBucket: "student-management-cc48e.firebasestorage.app",
  messagingSenderId: "678001753233",
  appId: "1:678001753233:web:0c3d0396ebe482ba34d330",
  measurementId: "G-9WYN1G94MJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
