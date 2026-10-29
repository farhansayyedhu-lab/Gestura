import React, { useState } from 'react';
import {
  ShieldCheck,
  Video,
  VideoOff,
  Activity,
  Sliders,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  FileText,
  Globe,
} from 'lucide-react';
import { GoogleIcon } from './AuthModal';

export default function Header({
  isStreaming,
  onToggleWebcam,
  onOpenPrivacyModal,
  onOpenTermsModal,
  onOpenAuthModal,
  user,
  onLogout,
  simulationMode,
  setSimulationMode,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#090d16]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 border border-slate-700 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white font-mono uppercase">
                Gestura
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                Vision Controller
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Client-side facial expression and gesture input pipeline
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400">
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 hover:text-slate-200 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Policy</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={onOpenTermsModal}
            className="flex items-center gap-1.5 hover:text-slate-200 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Terms of Service</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Diagnostic Mode Toggle */}
          <button
            type="button"
            onClick={() => setSimulationMode(!simulationMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition cursor-pointer border ${
              simulationMode
                ? 'bg-blue-950/60 text-blue-300 border-blue-600/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle diagnostic test controls"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Diagnostic Mode</span>
            {simulationMode && (
              <span className="text-[9px] font-mono text-blue-400 font-semibold">[ACTIVE]</span>
            )}
          </button>

          {/* Webcam Toggle Button */}
          <button
            onClick={onToggleWebcam}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer border ${
              isStreaming
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-950/60'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-sm'
            }`}
          >
            {isStreaming ? (
              <>
                <VideoOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Disconnect Feed</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5" />
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
                className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-mono text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-mono text-slate-300 text-xs hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded bg-slate-900 border border-slate-800 shadow-lg p-1.5 z-50 animate-fadeIn text-xs font-mono">
                  <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenPrivacyModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-300 hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Privacy Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenTermsModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-300 hover:bg-slate-800 transition text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Terms & Conditions</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-rose-400 hover:bg-rose-950/30 transition text-left cursor-pointer border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out / Guest State */
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono transition cursor-pointer"
                title="Sign in with your Google account"
              >
                <GoogleIcon className="w-3.5 h-3.5" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer font-mono"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal('signup')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium border border-blue-500 transition cursor-pointer font-mono"
              >
                <UserPlus className="w-3 h-3" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
