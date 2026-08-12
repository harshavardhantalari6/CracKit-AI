import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Search,
  Sparkles,
  Tag,
  Clock,
  Layers,
  Filter,
  Share2,
  Check,
  TrendingUp,
  X,
} from 'lucide-react';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { UserProfile } from '../types';

export interface CurrentAffairsItem {
  id: string;
  date: string; // YYYY-MM-DD
  headline: string;
  description: string;
  category: 'National' | 'International' | 'Banking & Economy' | 'Science & Defense' | 'Sports' | 'Appointments';
  keyTakeaways: string[];
  examRelevance: string;
  source: string;
}

export const MOCK_CURRENT_AFFAIRS: CurrentAffairsItem[] = [
  {
    id: 'ca-2026-08-01',
    date: '2026-08-01',
    headline: 'RBI Unveils AI-Driven Fraud Prevention Architecture for Unified Payments Interface (UPI)',
    description: 'The Reserve Bank of India (RBI) announced a state-of-the-art real-time AI security umbrella for instant payment transactions across public and private sector banks.',
    category: 'Banking & Economy',
    keyTakeaways: [
      'Reduces instant payment cyber risks by 85% using real-time behavioral risk scoring.',
      'Mandatory implementation for all scheduled commercial banks by Q4 2026.',
      'Governed under RBI Payment System Vision 2026 guidelines.',
    ],
    examRelevance: 'RBI Grade B, SBI PO Mains, SSC CGL General Awareness',
    source: 'Press Information Bureau (PIB) & RBI Bulletin',
  },
  {
    id: 'ca-2026-07-31',
    date: '2026-07-31',
    headline: 'ISRO Successfully Launches Earth Observation Satellite EOS-09 via SSLV-D4',
    description: 'Indian Space Research Organisation (ISRO) achieved a precise orbital injection of EOS-09, carrying high-resolution multispectral sensors for disaster monitoring & agricultural mapping.',
    category: 'Science & Defense',
    keyTakeaways: [
      'Launched from Satish Dhawan Space Centre (SDSC) SHAR, Sriharikota.',
      'SSLV (Small Satellite Launch Vehicle) payload capacity enhanced to 500 kg in LEO.',
      'Satellite operational lifespan estimated at 5 years.',
    ],
    examRelevance: 'UPSC CSE Prelims, SSC CGL Science & Tech, Defense Exams (CDS/NDA)',
    source: 'ISRO Official Release',
  },
  {
    id: 'ca-2026-07-30',
    date: '2026-07-30',
    headline: 'India Chairs BRICS Innovation & Digital Economy Summit 2026 in New Delhi',
    description: 'High-level representatives from BRICS member states gathered in New Delhi to finalize the Global Digital Public Infrastructure (DPI) interoperability framework.',
    category: 'International',
    keyTakeaways: [
      'Theme: "Empowering Global South through Scalable Public Tech".',
      'Joint resolution passed on cross-border green technology funding.',
      'New Delhi Framework signed by 10 member delegates.',
    ],
    examRelevance: 'UPSC Mains GS-2, Banking Awareness, SSC CGL Tier-1',
    source: 'Ministry of External Affairs (MEA)',
  },
  {
    id: 'ca-2026-07-29',
    date: '2026-07-29',
    headline: 'Union Cabinet Approves National Green Hydrogen Infrastructure Corridor Phase II',
    description: 'The Union Cabinet approved ₹19,744 Crore outlay to establish 5 strategic green hydrogen port hubs along India’s maritime coastline.',
    category: 'National',
    keyTakeaways: [
      'Target: 5 Million Metric Tonnes (MMT) annual green hydrogen production by 2030.',
      'Includes setting up electrolyzer manufacturing clusters in Gujarat & Andhra Pradesh.',
      'Expected to generate 6 Lakh clean tech jobs.',
    ],
    examRelevance: 'SSC CGL, Railway RRB NTPC, UPSC GS-3 Environment',
    source: 'Ministry of New & Renewable Energy (MNRE)',
  },
  {
    id: 'ca-2026-07-28',
    date: '2026-07-28',
    headline: 'India Wins 12 Gold Medals at Commonwealth Shooting & Archery Championship',
    description: 'Indian archers and shooters dominated the medal tally with a record-breaking performance in Birmingham, leading the country overall standings.',
    category: 'Sports',
    keyTakeaways: [
      'India topped the medal tally with 12 Gold, 8 Silver, and 5 Bronze medals.',
      'Breakthrough performance in 10m Air Rifle mixed team event.',
    ],
    examRelevance: 'SSC CGL Tier 1, Banking Clerk, RRB General Awareness',
    source: 'Sports Authority of India (SAI)',
  },
];

interface CurrentAffairsProps {
  user?: UserProfile;
}

