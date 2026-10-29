import React, { useState } from 'react';
import {
  Camera,
  RefreshCw,
  VideoOff,
  Eye,
  EyeOff,
  FlipHorizontal,
  Maximize2,
  AlertTriangle,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function WebcamViewer({
  videoRef,
  canvasRef,
  isStreaming,
  permissionState,
  errorMessage,
  onStartWebcam,
  onStopWebcam,
  onSwitchCamera,
  availableDevices,
  selectedDeviceId,
  isMirrored,
  setIsMirrored,
  fps,
  detectedGesture,
  currentMood,
}) {
  const [isCurtainActive, setIsCurtainActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const container = document.getElementById('webcam-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="webcam-container"
      className="relative flex flex-col rounded-3xl overflow-hidden glass-panel border border-slate-800/90 shadow-2xl transition-all duration-300"
    >
      {/* Top Bar inside Viewer */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 z-20">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isStreaming
                ? 'bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase font-mono">
            {isStreaming ? 'Live Vision Feed' : 'Camera Standby'}
          </span>
          {isStreaming && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
              {fps || 30} FPS
            </span>
          )}
        </div>

        {/* Device selector if multiple cameras detected */}
        {availableDevices.length > 1 && isStreaming && (
          <div className="flex items-center gap-1.5">
            <select
              value={selectedDeviceId}
              onChange={(e) => onSwitchCamera(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
            >
              {availableDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Video Control Icons */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition cursor-pointer ${
              isMirrored ? 'text-indigo-400 bg-indigo-500/10' : ''
            }`}
            title="Mirror horizontal video"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCurtainActive(!isCurtainActive)}
            className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition cursor-pointer ${
              isCurtainActive ? 'text-amber-400 bg-amber-500/10' : ''
            }`}
            title="Toggle Privacy Curtain"
          >
            {isCurtainActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Active HTML5 Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${!isStreaming || isCurtainActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />

        {/* Canvas overlay for facial landmarks / gesture tracking */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${!isStreaming || isCurtainActive ? 'hidden' : 'block'}`}
        />

        {/* Privacy Curtain Overlay */}
        {isCurtainActive && isStreaming && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400">
              <EyeOff className="w-7 h-7" />
            </div>
            <h4 className="text-base font-semibold text-slate-100 mb-1">Privacy Blind Active</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Your camera is temporarily obscured on your screen. Click the eye icon above to reveal your preview.
            </p>
            <button
              onClick={() => setIsCurtainActive(false)}
              className="px-4 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
            >
              Resume Live Preview
            </button>
          </div>
        )}

        {/* Standby / Initial Permission Prompt Overlay */}
        {!isStreaming && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950/80 to-[#0b1120]">
            {permissionState === 'denied' ? (
              <div className="max-w-md flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Camera Access Blocked</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {errorMessage || 'Camera permission was denied. Please allow camera permissions in your browser URL bar lock icon to enable live emotion and gesture analysis.'}
                </p>
                <button
                  onClick={() => onStartWebcam()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-600/10">
                    <Camera className="w-10 h-10 text-indigo-400" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  Enable Camera for Real-Time Analysis
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Gestura analyzes subtle facial micro-expressions and hand gestures right inside your browser window. No frames are ever recorded or uploaded.
                </p>
                <button
                  onClick={() => onStartWebcam()}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-xl shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Preview</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live HUD Floating Indicators */}
        {isStreaming && !isCurtainActive && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-[11px]">
                GESTURE: {detectedGesture !== 'none' ? detectedGesture.toUpperCase().replace('_', ' ') : 'SEARCHING...'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] capitalize">{currentMood} Focus</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls inside viewer card */}
      <div className="px-4 py-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Client-Side Inference Active</span>
        </div>
        {isStreaming && (
          <button
            onClick={onStopWebcam}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <VideoOff className="w-3.5 h-3.5" />
            <span>Turn Off</span>
          </button>
        )}
      </div>
    </div>
  );
}
