
import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Battery, Activity, Camera, Volume2, ShieldCheck, AlertTriangle, RefreshCw, PlayCircle } from 'lucide-react';
import { HardwareDevice, HardwareEvent } from '../types';
import { birdDetectionService, DetectionResult } from '../services/birdDetectionService';
import { frequencySimulationService } from '../services/frequencySimulationService';

const HardwareDashboard: React.FC = () => {
  const [devices, setDevices] = useState<HardwareDevice[]>([
    {
      id: 'ESP-001',
      name: 'North Ridge Guardian',
      status: 'online',
      battery: 84,
      signalStrength: 92,
      lastDetection: Date.now() - 3600000,
      location: { x: 200, y: 150 },
      sensors: { pir: false, ultrasonic: 420, lux: 800 }
    },
    {
      id: 'ESP-002',
      name: 'Wetland Sector A',
      status: 'warning',
      battery: 12,
      signalStrength: 45,
      lastDetection: Date.now() - 15000,
      location: { x: 450, y: 300 },
      sensors: { pir: true, ultrasonic: 50, lux: 120 }
    }
  ]);

  const [events, setEvents] = useState<HardwareEvent[]>([
    {
      id: 'evt-1',
      deviceId: 'ESP-002',
      timestamp: Date.now() - 15000,
      triggerType: 'pir',
      birdDetected: 'sparrow',
      actionTaken: 'Ultrasonic Pulse (Pattern B)',
      effectiveness: 85,
      imageUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=200'
    }
  ]);

  // Webcam and Detection states
  const [isDetecting, setIsDetecting] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [currentDetection, setCurrentDetection] = useState<DetectionResult | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [totalDetections, setTotalDetections] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState<string | null>(null);
  const [prevBirdDetected, setPrevBirdDetected] = useState(false);

  // Simulate real-time pulses
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        sensors: { ...d.sensors, lux: d.sensors.lux + (Math.random() > 0.5 ? 1 : -1) }
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message: string) => {
    const newEvent: HardwareEvent = {
      id: `log-${Date.now()}-${Math.random()}`,
      deviceId: 'ESP-002',
      timestamp: Date.now(),
      triggerType: 'manual',
      birdDetected: 'unknown',
      actionTaken: message,
      effectiveness: 100
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const startDetection = async () => {
    if (isDetecting) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      setWebcamStream(stream);
      setIsDetecting(true);
      setCurrentDetection(null);
      setFrequency(null);
      setPrevBirdDetected(false);

      birdDetectionService.startDetection((result) => {
        setCurrentDetection(result);
      });

      addLog('Scanning resumed');

      setTimeout(() => {
        const videoElement = document.getElementById('webcam-video') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error("Webcam access error:", err);
      alert("Please allow camera access to start detection simulation.");
    }
  };

  const stopDetection = () => {
    birdDetectionService.stopDetection();
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsDetecting(false);
    setCurrentDetection(null);
    setFrequency(null);
    if (prevBirdDetected) {
      addLog('Bird left camera');
    }
    addLog('Scanning resumed');
    setPrevBirdDetected(false);
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      birdDetectionService.stopDetection();
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Frequency simulation update loop when a bird is detected
  useEffect(() => {
    let freqInterval: NodeJS.Timeout | null = null;

    if (isDetecting && currentDetection?.birdDetected) {
      const initialFreq = frequencySimulationService.generateFrequency();
      setFrequency(initialFreq);
      addLog(`Frequency ${initialFreq} kHz activated`);

      const runFreqUpdate = () => {
        const nextDelay = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
        freqInterval = setTimeout(() => {
          if (isDetecting && currentDetection?.birdDetected) {
            const nextFreq = frequencySimulationService.generateFrequency();
            setFrequency(nextFreq);
            addLog(`Frequency ${nextFreq} kHz activated`);
            runFreqUpdate();
          }
        }, nextDelay);
      };
      
      runFreqUpdate();
    } else {
      setFrequency(null);
    }

    return () => {
      if (freqInterval) clearTimeout(freqInterval);
    };
  }, [isDetecting, currentDetection?.birdDetected]);

  // Bird arrival/departure logs and statistics
  useEffect(() => {
    if (!isDetecting) return;

    if (currentDetection?.birdDetected && !prevBirdDetected) {
      setTotalDetections(prev => prev + 1);
      const timeStr = new Date().toLocaleTimeString();
      setLastDetectionTime(timeStr);
      addLog(`${currentDetection.birdName} detected (${Math.round(currentDetection.confidence * 100)}%)`);
      setPrevBirdDetected(true);
    } else if (currentDetection && !currentDetection.birdDetected && prevBirdDetected) {
      addLog('Bird left camera');
      addLog('Scanning resumed');
      setPrevBirdDetected(false);
    }
  }, [isDetecting, currentDetection, prevBirdDetected]);

  // Sync state parameters to devices list
  useEffect(() => {
    setDevices(prev => prev.map(d => {
      if (d.id === 'ESP-002') {
        return {
          ...d,
          lastDetection: isDetecting && currentDetection?.birdDetected ? Date.now() : d.lastDetection,
          sensors: {
            ...d.sensors,
            pir: isDetecting ? !!currentDetection?.birdDetected : false,
            ultrasonic: isDetecting && currentDetection?.birdDetected ? 20 : 50
          }
        };
      }
      return d;
    }));
  }, [isDetecting, currentDetection?.birdDetected]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map(device => {
            const isTarget = device.id === 'ESP-002';
            return (
              <div key={device.id} className="bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 p-8 shadow-sm relative overflow-hidden group transition-colors duration-300">
                <div className={`absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none -mr-8 -mt-8 ${device.status === 'online' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <Cpu className="w-full h-full" />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">{device.id}</span>
                    </div>
                    <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100">{device.name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-stone-400 dark:text-stone-550">
                        <Battery className={`w-4 h-4 ${device.battery < 20 ? 'text-red-500' : 'text-emerald-500'}`} />
                        <span className="text-xs font-bold">{device.battery}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-stone-550">
                        <Wifi className="w-4 h-4" />
                        <span className="text-xs font-bold">{device.signalStrength}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-3 bg-stone-50 dark:bg-stone-950/40 rounded-2xl text-center">
                    <Activity className="w-4 h-4 text-stone-400 dark:text-stone-500 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-stone-500 dark:text-stone-450 uppercase">Motion</div>
                    <div className={`text-xs font-bold ${
                      isTarget && isDetecting 
                        ? (currentDetection?.birdDetected ? 'text-emerald-600' : 'text-amber-500') 
                        : (device.sensors.pir ? 'text-emerald-600' : 'text-stone-400 dark:text-stone-555')
                    }`}>
                      {isTarget && isDetecting 
                        ? (currentDetection?.birdDetected ? 'Bird Detected' : 'Scanning...') 
                        : (device.sensors.pir ? 'DETECTED' : 'CLEAR')}
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-950/40 rounded-2xl text-center">
                    <RefreshCw className="w-4 h-4 text-stone-400 dark:text-stone-500 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-stone-500 dark:text-stone-450 uppercase">Proximity</div>
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {isTarget && isDetecting
                        ? (currentDetection?.birdDetected ? 'Frequency Activated' : 'Monitoring')
                        : `${device.sensors.ultrasonic}cm`}
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-950/40 rounded-2xl text-center">
                    <ShieldCheck className="w-4 h-4 text-stone-400 dark:text-stone-500 mx-auto mb-1" />
                    <div className="text-[10px] font-bold text-stone-500 dark:text-stone-455 uppercase">Health</div>
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300 font-semibold">
                      {isTarget && isDetecting
                        ? (currentDetection?.birdDetected ? `${currentDetection.birdName} (${Math.round(currentDetection.confidence * 100)}%)` : 'Monitoring')
                        : 'OPT-1'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                    <Volume2 className="w-4 h-4" /> Test Sound
                  </button>
                  <button 
                    onClick={isTarget ? (isDetecting ? stopDetection : startDetection) : undefined}
                    className="flex-1 py-3 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> {isTarget && isDetecting ? 'Stop Detection' : 'Start Detection'}
                  </button>
                </div>

                {/* Additional Statistics widgets under target device when detecting */}
                {isTarget && isDetecting && (
                  <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-y-2 gap-x-4 text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase transition-all">
                    <div>Total Detections: <span className="text-stone-800 dark:text-stone-200">{totalDetections}</span></div>
                    <div>Current Frequency: <span className="text-stone-800 dark:text-stone-200">{frequency ? `${frequency} kHz` : 'N/A'}</span></div>
                    <div>Current Bird: <span className="text-stone-800 dark:text-stone-200">{currentDetection?.birdDetected ? currentDetection.birdName : 'None'}</span></div>
                    <div>Confidence: <span className="text-stone-800 dark:text-stone-200">{currentDetection?.birdDetected ? `${Math.round(currentDetection.confidence * 100)}%` : 'N/A'}</span></div>
                    <div className="col-span-2">Last Detection: <span className="text-stone-800 dark:text-stone-200">{lastDetectionTime || 'N/A'}</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Event Timeline */}
        <div className="bg-stone-900 dark:bg-stone-900/60 rounded-[3rem] p-8 text-white flex flex-col h-full shadow-2xl border border-transparent dark:border-stone-800 transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Event Narrative
            </h3>
            <span className="text-[10px] font-bold bg-white/10 dark:bg-stone-800/80 px-2 py-1 rounded">Live Feed</span>
          </div>

          {/* Existing camera feed player */}
          {isDetecting ? (
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 border border-stone-850 shadow-md">
              <video 
                id="webcam-video" 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Green Bounding Box Overlay */}
              {currentDetection?.birdDetected && currentDetection.boundingBox && (
                <div 
                  className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none flex flex-col p-1 transition-all"
                  style={{
                    left: `${(currentDetection.boundingBox.x / 640) * 100}%`,
                    top: `${(currentDetection.boundingBox.y / 480) * 100}%`,
                    width: `${(currentDetection.boundingBox.width / 640) * 100}%`,
                    height: `${(currentDetection.boundingBox.height / 480) * 100}%`
                  }}
                >
                  <span className="bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded self-start">
                    {currentDetection.birdName} ({Math.round(currentDetection.confidence * 100)}%)
                  </span>
                </div>
              )}

              {/* Ultrasonic Simulation Overlay */}
              {currentDetection?.birdDetected && frequency && (
                <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm border border-stone-800/50 text-white px-3 py-2 rounded-xl text-[9px] font-bold pointer-events-none transition-all">
                  <div className="text-emerald-400 animate-pulse mb-0.5">Ultrasonic Repellent Activated (Simulation)</div>
                  <div>Frequency: {frequency} kHz</div>
                </div>
              )}

              <div className="absolute bottom-2 right-2">
                <button 
                  onClick={stopDetection}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white text-[9px] font-bold uppercase rounded-lg shadow transition-colors"
                >
                  Stop Detection
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden mb-6 group cursor-pointer" onClick={startDetection}>
              <img src="https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&q=80&w=200" alt="Camera Static" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                <span className="text-[10px] font-bold flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" /> Start Detection
                </span>
              </div>
            </div>
          )}

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {events.map(event => {
              const isLog = event.triggerType === 'manual';
              return (
                <div key={event.id} className="relative pl-6 border-l-2 border-white/10 dark:border-stone-800 pb-2">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-stone-900 dark:border-stone-950" />
                  <div className="bg-white/5 dark:bg-stone-950/20 rounded-2xl p-4 border border-white/5 dark:border-stone-800/40">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                        <h5 className="text-sm font-bold">
                          {isLog ? `${event.deviceId}: System Log` : `${event.deviceId}: Movement Detection`}
                        </h5>
                      </div>
                      {!isLog && (
                        <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg">
                          {event.effectiveness}% Eff.
                        </div>
                      )}
                    </div>

                    {event.imageUrl && !isDetecting && (
                      <div className="relative rounded-xl overflow-hidden mb-4 group cursor-pointer" onClick={startDetection}>
                        <img src={event.imageUrl} alt="Detection" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                          <span className="text-[10px] font-bold flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" /> Start Detection
                          </span>
                        </div>
                      </div>
                    )}

                    {isLog ? (
                      <p className="text-xs text-stone-250 dark:text-stone-200 font-semibold leading-relaxed">
                        {event.actionTaken}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 dark:text-stone-300 leading-relaxed mb-4">
                        Sensor fusion (PIR + Ultrasonic) confirmed presence of {event.birdDetected}. {event.actionTaken} successfully deterred flight.
                      </p>
                    )}
                    
                    {!isLog && (
                      <div className="flex gap-2">
                        <button className="text-[9px] font-bold text-white/40 hover:text-white dark:hover:text-stone-300 uppercase tracking-tighter transition-colors">Correct ID</button>
                        <span className="text-white/10 dark:text-stone-800">|</span>
                        <button className="text-[9px] font-bold text-white/40 hover:text-white dark:hover:text-stone-300 uppercase tracking-tighter transition-colors">Dismiss</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="text-center py-4">
               <p className="text-stone-500 dark:text-stone-600 text-[10px] font-bold uppercase tracking-widest italic">Waiting for field events...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareDashboard;
