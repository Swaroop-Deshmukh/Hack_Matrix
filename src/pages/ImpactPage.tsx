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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Impact Analysis & Accounting</h1>
          <p className="text-xs text-slate-600 mt-1">
            Transparent side-by-side comparison of the optimized reuse scenario against traditional disposal baseline.
          </p>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 gap-1 text-xs font-semibold shadow-xs">
          {(['OVERVIEW', 'ECONOMIC', 'ENVIRONMENTAL', 'METHODOLOGY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-green-100 text-green-900 font-bold border border-green-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
            <div className="industrial-card p-6 space-y-4 border-slate-200 bg-slate-50/60">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">NORMAL DISPOSAL BASELINE</span>
                <span className="text-xs text-slate-700 font-bold px-2.5 py-0.5 rounded-full bg-slate-200">Standard Practice</span>
              </div>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Waste Handled:</span>
                  <span className="text-slate-900 font-bold">12,450 t</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Waste Diverted:</span>
                  <span className="text-red-700 font-bold">0 t (0%)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Pre-Processing Cost:</span>
                  <span className="text-slate-400">₹0 L (None)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Freight Transport:</span>
                  <span className="text-slate-700 font-semibold">Standard Ash Pond Freight</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Residual Ash Pond Disposal:</span>
                  <span className="text-red-700 font-bold">12,450 t (100%)</span>
                </div>
              </div>
            </div>

            {/* RE:FLOW-X OPTIMIZED REUSE CARD */}
            <div className="industrial-card p-6 space-y-4 border-green-300 bg-gradient-to-br from-green-50/80 via-white to-white shadow-md">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-green-800 uppercase tracking-wider">OPTIMIZED CIRCULAR REUSE</span>
                <span className="text-xs text-green-800 font-bold px-3 py-0.5 rounded-full bg-green-100 border border-green-200">✓ RE:FLOW-X Engine</span>
              </div>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Waste Handled:</span>
                  <span className="text-slate-900 font-bold">12,450 t</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Waste Diverted:</span>
                  <span className="text-green-800 font-extrabold text-sm">9,820 t (78.9%)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Pre-Processing:</span>
                  <span className="text-green-800 font-bold">Rotary Screen / Drying</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500">Transport:</span>
                  <span className="text-green-800 font-bold">Optimized Multi-Modal Logistics</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Residual Ash Pond Disposal:</span>
                  <span className="text-green-800 font-extrabold">2,630 t (-78.9% Reduction)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ENVIRONMENTAL AUDIT RECORD */}
          <div className="industrial-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Environmental & Economic Audit Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified parameters for regulatory and LCA compliance reporting.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowCalculationDrawer(true)}
                  className="industrial-button-secondary"
                >
                  <Info className="w-3.5 h-3.5 text-slate-600" /> View Calculation
                </button>
                <button className="industrial-button-green">
                  <Download className="w-3.5 h-3.5" /> Export Audit Record
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Record Audit ID</span>
                <span className="text-slate-900 font-bold font-mono text-sm">{mockImpactRecord.id}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Optimization Run</span>
                <span className="text-green-800 font-bold font-mono text-sm">{mockImpactRecord.optimizationRunId}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">System Boundary</span>
                <span className="text-slate-800 font-semibold">{mockImpactRecord.systemBoundary}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Emission Factors</span>
                <span className="text-slate-800 font-semibold">{mockImpactRecord.emissionFactorsVersion}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ECONOMIC WATERFALL */}
      {activeTab === 'ECONOMIC' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="industrial-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-800">Economic Waterfall Cost Breakdown</h2>
              <span className="text-xs font-bold text-slate-500">Values in ₹ Lakhs</span>
            </div>

            {/* Waterfall Items Graphic */}
            <div className="space-y-3 text-xs py-2">
              {mockImpactRecord.waterfallData.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-800 font-bold">{item.name}</span>
                  <span className={`font-extrabold ${
                    item.type === 'COST' 
                      ? 'text-slate-700' 
                      : item.type === 'SAVING' 
                      ? 'text-green-800' 
                      : 'text-green-800 text-sm'
                  }`}>
                    {item.value > 0 ? `+₹${item.value} L` : `-₹${Math.abs(item.value)} L`}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-green-50/80 rounded-xl border border-green-200 text-xs font-medium text-slate-800 flex items-center justify-between">
              <span className="text-slate-600 font-bold">Economic Summary:</span>
              <span>Baseline Cost: <strong className="text-slate-900">₹24.50 L</strong> vs Reuse Net Cost: <strong className="text-green-800 font-bold">₹8.42 L</strong> (₹16.08 L Net Savings)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENVIRONMENTAL EMISSIONS */}
      {activeTab === 'ENVIRONMENTAL' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="industrial-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs uppercase text-slate-400 font-bold">Emissions Accounting Equation</span>
              <span className="text-xs text-green-800 font-bold">ΔE = E_reuse − E_baseline</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">E_baseline</span>
                <span className="text-2xl font-bold text-slate-800 block">3,450 tCO₂e</span>
                <span className="text-xs text-slate-500 block">Disposal + Virgin Material Extraction</span>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">E_reuse</span>
                <span className="text-2xl font-bold text-slate-800 block">2,166 tCO₂e</span>
                <span className="text-xs text-slate-500 block">Transport + Pre-Treatment Processing</span>
              </div>

              <div className="p-5 bg-green-50 border border-green-300 rounded-xl space-y-1">
                <span className="text-[10px] text-green-800 uppercase font-bold">Comparative Net Change</span>
                <span className="text-3xl font-extrabold text-green-800 block">-1,284 tCO₂e</span>
                <span className="text-xs text-green-700 font-semibold block font-sans">Net Avoided Footprint</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METHODOLOGY */}
      {activeTab === 'METHODOLOGY' && (
        <div className="industrial-card p-6 space-y-4 text-xs text-slate-700">
          <h2 className="text-base font-bold text-slate-900">Emissions Accounting Methodology & System Boundary</h2>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-sm">Accounting Method & ISO 14040 Principles</h3>
            <p className="leading-relaxed text-slate-600">
              The platform calculates net emissions using physical supply chain tracking and raw material substitution credits.
              Baseline disposal encompasses landfill transport and fugitive ash pond emissions. Optimized reuse accounts for multi-modal haulage, drying/screening energy inputs, and direct clinker displacement credits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Baseline Disposal Boundary</span>
              <span className="text-slate-900 font-bold block text-sm">Landfill Haulage + Virgin Extraction</span>
              <p className="text-slate-500 pt-1">Includes emissions from excavating new virgin aggregates or manufacturing cement clinker.</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Substitution Credit Accounting</span>
              <span className="text-slate-900 font-bold block text-sm">Documented Clinker Substitution Credit</span>
              <p className="text-slate-500 pt-1">Applies 0.82 tCO2e/t credit for every tonne of fly ash replacing conventional cement clinker.</p>
            </div>
          </div>
        </div>
      )}

      {/* CALCULATION DRAWER */}
      {showCalculationDrawer && (
        <div className="fixed inset-y-0 right-0 w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 text-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Formula Breakdown</span>
                <h3 className="text-base font-bold text-slate-900">LCA Accounting Parameters</h3>
              </div>
              <button onClick={() => setShowCalculationDrawer(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Transport Emissions</span>
                <p className="text-slate-800">Qty (9,820 t) × Dist (184 km) × Factor (0.0012) = <strong className="text-slate-900 font-bold">2,166 tCO₂e</strong></p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Baseline Offset Credit</span>
                <p className="text-slate-800">Conventional Clinker Displacement Factor = <strong className="text-slate-900 font-bold">3,450 tCO₂e</strong></p>
              </div>

              <div className="p-4 bg-green-50 border border-green-300 rounded-xl text-green-900 font-bold">
                Comparative ΔE = 2,166 − 3,450 = <strong className="text-green-800 text-sm">-1,284 tCO₂e Net Offset</strong>
              </div>
            </div>
          </div>

          <button onClick={() => setShowCalculationDrawer(false)} className="industrial-button-green w-full justify-center">
            Close Panel
          </button>
        </div>
      )}
    </div>
  );
};
