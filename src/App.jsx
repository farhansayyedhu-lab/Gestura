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
import { getCurrentSession, signOut } from './lib/auth';

// ─── Dashboard (post-login protected view) ─────────────────────────────────────
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
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-zinc-800 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs shadow-xl animate-fadeIn font-mono">
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

      {/* Security Architecture Banner */}
      <div className="w-full bg-zinc-950 border-b border-zinc-800/80 px-4 py-2.5 text-center text-xs text-zinc-300 flex flex-wrap items-center justify-center gap-3 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Security Architecture: Client-Side WebAssembly isolation. Zero remote video transmission or cloud biometric storage.
          </span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
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

      {/* Halftone Wordmark Footer */}
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
              { label: 'PBKDF2 SHA-256' },
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

// ─── Root App — Protected Router ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => getCurrentSession());
  const [view, setView] = useState(() => (getCurrentSession() ? 'dashboard' : 'landing'));
  const [opacity, setOpacity] = useState(1);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Fade transition helper
  const switchView = (nextView) => {
    // Protected route check: Can only access dashboard if user is authenticated
    if (nextView === 'dashboard' && !user) {
      nextView = 'landing';
    }

    setOpacity(0);
    setTimeout(() => {
      setView(nextView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setOpacity(1);
    }, 240);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    switchView('dashboard');
  };

  const handleLogout = () => {
    signOut();
    setUser(null);
    switchView('landing');
  };

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div style={{ opacity, transition: 'opacity 0.24s ease', minHeight: '100vh', backgroundColor: '#000000' }}>
      {view === 'landing' || !user ? (
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
