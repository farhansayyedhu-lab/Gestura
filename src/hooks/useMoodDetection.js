import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  GestureRecognizer,
} from '@mediapipe/tasks-vision';
import { MOODS } from '../data/activities';

// Default baseline emotion probabilities
const INITIAL_PROBABILITIES = {
  [MOODS.NEUTRAL]: 0.70,
  [MOODS.HAPPY]: 0.10,
  [MOODS.STRESSED]: 0.08,
  [MOODS.TIRED]: 0.05,
  [MOODS.SAD]: 0.04,
  [MOODS.SURPRISED]: 0.03,
};

// CDN endpoints for MediaPipe WASM and official task models
const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm';
const FACE_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const GESTURE_RECOGNIZER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export function useMoodDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Model references
  const faceLandmarkerRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const isInitializingModelsRef = useRef(false);

  // Filter smoothing memory (exponential moving average)
  const smoothedProbsRef = useRef({ ...INITIAL_PROBABILITIES });
  const gestureDebounceRef = useRef({ gesture: 'none', count: 0, lastTriggered: 0 });

  // Webcam & Hardware states
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // AI Model Loading States
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelStatus, setModelStatus] = useState('Initializing MediaPipe Vision...');
  const [modelError, setModelError] = useState(null);

  // AI Live Output States
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [handsDetectedCount, setHandsDetectedCount] = useState(0);
  const [currentMood, setCurrentMood] = useState(MOODS.NEUTRAL);
  const [confidence, setConfidence] = useState(0.85);
  const [probabilities, setProbabilities] = useState(INITIAL_PROBABILITIES);
  const [topBlendshapes, setTopBlendshapes] = useState([]);

  // Gestures: 'none' | 'thumbs_up' | 'open_palm' | 'peace' | 'fist' | 'pointing_up'
  const [detectedGesture, setDetectedGesture] = useState('none');
  const [gestureConfidence, setGestureConfidence] = useState(0);

  // Visual & simulation settings
  const [overlayMode, setOverlayMode] = useState('contours'); // 'contours' | 'mesh' | 'minimal' | 'off'
  const [simulationMode, setSimulationMode] = useState(false);
  const [fps, setFps] = useState(0);

  // 1. Initialize real MediaPipe client-side models
  useEffect(() => {
    let isMounted = true;

    async function initVisionTasks() {
      if (isInitializingModelsRef.current || faceLandmarkerRef.current) return;
      isInitializingModelsRef.current = true;

      try {
        setIsModelLoading(true);
        setModelStatus('Loading WebAssembly Neural Engine...');

        const vision = await FilesetResolver.forVisionTasks(WASM_CDN_URL);
        if (!isMounted) return;

        setModelStatus('Loading Face Landmarker & 52-Blendshape Model...');
        // Try GPU delegate first, fallback to CPU if needed
        let faceLandmarker = null;
        try {
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: FACE_LANDMARKER_MODEL_URL,
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: false,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        } catch (gpuErr) {
          console.warn('GPU delegate failed for FaceLandmarker, falling back to CPU:', gpuErr);
          faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: FACE_LANDMARKER_MODEL_URL,
              delegate: 'CPU',
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: false,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        }
        if (!isMounted) return;
        faceLandmarkerRef.current = faceLandmarker;

        setModelStatus('Loading Hand Gesture Recognition Model...');
        let gestureRecognizer = null;
        try {
          gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: GESTURE_RECOGNIZER_MODEL_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        } catch (gpuErr) {
          console.warn('GPU delegate failed for GestureRecognizer, falling back to CPU:', gpuErr);
          gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: GESTURE_RECOGNIZER_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        }
        if (!isMounted) return;
        gestureRecognizerRef.current = gestureRecognizer;

        setIsModelReady(true);
        setIsModelLoading(false);
        setModelStatus('Real Client-Side AI Models Active');
      } catch (err) {
        console.error('Failed to initialize MediaPipe models:', err);
        if (isMounted) {
          setModelError(err.message || 'Failed to load MediaPipe models');
          setIsModelLoading(false);
          setModelStatus('Offline/Fallback Mode');
        }
      } finally {
        isInitializingModelsRef.current = false;
      }
    }

    initVisionTasks();

    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
        gestureRecognizerRef.current = null;
      }
    };
  }, []);

  // 2. Enumerate available webcam devices
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

  // 3. Start webcam stream
  const startWebcam = useCallback(
    async (deviceId = null) => {
      setErrorMessage(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

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
    },
    [updateDeviceList]
  );

  // 4. Stop webcam stream
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
    setFaceDetected(false);
    setHandsDetectedCount(0);
    setDetectedGesture('none');
    setGestureConfidence(0);
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

  // Manual simulation for previewing (keeps existing demo lab working!)
  const setSimulatedMood = useCallback((mood) => {
    setCurrentMood(mood);
    setConfidence(Number((0.85 + Math.random() * 0.12).toFixed(2)));

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
    smoothedProbsRef.current = { ...newProbs };
  }, []);

  const triggerGesture = useCallback((gestureName) => {
    setDetectedGesture(gestureName);
    setGestureConfidence(0.95);
    setTimeout(() => {
      setDetectedGesture('none');
      setGestureConfidence(0);
    }, 2500);
  }, []);

  // 5. Real-Time Detection and HUD Rendering Loop
  useEffect(() => {
    let lastFpsTime = performance.now();
    let frameCount = 0;

    const renderLoop = () => {
      const now = performance.now();

      // FPS measurement
      frameCount++;
      if (now - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = now;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (
        isStreaming &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        canvas
      ) {
        // Sync canvas resolution with actual video dimensions
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let detectedFaceResult = null;
        let detectedGestureResult = null;

        // Perform inference if models are loaded and frame is new
        if (
          !simulationMode &&
          video.currentTime !== lastVideoTimeRef.current
        ) {
          lastVideoTimeRef.current = video.currentTime;

          // A. Real Face Landmarker Detection
          if (faceLandmarkerRef.current) {
            try {
              detectedFaceResult = faceLandmarkerRef.current.detectForVideo(video, now);
            } catch (err) {
              console.warn('Face detection inference error:', err);
            }
          }

          // B. Real Hand Gesture Recognition
          if (gestureRecognizerRef.current) {
            try {
              detectedGestureResult = gestureRecognizerRef.current.recognizeForVideo(video, now);
            } catch (err) {
              console.warn('Gesture recognition inference error:', err);
            }
          }
        }

        // --- Process Face Emotion & Blendshapes ---
        if (detectedFaceResult && detectedFaceResult.faceLandmarks.length > 0) {
          setFaceDetected(true);
          const landmarks = detectedFaceResult.faceLandmarks[0];

          if (
            detectedFaceResult.faceBlendshapes &&
            detectedFaceResult.faceBlendshapes.length > 0
          ) {
            const rawCategories = detectedFaceResult.faceBlendshapes[0].categories;
            const blendMap = {};
            for (let i = 0; i < rawCategories.length; i++) {
              blendMap[rawCategories[i].categoryName] = rawCategories[i].score;
            }

            // Extract primary expression signals
            const smile = ((blendMap.mouthSmileLeft || 0) + (blendMap.mouthSmileRight || 0)) / 2;
            const mouthDimple = ((blendMap.mouthDimpleLeft || 0) + (blendMap.mouthDimpleRight || 0)) / 2;
            const browDown = ((blendMap.browDownLeft || 0) + (blendMap.browDownRight || 0)) / 2;
            const browInnerUp = blendMap.browInnerUp || 0;
            const mouthFrown = ((blendMap.mouthFrownLeft || 0) + (blendMap.mouthFrownRight || 0)) / 2;
            const jawOpen = blendMap.jawOpen || 0;
            const mouthPress = ((blendMap.mouthPressLeft || 0) + (blendMap.mouthPressRight || 0)) / 2;
            const eyeSquint = ((blendMap.eyeSquintLeft || 0) + (blendMap.eyeSquintRight || 0)) / 2;
            const eyeWide = ((blendMap.eyeWideLeft || 0) + (blendMap.eyeWideRight || 0)) / 2;
            const eyeBlink = ((blendMap.eyeBlinkLeft || 0) + (blendMap.eyeBlinkRight || 0)) / 2;

            // Sort top 5 blendshapes for UI inspector
            const sortedBlends = [...rawCategories]
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
              .map((c) => ({ name: c.categoryName, score: Math.round(c.score * 100) }));
            setTopBlendshapes(sortedBlends);

            // Compute raw emotion scores
            const scoreHappy = Math.max(0, smile * 1.7 + mouthDimple * 0.4 - mouthFrown * 0.5);
            const scoreSurprised = Math.max(0, jawOpen * 0.9 + eyeWide * 1.0 + browInnerUp * 0.4 - smile * 0.4);
            const scoreStressed = Math.max(0, browDown * 1.4 + mouthPress * 0.7 + eyeSquint * 0.4 - smile * 0.8);
            const scoreSad = Math.max(0, mouthFrown * 1.4 + browInnerUp * 0.8 - smile * 0.8 - jawOpen * 0.3);
            const scoreTired = Math.max(
              0,
              eyeSquint * 0.7 +
                (jawOpen > 0.45 && eyeWide < 0.2 ? 0.6 : 0) +
                (eyeBlink > 0.35 ? 0.3 : 0) -
                smile * 0.5
            );

            // Calculate baseline neutral score
            const maxNonNeutral = Math.max(scoreHappy, scoreSurprised, scoreStressed, scoreSad, scoreTired);
            const scoreNeutral = Math.max(0.12, 1.0 - maxNonNeutral * 1.25);

            // Normalization
            const sum = scoreHappy + scoreSurprised + scoreStressed + scoreSad + scoreTired + scoreNeutral;
            const rawProbs = {
              [MOODS.HAPPY]: scoreHappy / sum,
              [MOODS.SURPRISED]: scoreSurprised / sum,
              [MOODS.STRESSED]: scoreStressed / sum,
              [MOODS.SAD]: scoreSad / sum,
              [MOODS.TIRED]: scoreTired / sum,
              [MOODS.NEUTRAL]: scoreNeutral / sum,
            };

            // Smooth with exponential moving average (alpha = 0.25)
            const alpha = 0.25;
            const smoothed = { ...smoothedProbsRef.current };
            let highestProb = 0;
            let winningMood = MOODS.NEUTRAL;

            Object.keys(rawProbs).forEach((k) => {
              smoothed[k] = (smoothed[k] || 0) * (1 - alpha) + rawProbs[k] * alpha;
              if (smoothed[k] > highestProb) {
                highestProb = smoothed[k];
                winningMood = k;
              }
            });

            smoothedProbsRef.current = smoothed;
            setProbabilities({ ...smoothed });

            // Apply confidence and set active mood
            setConfidence(Number(Math.min(0.99, highestProb + 0.15).toFixed(2)));
            setCurrentMood(winningMood);
          }

          // --- Draw Face Overlay on Canvas ---
          if (overlayMode !== 'off') {
            drawFaceVisuals(ctx, landmarks, canvas.width, canvas.height, overlayMode, currentMood);
          }
        } else {
          setFaceDetected(false);
        }

        // --- Process Hand Gestures & Draw Skeleton ---
        if (detectedGestureResult && detectedGestureResult.landmarks.length > 0) {
          setHandsDetectedCount(detectedGestureResult.landmarks.length);

          if (detectedGestureResult.gestures.length > 0 && detectedGestureResult.gestures[0].length > 0) {
            const topGesture = detectedGestureResult.gestures[0][0];
            const rawCategory = topGesture.categoryName;
            const rawScore = topGesture.score;

            // Map MediaPipe category to Gestura gesture identifiers
            let gestureName = 'none';
            if (rawCategory === 'Thumb_Up') gestureName = 'thumbs_up';
            else if (rawCategory === 'Open_Palm') gestureName = 'open_palm';
            else if (rawCategory === 'Victory') gestureName = 'peace';
            else if (rawCategory === 'Closed_Fist') gestureName = 'fist';
            else if (rawCategory === 'Pointing_Up') gestureName = 'pointing_up';

            if (gestureName !== 'none' && rawScore > 0.65) {
              const debounce = gestureDebounceRef.current;
              if (debounce.gesture === gestureName) {
                debounce.count += 1;
              } else {
                debounce.gesture = gestureName;
                debounce.count = 1;
              }

              // Confirm gesture after 3 consecutive frames
              if (debounce.count >= 3 && now - debounce.lastTriggered > 1200) {
                setDetectedGesture(gestureName);
                setGestureConfidence(Number(rawScore.toFixed(2)));
                debounce.lastTriggered = now;

                // Reset gesture trigger after 2.5s
                setTimeout(() => {
                  setDetectedGesture('none');
                  setGestureConfidence(0);
                }, 2500);
              }
            }
          }

          // Draw Hand Landmarks
          if (overlayMode !== 'off') {
            detectedGestureResult.landmarks.forEach((handLandmarks) => {
              drawHandVisuals(ctx, handLandmarks, canvas.width, canvas.height, detectedGesture);
            });
          }
        } else {
          setHandsDetectedCount(0);
        }
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
  }, [isStreaming, simulationMode, overlayMode, currentMood, detectedGesture]);

  // Clean up media tracks on unmount
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

    // Real Vision Model states
    isModelLoading,
    isModelReady,
    modelStatus,
    modelError,
    isDetecting,
    faceDetected,
    handsDetectedCount,
    currentMood,
    confidence,
    probabilities,
    topBlendshapes,
    detectedGesture,
    gestureConfidence,
    overlayMode,
    setOverlayMode,

    // Simulation / Demo lab
    setSimulatedMood,
    triggerGesture,
    simulationMode,
    setSimulationMode,
    fps,
  };
}

// ==========================================
// Canvas Drawing Helper Functions
// ==========================================

// Color theme by mood
function getMoodColor(mood) {
  switch (mood) {
    case MOODS.HAPPY:
      return '#34d399'; // Emerald
    case MOODS.STRESSED:
      return '#f43f5e'; // Rose
    case MOODS.TIRED:
      return '#fbbf24'; // Amber
    case MOODS.SAD:
      return '#818cf8'; // Indigo
    case MOODS.SURPRISED:
      return '#f472b6'; // Pink
    case MOODS.NEUTRAL:
    default:
      return '#38bdf8'; // Cyan
  }
}

// Draw real face landmarks, contour connectors, and futuristic biometric targeting box
function drawFaceVisuals(ctx, landmarks, width, height, overlayMode, mood) {
  const moodColor = getMoodColor(mood);

  // Calculate face bounding box from all 478 landmarks
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let i = 0; i < landmarks.length; i++) {
    const px = landmarks[i].x * width;
    const py = landmarks[i].y * height;
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (py < minY) minY = py;
    if (py > maxY) maxY = py;
  }

  // Add margin around face box
  const padX = (maxX - minX) * 0.15;
  const padY = (maxY - minY) * 0.15;
  minX = Math.max(0, minX - padX);
  maxX = Math.min(width, maxX + padX);
  minY = Math.max(0, minY - padY);
  maxY = Math.min(height, maxY + padY);

  const boxW = maxX - minX;
  const boxH = maxY - minY;

  // 1. Draw Biometric Target Brackets
  ctx.save();
  ctx.strokeStyle = moodColor;
  ctx.lineWidth = 2.5;
  const corner = Math.min(24, boxW * 0.2);

  // Top-left
  ctx.beginPath();
  ctx.moveTo(minX, minY + corner);
  ctx.lineTo(minX, minY);
  ctx.lineTo(minX + corner, minY);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(maxX - corner, minY);
  ctx.lineTo(maxX, minY);
  ctx.lineTo(maxX, minY + corner);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(minX, maxY - corner);
  ctx.lineTo(minX, maxY);
  ctx.lineTo(minX + corner, maxY);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(maxX - corner, maxY);
  ctx.lineTo(maxX, maxY);
  ctx.lineTo(maxX, maxY - corner);
  ctx.stroke();

  // Biometric Target Label
  ctx.fillStyle = 'rgba(8, 13, 26, 0.85)';
  ctx.fillRect(minX, Math.max(12, minY - 24), Math.max(160, boxW * 0.65), 20);
  ctx.strokeStyle = moodColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(minX, Math.max(12, minY - 24), Math.max(160, boxW * 0.65), 20);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`AI VISION: ${mood.toUpperCase()}`, minX + 6, Math.max(12, minY - 24) + 14);

  // 2. Draw Facial Contours / Features
  if (overlayMode === 'contours' || overlayMode === 'mesh') {
    // Face Oval
    drawPath(ctx, landmarks, width, height, FACE_OVAL_INDICES, 'rgba(99, 102, 241, 0.55)', 1.5, false);

    // Lips with dynamic mood color
    drawPath(ctx, landmarks, width, height, LIPS_OUTER_INDICES, moodColor, 2, true);

    // Left & Right Eyes
    drawPath(ctx, landmarks, width, height, LEFT_EYE_INDICES, 'rgba(56, 189, 248, 0.75)', 1.5, true);
    drawPath(ctx, landmarks, width, height, RIGHT_EYE_INDICES, 'rgba(56, 189, 248, 0.75)', 1.5, true);

    // Left & Right Eyebrows
    drawPath(ctx, landmarks, width, height, LEFT_EYEBROW_INDICES, 'rgba(129, 140, 248, 0.7)', 1.5, false);
    drawPath(ctx, landmarks, width, height, RIGHT_EYEBROW_INDICES, 'rgba(129, 140, 248, 0.7)', 1.5, false);

    // Iris Reticles
    drawPoint(ctx, landmarks[468], width, height, '#38bdf8', 3);
    drawPoint(ctx, landmarks[473], width, height, '#38bdf8', 3);
  }

  // 3. Optional dense mesh overlay
  if (overlayMode === 'mesh') {
    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
    for (let i = 0; i < landmarks.length; i += 4) {
      const p = landmarks[i];
      ctx.fillRect(p.x * width - 1, p.y * height - 1, 2, 2);
    }
  }

  ctx.restore();
}

