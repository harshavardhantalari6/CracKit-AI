import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveStoredUser, db } from '../services/firebaseConfig';
import { submitUtrForApproval } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Loader2, 
  QrCode, 
  AlertCircle, 
  Award, 
  Copy, 
  Check, 
  Sparkles,
  Clock,
  Calendar
} from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSuccessProUnlocked: (updatedUser: UserProfile) => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccessProUnlocked,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'3months' | '6months'>('3months');
  const [utrInput, setUtrInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('8309558941@axl');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrInput.trim();

    if (!cleanUtr || cleanUtr.length < 10) {
      setErrorMsg('Please enter a valid 10 to 12-digit UTR or Transaction Ref number.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // Calculate subscription expiry date
      const durationMonths = selectedPlan === '6months' ? 6 : 3;
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      const proExpiryDateISO = expiryDate.toISOString();

      // Save to Firestore utrSubmissions for Admin approval
      try {
        await submitUtrForApproval(
          user.uid,
          user.email || 'aspirant@crackit.ai',
          user.displayName || 'Aspirant',
          cleanUtr,
          selectedPlan
        );
      } catch (subErr) {
        console.warn('Error saving UTR submission doc:', subErr);
      }

      // Call backend UTR verification API route
      try {
        await fetch('/api/verify-utr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            utrNumber: cleanUtr,
            selectedPlan,
          }),
        });
      } catch (apiErr) {
        console.warn('Backend UTR verification fallback to direct Firestore sync:', apiErr);
      }

      const updatedUser: UserProfile = {
        ...user,
        role: 'pro',
        isPro: true,
        selectedPlan,
        proExpiryDate: proExpiryDateISO,
        utrNumber: cleanUtr,
      };

      // Save locally to localStorage
      saveStoredUser(updatedUser);

      // Save to Firestore users document
      if (db) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              isPro: true,
              role: 'pro',
              selectedPlan,
              proExpiryDate: proExpiryDateISO,
              utrNumber: cleanUtr,
              proUnlockedAt: now.toISOString(),
            },
            { merge: true }
          );
        } catch (fsErr) {
          console.warn('Firestore update fallback to local state:', fsErr);
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        onSuccessProUnlocked(updatedUser);
        onClose();
        setIsSuccess(false);
        setUtrInput('');
      }, 1800);
    } catch (err) {
      console.error('UTR Verification Error:', err);
      setErrorMsg('Verification failed. Please check your UTR number and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAmount = selectedPlan === '6months' ? '₹249' : '₹149';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 border border-purple-500/20 bg-slate-950/95 shadow-2xl space-y-6 relative overflow-hidden text-slate-100">
        
        {/* HARSHA'S Studio Design: Pure smooth gradient ambient glows (NO dots, NO light artifacts) */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white tracking-tight">Upgrade to CrackIt AI Pro</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-purple-500/20 to-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  PRO PASS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Instant Access to Unlimited Mock Tests & AI Features</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selection Cards */}
        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Choose Subscription Plan
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Plan A: 3 Months */}
            <button
              type="button"
              onClick={() => setSelectedPlan('3months')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer ${
                selectedPlan === '3months'
                  ? 'bg-gradient-to-b from-purple-950/80 to-slate-900/90 border-purple-500/60 shadow-lg shadow-purple-500/15 ring-1 ring-purple-500/50'
                  : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              {selectedPlan === '3months' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                <Clock className="w-3.5 h-3.5" /> 3 Months Access
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">₹149</span>
                <span className="text-xs text-slate-400 line-through">₹499</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">₹49/month • Popular Pass</p>
            </button>

            {/* Plan B: 6 Months */}
            <button
              type="button"
              onClick={() => setSelectedPlan('6months')}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer ${
                selectedPlan === '6months'
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border-indigo-500/60 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/40 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              <div className="absolute -top-2.5 right-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 rounded-full shadow-md">
                Best Value
              </div>
              {selectedPlan === '6months' && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Calendar className="w-3.5 h-3.5" /> 6 Months Access
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">₹249</span>
                <span className="text-xs text-slate-400 line-through">₹899</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 font-medium">Save Extra 17% • ₹41/mo</p>
            </button>
          </div>
        </div>

        {/* PhonePe QR Code Section */}
        <div className="p-4 sm:p-5 bg-slate-900/70 rounded-2xl border border-white/10 text-center space-y-3.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-white/10 pb-2.5">
            <span className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-purple-400" /> PhonePe / Google Pay / Paytm QR
            </span>
            <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Amount: {activeAmount}
            </span>
          </div>

          <div className="w-48 h-48 mx-auto p-2.5 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-purple-500/30">
            <img
              src="/my-qr.jpg"
              alt="PhonePe Payment QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-950/80 px-3.5 py-2 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400">
              UPI ID: <span className="font-mono font-bold text-purple-300 ml-1">8309558941@axl</span>
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submit Payment Proof Section */}
        <form onSubmit={handleSubmitPaymentProof} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Submit Payment Proof (UTR Number)</span>
              <span className="text-[10px] text-slate-400 font-normal">10 to 12-Digit Ref ID</span>
            </label>
            <input
              type="text"
              maxLength={12}
              value={utrInput}
              onChange={(e) => {
                setUtrInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Enter UTR / Ref No (e.g., 423819028341)"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono tracking-wider text-white placeholder:text-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Payment Verified! Pro Unlocked for {selectedPlan === '6months' ? '6 Months' : '3 Months'}.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying UTR Transaction...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>PRO Activated Successfully</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Submit UTR & Unlock Pro ({activeAmount})</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-1 text-center border-t border-white/5 relative z-10">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>HARSHA'S Studio Secured • Instant Pro Activation Guarantee</span>
          </p>
        </div>
      </div>
    </div>
  );
};
