import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCw,
  Target,
  Award,
  Flame,
  Zap,
  BookOpen,
  ChevronRight,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';

export interface RevisionFlashcard {
  id: string;
  topic: string;
  category: 'Govt Prep' | 'IT & Coding' | 'Aptitude' | 'General';
  question: string;
  answer: string;
  keyFormulaOrTip: string;
  pyqExample: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  accuracyRate: number;
  lastAttempted: string;
}

const DEFAULT_REVISION_FLASHCARDS: RevisionFlashcard[] = [
  {
    id: 'rev-1',
    topic: 'Profit & Loss (Marked Price & Discount)',
    category: 'Aptitude',
    question: 'A seller marks an article 30% above CP and gives a 15% discount on MP. What is the net profit %?',
    answer: 'Net Profit % = 10.5%.',
    keyFormulaOrTip: 'Net % = x - y - (xy/100) where x = Mark-up % and y = Discount %. Here 30 - 15 - (450/100) = 10.5%.',
    pyqExample: 'SSC CGL 2024 Tier 1: Marked price ₹130, Discount ₹19.5 => SP ₹110.5 => Profit 10.5%.',
    difficulty: 'Medium',
    accuracyRate: 42,
    lastAttempted: 'Yesterday',
  },
  {
    id: 'rev-2',
    topic: 'Dynamic Programming (Memoization vs Tabulation)',
    category: 'IT & Coding',
    question: 'What is the primary advantage of Tabulation (Bottom-Up) over Memoization (Top-Down) in DP?',
    answer: 'Tabulation eliminates recursion stack overhead (saving O(N) auxiliary call-stack space) and avoids stack overflow.',
    keyFormulaOrTip: 'Memoization = Recursion + Cache. Tabulation = Iterative DP Table.',
    pyqExample: 'TCS NQT 2024 Tech Drive: 0/1 Knapsack & Fibonacci sequence space optimization.',
    difficulty: 'Hard',
    accuracyRate: 38,
    lastAttempted: '2 days ago',
  },
  {
    id: 'rev-3',
    topic: 'Indian Polity (Writs & Article 32)',
    category: 'Govt Prep',
    question: 'Which Writ is issued by the judiciary to release a person unlawfully detained by authority or private individual?',
    answer: 'Habeas Corpus (literally means "To have the body of").',
    keyFormulaOrTip: '5 Supreme Court Writs: Habeas Corpus, Mandamus, Quo-Warranto, Certiorari, Prohibition.',
    pyqExample: 'UPSC CSE 2023 / SSC CGL 2022: Article 32 (Right to Constitutional Remedies).',
    difficulty: 'Easy',
    accuracyRate: 55,
    lastAttempted: '3 days ago',
  },
  {
    id: 'rev-4',
    topic: 'Syllogism (Negative & Either-Or Rules)',
    category: 'Aptitude',
    question: 'When statement gives "Some A are B" and "No B is C", what can be definitely concluded regarding A and C?',
    answer: 'Conclusion "Some A are NOT C" is 100% DEFINITELY TRUE.',
    keyFormulaOrTip: 'Draw overlapping Venn circles: The portion of A inside B can never cross into C.',
    pyqExample: 'RRB NTPC 2023 / IBPS PO 2024: Reasoning Ability Section.',
    difficulty: 'Medium',
    accuracyRate: 48,
    lastAttempted: 'Today',
  },
  {
    id: 'rev-5',
    topic: 'Binary Search Tree (In-Order Traversal)',
    category: 'IT & Coding',
    question: 'What property does the In-Order Traversal of a Binary Search Tree (BST) possess?',
    answer: 'It produces all node values in strictly sorted ascending numerical/lexicographical order.',
    keyFormulaOrTip: 'In-Order = Left -> Root -> Right. Time Complexity: O(N).',
    pyqExample: 'Infosys SP Drive / Amazon SDE 1 Screening: Finding K-th smallest element in BST.',
    difficulty: 'Easy',
    accuracyRate: 60,
    lastAttempted: 'Yesterday',
  },
  {
    id: 'rev-6',
    topic: 'Time & Work (Pipes and Cisterns)',
    category: 'Aptitude',
    question: 'Pipe A fills a tank in 20 mins, Pipe B fills in 30 mins. How long if both operate together?',
    answer: 'Combined time = 12 minutes.',
    keyFormulaOrTip: 'Combined Rate = (1/A + 1/B) = (A + B)/(A × B). Time = (A × B)/(A + B) = (20 × 30)/50 = 12 mins.',
    pyqExample: 'SSC CGL 2024 / Banking PO 2023: Quantitative Aptitude Speed Test.',
    difficulty: 'Easy',
    accuracyRate: 50,
    lastAttempted: '4 days ago',
  },
];

