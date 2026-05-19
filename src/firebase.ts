import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqXeAn7xVRR0F3iGWOYVwpQQu8AjWwkvI",
  authDomain: "academia-corpo.firebaseapp.com",
  databaseURL: "https://academia-corpo-default-rtdb.firebaseio.com",
  projectId: "academia-corpo",
  storageBucket: "academia-corpo.firebasestorage.app",
  messagingSenderId: "393405913319",
  appId: "1:393405913319:web:1b33c6c7d13d7efbc7ea42",
  measurementId: "G-FNL8EDX433"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
