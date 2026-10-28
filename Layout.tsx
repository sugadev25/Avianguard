
import React, { useState } from 'react';
import { Sprout, BarChart3, Map as MapIcon, BookOpen, Settings, Bell, Cpu, Sun, Moon, X, Camera } from 'lucide-react';
import { FarmerProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: FarmerProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, profile }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const tabs = [
    { id: 'dashboard', icon: MapIcon, label: 'Wisdom' },
    { id: 'guardian', icon: Cpu, label: 'Guardian' },
    { id: 'camera', icon: Camera, label: 'AI Camera' },
    { id: 'report', icon: Sprout, label: 'Observe' },
    { id: 'analytics', icon: BarChart3, label: 'Insights' },
    { id: 'knowledge', icon: BookOpen, label: 'Learn' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfcf9] dark:bg-stone-950 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sticky top-0 h-screen transition-colors duration-300">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Sprout className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">AvianGuard</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-550 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800">
          <button className="flex items-center gap-3 px-4 py-3 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 w-full transition-colors rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <div className="mt-4 px-4">
             <p className="text-[10px] text-stone-400 dark:text-stone-500 italic leading-relaxed">"A silent intelligent guardian — acting only when needed."</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto bg-[#f9fbf8] dark:bg-stone-950 transition-colors duration-300">
        <header className="px-8 py-5 flex justify-between items-center border-b border-stone-100 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-md sticky top-0 z-[40] transition-colors duration-300">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 capitalize">{activeTab}</h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-100 dark:border-emerald-900">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter">Sync Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleTheme}
              className="p-2 text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-6.5 h-6.5" /> : <Sun className="w-6.5 h-6.5" />}
            </button>

            <button className="relative p-2 text-stone-400 dark:text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-stone-900 rounded-full" />
            </button>

            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-100">
                  {profile?.name || 'Janardhan S.'}
                </p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-bold tracking-widest">
                  {profile?.role || 'Village Warden'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[1.25rem] bg-emerald-600 flex items-center justify-center border-2 border-emerald-100 dark:border-emerald-900 shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'JS'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center border-2 border-emerald-105 shadow-md">
                <span className="text-white font-bold text-lg">
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'JS'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-0.5">
                  User Details
                </span>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 leading-tight">
                  {profile?.name || 'Janardhan S.'}
                </h3>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800 text-stone-700 dark:text-stone-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Steward Role</span>
                  <span className="text-sm font-semibold capitalize">{profile?.role || 'Village Warden'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Main Crop</span>
                  <span className="text-sm font-semibold">{profile?.cropType || 'Basmati Rice'}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Growth Stage</span>
                  <span className="text-sm font-semibold">{profile?.landType || 'Milky Stage'}</span>
                </div>
              </div>

              {((profile?.pairedDevices && profile.pairedDevices.length > 0) || (profile?.devices && profile.devices.length > 0)) && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-1.5">Active Guardian Nodes</span>
                  <div className="flex flex-wrap gap-2">
                    {((profile?.pairedDevices || profile?.devices || []) as string[]).map((d) => (
                      <span key={d} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.challenges && profile.challenges.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block mb-1.5">Primary Challenges</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.challenges.map((c) => (
                      <span key={c} className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 rounded-xl text-xs font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-stone-900/90 backdrop-blur-lg border-t border-stone-100 dark:border-stone-800 flex justify-around p-3 z-50 transition-colors duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
              activeTab === tab.id
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm px-4'
                : 'text-stone-400 dark:text-stone-500'
            }`}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-[8px] font-bold uppercase tracking-[0.15em]">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
