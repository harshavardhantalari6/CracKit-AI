import React, { useState } from 'react';
import { JobAlert, UserProfile } from '../types';
import { Briefcase, Send, CheckCircle2, MessageSquare, Mail, ExternalLink, Sparkles, Filter, Bell, Clock, Building2, Landmark } from 'lucide-react';

interface JobAlertsViewProps {
  alerts: JobAlert[];
  user: UserProfile;
  onLaunchTestForJob: (jobTitle: string, tags: string[]) => void;
}

export const JobAlertsView: React.FC<JobAlertsViewProps> = ({ alerts, user, onLaunchTestForJob }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'govt' | 'railway' | 'teaching' | 'it'>('all');
  const [sentEmailJobId, setSentEmailJobId] = useState<string | null>(null);
  const [sentWhatsappJobId, setSentWhatsappJobId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterCategory === 'all') return true;
    return alert.category === filterCategory;
  });

  const handleSendEmailAlert = (job: JobAlert) => {
    setSentEmailJobId(job.jobId);
    setTimeout(() => {
      setSentEmailJobId(null);
    }, 3000);
  };

  const handleSendWhatsappAlert = (job: JobAlert) => {
    setSentWhatsappJobId(job.jobId);
    setTimeout(() => {
      setSentWhatsappJobId(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Card */}
      <div className="glass-card p-6 rounded-3xl space-y-2 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Smart Job Match Alerts</h2>
            <p className="text-sm text-slate-300">
              Personalized recruitment alerts for Government & IT Corporate hiring synced with Resend & WhatsApp webhooks.
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'all', label: 'All Match Alerts' },
            { id: 'govt', label: 'Govt & Banking' },
            { id: 'railway', label: 'Railway Exams' },
            { id: 'teaching', label: 'Teaching Exams' },
            { id: 'it', label: 'IT Corporate' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {filteredAlerts.map((job) => (
          <div
            key={job.jobId}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 text-xs font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {job.matchedPercent}% Profile Match
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${
                    job.category === 'railway'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : job.category === 'teaching'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : job.category === 'govt'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  {job.category === 'railway'
                    ? 'Railway Exam'
                    : job.category === 'teaching'
                    ? 'Teaching Exam'
                    : job.category === 'govt'
                    ? 'Govt & Banking'
                    : 'IT Corporate Drive'}
                </span>
                <span className="text-xs text-slate-400">{job.location}</span>
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
              <p className="text-xs text-slate-300 font-semibold">{job.companyOrDept} • {job.salaryOrGrade}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-slate-400 self-center font-medium mr-1">Syllabus Tags:</span>
                {job.syllabusTags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 text-xs bg-slate-900/80 text-slate-300 rounded-lg border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col items-end gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
              {/* Trigger Instant PYQ Test Launcher */}
              <button
                onClick={() => onLaunchTestForJob(job.title, job.syllabusTags)}
                className="w-full lg:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Practice PYQ Mock Test</span>
              </button>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg hover:scale-105"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleSendEmailAlert(job)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    sentEmailJobId === job.jobId
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="Send Email Alert"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{sentEmailJobId === job.jobId ? 'Sent!' : 'Email Alert'}</span>
                </button>

                <button
                  onClick={() => handleSendWhatsappAlert(job)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    sentWhatsappJobId === job.jobId
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="WhatsApp Alert"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{sentWhatsappJobId === job.jobId ? 'Hook Sent!' : 'WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const JobAlerts = JobAlertsView;

