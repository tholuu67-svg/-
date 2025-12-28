import React, { useState, useEffect, useCallback } from 'react';
import { getStatData } from './services/tavernService';
import { StatData } from './types';
import StatusView from './views/StatusView';
import TaskView from './views/TaskView';
import WorldView from './views/WorldView';
import MapView from './views/MapView';
import TerritoryView from './views/TerritoryView';

// Navigation Tab Definition
type Tab = 'Status' | 'Tasks' | 'World' | 'Map' | 'Territory';

const App: React.FC = () => {
  const [data, setData] = useState<StatData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Status');
  const [isLoading, setIsLoading] = useState(true);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Data polling loop mimicking original extension behavior
  const fetchData = useCallback(async () => {
    const newData = await getStatData();
    if (newData) {
      setData(newData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-accentBlue animate-pulse font-decorative">正在读取魔网数据...</div>;
  }

  if (!data || !data.主角) {
    return <div className="text-center p-10 text-red-400">无法获取 MVU 数据，请确保 SillyTavern 插件正常运行。</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Status':
        return <StatusView player={data.主角} openSkillTree={() => setShowSkillModal(true)} />;
      case 'Tasks':
        return <TaskView questLog={data.任务日志} />;
      case 'World':
        return <WorldView relations={data.关系列表} enemies={data.敌人列表} />;
      case 'Map':
        return <MapView player={data.主角} waypoints={data.地图位标} />;
      case 'Territory':
        return <TerritoryView assets={data.资产} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bgStart to-bgEnd pb-10">
      {/* Skill Tree Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-bgStart border-2 border-accentBlue/40 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(168,192,255,0.2)]">
             <div className="flex justify-between items-center p-4 border-b border-white/10">
               <h2 className="font-decorative text-xl text-accentBlue">职业与技能树</h2>
               <button onClick={() => setShowSkillModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
                <p className="text-gray-400 text-center italic">
                   在此处可视化技能树节点 (待根据 worldbook 数据实现)<br/>
                   当前技能点: <span className="text-staminaColor font-bold">{data.主角.技能点}</span>
                </p>
                {/* Simplified List of learned skills for modal context */}
                <div className="mt-4 grid grid-cols-1 gap-2">
                    {Object.entries(data.主角.技能列表 || {}).map(([name, skill]) => (
                        <div key={name} className="bg-white/5 p-2 rounded flex justify-between">
                            <span>{name}</span>
                            <span className="text-accentBlue">{skill.level}</span>
                        </div>
                    ))}
                </div>
             </div>
             <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
               <button onClick={() => setShowSkillModal(false)} className="bg-accentBlue/20 hover:bg-accentBlue/40 text-accentBlue px-4 py-2 rounded">关闭</button>
             </div>
          </div>
        </div>
      )}

      {/* Top Nav */}
      <div className="sticky top-0 z-40 bg-bgStart/90 backdrop-blur-md border-b border-accentBlue/20 shadow-lg">
        <div className="flex justify-between items-center px-4 py-2">
           <div className="font-decorative text-accentBlue text-lg hidden sm:block">Goblin Slayer</div>
           <div className="flex space-x-1 overflow-x-auto no-scrollbar">
             {(['Status', 'Tasks', 'World', 'Map', 'Territory'] as Tab[]).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`px-3 py-2 rounded text-sm font-display tracking-wide transition-all ${
                   activeTab === tab 
                     ? 'bg-accentBlue text-bgStart font-bold shadow-[0_0_10px_rgba(168,192,255,0.4)]' 
                     : 'text-gray-400 hover:text-white hover:bg-white/5'
                 }`}
               >
                 {tab === 'Status' ? '状态' : 
                  tab === 'Tasks' ? '任务' : 
                  tab === 'World' ? '世界' : 
                  tab === 'Map' ? '地图' : '领地'}
               </button>
             ))}
           </div>
        </div>
        {/* World Time Bar */}
        <div className="bg-black/40 text-center py-1 text-xs text-gray-400 border-b border-white/5 font-serif">
           ⏳ {data.世界?.当前时间 || '未知时间'}
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;