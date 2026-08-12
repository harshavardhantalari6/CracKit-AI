import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Target,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface LoginProps {
  onSuccessLogin?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccessLogin }) => {
  const { signInWithGoogle, loading: authLoading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setErrorMsg(null);
      const userProfile = await signInWithGoogle();
      if (userProfile && onSuccessLogin) {
        onSuccessLogin();
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-100">
      {/* HARSHA'S Studio Ambient Radial Glows (NO dotted lights, NO text artifacts) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 my-auto">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="md:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>HARSHA'S STUDIO DESIGN</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Master Exams & Drive Prep with{' '}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                CrackIt AI
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Next-generation AI mock test engine for SSC, Railways, Banking & TCS NQT drives. Real-time accuracy analytics, instant AI solution explanations, and verified Pro access.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Target PYQs</h4>
                <p className="text-[11px] text-slate-400">Govt Exams & IT Drives</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">HARSHA'S AI Bot</h4>
                <p className="text-[11px] text-slate-400">Multimodal Explanations</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Firestore Auth</h4>
                <p className="text-[11px] text-slate-400">Role-Based Access Control</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Verified Pro Pass</h4>
                <p className="text-[11px] text-slate-400">₹149/3m • ₹249/6m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Google Sign-In Card */}
        <div className="md:col-span-5">
          <div className="glass-panel rounded-3xl p-8 border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 p-0.5 mx-auto shadow-xl">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                  <Lock className="w-6 h-6 text-purple-300" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white">Welcome Aspirant</h2>
              <p className="text-xs text-slate-400">Sign in with your Google Account to access your personal dashboard & AI tests</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Single Sign-On Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={signingIn || authLoading}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-900 font-bold text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-3 transition-all cursor-pointer border border-slate-200 disabled:opacity-70 group"
            >
              {signingIn || authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-slate-800 font-semibold">Authenticating with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="tracking-wide">Sign in with Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform ml-auto" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-white/10 text-center text-[11px] text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by Firebase Google Authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
