// Firebase configuration
// Replace these values with your Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Your Firebase config - you'll get this from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDPw6pMSjc523z5Uc67N8VU6HmMJCET3aI",
  authDomain: "circus-480bd.firebaseapp.com",
  projectId: "circus-480bd",
  storageBucket: "circus-480bd.firebasestorage.app",
  messagingSenderId: "947195911002",
  appId: "1:947195911002:web:cbad23defa42e2d4c57163",
  measurementId: "G-H4HE6K5RV2"
};

// Initialize Firebase with error handling
let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // Enable offline persistence (data works offline, syncs when online)
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available in this browser');
    } else {
      console.warn('Persistence error:', err);
    }
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Set to null explicitly so app can continue without Firebase
  app = null;
  db = null;
}

export { db };
export default app;
