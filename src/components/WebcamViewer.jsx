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
  Cpu,
  Layers,
  UserCheck,
  Hand,
  Loader2,
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
  // AI Model States
  isModelLoading,
  isModelReady,
  modelStatus,
  modelError,
  faceDetected,
  handsDetectedCount,
  overlayMode,
  setOverlayMode,
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
      className="relative flex flex-col rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shadow-md"
    >
      {/* Top Bar inside Viewer */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/90 z-20 gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-sm ${
              isStreaming
                ? 'bg-emerald-400'
                : 'bg-slate-600'
            }`}
          />
          <span className="text-xs font-mono font-medium text-slate-200 tracking-wider uppercase">
            {isStreaming ? 'Live Video Input' : 'Video Input Standby'}
          </span>

          {isStreaming && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {fps || 30} FPS
            </span>
          )}

          {/* AI Model State Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
            {isModelLoading ? (
              <>
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                <span>Initializing models...</span>
              </>
            ) : isModelReady ? (
              <>
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span>MediaPipe Tasks Active</span>
              </>
            ) : (
              <span>Optical Engine Active</span>
            )}
          </div>
        </div>

        {/* Video Control Icons & HUD Options */}
        <div className="flex items-center gap-1.5 text-slate-400">
          {/* Overlay Mode Selector */}
          {isStreaming && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded p-0.5">
              <span className="text-[10px] font-mono text-slate-400 px-1 hidden md:inline">Overlay:</span>
              <button
                onClick={() => setOverlayMode('contours')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition ${
                  overlayMode === 'contours'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Facial contours & hand skeleton"
              >
                Contours
              </button>
              <button
                onClick={() => setOverlayMode('mesh')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition ${
                  overlayMode === 'mesh'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Dense face mesh (478 pts)"
              >
                Mesh
              </button>
              <button
                onClick={() => setOverlayMode('off')}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition ${
                  overlayMode === 'off'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Turn overlay off"
              >
                Clean
              </button>
            </div>
          )}

          {/* Multiple camera devices */}
          {availableDevices.length > 1 && isStreaming && (
            <select
              value={selectedDeviceId}
              onChange={(e) => onSwitchCamera(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-mono"
            >
              {availableDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Device ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-1.5 rounded hover:text-white hover:bg-slate-800 transition cursor-pointer ${
              isMirrored ? 'text-blue-400 bg-blue-500/10' : ''
            }`}
            title="Mirror video horizontally"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCurtainActive(!isCurtainActive)}
            className={`p-1.5 rounded hover:text-white hover:bg-slate-800 transition cursor-pointer ${
              isCurtainActive ? 'text-amber-400 bg-amber-500/10' : ''
            }`}
            title="Toggle Privacy Curtain"
          >
            {isCurtainActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Active HTML5 Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${!isStreaming || isCurtainActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />

        {/* Real-time Canvas Overlay with object-cover for 1:1 coordinate alignment */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${!isStreaming || isCurtainActive ? 'hidden' : 'block'}`}
        />

        {/* Privacy Curtain Overlay */}
        {isCurtainActive && isStreaming && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/95 p-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-100 mb-1">Privacy Blind Active</h4>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              Local camera preview obscured on screen. Processing remains local.
            </p>
            <button
              onClick={() => setIsCurtainActive(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
            >
              Resume Live Preview
            </button>
          </div>
        )}

        {/* Standby / Initial State */}
        {!isStreaming && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black">
            {permissionState === 'denied' ? (
              <div className="max-w-md flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Camera Permission Denied</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  {errorMessage || 'Camera access was blocked in browser settings. Please permit camera access to run local expression analysis.'}
                </p>
                <button
                  onClick={() => onStartWebcam()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Access
                </button>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <Camera className="w-7 h-7 text-zinc-100" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                    <Lock className="w-3 h-3" />
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">
                  Webcam Optical Stream
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-5 max-w-sm">
                  Client-side expression and gesture recognition. Frames are processed locally in memory using WebAssembly.
                </p>
                <button
                  onClick={() => onStartWebcam()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Feed</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Live HUD Floating Indicators */}
        {isStreaming && !isCurtainActive && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/90 border border-zinc-800 text-xs text-zinc-200 backdrop-blur-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  faceDetected ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-amber-400'
                }`}
              />
              <span className="font-mono text-[11px]">
                {faceDetected ? 'FACE TRACKED' : 'NO FACE DETECTED (ALIGN IN FRAME)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/90 border border-zinc-800 text-xs text-zinc-200 backdrop-blur-sm">
              <Hand className={`w-3.5 h-3.5 ${detectedGesture !== 'none' ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <span className="font-mono text-[11px]">
                {detectedGesture !== 'none'
                  ? `GESTURE: ${detectedGesture.toUpperCase().replace('_', ' ')}`
                  : handsDetectedCount > 0
                  ? `HAND VISIBLE`
                  : 'GESTURE: NONE'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls inside viewer card */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local In-Memory Inference</span>
        </div>
        {isStreaming && (
          <button
            onClick={onStopWebcam}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition cursor-pointer text-xs"
          >
            <VideoOff className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        )}
      </div>
    </div>
  );
}
