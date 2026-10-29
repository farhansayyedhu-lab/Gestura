import React from 'react';
import { ShieldCheck, Video, VideoOff, Sparkles, Activity, Sliders, Info } from 'lucide-react';

export default function Header({
  isStreaming,
  onToggleWebcam,
  onOpenPrivacyModal,
  simulationMode,
  setSimulationMode,
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#080d1a]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 py-3">
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
        <div className="hidden md:flex items-center">
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

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Simulation Mode Toggle for testing */}
          <button
            type="button"
            onClick={() => setSimulationMode(!simulationMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              simulationMode
                ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle interactive demo mode to simulate all emotions"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md ${
              isStreaming
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 shadow-rose-900/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 ring-1 ring-white/20'
            }`}
          >
            {isStreaming ? (
              <>
                <VideoOff className="w-4 h-4" />
                <span>Disconnect Camera</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4 animate-pulse" />
                <span>Start Webcam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