export const CurrentAffairs: React.FC<CurrentAffairsProps> = ({ user }) => {
  const [newsList, setNewsList] = useState<CurrentAffairsItem[]>(MOCK_CURRENT_AFFAIRS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'feed' | 'saved'>('feed');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const uid = user?.uid || 'guest';

  // Load saved bookmarks from LocalStorage & Firestore
  useEffect(() => {
    const localSaved = localStorage.getItem(`saved_affairs_${uid}`);
    if (localSaved) {
      try {
        setSavedIds(JSON.parse(localSaved));
      } catch (e) {
        // Fallback
      }
    }

    if (db && uid !== 'guest') {
      const fetchSavedFromFirestore = async () => {
        try {
          const subcollRef = collection(db, 'users', uid, 'saved_affairs');
          const snap = await getDocs(subcollRef);
          if (!snap.empty) {
            const firestoreSavedIds: string[] = [];
            snap.forEach((docSnap) => {
              firestoreSavedIds.push(docSnap.id);
            });
            setSavedIds(firestoreSavedIds);
            localStorage.setItem(`saved_affairs_${uid}`, JSON.stringify(firestoreSavedIds));
          }
        } catch (err) {
          console.warn('Firestore saved_affairs fetch note:', err);
        }
      };
      fetchSavedFromFirestore();
    }
  }, [uid]);

  // Toggle Bookmark Handler (updates local state & users/{uid}/saved_affairs)
  const handleToggleBookmark = async (item: CurrentAffairsItem) => {
    const isCurrentlySaved = savedIds.includes(item.id);
    const updatedIds = isCurrentlySaved
      ? savedIds.filter((id) => id !== item.id)
      : [...savedIds, item.id];

    setSavedIds(updatedIds);
    localStorage.setItem(`saved_affairs_${uid}`, JSON.stringify(updatedIds));

    // Firebase Subcollection Sync: users/{uid}/saved_affairs
    if (db && uid !== 'guest') {
      try {
        const docRef = doc(db, 'users', uid, 'saved_affairs', item.id);
        if (isCurrentlySaved) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, {
            newsId: item.id,
            headline: item.headline,
            category: item.category,
            date: item.date,
            savedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('Firebase saved_affairs toggle note:', err);
      }
    }
  };

  const handleShare = (item: CurrentAffairsItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${item.headline}\n${item.description}\nSource: ${item.source}`);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const categories = [
    'All',
    'National',
    'International',
    'Banking & Economy',
    'Science & Defense',
    'Sports',
  ];

  // Filtering Logic
  const filteredNews = newsList.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDate = !selectedDate || item.date === selectedDate;
    const matchesSearch =
      !searchQuery ||
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.examRelevance.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesViewMode = viewMode === 'feed' || savedIds.includes(item.id);

    return matchesCategory && matchesDate && matchesSearch && matchesViewMode;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-sky-600 text-white shadow-lg">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Date-wise Current Affairs Feed
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Exam Targeted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                High-yield daily news summaries, key takeaways & exam relevance tags for UPSC, SSC & Banking
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'feed'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Timeline Feed</span>
            </button>

            <button
              onClick={() => setViewMode('saved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'saved'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Articles ({savedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Sleek Dark Date Picker & Category Pills */}
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Box */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search headlines, keywords, or exams (e.g., RBI, ISRO, SSC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Sleek Dark Date Picker */}
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Calendar className="w-4 h-4 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                />
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs"
                  title="Clear Date Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-2 flex items-center justify-end">
              <span className="text-xs text-slate-400 font-mono">
                Count: <strong className="text-slate-200">{filteredNews.length}</strong>
              </span>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline Feed Section */}
      <div className="relative pl-3 md:pl-6 space-y-6">
        {/* Timeline Line */}
        <div className="absolute left-3 md:left-6 top-3 bottom-3 w-0.5 bg-slate-800 -translate-x-1/2" />

        {filteredNews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3 ml-6">
            <Newspaper className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Current Affairs Articles Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No news matches your selected date ({selectedDate || 'Any'}) or search criteria. Try resetting the filters.
            </p>
          </div>
        ) : (
          filteredNews.map((item) => {
            const isSaved = savedIds.includes(item.id);

            return (
              <div key={item.id} className="relative pl-6 md:pl-8 group">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-6 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-sky-500 ring-4 ring-slate-950 group-hover:bg-amber-400 transition-colors" />

                {/* News Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-colors space-y-3">
                  {/* Card Header: Category Tag & Date & Bookmark */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {item.date}
                      </span>
                    </div>

                    {/* Bookmark Icon Button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShare(item)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                        title="Copy Summary"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleToggleBookmark(item)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                        }`}
                        title={isSaved ? 'Remove from Saved Affairs' : 'Save/Bookmark Article'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-purple-300 fill-purple-300/30" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* News Headline */}
                  <h2 className="text-base font-bold text-slate-100 leading-snug">
                    {item.headline}
                  </h2>

                  {/* News Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* High-Yield Key Takeaways */}
                  {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        📌 High-Yield Exam Points:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {item.keyTakeaways.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Card Footer: Exam Relevance & Source */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Target Exams: <strong className="text-slate-200">{item.examRelevance}</strong>
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 italic">
                      Source: {item.source}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CurrentAffairs;
