import React from 'react';
import { X, FileText, AlertCircle, CheckCircle, Scale, Shield } from 'lucide-react';

export default function TermsConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-lg bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Gestura Terms of Service
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
              <Scale className="w-4 h-4 text-blue-400" />
              1. Agreement to Terms
            </h3>
            <p>
              By accessing or using the Gestura web application ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you are prohibited from utilizing the application.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-amber-300 mb-1.5 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              2. Non-Medical and Non-Diagnostic Disclaimer
            </h3>
            <div className="p-3.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-200">
              <p className="font-medium mb-1">IMPORTANT NOTICE:</p>
              <p className="text-[11px] leading-relaxed text-amber-300/90">
                Gestura is an interactive computer vision demonstration, human-computer interaction interface, and productivity assistant. The application DOES NOT provide medical advice, psychiatric assessment, psychological evaluation, or therapeutic diagnosis. Expression classifications (such as "positive", "tension", or "fatigue") represent mathematical geometric approximations and should never be used as a substitute for professional clinical medical advice or diagnosis.
              </p>
            </div>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              3. Permitted Use & Hardware Access
            </h3>
            <p>
              You are granted a revocable, non-exclusive, non-transferable license to execute Gestura strictly within your browser. Camera access is entirely optional and may be revoked at any time via your browser permissions settings or the "Disconnect" button.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5">
              4. Limitation of Liability
            </h3>
            <p className="text-slate-400">
              In no event shall Gestura, its developers, or affiliates be liable for any indirect, incidental, consequential, special, or punitive damages arising from the use of, or inability to use, this application or reliance on its real-time classifications.
            </p>
          </section>

          <section className="pt-3 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-white mb-1.5">
              5. Governing Law & Contact
            </h3>
            <p className="text-slate-400">
              These terms are governed by standard international commercial software standards. Direct inquiries regarding service terms to: <span className="font-mono text-blue-400">legal@gestura.io</span>.
            </p>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Terms Version: 1.1</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition cursor-pointer"
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
