import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1800);
  };

  if (isLandingPage) {
    return <div className="min-h-screen bg-green-50/60">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Left Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Container */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar onRunOptimization={handleRunOptimization} />

        {/* Page Content */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>

      {/* Optimization Modal / Overlay */}
      {isOptimizing && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="industrial-card p-6 w-96 text-center space-y-4 shadow-2xl border border-teal-500/40">
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/10 border border-teal-500/40 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">Running LP Allocation Engine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluating material streams, chemical constraints, and transport nodes...
              </p>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-teal-400 h-full animate-pulse w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Optimization Complete Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#11141c] border border-emerald-500/50 text-slate-200 px-4 py-3 rounded-md shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold font-mono text-emerald-300">Optimization Completed</div>
            <div className="text-[11px] text-slate-400">Material routing updated. +420 t diverted, CO₂e reduced.</div>
          </div>
        </div>
      )}
    </div>
  );
};
