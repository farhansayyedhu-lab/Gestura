import { useState, useEffect, useRef, useCallback } from 'react';
import { MOODS } from '../data/activities';

// Default initial emotion probabilities
const INITIAL_PROBABILITIES = {
  [MOODS.NEUTRAL]: 0.72,
  [MOODS.HAPPY]: 0.12,
  [MOODS.STRESSED]: 0.06,
  [MOODS.TIRED]: 0.05,
  [MOODS.SAD]: 0.03,
  [MOODS.SURPRISED]: 0.02,
};

export function useMoodDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameId = useRef(null);

  // Webcam & Permission states
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // AI Detection states
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentMood, setCurrentMood] = useState(MOODS.NEUTRAL);
  const [confidence, setConfidence] = useState(0.85);
  const [probabilities, setProbabilities] = useState(INITIAL_PROBABILITIES);
  const [detectedGesture, setDetectedGesture] = useState('none'); // 'none' | 'thumbs_up' | 'open_palm' | 'peace' | 'fist'
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const [simulationMode, setSimulationMode] = useState(false);
  const [fps, setFps] = useState(0);

  // Enumerate devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setAvailableDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
    }
  }, [selectedDeviceId]);

  // Start webcam stream
  const startWebcam = useCallback(async (deviceId = null) => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((e) => console.warn('Autoplay error:', e));
          setIsStreaming(true);
          setPermissionState('granted');
        };
      }

      await updateDeviceList();
      setIsDetecting(true);
    } catch (err) {
      console.error('Webcam access error:', err);
      setIsStreaming(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setErrorMessage('Camera permission was denied. Please allow camera access in your browser settings.');
      } else {
        setPermissionState('error');
        setErrorMessage(err.message || 'Unable to access video stream.');
      }
    }
  }, [updateDeviceList]);

  // Stop webcam stream
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsDetecting(false);
  }, []);

  // Switch camera device
  const switchCamera = useCallback(
    async (deviceId) => {
      setSelectedDeviceId(deviceId);
      if (isStreaming) {
        await startWebcam(deviceId);
      }
    },
    [isStreaming, startWebcam]
  );

  // Simulation mode trigger (allows instant manual previewing of any emotion and gesture)
  const setSimulatedMood = useCallback((mood) => {
    setCurrentMood(mood);
    setConfidence(Number((0.82 + Math.random() * 0.16).toFixed(2)));

    const newProbs = {
      [MOODS.NEUTRAL]: 0.05,
      [MOODS.HAPPY]: 0.05,
      [MOODS.STRESSED]: 0.05,
      [MOODS.TIRED]: 0.05,
      [MOODS.SAD]: 0.05,
      [MOODS.SURPRISED]: 0.05,
    };
    newProbs[mood] = 0.75;
    setProbabilities(newProbs);
  }, []);

  // Simulate gesture trigger
  const triggerGesture = useCallback((gestureName) => {
    setDetectedGesture(gestureName);
    setGestureConfidence(0.94);
    setTimeout(() => {
      setDetectedGesture('none');
      setGestureConfidence(0);
    }, 2500);
  }, []);

  // Render video frame placeholder / HUD graphics on canvas overlay
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;

    const renderLoop = (timestamp) => {
      frameCount++;
      if (timestamp - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = timestamp;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video && isStreaming && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw futuristic targeting HUD elements for face scanning visual feedback
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const boxW = Math.min(canvas.width * 0.38, 260);
        const boxH = Math.min(canvas.height * 0.55, 340);
        const x0 = cx - boxW / 2;
        const y0 = cy - boxH / 2;

        // Subtle scanning brackets
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 6]);
        ctx.strokeRect(x0, y0, boxW, boxH);
        ctx.setLineDash([]);

        // Corner accents
        const cornerLen = 20;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(x0, y0 + cornerLen);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x0 + cornerLen, y0);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x0 + boxW - cornerLen, y0);
        ctx.lineTo(x0 + boxW, y0);
        ctx.lineTo(x0 + boxW, y0 + cornerLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x0, y0 + boxH - cornerLen);
        ctx.lineTo(x0, y0 + boxH);
        ctx.lineTo(x0 + cornerLen, y0 + boxH);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x0 + boxW - cornerLen, y0 + boxH);
        ctx.lineTo(x0 + boxW, y0 + boxH);
        ctx.lineTo(x0 + boxW, y0 + boxH - cornerLen);
        ctx.stroke();

        // Animated scan line
        const scanY = y0 + ((timestamp / 20) % boxH);
        const grad = ctx.createLinearGradient(x0, scanY, x0 + boxW, scanY);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0)');
        grad.addColorStop(0.5, 'rgba(129, 140, 248, 0.6)');
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0 + 4, scanY);
        ctx.lineTo(x0 + boxW - 4, scanY);
        ctx.stroke();

        // HUD Text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '11px monospace';
        ctx.fillText(`GESTURA VISION • FPS: ${fps || 30}`, x0, y0 - 8);
        ctx.fillText(`STATUS: TRACKING ACTIVE`, x0, y0 + boxH + 16);
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    if (isStreaming) {
      animationFrameId.current = requestAnimationFrame(renderLoop);
    } else {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isStreaming, fps]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
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
    isMuted,
    setIsMuted,

    // Vision model stats
    isModelLoading,
    setIsModelLoading,
    isModelReady,
    setIsModelReady,
    isDetecting,
    setIsDetecting,
    currentMood,
    confidence,
    probabilities,
    detectedGesture,
    gestureConfidence,
    setSimulatedMood,
    triggerGesture,
    simulationMode,
    setSimulationMode,
    fps,
  };
}
