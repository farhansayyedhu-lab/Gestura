import React, { useState } from 'react';
import {
  ShieldCheck,
  Video,
  VideoOff,
  Sparkles,
  Sliders,
  Info,
  LogIn,
  UserPlus,
  LogOut,
  Flame,
  Grid,
  ChevronDown,
} from 'lucide-react';
import { GoogleIcon } from './AuthModal';

export default function Header({
  isStreaming,
  onToggleWebcam,
  onOpenPrivacyModal,
  onOpenAuthModal,
  user,
  onLogout,
  simulationMode,
  setSimulationMode,
  kineticActive,
  setKineticActive,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#080d1a]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 py-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gestura <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">AI v1.0</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Real-Time Vision & Gesture-Adaptive Activity Companion
            </p>
          </div>
        </div>

        {/* Center / Privacy Guarantee Notice */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenPrivacyModal}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-900/40 hover:border-emerald-400/50 transition-all cursor-pointer shadow-sm"
            title="Click to view privacy architecture"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>100% On-Device Client Vision</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Info className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Right Action Controls: Webcam, Auth, Demos */}
        <div className="flex items-center gap-2.5">
          {/* Kinetic Grid Background Toggle */}
          <button
            type="button"
            onClick={() => setKineticActive(!kineticActive)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              kineticActive
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Toggle interactive kinetic grid background"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Kinetic FX</span>
          </button>

          {/* Quick Simulation Mode Toggle */}
          <button
            type="button"
            onClick={() => setSimulationMode(!simulationMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
              simulationMode
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title="Toggle interactive demo mode"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Lab</span>
            {simulationMode && (
              <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-[10px] text-purple-200 font-mono">ON</span>
            )}
          </button>

          {/* Webcam Toggle Button */}
          <button
            onClick={onToggleWebcam}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-md ${
              isStreaming
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 ring-1 ring-white/20'
            }`}
          >
            {isStreaming ? (
              <>
                <VideoOff className="w-4 h-4" />
                <span className="hidden sm:inline">Disconnect Camera</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4 animate-pulse" />
                <span>Start Camera</span>
              </>
            )}
          </button>

          {/* User Authentication Area */}
          {user ? (
            /* Logged In User State */
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition cursor-pointer"
              >
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/40">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>

                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    <span>{user.streak || 3}d streak</span>
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenPrivacyModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Privacy & Security</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out / Guest State */
            <div className="flex items-center gap-2">
              {/* Quick Google Sign In Button */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition shadow-sm cursor-pointer"
                title="Sign in with your Google account"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google</span>
              </button>

              {/* Sign In Button */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              {/* Sign Up Button */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('signup')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
