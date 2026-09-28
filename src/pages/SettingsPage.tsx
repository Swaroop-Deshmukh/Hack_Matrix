import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  CheckCircle2, 
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [savedToast, setSavedToast] = useState(false);
  const [currency, setCurrency] = useState('INR (₹ Lakhs)');
  const [defaultObjective, setDefaultObjective] = useState('BALANCED');

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-teal-400" /> Platform & Workspace Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage regional cluster workspace settings, default optimization objectives, and emission standards.
          </p>
        </div>

        <button onClick={handleSave} className="industrial-button-primary">
          <Save className="w-3.5 h-3.5 fill-slate-950" /> Save Settings
        </button>
      </div>

      <div className="space-y-6 font-mono text-xs">
        {/* SECTION 1: WORKSPACE & UNITS */}
        <div className="industrial-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Workspace & Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Active Workspace</label>
              <input type="text" disabled value="Industrial Portfolio / Demo" className="industrial-input w-full text-slate-400" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase block mb-1">Currency & Unit System</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="industrial-input w-full">
                <option>INR (₹ Lakhs)</option>
                <option>USD ($ Thousands)</option>
                <option>EUR (€ Thousands)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: OPTIMIZATION DEFAULTS */}
        <div className="industrial-card p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Optimization Solver Defaults</h2>
          <div>
            <label className="text-[10px] text-slate-400 uppercase block mb-1">Default Objective Weighting</label>
            <select value={defaultObjective} onChange={(e) => setDefaultObjective(e.target.value)} className="industrial-input w-full">
              <option value="BALANCED">BALANCED CIRCULAR DECISION (Recommended)</option>
              <option value="MINIMUM_COST">MINIMUM COST</option>
              <option value="MAXIMUM_DIVERSION">MAXIMUM DIVERSION</option>
              <option value="MINIMUM_EMISSIONS">MINIMUM COMPARATIVE EMISSIONS</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: SYSTEM INFO */}
        <div className="industrial-card p-5 space-y-3 bg-[#090b10]">
          <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">System Telemetry</h2>
          <div className="flex justify-between text-slate-400">
            <span>Platform Version:</span>
            <strong className="text-slate-200">v1.0.4-industrial-frontend</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Demo Dataset:</span>
            <strong className="text-teal-400 font-bold">Central India Metallurgy Cluster (Nagpur/Bhilai)</strong>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#11141c] border border-emerald-500/50 text-slate-200 px-4 py-3 rounded-md shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-mono text-emerald-300">Workspace settings saved.</div>
        </div>
      )}
    </div>
  );
};
