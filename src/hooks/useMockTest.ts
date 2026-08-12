import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';
import { getExcludedIds, recordAttemptedQuestions } from '../services/attemptTracker';

export interface UseMockTestOptions {
  category?: string;
  topic?: string | string[];
  difficulty?: string;
  count?: number;
  userUid?: string;
  autoFetch?: boolean;
}

export interface UseMockTestReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  excludedIds: string[];
  fetchQuestions: (overrideTopic?: string | string[], overrideCategory?: string) => Promise<Question[]>;
  completeTest: (attemptedQuestionIds: string[]) => Promise<void>;
  resetTest: () => void;
}

/**
 * Task 3: The API Binding
 * Custom React hook useMockTest(category, topic) that:
 * 1. Fetches excluded question IDs via getExcludedIds(userUid)
 * 2. Makes POST /api/generate-mock request passing category, topic, difficulty, exclude_ids
 * 3. Provides completeTest(questionIds) to store newly attempted IDs to Firebase/localStorage
 */
export function useMockTest(
  category: string = 'govt',
  topic: string | string[] = 'Quantitative Aptitude',
  options: Omit<UseMockTestOptions, 'category' | 'topic'> = {}
): UseMockTestReturn {
  const {
    difficulty = 'Medium',
    count = 5,
    userUid,
    autoFetch = true,
  } = options;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  const fetchQuestions = useCallback(
    async (overrideTopic?: string | string[], overrideCategory?: string): Promise<Question[]> => {
      setLoading(true);
      setError(null);

      try {
        // 1. Retrieve flat list of excluded question IDs from Firestore/localStorage
        const currentExcluded = await getExcludedIds(userUid);
        setExcludedIds(currentExcluded);

        const targetTopic = overrideTopic || topic;
        const targetCategory = overrideCategory || category;

        // 2. Dispatch POST /api/generate-mock
        const response = await fetch('/api/generate-mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: targetCategory,
            topic: targetTopic,
            difficulty,
            exclude_ids: currentExcluded,
            count,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setIsFallback(Boolean(data.isFallback));
          setLoading(false);
          return data.questions;
        } else {
          throw new Error(data.error || 'Failed to generate mock test questions');
        }
      } catch (err: any) {
        console.warn('useMockTest fetch error:', err?.message || err);
        setError(err?.message || 'Error generating test questions.');
        setLoading(false);
        return [];
      }
    },
    [category, topic, difficulty, count, userUid]
  );

  /**
   * Called upon test completion to record newly attempted question IDs in Firebase / localStorage
   */
  const completeTest = useCallback(
    async (attemptedQuestionIds: string[]): Promise<void> => {
      if (!attemptedQuestionIds || attemptedQuestionIds.length === 0) return;

      try {
        await recordAttemptedQuestions(userUid, attemptedQuestionIds);
        setExcludedIds((prev) => Array.from(new Set([...prev, ...attemptedQuestionIds])));
      } catch (err) {
        console.warn('Error completing test and recording attempted IDs:', err);
      }
    },
    [userUid]
  );

  const resetTest = useCallback(() => {
    setQuestions([]);
    setError(null);
    setIsFallback(false);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchQuestions();
    }
  }, [autoFetch, fetchQuestions]);

  return {
    questions,
    loading,
    error,
    isFallback,
    excludedIds,
    fetchQuestions,
    completeTest,
    resetTest,
  };
}
