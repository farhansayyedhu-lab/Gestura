import React from 'react';
import { MOODS, MOOD_DETAILS } from '../data/activities';
import {
  Activity,
  Hand,
  ThumbsUp,
  Cpu,
  Sun,
  AlertTriangle,
  Moon,
  Droplets,
  Zap,
} from 'lucide-react';

// Icon mapping helper
function MoodIcon({ name, className = 'w-5 h-5' }) {
  switch (name) {
    case 'Sun':
      return <Sun className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Activity':
    default:
      return <Activity className={className} />;
  }
}

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
    none: { label: 'Listening for Gestures', icon: Hand, hint: 'Ready for hand inputs' },
    thumbs_up: { label: 'Thumbs Up Detected', icon: ThumbsUp, hint: 'Selects primary action' },
    open_palm: { label: 'Open Palm Detected', icon: Hand, hint: 'Refreshes options' },
    peace: { label: 'Victory Gesture', icon: Hand, hint: 'Secondary input' },
  };

  const activeGesture = gestureLabels[detectedGesture] || gestureLabels.none;

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Mood Status Card */}
      <div className="p-5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
          <span className="text-xs font-mono font-medium tracking-wide text-slate-400 uppercase flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            Expression Analysis
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Confidence: {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* Mood Badge & Status */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
            <MoodIcon name={currentMoodInfo.icon} className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              {currentMoodInfo.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentMoodInfo.description}
            </p>
          </div>
        </div>

        {/* Probability Distribution */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Classification Vectors</span>
            <span className="text-[11px]">Normalized</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(probabilities).map(([moodKey, probValue]) => {
              const isCurrent = moodKey === currentMood;
              const percent = Math.round(probValue * 100);
              return (
                <div key={moodKey} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`capitalize font-mono ${isCurrent ? 'font-semibold text-blue-400' : 'text-slate-400'}`}>
                      {moodKey}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        isCurrent ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Blendshapes Telemetry */}
        {topBlendshapes.length > 0 && faceDetected && (
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
              <span>Primary Blendshapes</span>
              <span className="text-slate-500">478 points</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topBlendshapes.map((b) => (
                <span
                  key={b.name}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                >
                  <span className="text-slate-400">{b.name}</span>: {b.score}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gesture Input Card */}
      <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-medium tracking-wide text-slate-400 uppercase flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-blue-400" />
            Hand Input Interface
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {detectedGesture !== 'none' ? 'Action Confirmed' : 'Monitoring'}
          </span>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
          <div className="p-2 rounded bg-slate-700 text-blue-400">
            <activeGesture.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">
              {activeGesture.label}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeGesture.hint}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Testing Controller */}
      {simulationMode && (
        <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-300 font-semibold uppercase">
              Manual Override Controller
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Test Mode
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-2">
            {Object.values(MOODS).map((m) => {
              const info = MOOD_DETAILS[m];
              const isSelected = m === currentMood;
              return (
                <button
                  key={m}
                  onClick={() => onSelectSimulatedMood(m)}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono transition cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span className="capitalize">{m}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-mono">Simulate Gesture:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTriggerGesture('thumbs_up')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer font-mono"
              >
                Thumbs Up
              </button>
              <button
                onClick={() => onTriggerGesture('open_palm')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer font-mono"
              >
                Open Palm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
