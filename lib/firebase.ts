// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDGJW8P4yupSFZdXYWLvmouYDFrTzfx8M",
  authDomain: "react-todo-5bddc.firebaseapp.com",
  projectId: "react-todo-5bddc",
  storageBucket: "react-todo-5bddc.firebasestorage.app",
  messagingSenderId: "300893398056",
  appId: "1:300893398056:web:b3125533c2bcdb40bd811d",
  measurementId: "G-52NE3FJL0H"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };