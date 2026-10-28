
import React, { useState } from 'react';
import { IndianRupee, Clock, TrendingUp, Heart } from 'lucide-react';

const DecisionSimulator: React.FC = () => {
  const [laborDays, setLaborDays] = useState(5);
  const [intensity, setIntensity] = useState(50);

  const calculateSavings = () => (laborDays * 120 * (intensity / 100)).toFixed(0);
  const calculateCost = () => (laborDays * 400).toFixed(0);

  return (
    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] p-8 border border-stone-200 dark:border-stone-800 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/40 rounded-xl">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Economic Steward</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm italic">Simulating choices, understanding outcomes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-350 flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-400" /> Additional Guarding Days
              </label>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{laborDays} days</span>
            </div>
            <input 
              type="range" min="0" max="30" value={laborDays}
              onChange={(e) => setLaborDays(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-350 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-stone-400" /> Expected Crop Value (per kg)
              </label>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">₹{intensity}</span>
            </div>
            <input 
              type="range" min="10" max="200" value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-indigo-50 dark:border-indigo-950/20 shadow-sm flex items-start gap-4 transition-colors duration-300">
            <Heart className="w-6 h-6 text-indigo-400 dark:text-indigo-500 shrink-0 mt-1" />
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
              <strong>Human Insight:</strong> Increasing guarding days reduces the risk of massive flock damage, but can lead to farmer burnout. Consider community rotation for better resilience.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="bg-emerald-600 text-white p-8 rounded-[2rem] shadow-xl shadow-emerald-100 dark:shadow-none relative overflow-hidden group transition-transform hover:scale-[1.02]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
            <div className="text-emerald-100 text-sm uppercase tracking-widest font-bold mb-2">Potential Gain</div>
            <div className="text-5xl font-bold mb-4">₹{calculateSavings()}</div>
            <p className="text-emerald-100 text-sm opacity-90 leading-relaxed">
              If you commit to these guarding days, you are projected to save approximately {intensity}kg of rice from bird damage.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-8 rounded-[2rem] shadow-sm transition-colors duration-300">
             <div className="text-stone-400 dark:text-stone-500 text-sm uppercase tracking-widest font-bold mb-2">Cost of Action</div>
             <div className="text-4xl font-bold text-stone-700 dark:text-stone-200 mb-2">₹{calculateCost()}</div>
             <p className="text-stone-500 dark:text-stone-450 text-sm italic">
                This includes labor costs and opportunity loss of time.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionSimulator;
