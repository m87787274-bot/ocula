import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '../src/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserRole, SubscriptionTier } from '../types';
import { handleFirestoreError, OperationType } from '../src/lib/firestoreUtils';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  loginWithGoogle: async () => {
    let firebaseUser;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Authentication popup was blocked by your browser. Please allow popups for this site or open the application in a new tab.');
      }
      throw error;
    }

    try {
      // Check if user exists in Firestore, if not create profile
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Anonymous',
          email: firebaseUser.email || '',
          role: UserRole.ANALYST, // Default role
          avatar: firebaseUser.photoURL || undefined,
          account: {
            tier: 'free' as SubscriptionTier,
            unitsTotal: 10,
            unitsUsed: 0,
            unitsRemaining: 10,
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            totalScans: 0
          },
          preferences: {
            notifications: {
              push: true,
              email: false,
              anomalies: true,
              marketUpdates: true
            },
            theme: 'system'
          }
        };
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return newUser;
      }
      
      return userSnap.data() as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
      return null;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: (): Promise<FirebaseUser | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  subscribeToAuth: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
