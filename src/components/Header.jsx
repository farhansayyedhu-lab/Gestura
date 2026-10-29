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
  onNavigateToLanding,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo - Clickable to return to Overview */}
        <div
          onClick={onNavigateToLanding}
          className="flex items-center gap-3 cursor-pointer group"
          title="Click to return to Gestura Overview & Sign In"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-white group-hover:border-zinc-500 transition">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight text-white font-mono uppercase group-hover:text-zinc-300 transition">
                Gestura
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700 font-mono">
                Vision Controller
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden md:block">
              Client-side facial expression and gesture input pipeline
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-mono text-zinc-400">
          <button
            onClick={onNavigateToLanding}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
          >
            <span>← Overview & Sign In</span>
          </button>
          <span className="text-zinc-800">|</span>
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy Policy</span>
          </button>
          <span className="text-zinc-800">|</span>
          <button
            onClick={onOpenTermsModal}
            className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>Terms of Service</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Diagnostic Mode Toggle */}
          <button
            type="button"
            onClick={() => setSimulationMode(!simulationMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
              simulationMode
                ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Toggle diagnostic test controls"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Diagnostic Mode</span>
            {simulationMode && (
              <span className="text-[9px] font-mono text-emerald-400 font-semibold">[ON]</span>
            )}
          </button>

          {/* Webcam Toggle Button */}
          <button
            onClick={onToggleWebcam}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border shadow-sm ${
              isStreaming
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-950'
                : 'bg-white hover:bg-zinc-200 text-zinc-950 border-white'
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
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-mono text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-mono text-zinc-200 text-xs hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl p-1.5 z-50 animate-fadeIn text-xs font-mono">
                  <div className="px-2.5 py-1.5 border-b border-zinc-800 mb-1">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigateToLanding();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-zinc-900 transition text-left cursor-pointer"
                  >
                    <span>← Overview & Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenPrivacyModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-zinc-900 transition text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Privacy Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenTermsModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-zinc-300 hover:bg-zinc-900 transition text-left cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Terms & Conditions</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-400 hover:bg-rose-950/40 transition text-left cursor-pointer border-t border-zinc-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenAuthModal('signin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 text-xs font-mono transition cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
