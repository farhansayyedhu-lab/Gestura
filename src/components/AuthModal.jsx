import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  hashPassword,
  authRateLimiter,
} from '../lib/security';

// Google Multicolor G SVG Icon
export function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signin',
  onLoginSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Google Login Simulation
  const handleGoogleLogin = () => {
    // Rate limit check
    const rateCheck = authRateLimiter.check('auth-google');
    if (!rateCheck.allowed) {
      setError(`Too many requests. Please wait ${rateCheck.retryAfterSec} seconds before retrying.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const user = {
        name: 'Farhan Sayyed',
        email: 'farhansayyedhu@gmail.com',
        avatar: null,
        provider: 'google',
        role: 'user',
        sessionCreatedAt: Date.now(),
      };
      authRateLimiter.reset('auth-google');
      setIsLoading(false);
      onLoginSuccess?.(user);
      onClose();
    }, 500);
  };

  // Form Submit with Validation, Sanitization, Rate Limiting, and Hashing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Rate Limiting
    const rateCheck = authRateLimiter.check('auth-form');
    if (!rateCheck.allowed) {
      setError(`Too many authentication attempts. Please wait ${rateCheck.retryAfterSec} seconds.`);
      return;
    }

    // Input Sanitization
    const cleanEmail = sanitizeInput(email);
    const cleanName = sanitizeInput(name);

    if (!cleanEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        setError(pwCheck.message || 'Password must be at least 8 characters with letters and numbers.');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Securely hash password via Web Crypto API SHA-256
      const passwordHash = await hashPassword(password);

      setTimeout(() => {
        const user = {
          name: cleanName || cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash,
          provider: 'email',
          role: 'user',
          sessionCreatedAt: Date.now(),
        };
        authRateLimiter.reset('auth-form');
        setIsLoading(false);
        onLoginSuccess?.(user);
        onClose();
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setError('An error occurred during authentication processing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-lg bg-slate-900 border border-slate-800 p-6 shadow-xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 text-left">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Account' : 'Register New Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Access your saved session profile and calibration data.'
              : 'Create credentials for client-side profile isolation.'}
          </p>
        </div>

        {/* Google Authentication Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="absolute px-2.5 bg-slate-900 text-[10px] font-mono text-slate-500 uppercase">
              Or with credentials
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 rounded transition cursor-pointer font-medium ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-1.5 rounded transition cursor-pointer font-medium ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Farhan Sayyed"
                    className="w-full pl-9 pr-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 transition font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2 rounded bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-blue-500 transition font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SHA-256 Client-Hashed Credentials</span>
        </div>
      </div>
    </div>
  );
}
