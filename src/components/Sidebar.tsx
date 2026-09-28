import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  GitBranch, 
  Network, 
  Zap, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  FileText,
  Route
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  if (location.pathname === '/') {
    return null;
  }

  const mainNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Materials Registry', path: '/materials', icon: Layers },
    { name: 'Feasibility Analysis', path: '/feasibility', icon: GitBranch },
    { name: 'Candidate Routes', path: '/routes', icon: Route },
    { name: 'Optimization', path: '/optimize', icon: Zap },
    { name: 'Impact Analysis', path: '/impact', icon: BarChart3 },
    { name: 'Maps & Network', path: '/network', icon: Network },
  ];

  const secondaryNav = [
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shadow-xs ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-green-800 font-sans">
                  WasteManagement
                </span>
                <span className="text-[10px] text-green-600 font-semibold tracking-tight -mt-0.5">
                  RE:FLOW-X Platform
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="p-3 space-y-1">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Core Platform
            </div>
          )}
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-green-100/90 text-green-900 font-bold border-l-4 border-green-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* System & Reports */}
        <div className="p-3 space-y-1 border-t border-slate-100 mt-2">
          {!collapsed && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Analysis & System
            </div>
          )}
          {secondaryNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-green-100/90 text-green-900 font-bold border-l-4 border-green-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/80">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
          </span>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                Engine Operational
              </span>
              <span className="text-[10px] text-slate-500">
                v2.4 — Industrial Platform
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
