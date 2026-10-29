import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Cpu,
  Hand,
  Eye,
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Globe,
  Layers,
  Brain,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { GoogleIcon } from './AuthModal';
import HalftoneWordmarkFooter from './ui/halftone-wordmark-footer';
import KineticGrid from './ui/kinetic-grid';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  hashPassword,
  authRateLimiter,
} from '../lib/security';

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, tag }) {
  return (
    <div className="group relative p-6 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0 group-hover:border-blue-500/50 group-hover:scale-105 transition-all">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          {tag && (
            <span className="inline-block text-[10px] font-mono tracking-widest uppercase text-blue-400/80 mb-1.5">
              {tag}
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-100 mb-1.5 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Auth Panel ─────────────────────────────────────────────────────────
function AuthPanel({ onLoginSuccess, currentUser }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = () => {
    const rateCheck = authRateLimiter.check('auth-google');
    if (!rateCheck.allowed) {
      setError(`Too many requests. Wait ${rateCheck.retryAfterSec}s.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      onLoginSuccess?.({
        name: 'Farhan Sayyed',
        email: 'farhansayyedhu@gmail.com',
        avatar: null,
        provider: 'google',
        role: 'user',
        sessionCreatedAt: Date.now(),
      });
    }, 450);
  };

  const handleGuestAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLoginSuccess?.({
        name: 'Guest Researcher',
        email: 'guest@gestura.local',
        provider: 'guest',
        role: 'guest',
        sessionCreatedAt: Date.now(),
      });
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const rateCheck = authRateLimiter.check('auth-form');
    if (!rateCheck.allowed) {
      setError(`Too many attempts. Wait ${rateCheck.retryAfterSec}s.`);
      return;
    }
    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(name);
    if (!cleanEmail || !password) { setError('Email and password are required.'); return; }
    if (!validateEmail(cleanEmail)) { setError('Enter a valid email address.'); return; }
    if (mode === 'signup') {
      const pw = validatePassword(password);
      if (!pw.valid) { setError(pw.message); return; }
    }
    setIsLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      setTimeout(() => {
        authRateLimiter.reset('auth-form');
        onLoginSuccess?.({
          name: cleanName || cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash,
          provider: 'email',
          role: 'user',
          sessionCreatedAt: Date.now(),
        });
      }, 450);
    } catch {
      setIsLoading(false);
      setError('Authentication processing failed. Please retry.');
    }
  };

  // If user already active in session, display quick-launch option
  if (currentUser) {
    return (
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-600/40 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Active Session Found</p>
            <h3 className="text-base font-semibold text-slate-100">{currentUser.name}</h3>
            <p className="text-xs text-slate-400 font-mono truncate">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLoginSuccess?.(currentUser)}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-900/20 transition cursor-pointer mb-3"
        >
          <span>Enter Camera & Gesture Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleGuestAccess}
          className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-mono transition cursor-pointer border border-slate-700"
        >
          Switch Account / New Session
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Gestura Access</p>
            <h2 className="text-sm font-semibold text-slate-200">
              {mode === 'signin' ? 'Sign In to Vision System' : 'Register New Account'}
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
          Secure
        </span>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50 mb-4"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center mb-4">
        <div className="flex-1 border-t border-slate-800" />
        <span className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-wider">or email & password</span>
        <div className="flex-1 border-t border-slate-800" />
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs mb-4">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null); }}
          className={`py-1.5 rounded-md transition cursor-pointer font-medium ${
            mode === 'signin' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); }}
          className={`py-1.5 rounded-md transition cursor-pointer font-medium ${
            mode === 'signup' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Register
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Farhan Sayyed"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farhan@example.com"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-700 text-xs focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="font-mono text-[11px]">Processing...</span>
          ) : (
            <>
              <span>{mode === 'signin' ? 'Sign In & Launch Dashboard' : 'Create Account & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {/* Guest access option */}
        <button
          type="button"
          onClick={handleGuestAccess}
          className="w-full py-2 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 transition text-center cursor-pointer hover:bg-slate-800/40"
        >
          Or continue as Guest (Instant Access) →
        </button>
      </form>

      {/* Security badge footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>SHA-256 Client-Side Hashing · Zero Cloud Biometrics</span>
      </div>
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage({ onLoginSuccess, currentUser }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const features = [
    {
      icon: Brain,
      tag: 'Neural Topology',
      title: '478-Point Face Mesh',
      desc: 'Google MediaPipe FaceLandmarker maps 478 high-fidelity 3D facial landmarks directly in browser memory at up to 60 frames per second.',
    },
    {
      icon: Hand,
      tag: 'Gesture Engine',
      title: 'Zero-Touch Gestures',
      desc: 'Deep neural GestureRecognizer identifies Thumbs Up, Open Palm, and Victory hands-free to trigger protocol actions and shuffle tasks.',
    },
    {
      icon: Cpu,
      tag: 'Isolated WASM',
      title: 'Client-Side WebAssembly',
      desc: 'All computer vision weights execute locally in a WebAssembly sandbox. Video frames never leave local RAM. No remote servers involved.',
    },
    {
      icon: Eye,
      tag: 'Live Telemetry',
      title: '52 Expression Blendshapes',
      desc: 'Continuous tracking across 52 blendshape coefficients including brow lowering, mouth smile, and eye squint for sub-millimeter precision.',
    },
    {
      icon: Zap,
      tag: 'Adaptive Engine',
      title: 'Mood-Matched Protocols',
      desc: 'Structured wellness tasks categorized across Mindfulness, Physical, Creative, and Social protocols automatically tailored to your state.',
    },
    {
      icon: Lock,
      tag: 'Security by Design',
      title: 'Hardened Architecture',
      desc: 'Strict CSP headers, rate-limited auth endpoints, SHA-256 client hashing, and strict zero-biometric cloud storage policy.',
    },
  ];

  const specs = [
    { label: 'Face Mesh Points', value: '478' },
    { label: 'Blendshape Axes', value: '52' },
    { label: 'Inference Engine', value: 'WASM' },
    { label: 'Video Privacy', value: '100% Local' },
    { label: 'Remote Latency', value: '0 ms' },
    { label: 'Protocol Match', value: 'Real-Time' },
  ];

  return (
    <div
      className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}
    >
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-tight text-white uppercase">Gestura</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300 font-mono">
                  Vision Platform
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MediaPipe Vision Pipeline</span>
            </div>
            <span className="hidden md:block text-slate-700">|</span>
            <button
              onClick={() => onLoginSuccess?.(currentUser || { name: 'Guest', email: 'guest@gestura.local' })}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>{currentUser ? 'Open Dashboard' : 'Instant Demo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Kinetic Grid Background ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-slate-800/80">
        <KineticGrid className="absolute inset-0 w-full h-full" globalColor="default">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Product Overview */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-blue-500/30 bg-blue-950/40 text-[10px] font-mono text-blue-300 uppercase tracking-widest mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Real-Time Biometric Emotion Engine
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
                  Client-side facial vision & gesture intelligence.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                  Gestura executes Google MediaPipe neural networks inside browser WebAssembly to
                  classify emotional state and decode hand gestures directly from your webcam.
                  Zero cloud telemetry. Complete local data isolation.
                </p>

                {/* Technical Specs Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-8">
                  {specs.map((s) => (
                    <div key={s.label} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                      <div className="text-base font-bold text-white font-mono">{s.value}</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>No cloud video transmission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Fully runs offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Pure WebAssembly</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Sign In / Access Panel */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <AuthPanel onLoginSuccess={onLoginSuccess} currentUser={currentUser} />
              </div>
            </div>
          </div>
        </KineticGrid>
      </section>

      {/* ── Architecture & Features Grid ── */}
      <section className="py-20 border-b border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-2">Capabilities</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Designed for high-throughput, low-latency vision.
              </h2>
              <span className="text-xs font-mono text-slate-500">478 Landmarks · 52 Blendshapes · 30+ FPS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-blue-400 mb-2">Input Pipeline</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From camera frame to adaptive intervention
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Local Capture',
                desc: 'Webcam feed initializes directly into HTML5 Video memory with user camera permissions.',
              },
              {
                step: '02',
                title: 'Neural Inference',
                desc: 'MediaPipe WebAssembly extracts 478 3D points and 52 facial blendshapes simultaneously.',
              },
              {
                step: '03',
                title: 'Emotion Scoring',
                desc: 'Blendshape vector matrices are normalized into probability distributions for 6 mood states.',
              },
              {
                step: '04',
                title: 'Task Intervention',
                desc: 'Recommendations re-rank instantly; gesture recognizer triggers hands-free confirmations.',
              },
            ].map((p) => (
              <div key={p.step} className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 relative">
                <span className="text-2xl font-bold font-mono text-blue-500/70 mb-3 block">{p.step}</span>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Halftone Wordmark Footer ── */}
      <HalftoneWordmarkFooter
        wordmark="gestura"
        label="Gestura Systems"
        meta="Client-Side Vision Protocol · 2026"
        height="440px"
        preset="night"
        columns={[
          {
            title: 'Vision Tasks',
            links: [
              { label: 'Face Landmarker' },
              { label: 'Gesture Recognizer' },
              { label: 'Blendshape Engine' },
            ],
          },
          {
            title: 'Security',
            links: [
              { label: 'Client-Side WASM' },
              { label: 'Zero Cloud Storage' },
              { label: 'SHA-256 Hashing' },
            ],
          },
          {
            title: 'Governance',
            links: [
              { label: 'Privacy Policy' },
              { label: 'Terms of Service' },
              { label: 'MIT Open Source' },
            ],
          },
        ]}
      />
    </div>
  );
}
