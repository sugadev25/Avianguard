
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import LivingMap from './components/LivingMap';
import DecisionSimulator from './components/DecisionSimulator';
import HardwareDashboard from './components/HardwareDashboard';
import LiveAICameraCard from './components/LiveAICameraCard';
import { FarmerProfile, DamageReport } from './types';
import { getAdaptiveAdvisory } from './services/geminiService';
// Added RefreshCw and Cpu to the imports
import { Sprout, AlertCircle, Users, GraduationCap, CheckCircle2, ChevronRight, Bird, Zap, ShieldAlert, Thermometer, Droplets, RefreshCw, Cpu } from 'lucide-react';

const App: React.FC = () => {
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [advisory, setAdvisory] = useState<any>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);

  // Mock initial reports
  const [reports] = useState<DamageReport[]>([
    { id: '1', timestamp: Date.now(), cropStage: 'Milky Stage', severity: 7, observation: 'Hardware detection confirmed: Parakeet flock.', coordinates: [0, 0], isVerified: true },
  ]);

  const handleOnboardingComplete = (data: any) => {
    setProfile({
      id: '1',
      name: 'Janardhan',
      ...data
    });
    setOnboarded(true);
  };

  useEffect(() => {
    if (onboarded && profile) {
      setIsLoadingAdvisory(true);
      getAdaptiveAdvisory(profile, reports).then(res => {
        setAdvisory(res);
        setIsLoadingAdvisory(false);
      });
    }
  }, [onboarded, profile, reports]);

  if (!onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} profile={profile}>
      {activeTab === 'dashboard' && (
        <div className="space-y-12 animate-in fade-in duration-1000">
          {/* Dashboard Header */}
          <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 text-emerald-600 mb-4">
                 <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                   <ShieldAlert className="w-5 h-5 dark:text-emerald-400" />
                 </div>
                 <span className="font-bold tracking-[0.2em] text-[10px] uppercase dark:text-emerald-400">Field Integrity: Optimized</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 dark:text-stone-100 leading-tight">
                Guardian Node #001 is active in your {profile?.cropType || 'Rice'} field.
              </h1>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-5 rounded-[2rem] flex items-center gap-4 shadow-sm min-w-[200px] transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                  <Thermometer className="w-6 h-6 text-amber-600 dark:text-amber-450" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Regional Temp</div>
                  <div className="text-xl font-bold text-stone-800 dark:text-stone-100">32°C</div>
                </div>
              </div>
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-5 rounded-[2rem] flex items-center gap-4 shadow-sm min-w-[200px] transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-450" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Soil Moisture</div>
                  <div className="text-xl font-bold text-stone-800 dark:text-stone-100">64%</div>
                </div>
              </div>
            </div>
          </section>

          {/* Living Map */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-4">
               <div>
                 <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">The Living Landscape</h3>
                 <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-1 italic">Real-time visualization of Guardian Nodes and bird movement patterns.</p>
               </div>
               <button className="px-5 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">Export GIS Data</button>
            </div>
            <LivingMap />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Advisory Engine */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 p-10 shadow-sm h-full flex flex-col relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Sprout className="w-48 h-48 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100 dark:shadow-none">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Adaptive Intelligence</h3>
                  </div>
                  {isLoadingAdvisory && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-emerald-600" />}
                </div>

                {advisory ? (
                  <div className="space-y-8 flex-1 relative z-10">
                    <div className="p-8 bg-[#f8fbf6] dark:bg-stone-950/40 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-950/20 relative shadow-sm transition-colors duration-300">
                       <div className="absolute -top-3 left-8 px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-md">
                         Guardian Suggestion
                       </div>
                       <h4 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">{advisory.title}</h4>
                       <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8 text-xl font-medium">{advisory.message}</p>
                       <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-stone-900/50 rounded-2xl border border-emerald-50 dark:border-emerald-950/20">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
                          </div>
                          <p className="text-emerald-800 dark:text-emerald-300 font-bold text-sm tracking-tight">{advisory.impact}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="p-7 border border-stone-100 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase mb-3 tracking-widest">Machine Memory</p>
                          <p className="text-stone-700 dark:text-stone-300 font-bold leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors italic">"Pattern #3 deterred 92% of entries last dusk. Suggesting automated rotation."</p>
                       </div>
                       <div className="p-7 border border-stone-100 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase mb-3 tracking-widest">Hardware Feedback</p>
                          <p className="text-stone-700 dark:text-stone-300 font-bold leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">"Node #002 is experiencing PIR interference from high winds. Calibration needed."</p>
                       </div>
                    </div>
                  </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 py-12">
                     <RefreshCw className="w-10 h-10 animate-spin mb-4 opacity-20" />
                     <p className="font-bold uppercase tracking-widest text-[10px]">Synchronizing with regional hardware...</p>
                   </div>
                )}
              </div>
            </div>

            {/* Community Intelligence */}
            <div className="bg-stone-800 dark:bg-stone-900 rounded-[3rem] p-10 text-white flex flex-col shadow-2xl relative overflow-hidden transition-colors duration-300">
              <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
                 <Users className="w-64 h-64" />
              </div>
              <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="p-2 bg-white/10 dark:bg-stone-800/50 rounded-xl">
                   <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Regional Network</h3>
              </div>
              <div className="space-y-6 flex-1 relative z-10">
                {[
                  { text: 'Unusual gathering of Swifts near River bank', farm: '400m away', time: '2h ago', verified: true },
                  { text: 'Node failure reported in Sector B', farm: '2.1km away', time: '4h ago', verified: false },
                  { text: 'Milky stage harvest starting early', farm: '1.2km away', time: '5h ago', verified: true }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 dark:bg-stone-950/20 p-6 rounded-[2rem] border border-white/5 dark:border-stone-800/30 relative group hover:bg-white/10 dark:hover:bg-stone-800/50 transition-all cursor-pointer">
                    <p className="text-sm text-stone-100 dark:text-stone-200 mb-4 leading-relaxed italic">"{item.text}"</p>
                    <div className="flex justify-between items-center">
                       <div className="flex flex-col">
                         <span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">{item.farm}</span>
                         <span className="text-[9px] font-bold text-stone-500 dark:text-stone-600 mt-1">{item.time}</span>
                       </div>
                       {item.verified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-10 w-full py-5 bg-white/10 hover:bg-emerald-600 text-white border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all relative z-10">
                Contribute Observation
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guardian' && <HardwareDashboard />}

      {activeTab === 'camera' && (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4">Edge AI Telemetry</h2>
            <p className="text-stone-500 dark:text-stone-400 text-base max-w-xl mx-auto italic font-medium">Real-time edge recognition and threat classifications straight from the soil.</p>
          </div>
          <LiveAICameraCard setActiveTab={setActiveTab} />
        </div>
      )}

      {activeTab === 'report' && (
        <div className="max-w-4xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-stone-800 dark:text-stone-100 mb-6">Observe and Document</h2>
            <p className="text-stone-500 dark:text-stone-400 text-lg max-w-xl mx-auto italic font-medium">Every piece of field wisdom you contribute refines the Guardian's intelligence.</p>
          </div>
          
          <div className="bg-white dark:bg-stone-900 rounded-[3rem] border border-stone-200 dark:border-stone-800 p-12 shadow-sm space-y-16 transition-colors duration-300">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                  <h4 className="text-2xl font-bold text-stone-700 dark:text-stone-200">When did the visit occur?</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Dawn', 'Morning', 'Mid-Day', 'Dusk'].map(time => (
                    <button key={time} className="p-6 rounded-2xl border-2 border-stone-50 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all font-bold text-stone-600 dark:text-stone-300 text-sm tracking-wide">
                      {time}
                    </button>
                  ))}
                </div>
             </div>

             <div className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h4 className="text-2xl font-bold text-stone-700 dark:text-stone-200">Lifecycle Evolution</h4>
                </div>
                <div className="relative pt-12 pb-6 px-4">
                   <div className="h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full w-full" />
                   <div className="absolute top-10 left-0 flex justify-between w-full px-4">
                     {['Sowing', 'Vegetative', 'Milky', 'Ripening', 'Harvest'].map(stage => (
                       <div key={stage} className="flex flex-col items-center gap-3 group cursor-pointer">
                          <div className={`w-5 h-5 rounded-full border-4 border-white dark:border-stone-900 shadow-md transition-all ${stage === 'Milky' ? 'bg-emerald-600 scale-150 ring-4 ring-emerald-500/20' : 'bg-stone-300 dark:bg-stone-700 group-hover:bg-emerald-400'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${stage === 'Milky' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-550'}`}>{stage}</span>
                       </div>
                     ))}
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                  <h4 className="text-2xl font-bold text-stone-700 dark:text-stone-200">Narrative Details</h4>
                </div>
                <textarea 
                  placeholder="Describe flock behavior, reaction to scaring, or unusual species sightings..."
                  className="w-full h-40 p-8 rounded-[2.5rem] border-2 border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-950/20 focus:border-emerald-500 outline-none text-stone-600 dark:text-stone-300 resize-none text-lg leading-relaxed placeholder:text-stone-300 dark:placeholder:text-stone-600"
                />
             </div>

             <div className="flex flex-col sm:flex-row gap-5">
                <button className="flex-[3] bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 hover:scale-[1.01] transition-all">
                  Sync with Regional Collective
                </button>
                <button className="flex-1 py-5 border-2 border-stone-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-850 transition-all">
                  Unsure / Draft
                </button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-12 animate-in fade-in duration-700">
           <section className="bg-white dark:bg-stone-900 p-10 rounded-[3rem] border border-stone-100 dark:border-stone-800 shadow-sm transition-colors duration-300">
              <h2 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-3">Economic Resilience</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-10 max-w-2xl text-lg italic">Balancing the cost of hardware and labor against crop yields. A simulator built for the sustainable steward.</p>
              <DecisionSimulator />
           </section>

           <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-10 rounded-[3rem] shadow-sm transition-colors duration-300">
                <div className="flex justify-between items-center mb-10">
                   <h4 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Regional Pressure Trends</h4>
                   <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full uppercase text-stone-500 dark:text-stone-400 tracking-widest">Sector B Focus</span>
                </div>
                <div className="h-72 bg-[#fafafa] dark:bg-stone-950/40 rounded-3xl flex items-end justify-around p-10 gap-4 border border-stone-50 dark:border-stone-800/50">
                   {[40, 65, 30, 85, 50, 70, 45].map((h, i) => (
                     <div key={i} className="w-full bg-emerald-600/10 rounded-2xl relative group transition-all hover:bg-emerald-600/30 cursor-pointer" style={{ height: `${h}%` }}>
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] p-2.5 rounded-xl hidden group-hover:block whitespace-nowrap z-10 shadow-xl font-bold">
                           {h}% Crop Vulnerability
                        </div>
                        <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tighter">Day {i+1}</div>
                     </div>
                   ))}
                </div>
                <div className="mt-16 flex items-start gap-5 p-6 bg-amber-50 dark:bg-amber-955/20 rounded-[2rem] border border-amber-100/50 dark:border-amber-950/10">
                  <div className="p-3 bg-white dark:bg-stone-900 rounded-2xl shadow-sm">
                    <Bird className="w-6 h-6 text-amber-600 dark:text-amber-450" />
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed italic font-medium">
                    "Peak bird activity aligns with Guardian Node #003 battery depletion cycles. Suggesting solar panel check."
                  </p>
                </div>
              </div>

              <div className="bg-emerald-900 dark:bg-emerald-950/50 p-12 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <GraduationCap className="w-64 h-64" />
                 </div>
                 <div className="flex items-center gap-3 text-emerald-400 mb-8 relative z-10">
                    <div className="p-2 bg-white/10 dark:bg-stone-800/50 rounded-xl">
                      <GraduationCap className="w-7 h-7 text-emerald-400" />
                    </div>
                    <span className="font-bold uppercase tracking-[0.2em] text-xs">Academic Integrity</span>
                 </div>
                 <h3 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight relative z-10">Research Generator</h3>
                 <p className="text-emerald-100/70 dark:text-stone-300 mb-10 text-xl leading-relaxed relative z-10">
                   Transform your Guardian's telemetry into formal abstract-grade insights for local policy intervention.
                 </p>
                 <button className="w-full py-6 bg-white dark:bg-stone-900 text-emerald-900 dark:text-emerald-400 rounded-[2rem] font-bold text-xl hover:bg-emerald-50 dark:hover:bg-stone-800 hover:scale-[1.01] transition-all relative z-10 shadow-2xl">
                   Draft Regional Study
                 </button>
              </div>
           </section>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-12 animate-in fade-in duration-700">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Learning Moments</h3>
              <p className="text-xs text-stone-400 dark:text-stone-500 font-bold uppercase tracking-widest italic">Curated by agricultural psychologists.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { title: 'The Psychology of Parakeet Flocks', time: '2 min read', icon: Bird, color: 'amber', desc: 'Why group behavior is their greatest strength and weakness.' },
               { title: 'Optimizing Ultrasonic Defenses', time: '3 min read', icon: Zap, color: 'indigo', desc: 'Finding the frequency that deters without distressing local fauna.' },
               { title: 'Crop Staging: The Milky Window', time: '4 min read', icon: Sprout, color: 'emerald', desc: 'Critical defensive strategies for the most vulnerable harvest stage.' },
               { title: 'Community Defense Rotation', time: '5 min read', icon: Users, color: 'stone', desc: 'How village warden systems improve longevity and mental health.' },
               { title: 'ESP32: Advanced Calibration', time: '6 min read', icon: Cpu, color: 'indigo', desc: 'Maximizing PIR range while filtering wind interference.' },
             ].map((item, i) => (
               <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-sm group hover:shadow-xl">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-${item.color}-100 dark:bg-stone-800 transition-transform group-hover:scale-110`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600 dark:text-${item.color}-400`} />
                 </div>
                 <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-tight">{item.title}</h4>
                 <p className="text-sm text-stone-400 dark:text-stone-500 leading-relaxed mb-6 font-medium">{item.desc}</p>
                 <div className="flex justify-between items-center mt-auto">
                    <span className="text-stone-300 dark:text-stone-600 text-[10px] font-bold uppercase tracking-widest">{item.time}</span>
                    <button className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:underline">Engage Hub</button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
