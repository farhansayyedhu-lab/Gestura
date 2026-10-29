import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Server, HardDrive } from 'lucide-react';

export default function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-lg bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Gestura Privacy Policy
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Effective Date: October 2026 | Version 1.1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          <section>
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              1. Fundamental Architecture: Zero Remote Transmission
            </h3>
            <p>
              Gestura is engineered with a strict client-side isolation architecture. When you grant camera permission to this web application, video streams and optical data are captured via the standard HTML5 <code>MediaStream</code> API and processed strictly within your browser's local sandbox memory (using WebAssembly and WebGL execution contexts).
            </p>
            <p className="mt-1.5 font-medium text-emerald-400">
              At no point are live camera frames, raw video recordings, audio feeds, or optical captures transmitted to any external server, cloud infrastructure, or third party.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-blue-400" />
              2. Biometric Data & Landmark Vectors
            </h3>
            <p>
              The optical vision models (including MediaPipe FaceLandmarker and GestureRecognizer) calculate ephemeral coordinate arrays (such as 478 3D facial landmark points and expression blendshapes) frame-by-frame.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Biometric landmarks are held strictly in temporary RAM and destroyed upon frame render.</li>
              <li>No facial templates, biometric recognition hashes, or identification profiles are stored to disk or database.</li>
              <li>The system cannot recognize your individual personal identity across sessions.</li>
            </ul>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" />
              3. Local Storage & Account Information
            </h3>
            <p>
              If you authenticate via account registration or Google OAuth simulation, session credentials and configuration preferences are saved exclusively in your browser's <code>localStorage</code>. Passwords submitted through credential forms are hashed using the Web Crypto API (SHA-256 with cryptographic salt) before write operations.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              4. External Dependencies & CDN Assets
            </h3>
            <p>
              Static model weights and WebAssembly binaries are loaded from public Content Delivery Networks (including Google Cloud Storage and JSDelivr) over encrypted TLS. These requests transfer only pre-compiled software models down to your browser; no telemetry or user data is transmitted upstream.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5">
              5. Contact & Privacy Inquiries
            </h3>
            <p className="text-slate-400">
              For any questions regarding this policy or to request validation of the client-side isolation architecture, contact: <span className="font-mono text-blue-400">privacy@gestura.io</span>.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Client Encryption: Active</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
