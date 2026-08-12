import { MockTest, Question, ResumeData } from '../types';

export async function generateAiMockTest(params: {
  category: 'govt' | 'it' | string;
  targetName: string;
  topics: string[];
  count?: number;
  difficulty?: string;
  userId?: string;
  completedTests?: any[];
  weakTopics?: string[];
}): Promise<MockTest> {
  try {
    const res = await fetch('/api/gemini/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        const generatedQuestions: Question[] = data.questions.map((q: any, index: number) => ({
          questionId: `gen_q_${Date.now()}_${index}`,
          topicTag: q.topicTag || params.topics[0] || 'General',
          pyqSource: q.pyqSource || `${params.targetName} PYQ Pattern`,
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption ?? 0,
          explanation: q.explanation,
          difficulty: q.difficulty || 'Medium',
        }));

        return {
          testId: `test_gen_${Date.now()}`,
          title: data.isFallback ? `${params.targetName} PYQ Pattern Test` : `AI Adaptive ${params.targetName} Test`,
          category: params.category,
          targetName: params.targetName,
          topics: params.topics,
          durationMinutes: Math.max(5, Math.ceil(generatedQuestions.length * 1.5)),
          totalQuestions: generatedQuestions.length,
          questions: generatedQuestions,
          createdAt: new Date().toISOString().split('T')[0],
          adaptiveInsights: data.adaptiveInsights || {
            overallAccuracy: 50,
            highProficiencyTopics: [],
            weakTopicsFocus: params.weakTopics || [],
            zeroRepetitionCount: params.completedTests?.length || 0,
            strategyNote: 'AI Adaptive Engine Active',
          },
        };
      }
    }
  } catch (err) {
    console.warn('Network or API response error during AI test generation:', err);
  }

  // Client-side safety fallback if server or fetch fails
  const fallbackCount = params.count || 5;
  const fallbackQuestions: Question[] = [];
  const topicsList = params.topics.length > 0 ? params.topics : ['Core Aptitude', 'Domain Knowledge'];

  for (let i = 0; i < fallbackCount; i++) {
    const topic = topicsList[i % topicsList.length];
    if (params.category === 'it') {
      fallbackQuestions.push({
        questionId: `gen_q_fb_${Date.now()}_${i}`,
        topicTag: topic,
        pyqSource: `${params.targetName} Corporate Interview Pattern`,
        questionText: `[${params.targetName} Focus Q${i + 1}] Which data structure provides average O(1) time complexity for insert, delete, and lookup operations?`,
        options: ['Binary Search Tree', 'Hash Table / HashMap', 'Doubly Linked List', 'Min-Heap'],
        correctOption: 1,
        explanation: 'Hash Tables use a hash function to map keys to bucket indices, providing average constant O(1) time complexity.',
        difficulty: 'Medium',
      });
    } else {
      fallbackQuestions.push({
        questionId: `gen_q_fb_${Date.now()}_${i}`,
        topicTag: topic,
        pyqSource: `${params.targetName} Official PYQ`,
        questionText: `[${params.targetName} Practice Q${i + 1}] A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train in metres?`,
        options: ['120 metres', '150 metres', '180 metres', '320 metres'],
        correctOption: 1,
        explanation: 'Speed = 60 * (5/18) = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 metres.',
        difficulty: 'Medium',
      });
    }
  }

  return {
    testId: `test_gen_${Date.now()}`,
    title: `${params.targetName} PYQ Practice Test`,
    category: params.category,
    targetName: params.targetName,
    topics: params.topics,
    durationMinutes: Math.max(5, Math.ceil(fallbackQuestions.length * 1.5)),
    totalQuestions: fallbackQuestions.length,
    questions: fallbackQuestions,
    createdAt: new Date().toISOString().split('T')[0],
  };
}

export async function explainQuestionAi(params: {
  questionText: string;
  options: string[];
  correctOption: number;
  userSelectedOption?: number;
  explanation: string;
  userQuery?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/explain-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate explanation');
  }

  return data.text;
}

export async function sendMultimodalChatMessageAi(params: {
  message: string;
  attachments?: Array<{
    name: string;
    mimeType: string;
    base64Data: string;
  }>;
  contextPrompt?: string;
}): Promise<string> {
  const res = await fetch('/api/gemini/multimodal-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to get AI response');
  }

  return data.text;
}

export async function analyzeWeaknessAi(params: {
  targetName: string;
  score: number;
  totalQuestions: number;
  incorrectQuestions: Array<{
    questionText: string;
    topicTag: string;
    userChoice: string;
    correctAnswer: string;
  }>;
}): Promise<{ weakTopics: string[]; actionPlan: string[]; motivationalQuote: string }> {
  const res = await fetch('/api/gemini/analyze-weakness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    return {
      weakTopics: params.incorrectQuestions.map((q) => q.topicTag),
      actionPlan: [
        'Review basic fundamentals for missed topics.',
        'Solve at least 20 PYQ problems daily on weak areas.',
        'Take a mock test every 3 days to measure speed and accuracy.',
      ],
      motivationalQuote: 'Consistency is the key to unlocking extraordinary rank achievements!',
    };
  }

  return data.analysis;
}

export async function extractSyllabusAi(params: {
  documentText: string;
  sourceUrl?: string;
}): Promise<{
  title: string;
  category: 'govt' | 'it';
  targetRoleOrDept?: string;
  topics: string[];
  subtopics?: string[];
  examPatternSummary: string;
  totalSections?: number;
  recommendedStudyDays?: number;
}> {
  const res = await fetch('/api/gemini/syllabus-parser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to parse syllabus');
  }

  return data.syllabus;
}

export async function analyzeResumeAi(params: {
  targetRole: string;
  rawResumeText?: string;
  fullName?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
}): Promise<{
  atsScore: number;
  scoreLabel: string;
  summary: string;
  missingKeywords: string[];
  formattingFixes: string[];
  actionableSuggestions: string[];
  optimizedResumeText: string;
}> {
  const res = await fetch('/api/gemini/resume-analyzer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to analyze resume');
  }

  return data.analysis;
}

export async function generateResumeAi(params: {
  fullName: string;
  targetRole: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
}): Promise<string> {
  const res = await fetch('/api/gemini/generate-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate resume');
  }

  return data.resumeText;
}

export async function initiatePhonePePayment(uid: string, amount: number = 299, paymentMethod: string = 'qr', vpa?: string) {
  const res = await fetch('/api/phonepe/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, amount, paymentMethod, vpa }),
  });
  const data = await res.json();
  return data;
}

export async function verifyPhonePePayment(uid: string, txnAmount: number): Promise<boolean> {
  const res = await fetch('/api/payment/phonepe/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid,
      transactionId: `PPE_PAY_${Date.now()}`,
      amount: txnAmount,
      status: 'SUCCESS',
    }),
  });

  const data = await res.json();
  return data.success === true;
}
