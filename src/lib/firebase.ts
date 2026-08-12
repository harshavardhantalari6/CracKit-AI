import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase App
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

// Auto-assign role and save user to Firestore
const ADMIN_EMAIL = 'harshavardhantalari6@gmail.com';

export async function syncUserProfileFirestore(
  fbUser: FirebaseUser,
  customDisplayName?: string
): Promise<UserProfile> {
  const userRef = doc(db, 'users', fbUser.uid);
  const userSnap = await getDoc(userRef);

  const isAdmin = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (userSnap.exists()) {
    const existing = userSnap.data() as UserProfile;
    // Upgrade role to admin if matching strict admin email
    if (isAdmin && existing.role !== 'admin') {
      const adminUpdated: UserProfile = {
        ...existing,
        role: 'admin',
        isPro: true,
      };
      await updateDoc(userRef, { role: 'admin', isPro: true });
      return adminUpdated;
    }
    return existing;
  }

  // Create new user in Firestore
  const newUserProfile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || 'aspirant@crackit.ai',
    displayName: customDisplayName || fbUser.displayName || 'CrackIt Aspirant',
    role: isAdmin ? 'admin' : 'user',
    isPro: isAdmin ? true : false,
    proExpiryDate: isAdmin ? '2030-12-31T23:59:59.000Z' : null,
    trialStartDate: new Date().toISOString(),
    preferredGoals: ['SSC CGL', 'TCS NQT'],
    targetCategory: 'both',
    targetExamsOrCompanies: ['SSC CGL', 'UPSC CSE', 'TCS NQT', 'Infosys'],
    weakTopics: ['Quantitative Aptitude - Profit & Loss', 'Coding - Dynamic Programming'],
  };

  await setDoc(userRef, newUserProfile);
  return newUserProfile;
}

// Save pending UTR submission for admin approval
export async function submitUtrForApproval(
  uid: string,
  email: string,
  displayName: string,
  utrNumber: string,
  selectedPlan: '3months' | '6months'
) {
  const submissionId = `utr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const submissionRef = doc(db, 'utrSubmissions', submissionId);
  const data = {
    submissionId,
    uid,
    email,
    displayName,
    utrNumber,
    selectedPlan,
    amount: selectedPlan === '6months' ? 249 : 149,
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    submittedAt: new Date().toISOString(),
  };

  await setDoc(submissionRef, data);

  // Also flag user document with pending UTR
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    utrNumber,
    selectedPlan,
    pendingApproval: true,
  });

  return data;
}

// Admin approve UTR submission
export async function approveUtrSubmission(
  submissionId: string,
  uid: string,
  selectedPlan: '3months' | '6months'
) {
  const durationMonths = selectedPlan === '6months' ? 6 : 3;
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  const proExpiryDateISO = expiryDate.toISOString();

  // 1. Update user document
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isPro: true,
    role: 'pro',
    selectedPlan,
    proExpiryDate: proExpiryDateISO,
    pendingApproval: false,
    proUnlockedAt: now.toISOString(),
  });

  // 2. Update submission record status
  if (submissionId) {
    const subRef = doc(db, 'utrSubmissions', submissionId);
    await updateDoc(subRef, {
      status: 'approved',
      approvedAt: now.toISOString(),
      proExpiryDate: proExpiryDateISO,
    });
  }

  return { proExpiryDate: proExpiryDateISO };
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
};
