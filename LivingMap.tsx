
import React, { useState, useRef, useEffect } from 'react';
import { Bird, Info, MapPin, X, Plus, Save, Trash2, Ghost, Pencil, Check, ChevronRight, Feather, Undo2, MousePointer2 } from 'lucide-react';

interface Hotspot {
  id: string;
  x: number;
  y: number;
  intensity: number; // 0.0 to 1.0
  label: string;
  story: string;
  birdType: 'parakeet' | 'sparrow' | 'crow' | 'pigeon' | 'unknown';
}

const BIRD_CONFIG = {
  parakeet: { icon: Bird, color: 'text-emerald-600', pulse: 'fill-emerald-500/10', bg: 'bg-emerald-50', label: 'Parakeet', desc: 'Noisy flocks' },
  sparrow: { icon: Feather, color: 'text-amber-600', pulse: 'fill-amber-500/10', bg: 'bg-amber-50', label: 'Sparrow', desc: 'Grain seekers' },
  crow: { icon: Ghost, color: 'text-stone-800', pulse: 'fill-stone-500/10', bg: 'bg-stone-100', label: 'Crow', desc: 'Opportunistic' },
  pigeon: { icon: Bird, color: 'text-blue-600', pulse: 'fill-blue-500/10', bg: 'bg-blue-50', label: 'Pigeon', desc: 'Ground feeders' },
  unknown: { icon: Info, color: 'text-stone-400', pulse: 'fill-stone-300/10', bg: 'bg-stone-50', label: 'Unsure', desc: 'Needs ID' },
};

