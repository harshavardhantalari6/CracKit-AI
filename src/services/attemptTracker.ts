import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const LOCAL_STORAGE_KEY = 'attempted_question_ids';

/**
 * Task 1: Frontend Tracking Service
 * getExcludedIds(uid?) - Returns a flat array of all previously attempted question IDs.
 * Queries Firestore subcollection users/{uid}/attempted_questions if logged in,
 * otherwise fallbacks to localStorage.
 */
export async function getExcludedIds(uid?: string): Promise<string[]> {
  const localIds = getLocalAttemptedIds();

  if (!uid) {
    return localIds;
  }

  try {
    if (db) {
      const subcollRef = collection(db, 'users', uid, 'attempted_questions');
      const snapshot = await getDocs(subcollRef);

      const firestoreIds: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (Array.isArray(data.question_ids)) {
          data.question_ids.forEach((id: any) => {
            if (typeof id === 'string' && id.trim()) {
              firestoreIds.push(id.trim());
            }
          });
        } else if (Array.isArray(data.questionIds)) {
          data.questionIds.forEach((id: any) => {
            if (typeof id === 'string' && id.trim()) {
              firestoreIds.push(id.trim());
            }
          });
        } else if (data.questionId && typeof data.questionId === 'string') {
          firestoreIds.push(data.questionId.trim());
        }
      });

      // Merge Firestore IDs with LocalStorage IDs and deduplicate
      const mergedIds = Array.from(new Set([...firestoreIds, ...localIds]));
      
      // Keep localStorage synchronized
      saveLocalAttemptedIds(mergedIds);

      return mergedIds;
    }
  } catch (error) {
    console.warn('Firestore getExcludedIds failed or unauthenticated. Using localStorage fallback:', error);
  }

  return localIds;
}

/**
 * Record newly attempted question IDs in both Firestore subcollection users/{uid}/attempted_questions
 * and local storage.
 */
export async function recordAttemptedQuestions(uid: string | undefined, questionIds: string[]): Promise<void> {
  if (!questionIds || questionIds.length === 0) return;

  const validIds = questionIds.filter((id) => typeof id === 'string' && id.trim().length > 0);
  if (validIds.length === 0) return;

  // 1. Update localStorage
  const existingLocal = getLocalAttemptedIds();
  const mergedLocal = Array.from(new Set([...existingLocal, ...validIds]));
  saveLocalAttemptedIds(mergedLocal);

  // 2. Persist to Firestore subcollection if logged in
  if (uid && db) {
    try {
      const subcollRef = collection(db, 'users', uid, 'attempted_questions');
      await addDoc(subcollRef, {
        question_ids: validIds,
        count: validIds.length,
        attemptedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to persist attempted questions to Firestore subcollection:', error);
    }
  }
}

/**
 * Helper to retrieve attempted IDs array from localStorage
 */
function getLocalAttemptedIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0);
      }
    }
  } catch (e) {
    console.warn('Error reading attempted_question_ids from localStorage:', e);
  }
  return [];
}

/**
 * Helper to save attempted IDs array to localStorage
 */
function saveLocalAttemptedIds(ids: string[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Error saving attempted_question_ids to localStorage:', e);
  }
}
