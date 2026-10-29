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
import LandingPage from './components/LandingPage';
import { useMoodDetection } from './hooks/useMoodDetection';
import { ACTIVITIES } from './data/activities';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

// ─── Dashboard (post-login view) ───────────────────────────────────────────────
function Dashboard({ user, onLogout, onOpenPrivacyModal, onOpenTermsModal, onOpenAuthModal, onNavigateToLanding }) {
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

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [shuffledActivities, setShuffledActivities] = useState(ACTIVITIES);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShuffle = () => {
    setShuffledActivities((prev) => [...prev].sort(() => Math.random() - 0.5));
    showToast('Recommendation sequence updated.');
  };

  const handleToggleWebcam = () => {
    if (isStreaming) {
      stopWebcam();
      showToast('Camera feed disconnected.');
    } else {
      startWebcam(selectedDeviceId);
      showToast('Camera feed initializing...');
    }
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
        onOpenPrivacyModal={onOpenPrivacyModal}
        onOpenTermsModal={onOpenTermsModal}
        onOpenAuthModal={onOpenAuthModal}
        user={user}
        onLogout={onLogout}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
        onNavigateToLanding={onNavigateToLanding}
      />

      {/* Security Banner */}
      <div className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-2 text-center text-xs text-slate-300 flex flex-wrap items-center justify-center gap-3 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Security Architecture: Client-Side WebAssembly isolation. Zero remote video transmission or cloud biometric storage.
          </span>
        </div>
      </div>

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Webcam Viewer */}
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

          {/* Mood Indicator */}
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

        {/* Recommendations */}
        <section className="mt-2">
          <RecommendationGrid
            activities={shuffledActivities}
            currentMood={currentMood}
            onSelectActivity={(act) => setSelectedActivity(act)}
            onShuffle={handleShuffle}
          />
        </section>
      </main>

      {/* Halftone Footer */}
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

      {/* Modals */}
      <ActivityModal activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
    </div>
  );
}

// ─── Root App — Auth-Gated Router ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gestura_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Controls which page is visible: Always defaults to 'landing' so user sees sign-in & details first
  const [view, setView] = useState('landing');
  const [opacity, setOpacity] = useState(1);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Fade transition helper
  const switchView = (nextView) => {
    setOpacity(0);
    setTimeout(() => {
      setView(nextView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setOpacity(1);
    }, 240);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    try { localStorage.setItem('gestura_user', JSON.stringify(userData)); } catch {}
    switchView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem('gestura_user'); } catch {}
    switchView('landing');
  };

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div style={{ opacity, transition: 'opacity 0.24s ease', minHeight: '100vh' }}>
      {view === 'landing' ? (
        <LandingPage
          onLoginSuccess={handleLoginSuccess}
          currentUser={user}
        />
      ) : (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
          onOpenTermsModal={() => setIsTermsModalOpen(true)}
          onOpenAuthModal={openAuthModal}
          onNavigateToLanding={() => switchView('landing')}
        />
      )}

      {/* Global Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsConditionsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
