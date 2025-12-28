import React, { useState, useEffect } from 'react';
import { initialData } from './mockData';
import { StatData } from './types';
import { StatusView } from './components/views/StatusView';
import { TaskView } from './components/views/TaskView';
import { WorldView } from './components/views/WorldView';
import { MapView } from './components/views/MapView';
import { TerritoryView } from './components/views/TerritoryView';
import { SettingsView } from './components/views/SettingsView';
import * as Lucide from 'lucide-react';

type Tab = 'status' | 'tasks' | 'world' | 'map' | 'territory' | 'settings';

const App: React.FC = () => {
  const [data, setData] = useState<StatData>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('status');

  // In a real SillyTavern extension, you would listen for window.postMessage or Mvu events here.
  // For this standalone, we just use the mock data.
  useEffect(() => {
    console.log("Goblin Slayer Extension Loaded");
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'status': return <StatusView character={data.主角} />;
      case 'tasks': return <TaskView data={data} />;
      case 'world': return <WorldView data={data} />;
      case 'map': return <MapView data={data} />;
      case 'territory': return <TerritoryView data={data} />;
      case 'settings': return <SettingsView />;
      default: return <StatusView character={data.主角} />;
    }
  };

  const NavButton = ({ id, icon: Icon, label }: { id: Tab; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center p-3 w-full transition-all duration-300 border-l-4 ${
        activeTab === id 
          ? 'bg-slate-800 border-blue-500 text-blue-300' 
          : 'border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'
      }`}
    >
      <Icon size={24} className="mb-1" />
      <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none z-0"></div>

      {/* Sidebar Navigation */}
      <nav className="w-20 bg-slate-950 border-r border-slate-800 z-10 flex flex-col justify-between shrink-0 shadow-2xl">
        <div className="flex flex-col">
          <div className="h-16 flex items-center justify-center border-b border-slate-800 mb-2">
             <Lucide.Swords size={32} className="text-slate-200" />
          </div>
          <NavButton id="status" icon={Lucide.User} label="状态" />
          <NavButton id="tasks" icon={Lucide.ScrollText} label="任务" />
          <NavButton id="world" icon={Lucide.Globe2} label="世界" />
          <NavButton id="map" icon={Lucide.Map} label="地图" />
          <NavButton id="territory" icon={Lucide.Castle} label="领地" />
        </div>
        <div>
           <NavButton id="settings" icon={Lucide.Settings} label="设置" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col z-10 overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
           <div>
              <h1 className="text-lg font-cinzel font-bold text-slate-200">星界洪流 <span className="text-slate-600">|</span> {data.世界.当前时间}</h1>
           </div>
           <div className="flex gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 系统正常
              </div>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
           <div className="max-w-7xl mx-auto pb-10">
              {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
