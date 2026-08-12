export type UserRole = 'free' | 'pro' | 'trial' | 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  isPro?: boolean;
  proExpiryDate?: string;
  selectedPlan?: '3months' | '6months' | string;
  utrNumber?: string;
  trialStartDate: string;
  subscriptionExpiry?: string;
  preferredGoals: string[];
  targetCategory: 'govt' | 'railway' | 'teaching' | 'it' | 'both' | 'all' | string;
  targetExamsOrCompanies: string[];
  weakTopics: string[];
}

export interface Question {
  questionId: string;
  topicTag: string;
  pyqSource?: string; // e.g. "SSC CGL 2023 Tier 1" or "TCS NQT 2024"
  questionText: string;
  options: string[];
  correctOption: number; // 0, 1, 2, 3
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface AdaptiveInsights {
  overallAccuracy: number;
  highProficiencyTopics: string[];
  weakTopicsFocus: string[];
  zeroRepetitionCount: number;
  strategyNote: string;
}

export interface MockTest {
  testId: string;
  title: string;
  category: 'govt' | 'railway' | 'teaching' | 'it' | 'both' | 'all' | string;
  targetName: string; // e.g., "UPSC CSE", "TCS NQT", "SSC CGL", "RRB NTPC", "CTET"
  topics: string[];
  durationMinutes: number;
  totalQuestions: number;
  questions: Question[];
  createdAt: string;
  adaptiveInsights?: AdaptiveInsights;
}

export interface TestResult {
  resultId: string;
  testId: string;
  testTitle: string;
  uid: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  weakTopics: string[];
  aiFeedback: string;
  timestamp: string;
  questions?: Question[];
}

export interface JobAlert {
  jobId: string;
  title: string;
  companyOrDept: string;
  category: 'govt' | 'railway' | 'teaching' | 'it' | 'both' | 'all' | string;
  location: string;
  salaryOrGrade: string;
  syllabusTags: string[];
  deadline: string;
  applyUrl: string;
  matchedPercent: number;
  active: boolean;
  createdAt: string;
}

export interface ResumeData {
  resumeId: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  githubUrl?: string;
  linkedinUrl?: string;
  summary: string;
  targetRole: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    score: string;
  }[];
  projects: {
    name: string;
    description: string;
    techStack: string[];
  }[];
  generatedAtsText: string;
  templateStyle: 'minimal_ios' | 'modern_ats' | 'executive';
  lastUpdated: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'doc' | 'audio';
  mimeType: string;
  base64Data: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}
