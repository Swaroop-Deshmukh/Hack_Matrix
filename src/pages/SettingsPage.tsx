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
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-green-700" /> Platform & Settings
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage regional cluster workspace settings, default optimization objectives, and emission standards.
          </p>
        </div>

        <button onClick={handleSave} className="industrial-button-green px-5 py-2.5">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      <div className="space-y-6 text-xs">
        {/* SECTION 1: WORKSPACE & UNITS */}
        <div className="industrial-card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Workspace & Unit System</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Active Industrial Workspace</label>
              <input type="text" disabled value="Industrial Portfolio / Demo" className="industrial-input w-full bg-slate-100 text-slate-500 font-bold" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Currency & Financial Unit</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="industrial-input w-full font-bold">
                <option>INR (₹ Lakhs)</option>
                <option>USD ($ Thousands)</option>
                <option>EUR (€ Thousands)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: OPTIMIZATION DEFAULTS */}
        <div className="industrial-card p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">Optimization Solver Defaults</h2>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Default Objective Weighting</label>
            <select value={defaultObjective} onChange={(e) => setDefaultObjective(e.target.value)} className="industrial-input w-full font-bold">
              <option value="BALANCED">BALANCED CIRCULAR DECISION (Recommended)</option>
              <option value="MINIMUM_COST">MINIMUM COST</option>
              <option value="MAXIMUM_DIVERSION">MAXIMUM DIVERSION</option>
              <option value="MINIMUM_EMISSIONS">MINIMUM COMPARATIVE EMISSIONS</option>
            </select>
          </div>
        </div>

        {/* SECTION 3: SYSTEM INFO */}
        <div className="industrial-card p-6 space-y-3 bg-slate-50/80">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">System Specifications</h2>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Platform Version:</span>
            <strong className="text-slate-900 font-mono">v2.4-enterprise-light</strong>
          </div>
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Demo Industrial Cluster:</span>
            <strong className="text-green-800 font-bold">Central India Metallurgy Cluster (Nagpur/Bhilai)</strong>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-300 text-slate-800 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <div className="text-xs font-bold text-green-900">Workspace settings saved successfully.</div>
        </div>
      )}
    </div>
  );
};
