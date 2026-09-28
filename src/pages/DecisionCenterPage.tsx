import React, { useState } from 'react';
import { mockDecisionActions, mockAlternativeDecisions, mockUnlockRequirements } from '../data';
import type { DecisionAction } from '../types';
import { 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Lock, 
  Info
} from 'lucide-react';

export const DecisionCenterPage: React.FC = () => {
  const [selectedActionForWhy, setSelectedActionForWhy] = useState<DecisionAction | null>(null);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Executive Decision Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Translate the optimized portfolio into operational dispatch actions and inspect model rationale.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">RUN-0042 Status:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            ✓ FEASIBLE & OPTIMIZED
          </span>
        </div>
      </div>

      {/* RECOMMENDED ALLOCATION ACTION CARDS */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold font-mono text-slate-200">Recommended Dispatch Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockDecisionActions.map((act) => (
            <div key={act.id} className="industrial-card p-5 space-y-4 border-teal-500/30 bg-[#10141e] flex flex-col justify-between">
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-teal-400 font-bold uppercase">{act.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {act.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100">{act.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                    <span>{act.sourceMaterial}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                    <span>{act.destinationFacility}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#090b10] rounded border border-slate-800 text-xs">
                  <span className="text-slate-400">Allocated Volume:</span>
                  <span className="text-teal-400 font-bold">{act.tonnes.toLocaleString()} tonnes</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                <button
                  onClick={() => setSelectedActionForWhy(act)}
                  className="industrial-button-secondary text-teal-400 border-teal-500/30"
                >
                  <Info className="w-3.5 h-3.5" /> View Why Selected
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY NOT PANEL — REJECTED ALTERNATIVES */}
      <div className="industrial-card p-5 space-y-4 font-mono text-xs">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-slate-200">Alternative Route Rationale (Why Not Selected)</h2>
          <p className="text-[11px] text-slate-400">
            Routes evaluated by the solver but rejected due to mathematical constraint bounds.
          </p>
        </div>

        <div className="space-y-3">
          {mockAlternativeDecisions.map((alt) => (
            <div key={alt.id} className="p-3 bg-[#090b10] rounded border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">{alt.route}</span>
                <span className="text-[11px] text-amber-400 block pt-0.5">⚠ {alt.rejectReason}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] uppercase font-bold shrink-0">
                NOT SELECTED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT WOULD UNLOCK BLOCKED PATHWAYS */}
      <div className="industrial-card p-5 space-y-4 font-mono text-xs border-amber-500/30 bg-[#131018]">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-amber-300">Actionable Bottleneck Unlocks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUnlockRequirements.map((unl) => (
            <div key={unl.id} className="p-3.5 bg-[#090b10] rounded border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span>{unl.route}</span>
                <Lock className="w-3.5 h-3.5" />
              </div>
              <p className="text-slate-400 text-[11px]">Reason: {unl.reasonText}</p>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200 flex items-center justify-between text-[11px]">
                <span>{unl.unlockActionText}</span>
                <button className="industrial-button-secondary py-1 text-[10px]">Execute</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY PANEL DRAWER */}
      {selectedActionForWhy && (
        <div className="fixed inset-y-0 right-0 w-[480px] bg-[#0e1118] border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 font-mono text-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Decision Rationale Audit</span>
                <h3 className="text-sm font-bold text-teal-400">{selectedActionForWhy.title}</h3>
              </div>
              <button onClick={() => setSelectedActionForWhy(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categories Breakdown */}
            <div className="space-y-4">
              {/* Category 1: Technical */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-teal-400 font-bold block">TECHNICAL VERIFICATION</span>
                <div className="space-y-1">
                  {selectedActionForWhy.whyFeasible.map((w, i) => (
                    <div key={i} className="p-2 bg-[#090b10] rounded border border-slate-800 text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Capacity */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-teal-400 font-bold block">CAPACITY VERIFICATION</span>
                <div className="space-y-1">
                  {selectedActionForWhy.whyCapacity.map((w, i) => (
                    <div key={i} className="p-2 bg-[#090b10] rounded border border-slate-800 text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 3: Portfolio */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase text-teal-400 font-bold block">PORTFOLIO MODEL RATIONALE</span>
                <div className="space-y-1">
                  {selectedActionForWhy.whyPortfolio.map((w, i) => (
                    <div key={i} className="p-2 bg-[#090b10] rounded border border-slate-800 text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#131722] rounded border border-slate-800 text-[11px] text-slate-400 italic">
              "Selected by the portfolio optimization model under the current mathematical constraints."
            </div>
          </div>

          <button onClick={() => setSelectedActionForWhy(null)} className="industrial-button-primary w-full justify-center">
            Close Rationale Drawer
          </button>
        </div>
      )}
    </div>
  );
};
