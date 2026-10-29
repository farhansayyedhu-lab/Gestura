import React from 'react';
import { MOODS, MOOD_DETAILS } from '../data/activities';
import {
  Sparkles,
  Activity,
  Check,
  ThumbsUp,
  Hand,
  HelpCircle,
  Cpu,
  Smile,
  Zap,
} from 'lucide-react';

export default function MoodIndicator({
  currentMood,
  confidence,
  probabilities,
  detectedGesture,
  topBlendshapes = [],
  faceDetected = false,
  simulationMode,
  onSelectSimulatedMood,
  onTriggerGesture,
}) {
  const currentMoodInfo = MOOD_DETAILS[currentMood] || MOOD_DETAILS[MOODS.NEUTRAL];

  const gestureLabels = {
    none: { label: 'Listening for Gestures', icon: Hand, hint: 'Wave palm or thumbs up to camera' },
    thumbs_up: { label: 'Thumbs Up Detected', icon: ThumbsUp, hint: 'Auto-launching top recommendation!' },
    open_palm: { label: 'Open Palm Detected', icon: Hand, hint: 'Shuffling activity recommendations...' },
    peace: { label: 'Victory / Peace Sign', icon: Hand, hint: 'Zen mode activated' },
    fist: { label: 'Closed Fist Detected', icon: Hand, hint: 'Decompression pause' },
    pointing_up: { label: 'Pointing Up Detected', icon: Hand, hint: 'Focusing recommendation' },
  };

  const activeGesture = gestureLabels[detectedGesture] || gestureLabels.none;

  return (
    <div className="flex flex-col gap-5">
      {/* Primary Mood Status Card */}
      <div
        className={`p-6 rounded-3xl glass-panel relative overflow-hidden transition-all duration-300 border ${
          currentMood === MOODS.HAPPY
            ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10'
            : currentMood === MOODS.STRESSED
            ? 'border-rose-500/30 shadow-lg shadow-rose-500/10'
            : currentMood === MOODS.TIRED
            ? 'border-amber-500/30 shadow-lg shadow-amber-500/10'
            : currentMood === MOODS.SAD
            ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10'
            : currentMood === MOODS.SURPRISED
            ? 'border-pink-500/30 shadow-lg shadow-pink-500/10'
            : 'border-cyan-500/30 shadow-lg shadow-cyan-500/10'
        }`}
      >
        {/* Glow ambient background aura */}
        <div
          className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none ${
            currentMood === MOODS.HAPPY
              ? 'bg-emerald-400'
              : currentMood === MOODS.STRESSED
              ? 'bg-rose-500'
              : currentMood === MOODS.TIRED
              ? 'bg-amber-400'
              : currentMood === MOODS.SAD
              ? 'bg-indigo-500'
              : currentMood === MOODS.SURPRISED
              ? 'bg-pink-400'
              : 'bg-cyan-400'
          }`}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            MediaPipe Real-Time State
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
              Confidence: {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Mood Badge & Emoji */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-3xl shadow-inner select-none transition-transform hover:scale-105">
            {currentMoodInfo.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {currentMoodInfo.label}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
              {currentMoodInfo.description}
            </p>
          </div>
        </div>

        {/* Emotion Probabilities Distribution */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Expression Vector Probabilities</span>
            <span className="font-mono text-[11px]">Normalized Softmax</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(probabilities).map(([moodKey, probValue]) => {
              const isCurrent = moodKey === currentMood;
              const percent = Math.round(probValue * 100);
              return (
                <div key={moodKey} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`capitalize ${isCurrent ? 'font-bold text-white' : 'text-slate-400'}`}>
                      {moodKey}
                    </span>
                    <span className="font-mono text-slate-400">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCurrent
                          ? moodKey === MOODS.HAPPY
                            ? 'bg-emerald-400'
                            : moodKey === MOODS.STRESSED
                            ? 'bg-rose-400'
                            : moodKey === MOODS.TIRED
                            ? 'bg-amber-400'
                            : moodKey === MOODS.SAD
                            ? 'bg-indigo-400'
                            : moodKey === MOODS.SURPRISED
                            ? 'bg-pink-400'
                            : 'bg-cyan-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live 52-Blendshape Micro-Expressions Telemetry */}
        {topBlendshapes.length > 0 && faceDetected && (
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="font-mono flex items-center gap-1">
                <Smile className="w-3 h-3 text-indigo-400" />
                Live Blendshapes (Top 5)
              </span>
              <span className="text-[10px] font-mono text-emerald-400">478 mesh points</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topBlendshapes.map((b) => (
                <span
                  key={b.name}
                  className="px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/60 text-[10px] font-mono text-slate-300"
                >
                  <strong className="text-indigo-300">{b.name}</strong>: {b.score}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Gesture Tracking Card */}
      <div className="p-5 rounded-3xl glass-panel border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-indigo-400" />
            MediaPipe Gesture Recognizer
          </span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
              detectedGesture !== 'none'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {detectedGesture !== 'none' ? 'Action Triggered' : 'Listening (21 Joints)'}
          </span>
        </div>

        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div
            className={`p-2.5 rounded-xl ${
              detectedGesture !== 'none'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <activeGesture.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">
              {activeGesture.label}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {activeGesture.hint}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <span>👍</span>
            <span>Thumbs Up: Launch #1</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <span>✋</span>
            <span>Open Palm: Shuffle</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation / Demo Lab */}
      {simulationMode && (
        <div className="p-5 rounded-3xl glass-panel-active border border-purple-500/40 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interactive Demo Controller</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">
              Instant Preview
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            Click any emotion below to test how the UI and recommendations react in real time:
          </p>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {Object.values(MOODS).map((m) => {
              const info = MOOD_DETAILS[m];
              const isSelected = m === currentMood;
              return (
                <button
                  key={m}
                  onClick={() => onSelectSimulatedMood(m)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                      : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>{info.emoji}</span>
                  <span className="capitalize truncate">{m}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Trigger Gesture:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTriggerGesture('thumbs_up')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer"
              >
                👍 Thumbs Up
              </button>
              <button
                onClick={() => onTriggerGesture('open_palm')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer"
              >
                ✋ Open Palm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
