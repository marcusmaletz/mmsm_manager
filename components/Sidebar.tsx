import React from 'react';
import { LayoutDashboard, Calendar, Settings, Zap } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'calendar' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-20 lg:w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
        <Zap className="w-8 h-8 text-indigo-500 mr-0 lg:mr-3" />
        <span className="font-bold text-xl hidden lg:block tracking-tight">MultiPlier</span>
      </div>

      <nav className="flex-1 py-6 space-y-2 px-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-6 h-6 lg:mr-3" />
          <span className="hidden lg:block font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl transition-colors ${
            activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Calendar className="w-6 h-6 lg:mr-3" />
          <span className="hidden lg:block font-medium">Kalender</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl transition-colors ${
            activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-6 h-6 lg:mr-3" />
          <span className="hidden lg:block font-medium">Einstellungen</span>
        </button>
      </div>
    </div>
  );
};