import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Landmark,
  Compass,
  TrendingUp,
  Monitor,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  ArrowLeft,
  X,
  Tag,
  Award,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';

export interface GKFactTopic {
  id: string;
  title: string;
  highYieldPoints: string[];
  pyqNote: string;
}

export interface GKCategoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  topics: GKFactTopic[];
}

export const STATIC_GK_DATA: GKCategoryItem[] = [
  {
    id: 'polity',
    name: 'Indian Polity',
    description: 'Constitutional Articles, Writs, Preamble & Amendments',
    icon: Landmark,
    badge: 'High Yield',
    topics: [
      {
        id: 'pol-1',
        title: 'Article 370 & Special Status Provisions',
        highYieldPoints: [
          'Article 370 was abrogated on August 5, 2019, removing Jammu & Kashmir special status.',
          'Replaced J&K into two Union Territories: J&K and Ladakh under the J&K Reorganisation Act 2019.',
          'Article 371 (A-J) retains special provisions for states like Nagaland, Assam, Manipur, and Andhra Pradesh.',
        ],
        pyqNote: 'UPSC CSE & SSC CGL 2023: Article 371A gives special provisions to Nagaland.',
      },
      {
        id: 'pol-2',
        title: 'Important Articles & Fundamental Rights',
        highYieldPoints: [
          'Article 14: Equality before law and equal protection of laws.',
          'Article 17: Abolition of Untouchability (Enforceable offense under law).',
          'Article 21: Protection of life and personal liberty (Includes Right to Privacy).',
          'Article 32: Right to Constitutional Remedies (5 Writs: Habeas Corpus, Mandamus, Quo-Warranto, Certiorari, Prohibition).',
          'Article 368: Power of Parliament to amend the Constitution.',
        ],
        pyqNote: 'SSC CGL 2024 Tier 1: Dr. B.R. Ambedkar termed Article 32 as Heart & Soul of Constitution.',
      },
      {
        id: 'pol-3',
        title: 'Key Amendments to the Indian Constitution',
        highYieldPoints: [
          '42nd Amendment (1976): Added Socialist, Secular, Integrity to Preamble (Mini-Constitution).',
          '44th Amendment (1978): Removed Right to Property from Fundamental Rights to Legal Right (Art 300A).',
          '61st Amendment (1989): Reduced voting age from 21 years to 18 years under Article 326.',
          '103rd Amendment (2019): Introduced 10% EWS reservation in jobs and education.',
        ],
        pyqNote: 'IBPS PO & SSC: 61st Amendment brought voting age reduction in 1989.',
      },
    ],
  },
  {
    id: 'history',
    name: 'Indian History',
    description: 'Indus Valley, Vedic Age, Medieval Empires & Modern Freedom Struggle',
    icon: BookOpen,
    badge: 'PYQ Core',
    topics: [
      {
        id: 'hist-1',
        title: 'Indus Valley Civilization & Major Dockyards',
        highYieldPoints: [
          'Harappa: Located on Ravi River (discovered by Dayaram Sahni in 1921).',
          'Mohenjo-Daro: "Mound of the Dead" on Indus River (Great Bath & Bronze Dancing Girl).',
          'Lothal: Only artificial brick dockyard site located in Gujarat on Bhogavo River.',
          'Kalibangan: Rajasthan site famous for ploughed field evidence & camel bones.',
        ],
        pyqNote: 'SSC CGL 2023: Lothal was the major port city and dockyard of the Indus Valley.',
      },
      {
        id: 'hist-2',
        title: 'Governor-Generals & Freedom Movement Milestones',
        highYieldPoints: [
          'Warren Hastings: First Governor-General of Bengal (Regulating Act 1773).',
          'Lord William Bentinck: Abolished Sati System in 1829 with Raja Ram Mohan Roy.',
          'Lord Dalhousie: Introduced Doctrine of Lapse & 1st Railway line (Mumbai-Thane 1853).',
          '1911 Delhi Durbar: Partition of Bengal annulled; capital shifted from Calcutta to Delhi.',
        ],
        pyqNote: 'RRB NTPC 2023: Lord Bentinck abolished Sati practice under Regulation XVII of 1829.',
      },
    ],
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Longest Rivers, Highest Peaks, Dams, Passes & National Parks',
    icon: Compass,
    badge: 'Popular',
    topics: [
      {
        id: 'geo-1',
        title: 'Longest Rivers & Major Dams in India',
        highYieldPoints: [
          'Ganges (2,525 km): Longest river originating inside India.',
          'Godavari (1,465 km): Longest peninsular river (also called Dakshin Ganga).',
          'Tehri Dam: Highest dam in India (Bhagirathi River, Uttarakhand - 260.5m height).',
          'Hirakud Dam: Longest dam in India (Mahanadi River, Odisha - 25.8 km total length).',
          'Sardar Sarovar Dam: Located on Narmada River in Gujarat.',
        ],
        pyqNote: 'SSC CHSL 2024: Hirakud Dam is built on Mahanadi River in Sambalpur.',
      },
      {
        id: 'geo-2',
        title: 'Important Mountain Passes & National Parks',
        highYieldPoints: [
          'Zoji La Pass: Connects Srinagar to Leh (Ladakh region).',
          'Nathu La Pass: Connects Sikkim with Tibet Autonomous Region.',
          'Jim Corbett National Park: India’s first national park (Est. 1936, Uttarakhand).',
          'Kaziranga National Park: World Heritage site famous for One-Horned Rhinoceros (Assam).',
          'Hemis National Park: Largest and highest altitude national park in India (Ladakh).',
        ],
        pyqNote: 'UPSC Prelims & Defense: Hemis is the largest national park in India.',
      },
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    description: 'RBI Monetary Policy, Five Year Plans, Inflation & National Income',
    icon: TrendingUp,
    badge: 'Banking Focus',
    topics: [
      {
        id: 'eco-1',
        title: 'Reserve Bank of India (RBI) & Monetary Tools',
        highYieldPoints: [
          'Established: April 1, 1935 under RBI Act 1934 on recommendation of Hilton Young Commission.',
          'Nationalization: RBI nationalized on January 1, 1949.',
          'Repo Rate: Interest rate at which RBI lends short-term money to commercial banks.',
          'Reverse Repo Rate: Interest rate at which RBI absorbs liquidity from commercial banks.',
          'CRR (Cash Reserve Ratio): Mandatory percentage of deposits banks must maintain with RBI in cash.',
        ],
        pyqNote: 'SBI PO 2023: Hilton Young Commission recommended setting up RBI in 1926.',
      },
    ],
  },
  {
    id: 'computer',
    name: 'Computer Awareness',
    description: 'OS Basics, Networking Protocols, Cybersecurity & Key Shortcuts',
    icon: Monitor,
    badge: 'Tech & IT',
    topics: [
      {
        id: 'comp-1',
        title: 'Networking OSI Model & Key Protocols',
        highYieldPoints: [
          'OSI Model: 7 Layers (Physical, Data Link, Network, Transport, Session, Presentation, Application).',
          'HTTP (Port 80) / HTTPS (Port 443): HyperText Transfer Protocol for Web browsing.',
          'DNS (Domain Name System - Port 53): Translates domain names to IP addresses.',
          'IPv4 address is 32-bit; IPv6 address is 128-bit.',
        ],
        pyqNote: 'TCS NQT & IBPS IT Officer: Transport Layer handles end-to-end flow control (TCP/UDP).',
      },
    ],
  },
  {
    id: 'days',
    name: 'Important Days',
    description: 'National & International Observances, Themes & Headquarters',
    icon: Calendar,
    badge: 'Quick Facts',
    topics: [
      {
        id: 'day-1',
        title: 'Key International Days & Observances',
        highYieldPoints: [
          'March 8: International Women’s Day.',
          'April 22: World Earth Day.',
          'June 5: World Environment Day.',
          'June 21: International Day of Yoga.',
          'December 10: Human Rights Day.',
        ],
        pyqNote: 'RRB NTPC & SSC: World Environment Day established by UN General Assembly in 1972.',
      },
    ],
  },
];

export const StaticGK: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedTopicIds, setExpandedTopicIds] = useState<Record<string, boolean>>({});

  const toggleAccordion = (topicId: string) => {
    setExpandedTopicIds((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const activeCategory = STATIC_GK_DATA.find((cat) => cat.id === activeCategoryId);

  // Global search filtering across all categories & topics
  const searchResults: { categoryName: string; topic: GKFactTopic }[] = [];
  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    STATIC_GK_DATA.forEach((cat) => {
      cat.topics.forEach((topic) => {
        if (
          topic.title.toLowerCase().includes(query) ||
          topic.highYieldPoints.some((pt) => pt.toLowerCase().includes(query)) ||
          topic.pyqNote.toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query)
        ) {
          searchResults.push({
            categoryName: cat.name,
            topic,
          });
        }
      });
    });
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-600 text-white shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Static GK Fact Repository
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Exam Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                High-yield static facts, articles, rivers, dams & historical milestones verified against past year papers
              </p>
            </div>
          </div>

          {activeCategoryId && !searchQuery && (
            <button
              onClick={() => setActiveCategoryId(null)}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Back to Categories</span>
            </button>
          )}
        </div>

        {/* Sticky Search Bar */}
        <div className="pt-4 sticky top-0 z-10 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entire static GK repository (e.g., 'Article 370', 'Longest River', 'RBI', 'Harappa')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. SEARCH RESULTS VIEW */}
      {searchQuery.trim().length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                Search Results for "{searchQuery}" ({searchResults.length})
              </span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Filtered Across {STATIC_GK_DATA.length} Categories
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No matching static GK facts found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try searching for broader terms like 'Dams', 'Articles', 'Harappa', or 'Rivers'.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(({ categoryName, topic }) => (
                <div
                  key={topic.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {categoryName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">High-Yield Fact</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">{topic.title}</h3>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {topic.highYieldPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 italic">
                    💡 <strong className="text-amber-400 font-normal">PYQ Note:</strong> {topic.pyqNote}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeCategory ? (
        /* 2. CATEGORY ACCORDION VIEW */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{activeCategory.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {activeCategory.topics.length} Topics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeCategory.description}</p>
            </div>

            <button
              onClick={() => setActiveCategoryId(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Back to All Categories
            </button>
          </div>

          <div className="space-y-3">
            {activeCategory.topics.map((topic) => {
              const isExpanded = expandedTopicIds[topic.id] ?? true;

              return (
                <div
                  key={topic.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-colors"
                >
                  {/* Accordion Header */}
                  <div
                    onClick={() => toggleAccordion(topic.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-100">{topic.title}</h3>
                    </div>
                    <button className="p-1 rounded-lg bg-slate-950 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Accordion Content Panel */}
                  {isExpanded && (
                    <div className="p-5 pt-2 border-t border-slate-800 bg-slate-900/60 space-y-3">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                          Core Facts & High-Yield Bullet Points:
                        </span>
                        <ul className="space-y-2 text-xs text-slate-200">
                          {topic.highYieldPoints.map((pt, idx) => (
                            <li
                              key={idx}
                              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono">
                        <strong className="text-amber-400">PYQ Pattern Note:</strong> {topic.pyqNote}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. CATEGORY GRID VIEW (grid-cols-2 md:grid-cols-3 lg:grid-cols-4) */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {STATIC_GK_DATA.map((cat) => {
            const IconComponent = cat.icon;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors cursor-pointer group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 group-hover:text-amber-300 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-normal line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{cat.topics.length} Topics</span>
                  <span className="text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    Explore →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaticGK;
