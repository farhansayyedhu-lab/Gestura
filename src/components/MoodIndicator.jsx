import React, { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { getGeminiMoodInsights } from '../lib/gemini';

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

  // AI Gemini Insights
  const [aiInsight, setAiInsight] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    let cancel = false;
    const fetchInsight = async () => {
      if (!faceDetected) return;
      setIsLoadingAi(true);
      const res = await getGeminiMoodInsights(currentMood, topBlendshapes, confidence);
      if (!cancel && res.success) {
        setAiInsight(res.insight);
      }
      if (!cancel) setIsLoadingAi(false);
    };

    const timer = setTimeout(fetchInsight, 1200);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [currentMood, faceDetected]);

  const gestureLabels = {
    none: { label: 'Listening for Gestures', icon: Hand, hint: 'No active hand gesture detected' },
    thumbs_up: { label: 'Thumbs Up Detected', icon: ThumbsUp, hint: 'Selects primary action' },
    open_palm: { label: 'Open Palm Detected', icon: Hand, hint: 'Refreshes options' },
    peace: { label: 'Victory Gesture', icon: Hand, hint: 'Secondary input' },
  };

  const activeGesture = gestureLabels[detectedGesture] || gestureLabels.none;

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Primary Mood Status Card */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2.5">
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-300 uppercase flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-300" />
            Expression Analysis
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
            Confidence: {Math.round(confidence * 100)}%
          </span>
        </div>

        {/* Mood Badge & Status */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 text-white">
            <MoodIcon name={currentMoodInfo.icon} className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              {currentMoodInfo.label}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {faceDetected ? currentMoodInfo.description : 'Align your face in the camera frame for real-time expression detection.'}
            </p>
          </div>
        </div>

        {/* Gemini AI Coaching Insight */}
        {aiInsight && faceDetected && (
          <div className="mb-4 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Gemini Biofeedback Coaching</span>
            </div>
            <p className="text-zinc-200 leading-relaxed font-sans">{aiInsight}</p>
          </div>
        )}

        {/* Probability Distribution */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Classification Vectors</span>
            <span className="text-[11px]">Normalized</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(probabilities).map(([moodKey, probValue]) => {
              const isCurrent = moodKey === currentMood && faceDetected;
              const percent = Math.round(probValue * 100);
              return (
                <div key={moodKey} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`capitalize font-mono ${isCurrent ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                      {moodKey}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded bg-zinc-900 overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        isCurrent ? 'bg-white' : 'bg-zinc-800'
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
          <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono">
              <span>Primary Blendshapes</span>
              <span className="text-zinc-500">478 points</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topBlendshapes.map((b) => (
                <span
                  key={b.name}
                  className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                >
                  <span className="text-zinc-400">{b.name}</span>: {b.score}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gesture Input Card */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-300 uppercase flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-zinc-300" />
            Hand Input Interface
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            {detectedGesture !== 'none' ? 'Action Triggered' : 'Monitoring'}
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="p-2 rounded bg-zinc-800 text-white">
            <activeGesture.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-100">
              {activeGesture.label}
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {activeGesture.hint}
            </p>
          </div>
        </div>
      </div>

      {/* Manual Testing Controller */}
      {simulationMode && (
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-200 font-semibold uppercase">
              Manual Override Controller
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
              Diagnostic Mode
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 my-2">
            {Object.values(MOODS).map((m) => {
              const isSelected = m === currentMood;
              return (
                <button
                  key={m}
                  onClick={() => onSelectSimulatedMood(m)}
                  className={`px-2.5 py-1.5 rounded text-xs font-mono transition cursor-pointer border ${
                    isSelected
                      ? 'bg-white text-zinc-950 border-white font-semibold'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <span className="capitalize">{m}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-400 font-mono">Trigger Gesture:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTriggerGesture('thumbs_up')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs border border-zinc-800 cursor-pointer font-mono"
              >
                Thumbs Up
              </button>
              <button
                onClick={() => onTriggerGesture('open_palm')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs border border-zinc-800 cursor-pointer font-mono"
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
