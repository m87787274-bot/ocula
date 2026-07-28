import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db, isConfigPlaceholder } from '../src/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserRole, SubscriptionTier } from '../types';
import { handleFirestoreError, OperationType } from '../src/lib/firestoreUtils';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  getDemoUser: (): User => ({
    id: 'demo-analyst-1',
    name: 'Demo Analyst',
    email: 'analyst@ocula.ai',
    role: UserRole.ANALYST,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    account: {
      tier: 'enterprise' as SubscriptionTier,
      unitsTotal: 100,
      unitsUsed: 12,
      unitsRemaining: 88,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalScans: 8
    },
    preferences: {
      notifications: {
        push: true,
        email: true,
        anomalies: true,
        marketUpdates: true
      },
      theme: 'system' as const
    }
  }),

  loginWithGoogle: async (): Promise<User> => {
    // If configuration uses placeholder values, bypass live network call and return demo session
    if (isConfigPlaceholder) {
      console.log('[AuthService] Operating with placeholder configuration. Returning demo analyst session.');
      return authService.getDemoUser();
    }

    let firebaseUser;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      firebaseUser = result.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Authentication popup was blocked by your browser. Please allow popups for this site or open the application in a new tab.');
      }
      if (
        error.code === 'auth/api-key-not-valid' || 
        error.message?.includes('api-key-not-valid') ||
        error.message?.includes('API key')
      ) {
        console.warn('[AuthService] Firebase API key invalid or unconfigured. Falling back to demo session.');
        return authService.getDemoUser();
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
            unitsTotal: 50,
            unitsUsed: 0,
            unitsRemaining: 50,
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
            theme: 'system' as const
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
      console.warn('[AuthService] Firestore write failed or permission denied during auth sync. Returning local user profile.');
      return {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        role: UserRole.ANALYST,
        avatar: firebaseUser.photoURL || undefined,
        account: {
          tier: 'free' as SubscriptionTier,
          unitsTotal: 50,
          unitsUsed: 0,
          unitsRemaining: 50,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          totalScans: 0
        },
        preferences: {
          notifications: { push: true, email: false, anomalies: true, marketUpdates: true },
          theme: 'system' as const
        }
      };
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
