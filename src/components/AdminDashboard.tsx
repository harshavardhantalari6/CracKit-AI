import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db, approveUtrSubmission } from '../lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  Filter,
  Users,
  IndianRupee,
  Calendar,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface AdminDashboardProps {
  user: UserProfile;
  onNavigateTab: (tab: string) => void;
}

export interface UtrRecord {
  submissionId: string;
  uid: string;
  email: string;
  displayName: string;
  utrNumber: string;
  selectedPlan: '3months' | '6months' | string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  proExpiryDate?: string;
}

const STRICT_ADMIN_EMAIL = 'harshavardhantalari6@gmail.com';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigateTab }) => {
  const isAdmin = user.email?.toLowerCase() === STRICT_ADMIN_EMAIL.toLowerCase();

  const [submissions, setSubmissions] = useState<UtrRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('pending');

  // Fetch UTR Submissions from Firestore & API fallback
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      if (db) {
        const subRef = collection(db, 'utrSubmissions');
        const q = query(subRef, orderBy('submittedAt', 'desc'));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const list: UtrRecord[] = [];
          querySnap.forEach((docSnap) => {
            list.push(docSnap.data() as UtrRecord);
          });
          setSubmissions(list);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Firestore fetch failed, using API endpoint fallback:', err);
    }

    // API fallback
    try {
      const res = await fetch(`/api/admin/pending-utrs?adminEmail=${encodeURIComponent(user.email || '')}`, {
        headers: { 'x-admin-email': user.email || '' },
      });
      const data = await res.json();
      if (data.success && data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error('API fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  // Handle Approve UTR Payment
  const handleApprovePayment = async (sub: UtrRecord) => {
    setApprovingId(sub.submissionId);
    try {
      const plan = sub.selectedPlan === '6months' ? '6months' : '3months';
      
      // 1. Approve in Firestore
      if (db) {
        try {
          await approveUtrSubmission(sub.submissionId, sub.uid, plan);
        } catch (fsErr) {
          console.warn('Firestore approve fallback to API:', fsErr);
        }
      }

      // 2. Approve via backend API endpoint
      try {
        await fetch('/api/admin/approve-utr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: user.email,
            submissionId: sub.submissionId,
            uid: sub.uid,
            selectedPlan: plan,
          }),
        });
      } catch (apiErr) {
        console.warn('API approve error:', apiErr);
      }

      // 3. Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.submissionId === sub.submissionId
            ? {
                ...item,
                status: 'approved',
                approvedAt: new Date().toISOString(),
              }
            : item
        )
      );

      setSuccessToast(`Successfully Approved Payment for ${sub.displayName || sub.email}! Pro Plan Unlocked.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve payment. Please check network connection.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // Redirect or Access Denied for Non-Admin
  if (!isAdmin) {
    return (
      <div className="w-full min-h-[500px] flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-rose-500/30 bg-slate-950/95 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Access Denied</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Admin Panel is strictly protected for <span className="font-mono text-purple-300 font-bold">{STRICT_ADMIN_EMAIL}</span>. Your account (<span className="text-slate-300">{user.email}</span>) does not have administrator privileges.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('dashboard')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Return to User Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.utrNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'pending') return matchesSearch && sub.status === 'pending';
    if (filterStatus === 'approved') return matchesSearch && sub.status === 'approved';
    return matchesSearch;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const totalRevenue = submissions
    .filter((s) => s.status === 'approved')
    .reduce((acc, s) => acc + (s.amount || (s.selectedPlan === '6months' ? 249 : 149)), 0);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 pb-12">
      {/* HARSHA'S Studio Ambient Glows (NO dots, NO light artifacts) */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-slate-900/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admin Control Portal
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              HARSHA'S STUDIO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            UTR Payment Verification & Pro Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Logged in as <span className="font-mono text-purple-300 font-bold">{user.email}</span>. Review pending PhonePe / UPI UTR submissions, verify bank transaction references, and grant instant 3-Month or 6-Month Pro Access.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-xl shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-amber-500/30 bg-slate-900/60 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Pending Approvals</p>
            <p className="text-2xl font-black text-amber-300">{pendingCount}</p>
            <p className="text-[11px] text-slate-500">Requires UTR Verification</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-emerald-500/30 bg-slate-900/60 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Approved Pro Members</p>
            <p className="text-2xl font-black text-emerald-300">{approvedCount}</p>
            <p className="text-[11px] text-slate-500">Active Pro Subscriptions</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-purple-500/30 bg-slate-900/60 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400">Verified Revenue</p>
            <p className="text-2xl font-black text-purple-300">₹{totalRevenue}</p>
            <p className="text-[11px] text-slate-500">PhonePe Manual UPI Monetization</p>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Submissions Section Header & Controls */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-slate-900/60 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Pending Payment Submissions
            </h3>
            <p className="text-xs text-slate-400">Click Approve to grant Pro Pass and auto-calculate expiration date.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search UTR, name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10">
              {(['pending', 'approved', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submissions List / Table */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-xs text-slate-400 font-medium">Fetching UTR submissions from Firestore...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-white/5">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No Submissions Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterStatus === 'pending'
                ? 'All pending payment UTRs have been reviewed and approved!'
                : 'No UTR records match your search query.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((sub) => {
              const isApproved = sub.status === 'approved';
              const planLabel = sub.selectedPlan === '6months' ? '6 Months (₹249)' : '3 Months (₹149)';

              return (
                <div
                  key={sub.submissionId}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isApproved
                      ? 'bg-slate-950/40 border-white/10 opacity-80'
                      : 'bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/30 border-purple-500/30 shadow-lg shadow-purple-500/5'
                  }`}
                >
                  {/* User & UTR details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">{sub.displayName || 'Aspirant User'}</span>
                      <span className="text-xs text-slate-400 font-mono">({sub.email})</span>
                      
                      {isApproved ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-400" /> Pending Review
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-xl border border-white/10 font-mono">
                        <span className="text-slate-400">UTR:</span>
                        <span className="font-bold text-purple-300 tracking-wider">{sub.utrNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(sub.utrNumber)}
                          className="p-1 text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
                          title="Copy UTR"
                        >
                          {copiedUtr === sub.utrNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-indigo-300 font-semibold">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Plan: {planLabel}</span>
                      </div>

                      <div className="text-slate-500 text-[11px]">
                        Submitted: {new Date(sub.submittedAt).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    {!isApproved ? (
                      <button
                        onClick={() => handleApprovePayment(sub)}
                        disabled={approvingId === sub.submissionId}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {approvingId === sub.submissionId ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Unlocking Pro...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Approve & Grant Pro</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="text-[11px] text-emerald-400 font-semibold block">
                          Pro Active Until {sub.proExpiryDate ? new Date(sub.proExpiryDate).toLocaleDateString('en-IN') : '3 Months'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
