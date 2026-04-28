// ============================================
// firebase-config.js
// Inicialização do Firebase (SDK Modular v10)
// ============================================
//
// COMO CONFIGURAR:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um projeto novo
// 3. Adicione um app web (ícone </>)
// 4. Copie os valores do firebaseConfig abaixo
// 5. Habilite Authentication > Email/Password
// 6. Habilite Firestore Database (modo produção)
// 7. Cole as regras do arquivo firestore.rules
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// 🔥 SUBSTITUA pelos seus dados do Firebase Console:
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdd0-zpzrqbCSMREDCSSqeX8LC1qX17Po",
  authDomain: "barbearia-premium-3d0e0.firebaseapp.com",
  projectId: "barbearia-premium-3d0e0",
  storageBucket: "barbearia-premium-3d0e0.firebasestorage.app",
  messagingSenderId: "854451460872",
  appId: "1:854451460872:web:4a77b115c43525da17eabd"
};

// Persistência local (mantém logado entre sessões)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('[Firebase] Falha ao configurar persistência:', err);
});

// Exporta tudo que os outros módulos vão usar
export {
  app,
  auth,
  db,
  // Auth
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  // Firestore
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
};
