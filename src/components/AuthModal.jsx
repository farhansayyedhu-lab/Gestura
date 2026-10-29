import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  signIn,
  signUp,
  signInWithGoogle,
  validateEmail,
  validatePassword,
} from '../lib/auth';
import { authRateLimiter } from '../lib/security';

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

  // Real Google Sign-In Flow
  const handleGoogleLogin = async () => {
    const rateCheck = authRateLimiter.check('auth-google');
    if (!rateCheck.allowed) {
      setError(`Too many requests. Please wait ${rateCheck.retryAfterSec} seconds.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      authRateLimiter.reset('auth-google');
      setIsLoading(false);
      onLoginSuccess?.(user);
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Google authentication failed.');
    }
  };

  // Real Credentials Submission Flow with PBKDF2 Hashing & Verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const rateCheck = authRateLimiter.check('auth-form');
    if (!rateCheck.allowed) {
      setError(`Too many attempts. Please wait ${rateCheck.retryAfterSec} seconds.`);
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
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Authentication error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-white">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 p-6 sm:p-7 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 text-left">
          <h2 className="text-lg font-semibold text-white tracking-tight">
            {mode === 'signin' ? 'Sign In to Gestura' : 'Create an Account'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'signin'
              ? 'Enter your credentials to access the computer vision dashboard.'
              : 'Create an encrypted account with client-side biometric isolation.'}
          </p>
        </div>

        {/* Google Authentication Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-700 font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-800" />
            <span className="absolute px-2.5 bg-zinc-950 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Or with credentials
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer font-medium ${
                mode === 'signin'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
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
              className={`py-1.5 rounded-lg transition cursor-pointer font-medium ${
                mode === 'signup'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
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
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
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
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
                <span>Verifying Credentials...</span>
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
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PBKDF2 SHA-256 Client-Hashed · 100,000 Iterations</span>
        </div>
      </div>
    </div>
  );
}
