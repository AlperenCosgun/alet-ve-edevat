import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// In an Expo app, environment variables must start with EXPO_PUBLIC_
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
}; 

let firebaseApp = null;
let db = null;
let auth = null;
let isFirebaseConfigured = false;

const SIMULATED_DB_KEY = 'alet_paylasim_simulated_db_rn_v1';

try {
  if (
    firebaseConfig &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId.trim() !== ''
  ) {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);
    isFirebaseConfigured = true;
    console.log('✅ Firebase bağlantısı kuruldu.');
  } else {
    console.log('ℹ️  Firebase yapılandırılmamış. Çevrimdışı mod aktif (AsyncStorage).');
  }
} catch (error) {
  console.warn('Firebase başlatılamadı, çevrimdışı mod devam ediyor.', error);
}

export { db, auth, isFirebaseConfigured, SIMULATED_DB_KEY };
