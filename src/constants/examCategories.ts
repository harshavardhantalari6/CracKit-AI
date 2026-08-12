export interface ExamInfo {
  id: string;
  name: string;
  category: 'govt' | 'railway' | 'teaching' | 'it';
  categoryLabel: string;
  badgeColor: string; // Tailwind color classes for badges/chips
  desc: string;
  topics: string[];
}

export interface ExamCategoryGroup {
  id: 'govt' | 'railway' | 'teaching' | 'it';
  label: string;
  description: string;
  color: string; // Accent color class
  exams: ExamInfo[];
}

export const EXAM_CATEGORY_GROUPS: ExamCategoryGroup[] = [
  {
    id: 'govt',
    label: 'Core Govt & Banking Exams',
    description: 'Central & State administrative, Civil Services, and Bank PO/Clerk recruitment drives',
    color: 'from-amber-500 to-orange-600',
    exams: [
      {
        id: 'ssc_cgl',
        name: 'SSC CGL',
        category: 'govt',
        categoryLabel: 'Govt & Banking',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        desc: 'Staff Selection Commission Combined Graduate Level (Tier 1 & Tier 2)',
        topics: ['Quantitative Aptitude', 'Reasoning & Intelligence', 'English Comprehension', 'General Awareness & Science'],
      },
      {
        id: 'ssc_chsl',
        name: 'SSC CHSL',
        category: 'govt',
        categoryLabel: 'Govt & Banking',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        desc: 'Combined Higher Secondary Level (LDC, DEO, PA/SA)',
        topics: ['General Intelligence', 'English Language', 'Quantitative Aptitude', 'General Awareness'],
      },
      {
        id: 'upsc_cse',
        name: 'UPSC Civil Services',
        category: 'govt',
        categoryLabel: 'Govt & Banking',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        desc: 'IAS, IPS, IFS Prelims & Mains General Studies and CSAT',
        topics: ['Indian Polity & Constitution', 'Modern History', 'Indian Economy', 'CSAT Quantitative', 'Current Affairs'],
      },
      {
        id: 'ibps_po',
        name: 'IBPS PO',
        category: 'govt',
        categoryLabel: 'Govt & Banking',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        desc: 'Institute of Banking Personnel Selection Probationary Officer',
        topics: ['Data Interpretation & Analysis', 'Reasoning Ability & Computer', 'English Language', 'Banking & Economy Awareness'],
      },
      {
        id: 'sbi_clerk',
        name: 'SBI Clerk',
        category: 'govt',
        categoryLabel: 'Govt & Banking',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        desc: 'State Bank of India Junior Associate Prelims & Mains',
        topics: ['Numerical Ability', 'Reasoning Ability', 'General & Financial Awareness', 'General English'],
      },
    ],
  },
  {
    id: 'railway',
    label: 'Railway Recruitment Board (RRB)',
    description: 'Indian Railways non-technical, loco pilot, group D, and engineering cadres',
    color: 'from-sky-500 to-indigo-600',
    exams: [
      {
        id: 'rrb_ntpc',
        name: 'RRB NTPC',
        category: 'railway',
        categoryLabel: 'Railway Exams',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        desc: 'Non-Technical Popular Categories (Station Master, Goods Guard, Clerk)',
        topics: ['Mathematics & Arithmetic', 'General Intelligence & Reasoning', 'General Science (Physics, Bio, Chem)', 'General Awareness'],
      },
      {
        id: 'rrb_alp',
        name: 'RRB ALP',
        category: 'railway',
        categoryLabel: 'Railway Exams',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        desc: 'Assistant Loco Pilot & Technicians Stage 1 & CBT 2',
        topics: ['Mathematics', 'Mental Ability', 'Basic Science & Engineering', 'General Awareness'],
      },
      {
        id: 'rrb_group_d',
        name: 'RRB Group D',
        category: 'railway',
        categoryLabel: 'Railway Exams',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        desc: 'Track Maintainer Grade IV, Helper/Assistant in Indian Railways',
        topics: ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'General Awareness on Current Affairs'],
      },
      {
        id: 'rrb_je',
        name: 'RRB JE',
        category: 'railway',
        categoryLabel: 'Railway Exams',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        desc: 'Junior Engineer (Civil, Electrical, Mechanical, Signal & Telecom)',
        topics: ['Technical Engineering Abilities', 'General Physics & Chemistry', 'Computer Applications', 'Environmental Science'],
      },
    ],
  },
  {
    id: 'teaching',
    label: 'Teaching & Academia Exams',
    description: 'Central, state teacher eligibility, and district selection committees (DSC / TRT)',
    color: 'from-emerald-500 to-teal-600',
    exams: [
      {
        id: 'ctet',
        name: 'CTET',
        category: 'teaching',
        categoryLabel: 'Teaching Exams',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        desc: 'Central Teacher Eligibility Test (Paper I Primary & Paper II Upper Primary)',
        topics: ['Child Development & Pedagogy', 'Language I & Language II', 'Mathematics Pedagogy', 'Environmental Studies (EVS)'],
      },
      {
        id: 'tet',
        name: 'TET (State Teacher Eligibility)',
        category: 'teaching',
        categoryLabel: 'Teaching Exams',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        desc: 'State Eligibility Test for School Teachers (TS TET, AP TET, UPTET)',
        topics: ['Child Psychology & Pedagogy', 'Language Ability & Grammar', 'Aptitude & Methodology', 'Subject Specific Methodology'],
      },
      {
        id: 'state_dsc_trt',
        name: 'State DSC / TRT',
        category: 'teaching',
        categoryLabel: 'Teaching Exams',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        desc: 'District Selection Committee / Teacher Recruitment Test for SGT & SA',
        topics: ['Perspectives in Education', 'School Subject Content (Math, Science, Social)', 'Teaching Methodology', 'General Knowledge & Current Affairs'],
      },
    ],
  },
  {
    id: 'it',
    label: 'IT & Corporate Campus Drives',
    description: 'Top IT MNCs, campus placement drives, and product software engineering roles',
    color: 'from-purple-500 to-pink-600',
    exams: [
      {
        id: 'tcs_nqt',
        name: 'TCS NQT',
        category: 'it',
        categoryLabel: 'IT & Corporate',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        desc: 'Tata Consultancy Services National Qualifier Test (Cognitive & Coding)',
        topics: ['Numerical Ability', 'Verbal Ability', 'Reasoning Ability', 'Programming Logic', 'Hands-on Coding'],
      },
      {
        id: 'infosys',
        name: 'Infosys Drives',
        category: 'it',
        categoryLabel: 'IT & Corporate',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        desc: 'System Engineer & Specialist Programmer Recruitment',
        topics: ['Data Structures & Algorithms', 'Pseudo Code Decoding', 'DBMS & SQL Queries', 'Mathematical Ability'],
      },
      {
        id: 'amazon_sde',
        name: 'Amazon SDE',
        category: 'it',
        categoryLabel: 'IT & Corporate',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        desc: 'Software Development Engineer Online Assessment (OA) & Tech Rounds',
        topics: ['Trees & Graphs Algorithms', 'Dynamic Programming', 'Object Oriented Design', 'Scalable System Design'],
      },
      {
        id: 'wipro_nlth',
        name: 'Wipro NLTH',
        category: 'it',
        categoryLabel: 'IT & Corporate',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        desc: 'National Level Talent Hunt for Engineering Freshers',
        topics: ['Logical Reasoning', 'Quantitative Aptitude', 'Verbal English', 'Basic Coding in C++/Java/Python'],
      },
    ],
  },
];

export const ALL_EXAMS: ExamInfo[] = EXAM_CATEGORY_GROUPS.flatMap((group) => group.exams);
