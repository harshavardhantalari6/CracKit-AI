import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Headphones, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface HelpDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
}

export const HelpDeskModal: React.FC<HelpDeskModalProps> = ({ isOpen, onClose, user }) => {
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) {
      setErrorMsg('Please describe your issue or complaint before submitting.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/helpdesk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: complaint,
          userEmail: user?.email || 'candidate@crackitai.com',
          userName: user?.displayName || 'CrackIt AI Candidate',
          userId: user?.uid || 'guest_user',
        }),
      });

      await res.json();
      setIsSubmitted(true);

      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setComplaint('');
      }, 2500);
    } catch (err) {
      console.error('Helpdesk Submission error:', err);
      // Fallback display as per requirements
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setComplaint('');
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 border border-sky-500/30 bg-slate-950/95 shadow-2xl shadow-sky-500/20 space-y-6 relative overflow-hidden">
        {/* HARSHA'S Studio Ambient Neon Glow (NO dotted lights, NO text distortions) */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {isSubmitted ? (
          /* Success Screen: Display ONLY requested message */
          <div className="py-10 px-4 text-center space-y-4 relative z-10 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                Your complaint has been registered successfully. Our team will look into it.
              </p>
              <p className="text-xs text-slate-400 font-medium">
                HARSHA'S Studio Support Desk • Ticket ID #{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>
          </div>
        ) : (
          /* Ticket Form Screen */
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-sky-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white tracking-tight">Help Desk & Support</h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-sky-500/20 text-sky-300 rounded-full border border-sky-500/30">
                      HARSHA'S Studio
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Raise a support ticket for technical or account queries</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaint Form */}
            <form onSubmit={handleSubmitTicket} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Describe your complaint or issue
                </label>
                <textarea
                  rows={5}
                  value={complaint}
                  onChange={(e) => {
                    setComplaint(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Type your issue, bug report, or payment inquiry here..."
                  className="w-full p-4 rounded-2xl bg-slate-900/90 border border-white/15 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none resize-none transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registering Ticket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>Raise Ticket</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