const LivingMap: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    { id: '1', x: 200, y: 150, intensity: 0.8, label: 'Kuttanad Sector A', story: 'Frequent Parakeet sightings during milky stage.', birdType: 'parakeet' },
    { id: '2', x: 450, y: 280, intensity: 0.4, label: 'Palakkad Plains', story: 'Damage is subsiding as harvest nears completion.', birdType: 'sparrow' },
    { id: '3', x: 300, y: 400, intensity: 0.9, label: 'Wayanad High-Lands', story: 'High activity reported in newly sown millet plots.', birdType: 'crow' },
    { id: '4', x: 600, y: 120, intensity: 0.5, label: 'Coastal Basmati', story: 'Pigeons gathering near storage units.', birdType: 'pigeon' },
  ]);

  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [draftHotspot, setDraftHotspot] = useState<Hotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize draft when entering edit mode
  useEffect(() => {
    if (editMode && activeHotspot) {
      setDraftHotspot({ ...activeHotspot });
    } else {
      setDraftHotspot(null);
    }
  }, [editMode, activeHotspot]);

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAdding || !svgRef.current) return;

    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorpt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

    const newSpot: Hotspot = {
      id: Date.now().toString(),
      x: cursorpt.x,
      y: cursorpt.y,
      intensity: 0.5,
      label: 'New Observation',
      story: '',
      birdType: 'unknown'
    };

    setHotspots([...hotspots, newSpot]);
    setActiveHotspot(newSpot);
    setEditMode(true);
    setIsAdding(false);
  };

  const updateDraft = (updates: Partial<Hotspot>) => {
    if (!draftHotspot) return;
    setDraftHotspot({ ...draftHotspot, ...updates });
  };

  const handleSave = () => {
    if (!draftHotspot) return;
    setHotspots(hotspots.map(s => s.id === draftHotspot.id ? draftHotspot : s));
    setActiveHotspot(draftHotspot);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setDraftHotspot(null);
  };

  const deleteSpot = (id: string) => {
    setHotspots(hotspots.filter(s => s.id !== id));
    setActiveHotspot(null);
    setEditMode(false);
  };

  const getIntensityLabel = (val: number) => {
    if (val < 0.3) return "Minimal Risk";
    if (val < 0.6) return "Moderate Activity";
    if (val < 0.8) return "High Threat";
    return "Severe Vulnerability";
  };

  const hasChanges = JSON.stringify(activeHotspot) !== JSON.stringify(draftHotspot);

  return (
    <div className="relative w-full h-[550px] bg-[#f9fbf8] dark:bg-stone-950 rounded-[3rem] border-2 border-stone-100 dark:border-stone-850 overflow-hidden shadow-inner group/map transition-colors duration-300">
      {/* Map Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#065f46 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Map Controls */}
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${
            isAdding ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-md'
          }`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Document Activity'}
        </button>
      </div>

      <svg 
        ref={svgRef}
        className={`w-full h-full ${isAdding ? 'cursor-crosshair' : 'cursor-default'}`} 
        viewBox="0 0 800 600"
        onClick={handleMapClick}
      >
        {/* Decorative terrain path */}
        <path d="M50,50 Q150,20 250,80 T450,120 T650,80 T750,150 T650,450 T450,550 T200,480 T50,350 Z" fill="#10b981" fillOpacity="0.05" />
        
        {hotspots.map(spot => {
          // If we are editing this specific spot, show the draft values on the map for real-time feedback
          const isDrafted = editMode && draftHotspot?.id === spot.id;
          const displaySpot = isDrafted ? (draftHotspot as Hotspot) : spot;
          
          const Config = BIRD_CONFIG[displaySpot.birdType] || BIRD_CONFIG.unknown;
          const Icon = Config.icon;
          const isActive = activeHotspot?.id === spot.id;
          
          const iconScale = 0.8 + (displaySpot.intensity * 0.7); 
          const radius = 20 + displaySpot.intensity * 40;

          return (
            <g 
              key={spot.id} 
              onMouseEnter={() => !isAdding && setHoveredHotspot(displaySpot)}
              onMouseLeave={() => setHoveredHotspot(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (!isAdding) {
                  setActiveHotspot(spot);
                  setEditMode(false);
                }
              }} 
              className="cursor-pointer group"
            >
              {/* Pulsing circle using the bird's unique color */}
              <circle 
                cx={displaySpot.x} 
                cy={displaySpot.y} 
                r={radius} 
                className={`${Config.pulse} stroke-current transition-all duration-1000 animate-pulse-soft ${isActive ? 'stroke-2 opacity-30' : 'stroke-0'}`}
              />
              
              {/* Dynamic Bird Icon */}
              <foreignObject 
                x={displaySpot.x - (14 * iconScale)} 
                y={displaySpot.y - (14 * iconScale)} 
                width={28 * iconScale} 
                height={28 * iconScale}
                className="pointer-events-none"
              >
                <div 
                  className={`w-full h-full rounded-2xl flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-xl transition-all ${isActive ? 'ring-4 ring-emerald-500/20 scale-125' : 'group-hover:scale-110'} ${Config.bg}`}
                >
                  <Icon className={`w-1/2 h-1/2 ${Config.color}`} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredHotspot && (
        <div 
          className="absolute pointer-events-none bg-stone-900/90 dark:bg-stone-950/90 text-white px-5 py-3 rounded-[1.25rem] shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col items-start min-w-[160px]"
          style={{ 
            left: hoveredHotspot.x, 
            top: hoveredHotspot.y - (35 + hoveredHotspot.intensity * 40),
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="flex items-center gap-2 mb-2">
             <div className={`p-1 rounded-lg ${BIRD_CONFIG[hoveredHotspot.birdType].bg}`}>
               {React.createElement(BIRD_CONFIG[hoveredHotspot.birdType].icon, { className: `w-3 h-3 ${BIRD_CONFIG[hoveredHotspot.birdType].color}` })}
             </div>
             <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{BIRD_CONFIG[hoveredHotspot.birdType].label}</span>
          </div>
          <span className="text-sm font-bold leading-tight mb-2">{hoveredHotspot.label}</span>
          <div className="w-full flex items-center gap-3">
            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${hoveredHotspot.intensity * 100}%` }} />
            </div>
            <span className="text-[10px] font-bold text-emerald-400">{Math.round(hoveredHotspot.intensity * 100)}% Severity</span>
          </div>
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-stone-900/90 dark:border-t-stone-950/90" />
        </div>
      )}

      {isAdding && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-stone-800/90 dark:bg-stone-900/90 text-white px-8 py-4 rounded-full text-sm font-medium backdrop-blur-md shadow-2xl flex items-center gap-3 border border-white/10 dark:border-stone-850">
          <MousePointer2 className="w-5 h-5 text-emerald-400 animate-bounce" />
          Mark activity location on the map
        </div>
      )}

      {!activeHotspot && !isAdding && (
        <div className="absolute top-6 left-6 p-6 glass-panel dark:bg-stone-900/85 dark:border-stone-800/40 rounded-[2rem] max-w-xs shadow-xl border border-white/50 animate-in fade-in duration-700 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-400">
            <Info className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Map Intelligence</span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
            Hotspots grow and pulse based on real-time field reports. Select a node to view or update regional wisdom.
          </p>
        </div>
      )}

      {/* Sidebar UI */}
      {activeHotspot && (
        <div className="absolute bottom-6 right-6 md:top-6 md:bottom-auto p-7 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-[2.5rem] w-[360px] shadow-2xl animate-in slide-in-from-right-8 duration-500 border border-stone-100 dark:border-stone-800 max-h-[92%] overflow-y-auto z-20 transition-colors duration-300">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-[1.25rem] ${BIRD_CONFIG[editMode ? draftHotspot?.birdType || 'unknown' : activeHotspot.birdType].bg} transition-all duration-500 shadow-sm`}>
                {React.createElement(BIRD_CONFIG[editMode ? draftHotspot?.birdType || 'unknown' : activeHotspot.birdType].icon, { className: `w-7 h-7 ${BIRD_CONFIG[editMode ? draftHotspot?.birdType || 'unknown' : activeHotspot.birdType].color}` })}
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">
                  {editMode ? 'Updating Insights' : 'Field Wisdom'}
                </span>
                <h4 className="font-bold text-stone-800 dark:text-stone-100 text-lg leading-tight truncate max-w-[170px]">
                  {editMode ? 'Refine Record' : activeHotspot.label}
                </h4>
              </div>
            </div>
            <div className="flex gap-1.5">
              {!editMode ? (
                <>
                  <button onClick={() => setEditMode(true)} className="p-2.5 text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-2xl transition-all"><Pencil className="w-5 h-5" /></button>
                  <button onClick={() => deleteSpot(activeHotspot.id)} className="p-2.5 text-stone-300 dark:text-stone-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </>
              ) : (
                <button onClick={handleCancelEdit} className="p-2.5 text-stone-300 dark:text-stone-600 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-2xl transition-all"><Undo2 className="w-5 h-5" /></button>
              )}
              <button onClick={() => { setActiveHotspot(null); setEditMode(false); }} className="p-2.5 text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {editMode && draftHotspot ? (
            <div className="space-y-7 animate-in fade-in duration-300">
              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase mb-2.5 block tracking-widest">Identify Location</label>
                <input 
                  value={draftHotspot.label}
                  onChange={(e) => updateDraft({ label: e.target.value })}
                  className="w-full px-5 py-3.5 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 text-sm dark:text-stone-100 focus:border-emerald-500 outline-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600"
                  placeholder="e.g. South Terrace Rice"
                />
              </div>

              {/* Enhanced Visual Species Selector */}
              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase mb-3.5 block tracking-widest">Identify Species</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(BIRD_CONFIG) as Array<keyof typeof BIRD_CONFIG>).map(key => {
                    const Config = BIRD_CONFIG[key];
                    const isSelected = draftHotspot.birdType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => updateDraft({ birdType: key })}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all group ${
                          isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-md ring-4 ring-emerald-500/10' : 'border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-850 hover:border-stone-200 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className={`p-2.5 rounded-2xl transition-transform group-hover:scale-110 ${isSelected ? 'bg-white dark:bg-stone-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : Config.color + ' ' + Config.bg}`}>
                          <Config.icon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <div className={`text-[11px] font-bold ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-stone-700 dark:text-stone-300'}`}>{Config.label}</div>
                          <div className="text-[9px] text-stone-400 dark:text-stone-550 font-medium whitespace-nowrap opacity-80">{Config.desc}</div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 p-0.5 bg-emerald-500 rounded-full">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">Observed Impact</label>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${draftHotspot.intensity > 0.7 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450'}`}>
                    {Math.round(draftHotspot.intensity * 100)}% Severity
                  </span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05"
                  value={draftHotspot.intensity}
                  onChange={(e) => updateDraft({ intensity: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full cursor-pointer"
                />
                <p className="text-[10px] text-stone-500 dark:text-stone-450 mt-3 font-bold italic flex items-center justify-end gap-1.5 opacity-80">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" /> {getIntensityLabel(draftHotspot.intensity)}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase mb-2.5 block tracking-widest">Story Observation</label>
                <textarea 
                  value={draftHotspot.story}
                  onChange={(e) => updateDraft({ story: e.target.value })}
                  className="w-full px-5 py-4 bg-stone-50 dark:bg-stone-950 rounded-3xl border border-stone-200 dark:border-stone-850 text-sm dark:text-stone-100 focus:border-emerald-500 outline-none h-28 resize-none transition-all placeholder:text-stone-300 dark:placeholder:text-stone-600 leading-relaxed"
                  placeholder="What unique behaviors did you notice today?"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleCancelEdit} className="flex-1 py-4 rounded-2xl border-2 border-stone-100 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-all font-semibold">Discard</button>
                <button 
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex-[2] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
                    hasChanges ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02]' : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Save className="w-4 h-4" /> Commit Wisdom
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-7 animate-in fade-in duration-300">
              <div className="bg-[#fcfdfb] dark:bg-stone-950/40 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 shadow-sm relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <Bird className="w-12 h-12" />
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic relative z-10">
                  "{activeHotspot.story || 'No detailed observations recorded yet. Adding details helps the system understand movement patterns and bird psychology.'}"
                </p>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-end gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-[0.15em]">System Vulnerability</div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${activeHotspot.intensity * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{Math.round(activeHotspot.intensity * 100)}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-[0.15em] mb-1.5">Primary Threat</div>
                    <span className="px-3.5 py-1.5 bg-stone-800 dark:bg-stone-950 text-white dark:text-stone-200 text-[10px] font-bold rounded-xl capitalize tracking-wide border border-transparent dark:border-stone-800">
                      {activeHotspot.birdType}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={() => setEditMode(true)} className="w-full mt-2 flex items-center justify-center gap-2 py-4 border-2 border-stone-100 dark:border-stone-800 text-stone-500 dark:text-stone-450 text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-emerald-100 dark:hover:border-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all">
                <Pencil className="w-4 h-4" /> Refine Intelligence
              </button>
            </div>
          )}
        </div>
      )}

      {/* Narrative Time Slider */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-10 py-5 glass-panel dark:bg-stone-900/90 dark:border-stone-800/60 rounded-full flex items-center gap-10 shadow-2xl border border-white/60 dark:border-stone-800/40 backdrop-blur-2xl z-10 transition-colors duration-300">
        <div className="flex flex-col items-center"><span className="text-[9px] font-bold text-stone-400 dark:text-stone-500 uppercase mb-1 tracking-widest">Sowing</span><div className="w-2.5 h-2.5 rounded-full bg-stone-200 dark:bg-stone-750" /></div>
        <div className="w-56 md:w-96 h-2 bg-stone-200/50 dark:bg-stone-800/50 rounded-full relative overflow-hidden group">
           <div className="absolute inset-y-0 left-0 bg-emerald-600/20 w-3/4" />
           <div className="absolute top-1/2 left-3/4 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-stone-900 rounded-full shadow-xl cursor-pointer border-2 border-emerald-600 transition-transform hover:scale-125 z-10 flex items-center justify-center">
              <div className="w-1 h-3 bg-emerald-600 rounded-full mx-0.5" />
              <div className="w-1 h-3 bg-emerald-600 rounded-full mx-0.5" />
           </div>
        </div>
        <div className="flex flex-col items-center"><span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 uppercase mb-1 tracking-widest">Harvest</span><div className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none" /></div>
      </div>
    </div>
  );
};

export default LivingMap;
