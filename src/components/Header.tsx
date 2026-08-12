import React, { useState } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Brain,
  Newspaper,
  BookMarked,
  Layers,
  Target,
  Briefcase,
  FileText,
  Award,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Headphones,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenPhonePe: () => void;
  onOpenHelpDesk: () => void;
  unreadAlertsCount: number;
}

const STRICT_ADMIN_EMAIL = 'harshavardhantalari6@gmail.com';

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPhonePe,
  onOpenHelpDesk,
  unreadAlertsCount,
}) => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPro = user.role === 'pro' || user.role === 'admin';
  const isAdmin = user.email?.toLowerCase() === STRICT_ADMIN_EMAIL.toLowerCase();

  // Navigation Links as requested (Gmail Sidebar Style)
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tests', label: 'Mock Tests', icon: Sparkles },
    { id: 'revision', label: 'Smart Revision', icon: Brain },
    { id: 'affairs', label: 'Current Affairs', icon: Newspaper },
    { id: 'staticgk', label: 'Static GK', icon: BookMarked },
    { id: 'pyq', label: 'PYQ Portal', icon: Layers },
  ];

  const secondaryNavItems = [
    { id: 'tracks', label: 'Goal Tracks', icon: Target },
    { id: 'alerts', label: 'Job Alerts', icon: Briefcase, badge: unreadAlertsCount },
    { id: 'resume', label: 'AI Resume', icon: FileText },
    { id: 'profile', label: 'Candidate Profile', icon: Award },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldAlert, isAdminTab: true }] : []),
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 space-y-6">
      {/* Top Branding */}
      <div className="space-y-4">
        <div
          onClick={() => handleTabClick('dashboard')}
          className="flex items-center gap-3 cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-sky-400 fill-sky-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                CrackIt AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
                HARSHA'S
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Govt Exams & IT Job Prep</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/10" />

        {/* Primary Navigation Menu */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Core Modules
          </span>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/90 to-indigo-600/90 text-white shadow-lg shadow-sky-500/25 border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation Menu */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Career & Tools
          </span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdminTab = (item as any).isAdminTab;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? isAdminTab
                      ? 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white shadow-lg shadow-purple-500/30 border border-purple-400/30'
                      : 'bg-gradient-to-r from-sky-500/90 to-indigo-600/90 text-white shadow-lg shadow-sky-500/25 border border-white/20'
                    : isAdminTab
                    ? 'text-purple-300 hover:bg-purple-950/40 border border-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : isAdminTab ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        {/* Help Desk & Support Button */}
        <button
          onClick={onOpenHelpDesk}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Headphones className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Help Desk & Support</span>
        </button>

        {/* Pro Membership or Upgrade Banner */}
        {isPro ? (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pro Member Active</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenPhonePe}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 border border-white/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Upgrade Pro (PhonePe)</span>
          </button>
        )}

        {/* User Profile Card & Sign Out */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/80 border border-white/10">
          <div
            onClick={() => handleTabClick('profile')}
            className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0">
              {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {user.displayName || 'Aspirant'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/20 transition-all cursor-pointer shrink-0 ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP FIXED LEFT SIDEBAR (Strict Firebase Console Style) */}
      <aside className="hidden lg:flex w-64 h-full flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col overflow-y-auto custom-scrollbar">
        {renderSidebarContent()}
      </aside>

      {/* 2. MOBILE HEADER BAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(false ? false : true)}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5 text-sky-400" />
          </button>

          <div onClick={() => handleTabClick('dashboard')} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-sky-400 fill-sky-400/20" />
              </div>
            </div>
            <span className="font-bold text-base text-white tracking-tight">CrackIt AI</span>
            <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full">
              HARSHA'S
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPro && (
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </span>
          )}
          <button
            onClick={() => handleTabClick('profile')}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-inner"
          >
            {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : 'A'}
          </button>
        </div>
      </header>

      {/* 3. MOBILE SIDE DRAWER OVERLAY (Gmail Mobile Drawer) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/90 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-10 overflow-y-auto custom-scrollbar">
            <div className="p-3 flex justify-end border-b border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};
