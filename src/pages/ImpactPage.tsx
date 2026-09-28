import React, { useState } from 'react';
import { mockImpactRecord } from '../data';
import { 
  Download, 
  Info, 
  X
} from 'lucide-react';

export const ImpactPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ECONOMIC' | 'ENVIRONMENTAL' | 'METHODOLOGY'>('OVERVIEW');
  const [showCalculationDrawer, setShowCalculationDrawer] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Impact Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Transparent comparison of the optimized reuse scenario against the configured disposal baseline.
          </p>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center bg-[#090b10] p-1 rounded border border-slate-800 gap-1 text-xs font-mono">
          {(['OVERVIEW', 'ECONOMIC', 'ENVIRONMENTAL', 'METHODOLOGY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded transition-all ${
                activeTab === tab
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Side by Side Scenario Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BASELINE CARD */}
            <div className="industrial-card p-5 space-y-4 border-slate-800 bg-[#0d0f14]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">BASELINE</span>
                <span className="text-xs font-mono text-slate-300 font-semibold">Normal Disposal</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-500">Waste Handled:</span>
                  <span className="text-slate-200 font-bold">12,450 t</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-500">Waste Diverted:</span>
                  <span className="text-red-400 font-bold">0 t (0%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-500">Processing:</span>
                  <span className="text-slate-400">—</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-500">Transport:</span>
                  <span className="text-slate-300">Configured baseline freight</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Residual / Ash Pond:</span>
                  <span className="text-red-400 font-bold">12,450 t</span>
                </div>
              </div>
            </div>

            {/* RE:FLOW-X OPTIMIZED REUSE CARD */}
            <div className="industrial-card p-5 space-y-4 border-teal-500/40 bg-[#101622] shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold font-mono text-teal-400 uppercase tracking-wider">RE:FLOW-X</span>
                <span className="text-xs font-mono text-emerald-300 font-semibold">Optimized Reuse</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Waste Handled:</span>
                  <span className="text-slate-100 font-bold">12,450 t</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Waste Diverted:</span>
                  <span className="text-emerald-400 font-bold">9,820 t (78.9%)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Processing:</span>
                  <span className="text-teal-300 font-semibold">Configured Pre-Treatment</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Transport:</span>
                  <span className="text-teal-300 font-semibold">Optimized Multi-Modal</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Residual / Ash Pond:</span>
                  <span className="text-emerald-400 font-bold">2,630 t (-78.9%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ENVIRONMENTAL AUDIT RECORD */}
          <div className="industrial-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold font-mono text-slate-200">Environmental Benefit Record</h2>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowCalculationDrawer(true)}
                  className="industrial-button-secondary"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" /> View Calculation
                </button>
                <button className="industrial-button-primary">
                  <Download className="w-3.5 h-3.5 fill-slate-950" /> Export Audit Record
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-[#090b10] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Record ID</span>
                <span className="text-slate-200 font-bold">{mockImpactRecord.id}</span>
              </div>
              <div className="p-3 bg-[#090b10] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Optimization Run</span>
                <span className="text-teal-400 font-bold">{mockImpactRecord.optimizationRunId}</span>
              </div>
              <div className="p-3 bg-[#090b10] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">System Boundary</span>
                <span className="text-slate-300">{mockImpactRecord.systemBoundary}</span>
              </div>
              <div className="p-3 bg-[#090b10] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Emission Factors</span>
                <span className="text-slate-300">{mockImpactRecord.emissionFactorsVersion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ECONOMIC WATERFALL */}
      {activeTab === 'ECONOMIC' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="industrial-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold font-mono text-slate-200">Economic Waterfall Breakdown</h2>
              <span className="text-[10px] font-mono text-slate-400">Values in ₹ Lakhs</span>
            </div>

            {/* Waterfall Items Graphic */}
            <div className="space-y-3 font-mono text-xs py-2">
              {mockImpactRecord.waterfallData.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-[#090b10] rounded border border-slate-800">
                  <span className="text-slate-300 font-medium">{item.name}</span>
                  <span className={`font-bold ${
                    item.type === 'COST' 
                      ? 'text-slate-200' 
                      : item.type === 'SAVING' 
                      ? 'text-emerald-400' 
                      : 'text-teal-400 text-sm'
                  }`}>
                    {item.value > 0 ? `+₹${item.value} L` : `-₹${Math.abs(item.value)} L`}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#131722] rounded border border-slate-800 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Comparison:</span>
              <span>Baseline Cost: <strong className="text-slate-300">₹14.80 L</strong> vs Reuse Net Cost: <strong className="text-teal-400">₹8.42 L</strong> (₹6.38 L Net Savings)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENVIRONMENTAL EMISSIONS */}
      {activeTab === 'ENVIRONMENTAL' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="industrial-card p-6 border-emerald-500/30 bg-[#0d1516] space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs uppercase text-slate-400 font-bold">Emissions Accounting Equation</span>
              <span className="text-xs text-emerald-400">ΔE = E_reuse − E_baseline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-[#090b10] rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">E_baseline</span>
                <span className="text-xl font-bold text-slate-200">3,450 tCO₂e</span>
                <span className="text-[9px] text-slate-500 block">Disposal + Virgin Material</span>
              </div>

              <div className="p-4 bg-[#090b10] rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase">E_reuse</span>
                <span className="text-xl font-bold text-slate-200">2,166 tCO₂e</span>
                <span className="text-[9px] text-slate-500 block">Transport + Pre-Treatment</span>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold">Comparative emissions change</span>
                <span className="text-2xl font-bold text-emerald-300">-1,284 tCO₂e</span>
                <span className="text-[9px] text-emerald-400 block">Net Offset</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METHODOLOGY */}
      {activeTab === 'METHODOLOGY' && (
        <div className="industrial-card p-5 space-y-3 font-mono text-xs text-slate-300">
          <h2 className="text-sm font-bold text-slate-100">LCA & ISO 14040 System Boundary Rules</h2>
          <p className="text-slate-400">
            System boundary encompasses raw waste generation, multi-modal haulage, drying/grinding pre-treatment, and direct clinker displacement credit.
          </p>
        </div>
      )}

      {/* CALCULATION DRAWER */}
      {showCalculationDrawer && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0e1118] border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-slate-500">Formula Breakdown</span>
                <h3 className="text-sm font-bold text-teal-400">LCA Calculation Parameters</h3>
              </div>
              <button onClick={() => setShowCalculationDrawer(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Transport Emissions</span>
                <p className="text-slate-200">Qty (9,820 t) × Dist (184 km) × Factor (0.0012) = <strong>2,166 tCO₂e</strong></p>
              </div>

              <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Baseline Offset</span>
                <p className="text-slate-200">Conventional Clinker Production Factor = <strong>3,450 tCO₂e</strong></p>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-300">
                Comparative ΔE = 2,166 − 3,450 = <strong>-1,284 tCO₂e</strong>
              </div>
            </div>
          </div>

          <button onClick={() => setShowCalculationDrawer(false)} className="industrial-button-primary w-full justify-center">
            Close Calculation Drawer
          </button>
        </div>
      )}
    </div>
  );
};
