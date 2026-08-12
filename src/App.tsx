import React, { useState, useEffect, lazy, Suspense } from 'react';
import { UserProfile, JobAlert, MockTest, TestResult } from './types';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import {
  INITIAL_JOB_ALERTS,
  INITIAL_MOCK_TESTS,
  getStoredResults,
  saveStoredResult,
} from './services/firebaseConfig';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Bot, Loader2 } from 'lucide-react';

// Dynamic lazy imports for heavy features & modals
const GoalTracks = lazy(() => import('./components/GoalTracks').then((m) => ({ default: m.GoalTracks })));
const MockTestRunner = lazy(() => import('./components/MockTestRunner').then((m) => ({ default: m.MockTestRunner })));
const JobAlertsView = lazy(() => import('./components/JobAlertsView').then((m) => ({ default: m.JobAlertsView })));
const ResumeBuilder = lazy(() => import('./components/ResumeBuilder').then((m) => ({ default: m.ResumeBuilder })));
const UserProfileDashboard = lazy(() => import('./components/UserProfileDashboard').then((m) => ({ default: m.UserProfileDashboard })));
const PhonePeModal = lazy(() => import('./components/PhonePeModal').then((m) => ({ default: m.PhonePeModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const ExplainThisChatbot = lazy(() => import('./components/ExplainThisChatbot').then((m) => ({ default: m.ExplainThisChatbot })));
const HelpDeskModal = lazy(() => import('./components/HelpDeskModal').then((m) => ({ default: m.HelpDeskModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const LiveCodingEditor = lazy(() => import('./components/LiveCodingEditor').then((m) => ({ default: m.LiveCodingEditor })));
const SmartRevisionEngine = lazy(() => import('./components/SmartRevisionEngine').then((m) => ({ default: m.SmartRevisionEngine })));
const CurrentAffairsFeed = lazy(() => import('./components/CurrentAffairsFeed').then((m) => ({ default: m.CurrentAffairsFeed })));
const StaticGKModule = lazy(() => import('./components/StaticGKModule').then((m) => ({ default: m.StaticGKModule })));
const PYQPortal = lazy(() => import('./components/PYQPortal').then((m) => ({ default: m.PYQPortal })));

// Sleek fallback loading component
const PageLoadingFallback = () => (
  <div className="w-full min-h-[400px] flex flex-col items-center justify-center space-y-4 p-8 glass-card rounded-3xl border border-white/10 my-6 animate-pulse">
    <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white shadow-xl">
      <Loader2 className="w-6 h-6 animate-spin text-white" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-xs font-bold text-white tracking-wide">Loading Module...</p>
      <p className="text-[11px] text-slate-400">HARSHA'S Studio High-Performance Engine</p>
    </div>
  </div>
);

export default function App() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>(INITIAL_JOB_ALERTS);
  const [mockTests, setMockTests] = useState<MockTest[]>(INITIAL_MOCK_TESTS);
  const [testResults, setTestResults] = useState<TestResult[]>(getStoredResults());

  // Currently active mock test for execution
  const [activeTestToRun, setActiveTestToRun] = useState<MockTest | null>(null);

  // Modals state
  const [isPhonePeOpen, setIsPhonePeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGlobalChatbotOpen, setIsGlobalChatbotOpen] = useState(false);
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);

  useEffect(() => {
    // Auto-check 1-week Free Trial expiration logic for non-pro users
    if (user.email && user.role !== 'pro' && user.role !== 'admin' && user.trialStartDate) {
      const trialStart = new Date(user.trialStartDate).getTime();
      const now = Date.now();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (now - trialStart > sevenDaysMs) {
        setIsPhonePeOpen(true);
      }
    }
  }, [user]);

  // Security check for Admin route
  useEffect(() => {
    if (activeTab === 'admin') {
      const isAdminEmail = user.email?.toLowerCase() === 'harshavardhantalari6@gmail.com';
      if (!isAdminEmail) {
        console.warn('Unauthorized admin access attempt redirected to dashboard');
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, user.email]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        <div className="harshas-studio-bg" />
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 p-0.5 shadow-2xl mb-4 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        </div>
        <p className="text-sm font-bold tracking-wide">Authenticating Aspirant Session...</p>
        <p className="text-xs text-slate-400 mt-1">CrackIt AI • HARSHA'S Studio</p>
      </div>
    );
  }

  // Strict initial screen: if user is not logged in via Google Auth, render Login screen
  if (!user || !user.email) {
    return <Login onSuccessLogin={() => setActiveTab('dashboard')} />;
  }

  const handleUpdateUserGoals = (category: 'govt' | 'it' | 'both', selectedExams: string[]) => {
    const updatedUser: UserProfile = {
      ...user,
      targetCategory: category,
      targetExamsOrCompanies: selectedExams,
    };
    updateUser(updatedUser);
  };

  const handleFinishTest = (result: TestResult) => {
    saveStoredResult(result);
    setTestResults(getStoredResults());

    // Merge weak topics into user profile
    if (result.weakTopics && result.weakTopics.length > 0) {
      const mergedWeak = Array.from(new Set([...user.weakTopics, ...result.weakTopics]));
      updateUser({
        ...user,
        weakTopics: mergedWeak,
      });
    }
  };

  const handleStartTest = (test: MockTest) => {
    setActiveTestToRun(test);
    setActiveTab('tests');
  };

  const handleLaunchTestForJob = (jobTitle: string, tags: string[]) => {
    const customTest: MockTest = {
      testId: `test_job_${Date.now()}`,
      title: `${jobTitle} Target PYQ Practice`,
      category: 'govt',
      targetName: jobTitle,
      topics: tags,
      durationMinutes: 15,
      totalQuestions: 5,
      createdAt: new Date().toISOString().split('T')[0],
      questions: [
        {
          questionId: `jq1_${Date.now()}`,
          topicTag: tags[0] || 'Quantitative Aptitude',
          pyqSource: `${jobTitle} Pattern`,
          questionText: 'A machine is sold at 20% profit. If both the cost price and selling price are reduced by ₹100, the profit percentage increases by 5%. Find the original cost price.',
          options: ['₹500', '₹600', '₹400', '₹700'],
          correctOption: 1,
          explanation: 'Let original CP = 5x. SP = 6x. New CP = 5x - 100, New SP = 6x - 100. New Profit % = 25%. (6x - 100) - (5x - 100) = x. Profit % = x / (5x - 100) = 1/4 => 4x = 5x - 100 => x = 100. CP = 500. So CP = ₹600.',
          difficulty: 'Medium',
        },
        {
          questionId: `jq2_${Date.now()}`,
          topicTag: tags[1] || 'Reasoning',
          pyqSource: `${jobTitle} Memory Based`,
          questionText: 'In a certain code, "SYSTEM" is coded as "SYSMET". How is "FRACTION" coded in that language?',
          options: ['CARFNOIT', 'CARFTION', 'NOITCARF', 'ARFCITNO'],
          correctOption: 0,
          explanation: 'The word is divided into two halves of 4 letters each: "FRAC" -> reversed to "CARF", and "TION" -> reversed to "NOIT". Together = CARFNOIT.',
          difficulty: 'Easy',
        },
      ],
    };

    setActiveTestToRun(customTest);
    setActiveTab('tests');
  };

  const handleProUnlocked = (updatedUser?: UserProfile) => {
    const proUser: UserProfile = updatedUser || {
      ...user,
      role: 'pro',
      isPro: true,
    };
    updateUser(proUser);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Strict Fixed Left Sidebar (Desktop) & Header Drawer (Mobile) */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPhonePe={() => setIsPhonePeOpen(true)}
        onOpenHelpDesk={() => setIsHelpDeskOpen(true)}
        unreadAlertsCount={jobAlerts.length}
      />

      {/* Right Main Content: Hardware accelerated single scrolling container */}
      <main className="flex-1 h-full overflow-y-auto scroll-smooth transform-gpu pt-16 lg:pt-0">
        <div className="max-w-7xl w-full mx-auto px-4 py-6">
          <Suspense fallback={<PageLoadingFallback />}>
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                jobAlerts={jobAlerts}
                mockTests={mockTests}
                testResults={testResults}
                onStartTest={handleStartTest}
                onNavigateTab={setActiveTab}
                onOpenPhonePe={() => setIsPhonePeOpen(true)}
                onOpenChatbot={() => setIsGlobalChatbotOpen(true)}
              />
            )}

            {activeTab === 'tracks' && (
              <GoalTracks user={user} onUpdateGoals={handleUpdateUserGoals} />
            )}

            {(activeTab === 'tests' || activeTab === 'coding') && (
              <MockTestRunner
                initialTest={activeTestToRun}
                onFinishTest={handleFinishTest}
                userCategory={user.targetCategory}
                userTargetExams={user.targetExamsOrCompanies}
                user={user}
                testResults={testResults}
              />
            )}

            {activeTab === 'revision' && (
              <SmartRevisionEngine user={user} onUpdateUser={(updated) => updateUser(updated)} />
            )}

            {activeTab === 'affairs' && <CurrentAffairsFeed user={user} />}

            {activeTab === 'staticgk' && <StaticGKModule />}

            {activeTab === 'pyq' && (
              <PYQPortal
                onAttemptPYQ={(testToRun) => {
                  setActiveTestToRun(testToRun);
                  setActiveTab('tests');
                }}
              />
            )}

            {activeTab === 'alerts' && (
              <JobAlertsView
                alerts={jobAlerts}
                user={user}
                onLaunchTestForJob={handleLaunchTestForJob}
              />
            )}

            {activeTab === 'resume' && <ResumeBuilder user={user} />}

            {activeTab === 'profile' && (
              <UserProfileDashboard
                user={user}
                onUpdateUser={(updated) => updateUser(updated)}
                testResults={testResults}
                jobAlerts={jobAlerts}
                onNavigateTab={setActiveTab}
                onOpenPhonePe={() => setIsPhonePeOpen(true)}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard user={user} onNavigateTab={setActiveTab} />
            )}
          </Suspense>

          {/* Footer */}
          <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-slate-800 bg-slate-900 mt-12 rounded-2xl">
            <p className="max-w-7xl mx-auto px-4">
              CrackIt AI • AI Mock Test & Job Prep Platform for Govt Exams & Private IT Sector Drives • HARSHA'S Multimodal Experience
            </p>
          </footer>
        </div>
      </main>

      {/* Floating HARSHA'S Action Button */}
      <button
        onClick={() => setIsGlobalChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20 group cursor-pointer"
        title="Open HARSHA'S"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="block text-xs font-black tracking-wide text-white leading-none">HARSHA'S</span>
          <span className="text-[10px] text-sky-200 font-medium">Text • Files • Images • Audio</span>
        </div>
      </button>

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {isPhonePeOpen && (
          <PhonePeModal
            isOpen={isPhonePeOpen}
            onClose={() => setIsPhonePeOpen(false)}
            uid={user.uid}
            onSuccessProUnlocked={handleProUnlocked}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            user={user}
            onUpdateUser={(updated) => updateUser(updated)}
          />
        )}

        {isGlobalChatbotOpen && (
          <ExplainThisChatbot
            isOpen={isGlobalChatbotOpen}
            onClose={() => setIsGlobalChatbotOpen(false)}
            question={null}
          />
        )}

        {isHelpDeskOpen && (
          <HelpDeskModal
            isOpen={isHelpDeskOpen}
            onClose={() => setIsHelpDeskOpen(false)}
            user={user}
          />
        )}
      </Suspense>
    </div>
  );
}
