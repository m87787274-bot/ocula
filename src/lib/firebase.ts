import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore to enable specific features like long polling if needed
console.log('[Firebase] Initializing Firestore with Database ID:', (firebaseConfig as any).firestoreDatabaseId);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const auth = getAuth(app);

// Simple logging for connectivity
console.log('[Firebase] Project ID:', firebaseConfig.projectId);
console.log('[Firebase] Auth Domain:', firebaseConfig.authDomain);

// Connectivity check with exponential backoff or simple retry
async function testConnection() {
  let retries = 0;
  const maxRetries = 5;
  
  while (retries < maxRetries) {
    try {
      console.log(`[Firebase] Testing connection (Attempt ${retries + 1}/${maxRetries})...`);
      // Use getDocFromServer to force a network request
      await getDocFromServer(doc(db, 'system', 'health_check'));
      console.log('[Firebase] Connection reached backend.');
      return;
    } catch (error: any) {
      // If we get an error response from the server (e.g. permission-denied), we've successfully connected
      if (error.code === 'permission-denied') {
        console.log('[Firebase] Server reached (Access Controlled).');
        return;
      }
      
      console.warn(`[Firebase] Connection attempt ${retries + 1} failed with code: ${error.code}. Message: ${error.message}`);
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
  console.error('[Firebase] Critical: Failed to reach Firestore backend after retries. This might be due to provisioning delay or network restrictions.');
}

// Only run connection test in browser environment
if (typeof window !== 'undefined') {
  testConnection();
}
