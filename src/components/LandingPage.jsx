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
} from 'lucide-react';
import { GoogleIcon } from './AuthModal';
import HalftoneWordmarkFooter from './ui/halftone-wordmark-footer';
import KineticGrid from './ui/kinetic-grid';
import {
  signIn,
  signUp,
  signInWithGoogle,
  validateEmail,
  validatePassword,
} from '../lib/auth';
import { authRateLimiter } from '../lib/security';

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, tag }) {
  return (
    <div className="group relative p-6 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 group-hover:border-zinc-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          {tag && (
            <span className="inline-block text-[10px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
              {tag}
            </span>
          )}
          <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight">{title}</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Real Inline Auth Panel ───────────────────────────────────────────────────
function AuthPanel({ onLoginSuccess, currentUser }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real Google Sign In Flow
  const handleGoogleLogin = async () => {
    const rateCheck = authRateLimiter.check('auth-google');
    if (!rateCheck.allowed) {
      setError(`Too many requests. Please wait ${rateCheck.retryAfterSec}s.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      authRateLimiter.reset('auth-google');
      setIsLoading(false);
      onLoginSuccess?.(user);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Google sign-in failed.');
    }
  };

  // Real Credential Submission with PBKDF2 Encryption
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const rateCheck = authRateLimiter.check('auth-form');
    if (!rateCheck.allowed) {
      setError(`Too many attempts. Please wait ${rateCheck.retryAfterSec}s.`);
      return;
    }

    setIsLoading(true);

    try {
      let user;
      if (mode === 'signup') {
        user = await signUp({ name, email, password });
      } else {
        user = await signIn({ email, password });
      }

      authRateLimiter.reset('auth-form');
      setIsLoading(false);
      onLoginSuccess?.(user);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Authentication error.');
    }
  };

  // If user already active in session, display quick-launch option
  if (currentUser) {
    return (
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-md text-white">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Authenticated Session</p>
            <h3 className="text-base font-semibold text-white">{currentUser.name}</h3>
            <p className="text-xs text-zinc-400 font-mono truncate">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onLoginSuccess?.(currentUser)}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm shadow-sm transition cursor-pointer mb-3"
        >
          <span>Open Protected Vision Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[11px] text-zinc-500 font-mono">
          Your credentials and biometrics are isolated locally.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-zinc-950/95 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-md text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Gestura Gate</p>
            <h2 className="text-sm font-semibold text-white">
              {mode === 'signin' ? 'Sign In to Access Site' : 'Register New Account'}
            </h2>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
          Protected
        </span>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700 font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50 mb-4"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center mb-4">
        <div className="flex-1 border-t border-zinc-800" />
        <span className="px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">or email & password</span>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs mb-4">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null); }}
          className={`py-1.5 rounded-lg transition cursor-pointer font-medium ${
            mode === 'signin' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); }}
          className={`py-1.5 rounded-lg transition cursor-pointer font-medium ${
            mode === 'signup' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
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

      {/* Real Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Farhan Sayyed"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition font-sans"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-zinc-400 mb-1 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters (letters + numbers)"
              required
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-zinc-800 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition cursor-pointer disabled:opacity-50 mt-1"
        >
          {isLoading ? (
            <span className="font-mono text-[11px]">Verifying Credentials...</span>
          ) : (
            <>
              <span>{mode === 'signin' ? 'Sign In & Access Dashboard' : 'Register & Enter Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Security note */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>PBKDF2 SHA-256 · 100,000 Iterations · Zero Plaintext Storage</span>
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
      desc: 'Strict CSP headers, rate-limited auth endpoints, PBKDF2 SHA-256 client hashing, and strict zero-biometric cloud storage policy.',
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
      className="min-h-screen bg-black text-white selection:bg-zinc-800 selection:text-white"
      style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.35s ease' }}
    >
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-tight text-white uppercase">Gestura</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">
                  Vision Platform
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="hidden md:flex items-center gap-2 text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MediaPipe Vision Pipeline</span>
            </div>
            <span className="hidden md:block text-zinc-800">|</span>
            <span className="text-zinc-400 text-xs font-mono">Authentication Protected</span>
          </div>
        </div>
      </header>

      {/* ── Hero Section with Kinetic Grid Background ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-zinc-800/80">
        <KineticGrid className="absolute inset-0 w-full h-full" globalColor="monochrome">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
              {/* Left Column: Product Overview */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-700 bg-zinc-900/60 text-[10px] font-mono text-zinc-300 uppercase tracking-widest mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  Client-Side Biometric Emotion Engine
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
                  Real-time facial vision & gesture input pipeline.
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mb-8">
                  Gestura executes Google MediaPipe neural networks inside browser WebAssembly to
                  classify emotional state and decode hand gestures directly from your webcam.
                  Zero cloud telemetry. Complete local data isolation.
                </p>

                {/* Technical Specs Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-8">
                  {specs.map((s) => (
                    <div key={s.label} className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                      <div className="text-base font-bold text-white font-mono">{s.value}</div>
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-5 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>No cloud video transmission</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-zinc-300" />
                    <span>Fully runs offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-zinc-300" />
                    <span>Pure WebAssembly</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Protected Auth Panel */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <AuthPanel onLoginSuccess={onLoginSuccess} currentUser={currentUser} />
              </div>
            </div>
          </div>
        </KineticGrid>
      </section>

      {/* ── Architecture & Features Grid ── */}
      <section className="py-20 border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">Capabilities</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Designed for high-throughput, low-latency vision.
              </h2>
              <span className="text-xs font-mono text-zinc-500">478 Landmarks · 52 Blendshapes · 30+ FPS</span>
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
      <section className="py-20 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">Input Pipeline</p>
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
              <div key={p.step} className="p-6 rounded-xl border border-zinc-800 bg-black relative">
                <span className="text-2xl font-bold font-mono text-zinc-400 mb-3 block">{p.step}</span>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
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
              { label: 'PBKDF2 SHA-256' },
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
