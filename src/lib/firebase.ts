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

// Check if config uses placeholder values
export const isConfigPlaceholder = 
  !firebaseConfig.projectId || 
  firebaseConfig.projectId === 'remixed-project-id' || 
  firebaseConfig.apiKey === 'remixed-api-key';

// Connectivity check with exponential backoff or simple retry
async function testConnection() {
  if (isConfigPlaceholder) {
    console.log('[Firebase] Running with placeholder configuration (remixed-project-id). Offline/Local storage mode active.');
    return;
  }

  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      console.log(`[Firebase] Testing connection (Attempt ${retries + 1}/${maxRetries})...`);
      // Use getDocFromServer to force a network request
      await getDocFromServer(doc(db, 'system', 'health_check'));
      console.log('[Firebase] Connection reached backend.');
      return;
    } catch (error: any) {
      // If we get an error response from the server (e.g. permission-denied or not-found), we've successfully connected to backend
      if (error.code === 'permission-denied' || error.code === 'not-found') {
        console.log('[Firebase] Server reached successfully.');
        return;
      }
      
      console.warn(`[Firebase] Connection attempt ${retries + 1} failed with code: ${error.code}. Message: ${error.message}`);
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }
  console.warn('[Firebase] Firestore backend test completed. Operating with local fallback.');
}

// Only run connection test in browser environment
if (typeof window !== 'undefined') {
  testConnection();
}
