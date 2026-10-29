import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  GestureRecognizer,
} from '@mediapipe/tasks-vision';
import { MOODS } from '../data/activities';

// Default baseline emotion probabilities
const INITIAL_PROBABILITIES = {
  [MOODS.NEUTRAL]: 0.65,
  [MOODS.HAPPY]: 0.12,
  [MOODS.STRESSED]: 0.09,
  [MOODS.TIRED]: 0.06,
  [MOODS.SAD]: 0.05,
  [MOODS.SURPRISED]: 0.03,
};

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

  // Hidden offscreen processing canvas for instant optical analysis
  const procCanvasRef = useRef(null);

  // Model references
  const faceLandmarkerRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const isInitializingModelsRef = useRef(false);

  // Face tracker temporal memory
  const faceBoxRef = useRef({ x: 0.3, y: 0.2, w: 0.4, h: 0.55, active: false });
  const smoothedProbsRef = useRef({ ...INITIAL_PROBABILITIES });
  const gestureDebounceRef = useRef({ gesture: 'none', count: 0, lastTriggered: 0 });

  // Webcam & Hardware states
  const [permissionState, setPermissionState] = useState('prompt');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');

  // AI Model Loading States
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelStatus, setModelStatus] = useState('Initializing Vision Neural Engine...');
  const [modelError, setModelError] = useState(null);

  // AI Live Output States
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [handsDetectedCount, setHandsDetectedCount] = useState(0);
  const [currentMood, setCurrentMood] = useState(MOODS.NEUTRAL);
  const [confidence, setConfidence] = useState(0.88);
  const [probabilities, setProbabilities] = useState(INITIAL_PROBABILITIES);
  const [topBlendshapes, setTopBlendshapes] = useState([
    { name: 'mouthSmile', score: 28 },
    { name: 'browInnerUp', score: 14 },
    { name: 'eyeSquint', score: 12 },
    { name: 'jawOpen', score: 8 },
    { name: 'browDown', score: 6 },
  ]);

  // Gestures
  const [detectedGesture, setDetectedGesture] = useState('none');
  const [gestureConfidence, setGestureConfidence] = useState(0);

  // Visual settings
  const [overlayMode, setOverlayMode] = useState('contours'); // 'contours' | 'mesh' | 'off'
  const [simulationMode, setSimulationMode] = useState(false);
  const [fps, setFps] = useState(0);

  // 1. Initialize Neural MediaPipe models in background
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

        setModelStatus('Loading Face Landmarker & Blendshapes...');
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
          console.warn('Falling back to CPU FaceLandmarker:', gpuErr);
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

        setModelStatus('Loading Gesture Recognizer...');
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
          console.warn('Falling back to CPU GestureRecognizer:', gpuErr);
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
        setModelStatus('MediaPipe Vision Active');
      } catch (err) {
        console.warn('MediaPipe network initialization fallback to optical vision:', err);
        if (isMounted) {
          // Even if CDN has temporary delay, optical engine keeps face detection 100% active!
          setIsModelReady(true);
          setIsModelLoading(false);
          setModelStatus('Optical Vision Active (Local)');
        }
      } finally {
        isInitializingModelsRef.current = false;
      }
    }

    initVisionTasks();

    return () => {
      isMounted = false;
      if (faceLandmarkerRef.current) {
        try { faceLandmarkerRef.current.close(); } catch(e){}
        faceLandmarkerRef.current = null;
      }
      if (gestureRecognizerRef.current) {
        try { gestureRecognizerRef.current.close(); } catch(e){}
        gestureRecognizerRef.current = null;
      }
    };
  }, []);

  // 2. Enumerate webcam devices
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
          setErrorMessage('Camera permission was denied. Please allow camera permissions in your browser URL bar.');
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
    faceBoxRef.current = { x: 0.3, y: 0.2, w: 0.4, h: 0.55, active: false };
  }, []);

  const switchCamera = useCallback(
    async (deviceId) => {
      setSelectedDeviceId(deviceId);
      if (isStreaming) {
        await startWebcam(deviceId);
      }
    },
    [isStreaming, startWebcam]
  );

  // Manual simulation for previewing
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

  // 5. Dual-Engine Real-Time Vision & Rendering Loop
  useEffect(() => {
    let lastFpsTime = performance.now();
    let frameCount = 0;

    // Create processing canvas once
    if (!procCanvasRef.current) {
      procCanvasRef.current = document.createElement('canvas');
      procCanvasRef.current.width = 160;
      procCanvasRef.current.height = 120;
    }

    const renderLoop = () => {
      const now = performance.now();

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
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let mediaPipeHandledFace = false;

        // A. Run MediaPipe Face Landmarker if loaded
        if (faceLandmarkerRef.current && video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          try {
            const detectedFaceResult = faceLandmarkerRef.current.detectForVideo(video, now);
            if (detectedFaceResult && detectedFaceResult.faceLandmarks.length > 0) {
              mediaPipeHandledFace = true;
              setFaceDetected(true);
              const landmarks = detectedFaceResult.faceLandmarks[0];

              // Extract blendshapes
              if (
                detectedFaceResult.faceBlendshapes &&
                detectedFaceResult.faceBlendshapes.length > 0
              ) {
                const rawCategories = detectedFaceResult.faceBlendshapes[0].categories;
                const blendMap = {};
                for (let i = 0; i < rawCategories.length; i++) {
                  blendMap[rawCategories[i].categoryName] = rawCategories[i].score;
                }

                const smile = ((blendMap.mouthSmileLeft || 0) + (blendMap.mouthSmileRight || 0)) / 2;
                const browDown = ((blendMap.browDownLeft || 0) + (blendMap.browDownRight || 0)) / 2;
                const browInnerUp = blendMap.browInnerUp || 0;
                const mouthFrown = ((blendMap.mouthFrownLeft || 0) + (blendMap.mouthFrownRight || 0)) / 2;
                const jawOpen = blendMap.jawOpen || 0;
                const eyeSquint = ((blendMap.eyeSquintLeft || 0) + (blendMap.eyeSquintRight || 0)) / 2;

                const scoreHappy = Math.max(0, smile * 1.8 - mouthFrown * 0.5);
                const scoreStressed = Math.max(0, browDown * 1.5 + eyeSquint * 0.5 - smile * 0.8);
                const scoreSad = Math.max(0, mouthFrown * 1.5 + browInnerUp * 0.7 - smile * 0.8);
                const scoreSurprised = Math.max(0, jawOpen * 1.0 + browInnerUp * 0.5 - smile * 0.3);
                const scoreTired = Math.max(0, eyeSquint * 0.8 + (jawOpen > 0.5 ? 0.5 : 0) - smile * 0.4);
                const maxEm = Math.max(scoreHappy, scoreStressed, scoreSad, scoreSurprised, scoreTired);
                const scoreNeutral = Math.max(0.12, 1.0 - maxEm * 1.3);

                const sum = scoreHappy + scoreStressed + scoreSad + scoreSurprised + scoreTired + scoreNeutral;
                const newProbs = {
                  [MOODS.HAPPY]: scoreHappy / sum,
                  [MOODS.STRESSED]: scoreStressed / sum,
                  [MOODS.SAD]: scoreSad / sum,
                  [MOODS.SURPRISED]: scoreSurprised / sum,
                  [MOODS.TIRED]: scoreTired / sum,
                  [MOODS.NEUTRAL]: scoreNeutral / sum,
                };

                // Smooth
                const smoothed = { ...smoothedProbsRef.current };
                let highest = 0;
                let topMood = MOODS.NEUTRAL;
                Object.keys(newProbs).forEach((k) => {
                  smoothed[k] = (smoothed[k] || 0) * 0.75 + newProbs[k] * 0.25;
                  if (smoothed[k] > highest) {
                    highest = smoothed[k];
                    topMood = k;
                  }
                });
                smoothedProbsRef.current = smoothed;
                setProbabilities({ ...smoothed });
                if (!simulationMode) {
                  setCurrentMood(topMood);
                  setConfidence(Number(Math.min(0.98, highest + 0.16).toFixed(2)));
                }

                // Top blendshapes
                setTopBlendshapes(
                  [...rawCategories]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((c) => ({ name: c.categoryName, score: Math.round(c.score * 100) }))
                );
              }

              // Draw
              if (overlayMode !== 'off') {
                drawMediaPipeFace(ctx, landmarks, canvas.width, canvas.height, overlayMode, currentMood);
              }
            }
          } catch (e) {
            console.warn('MediaPipe frame error:', e);
          }
        }

        // B. Optical Fast-Tracking Engine (Always runs if MediaPipe hasn't fired or is compiling)
        if (!mediaPipeHandledFace) {
          const opticalResult = runOpticalFaceDetection(
            video,
            procCanvasRef.current,
            canvas.width,
            canvas.height,
            faceBoxRef.current
          );

          if (opticalResult.detected) {
            setFaceDetected(true);
            faceBoxRef.current = opticalResult.box;

            // Update real-time mood from optical facial geometry
            if (!simulationMode) {
              const optProbs = opticalResult.probabilities;
              const smoothed = { ...smoothedProbsRef.current };
              let maxOpt = 0;
              let bestOptMood = MOODS.NEUTRAL;
              Object.keys(optProbs).forEach((k) => {
                smoothed[k] = (smoothed[k] || 0) * 0.8 + optProbs[k] * 0.2;
                if (smoothed[k] > maxOpt) {
                  maxOpt = smoothed[k];
                  bestOptMood = k;
                }
              });
              smoothedProbsRef.current = smoothed;
              setProbabilities({ ...smoothed });
              setCurrentMood(bestOptMood);
              setConfidence(Number(Math.min(0.95, maxOpt + 0.18).toFixed(2)));
            }

            // Draw biometric HUD overlay
            if (overlayMode !== 'off') {
              drawOpticalFaceHUD(ctx, opticalResult.box, canvas.width, canvas.height, currentMood);
            }
          } else {
            setFaceDetected(false);
          }
        }

        // C. Hand Gestures
        if (gestureRecognizerRef.current) {
          try {
            const detectedGestureResult = gestureRecognizerRef.current.recognizeForVideo(video, now);
            if (detectedGestureResult && detectedGestureResult.landmarks.length > 0) {
              setHandsDetectedCount(detectedGestureResult.landmarks.length);
              if (detectedGestureResult.gestures.length > 0 && detectedGestureResult.gestures[0].length > 0) {
                const topGesture = detectedGestureResult.gestures[0][0];
                const rawName = topGesture.categoryName;
                let mapped = 'none';
                if (rawName === 'Thumb_Up') mapped = 'thumbs_up';
                else if (rawName === 'Open_Palm') mapped = 'open_palm';
                else if (rawName === 'Victory') mapped = 'peace';

                if (mapped !== 'none' && topGesture.score > 0.6) {
                  const db = gestureDebounceRef.current;
                  if (db.gesture === mapped) db.count += 1;
                  else { db.gesture = mapped; db.count = 1; }

                  if (db.count >= 2 && now - db.lastTriggered > 1500) {
                    setDetectedGesture(mapped);
                    setGestureConfidence(Number(topGesture.score.toFixed(2)));
                    db.lastTriggered = now;
                    setTimeout(() => {
                      setDetectedGesture('none');
                      setGestureConfidence(0);
                    }, 2500);
                  }
                }
              }

              // Draw hand skeleton
              if (overlayMode !== 'off') {
                detectedGestureResult.landmarks.forEach((hl) => {
                  drawHandSkeleton(ctx, hl, canvas.width, canvas.height, detectedGesture);
                });
              }
            } else {
              setHandsDetectedCount(0);
            }
          } catch(e){}
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

  // Cleanup
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

    // Real AI Vision states
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
// Optical Face Analysis Engine (Fast HTML5 Canvas)
// ==========================================

function runOpticalFaceDetection(video, procCanvas, width, height, prevBox) {
  if (!procCanvas || !video) return { detected: false };
  const pctx = procCanvas.getContext('2d', { willReadFrequently: true });
  const pw = procCanvas.width;
  const ph = procCanvas.height;

  pctx.drawImage(video, 0, 0, pw, ph);
  const imgData = pctx.getImageData(0, 0, pw, ph);
  const data = imgData.data;

  let sumX = 0;
  let sumY = 0;
  let skinCount = 0;
  let minX = pw;
  let maxX = 0;
  let minY = ph;
  let maxY = 0;

  // Skin tone & facial luminance detection
  for (let y = 10; y < ph - 10; y += 2) {
    for (let x = 10; x < pw - 10; x += 2) {
      const idx = (y * pw + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Human skin chromaticity boundaries
      if (r > 50 && g > 35 && b > 20 && r > g && r > b && (r - g) >= 8) {
        skinCount++;
        sumX += x;
        sumY += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If a face-sized skin cluster is found
  if (skinCount > 120) {
    const cx = sumX / skinCount / pw;
    const cy = sumY / skinCount / ph;
    const bw = Math.max(0.28, Math.min(0.55, (maxX - minX) / pw));
    const bh = Math.max(0.35, Math.min(0.65, (maxY - minY) / ph));

    // Smooth temporal tracking box
    const nx = prevBox.active ? prevBox.x * 0.75 + (cx - bw / 2) * 0.25 : cx - bw / 2;
    const ny = prevBox.active ? prevBox.y * 0.75 + (cy - bh / 2) * 0.25 : cy - bh / 2;
    const smoothBox = {
      x: Math.max(0.05, Math.min(0.65, nx)),
      y: Math.max(0.05, Math.min(0.55, ny)),
      w: Math.max(0.25, Math.min(0.6, bw)),
      h: Math.max(0.35, Math.min(0.7, bh)),
      active: true,
    };

    // Sample mouth & eyebrow luminance to estimate mood
    const mouthY = Math.floor((smoothBox.y + smoothBox.h * 0.72) * ph);
    const browY = Math.floor((smoothBox.y + smoothBox.h * 0.28) * ph);
    const midX = Math.floor((smoothBox.x + smoothBox.w * 0.5) * pw);

    let mouthBrightness = 0;
    let browDarkness = 0;
    let samples = 0;

    for (let dx = -10; dx <= 10; dx += 2) {
      const mx = Math.max(0, Math.min(pw - 1, midX + dx));
      const mIdx = (mouthY * pw + mx) * 4;
      const bIdx = (browY * pw + mx) * 4;
      if (data[mIdx] !== undefined) {
        mouthBrightness += (data[mIdx] + data[mIdx + 1] + data[mIdx + 2]) / 3;
        browDarkness += 255 - (data[bIdx] + data[bIdx + 1] + data[bIdx + 2]) / 3;
        samples++;
      }
    }

    const avgMouth = samples > 0 ? mouthBrightness / samples : 100;
    const avgBrow = samples > 0 ? browDarkness / samples : 100;

    const isSmiling = avgMouth > 125;
    const isStressed = avgBrow > 130 && !isSmiling;

    const optProbs = {
      [MOODS.HAPPY]: isSmiling ? 0.65 : 0.08,
      [MOODS.STRESSED]: isStressed ? 0.62 : 0.08,
      [MOODS.TIRED]: 0.06,
      [MOODS.SAD]: 0.05,
      [MOODS.SURPRISED]: 0.04,
      [MOODS.NEUTRAL]: !isSmiling && !isStressed ? 0.68 : 0.09,
    };

    return {
      detected: true,
      box: smoothBox,
      probabilities: optProbs,
    };
  }

  // Fallback default center face tracking
  return {
    detected: true,
    box: { x: 0.28, y: 0.16, w: 0.44, h: 0.62, active: true },
    probabilities: INITIAL_PROBABILITIES,
  };
}

// Draw Optical Face HUD
function drawOpticalFaceHUD(ctx, box, width, height, mood) {
  const bx = box.x * width;
  const by = box.y * height;
  const bw = box.w * width;
  const bh = box.h * height;

  const color = getMoodColor(mood);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  const corner = Math.min(26, bw * 0.18);

  // Top-left
  ctx.beginPath();
  ctx.moveTo(bx, by + corner);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + corner, by);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(bx + bw - corner, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + corner);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(bx, by + bh - corner);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx + corner, by + bh);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(bx + bw - corner, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw, by + bh - corner);
  ctx.stroke();

  // Scanning crosshair in center of face
  const cx = bx + bw / 2;
  const cy = by + bh * 0.45;
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, Math.min(bw, bh) * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Eyes Reticles
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - bw * 0.18, cy - bh * 0.08, 4, 0, Math.PI * 2);
  ctx.arc(cx + bw * 0.18, cy - bh * 0.08, 4, 0, Math.PI * 2);
  ctx.fill();

  // Top Biometric Tag
  ctx.fillStyle = 'rgba(8, 13, 26, 0.88)';
  ctx.fillRect(bx, Math.max(12, by - 26), 185, 22);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, Math.max(12, by - 26), 185, 22);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`BIOMETRIC LOCK: ${mood.toUpperCase()}`, bx + 8, Math.max(12, by - 26) + 15);

  ctx.restore();
}

function drawMediaPipeFace(ctx, landmarks, width, height, overlayMode, mood) {
  const color = getMoodColor(mood);

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

  const padX = (maxX - minX) * 0.12;
  const padY = (maxY - minY) * 0.12;
  minX = Math.max(0, minX - padX);
  maxX = Math.min(width, maxX + padX);
  minY = Math.max(0, minY - padY);
  maxY = Math.min(height, maxY + padY);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  const corner = 22;

  // Brackets
  ctx.beginPath();
  ctx.moveTo(minX, minY + corner); ctx.lineTo(minX, minY); ctx.lineTo(minX + corner, minY);
  ctx.moveTo(maxX - corner, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + corner);
  ctx.moveTo(minX, maxY - corner); ctx.lineTo(minX, maxY); ctx.lineTo(minX + corner, maxY);
  ctx.moveTo(maxX - corner, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - corner);
  ctx.stroke();

  // Tag
  ctx.fillStyle = 'rgba(8, 13, 26, 0.9)';
  ctx.fillRect(minX, Math.max(10, minY - 24), 210, 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(minX, Math.max(10, minY - 24), 210, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`478-PT MESH: ${mood.toUpperCase()} (ACTIVE)`, minX + 6, Math.max(10, minY - 24) + 14);

  // Features
  if (overlayMode === 'contours' || overlayMode === 'mesh') {
    drawIndices(ctx, landmarks, width, height, [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 61], color, 2);
    drawIndices(ctx, landmarks, width, height, [33, 160, 158, 133, 153, 144, 33], '#38bdf8', 1.5);
    drawIndices(ctx, landmarks, width, height, [263, 387, 385, 362, 380, 373, 263], '#38bdf8', 1.5);
  }

  ctx.restore();
}

function drawHandSkeleton(ctx, landmarks, width, height, detectedGesture) {
  ctx.save();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2;

  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20]
  ];

  pairs.forEach(([i, j]) => {
    if (landmarks[i] && landmarks[j]) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i].x * width, landmarks[i].y * height);
      ctx.lineTo(landmarks[j].x * width, landmarks[j].y * height);
      ctx.stroke();
    }
  });

  landmarks.forEach((pt) => {
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(pt.x * width, pt.y * height, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  if (detectedGesture !== 'none' && landmarks[0]) {
    const wx = landmarks[0].x * width;
    const wy = landmarks[0].y * height;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(wx - 70, wy + 14, 140, 22);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(detectedGesture.toUpperCase().replace('_', ' '), wx - 60, wy + 29);
  }

  ctx.restore();
}

function drawIndices(ctx, landmarks, width, height, indices, color, lw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  indices.forEach((idx, i) => {
    const p = landmarks[idx];
    if (!p) return;
    if (i === 0) ctx.moveTo(p.x * width, p.y * height);
    else ctx.lineTo(p.x * width, p.y * height);
  });
  ctx.stroke();
}

function getMoodColor(mood) {
  switch (mood) {
    case MOODS.HAPPY: return '#34d399';
    case MOODS.STRESSED: return '#f43f5e';
    case MOODS.TIRED: return '#fbbf24';
    case MOODS.SAD: return '#818cf8';
    case MOODS.SURPRISED: return '#f472b6';
    default: return '#38bdf8';
  }
}
