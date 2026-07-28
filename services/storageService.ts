import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth, isConfigPlaceholder } from '../src/lib/firebase';
import { 
  User, 
  UserRole, 
  SavedScan, 
  VisibilityReport, 
  Campaign, 
  ScheduledScan,
  Notification, 
  SupportTicket 
} from "../types";
import { handleFirestoreError, OperationType, sanitizeForFirestore } from '../src/lib/firestoreUtils';

export const storageService = {
  getUser: async (userId?: string): Promise<User | null> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) return null;
    
    const path = `users/${id}`;
    try {
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  setUser: async (user: User) => {
    const path = `users/${user.id}`;
    const sanitizedUser = sanitizeForFirestore(user);
    try {
      await setDoc(doc(db, path), {
        ...sanitizedUser,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data() as User);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  updateUserRole: async (userId: string, role: UserRole) => {
    const path = `users/${userId}`;
    try {
      const data = sanitizeForFirestore({ role });
      if (!data || Object.keys(data).length === 0) return false;
      await updateDoc(doc(db, path), { ...data, updatedAt: serverTimestamp() });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  },

  getScans: async (userId?: string): Promise<SavedScan[]> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) {
      try {
        const guestScans = JSON.parse(localStorage.getItem('ocula_guest_scans') || '[]');
        return guestScans;
      } catch (e) {
        console.warn('Failed to load guest scans from local storage:', e);
        return [];
      }
    }
    
    // If the Firebase configuration is a placeholder, run purely in local storage mode
    if (isConfigPlaceholder) {
      try {
        const localScans = JSON.parse(localStorage.getItem(`ocula_scans_${id}`) || '[]');
        return localScans;
      } catch (e) {
        return [];
      }
    }
    
    const path = `users/${id}/scans`;
    try {
      const snap = await getDocs(collection(db, path));
      const firestoreScans = snap.docs.map(d => d.data() as SavedScan);
      
      // Load local scans to merge for offline resilience
      let localScans: SavedScan[] = [];
      try {
        localScans = JSON.parse(localStorage.getItem(`ocula_scans_${id}`) || '[]');
      } catch (e) {
        // ignore
      }
      
      const scanMap = new Map<string, SavedScan>();
      localScans.forEach(s => {
        if (s && s.id) scanMap.set(s.id, s);
      });
      firestoreScans.forEach(s => {
        if (s && s.id) scanMap.set(s.id, s);
      });
      
      const allScans = Array.from(scanMap.values());
      return allScans.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
    } catch (error) {
      console.warn('Could not load scans from Firestore, falling back to local storage:', error);
      try {
        const localScans = JSON.parse(localStorage.getItem(`ocula_scans_${id}`) || '[]');
        return localScans;
      } catch (e) {
        return [];
      }
    }
  },

  saveScan: async (businessName: string, score: number, report: VisibilityReport) => {
    const user = auth.currentUser;
    const finalBusinessName = businessName || report.businessName || "Unknown Business";
    const scanId = 'scan_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    
    if (!user) {
      // Guest or unauthenticated user: save to local storage
      const newScan: SavedScan = {
        id: scanId,
        userId: 'guest',
        timestamp: new Date().toISOString(),
        businessName: finalBusinessName,
        score: score || 0,
        report
      };
      try {
        const guestScans = JSON.parse(localStorage.getItem('ocula_guest_scans') || '[]');
        guestScans.unshift(newScan);
        localStorage.setItem('ocula_guest_scans', JSON.stringify(guestScans.slice(0, 20)));
      } catch (e) {
        console.warn('Failed to save guest scan locally:', e);
      }
      return newScan;
    }
    
    const path = `users/${user.uid}/scans/${scanId}`;
    
    const newScan: SavedScan = {
      id: scanId,
      userId: user.uid,
      timestamp: new Date().toISOString(),
      businessName: finalBusinessName,
      score: score || 0,
      report
    };
    
    // Save locally first so we always have it immediately available
    try {
      const localScans = JSON.parse(localStorage.getItem(`ocula_scans_${user.uid}`) || '[]');
      localScans.unshift(newScan);
      localStorage.setItem(`ocula_scans_${user.uid}`, JSON.stringify(localScans.slice(0, 20)));
    } catch (e) {
      console.warn('Failed to save user scan locally:', e);
    }

    if (isConfigPlaceholder) {
      return newScan;
    }
    
    try {
      const sanitizedScan = sanitizeForFirestore(newScan);
      await setDoc(doc(db, path), {
        ...sanitizedScan,
        createdAt: serverTimestamp()
      });
      return newScan;
    } catch (error) {
      console.warn('Firestore write failed for scan (non-blocking fallback active):', error);
      return newScan;
    }
  },

  getNotifications: async (userId?: string): Promise<Notification[]> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) return [];
    
    const path = `users/${id}/notifications`;
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Notification);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  addNotification: async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const user = auth.currentUser;
    if (!user) return null;
    
    const notifId = 'notif_' + Math.random().toString(36).substr(2, 9);
    const path = `users/${user.uid}/notifications/${notifId}`;
    
    const newNotification: Notification = {
      id: notifId,
      userId: user.uid,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const sanitizedNotif = sanitizeForFirestore(newNotification);
    try {
      await setDoc(doc(db, path), {
        ...sanitizedNotif,
        createdAt: serverTimestamp()
      });
      return newNotification;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return null;
    }
  },

  markNotificationAsRead: async (id: string) => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = `users/${user.uid}/notifications/${id}`;
    try {
      const data = sanitizeForFirestore({ read: true });
      await updateDoc(doc(db, path), { ...data });
      return await storageService.getNotifications();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return [];
    }
  },

  updateUserUnits: async (unitsToDeduct: number, scanIncrement: number = 0) => {
    const user = auth.currentUser;
    if (!user) return null;
    
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(doc(db, path));
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data() as User;
      const updatedAccount = {
        ...userData.account,
        unitsUsed: (userData.account.unitsUsed || 0) + unitsToDeduct,
        unitsRemaining: Math.max(0, (userData.account.unitsRemaining || 0) - unitsToDeduct),
        totalScans: (userData.account.totalScans || 0) + scanIncrement
      };
      
      const sanitizedAccount = sanitizeForFirestore(updatedAccount);
      if (!sanitizedAccount) return { ...userData, account: updatedAccount };

      await updateDoc(doc(db, path), {
        account: sanitizedAccount,
        updatedAt: serverTimestamp()
      });
      
      return { ...userData, account: updatedAccount };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return null;
    }
  },

  // Campaigns managed as sub-collections
  getCampaigns: async (userId?: string): Promise<Campaign[]> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) return [];
    
    const path = `users/${id}/campaigns`;
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data() as Campaign);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  addCampaign: async (campaign: Omit<Campaign, 'id'>) => {
    const user = auth.currentUser;
    if (!user) return null;
    
    const campaignId = 'camp_' + Math.random().toString(36).substr(2, 9);
    const path = `users/${user.uid}/campaigns/${campaignId}`;
    
    const newCampaign: Campaign = {
      ...campaign,
      id: campaignId,
    };
    
    const sanitizedCampaign = sanitizeForFirestore(newCampaign);
    try {
      await setDoc(doc(db, path), {
        ...sanitizedCampaign,
        createdAt: serverTimestamp()
      });
      return newCampaign;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return null;
    }
  },

  updateCampaign: async (campaignIdOrScanId: string, updatesOrCampaignId: Partial<Campaign> | string, updatesIfThreeArgs?: Partial<Campaign>) => {
    let campaignId: string;
    let updates: Partial<Campaign>;
    
    if (typeof updatesOrCampaignId === 'string' && updatesIfThreeArgs) {
      campaignId = updatesOrCampaignId;
      updates = updatesIfThreeArgs;
    } else {
      campaignId = campaignIdOrScanId;
      updates = updatesOrCampaignId as Partial<Campaign>;
    }

    const user = auth.currentUser;
    if (!user) return;
    
    const path = `users/${user.uid}/campaigns/${campaignId}`;
    try {
      const sanitizedUpdates = sanitizeForFirestore(updates);
      await updateDoc(doc(db, path), {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // ignore if not in campaigns sub-collection
    }

    // Also update in all scans (legacy support)
    const scans = await storageService.getScans();
    const batch: Promise<void>[] = [];
    
    scans.forEach(scan => {
      if (scan.report.campaigns?.some(c => c.id === campaignId)) {
        const updatedCampaigns = scan.report.campaigns.map(c => 
          c.id === campaignId ? { ...c, ...updates } : c
        );
        const sanitizedCampaigns = sanitizeForFirestore(updatedCampaigns);
        batch.push(updateDoc(doc(db, `users/${user.uid}/scans/${scan.id}`), {
          'report.campaigns': sanitizedCampaigns,
          updatedAt: serverTimestamp()
        }));
      }
    });
    
    await Promise.all(batch);
  },

  deleteCampaign: async (campaignId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const path = `users/${user.uid}/campaigns/${campaignId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  addTicket: async (subject: string, message: string) => {
    const user = auth.currentUser;
    if (!user) return null;
    
    const ticketId = 'ticket_' + Math.random().toString(36).substr(2, 9);
    const path = `users/${user.uid}/tickets/${ticketId}`;
    
    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user.uid,
      subject,
      message,
      status: 'open' as const,
      createdAt: new Date().toISOString()
    };
    
    const sanitizedTicket = sanitizeForFirestore(newTicket);
    try {
      await setDoc(doc(db, path), {
        ...sanitizedTicket,
        createdAt: serverTimestamp()
      });
      return [newTicket]; // Returning as array for compatibility
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return [];
    }
  },

  getTickets: async (userId?: string): Promise<SupportTicket[]> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) return [];
    
    const path = `users/${id}/tickets`;
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data() as SupportTicket);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  deleteScan: async (id: string) => {
    const user = auth.currentUser;
    if (!user) {
      try {
        const guestScans = JSON.parse(localStorage.getItem('ocula_guest_scans') || '[]');
        const updated = guestScans.filter((s: any) => s.id !== id);
        localStorage.setItem('ocula_guest_scans', JSON.stringify(updated));
        return updated;
      } catch (e) {
        return [];
      }
    }
    
    try {
      const localScans = JSON.parse(localStorage.getItem(`ocula_scans_${user.uid}`) || '[]');
      const updated = localScans.filter((s: any) => s.id !== id);
      localStorage.setItem(`ocula_scans_${user.uid}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    if (isConfigPlaceholder) {
      return await storageService.getScans();
    }
    
    const path = `users/${user.uid}/scans/${id}`;
    try {
      await deleteDoc(doc(db, path));
      return await storageService.getScans();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return [];
    }
  },

  markAllNotificationsAsRead: async () => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = `users/${user.uid}/notifications`;
    try {
      const q = query(collection(db, path), where('read', '==', false));
      const snap = await getDocs(q);
      const batch: Promise<void>[] = [];
      const data = sanitizeForFirestore({ read: true });
      snap.docs.forEach(docSnap => {
        batch.push(updateDoc(doc(db, path, docSnap.id), { ...data }));
      });
      await Promise.all(batch);
      return await storageService.getNotifications();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return [];
    }
  },

  clearNotifications: async () => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = `users/${user.uid}/notifications`;
    try {
      const snap = await getDocs(collection(db, path));
      const batch: Promise<void>[] = [];
      snap.docs.forEach(docSnap => {
        batch.push(deleteDoc(doc(db, path, docSnap.id)));
      });
      await Promise.all(batch);
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return [];
    }
  },

  updateSocialHandle: async (scanId: string, platform: string, handle: string) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const path = `users/${user.uid}/scans/${scanId}`;
    try {
      const scanDoc = await getDoc(doc(db, path));
      if (!scanDoc.exists()) return;
      
      const scanData = scanDoc.data() as SavedScan;
      const updatedSocial = (scanData.report.socialPresence || []).map(p => 
        p.platform === platform ? { ...p, handle } : p
      );
      
      const sanitizedSocial = sanitizeForFirestore(updatedSocial);
      await updateDoc(doc(db, path), {
        'report.socialPresence': sanitizedSocial,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteScans: async (ids: string[]) => {
    const user = auth.currentUser;
    if (!user) {
      try {
        const guestScans = JSON.parse(localStorage.getItem('ocula_guest_scans') || '[]');
        const updated = guestScans.filter((s: any) => !ids.includes(s.id));
        localStorage.setItem('ocula_guest_scans', JSON.stringify(updated));
        return updated;
      } catch (e) {
        return [];
      }
    }
    
    try {
      const localScans = JSON.parse(localStorage.getItem(`ocula_scans_${user.uid}`) || '[]');
      const updated = localScans.filter((s: any) => !ids.includes(s.id));
      localStorage.setItem(`ocula_scans_${user.uid}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    if (isConfigPlaceholder) {
      return await storageService.getScans();
    }
    
    const path = `users/${user.uid}/scans`;
    try {
      const batch: Promise<void>[] = [];
      ids.forEach(id => {
        batch.push(deleteDoc(doc(db, path, id)));
      });
      await Promise.all(batch);
      return await storageService.getScans();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return [];
    }
  },

  clearAllScans: async () => {
    const user = auth.currentUser;
    if (!user) {
      try {
        localStorage.removeItem('ocula_guest_scans');
      } catch (e) {
        // ignore
      }
      return [];
    }
    
    try {
      localStorage.removeItem(`ocula_scans_${user.uid}`);
    } catch (e) {
      // ignore
    }

    if (isConfigPlaceholder) {
      return [];
    }
    
    const path = `users/${user.uid}/scans`;
    try {
      const snap = await getDocs(collection(db, path));
      const batch: Promise<void>[] = [];
      snap.docs.forEach(docSnap => {
        batch.push(deleteDoc(doc(db, path, docSnap.id)));
      });
      await Promise.all(batch);
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return [];
    }
  },

  getLayout: async (): Promise<any | null> => {
    const user = auth.currentUser;
    if (!user) {
      const data = localStorage.getItem("ocula_dashboard_layout");
      return data ? JSON.parse(data) : null;
    }
    
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(doc(db, path));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.dashboardLayout || null;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  updateTicketStatus: async (ticketId: string, status: 'open' | 'in-progress' | 'resolved') => {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = `users/${user.uid}/tickets/${ticketId}`;
    try {
      const data = sanitizeForFirestore({ status });
      await updateDoc(doc(db, path), { ...data, updatedAt: serverTimestamp() });
      return await storageService.getTickets();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return [];
    }
  },

  addCampaignToScan: async (scanId: string, campaign: Campaign) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const path = `users/${user.uid}/scans/${scanId}`;
    try {
      const scanDoc = await getDoc(doc(db, path));
      if (!scanDoc.exists()) return;
      
      const scanData = scanDoc.data() as SavedScan;
      const updatedCampaigns = [campaign, ...(scanData.report.campaigns || [])];
      
      const sanitizedCampaigns = sanitizeForFirestore(updatedCampaigns);
      await updateDoc(doc(db, path), {
        'report.campaigns': sanitizedCampaigns,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  updateCampaignProgress: async (campaignId: string, progress: number) => {
    // This is tricky because campaigns might be in scans OR in a separate collection
    // The current UI seems to expect them in the 'campaigns' sub-collection after my change,
    // but legacy code might look in scans.
    // I'll update the 'campaigns' sub-collection and ALSO check scans if needed.
    
    const user = auth.currentUser;
    if (!user) return;
    
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'active' : 'planned';
    
    // 1. Update in campaigns sub-collection
    try {
      await storageService.updateCampaign(campaignId, { progress, status });
    } catch (e) {
      // Ignore if not found there
    }
    
    // 2. Update in all scans (legacy support)
    const scans = await storageService.getScans();
    const batch: Promise<void>[] = [];
    
    scans.forEach(scan => {
      if (scan.report.campaigns?.some(c => c.id === campaignId)) {
        const updatedCampaigns = scan.report.campaigns.map(c => 
          c.id === campaignId ? { ...c, progress, status } : c
        );
        const sanitizedCampaigns = sanitizeForFirestore(updatedCampaigns);
        batch.push(updateDoc(doc(db, `users/${user.uid}/scans/${scan.id}`), {
          'report.campaigns': sanitizedCampaigns,
          updatedAt: serverTimestamp()
        }));
      }
    });
    
    await Promise.all(batch);
  },

  setLayout: async (layout: any) => {
    const user = auth.currentUser;
    if (!user) {
      localStorage.setItem("ocula_dashboard_layout", JSON.stringify(layout));
      return;
    }
    
    const path = `users/${user.uid}`;
    try {
      const sanitizedLayout = sanitizeForFirestore(layout);
      if (sanitizedLayout === null || sanitizedLayout === undefined) return;
      
      await updateDoc(doc(db, path), {
        dashboardLayout: sanitizedLayout,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      // Still store in localStorage as fallback
      localStorage.setItem("ocula_dashboard_layout", JSON.stringify(layout));
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  getScheduledScans: async (userId?: string): Promise<ScheduledScan[]> => {
    const id = userId || auth.currentUser?.uid;
    if (!id) {
      const local = localStorage.getItem('ocula_scheduled_scans');
      return local ? JSON.parse(local) : [];
    }
    
    const path = `users/${id}/scheduled_scans`;
    try {
      const snap = await getDocs(collection(db, path));
      const firestoreItems = snap.docs.map(d => d.data() as ScheduledScan);
      if (firestoreItems.length > 0) {
        localStorage.setItem('ocula_scheduled_scans', JSON.stringify(firestoreItems));
        return firestoreItems;
      }
      const local = localStorage.getItem('ocula_scheduled_scans');
      return local ? JSON.parse(local) : [];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      const local = localStorage.getItem('ocula_scheduled_scans');
      return local ? JSON.parse(local) : [];
    }
  },

  saveScheduledScan: async (schedule: ScheduledScan): Promise<ScheduledScan> => {
    const user = auth.currentUser;
    const finalSchedule = {
      ...schedule,
      userId: user?.uid || 'guest'
    };

    const currentLocal = await storageService.getScheduledScans();
    const existingIdx = currentLocal.findIndex(s => s.id === schedule.id);
    let updatedLocal: ScheduledScan[];
    if (existingIdx >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existingIdx] = finalSchedule;
    } else {
      updatedLocal = [finalSchedule, ...currentLocal];
    }
    localStorage.setItem('ocula_scheduled_scans', JSON.stringify(updatedLocal));

    if (!user) return finalSchedule;

    const path = `users/${user.uid}/scheduled_scans/${schedule.id}`;
    try {
      const sanitized = sanitizeForFirestore(finalSchedule);
      await setDoc(doc(db, path), {
        ...sanitized,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    return finalSchedule;
  },

  deleteScheduledScan: async (scheduleId: string): Promise<boolean> => {
    const currentLocal = await storageService.getScheduledScans();
    const filtered = currentLocal.filter(s => s.id !== scheduleId);
    localStorage.setItem('ocula_scheduled_scans', JSON.stringify(filtered));

    const user = auth.currentUser;
    if (!user) return true;

    const path = `users/${user.uid}/scheduled_scans/${scheduleId}`;
    try {
      await deleteDoc(doc(db, path));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  }
};