// Draw real hand skeleton connectors & detected gesture badge
function drawHandVisuals(ctx, landmarks, width, height, detectedGesture) {
  ctx.save();

  // Draw hand connections
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
  ctx.lineWidth = 2.5;

  HAND_CONNECTIONS_INDICES.forEach(([i, j]) => {
    if (landmarks[i] && landmarks[j]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
      ctx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
      ctx.stroke();
    }
  });

  // Draw knuckle & fingertip joint dots
  landmarks.forEach((pt, idx) => {
    const isTip = [4, 8, 12, 16, 20].includes(idx);
    ctx.beginPath();
    ctx.arc(pt.x * width, pt.y * height, isTip ? 4 : 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = isTip ? '#a78bfa' : '#34d399';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Floating Gesture badge near wrist (point 0)
  if (landmarks[0]) {
    const wx = landmarks[0].x * width;
    const wy = landmarks[0].y * height;

    if (detectedGesture !== 'none') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      const label = `GESTURE: ${detectedGesture.toUpperCase().replace('_', ' ')}`;
      const textW = ctx.measureText(label).width + 20;

      ctx.beginPath();
      ctx.roundRect(wx - textW / 2, wy + 16, textW, 24, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(label, wx - textW / 2 + 10, wy + 32);
    }
  }

  ctx.restore();
}

// Helper to draw landmark paths
function drawPath(ctx, landmarks, width, height, indices, color, lineWidth, close = false) {
  if (!landmarks || indices.length === 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  indices.forEach((idx, i) => {
    const pt = landmarks[idx];
    if (!pt) return;
    const x = pt.x * width;
    const y = pt.y * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  if (close) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawPoint(ctx, pt, width, height, color, radius) {
  if (!pt) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pt.x * width, pt.y * height, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

// Key landmark index contours
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109, 10
];

const LIPS_OUTER_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317,
  14, 87, 178, 88, 95, 61
];

const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE_INDICES = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466, 263];
const LEFT_EYEBROW_INDICES = [70, 63, 105, 66, 107];
const RIGHT_EYEBROW_INDICES = [300, 293, 334, 296, 336];

// MediaPipe 21 Hand skeleton connections
const HAND_CONNECTIONS_INDICES = [
  // Wrist to Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index Finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle Finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring Finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base
  [5, 9], [9, 13], [13, 17]
];
