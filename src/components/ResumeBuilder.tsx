import React, { useState } from 'react';
import { UserProfile } from '../types';
import { analyzeResumeAi } from '../services/api';
import {
  FileText,
  Sparkles,
  Printer,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
  Award,
  AlertTriangle,
  Copy,
  Check,
  Target,
  ListChecks,
  FileCode2,
} from 'lucide-react';

interface ResumeBuilderProps {
  user: UserProfile;
}

interface AtsAnalysisResult {
  atsScore: number;
  scoreLabel: string;
  summary: string;
  missingKeywords: string[];
  formattingFixes: string[];
  actionableSuggestions: string[];
  optimizedResumeText: string;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user }) => {
  const [activeInputMode, setActiveInputMode] = useState<'structured' | 'paste'>('structured');
  
  // Structured form state
  const [fullName, setFullName] = useState(user.displayName || 'Aspirant Candidate');
  const [targetRole, setTargetRole] = useState('FullStack Software Engineer / TCS Digital & Infosys Specialist');
  const [email, setEmail] = useState(user.email || 'candidate@example.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [skillsInput, setSkillsInput] = useState('React.js, Node.js, TypeScript, PostgreSQL, Python, Data Structures & Algorithms, System Design, REST APIs');

  const [experiences, setExperiences] = useState([
    {
      title: 'Software Engineer Intern',
      company: 'Tech Solutions Pvt Ltd',
      period: 'Jan 2025 - Jun 2025',
      description: 'Built RESTful microservices and optimized PostgreSQL database queries reducing API latency by 35%.',
    },
  ]);

  const [education, setEducation] = useState([
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'National Institute of Technology',
      year: '2022 - 2026',
      score: '8.8 CGPA',
    },
  ]);

  const [projects, setProjects] = useState([
    {
      name: 'CrackIt AI Exam & Placement Portal',
      description: 'Built full-stack AI mock test platform with dynamic test generation, multimodal tutor, and ATS scanner.',
      techStack: ['Next.js', 'Firebase', 'Gemini API', 'Tailwind CSS'],
    },
  ]);

  // Raw paste state
  const [rawResumeText, setRawResumeText] = useState(`Candidate Name: ${fullName}
Email: ${email} | Phone: ${phone}
Target Role: ${targetRole}

SUMMARY:
Motivated Computer Science graduate with strong hands-on experience in full-stack web development, REST APIs, and database management systems. Seeking Software Engineering drive opportunities at top IT firms and MNCs.

SKILLS:
JavaScript, React.js, Node.js, Express.js, PostgreSQL, Git, Data Structures, Algorithms.

EXPERIENCE:
Software Engineer Intern - Tech Solutions Pvt Ltd (2025)
- Developed responsive web interfaces using React.js and Tailwind CSS.
- Assisted in building backend API endpoints with Node.js and Express.

EDUCATION:
B.Tech in Computer Science & Engineering (2022 - 2026) - 8.8 CGPA`);

  // Analysis Result state
  const [analysisResult, setAnalysisResult] = useState<AtsAnalysisResult | null>({
    atsScore: 78,
    scoreLabel: 'Good ATS Match - High Keyword Potential',
    summary: 'Strong foundational technical skills detected. Adding missing domain keywords and metric-quantified impact bullets will boost your rank to 90%+ in TCS NQT & Infosys screening.',
    missingKeywords: ['Docker & Containerization', 'CI/CD Pipelines', 'System Architecture', 'Microservices', 'Jest / Unit Testing', 'Redis Caching'],
    formattingFixes: [
      'Use strong metric-driven action verbs (e.g. "Reduced query response time by 35%")',
      'Ensure standard uppercase section headers (e.g., PROFESSIONAL SUMMARY, TECHNICAL SKILLS)',
      'Include target job role title explicitly in the summary line',
    ],
    actionableSuggestions: [
      'Quantify achievements in Internship bullet points with metrics and percentages',
      'Mention cloud services or containerization tools used in full-stack projects',
      'Format skills into distinct subcategories (Languages, Frameworks, Databases, Tools)',
    ],
    optimizedResumeText: `PROFESSIONAL SUMMARY
High-performing Computer Science Engineer specializing in ${targetRole}. Proven track record in building scalable full-stack applications with React.js, Node.js, and PostgreSQL. Adept in Data Structures, System Design, and API performance optimization.

CORE TECHNICAL SKILLS
- Programming Languages: JavaScript (ES6+), TypeScript, Python, SQL, C++
- Web Technologies: React.js, Node.js, Express.js, Next.js, HTML5/CSS3, Tailwind CSS
- Databases & Tools: PostgreSQL, MongoDB, Docker, Git, RESTful APIs, Jest, Postman

PROFESSIONAL EXPERIENCE
Software Engineer Intern | Tech Solutions Pvt Ltd (Jan 2025 - Jun 2025)
• Architected and deployed 12 RESTful microservice API endpoints using Node.js and Express, serving 10,000+ daily requests.
• Optimized PostgreSQL database indexing and query pipelines, cutting system response latency by 35%.
• Collaborated in an Agile team of 6 engineers to build React.js user dashboards with full accessibility compliance.

FEATURED PROJECTS
CrackIt AI Exam & Placement Portal
• Engineered full-stack AI test engine integrating Gemini API for real-time question generation and multimodal doubt solving.
• Implemented secure state persistence and responsive glassmorphic UI using React 18, TypeScript, and Tailwind CSS.

EDUCATION
B.Tech in Computer Science & Engineering
National Institute of Technology | 2022 - 2026 | CGPA: 8.8 / 10.0`,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    try {
      const skillsList = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const data = await analyzeResumeAi({
        targetRole,
        rawResumeText: activeInputMode === 'paste' ? rawResumeText : undefined,
        fullName: activeInputMode === 'structured' ? fullName : undefined,
        skills: activeInputMode === 'structured' ? skillsList : undefined,
        experience: activeInputMode === 'structured' ? experiences : undefined,
        education: activeInputMode === 'structured' ? education : undefined,
        projects: activeInputMode === 'structured' ? projects : undefined,
      });

      setAnalysisResult(data);
    } catch (e: any) {
      console.error('Error analyzing resume:', e);
      alert('Failed to analyze resume: ' + (e?.message || 'Check network connection'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddKeywordToSkills = (keyword: string) => {
    if (!skillsInput.toLowerCase().includes(keyword.toLowerCase())) {
      setSkillsInput((prev) => (prev ? `${prev}, ${keyword}` : keyword));
    }
  };

  const handleCopyText = () => {
    if (analysisResult?.optimizedResumeText) {
      navigator.clipboard.writeText(analysisResult.optimizedResumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Score circular ring color calculations
  const score = analysisResult?.atsScore || 0;
  const strokeDashoffset = 283 - (283 * score) / 100;
  const getScoreColorClass = () => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 60) return { stroke: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    return { stroke: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const colorMeta = getScoreColorClass();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Title Banner */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-sky-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
              HARSHA'S Studio AI
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">ATS Resume Scanner & AI Optimizer</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Scan your resume against top recruiter ATS algorithms (TCS NQT, Infosys, Wipro, Amazon, SSC & Bank drives). Get an instant circular ATS score, missing keywords, and Gemini optimized resume text.
          </p>
        </div>

        <button
          onClick={handleAnalyzeResume}
          disabled={isAnalyzing}
          className="glass-button-primary px-6 py-3.5 rounded-2xl text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2.5 w-full lg:w-auto shrink-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Scanning Resume & Gemini Optimization...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Analyze & Optimize Resume</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Left Workspace Input, Right ATS Score & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Builder / Raw Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Target Role Selector & Mode Toggle */}
          <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400" /> Target Job Role / Placement Drive
              </label>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveInputMode('structured')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeInputMode === 'structured'
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Structured Builder
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputMode('paste')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeInputMode === 'paste'
                      ? 'bg-sky-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Raw Resume
                </button>
              </div>
            </div>

            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. FullStack Software Engineer / TCS Digital"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
            />
          </div>

          {/* Input Mode 1: Raw Resume Paste Area */}
          {activeInputMode === 'paste' ? (
            <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-400" /> Raw Resume Text Content
                </h3>
                <span className="text-[10px] text-slate-400">Paste your existing resume plain text here</span>
              </div>
              <textarea
                rows={16}
                value={rawResumeText}
                onChange={(e) => setRawResumeText(e.target.value)}
                placeholder="Paste raw resume text, LinkedIn profile summary, or experience bullets..."
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs font-mono leading-relaxed resize-y custom-scrollbar"
              />
            </div>
          ) : (
            /* Input Mode 2: Structured Forms */
            <div className="space-y-6">
              {/* Basic Candidate Info */}
              <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" /> Candidate Personal Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">
                    Technical Skills (Comma Separated)
                  </label>
                  <textarea
                    rows={3}
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs resize-none"
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" /> Work Experience & Internships
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setExperiences([
                        ...experiences,
                        { title: 'Full Stack Project Intern', company: 'Self/Freelance', period: '2025', description: 'Engineered web apps.' },
                      ])
                    }
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3 relative group">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Role #{idx + 1}</span>
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].title = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Job Title / Role"
                        className="px-3 py-1.5 rounded-lg glass-input text-xs"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[idx].company = e.target.value;
                          setExperiences(updated);
                        }}
                        placeholder="Company Name"
                        className="px-3 py-1.5 rounded-lg glass-input text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[idx].description = e.target.value;
                        setExperiences(updated);
                      }}
                      placeholder="Metric-quantified bullet impact (e.g. Reduced response times by 30%)..."
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none"
                    />
                  </div>
                ))}
              </div>

              {/* Featured Projects */}
              <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" /> Key Technical Projects
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setProjects([
                        ...projects,
                        { name: 'AI Microservice App', description: 'Built automated pipeline.', techStack: ['Python', 'Docker'] },
                      ])
                    }
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2">
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].name = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="Project Name"
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="Project summary and impact..."
                      className="w-full px-3 py-1.5 rounded-lg glass-input text-xs resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Circular ATS Score Meter & Actionable Feedback (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Circular Glowing ATS Progress Ring */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-b from-slate-900/90 to-slate-950/95 relative overflow-hidden text-center shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">ATS Match Score Ring</h3>
                <p className="text-[11px] text-slate-400">Target Role: {targetRole}</p>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${colorMeta.bg} ${colorMeta.text} ${colorMeta.border} border`}>
                {analysisResult?.scoreLabel || 'Ready to Scan'}
              </span>
            </div>

            {/* Glowing SVG Circular Meter */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Glowing Progress Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={colorMeta.stroke}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 10px ${colorMeta.stroke})`,
                  }}
                />
              </svg>

              {/* Center Percentage Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${colorMeta.text} tracking-tight`}>
                  {score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">
                  ATS MATCH
                </span>
              </div>
            </div>

            {/* Executive Summary */}
            {analysisResult?.summary && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-left">
                {analysisResult.summary}
              </p>
            )}
          </div>

          {/* Missing Keywords Box */}
          {analysisResult?.missingKeywords && analysisResult.missingKeywords.length > 0 && (
            <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing ATS Keywords
                </h4>
                <span className="text-[10px] text-amber-300/80">Click to auto-add</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.missingKeywords.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddKeywordToSkills(kw)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1 group cursor-pointer"
                  >
                    <span>+ {kw}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formatting & Actionable Suggestions */}
          {analysisResult?.actionableSuggestions && (
            <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-sky-400" /> Actionable Fixes & Impact Boosters
              </h4>
              <ul className="space-y-2">
                {analysisResult.formattingFixes?.map((fix, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{fix}</span>
                  </li>
                ))}
                {analysisResult.actionableSuggestions?.map((sug, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Gemini Optimized Resume Text Preview */}
      {analysisResult?.optimizedResumeText && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 bg-slate-950/90 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" /> Gemini Optimized ATS Resume Text
              </h3>
              <p className="text-xs text-slate-400">Copy this formatted text or print directly for drive applications.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Resume Text'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>

          <pre className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-white/10 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
            {analysisResult.optimizedResumeText}
          </pre>
        </div>
      )}
    </div>
  );
};

export const ATSResumeBuilder = ResumeBuilder;
