// Firebase sync utilities
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const DATA_DOC_ID = 'circusAppData';

// Load data from Firebase
export const loadDataFromFirebase = async () => {
  try {
    if (!db) {
      console.warn('Firestore db not initialized');
      return null;
    }
    const docRef = doc(db, 'appData', DATA_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove Firebase metadata
      delete data.lastUpdated;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return null;
  }
};

// Save data to Firebase
export const saveDataToFirebase = async (data) => {
  try {
    if (!db) {
      console.warn('Firestore db not initialized');
      return false;
    }
    const docRef = doc(db, 'appData', DATA_DOC_ID);
    await setDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp()
    }, { merge: false }); // Overwrite entire document
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
};

// Set up real-time listener for data changes
export const setupFirebaseListener = (callback) => {
  try {
    if (!db) {
      console.warn('Firestore db not initialized');
      return () => {}; // Return empty unsubscribe function
    }
    const docRef = doc(db, 'appData', DATA_DOC_ID);
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          delete data.lastUpdated;
          callback(data);
        }
      },
      (error) => {
        console.error('Firebase listener error:', error);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up Firebase listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  try {
    // Simple check: if db exists, Firebase is configured
    // The firebase.js file already handles initialization errors and sets db to null on failure
    return db !== null && db !== undefined;
  } catch (error) {
    console.warn('Error checking Firebase config:', error);
    return false;
  }
};
