import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'FEASIBILITY' | 'MASS' | 'OPTIMIZATION' | 'ENVIRONMENTAL'>('FEASIBILITY');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" /> Scientific Methodology & Evidence Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Transparent documentation of screening algorithms, mass-balance formulations, and LCA system boundaries.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="flex items-center bg-[#090b10] p-1 rounded border border-slate-800 gap-1 text-xs font-mono">
          {(['FEASIBILITY', 'MASS', 'OPTIMIZATION', 'ENVIRONMENTAL'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded transition-all ${
                activeSection === sec
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: MATERIAL FEASIBILITY */}
      {activeSection === 'FEASIBILITY' && (
        <div className="industrial-card p-6 space-y-6 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100">Technical Property Screening Pipeline</h2>
          </div>

          {/* Visual Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-[#090b10] rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">1. Observed Property</span>
              <span className="text-sm font-bold text-teal-300 mt-1 block">SiO₂ (54.2%)</span>
            </div>

            <div className="p-4 bg-[#090b10] rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">2. Standard Threshold</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">IS 3812 Part 1 (&gt;35.0%)</span>
            </div>

            <div className="p-4 bg-[#090b10] rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase">3. Rule Evaluation</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">Condition Satisfied</span>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded">
              <span className="text-[10px] text-emerald-400 block uppercase">4. Outcome Badge</span>
              <span className="text-sm font-bold text-emerald-300 mt-1 block">PASS (DIRECT)</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MASS BALANCE */}
      {activeSection === 'MASS' && (
        <div className="industrial-card p-6 space-y-6 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100">Mass Balance & Residual Generation Model</h2>
          </div>

          <div className="p-4 bg-[#090b10] rounded border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-2">
              <span>INPUT (1,000 t)</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
              <span>PRE-PROCESSING (90% Yield)</span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
              <span className="text-emerald-400">OUTPUT (900 t) + RESIDUAL (100 t)</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-slate-300 pt-2">
              <p>Formula 1: <strong>Output Mass = Input Mass × Mass Yield Factor</strong></p>
              <p>Formula 2: <strong>Residual Mass = Input Mass − Output Mass</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: OPTIMIZATION */}
      {activeSection === 'OPTIMIZATION' && (
        <div className="industrial-card p-6 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100">Linear Programming Allocation Formulation</h2>
          </div>

          <div className="p-4 bg-[#090b10] rounded border border-slate-800 space-y-2 text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Decision Variable Definition:</span>
            <div className="text-sm font-bold text-teal-400">x_i_j_p_k</div>
            <p className="text-slate-400">
              Where <strong>i</strong> = material source, <strong>j</strong> = sink destination, <strong>p</strong> = candidate pathway, and <strong>k</strong> = pre-processing route.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: ENVIRONMENTAL ACCOUNTING */}
      {activeSection === 'ENVIRONMENTAL' && (
        <div className="industrial-card p-6 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100">Comparative Net Emissions Calculation</h2>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Comparative environmental results depend on the configured baseline, system boundary, emission factors and displacement assumptions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
