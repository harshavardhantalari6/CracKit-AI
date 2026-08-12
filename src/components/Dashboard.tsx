import React from 'react';
import { UserProfile, JobAlert, MockTest, TestResult } from '../types';
import { Briefcase, Sparkles, Award, ArrowRight, ShieldAlert, CheckCircle2, Flame, Target, BookOpen, Clock, AlertTriangle, Bot, Mic, Paperclip, MessageSquare } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  jobAlerts: JobAlert[];
  mockTests: MockTest[];
  testResults: TestResult[];
  onStartTest: (test: MockTest) => void;
  onNavigateTab: (tab: string) => void;
  onOpenPhonePe: () => void;
  onOpenChatbot?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  jobAlerts,
  mockTests,
  testResults,
  onStartTest,
  onNavigateTab,
  onOpenPhonePe,
  onOpenChatbot,
}) => {
  const isPro = user.role === 'pro';
  const matchingAlerts = jobAlerts.slice(0, 3);
  const totalAttempted = testResults.length;
  const avgScore = totalAttempted > 0
    ? Math.round(testResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / totalAttempted)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1-Week Free Trial Banner */}
      {!isPro && (
        <div className="glass-card p-5 rounded-3xl border border-sky-400/30 bg-gradient-to-r from-sky-900/40 via-indigo-900/40 to-purple-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 1-Week Free Trial Active
                </span>
                <span className="text-xs text-slate-300">All Core Features Unlocked</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Get Ready for UPSC, SSC CGL & IT Tech Hiring
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                Unlock unlimited AI PYQ test generations, instant "Explain This" Doubt Chatbot, and automated Job Match notifications for ₹299 (Lifetime Free Updates).
              </p>
            </div>
            <button
              onClick={onOpenPhonePe}
              className="glass-button-primary px-5 py-2.5 rounded-2xl text-white font-semibold text-sm flex items-center gap-2 shadow-xl shrink-0"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Unlock Pro via PhonePe</span>
            </button>
          </div>
        </div>
      )}

      {/* HARSHA'S Multimodal AI Platform Guide Banner */}
      <div className="glass-card p-5 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-purple-950/60 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                HARSHA'S Multimodal AI Tutor
              </span>
              <span className="text-xs text-slate-400">• Powered by Gemini</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Have a doubt or need a study plan recommendation?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask HARSHA'S anything! Upload 📄 <strong>PDF Notifications / Study Notes</strong>, 🖼️ <strong>Question Screenshots</strong>, or 🎙️ <strong>Speak your query via Voice Note</strong>. HARSHA'S can guide your preparation, analyze weak topics, and suggest targeted mock tests.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={onOpenChatbot}
              className="flex-1 sm:flex-none glass-button-primary px-4 py-2.5 rounded-2xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-sky-300" />
              <span>Launch HARSHA'S</span>
            </button>
            <button
              onClick={onOpenChatbot}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-white/10 transition-all text-xs flex items-center gap-1.5"
              title="Attach File or Voice Note"
            >
              <Paperclip className="w-4 h-4 text-indigo-400" />
              <Mic className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline font-medium text-slate-200">Voice / Attach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Daily Prep Streak</p>
            <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-1.5">
              5 Days <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Top 5% Aspirants
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Target Exam Track</p>
            <h3 className="text-xl font-extrabold text-white mt-1 truncate max-w-[140px]">
              {user.targetExamsOrCompanies.join(', ') || 'SSC CGL & TCS'}
            </h3>
            <button
              onClick={() => onNavigateTab('tracks')}
              className="text-[11px] text-sky-400 hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              Change Goals <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Mock Tests Solved</p>
            <h3 className="text-2xl font-black text-white mt-1">{totalAttempted} Tests</h3>
            <p className="text-[11px] text-slate-400 mt-1">Avg Score: {avgScore}%</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Matching Jobs</p>
            <h3 className="text-2xl font-black text-white mt-1">{jobAlerts.length} Active</h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-[11px] text-emerald-400 hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              View Alerts <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split: Matching Jobs & Quick AI Mock Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: "New Jobs Matching Your Profile" Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">New Jobs Matching Your Profile</h3>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
            >
              View All ({jobAlerts.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {matchingAlerts.map((job) => (
              <div
                key={job.jobId}
                className="glass-card p-5 rounded-3xl border border-white/10 hover:border-sky-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {job.matchedPercent}% Match
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        job.category === 'govt'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {job.category === 'govt' ? 'Govt Exam' : 'IT Corporate'}
                    </span>
                    <span className="text-xs text-slate-400">{job.location}</span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">{job.companyOrDept}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.syllabusTags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 rounded-lg border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                  <p className="text-xs font-semibold text-slate-200">{job.salaryOrGrade}</p>
                  <button
                    onClick={() => onNavigateTab('alerts')}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors flex items-center gap-1.5"
                  >
                    <span>Apply / Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recommended AI Mock Tests & Weakness Overview */}
        <div className="space-y-6">
          {/* Quick Mock Tests Widget */}
          <div className="glass-card p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Featured Mock Tests</h3>
              </div>
              <button
                onClick={() => onNavigateTab('tests')}
                className="text-xs text-purple-400 hover:underline font-medium"
              >
                All Tests
              </button>
            </div>

            <div className="space-y-3">
              {mockTests.map((test) => (
                <div
                  key={test.testId}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">{test.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {test.durationMinutes} Mins
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{test.totalQuestions} PYQ Questions</span>
                    <button
                      onClick={() => onStartTest(test)}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-[11px] shadow-md hover:brightness-110 transition-all"
                    >
                      Start Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Weakness Diagnostic Card */}
          <div className="glass-card p-5 rounded-3xl space-y-3 border border-amber-500/20 bg-amber-950/20">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h4 className="text-sm font-bold text-white">AI Weakness Focus Areas</h4>
            </div>
            <p className="text-xs text-slate-300">
              Based on recent test responses, Gemini detected accuracy gaps in:
            </p>
            <div className="space-y-1.5">
              {user.weakTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/80 p-2 rounded-xl border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{topic}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigateTab('tests')}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
            >
              Generate Target Weakness Drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
