import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  GitBranch, 
  Network, 
  Zap, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Hexagon
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Materials', path: '/materials', icon: Layers },
    { name: 'Feasibility', path: '/feasibility', icon: GitBranch },
    { name: 'Network', path: '/network', icon: Network },
  ];

  const phase2Nav = [
    { name: 'Optimize', path: '/optimize', icon: Zap },
    { name: 'Impact', path: '/impact', icon: BarChart3 },
    { name: 'Resilience', path: '/resilience', icon: ShieldAlert },
    { name: 'Decide', path: '/decide', icon: CheckCircle2 },
  ];

  const bottomNav = [
    { name: 'Methodology', path: '/methodology', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0c0e14] border-r border-slate-800/80 transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-sm shadow-teal-500/20">
              <Hexagon className="w-4 h-4 fill-slate-950 stroke-none" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-wider text-slate-100 font-mono">
                  RE:FLOW-X
                </span>
                <span className="text-[10px] text-slate-400 tracking-tight font-medium -mt-0.5">
                  Circular Decision Engine
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800/60 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="p-2 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
              Core Platform
            </div>
          )}
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Phase 2 Modules */}
        <div className="p-2 space-y-1 border-t border-slate-800/60 mt-2">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono flex items-center justify-between">
              <span>Optimization</span>
              <span className="text-[9px] bg-slate-800/90 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 font-sans">Phase 2</span>
            </div>
          )}
          {phase2Nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? `${item.name} (Phase 2)` : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0 text-slate-500" />
              {!collapsed && (
                <span className="flex-1 flex items-center justify-between">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* System Methodology */}
        <div className="p-2 space-y-1 border-t border-slate-800/60 mt-2">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
              System
            </div>
          )}
          {bottomNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090b0e]/80">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-300 font-mono tracking-tight flex items-center gap-1">
                System Online
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                v1.0.4-industrial
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