interface SmartRevisionDashboardProps {
  user?: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const SmartRevisionDashboard: React.FC<SmartRevisionDashboardProps> = ({
  user,
  onUpdateUser,
}) => {
  const [flashcards, setFlashcards] = useState<RevisionFlashcard[]>(DEFAULT_REVISION_FLASHCARDS);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleToggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleMarkMastered = (card: RevisionFlashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!masteredIds.includes(card.id)) {
      const nextMastered = [...masteredIds, card.id];
      setMasteredIds(nextMastered);

      if (user && onUpdateUser) {
        const updatedWeak = (user.weakTopics || []).filter(
          (t) => !t.toLowerCase().includes(card.topic.toLowerCase())
        );
        onUpdateUser({
          ...user,
          weakTopics: updatedWeak,
        });
      }
    }
  };

  const handleMarkNeedsReview = (card: RevisionFlashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredIds((prev) => prev.filter((id) => id !== card.id));
    setFlippedCards((prev) => ({ ...prev, [card.id]: false }));
  };

  const categories = ['All', 'Aptitude', 'IT & Coding', 'Govt Prep'];

  const filteredCards = flashcards.filter((card) => {
    if (selectedCategory !== 'All' && card.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const needsReviewCount = filteredCards.filter((c) => !masteredIds.includes(c.id)).length;
  const masteredCount = masteredIds.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. TOP SECTION: Clean, Minimal Spaced-Repetition Progress Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-sky-600 text-white shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Smart Revision Engine</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Spaced Repetition Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted 3D flashcards generated from your mock test accuracy history & weak areas
              </p>
            </div>
          </div>

          {/* Minimal Progress Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Needs Review Today
                </span>
                <span className="text-base font-black text-sky-400">{needsReviewCount} Topics</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Topics Mastered
                </span>
                <span className="text-base font-black text-emerald-400">{masteredCount} Topics</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3 hidden sm:flex">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Retention Rate
                </span>
                <span className="text-base font-black text-purple-300">
                  {flashcards.length > 0
                    ? Math.round(((masteredCount + 2) / (flashcards.length + 2)) * 100)
                    : 100}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between pt-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredCards.length}</strong> weak topic cards
          </span>
        </div>
      </div>

      {/* 2. MAIN GRID: Responsive Grid displaying Weak Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.map((card) => {
          const isMastered = masteredIds.includes(card.id);
          const isFlipped = Boolean(flippedCards[card.id]);

          return (
            <div key={card.id} className="w-full h-[360px] [perspective:1000px]">
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d] transform-gpu cursor-pointer"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => handleToggleFlip(card.id)}
              >
                {/* FRONT SIDE (Weak Topic & Question) */}
                <div
                  className={`absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-2xl border p-5 flex flex-col justify-between shadow-lg transition-colors ${
                    isMastered
                      ? 'bg-slate-900/90 border-emerald-500/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {card.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Acc: <span className="text-amber-400 font-bold">{card.accuracyRate}%</span>
                      </span>
                      {isMastered && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Mastered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-2.5 my-auto">
                    <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{card.topic}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 leading-snug line-clamp-4">
                      {card.question}
                    </h3>
                  </div>

                  {/* Front Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Click to reveal answer & tip
                    </span>
                    <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>

                {/* BACK SIDE (Answer, Formula & Actions) */}
                <div
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border border-sky-500/40 bg-slate-900 p-5 flex flex-col justify-between shadow-2xl overflow-hidden"
                >
                  {/* Back Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Answer & Concept Resolution
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      REVEALED
                    </span>
                  </div>

                  {/* Answer & Key Formula Body */}
                  <div className="space-y-2.5 my-auto text-xs overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
                    <p className="text-xs font-bold text-slate-100 leading-relaxed">
                      {card.answer}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        💡 Key Trick / Formula:
                      </span>
                      <p className="text-slate-300 font-mono text-[11px] leading-tight">
                        {card.keyFormulaOrTip}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[10px]">
                      <span className="text-slate-400 font-semibold block">PYQ Reference:</span>
                      <p className="text-slate-300 italic">{card.pyqExample}</p>
                    </div>
                  </div>

                  {/* Back Footer Actions */}
                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                    {isMastered ? (
                      <button
                        onClick={(e) => handleMarkNeedsReview(card, e)}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Re-open Review
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFlip(card.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Keep
                        </button>
                        <button
                          onClick={(e) => handleMarkMastered(card, e)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Mastered!
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartRevisionDashboard;
