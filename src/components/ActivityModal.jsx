import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Clock,
  Wind,
  Smile,
  Copy,
  Check,
} from 'lucide-react';

export default function ActivityModal({ activity, onClose }) {
  if (!activity) return null;

  // Active sub-mode states
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes default
  const [breathPhase, setBreathPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const [breathCount, setBreathCount] = useState(4);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Web Audio Context for synthesizer ambient hum / chime
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscRef = useRef(null);

  // Breathing loop timer
  useEffect(() => {
    let breathInterval = null;
    if (isRunning && activity.type === 'breathing') {
      breathInterval = setInterval(() => {
        setBreathCount((prev) => {
          if (prev > 1) return prev - 1;

          // Transition to next phase
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            return 4;
          }
        });
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isRunning, breathPhase, activity.type]);

  // Overall countdown timer
  useEffect(() => {
    let mainTimer = null;
    if (isRunning && secondsLeft > 0) {
      mainTimer = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(mainTimer);
  }, [isRunning, secondsLeft]);

  // Synthesize relaxing ambient harmonic chord using Web Audio API
  const toggleAmbientSound = () => {
    if (!isAudioPlaying) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : audioVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Frequencies for a calming 432Hz ambient chord (A4 432Hz, E5 648Hz, C#5 540Hz)
        const freqs = [108, 216, 324, 432];
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
        });

        setIsAudioPlaying(true);
      } catch (err) {
        console.warn('AudioContext error:', err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsAudioPlaying(false);
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleStep = (idx) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter((i) => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg glass-panel-active border border-indigo-500/40 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activity.category}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {activity.duration}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Title & Description */}
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {activity.title}
            </h3>
            <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
              {activity.subtitle}
            </p>
          </div>

          {/* Interactive Breathing Visualizer */}
          {activity.type === 'breathing' && (
            <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-slate-950/70 border border-indigo-500/20 relative overflow-hidden">
              <div className="relative flex items-center justify-center w-52 h-52 mb-6">
                {/* Outer Breathing Expanding Ring */}
                <div
                  className={`absolute inset-0 rounded-full border-2 border-indigo-400/50 transition-all duration-1000 ease-in-out ${
                    isRunning
                      ? breathPhase === 'Inhale'
                        ? 'scale-110 bg-indigo-500/20 shadow-2xl shadow-indigo-500/40'
                        : breathPhase === 'Hold'
                        ? 'scale-105 bg-blue-500/20 shadow-2xl shadow-blue-500/30'
                        : 'scale-75 bg-indigo-500/5'
                      : 'scale-90 bg-indigo-500/10'
                  }`}
                />

                {/* Inner Core */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                  <Wind className="w-6 h-6 text-indigo-400 mb-1" />
                  <span className="text-xl font-bold text-white tracking-wide">
                    {isRunning ? breathPhase : 'Ready'}
                  </span>
                  <span className="text-3xl font-mono font-extrabold text-indigo-300 mt-0.5">
                    {isRunning ? breathCount : '4s'}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Pause Cycle' : 'Start Breathing'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setBreathPhase('Inhale');
                    setBreathCount(4);
                    setSecondsLeft(180);
                  }}
                  className="p-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Ambient Sound Audio Player Widget */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded bg-indigo-500/15 text-indigo-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-white">
                  Client-Synthesized 432Hz Calm Waves
                </h5>
                <p className="text-[11px] text-slate-400">
                  Pure sine harmonic audio generated in your browser
                </p>
              </div>
            </div>

            <button
              onClick={toggleAmbientSound}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition cursor-pointer border ${
                isAudioPlaying
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isAudioPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> <span>Sound Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> <span>Play Ambience</span>
                </>
              )}
            </button>
          </div>

          {/* Steps / Checklist if available */}
          {activity.steps && (
            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Action Steps:
              </h5>
              <div className="space-y-2">
                {activity.steps.map((step, idx) => {
                  const isDone = completedSteps.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center border text-xs ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs ${isDone ? 'line-through opacity-70' : ''}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompts for Journaling / Creative */}
          {activity.prompts && (
            <div>
              <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Reflection Prompts:
              </h5>
              <div className="space-y-2.5">
                {activity.prompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                  >
                    <span>{prompt}</span>
                    <button
                      onClick={() => copyToClipboard(prompt, idx)}
                      className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Copy prompt"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <span className="text-xs text-slate-400">
            {completedSteps.length > 0
              ? `${completedSteps.length} step(s) checked`
              : 'Take your time and focus on your breath'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
}
