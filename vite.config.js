import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Headers configuration
const isDev = process.env.NODE_ENV !== 'production';

const devCSP = [
  "default-src 'self'",
  // Dev: allow unsafe-inline + unsafe-eval for Vite HMR and React hot reload
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Dev: must allow Vite HMR websocket and all CDN connections
  "connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://cdn.jsdelivr.net https://storage.googleapis.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const prodCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://cdn.jsdelivr.net https://storage.googleapis.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': isDev ? devCSP : prodCSP,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: securityHeaders,
    cors: false,
  },
  preview: {
    headers: securityHeaders,
  },
  build: {
    sourcemap: false,
  },
});
