import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WebcamViewer from './components/WebcamViewer';
import MoodIndicator from './components/MoodIndicator';
import RecommendationGrid from './components/RecommendationGrid';
import ActivityModal from './components/ActivityModal';
import PrivacyModal from './components/PrivacyModal';
import { useMoodDetection } from './hooks/useMoodDetection';
import { ACTIVITIES } from './data/activities';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

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
  } = useMoodDetection();

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [shuffledActivities, setShuffledActivities] = useState(ACTIVITIES);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger toast alert
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Shuffle activities
  const handleShuffle = () => {
    setShuffledActivities((prev) => [...prev].sort(() => Math.random() - 0.5));
    showToast('✨ Activity recommendations refreshed!');
  };

  // Gesture reactions
  useEffect(() => {
    if (detectedGesture === 'thumbs_up') {
      // Find the first activity matching current mood
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-200 text-xs shadow-2xl backdrop-blur-md animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        isStreaming={isStreaming}
        onToggleWebcam={handleToggleWebcam}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
      />

      {/* Top Banner Notice (Requirement 2: Privacy notice) */}
      <div className="w-full bg-indigo-950/40 border-b border-indigo-500/10 px-4 py-2 text-center text-xs text-indigo-200/90 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Privacy Guaranteed:</strong> All facial analysis & gesture recognition runs exclusively client-side in your browser. Video is never recorded, stored, or sent to a server.
        </span>
      </div>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Top Section: Split between Camera Viewer and Live Mood Status Panel */}
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
            />
          </div>

          {/* Right Column (5 cols): Real-Time Mood Status Panel */}
          <div className="lg:col-span-5">
            <MoodIndicator
              currentMood={currentMood}
              confidence={confidence}
              probabilities={probabilities}
              detectedGesture={detectedGesture}
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

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Gestura AI Vision System • Step 1 Architecture Active</span>
          </div>
          <div>
            Built with React 19, Tailwind CSS & HTML5 MediaStream API
          </div>
        </div>
      </footer>

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
    </div>
  );
}
