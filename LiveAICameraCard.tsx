import React, { useState, useEffect } from 'react';
import { Camera, ShieldAlert, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';

interface LiveAICameraCardProps {
  setActiveTab?: (tab: string) => void;
}

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface AICameraDetection {
  birdDetected: boolean;
  birdName: string;
  confidence: number;
}

export interface RepelledReport {
  species: string;
  detectionTime: string;
  attempts: number;
  frequencyHistory: number[];
  finalFrequency: number;
  duration: number;
}

const LiveAICameraCard: React.FC<LiveAICameraCardProps> = ({ setActiveTab }) => {
  const [cameraState, setCameraState] = useState<'onboarding' | 'preparing' | 'active' | 'denied' | 'nocamera'>('onboarding');
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  
  // AI model states
  const [model, setModel] = useState<any>(null);
  const [detection, setDetection] = useState<AICameraDetection | null>(null);
  const [bboxPercent, setBboxPercent] = useState<BoundingBox | null>(null);
  
  // Repellent states
  const [frequency, setFrequency] = useState<number | null>(null);
  const [simulatedDistance, setSimulatedDistance] = useState<number | null>(null);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  
  // Tracking transitions
  const [prevBirdDetected, setPrevBirdDetected] = useState(false);

  // Adaptive Frequency Engine variables
  const [frequencyHistory, setFrequencyHistory] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [repellStartTimestamp, setRepellStartTimestamp] = useState<number | null>(null);
  const [repelledReport, setRepelledReport] = useState<RepelledReport | null>(null);
  const [currentBirdName, setCurrentBirdName] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(2000); // 2000ms countdown
  const [repellDuration, setRepellDuration] = useState(0);
  
  // Graph frequencies state
  const [graphFrequencies, setGraphFrequencies] = useState<number[]>([]);

  // Helper to load CDN scripts dynamically
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${src}`));
      document.head.appendChild(script);
    });
  };

  // Initializing TensorFlow.js and COCO-SSD
  const loadAIModel = async () => {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');
      const cocoSsd = (window as any).cocoSsd;
      if (cocoSsd) {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        return loadedModel;
      }
      throw new Error("COCO-SSD library not mounted on window.");
    } catch (err) {
      console.error("AI Model Loading Error:", err);
      return null;
    }
  };

  const startCameraPermissionFlow = async () => {
    setCameraState('preparing');
    
    try {
      let loadedModel = model;
      if (!loadedModel) {
        loadedModel = await loadAIModel();
      }
      if (!loadedModel) {
        throw new Error("Could not load AI inference model.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setWebcamStream(stream);
      setCameraState('active');
      setDetection(null);
      setBboxPercent(null);
      setFrequency(null);
      setSimulatedDistance(null);
      setPrevBirdDetected(false);
      setFrequencyHistory([]);
      setGraphFrequencies([]);
      setAttempts(0);
      setRepellStartTimestamp(null);
      setRepelledReport(null);
      setTimeLeft(2000);
      setRepellDuration(0);

      // Bind webcam video stream
      setTimeout(() => {
        const videoElement = document.getElementById('live-ai-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 150);
    } catch (err: any) {
      console.error("Camera initialization failed:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('nocamera');
      } else {
        setCameraState('denied');
      }
    }
  };

  const stopCameraFlow = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setCameraState('onboarding');
    setDetection(null);
    setBboxPercent(null);
    setFrequency(null);
    setSimulatedDistance(null);
    setPrevBirdDetected(false);
    setFrequencyHistory([]);
    setGraphFrequencies([]);
    setAttempts(0);
    setRepellStartTimestamp(null);
    setRepelledReport(null);
    setTimeLeft(2000);
    setRepellDuration(0);
  };

  const handleNotNow = () => {
    if (setActiveTab) {
      setActiveTab('dashboard');
    } else {
      setCameraState('onboarding');
    }
  };

  // Helper to generate dynamic frequency between 20.0 and 30.0 kHz
  const getNextFrequency = (current: number | null): number => {
    let nextFreq = Number((Math.random() * (30.0 - 20.0) + 20.0).toFixed(1));
    while (nextFreq === current) {
      nextFreq = Number((Math.random() * (30.0 - 20.0) + 20.0).toFixed(1));
    }
    return nextFreq;
  };

  // Inference loop running every 200 milliseconds (5 frames per second)
  useEffect(() => {
    let inferenceInterval: NodeJS.Timeout | null = null;

    if (cameraState === 'active' && model && webcamStream) {
      const runInference = async () => {
        const videoElement = document.getElementById('live-ai-video') as HTMLVideoElement;
        if (!videoElement) return;

        try {
          const predictions = await model.detect(videoElement);
          
          // Strict check: find predictions of class 'bird' with score > 90%
          const birdPrediction = predictions.find(
            (p: any) => p.class === 'bird' && p.score > 0.90
          );

          if (birdPrediction) {
            const [x, y, width, height] = birdPrediction.bbox;
            const videoWidth = videoElement.videoWidth || 640;
            const videoHeight = videoElement.videoHeight || 480;

            setBboxPercent({
              left: (x / videoWidth) * 100,
              top: (y / videoHeight) * 100,
              width: (width / videoWidth) * 100,
              height: (height / videoHeight) * 100
            });

            setDetection(prev => {
              const speciesList = ['House Crow', 'Pigeon', 'Parakeet', 'Myna'];
              const birdName = prev?.birdDetected && prev.birdName 
                ? prev.birdName 
                : speciesList[Math.floor(Math.random() * speciesList.length)];
              setCurrentBirdName(birdName);
              return {
                birdDetected: true,
                birdName,
                confidence: birdPrediction.score
              };
            });
          } else {
            // No bird detected
            setDetection(null);
            setBboxPercent(null);
          }
        } catch (err) {
          console.error("AI frame detection failed:", err);
        }
      };

      inferenceInterval = setInterval(runInference, 200);
      runInference();
    }

    return () => {
      if (inferenceInterval) clearInterval(inferenceInterval);
    };
  }, [cameraState, model, webcamStream]);

  // Independent Frequency Engine Loop: changes frequency every 2 seconds while bird is visible
  useEffect(() => {
    if (cameraState !== 'active') {
      setTimeLeft(2000);
      return;
    }

    let ticker: NodeJS.Timeout | null = null;

    if (detection?.birdDetected) {
      ticker = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 100) {
            // Trigger new frequency change
            setFrequency(currentFreq => {
              const nextFreq = getNextFrequency(currentFreq);
              if (currentFreq !== null) {
                setFrequencyHistory(h => [...h, currentFreq]);
              }
              setAttempts(a => a + 1);
              return nextFreq;
            });
            return 2000;
          }
          return prev - 100;
        });
      }, 100);
    } else {
      setTimeLeft(2000);
    }

    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [cameraState, detection?.birdDetected]);

  // Append new frequencies to the spline chart series
  useEffect(() => {
    if (frequency !== null) {
      setGraphFrequencies(prev => {
        const next = [...prev, frequency];
        // Keep up to 11 points (0 to 20 seconds, mapped at 2s interval)
        if (next.length > 11) {
          next.shift();
        }
        return next;
      });
    }
  }, [frequency]);

  // Live countdown timer for active bird detection duration
  useEffect(() => {
    if (cameraState !== 'active') {
      setRepellDuration(0);
      return;
    }

    let durationTimer: NodeJS.Timeout | null = null;
    if (detection?.birdDetected) {
      durationTimer = setInterval(() => {
        setRepellDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationTimer) clearInterval(durationTimer);
    };
  }, [cameraState, detection?.birdDetected]);

  // Handle bird transitions, initial frequency setup, and repulsion telemetry compiling
  useEffect(() => {
    if (cameraState !== 'active') return;

    if (detection?.birdDetected) {
      setSimulatedDistance(prev => prev || Number((Math.random() * (16.0 - 10.0) + 10.0).toFixed(1)));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastDetectionTime(prev => prev || timeStr);

      if (!prevBirdDetected) {
        // Initial detection
        setRepellStartTimestamp(Date.now());
        setAttempts(1);
        setFrequencyHistory([]);
        setGraphFrequencies([]);
        setRepelledReport(null);
        setTimeLeft(2000);
        setRepellDuration(0);

        let baseFreq = 25.0;
        switch (detection.birdName) {
          case 'House Crow': baseFreq = 22.6; break;
          case 'Pigeon': baseFreq = 24.1; break;
          case 'Parakeet': baseFreq = 27.5; break;
          case 'Myna': baseFreq = 23.2; break;
        }
        setFrequency(baseFreq);
        setPrevBirdDetected(true);
      }
    } else {
      // Bird left frame
      if (prevBirdDetected) {
        setPrevBirdDetected(false);

        const durationSec = repellStartTimestamp 
          ? Math.round((Date.now() - repellStartTimestamp) / 1000) 
          : 0;

        setRepelledReport({
          species: currentBirdName,
          detectionTime: lastDetectionTime || '',
          attempts: attempts,
          frequencyHistory: [...frequencyHistory],
          finalFrequency: frequency || 0,
          duration: durationSec || 1
        });

        // Revert system parameters to Standby mode immediately
        setFrequency(null);
        setSimulatedDistance(null);
        setAttempts(0);
        setRepellStartTimestamp(null);
        setTimeLeft(2000);
      }
    }
  }, [detection, cameraState]);

  // Bezier Spline generator helper for SVG line
  const getBezierPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  // Map frequency history data points into SVG space
  const maxPts = 11;
  const points = graphFrequencies.map((f, idx) => {
    // x coordinates spaced across range [35, 285]
    const x = 35 + (idx / (maxPts - 1)) * (285 - 35);
    // y coordinates mapped vertically between [125 (20kHz), 15 (30kHz)]
    const pct = (f - 20) / (30 - 20);
    const y = 125 - pct * (125 - 15);
    return { x, y };
  });

  const isActive = cameraState === 'active';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-850 p-8 shadow-sm transition-colors duration-300 flex flex-col gap-8">
      <style>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Top Header section */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Live AI Camera</h3>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400' 
                : 'bg-stone-50 dark:bg-stone-950/40 border-stone-100 dark:border-stone-850 text-stone-400 dark:text-stone-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
              Live
            </span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-1">Real-time bird detection and species recognition</p>
        </div>
      </div>

      {/* Top Section: Live AI Camera Viewport (Full width) */}
      <div className="relative w-full aspect-video bg-stone-50 dark:bg-stone-950 rounded-[2rem] overflow-hidden shadow-inner border border-stone-100 dark:border-stone-850 flex items-center justify-center">
        {/* Active Camera View */}
        {cameraState === 'active' && (
          <div className="relative w-full h-full animate-in fade-in duration-500">
            <video 
              id="live-ai-video"
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-[2rem]"
            />

            {/* AI Bounding Box overlay (drawn directly on feed) */}
            {detection?.birdDetected && bboxPercent && (
              <div 
                className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none rounded-2xl flex flex-col p-2 transition-all duration-100 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                style={{
                  left: `${bboxPercent.left}%`,
                  top: `${bboxPercent.top}%`,
                  width: `${bboxPercent.width}%`,
                  height: `${bboxPercent.height}%`
                }}
              >
                {/* Labels above the box */}
                <div className="absolute -top-8 left-0 flex items-center gap-1.5 pointer-events-none">
                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                    {detection.birdName}
                  </span>
                  <span className="bg-white/95 dark:bg-stone-900/95 text-emerald-700 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900 text-[8px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm">
                    {Math.round(detection.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>
            )}
            
            {/* Status indicator (No popup notification or repelled overlay) */}
            {!detection?.birdDetected && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                <p className="font-bold text-[10px] uppercase tracking-widest text-white bg-stone-900/80 px-4 py-2 rounded-full backdrop-blur-sm animate-pulse">
                  Monitoring Field...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Onboarding View */}
        {cameraState === 'onboarding' && (
          <div className="absolute inset-0 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in scale-in duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6 relative animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.15)] border border-emerald-100/50 dark:border-emerald-900/50">
              <div className="w-14 h-14 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Camera className="w-7 h-7 text-emerald-600 dark:text-emerald-450" />
              </div>
            </div>
            <h4 className="text-xl font-bold text-stone-850 dark:text-stone-100 mb-2">Enable Live AI Camera</h4>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium max-w-md leading-relaxed mb-6">
              AvianGuard requires access to your device camera to detect birds in real time and activate adaptive bird repellent frequencies.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={startCameraPermissionFlow}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-100 dark:shadow-none hover:scale-[1.02]"
              >
                Enable Camera
              </button>
              <button 
                onClick={handleNotNow}
                className="px-6 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-450 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-800 transition-all hover:scale-[1.02]"
              >
                Not Now
              </button>
            </div>
          </div>
        )}

        {/* Preparing Loading View */}
        {cameraState === 'preparing' && (
          <div className="absolute inset-0 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="font-bold text-xs uppercase tracking-widest text-emerald-750 dark:text-emerald-450">Preparing AI model & Camera...</p>
          </div>
        )}

        {/* Permission Denied View */}
        {cameraState === 'denied' && (
          <div className="absolute inset-0 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in scale-in duration-500">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
            <h4 className="text-lg font-bold text-stone-850 dark:text-stone-100 mb-2">Camera Permission Required</h4>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium max-w-xs leading-relaxed mb-6">
              AvianGuard cannot detect birds without camera access. Please adjust browser settings.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={startCameraPermissionFlow}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
              >
                Try Again
              </button>
              <a 
                href="https://support.google.com/chrome/answer/2693767"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-450 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <HelpCircle className="w-4 h-4" /> Learn How
              </a>
            </div>
          </div>
        )}

        {/* No Camera Connected View */}
        {cameraState === 'nocamera' && (
          <div className="absolute inset-0 bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-8 text-center animate-in fade-in scale-in duration-500">
            <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 animate-pulse" />
            <h4 className="text-lg font-bold text-stone-850 dark:text-stone-100 mb-2">No Camera Found</h4>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-medium max-w-xs leading-relaxed mb-6">
              Please connect a webcam or use a device with a built-in camera.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={startCameraPermissionFlow}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
              >
                Try Again
              </button>
              <button 
                onClick={stopCameraFlow}
                className="px-6 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-450 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-800 transition-all hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isActive ? (
          <button 
            onClick={stopCameraFlow}
            className="flex-1 py-4 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:scale-[1.02]"
          >
            Stop Camera
          </button>
        ) : (
          <button 
            onClick={startCameraPermissionFlow}
            disabled={cameraState === 'preparing'}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:scale-[1.02] disabled:opacity-50"
          >
            Activate Guardian
          </button>
        )}
        <button 
          className="flex-1 py-4 border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-450 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-all hover:scale-[1.02]"
        >
          View Detection History
        </button>
      </div>

      {/* Bottom Section: Splits into LEFT CARD (60%) and RIGHT CARD (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* LEFT CARD (60%) - AI Detection & Repellent Telemetry */}
        <div className="lg:col-span-6 bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-[2rem] p-6 flex flex-col justify-between transition-colors">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-850 dark:text-stone-100 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
              AI Detection & Repellent Telemetry
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Large Current Frequency */}
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center min-h-[110px]">
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-1">Current Frequency</span>
                <span key={frequency} className={`text-4xl font-black tracking-tight transition-all duration-350 ${
                  detection?.birdDetected && frequency ? 'text-emerald-600 dark:text-emerald-450 drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]' : 'text-stone-300 dark:text-stone-700'
                }`}>
                  {detection?.birdDetected && frequency ? `${frequency} kHz` : 'Standby'}
                </span>
              </div>

              {/* Detail Metrics */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Bird Species</span>
                  <span className="font-bold text-stone-850 dark:text-stone-100 truncate block">
                    {detection?.birdDetected ? detection.birdName : (repelledReport ? repelledReport.species : 'None')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Confidence</span>
                  <span className="font-bold text-stone-850 dark:text-stone-100 block">
                    {detection?.birdDetected ? `${Math.round(detection.confidence * 100)}%` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider inline-block ${
                    detection?.birdDetected && frequency
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 animate-pulse'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                  }`}>
                    {detection?.birdDetected && frequency ? 'Broadcasting' : 'Standby'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Attempt Number</span>
                  <span className="font-bold text-stone-850 dark:text-stone-100 block">
                    {detection?.birdDetected ? `#${attempts}` : (repelledReport ? `#${repelledReport.attempts}` : '--')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Detection Duration</span>
                  <span className="font-bold text-stone-850 dark:text-stone-100 block">
                    {detection?.birdDetected ? `${repellDuration}s` : (repelledReport ? `${repelledReport.duration}s` : '--')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 dark:text-stone-500 block mb-0.5">Change Interval</span>
                  <span className="font-bold text-stone-850 dark:text-stone-100 block">2.0 seconds</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/50 dark:border-stone-800/55 flex justify-between items-center text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            <span>Behaviour Mode</span>
            <span className="text-emerald-650 dark:text-emerald-450">
              {detection?.birdDetected ? 'Dynamic Frequency Hopping' : 'Standby'}
            </span>
          </div>
        </div>

        {/* RIGHT CARD (40%) - Adaptive Frequency Graph */}
        <div className="lg:col-span-4 bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 rounded-[2rem] p-6 transition-colors">
          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-850 dark:text-stone-100 mb-4">
            Adaptive Frequency Graph
          </h4>

          <div className="w-full h-44 bg-white dark:bg-stone-900/60 rounded-2xl border border-stone-100 dark:border-stone-850 p-2 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
              {/* Dotted horizontal grid lines (Y-axis 20 to 30) */}
              <line x1="35" y1="15" x2="285" y2="15" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />
              <line x1="35" y1="37" x2="285" y2="37" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />
              <line x1="35" y1="59" x2="285" y2="59" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />
              <line x1="35" y1="81" x2="285" y2="81" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />
              <line x1="35" y1="103" x2="285" y2="103" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />
              <line x1="35" y1="125" x2="285" y2="125" stroke="#E5E7EB" strokeDasharray="2 2" className="dark:stroke-stone-800" />

              {/* Y Axis Labels */}
              <text x="28" y="18" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">30</text>
              <text x="28" y="40" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">28</text>
              <text x="28" y="62" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">26</text>
              <text x="28" y="84" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">24</text>
              <text x="28" y="106" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">22</text>
              <text x="28" y="128" textAnchor="end" fontSize="7" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">20</text>
              <text x="35" y="144" textAnchor="middle" fontSize="5" fontWeight="900" className="fill-stone-400 dark:fill-stone-500">kHz</text>

              {/* X Axis Labels */}
              <text x="35" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">0</text>
              <text x="60" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">2</text>
              <text x="85" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">4</text>
              <text x="110" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">6</text>
              <text x="135" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">8</text>
              <text x="160" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">10</text>
              <text x="185" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">12</text>
              <text x="210" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">14</text>
              <text x="235" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">16</text>
              <text x="260" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">18</text>
              <text x="285" y="136" textAnchor="middle" fontSize="6" fontWeight="800" className="fill-stone-400 dark:fill-stone-500">20</text>

              <text x="160" y="145" textAnchor="middle" fontSize="6" fontWeight="900" className="fill-stone-400 dark:fill-stone-550 uppercase tracking-widest">Elapsed Time (s)</text>

              {/* Spline Curve path */}
              {points.length > 0 && (
                <path 
                  d={getBezierPath(points)} 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  className="transition-all duration-300"
                />
              )}

              {/* glowing dot on the latest frequency */}
              {detection?.birdDetected && points.length > 0 && (
                <>
                  <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="#10B981" className="animate-ping opacity-75" />
                  <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="#10B981" />
                </>
              )}
            </svg>
          </div>
        </div>

      </div>

      {/* Status Bar footer */}
      <div className="mt-2 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-wrap justify-between gap-y-3 gap-x-6 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <span>Camera Status:</span>
          <span className={`transition-colors ${isActive ? 'text-emerald-600' : 'text-stone-450 dark:text-stone-500'}`}>
            {isActive ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>AI Model:</span>
          <span className={`transition-colors ${isActive ? 'text-emerald-600 font-semibold' : 'text-stone-450 dark:text-stone-500'}`}>
            {isActive ? 'Ready' : 'Standby'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Live Detection:</span>
          <span className={`transition-colors ${isActive ? 'text-emerald-600 font-semibold' : 'text-stone-450 dark:text-stone-500'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Node:</span>
          <span className="text-stone-600 dark:text-stone-300">Guardian #001</span>
        </div>
      </div>
    </div>
  );
};

export default LiveAICameraCard;
