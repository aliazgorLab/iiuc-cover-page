import React from 'react';
import { FileText, Microscope, Table, Users } from 'lucide-react';
import { useCoverStore } from '../../stores/useCoverStore';

export const DocumentSelector = () => {
  const { activeTab, setActiveTab } = useCoverStore();

  const tabs = [
    { id: 'assignment', label: 'Assignment Cover', icon: FileText, desc: 'Single topic & teacher box' },
    { id: 'labReport', label: 'Lab Report Cover', icon: Microscope, desc: 'Experiment no & title' },
    { id: 'labIndex', label: 'Lab Index Matrix', icon: Table, desc: 'Min 10 rows auto-padding' },
    { id: 'project', label: 'Group Project Cover', icon: Users, desc: '1 to 4 member grid' },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          Select Document Format
        </label>
        <span className="text-[11px] font-bold text-[#006A4E] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          Standard IIUC A4 Layouts
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-md scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#F3CF45]' : 'text-[#006A4E]'}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#F3CF45] animate-pulse"></span>
                )}
              </div>
              <div>
                <div className="text-xs font-black tracking-tight">{tab.label}</div>
                <div className={`text-[10px] font-medium leading-tight mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentSelector;
