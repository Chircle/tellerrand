import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  getIdTokenResult,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// Alle Werte kommen ausschließlich aus Umgebungsvariablen (.env lokal,
// GitHub Secrets im Actions-Workflow). Nirgendwo im Code stehen Klartext-Keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function registerWithEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Verifizierungsmail direkt nach Registrierung verschicken. Der Zugriff auf
  // die eigentliche App wird erst freigeschaltet, wenn der Link bestätigt wurde
  // (siehe VerifyEmail.jsx und die email_verified-Prüfung in firestore.rules).
  await sendEmailVerification(cred.user);
  return cred;
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function resendVerification() {
  if (!auth.currentUser) return Promise.resolve();
  return sendEmailVerification(auth.currentUser);
}

// Lädt den aktuellen Nutzer neu von Firebase (z. B. nachdem er den
// Verifizierungslink angeklickt hat) und meldet, ob die E-Mail jetzt bestätigt ist.
//
// WICHTIG: reload() aktualisiert nur das lokale Profil-Objekt (die Anzeige),
// nicht das signierte Zugangs-Token, das Firestore bei jedem Schreibzugriff
// prüft. Ohne den erzwungenen Token-Refresh (getIdTokenResult mit
// forceRefresh=true) bleibt das alte, noch "unverifizierte" Token aktiv und
// jeder Schreibversuch scheitert an den Security Rules — auch nach einem
// Reload der Seite, weil Firebase das alte Token zwischenspeichert und
// solange wiederverwendet, bis es natürlich abläuft (~1 Stunde).
export async function refreshCurrentUser() {
  if (!auth.currentUser) return false;
  await reload(auth.currentUser);
  const tokenResult = await getIdTokenResult(auth.currentUser, true); // true = force refresh
  return tokenResult.claims.email_verified === true;
}

export function logout() {
  return signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
};
