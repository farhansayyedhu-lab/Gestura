import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Cpu, X, Check } from 'lucide-react';

export default function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-active border border-emerald-500/40 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Client-Side Vision Architecture</h3>
            <p className="text-xs text-emerald-400 font-medium">Zero Cloud Transmission Guarantee</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">100% In-Browser Execution</strong>
              All neural computer vision operations (facial mesh points, landmark tracking, emotion classification, and hand gesture recognition) execute entirely inside your local browser sandbox via WebAssembly and WebGL.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">No Video or Frames Are Stored</strong>
              Video frames captured from your webcam exist momentarily in temporary GPU memory for inference and are discarded immediately on the next tick. No images are saved locally or persisted in cookies/storage.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-start gap-3">
            <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Zero Telemetry or Server Uploads</strong>
              Gestura does not transmit video streams, biometric hashes, or emotion logs to any external server or third-party analytics.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
