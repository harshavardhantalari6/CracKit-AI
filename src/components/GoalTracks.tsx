import React, { useState } from 'react';
import { UserProfile } from '../types';
import { extractSyllabusAi } from '../services/api';
import { EXAM_CATEGORY_GROUPS } from '../constants/examCategories';
import {
  Target,
  Building2,
  Landmark,
  CheckCircle,
  FileText,
  Globe,
  Sparkles,
  Loader2,
  Sliders,
  ShieldCheck,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  GraduationCap,
  Train,
} from 'lucide-react';

interface GoalTracksProps {
  user: UserProfile;
  onUpdateGoals: (newCategory: 'govt' | 'it' | 'both', selectedExams: string[]) => void;
}

export const GoalTracks: React.FC<GoalTracksProps> = ({ user, onUpdateGoals }) => {
  const [selectedCategory, setSelectedCategory] = useState<'govt' | 'it' | 'both'>(user.targetCategory || 'both');
  const [selectedExams, setSelectedExams] = useState<string[]>(user.targetExamsOrCompanies || ['SSC CGL', 'TCS NQT']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Quantitative Aptitude',
    'Data Structures & Algorithms',
    'Reasoning & Intelligence',
    'React & Next.js',
  ]);

  // Admin / AI Syllabus Parser State
  const [docText, setDocText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedToProfileSuccess, setSavedToProfileSuccess] = useState(false);
  const [extractedSyllabus, setExtractedSyllabus] = useState<{
    title: string;
    category: 'govt' | 'it';
    targetRoleOrDept?: string;
    topics: string[];
    subtopics?: string[];
    examPatternSummary: string;
    totalSections?: number;
    recommendedStudyDays?: number;
  } | null>(null);

  const GOVT_EXAMS = [
    {
      name: 'UPSC CSE',
      desc: 'Civil Services Prelims & Mains (GS, CSAT)',
      topics: ['Indian Polity & Constitution', 'Modern Indian History', 'Indian Economy', 'CSAT Quantitative', 'Current Affairs & Editorials'],
    },
    {
      name: 'SSC CGL',
      desc: 'Combined Graduate Level (Tier 1 & Tier 2)',
      topics: ['Quantitative Aptitude', 'Reasoning & Intelligence', 'English Comprehension', 'General Awareness & Science'],
    },
    {
      name: 'IBPS PO',
      desc: 'Bank Probationary Officer (Prelims & Mains)',
      topics: ['Data Interpretation & Analysis', 'Reasoning Ability & Computer', 'English Language', 'Banking & Economy Awareness'],
    },
    {
      name: 'RRB NTPC',
      desc: 'Railway Recruitment Board Non-Technical',
      topics: ['Mathematics & Arithmetic', 'General Intelligence & Reasoning', 'General Science (Physics, Bio, Chem)', 'General Awareness'],
    },
    {
      name: 'State PSC',
      desc: 'State Public Service Commissions (Group I/II)',
      topics: ['State History, Culture & Geography', 'General Studies Paper I/II', 'Aptitude & Mental Ability'],
    },
  ];

  const IT_COMPANIES = [
    {
      name: 'TCS NQT',
      desc: 'Tata Consultancy Services National Qualifier Test',
      topics: ['Numerical Ability', 'Verbal Ability', 'Reasoning Ability', 'Programming Logic', 'Hands-on Coding'],
    },
    {
      name: 'Infosys',
      desc: 'System Engineer & Specialist Programmer Drive',
      topics: ['Data Structures & Algorithms', 'Pseudo Code Decoding', 'DBMS & SQL Queries', 'Mathematical Ability'],
    },
    {
      name: 'Wipro NLTH',
      desc: 'National Level Talent Hunt for Freshers',
      topics: ['Logical Reasoning', 'Quantitative Aptitude', 'Verbal English', 'Basic Coding in C++/Java/Python'],
    },
    {
      name: 'Amazon SDE',
      desc: 'Software Development Engineer Tier 1 & 2',
      topics: ['Trees & Graphs Algorithms', 'Dynamic Programming', 'Object Oriented Design', 'Scalable System Design'],
    },
    {
      name: 'FullStack Developer',
      desc: 'Modern Web, Cloud & API Architecture',
      topics: ['React & Next.js', 'Node.js & Express', 'SQL & NoSQL Databases', 'System Design & REST APIs', 'Git & DevOps Basics'],
    },
  ];

  const toggleExam = (name: string) => {
    if (selectedExams.includes(name)) {
      setSelectedExams(selectedExams.filter((e) => e !== name));
    } else {
      setSelectedExams([...selectedExams, name]);
    }
  };

  const toggleTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topicName));
    } else {
      setSelectedTopics([...selectedTopics, topicName]);
    }
  };

  const handleSavePreferences = () => {
    onUpdateGoals(selectedCategory, selectedExams);
  };

  const handleExtractSyllabus = async () => {
    if (!docText.trim() && !sourceUrl.trim()) return;
    setIsExtracting(true);
    setSavedToProfileSuccess(false);
    try {
      const result = await extractSyllabusAi({
        documentText: docText || `Official recruitment notification details for ${sourceUrl}`,
        sourceUrl,
      });
      setExtractedSyllabus(result);
    } catch (e) {
      console.error('Syllabus extraction error:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSyncExtractedToProfile = () => {
    if (!extractedSyllabus) return;
    if (!selectedExams.includes(extractedSyllabus.title)) {
      setSelectedExams([...selectedExams, extractedSyllabus.title]);
    }
    const newTopics = [...new Set([...selectedTopics, ...extractedSyllabus.topics])];
    setSelectedTopics(newTopics);
    setSavedToProfileSuccess(true);
    setTimeout(() => setSavedToProfileSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header - HARSHA'S Studio Design */}
      <div className="glass-panel p-6 rounded-3xl space-y-2 border border-sky-500/20 bg-slate-900/70 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Goal Tracks & Syllabus Parser</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                  HARSHA'S
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Configure your target track, customize syllabus topics, and parse official recruitment PDFs or career URLs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Track Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'govt', label: 'Government Exams Track', icon: Landmark, desc: 'UPSC, SSC CGL, IBPS PO, RRB NTPC, State PSC' },
          { id: 'it', label: 'IT Corporate Sector Track', icon: Building2, desc: 'TCS NQT, Infosys, Wipro, Amazon, Web Dev' },
          { id: 'both', label: 'Dual Track (Both)', icon: Sliders, desc: 'Simultaneous prep for Govt Exams & Campus Placements' },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedCategory(item.id as any)}
              className={`cursor-pointer p-5 rounded-3xl transition-all border relative overflow-hidden ${
                isSelected
                  ? 'glass-panel border-sky-400 bg-sky-500/15 shadow-2xl shadow-sky-500/10'
                  : 'glass-card border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-2xl ${isSelected ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-800/80 text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-sky-400" />}
              </div>
              <h3 className="text-base font-bold text-white">{item.label}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Target Exams & Companies Selector */}
      <div className="space-y-6">
        {EXAM_CATEGORY_GROUPS.map((group) => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${group.color}`}>
                {group.label}
              </span>
              <span className="text-xs text-slate-400">{group.description}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.exams.map((exam) => {
                const checked = selectedExams.includes(exam.name);
                return (
                  <div
                    key={exam.id}
                    onClick={() => toggleExam(exam.name)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      checked
                        ? 'bg-sky-500/15 border-sky-400 text-white shadow-xl shadow-sky-500/10'
                        : 'glass-card border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{exam.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${exam.badgeColor}`}>
                          {exam.categoryLabel}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${checked ? 'bg-sky-500 border-sky-400 text-slate-950 font-black' : 'border-slate-600'}`}>
                        {checked && <CheckCircle className="w-3.5 h-3.5 text-slate-950" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{exam.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {exam.topics.slice(0, 3).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-900/80 text-sky-200/90 border border-sky-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}



        {/* Topic Multi-Selection Matrix */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Multi-Select Active Topic Focus Areas</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {selectedTopics.length} topics customized
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Quantitative Aptitude',
              'Reasoning & Intelligence',
              'English Comprehension',
              'General Awareness',
              'Data Interpretation',
              'Modern Indian History',
              'Indian Polity & Constitution',
              'Data Structures & Algorithms',
              'React & Next.js',
              'Node.js & Express',
              'DBMS & SQL Queries',
              'Dynamic Programming',
              'System Design',
              'Verbal Ability',
              'Coding in C++/Java/Python',
            ].map((topic) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900/60 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="glass-button-primary px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Target Goal Preferences</span>
          </button>
        </div>
      </div>

      {/* Admin UI: Upload Notification PDF / Career Page URL Syllabus Parser */}
      <div className="glass-panel p-6 rounded-3xl space-y-5 border border-purple-500/30 bg-slate-950/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Admin Syllabus & Notification Parser</h3>
                <span className="px-2 py-0.5 text-[9px] font-extrabold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Paste official Government Notification PDF text or Private Career Page URL to auto-extract structured syllabus tags.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" /> Career Page / Official Notification URL
            </label>
            <input
              type="text"
              placeholder="e.g. https://ssc.gov.in/notifications/cgl-2026.pdf"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" /> Or Paste Notification PDF / Circular Text
            </label>
            <textarea
              rows={2}
              placeholder="Paste raw notification text or syllabus scheme of examination here..."
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 relative z-10">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Outputs structured JSON ready for Firestore profile mapping
          </span>
          <button
            onClick={handleExtractSyllabus}
            disabled={isExtracting || (!docText.trim() && !sourceUrl.trim())}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:brightness-110 text-white font-bold text-xs shadow-xl disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing Syllabus with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse & Generate Syllabus JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Extracted JSON Payload Result View */}
        {extractedSyllabus && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-4 animate-fadeIn relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                  {extractedSyllabus.targetRoleOrDept || extractedSyllabus.category.toUpperCase()}
                </span>
                <h4 className="font-bold text-base text-white">{extractedSyllabus.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncExtractedToProfile}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{savedToProfileSuccess ? 'Synced to Goals!' : 'Sync to My Goal Tracks'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <strong className="text-purple-300">Exam Pattern Summary: </strong>
              {extractedSyllabus.examPatternSummary}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-sky-400" /> Stages / Tiers
                </span>
                <span className="font-bold text-white">{extractedSyllabus.totalSections || 2} Stages</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" /> Est. Prep Period
                </span>
                <span className="font-bold text-white">{extractedSyllabus.recommendedStudyDays || 90} Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 col-span-2">
                <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Mapping Status
                </span>
                <span className="font-bold text-emerald-400 text-[11px]">Ready for Firestore User Document Sync</span>
              </div>
            </div>

            {/* Core Topic Tags */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Extracted Core Topics</label>
              <div className="flex flex-wrap gap-1.5">
                {extractedSyllabus.topics.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs bg-purple-950/80 text-purple-200 rounded-lg border border-purple-500/30 flex items-center gap-1 font-medium">
                    <ChevronRight className="w-3 h-3 text-purple-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtopics */}
            {extractedSyllabus.subtopics && extractedSyllabus.subtopics.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Granular Practice Subtopics</label>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSyllabus.subtopics.map((st, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] bg-slate-950 text-slate-300 rounded-md border border-white/10">
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
