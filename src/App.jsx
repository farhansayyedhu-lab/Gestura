import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WebcamViewer from './components/WebcamViewer';
import MoodIndicator from './components/MoodIndicator';
import RecommendationGrid from './components/RecommendationGrid';
import ActivityModal from './components/ActivityModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsConditionsModal from './components/TermsConditionsModal';
import AuthModal from './components/AuthModal';
import HalftoneWordmarkFooter from './components/ui/halftone-wordmark-footer';
import { useMoodDetection } from './hooks/useMoodDetection';
import { ACTIVITIES } from './data/activities';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    // Real Vision states
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

  // Authentication State with secure storage
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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [shuffledActivities, setShuffledActivities] = useState(ACTIVITIES);
  const [toastMessage, setToastMessage] = useState(null);

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
    showToast(`Authentication confirmed: ${userData.name}`);
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('gestura_user');
    } catch (e) {}
    showToast('Session terminated.');
  };

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Shuffle activities
  const handleShuffle = () => {
    setShuffledActivities((prev) => [...prev].sort(() => Math.random() - 0.5));
    showToast('Recommendation sequence updated.');
  };

  // Gesture reactions
  useEffect(() => {
    if (detectedGesture === 'thumbs_up') {
      const topMatch = shuffledActivities.find((act) => act.mood === currentMood);
      if (topMatch && !selectedActivity) {
        setSelectedActivity(topMatch);
        showToast(`Thumbs Up command: Triggered "${topMatch.title}"`);
      }
    } else if (detectedGesture === 'open_palm') {
      handleShuffle();
      showToast('Open Palm command: Options refreshed.');
    }
  }, [detectedGesture, currentMood]);

  const handleToggleWebcam = () => {
    if (isStreaming) {
      stopWebcam();
      showToast('Camera feed disconnected.');
    } else {
      startWebcam(selectedDeviceId);
      showToast('Camera feed initializing...');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs shadow-lg animate-fadeIn font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        isStreaming={isStreaming}
        onToggleWebcam={handleToggleWebcam}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenTermsModal={() => setIsTermsModalOpen(true)}
        onOpenAuthModal={openAuthModal}
        user={user}
        onLogout={handleLogout}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
      />

      {/* Security Architecture Top Banner */}
      <div className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-2 text-center text-xs text-slate-300 flex flex-wrap items-center justify-center gap-3 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Security Architecture: Client-Side WebAssembly isolation. Zero remote video transmission or cloud biometric storage.
          </span>
        </div>

        {!user && (
          <button
            onClick={() => openAuthModal('signin')}
            className="text-[11px] font-sans text-blue-400 hover:text-blue-300 underline transition cursor-pointer"
          >
            Sign in to access user sessions
          </button>
        )}
      </div>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Section: Camera Viewer & Real-time Status Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

          {/* Right Column (5 cols): Real-Time Expression Status Panel */}
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
        <section className="mt-2">
          <RecommendationGrid
            activities={shuffledActivities}
            currentMood={currentMood}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onShuffle={handleShuffle}
          />
        </section>
      </main>

      {/* Corporate Halftone Wordmark Footer */}
      <HalftoneWordmarkFooter
        wordmark="gestura"
        label="Gestura Systems"
        meta="Client-Side Vision Protocol"
        height="440px"
        preset="night"
        columns={[
          {
            title: 'Technology',
            links: [
              { label: 'WebAssembly Engine' },
              { label: '3D Landmark Mesh' },
              { label: '52 Expression Blendshapes' },
            ],
          },
          {
            title: 'Security',
            links: [
              { label: 'Client-Side Isolation' },
              { label: 'Zero Cloud Storage' },
              { label: 'SHA-256 Hashing' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy Policy' },
              { label: 'Terms of Service' },
              { label: 'Security Disclosures' },
            ],
          },
        ]}
      />

      {/* Protocol Modal */}
      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* Formal Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Formal Terms of Service Modal */}
      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Authentication Modal with Sanitization & Rate Limiting */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
