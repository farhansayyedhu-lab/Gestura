import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WebcamViewer from './components/WebcamViewer';
import MoodIndicator from './components/MoodIndicator';
import RecommendationGrid from './components/RecommendationGrid';
import ActivityModal from './components/ActivityModal';
import PrivacyModal from './components/PrivacyModal';
import AuthModal from './components/AuthModal';
import KineticGrid from './components/ui/kinetic-grid';
import HalftoneWordmarkFooter from './components/ui/halftone-wordmark-footer';
import { useMoodDetection } from './hooks/useMoodDetection';
import { ACTIVITIES } from './data/activities';
import { ShieldCheck, Sparkles, UserCheck, Flame, CheckCircle2 } from 'lucide-react';

export default function App() {
  const {
    videoRef,
    canvasRef,
    isStreaming,
    permissionState,
    errorMessage,
    startWebcam,
    stopWebcam,
    switchCamera,
    availableDevices,
    selectedDeviceId,
    isMirrored,
    setIsMirrored,
    fps,
    currentMood,
    confidence,
    probabilities,
    detectedGesture,
    setSimulatedMood,
    triggerGesture,
    simulationMode,
    setSimulationMode,
    // Real AI Vision states
    isModelLoading,
    isModelReady,
    modelStatus,
    modelError,
    faceDetected,
    handsDetectedCount,
    topBlendshapes,
    overlayMode,
    setOverlayMode,
  } = useMoodDetection();

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gestura_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [shuffledActivities, setShuffledActivities] = useState(ACTIVITIES);
  const [toastMessage, setToastMessage] = useState(null);
  const [kineticActive, setKineticActive] = useState(false);

  // Trigger toast alert
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('gestura_user', JSON.stringify(userData));
    } catch (e) {}
    showToast(`🎉 Welcome back, ${userData.name}! Successfully signed in.`);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('gestura_user');
    } catch (e) {}
    showToast('Signed out of Gestura account.');
  };

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Shuffle activities
  const handleShuffle = () => {
    setShuffledActivities((prev) => [...prev].sort(() => Math.random() - 0.5));
    showToast('✨ Activity recommendations refreshed!');
  };

  // Gesture reactions
  useEffect(() => {
    if (detectedGesture === 'thumbs_up') {
      const topMatch = shuffledActivities.find((act) => act.mood === currentMood);
      if (topMatch && !selectedActivity) {
        setSelectedActivity(topMatch);
        showToast(`👍 Thumbs Up Detected! Launched "${topMatch.title}"`);
      }
    } else if (detectedGesture === 'open_palm') {
      handleShuffle();
      showToast('✋ Open Palm Detected: Recommendations shuffled!');
    }
  }, [detectedGesture, currentMood]);

  const handleToggleWebcam = () => {
    if (isStreaming) {
      stopWebcam();
      showToast('Camera feed disconnected.');
    } else {
      startWebcam(selectedDeviceId);
      showToast('Camera feed starting with real-time biometric lock...');
    }
  };

  const content = (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-950/95 border border-indigo-500/50 text-indigo-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with full Auth & Kinetic Controls */}
      <Header
        isStreaming={isStreaming}
        onToggleWebcam={handleToggleWebcam}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenAuthModal={openAuthModal}
        user={user}
        onLogout={handleLogout}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
        kineticActive={kineticActive}
        setKineticActive={setKineticActive}
      />

      {/* Top Banner Notice */}
      <div className="w-full bg-indigo-950/50 border-b border-indigo-500/20 px-4 py-2 text-center text-xs text-indigo-200/90 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>100% Client-Side Privacy:</strong> Real-time biometric face detection runs in WebAssembly inside your browser. No video frames are ever uploaded or stored.
          </span>
        </div>

        {!user && (
          <button
            onClick={() => openAuthModal('signin')}
            className="text-[11px] font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-400/40 transition cursor-pointer"
          >
            Sign in to track mood streaks →
          </button>
        )}
      </div>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Section: Camera Viewer & Live Mood Status Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Webcam Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <WebcamViewer
              videoRef={videoRef}
              canvasRef={canvasRef}
              isStreaming={isStreaming}
              permissionState={permissionState}
              errorMessage={errorMessage}
              onStartWebcam={() => startWebcam(selectedDeviceId)}
              onStopWebcam={stopWebcam}
              onSwitchCamera={switchCamera}
              availableDevices={availableDevices}
              selectedDeviceId={selectedDeviceId}
              isMirrored={isMirrored}
              setIsMirrored={setIsMirrored}
              fps={fps}
              detectedGesture={detectedGesture}
              currentMood={currentMood}
              isModelLoading={isModelLoading}
              isModelReady={isModelReady}
              modelStatus={modelStatus}
              modelError={modelError}
              faceDetected={faceDetected}
              handsDetectedCount={handsDetectedCount}
              overlayMode={overlayMode}
              setOverlayMode={setOverlayMode}
            />
          </div>

          {/* Right Column (5 cols): Real-Time Mood Status Panel */}
          <div className="lg:col-span-5">
            <MoodIndicator
              currentMood={currentMood}
              confidence={confidence}
              probabilities={probabilities}
              detectedGesture={detectedGesture}
              topBlendshapes={topBlendshapes}
              faceDetected={faceDetected}
              simulationMode={simulationMode}
              onSelectSimulatedMood={setSimulatedMood}
              onTriggerGesture={triggerGesture}
            />
          </div>
        </div>

        {/* Bottom Section: Dynamic Recommendation Grid */}
        <section className="mt-4">
          <RecommendationGrid
            activities={shuffledActivities}
            currentMood={currentMood}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onShuffle={handleShuffle}
          />
        </section>
      </main>

      {/* Premium Halftone Wordmark Footer */}
      <HalftoneWordmarkFooter
        wordmark="gestura"
        label="Gestura Vision Lab"
        meta="©2026 · Client-Side AI Ecosystem"
        height="480px"
        preset="night"
        columns={[
          {
            title: 'Vision AI',
            links: [
              { label: 'Face Mesh 478' },
              { label: 'Hand Gestures' },
              { label: '52 Blendshapes' },
            ],
          },
          {
            title: 'Privacy',
            links: [
              { label: 'Local WebAssembly' },
              { label: 'Zero Cloud Storage' },
              { label: 'Biometrics Policy' },
            ],
          },
          {
            title: 'Account',
            links: [
              { label: user ? user.email : 'Sign In with Google' },
              { label: 'Mood History' },
              { label: 'Preferences' },
            ],
          },
        ]}
      />

      {/* Interactive Activity Experience Modal */}
      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* Privacy Architecture Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Authentication Modal with Google Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );

  if (kineticActive) {
    return <KineticGrid globalColor="default">{content}</KineticGrid>;
  }

  return <div className="bg-[#080d1a] min-h-screen">{content}</div>;
}
