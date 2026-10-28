
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { ArrowRight, CloudRain, Map, Target, Cpu, Shield, Loader2, CheckCircle2, QrCode, Wifi } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: any) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevice, setDiscoveredDevice] = useState<{ id: string; signal: string; battery: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [data, setData] = useState({
    role: UserRole.FARMER,
    landType: '',
    cropType: '',
    challenges: [] as string[],
    pairedDevices: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = () => {
    onComplete(data);
  };

  const simulateScan = () => {
    setIsScanning(true);
    setDiscoveredDevice(null);
    // Simulate camera/QR scan delay
    setTimeout(() => {
      setIsScanning(false);
      setDiscoveredDevice({
        id: 'ESP-32-V2-8821',
        signal: 'Strong (-42dBm)',
        battery: 94
      });
    }, 2000);
  };

  const connectDevice = () => {
    if (!discoveredDevice) return;
    setIsConnecting(true);
    // Simulate handshake
    setTimeout(() => {
      setIsConnecting(false);
      setData(prev => ({
        ...prev,
        pairedDevices: [...prev.pairedDevices, discoveredDevice.id]
      }));
      setDiscoveredDevice(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#fdfcf9] z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-2xl w-full py-12">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <Map className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800 text-center mb-4 tracking-tight">Identify your role</h2>
            <p className="text-stone-500 text-center mb-10 text-lg">Are you a guardian of the soil or a student of its patterns?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {[
                { id: UserRole.FARMER, label: 'Field Steward', desc: 'Daily practitioner' },
                { id: UserRole.STUDENT, label: 'Researcher', desc: 'Data analyst' },
                { id: UserRole.OFFICER, label: 'Policy Maker', desc: 'Regional overview' }
              ].map(role => (
                <button
                  key={role.id}
                  onClick={() => setData({ ...data, role: role.id })}
                  className={`p-6 rounded-2xl text-left transition-all border-2 ${
                    data.role === role.id ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105' : 'border-stone-100 bg-white hover:border-stone-200'
                  }`}
                >
                  <div className="font-bold text-stone-800 mb-1">{role.label}</div>
                  <div className="text-sm text-stone-500 leading-tight">{role.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full bg-stone-800 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-stone-900 transition-all shadow-xl shadow-stone-200">
              Continue our story <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <CloudRain className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800 text-center mb-4 tracking-tight">The breath of your crop</h2>
            <p className="text-stone-500 text-center mb-10 text-lg">What life is currently growing in your soil?</p>
            
            <div className="space-y-6 mb-10">
              <input 
                type="text"
                placeholder="e.g. Basmati Rice, Pearl Millet..."
                className="w-full px-6 py-5 rounded-2xl border-2 border-stone-100 focus:border-emerald-500 outline-none text-xl font-medium placeholder:text-stone-300"
                value={data.cropType}
                onChange={(e) => setData({ ...data, cropType: e.target.value })}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Early Sowing', 'Vegetative', 'Flowering', 'Grain Filling', 'Ripening', 'Harvest Ready'].map(stage => (
                   <button 
                    key={stage}
                    onClick={() => setData({...data, landType: stage})}
                    className={`px-4 py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all ${data.landType === stage ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-500 border-stone-100'}`}
                   >
                     {stage}
                   </button>
                ))}
              </div>
            </div>
            <button 
              onClick={nextStep} 
              disabled={!data.cropType || !data.landType}
              className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${(!data.cropType || !data.landType) ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-stone-800 text-white hover:bg-stone-900 shadow-stone-200'}`}
            >
              Define the guardian <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <Cpu className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800 text-center mb-4 tracking-tight">Link your Guardian</h2>
            <p className="text-stone-500 text-center mb-10 text-lg">Pair your ESP32 hardware nodes to enable autonomous defense.</p>
            
            <div className="space-y-6 mb-10">
              {/* Scan Button Area */}
              <button 
                onClick={simulateScan}
                disabled={isScanning || isConnecting}
                className={`w-full p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center group transition-all relative overflow-hidden ${isScanning ? 'bg-stone-50 border-emerald-300' : 'bg-stone-50 border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
              >
                 {isScanning ? (
                   <>
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-emerald-700 font-bold text-sm">Initializing Camera & Decrypting QR...</p>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="h-0.5 w-full bg-emerald-400/30 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                   </>
                 ) : (
                   <>
                    <QrCode className="w-10 h-10 text-stone-300 group-hover:text-emerald-500 mb-4 transition-colors" />
                    <p className="text-stone-500 font-bold text-sm">Scan Device QR Code</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-2">Tap to start pairing process</p>
                   </>
                 )}
              </button>

              {/* Discovered Device Card */}
              {discoveredDevice && !data.pairedDevices.includes(discoveredDevice.id) && (
                <div className="animate-in zoom-in-95 duration-300 flex items-center gap-4 p-5 bg-white rounded-3xl border-2 border-emerald-100 shadow-lg shadow-emerald-50">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-stone-800">New Guardian Found</p>
                     <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-tight">ID: {discoveredDevice.id} | Signal: {discoveredDevice.signal}</p>
                  </div>
                  <button 
                    onClick={connectDevice}
                    disabled={isConnecting}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isConnecting ? 'bg-stone-100 text-stone-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  >
                    {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                  </button>
                </div>
              )}

              {/* Paired Devices List */}
              {data.pairedDevices.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-2">Active Connections</p>
                  {data.pairedDevices.map(deviceId => (
                    <div key={deviceId} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in slide-in-from-left-4">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-emerald-900">{deviceId} Verified</p>
                         <p className="text-[10px] text-emerald-600 uppercase font-bold">Secure Hardware Handshake Complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleFinish} 
              disabled={data.pairedDevices.length === 0}
              className={`w-full py-6 rounded-2xl font-bold text-xl transition-all shadow-2xl ${data.pairedDevices.length === 0 ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'}`}
            >
              Step into AvianGuard
            </button>
            {data.pairedDevices.length === 0 && (
              <p className="text-center text-[10px] text-stone-400 mt-4 uppercase font-bold tracking-widest">At least one guardian node is required to proceed</p>
            )}
          </div>
        )}
      </div>
      
      {/* Progress indicators */}
      <div className="fixed bottom-10 flex gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-2 rounded-full transition-all duration-700 ${step === i ? 'w-16 bg-emerald-600' : 'w-4 bg-stone-200'}`} />
        ))}
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(120px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
