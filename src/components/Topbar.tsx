import React, { useState } from 'react';
import { Search, Bell, User, Play, ChevronDown, Building2, CheckCircle2 } from 'lucide-react';

interface TopbarProps {
  onRunOptimization: () => void;
  onOpenAddMaterialModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onRunOptimization }) => {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('Industrial Portfolio / Demo');
  const [searchQuery, setSearchQuery] = useState('');

  const workspaces = [
    'Industrial Portfolio / Demo',
    'Nagpur Thermal & Steel Hub',
    'Bhilai Metallurgy Network',
    'Western Region Circular Corridor'
  ];

  return (
    <header className="h-14 bg-[#0c0e14]/90 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Workspace Selector */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#131722] border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-all"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-mono text-slate-300">{selectedWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {workspaceOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#11141c] border border-slate-800 rounded-md shadow-xl py-1 z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 font-semibold border-b border-slate-800/60">
                Switch Industrial Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setSelectedWorkspace(ws);
                    setWorkspaceOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-teal-400 flex items-center justify-between transition-colors"
                >
                  <span className="font-mono">{ws}</span>
                  {selectedWorkspace === ws && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material ID, pathway, site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#090b10] border border-slate-800 rounded text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/60 transition-all font-mono"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Global Run Optimization Button */}
        <button
          onClick={onRunOptimization}
          className="industrial-button-primary"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>Run Optimization</span>
        </button>

        <div className="h-4 w-px bg-slate-800 my-auto" />

        {/* Notifications */}
        <button 
          className="p-1.5 rounded hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-teal-400 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800/80">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 font-mono">Dr. S. Deshmukh</span>
            <span className="text-[10px] text-slate-400 font-mono">Chief Material Architect</span>
          </div>
        </div>
      </div>
    </header>
  );
};
