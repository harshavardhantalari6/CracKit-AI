import React, { useState } from 'react';
import { UserProfile, TestResult, JobAlert } from '../types';
import { saveStoredUser } from '../services/firebaseConfig';
import { EXAM_CATEGORY_GROUPS, ALL_EXAMS } from '../constants/examCategories';
import {
  User,
  History,
  Briefcase,
  Settings,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Save,
  ShieldCheck,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  RotateCcw,
  Check,
} from 'lucide-react';

interface UserProfileDashboardProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  testResults: TestResult[];
  jobAlerts: JobAlert[];
  onNavigateTab: (tab: string) => void;
  onOpenPhonePe: () => void;
}

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
  user,
  onUpdateUser,
  testResults,
  jobAlerts,
  onNavigateTab,
  onOpenPhonePe,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'jobs' | 'settings'>('history');

  // Account Settings Form State
  const [displayName, setDisplayName] = useState(user.displayName || 'Aspirant Candidate');
  const [email, setEmail] = useState(user.email || 'candidate@example.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [degreeStatus, setDegreeStatus] = useState('B.Tech in Computer Science (2022 - 2026)');
  const [targetCategory, setTargetCategory] = useState<'govt' | 'it' | 'both'>(user.targetCategory || 'both');
  const [targetExamsInput, setTargetExamsInput] = useState(
    user.targetExamsOrCompanies?.join(', ') || 'SSC CGL, TCS NQT, Infosys, IBPS PO'
  );
  const [weakTopicsInput, setWeakTopicsInput] = useState(
    user.weakTopics?.join(', ') || 'Quantitative Aptitude - Profit & Loss, Coding - Dynamic Programming'
  );
  const [isSaved, setIsSaved] = useState(false);

  // Mock list of saved/applied jobs
  const [savedJobs, setSavedJobs] = useState<
    { job: JobAlert; status: 'Applied' | 'Saved' | 'Under Review'; dateApplied: string }[]
  >([
    {
      job: jobAlerts[0] || {
        jobId: 'job_1',
        title: 'SSC CGL 2026 Combined Graduate Level Exam',
        companyOrDept: 'Staff Selection Commission',
        category: 'govt',
        location: 'All India',
        salaryOrGrade: 'Pay Level 4 - 8',
        syllabusTags: ['Quant', 'Reasoning', 'English'],
        deadline: '2026-08-30',
        applyUrl: 'https://ssc.gov.in',
        matchedPercent: 98,
        active: true,
        createdAt: new Date().toISOString(),
      },
      status: 'Applied',
      dateApplied: '2026-07-28',
    },
    {
      job: jobAlerts[1] || {
        jobId: 'job_2',
        title: 'TCS NQT National Qualifier Test 2026',
        companyOrDept: 'Tata Consultancy Services',
        category: 'it',
        location: 'PAN India',
        salaryOrGrade: '₹3.36 LPA - ₹9.0 LPA',
        syllabusTags: ['Numerical', 'Verbal', 'Reasoning', 'Coding'],
        deadline: '2026-08-15',
        applyUrl: 'https://www.tcs.com/careers',
        matchedPercent: 95,
        active: true,
        createdAt: new Date().toISOString(),
      },
      status: 'Under Review',
      dateApplied: '2026-07-29',
    },
  ]);

  // Derived metrics
  const totalTestsTaken = testResults.length;
  const avgScore =
    totalTestsTaken > 0
      ? Math.round(
          testResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) /
            totalTestsTaken
        )
      : 84;

  const totalQuestionsAnswered = testResults.reduce((acc, curr) => acc + curr.totalQuestions, 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedExams = targetExamsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updatedWeak = weakTopicsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedUser: UserProfile = {
      ...user,
      displayName,
      email,
      targetCategory,
      targetExamsOrCompanies: updatedExams,
      weakTopics: updatedWeak,
    };

    saveStoredUser(updatedUser);
    onUpdateUser(updatedUser);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Profile Banner */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shadow-xl shadow-sky-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white text-2xl font-black">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{displayName}</h2>
                {user.role === 'pro' ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> PRO MEMBER
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    FREE TRIAL ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-sky-400" /> {email}</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-purple-400" /> {degreeStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            {user.role !== 'pro' && (
              <button
                onClick={onOpenPhonePe}
                className="flex-1 md:flex-none glass-button-primary px-4 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Upgrade to Pro (PhonePe)</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('resume')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sky-300 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>ATS Resume Studio</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Tests Completed</span>
            <p className="text-lg font-black text-white mt-0.5">{totalTestsTaken}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Average Score</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{avgScore}%</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Questions Solved</span>
            <p className="text-lg font-black text-sky-400 mt-0.5">{totalQuestionsAnswered}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Saved Drive Alerts</span>
            <p className="text-lg font-black text-purple-400 mt-0.5">{savedJobs.length}</p>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg border border-white/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>My Mock Test History</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'jobs'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg border border-white/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Saved & Applied Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg border border-white/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* TAB 1: MOCK TEST HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Timeline Chart & Stats Overview */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Score Progress & Performance Analytics
                </h3>
                <p className="text-xs text-slate-400">Historical performance across PYQ mock tests</p>
              </div>
              <button
                onClick={() => onNavigateTab('tests')}
                className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Start New Test
              </button>
            </div>

            {/* Visual Timeline Bar Graph Simulation */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-3">
              <div className="flex items-end gap-3 h-32 pt-4 px-2 justify-between">
                {(testResults.length > 0
                  ? testResults.slice(0, 7).reverse()
                  : [
                      { testTitle: 'SSC CGL Tier 1', score: 4, totalQuestions: 5, timestamp: '2026-07-25' },
                      { testTitle: 'TCS NQT Tech', score: 5, totalQuestions: 5, timestamp: '2026-07-27' },
                      { testTitle: 'IBPS PO Reasoning', score: 3, totalQuestions: 5, timestamp: '2026-07-29' },
                      { testTitle: 'SSC CGL Quant', score: 4, totalQuestions: 5, timestamp: '2026-07-30' },
                    ]
                ).map((item: any, idx: number) => {
                  const percent = Math.round((item.score / item.totalQuestions) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg border border-white/20 whitespace-nowrap pointer-events-none z-20">
                        {item.testTitle}: {percent}% ({item.score}/{item.totalQuestions})
                      </div>
                      <div className="w-full max-w-[36px] bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${percent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            percent >= 80
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                              : percent >= 60
                              ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                              : 'bg-gradient-to-t from-amber-600 to-amber-400'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[60px]">
                        {item.testTitle.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Test History Table */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" /> Completed Test Attempt Logs
            </h3>

            {testResults.length === 0 ? (
              <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400">No mock tests attempted yet.</p>
                <button
                  onClick={() => onNavigateTab('tests')}
                  className="glass-button-primary px-4 py-2 rounded-xl text-white font-semibold text-xs"
                >
                  Launch a Practice Mock Test
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-extrabold text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Test Title</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Time Spent</th>
                      <th className="py-3 px-4">Weak Topics Flagged</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {testResults.map((result) => {
                      const percent = Math.round((result.score / result.totalQuestions) * 100);
                      return (
                        <tr key={result.resultId} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{result.testTitle}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-400">
                              {result.score} / {result.totalQuestions}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                                percent >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-sky-500/20 text-sky-300'
                              }`}
                            >
                              {percent}% Accuracy
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
                          </td>
                          <td className="py-3.5 px-4">
                            {result.weakTopics && result.weakTopics.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {result.weakTopics.slice(0, 2).map((wt, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 text-[10px]">
                                    {wt}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-400 text-[10px] font-semibold">✓ None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onNavigateTab('tests')}
                              className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
                              title="Retake Test"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SAVED & APPLIED JOBS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" /> Saved & Applied Career Drives
            </h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>Explore All Job Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-5 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:border-sky-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      {item.job.category === 'govt' ? 'Govt Sector' : 'IT Corporate'}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">{item.job.title}</h4>
                    <p className="text-xs text-slate-400">{item.job.companyOrDept}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                      item.status === 'Applied'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'Under Review'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-white/5">
                  <span className="text-slate-400">Applied/Saved: {item.dateApplied}</span>
                  <span className="font-extrabold text-emerald-400">{item.job.matchedPercent}% ATS Match</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={item.job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-sky-500/30 transition-all"
                  >
                    <span>View Drive Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onNavigateTab('tests')}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10"
                  >
                    Practice PYQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" /> Candidate Profile & Webhook Settings
              </h3>
              <p className="text-xs text-slate-400">Update your account preferences and target goals</p>
            </div>

            {isSaved && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Candidate Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Phone Number (For WhatsApp Alerts)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Degree / Graduation Status</label>
              <input
                type="text"
                value={degreeStatus}
                onChange={(e) => setDegreeStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* Goal Category Preference */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Target Preparation Category Focus
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'all', label: 'All Categories', badge: 'Full Access' },
                { id: 'govt', label: 'Govt & Banking', badge: 'SSC, UPSC, IBPS' },
                { id: 'railway', label: 'Railways (RRB)', badge: 'NTPC, ALP, JE' },
                { id: 'teaching', label: 'Teaching Exams', badge: 'CTET, TET, DSC' },
                { id: 'it', label: 'IT Corporate', badge: 'TCS, Infosys, SDE' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetCategory(opt.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                    targetCategory === opt.id
                      ? 'bg-sky-500/20 text-sky-200 border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-slate-950/60 text-slate-400 border-white/5 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{opt.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Target Exams Multi-Select Chips */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Multi-Select Target Exams & Drives
              </label>
              <span className="text-[11px] text-slate-400">Click chips to toggle target exams</span>
            </div>

            {/* Render Category Groups */}
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              {EXAM_CATEGORY_GROUPS.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider text-white bg-gradient-to-r ${group.color}`}>
                      {group.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {group.exams.map((exam) => {
                      const selectedList = targetExamsInput
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const isSelected = selectedList.some(
                        (item) => item.toLowerCase() === exam.name.toLowerCase() || item.toLowerCase() === exam.id.toLowerCase()
                      );

                      const toggleExam = () => {
                        let newExams: string[];
                        if (isSelected) {
                          newExams = selectedList.filter(
                            (item) => item.toLowerCase() !== exam.name.toLowerCase() && item.toLowerCase() !== exam.id.toLowerCase()
                          );
                        } else {
                          newExams = [...selectedList, exam.name];
                        }
                        setTargetExamsInput(newExams.join(', '));
                      };

                      return (
                        <button
                          key={exam.id}
                          type="button"
                          onClick={toggleExam}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? `${exam.badgeColor} shadow-md scale-[1.02]`
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                          <span>{exam.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Target Exams List (Comma Separated)</label>
              <input
                type="text"
                value={targetExamsInput}
                onChange={(e) => setTargetExamsInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                placeholder="e.g. RRB NTPC, CTET, SSC CGL, TCS NQT"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Weak Topics to Prioritize in AI Tests</label>
              <textarea
                rows={2}
                value={weakTopicsInput}
                onChange={(e) => setWeakTopicsInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              className="glass-button-primary px-6 py-3 rounded-2xl text-white font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Account Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfileDashboard;
