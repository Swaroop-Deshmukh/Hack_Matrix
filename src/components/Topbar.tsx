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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Workspace Selector & Global Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-green-700" />
            <span className="text-slate-900 font-sans font-medium">{selectedWorkspace}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {workspaceOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3.5 py-1.5 text-[10px] uppercase font-mono text-slate-400 font-bold border-b border-slate-100">
                Switch Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  onClick={() => {
                    setSelectedWorkspace(ws);
                    setWorkspaceOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-green-50 hover:text-green-900 flex items-center justify-between transition-colors font-medium cursor-pointer"
                >
                  <span>{ws}</span>
                  {selectedWorkspace === ws && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material ID, pathway, site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-green-600 focus:bg-white transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Global Run Optimization Button (Orange Brand Accent) */}
        <button
          onClick={onRunOptimization}
          className="industrial-button-primary"
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          <span>Run Optimization</span>
        </button>

        <div className="h-4 w-px bg-slate-200 my-auto" />

        {/* Notifications */}
        <button 
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 relative transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1.5 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-800 font-bold">
            <User className="w-4.5 h-4.5" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 font-sans">Dr. S. Deshmukh</span>
            <span className="text-[10px] text-slate-500 font-medium">Chief Material Architect</span>
          </div>
        </div>
      </div>
    </header>
  );
};
