import React from 'react';
import { Zap } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  moduleName: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, moduleName, description }) => {
  return (
    <div className="max-w-[1200px] mx-auto py-12 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shadow-xl">
        <Zap className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
          PHASE 2 MODULE
        </span>
        <h1 className="text-2xl font-bold font-mono text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400 max-w-md font-mono">
          {description}
        </p>
      </div>

      <div className="industrial-card p-6 w-full max-w-lg text-left space-y-3 font-mono text-xs">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">Module Architecture:</span>
          <span className="text-teal-400 font-bold">{moduleName} Engine</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-500">Status:</span>
          <span className="text-amber-400 font-semibold">Scheduled Phase 2 Rollout</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Configured Constraints:</span>
          <span className="text-slate-300">Multi-Objective Linear Programming</span>
        </div>
      </div>
    </div>
  );
};
