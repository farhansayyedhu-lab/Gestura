/**
 * Client-Side Security Utilities
 * - Input sanitization & XSS protection
 * - Sliding window rate limiting
 * - Cryptographic password hashing (SHA-256 via Web Crypto API)
 * - Safe data validators
 */

// 1. Sanitize text input against XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// 2. Strict Email Validator
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

// 3. Secure Password Strength Validator (min 8 chars, 1 number, 1 letter)
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain both letters and numbers.' };
  }
  return { valid: true };
}

// 4. Secure Password Hashing via Web Crypto API (SHA-256 + Salt)
export async function hashPassword(password: string, salt: string = 'gestura-secure-salt'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 5. Sliding-Window Rate Limiter
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  public check(key: string): { allowed: boolean; remaining: number; retryAfterSec?: number } {
    const now = Date.now();
    const timestamps = (this.attempts.get(key) || []).filter((t) => now - t < this.windowMs);

    if (timestamps.length >= this.maxAttempts) {
      const oldest = timestamps[0];
      const retryAfterSec = Math.ceil((this.windowMs - (now - oldest)) / 1000);
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    timestamps.push(now);
    this.attempts.set(key, timestamps);
    return { allowed: true, remaining: this.maxAttempts - timestamps.length };
  }

  public reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const authRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
