import { UserProfile, JobAlert, MockTest, TestResult, ResumeData } from '../types';

// Initial Mock Job Alerts for Govt & IT Sector
export const INITIAL_JOB_ALERTS: JobAlert[] = [
  {
    jobId: 'job_1',
    title: 'SSC CGL 2026 Combined Graduate Level Exam',
    companyOrDept: 'Staff Selection Commission (Govt of India)',
    category: 'govt',
    location: 'All India',
    salaryOrGrade: 'Pay Level 4 to Level 8 (₹35,400 - ₹1,42,400)',
    syllabusTags: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness'],
    deadline: '2026-08-30',
    applyUrl: 'https://ssc.gov.in',
    matchedPercent: 98,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_2',
    title: 'TCS NQT National Qualifier Test 2026',
    companyOrDept: 'Tata Consultancy Services',
    category: 'it',
    location: 'PAN India / Remote',
    salaryOrGrade: '₹3.36 LPA - ₹9.0 LPA (Ninja & Digital)',
    syllabusTags: ['Numerical Ability', 'Verbal Ability', 'Reasoning Ability', 'Programming Logic', 'Coding (C++/Java/Python)'],
    deadline: '2026-08-15',
    applyUrl: 'https://www.tcs.com/careers',
    matchedPercent: 95,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_3',
    title: 'RRB NTPC & ALP Loco Pilot Recruitment 2026',
    companyOrDept: 'Indian Railways (RRB)',
    category: 'railway',
    location: 'All Zonal Railways',
    salaryOrGrade: 'Pay Level 2, 3, 5, 6 (₹19,900 - ₹35,400)',
    syllabusTags: ['General Awareness', 'Mathematics & Mental Ability', 'General Science (Physics/Chem/Bio)', 'Technical Aptitude'],
    deadline: '2026-09-15',
    applyUrl: 'https://indianrailways.gov.in',
    matchedPercent: 94,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_4',
    title: 'CTET Central Teacher Eligibility Test 2026',
    companyOrDept: 'Central Board of Secondary Education (CBSE)',
    category: 'teaching',
    location: 'All India Test Centers',
    salaryOrGrade: 'Central / State Govt Teacher Scale',
    syllabusTags: ['Child Development & Pedagogy', 'Language I & II', 'Mathematics Pedagogy', 'Environmental Studies'],
    deadline: '2026-08-28',
    applyUrl: 'https://ctet.nic.in',
    matchedPercent: 92,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_5',
    title: 'IBPS PO Probationary Officer XV',
    companyOrDept: 'Institute of Banking Personnel Selection',
    category: 'govt',
    location: 'Public Sector Banks across India',
    salaryOrGrade: '₹52,000 / month approx + Allowances',
    syllabusTags: ['Data Analysis & Interpretation', 'Reasoning & Computer Aptitude', 'General/Banking Awareness', 'English Language'],
    deadline: '2026-09-05',
    applyUrl: 'https://ibps.in',
    matchedPercent: 91,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_6',
    title: 'State DSC / TRT School Assistant & SGT Recruitment',
    companyOrDept: 'State Education Department',
    category: 'teaching',
    location: 'State District Centers',
    salaryOrGrade: 'Pay Scale Level 7 (₹31,040 - ₹92,000)',
    syllabusTags: ['Perspectives in Education', 'Child Psychology', 'Subject Methodology', 'General Knowledge'],
    deadline: '2026-09-20',
    applyUrl: 'https://schooledu.gov.in',
    matchedPercent: 90,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    jobId: 'job_7',
    title: 'Infosys Specialist Programmer & System Engineer',
    companyOrDept: 'Infosys Limited',
    category: 'it',
    location: 'Bengaluru, Hyderabad, Pune, Remote',
    salaryOrGrade: '₹6.25 LPA - ₹9.5 LPA',
    syllabusTags: ['Data Structures & Algorithms', 'DBMS & SQL', 'Pseudo Code', 'English Verbal'],
    deadline: '2026-08-20',
    applyUrl: 'https://www.infosys.com/careers.html',
    matchedPercent: 89,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

// Initial Pre-built PYQ Mock Tests
export const INITIAL_MOCK_TESTS: MockTest[] = [
  {
    testId: 'test_ssc_cgl_1',
    title: 'SSC CGL 2025 Tier 1 Full Practice Paper',
    category: 'govt',
    targetName: 'SSC CGL',
    topics: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    durationMinutes: 15,
    totalQuestions: 5,
    createdAt: '2026-07-28',
    questions: [
      {
        questionId: 'q1',
        topicTag: 'Quantitative Aptitude',
        pyqSource: 'SSC CGL 2024 Tier 1 Shift 2',
        questionText: 'A seller marks an article 30% above its cost price and gives a discount of 15% on the marked price. Find his net profit percentage.',
        options: ['10.5%', '12.5%', '15.0%', '10.0%'],
        correctOption: 0,
        explanation: 'Let Cost Price = 100. Marked Price = 130. Discount = 15% of 130 = 19.5. Selling Price = 130 - 19.5 = 110.5. Net Profit = 110.5 - 100 = 10.5%.',
        difficulty: 'Medium',
      },
      {
        questionId: 'q2',
        topicTag: 'General Intelligence & Reasoning',
        pyqSource: 'SSC CGL 2023 Tier 1',
        questionText: 'In a code language, "FLOWER" is written as "UOLDVI". How will "GARDEN" be coded in the same language?',
        options: ['TZIWVM', 'TZIWUM', 'TZIWVM', 'TZIWVN'],
        correctOption: 0,
        explanation: 'Each letter is replaced by its opposite alphabet position (A↔Z, B↔Y, F↔U, L↔O, O↔L, W↔D, E↔V, R↔I). Hence, G↔T, A↔Z, R↔I, D↔W, E↔V, N↔M => TZIWVM.',
        difficulty: 'Medium',
      },
      {
        questionId: 'q3',
        topicTag: 'General Awareness',
        pyqSource: 'SSC CGL 2024 Tier 1',
        questionText: 'Which fundamental right under the Indian Constitution cannot be suspended even during a National Emergency?',
        options: ['Article 19 & 20', 'Article 20 & 21', 'Article 14 & 19', 'Article 21 & 22'],
        correctOption: 1,
        explanation: 'Under the 44th Constitutional Amendment Act 1978, the rights guaranteed under Article 20 (Protection in respect of conviction for offences) and Article 21 (Protection of life and personal liberty) cannot be suspended during National Emergency.',
        difficulty: 'Easy',
      },
      {
        questionId: 'q4',
        topicTag: 'English Language',
        pyqSource: 'SSC CGL 2023 Tier 1',
        questionText: 'Choose the correct idiom meaning for: "To burn the candle at both ends".',
        options: ['To waste money recklessly', 'To work extremely hard from early morning to late night', 'To be caught in a fire accident', 'To be double minded'],
        correctOption: 1,
        explanation: '"To burn the candle at both ends" means to exhaust oneself by working or staying awake excessively long hours.',
        difficulty: 'Easy',
      },
      {
        questionId: 'q5',
        topicTag: 'Quantitative Aptitude',
        pyqSource: 'SSC CGL 2024 Tier 1',
        questionText: 'Two pipes A and B can fill a cistern in 20 minutes and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the cistern?',
        options: ['12 minutes', '15 minutes', '10 minutes', '18 minutes'],
        correctOption: 0,
        explanation: 'Combined rate in 1 min = 1/20 + 1/30 = (3 + 2)/60 = 5/60 = 1/12. Therefore, both pipes fill the cistern in 12 minutes.',
        difficulty: 'Medium',
      },
    ],
  },
  {
    testId: 'test_tcs_nqt_1',
    title: 'TCS NQT 2026 Cognitive & Tech Prep Test',
    category: 'it',
    targetName: 'TCS NQT',
    topics: ['Numerical Ability', 'Programming Logic', 'Coding & DSA', 'Reasoning Ability'],
    durationMinutes: 15,
    totalQuestions: 5,
    createdAt: '2026-07-29',
    questions: [
      {
        questionId: 'tq1',
        topicTag: 'Programming Logic',
        pyqSource: 'TCS NQT 2024 Shift 1',
        questionText: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST) with N nodes?',
        options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
        correctOption: 1,
        explanation: 'In a balanced Binary Search Tree, the height of the tree is log₂N. Since each step halves the remaining search space, the time complexity is O(log N).',
        difficulty: 'Easy',
      },
      {
        questionId: 'tq2',
        topicTag: 'Numerical Ability',
        pyqSource: 'TCS NQT 2024',
        questionText: 'The average weight of 8 persons increases by 2.5 kg when a new person comes in place of one of them weighing 65 kg. What is the weight of the new person?',
        options: ['85 kg', '80 kg', '75 kg', '90 kg'],
        correctOption: 0,
        explanation: 'Total weight increase = 8 × 2.5 = 20 kg. Weight of new person = Weight of replaced person + Total weight increase = 65 + 20 = 85 kg.',
        difficulty: 'Medium',
      },
      {
        questionId: 'tq3',
        topicTag: 'Programming Logic',
        pyqSource: 'TCS NQT 2023',
        questionText: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correctOption: 1,
        explanation: 'A Stack operates on a LIFO (Last-In, First-Out) mechanism where the last element inserted is the first one to be popped out.',
        difficulty: 'Easy',
      },
      {
        questionId: 'tq4',
        topicTag: 'Reasoning Ability',
        pyqSource: 'TCS NQT 2024',
        questionText: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
        options: ['127', '125', '120', '128'],
        correctOption: 0,
        explanation: 'Pattern: Each term is (Previous Term × 2) + 1. 3×2+1=7, 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1 = 127.',
        difficulty: 'Easy',
      },
      {
        questionId: 'tq5',
        topicTag: 'Coding & DSA',
        pyqSource: 'TCS NQT 2024 Ninja',
        questionText: 'Which HTTP method is idempotent and used to retrieve representation of a resource without side effects?',
        options: ['POST', 'GET', 'PUT', 'DELETE'],
        correctOption: 1,
        explanation: 'GET is a safe and idempotent HTTP method intended strictly for retrieving data without causing server state modifications.',
        difficulty: 'Easy',
      },
    ],
  },
];

// Helper to store & retrieve mock local state
const STORAGE_KEY_USER = 'prep_app_user';
const STORAGE_KEY_RESULTS = 'prep_app_results';
const STORAGE_KEY_RESUME = 'prep_app_resume';

export function getStoredUser(): UserProfile {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.email && parsed.email !== 'candidate@example.com' && parsed.email !== 'guest@crackit.ai') {
        return parsed;
      }
    } catch (e) {
      // fallback
    }
  }
  const defaultUser: UserProfile = {
    uid: '',
    email: '',
    displayName: '',
    role: 'user',
    isPro: false,
    trialStartDate: new Date().toISOString(),
    preferredGoals: ['SSC CGL', 'TCS NQT'],
    targetCategory: 'both',
    targetExamsOrCompanies: ['SSC CGL', 'TCS NQT'],
    weakTopics: [],
  };
  return defaultUser;
}

export function saveStoredUser(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
}

export function getStoredResults(): TestResult[] {
  const saved = localStorage.getItem(STORAGE_KEY_RESULTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function saveStoredResult(result: TestResult): void {
  const existing = getStoredResults();
  existing.unshift(result);
  localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(existing));
}

export function getStoredResume(): ResumeData | null {
  const saved = localStorage.getItem(STORAGE_KEY_RESUME);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function saveStoredResume(resume: ResumeData): void {
  localStorage.setItem(STORAGE_KEY_RESUME, JSON.stringify(resume));
}

// Optional Firebase Firestore Instance Export
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export let db: Firestore | null = null;
try {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyC-Zp86sEiQEiCv2S7LZujT3biCeu9n5EA",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0664117405.firebaseapp.com",
    projectId: env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0664117405",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0664117405.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "876701293448",
    appId: env.VITE_FIREBASE_APP_ID || "1:876701293448:web:ac76b8157841a82b23f83d",
  };
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (e) {
  console.warn("Firestore initialization fallback:", e);
  db = null;
}

