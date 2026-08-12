import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  syncUserProfileFirestore,
  db,
} from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getStoredUser, saveStoredUser } from '../services/firebaseConfig';

interface AuthContextType {
  user: UserProfile;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  updateUser: (updated: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

const ADMIN_EMAIL = 'harshavardhantalari6@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(getStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfileFirestore(fbUser);
          setUser(profile);
          saveStoredUser(profile);
        } catch (err) {
          console.error('Error syncing user profile on auth state change:', err);
        }
      } else {
        // If not logged in via Firebase Auth, default to stored user or standard user
        const stored = getStoredUser();
        setUser(stored);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncUserProfileFirestore(result.user);
      setUser(profile);
      saveStoredUser(profile);
      return profile;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      const guestUser: UserProfile = {
        uid: '',
        displayName: '',
        email: '',
        role: 'user',
        isPro: false,
        proExpiryDate: null,
        trialStartDate: new Date().toISOString(),
        preferredGoals: ['SSC CGL', 'TCS NQT'],
        targetCategory: 'both',
        targetExamsOrCompanies: ['SSC CGL', 'TCS NQT'],
        weakTopics: [],
      };
      setUser(guestUser);
      localStorage.removeItem('prep_app_user');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateUser = (updated: UserProfile) => {
    setUser(updated);
    saveStoredUser(updated);
  };

  const refreshUser = async () => {
    if (user.uid && !user.uid.startsWith('guest_')) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const fresh = userSnap.data() as UserProfile;
          setUser(fresh);
          saveStoredUser(fresh);
        }
      } catch (e) {
        console.warn('Failed to refresh user profile from Firestore:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithGoogle,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
