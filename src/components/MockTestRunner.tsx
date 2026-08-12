import React, { useState, useEffect, useRef } from 'react';
import { MockTest, Question, TestResult, UserProfile } from '../types';
import { generateAiMockTest, analyzeWeaknessAi } from '../services/api';
import { ExplainThisChatbot } from './ExplainThisChatbot';
import { LiveCodingEditor } from './LiveCodingEditor';
import { getStoredResults, getStoredUser } from '../services/firebaseConfig';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  Bot,
  Award,
  ChevronDown,
  Landmark,
  Building2,
  GraduationCap,
  Check,
  Layers,
  Filter,
  Target,
  Bookmark,
  BookmarkCheck,
  CheckSquare,
  ShieldAlert,
  Zap,
  RotateCcw,
  Plus,
  X,
  SlidersHorizontal,
  BrainCircuit,
  BarChart3,
  TrendingUp,
  History,
  Code2,
} from 'lucide-react';

interface MockTestRunnerProps {
  initialTest?: MockTest | null;
  userCategory?: string;
  userTargetExams?: string[];
  user?: UserProfile;
  testResults?: TestResult[];
  onFinishTest?: (result: TestResult) => void;
  onCompleteTest?: (result: TestResult) => void;
}

export const MockTestRunner: React.FC<MockTestRunnerProps> = ({
  initialTest,
  userCategory,
  userTargetExams = ['SSC CGL', 'TCS NQT'],
  user: propUser,
  testResults: propResults,
  onFinishTest,
  onCompleteTest,
}) => {
  // Resolved User & Past Results Context
  const currentUser = propUser || getStoredUser();
  const pastResults = propResults && propResults.length > 0 ? propResults : getStoredResults();

  // Primary Test Engine State
  const [currentTest, setCurrentTest] = useState<MockTest | null>(initialTest || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'standard' | 'coding'>('standard');

  // Custom Test Configuration Controls
  const [targetNameInput, setTargetNameInput] = useState<string>(
    userTargetExams[0] || currentUser?.targetExamsOrCompanies?.[0] || 'SSC CGL'
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Quantitative Aptitude',
    'Indian Polity & Constitution',
    'Programming Logic',
    'General Intelligence & Reasoning',
  ]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficultyMode, setDifficultyMode] = useState<string>('Adaptive'); // Adaptive | Easy | Medium | Hard

  // Target Dropdown Controls
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Categorized Target Options
  const EXAM_OPTIONS = [
    {
      category: 'Railway Recruitment Board (RRB)',
      icon: Landmark,
      color: 'text-sky-400',
      items: [
        { name: 'RRB NTPC', detail: 'Non-Technical Popular Categories (Station Master, Goods Guard)' },
        { name: 'RRB ALP', detail: 'Assistant Loco Pilot & Technician CBT 1 & 2' },
        { name: 'RRB Group D', detail: 'Track Maintainer Grade IV & Level 1 Posts' },
        { name: 'RRB JE', detail: 'Junior Engineer Technical Cadres' },
      ],
    },
    {
      category: 'Teaching & Academia Exams',
      icon: GraduationCap,
      color: 'text-emerald-400',
      items: [
        { name: 'CTET', detail: 'Central Teacher Eligibility Test (Paper I & II)' },
        { name: 'TET (State Eligibility)', detail: 'State Eligibility Test for School Teachers' },
        { name: 'State DSC / TRT', detail: 'District Selection Committee / Teacher Recruitment' },
      ],
    },
    {
      category: 'Core Govt & Banking Exams',
      icon: Landmark,
      color: 'text-amber-400',
      items: [
        { name: 'SSC CGL', detail: 'Combined Graduate Level Tier 1 & 2' },
        { name: 'SSC CHSL', detail: 'Combined Higher Secondary Level (10+2)' },
        { name: 'UPSC Civil Services', detail: 'IAS, IPS, IFS Prelims & CSAT' },
        { name: 'IBPS PO', detail: 'Bank Probationary Officer Prelims & Mains' },
        { name: 'SBI Clerk', detail: 'Junior Associate Prelims & Mains' },
      ],
    },
    {
      category: 'Corporate & IT Sector Drives',
      icon: Building2,
      color: 'text-purple-400',
      items: [
        { name: 'TCS NQT', detail: 'National Qualifier Test Tech & Cognitive' },
        { name: 'Infosys Drives', detail: 'System Engineer & Specialist Programmer' },
        { name: 'Amazon SDE', detail: 'Software Development Engineer Online Assessment' },
        { name: 'Wipro NLTH', detail: 'National Level Talent Hunt Freshers' },
      ],
    },
  ];

  // Pre-configured Topic Categories
  const TOPIC_CATEGORIES = [
    {
      label: 'Railway & Govt Sciences',
      topics: ['General Physics & Chem', 'Mathematics & Mental Ability', 'General Intelligence & Reasoning', 'Current Affairs & GK'],
    },
    {
      label: 'Teaching & Pedagogy',
      topics: ['Child Development & Pedagogy', 'Language Pedagogy', 'Perspectives in Education', 'EVS & Methodology'],
    },
    {
      label: 'Govt Core & Aptitude',
      topics: ['Quantitative Aptitude', 'Indian Polity & Constitution', 'Indian Economy', 'English Comprehension'],
    },
    {
      label: 'IT & Technical Engineering',
      topics: ['Programming Logic', 'Data Structures & Algorithms', 'DBMS & SQL', 'System Design'],
    },
  ];

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Test Running State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1200);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isAnalyzingWeakness, setIsAnalyzingWeakness] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect' | 'marked'>('all');

  // AI Doubt Chatbot Panel State
  const [activeDoubtQuestion, setActiveDoubtQuestion] = useState<Question | null>(null);
  const [isDoubtPanelOpen, setIsDoubtPanelOpen] = useState(false);

  // Sync initialTest changes
  useEffect(() => {
    if (initialTest) {
      setCurrentTest(initialTest);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setMarkedQuestions({});
      setTimeLeftSeconds((initialTest.durationMinutes || 15) * 60);
      setIsTestSubmitted(false);
      setTestResult(null);
    }
  }, [initialTest]);

  // Countdown Timer
  useEffect(() => {
    if (!currentTest || isTestSubmitted) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTest, isTestSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicInput.trim();
    if (trimmed && !selectedTopics.includes(trimmed)) {
      setSelectedTopics([...selectedTopics, trimmed]);
      setCustomTopicInput('');
    }
  };

  // -----------------------------------------------------------------
  // GENERATE AI MOCK TEST (WITH ZERO REPETITION & ADAPTIVE SCALING)
  // -----------------------------------------------------------------
  const handleGenerateCustomAiTest = async () => {
    setIsGenerating(true);
    try {
      // Gather completed tests and weak topics from past user history
      const completedTestsPayload = pastResults.map((r) => ({
        testId: r.testId,
        testTitle: r.testTitle,
        score: r.score,
        totalQuestions: r.totalQuestions,
        userAnswers: r.userAnswers,
        questions: r.questions || [],
      }));

      const activeCategory =
        userCategory ||
        (targetNameInput.includes('TCS') ||
        targetNameInput.includes('Infosys') ||
        targetNameInput.includes('Amazon') ||
        targetNameInput.includes('Developer') ||
        targetNameInput.includes('Wipro')
          ? 'it'
          : 'govt');

      const generatedTest = await generateAiMockTest({
        category: activeCategory,
        targetName: targetNameInput,
        topics: selectedTopics,
        count: questionCount,
        difficulty: difficultyMode,
        userId: currentUser?.uid,
        completedTests: completedTestsPayload,
        weakTopics: currentUser?.weakTopics || [],
      });

      setCurrentTest(generatedTest);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setMarkedQuestions({});
      setTimeLeftSeconds(generatedTest.durationMinutes * 60);
      setIsTestSubmitted(false);
      setTestResult(null);
    } catch (err) {
      console.error('Error generating AI mock test:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isTestSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleToggleMarkForReview = (questionId: string) => {
    setMarkedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // -----------------------------------------------------------------
  // SUBMIT TEST & ANALYZE PERFORMANCE
  // -----------------------------------------------------------------
  const handleSubmitTest = async () => {
    if (!currentTest || isTestSubmitted) return;

    setIsTestSubmitted(true);
    let correctCount = 0;
    let incorrectCount = 0;
    const totalQ = currentTest.questions.length;
    const incorrectList: Array<{ questionText: string; topicTag: string; userChoice: string; correctAnswer: string }> = [];

    currentTest.questions.forEach((q) => {
      const userChoice = userAnswers[q.questionId];
      if (userChoice === q.correctOption) {
        correctCount++;
      } else if (userChoice !== undefined) {
        incorrectCount++;
        incorrectList.push({
          questionText: q.questionText,
          topicTag: q.topicTag,
          userChoice: q.options[userChoice] || 'Option ' + (userChoice + 1),
          correctAnswer: q.options[q.correctOption] || 'Option ' + (q.correctOption + 1),
        });
      }
    });

    const unattemptedCount = totalQ - (correctCount + incorrectCount);

    const initialResult: TestResult = {
      resultId: `res_${Date.now()}`,
      testId: currentTest.testId,
      testTitle: currentTest.title,
      uid: currentUser?.uid || 'user_active',
      score: correctCount,
      totalQuestions: totalQ,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSeconds: currentTest.durationMinutes * 60 - timeLeftSeconds,
      userAnswers,
      weakTopics: [],
      aiFeedback: 'Analyzing weak topic patterns & generating 3-step action plan via Gemini...',
      timestamp: new Date().toISOString(),
      questions: currentTest.questions,
    };

    setTestResult(initialResult);
    setIsAnalyzingWeakness(true);

    try {
      const weaknessAnalysis = await analyzeWeaknessAi({
        targetName: currentTest.targetName,
        score: correctCount,
        totalQuestions: totalQ,
        incorrectQuestions: incorrectList,
      });

      const finalFeedback = `${weaknessAnalysis.actionPlan.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}\n\n💡 Motivation: "${weaknessAnalysis.motivationalQuote}"`;

      const finalResult: TestResult = {
        ...initialResult,
        weakTopics: weaknessAnalysis.weakTopics,
        aiFeedback: finalFeedback,
      };

      setTestResult(finalResult);

      if (onFinishTest) onFinishTest(finalResult);
      if (onCompleteTest) onCompleteTest(finalResult);
    } catch (err) {
      console.error('Error analyzing weakness:', err);
    } finally {
      setIsAnalyzingWeakness(false);
    }
  };

  const handleOpenDoubtBot = (question: Question) => {
    setActiveDoubtQuestion(question);
    setIsDoubtPanelOpen(true);
  };

  // Compute total questions answered across history for display in zero repetition badge
  const totalPastQuestionsCount = pastResults.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

  // =================================================================
  // 1. GENERATOR VIEW (When no active test is loaded)
  // =================================================================
  if (!currentTest) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Category Mode Switcher: Govt/General AI Mock Tests vs IT Jobs / Coding Drives */}
        <div className="glass-panel p-2 rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 shadow-xl">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveCategoryTab('standard')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeCategoryTab === 'standard'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              <span>Standard AI Mock Tests</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('coding')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeCategoryTab === 'coding'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>IT Jobs / Coding Drives (Live Coding)</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/60 border border-white/10 text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select mode to start practice</span>
          </div>
        </div>

        {/* Render Live Coding split pane if coding mode selected */}
        {activeCategoryTab === 'coding' ? (
          <LiveCodingEditor />
        ) : (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-sky-500/30 bg-slate-950/90 shadow-2xl relative overflow-hidden">
            {/* Subtle HARSHA'S Ambient Lights */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4 relative z-10 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-purple-500/20 border border-sky-500/30 text-sky-300 shadow-lg shadow-sky-500/10">
                <BrainCircuit className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Adaptive AI Mock Test Generator</h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                    HARSHA'S Studio
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Powered by <span className="text-sky-300 font-bold">Zero-Repetition History Engine</span> & <span className="text-amber-300 font-bold">Step-Wise Adaptive Complexity Scaling</span>. Guarantees 100% fresh questions calibrated to your accuracy.
                </p>
              </div>
            </div>

            {/* Zero Repetition Engine Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Zero Repetition Engine Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            {/* Left 5 Cols: Target Exam / Role Selector & Parameters */}
            <div className="lg:col-span-5 space-y-5">
              {/* Target Exam Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-sky-400" /> Target Examination / Drive
                  </span>
                  <span className="text-[10px] text-sky-400 font-semibold">custom selector</span>
                </label>

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full p-3.5 rounded-2xl text-left flex items-center justify-between gap-3 border transition-all ${
                      isDropdownOpen
                        ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.25)] bg-slate-900/95'
                        : 'border-white/12 hover:border-white/25 bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{targetNameInput}</span>
                        <span className="text-[10px] text-slate-400 block truncate">Click to select exam track</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isDropdownOpen ? 'rotate-180 text-sky-400' : ''
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl glass-panel border border-sky-500/30 bg-slate-950/95 shadow-2xl p-2 space-y-3 max-h-80 overflow-y-auto custom-scrollbar animate-fadeIn">
                      {EXAM_OPTIONS.map((group, groupIdx) => {
                        const IconComponent = group.icon;
                        return (
                          <div key={groupIdx} className="space-y-1">
                            <div className="px-3 py-1.5 flex items-center gap-2 border-b border-white/5">
                              <IconComponent className={`w-3.5 h-3.5 ${group.color}`} />
                              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                                {group.category}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              {group.items.map((item) => {
                                const isSelected = targetNameInput === item.name;
                                return (
                                  <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => {
                                      setTargetNameInput(item.name);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 transition-all text-xs ${
                                      isSelected
                                        ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-400/50 shadow-md'
                                        : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                                    }`}
                                  >
                                    <div>
                                      <div className="font-bold flex items-center gap-1.5">
                                        <span>{item.name}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-normal">{item.detail}</p>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Manual Target Entry Option */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={targetNameInput}
                    onChange={(e) => setTargetNameInput(e.target.value)}
                    placeholder="Or type custom exam name (e.g. UPSC CSAT, ISRO Scientist)..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Question Count Controls */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" /> Question Count
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                        questionCount === num
                          ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Baseline Difficulty Mode Controls */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Complexity Engine Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Adaptive', label: '⚡ Adaptive AI', desc: 'Auto-adjusts per subject' },
                    { id: 'Easy', label: '🟢 Easy', desc: 'Foundational concept practice' },
                    { id: 'Medium', label: '🟡 Medium', desc: 'Standard exam difficulty' },
                    { id: 'Hard', label: '🔴 Hard / PYQ', desc: 'Advanced tricky traps' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDifficultyMode(mode.id)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        difficultyMode === mode.id
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                      }`}
                    >
                      <span className="block text-xs font-extrabold">{mode.label}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* History Statistics Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-sky-400" /> Previously Logged Tests:
                  </span>
                  <span className="font-extrabold text-white">{pastResults.length} attempts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Unique Questions Screened:
                  </span>
                  <span className="font-extrabold text-emerald-400">{totalPastQuestionsCount} questions</span>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Focus Area Chips & Custom Topic Creator */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-purple-400" /> Select Focus Subjects ({selectedTopics.length})
                </label>
                <span className="text-[11px] text-purple-300 font-semibold">multi-select toggles</span>
              </div>

              <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                {TOPIC_CATEGORIES.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cat.label}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.topics.map((t) => {
                        const active = selectedTopics.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              if (active) setSelectedTopics(selectedTopics.filter((x) => x !== t));
                              else setSelectedTopics([...selectedTopics, t]);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              active
                                ? 'bg-sky-500/20 text-sky-200 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                                : 'bg-slate-950/70 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom Topic Tag Creator */}
                <form onSubmit={handleAddCustomTopic} className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="Add custom topic (e.g. DBMS Normalization, Percentages)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/50 text-purple-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>

                {/* Active Selected Topics Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTopics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-500/40 text-[10px] font-bold flex items-center gap-1.5"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setSelectedTopics(selectedTopics.filter((x) => x !== t))}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Generation CTA Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Questions generated via Gemini 3.6 Flash with strict zero-repetition filter.</span>
            </div>

            <button
              onClick={handleGenerateCustomAiTest}
              disabled={isGenerating || selectedTopics.length === 0}
              className="w-full sm:w-auto glass-button-primary px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-2xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating Adaptive Test Paper...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Test Paper ({questionCount} Qs)</span>
                </>
              )}
            </button>
          </div>
        </div>
        )}
      </div>
    );
  }

  // =================================================================
  // 2. ACTIVE TEST EXECUTION VIEW
  // =================================================================
  const currentQ = currentTest.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = Object.values(markedQuestions).filter(Boolean).length;
  const unansweredCount = currentTest.questions.length - answeredCount;
  const isCurrentMarked = !!markedQuestions[currentQ?.questionId];

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Sticky Top Header with Live Countdown Timer & Exam Actions */}
      <div className="sticky top-0 z-40 glass-panel p-4 rounded-3xl border border-sky-500/30 bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
            {(currentTest.category || 'GOVT').toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
                {currentTest.targetName}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] text-slate-300 font-bold">
                {answeredCount} / {currentTest.questions.length} Answered
              </span>
            </div>
            <h2 className="text-sm font-bold text-white truncate max-w-md">{currentTest.title}</h2>
          </div>
        </div>

        {/* Live Countdown & Controls */}
        <div className="flex items-center gap-3">
          {!isTestSubmitted ? (
            <>
              {/* Countdown Timer Badge */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black tracking-wider shadow-lg ${
                  timeLeftSeconds < 180
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20 animate-pulse'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-sky-500/10'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-400" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>

              {/* Submit Test Button */}
              <button
                onClick={handleSubmitTest}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 text-white font-bold text-xs shadow-xl hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Submit Exam</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Evaluated
              </span>
              <button
                onClick={() => setCurrentTest(null)}
                className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Test</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Adaptive Insights Intelligence Banner */}
      {currentTest.adaptiveInsights && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-white block">
                {currentTest.adaptiveInsights.strategyNote}
              </span>
              <span className="text-[11px] text-slate-300">
                Guaranteed zero repetition • {currentTest.adaptiveInsights.zeroRepetitionCount} past questions excluded
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
              History Accuracy: {currentTest.adaptiveInsights.overallAccuracy}%
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Active Question & Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Active Question Card */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-white/10 bg-slate-950/90 shadow-2xl relative overflow-hidden">
            {/* Header Tags & AI Tutor Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 text-xs font-extrabold bg-sky-500/20 text-sky-300 rounded-xl border border-sky-500/30">
                  Q {currentQuestionIndex + 1} of {currentTest.questions.length}
                </span>
                <span className="text-xs text-slate-300 font-semibold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {currentQ?.topicTag || 'General'}
                </span>
                {currentQ?.difficulty && (
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border ${
                      currentQ.difficulty === 'Hard'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : currentQ.difficulty === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                )}
                {currentQ?.pyqSource && (
                  <span className="text-[10px] px-2.5 py-0.5 bg-purple-950/80 text-purple-300 rounded-lg border border-purple-500/30 font-semibold">
                    {currentQ.pyqSource}
                  </span>
                )}
              </div>

              {/* Explain This AI Doubt Solver Button */}
              {currentQ && (
                <button
                  onClick={() => handleOpenDoubtBot(currentQ)}
                  className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-sky-600/40 hover:from-purple-600/60 hover:to-sky-600/60 text-white border border-purple-400/40 text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-300" />
                  <span>Explain This (AI Tutor)</span>
                </button>
              )}
            </div>

            {/* Question Text */}
            {currentQ && (
              <div className="space-y-2 relative z-10">
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.questionText}
                </h3>
              </div>
            )}

            {/* Answer Options */}
            {currentQ && (
              <div className="space-y-3 relative z-10">
                {currentQ.options.map((opt, optIndex) => {
                  const isSelected = userAnswers[currentQ.questionId] === optIndex;
                  let optionStyle =
                    'glass-card border-white/10 text-slate-200 hover:border-sky-400/70 hover:bg-slate-900/90 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]';

                  if (isTestSubmitted) {
                    if (optIndex === currentQ.correctOption) {
                      optionStyle =
                        'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.25)] font-bold';
                    } else if (isSelected && optIndex !== currentQ.correctOption) {
                      optionStyle =
                        'bg-rose-500/20 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.25)] font-bold';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] font-bold';
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => handleSelectOption(currentQ.questionId, optIndex)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-md'
                              : 'bg-slate-900 text-slate-300 border border-white/10'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{opt}</span>
                      </div>

                      {isTestSubmitted && optIndex === currentQ.correctOption && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isTestSubmitted && isSelected && optIndex !== currentQ.correctOption && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Post-submission Explanation */}
            {isTestSubmitted && currentQ && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-2 relative z-10 animate-fadeIn">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Step-by-Step Concept & Formula
                  </span>
                  <button
                    onClick={() => handleOpenDoubtBot(currentQ)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Ask AI Tutor <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Navigation & Mark Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {!isTestSubmitted && currentQ && (
                  <button
                    onClick={() => handleToggleMarkForReview(currentQ.questionId)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrentMarked
                        ? 'bg-purple-500/25 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-900 text-slate-400 border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                    }`}
                  >
                    {isCurrentMarked ? <BookmarkCheck className="w-4 h-4 text-purple-400" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isCurrentMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(currentTest.questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === currentTest.questions.length - 1}
                className="px-5 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 text-xs font-bold disabled:opacity-30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Navigator Palette & Score Results */}
        <div className="lg:col-span-4 space-y-6">
          {/* Question Navigator Palette */}
          <div className="glass-panel p-5 rounded-3xl space-y-4 border border-white/10 bg-slate-950/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-400" /> Question Palette
              </h4>
              <span className="text-[10px] text-slate-300 font-bold">
                {answeredCount}/{currentTest.questions.length} Answered
              </span>
            </div>

            {/* Status Legend Badges */}
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center font-bold">
                <span className="block text-xs font-black">{answeredCount}</span>
                Answered
              </div>
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-center font-bold">
                <span className="block text-xs font-black">{markedCount}</span>
                Marked
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 text-center font-bold">
                <span className="block text-xs font-black">{unansweredCount}</span>
                Unanswered
              </div>
            </div>

            {/* Navigator Number Grid */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {currentTest.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.questionId] !== undefined;
                const isMarked = !!markedQuestions[q.questionId];
                const isCurrent = idx === currentQuestionIndex;

                let btnBg = 'bg-slate-900 text-slate-400 border-white/10';

                if (isTestSubmitted) {
                  const userAns = userAnswers[q.questionId];
                  if (userAns === q.correctOption) {
                    btnBg = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 shadow-md';
                  } else if (userAns !== undefined) {
                    btnBg = 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-md';
                  }
                } else if (isMarked) {
                  btnBg = 'bg-purple-500/30 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]';
                } else if (isAnswered) {
                  btnBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
                }

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-extrabold border transition-all relative flex items-center justify-center cursor-pointer ${btnBg} ${
                      isCurrent ? 'ring-2 ring-sky-400 scale-105 shadow-lg' : 'hover:scale-102'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && !isTestSubmitted && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 border border-slate-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Score Evaluation & Weakness Analysis Card */}
          {testResult && (
            <div className="glass-panel p-5 rounded-3xl space-y-4 border border-sky-400/40 bg-slate-950/95 shadow-2xl animate-fadeIn">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-2xl bg-sky-500/20 border border-sky-500/30 text-sky-400 mb-1">
                  <Award className="w-7 h-7 text-sky-400" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Score: {testResult.score} / {testResult.totalQuestions}
                </h3>
                <p className="text-xs text-slate-300 font-bold">
                  Accuracy: {Math.round((testResult.score / testResult.totalQuestions) * 100)}%
                </p>
              </div>

              {isAnalyzingWeakness ? (
                <div className="flex items-center justify-center p-4 gap-2 text-xs text-sky-400 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing weakness topics via Gemini...</span>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-white/10 text-xs text-slate-300">
                  {testResult.weakTopics.length > 0 && (
                    <div>
                      <span className="font-bold text-white block mb-1.5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Identified Focus Areas
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {testResult.weakTopics.map((wt, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                          >
                            {wt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/10 space-y-1">
                    <span className="font-bold text-sky-300 block text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Adaptive Action Plan
                    </span>
                    <p className="whitespace-pre-wrap text-[11px] text-slate-300 leading-relaxed">
                      {testResult.aiFeedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Doubt Chatbot Side Panel */}
      <ExplainThisChatbot
        question={activeDoubtQuestion}
        userSelectedOption={activeDoubtQuestion ? userAnswers[activeDoubtQuestion.questionId] : undefined}
        isOpen={isDoubtPanelOpen}
        onClose={() => setIsDoubtPanelOpen(false)}
      />
    </div>
  );
};
