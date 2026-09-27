import React, { useState } from 'react';
import { mockMaterials, mockCandidatePathways } from '../data';
import type { CandidatePathway } from '../types';
import { 
  GitBranch, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  FileCheck2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const FeasibilityPage: React.FC = () => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('FA-001');
  const [selectedPathway, setSelectedPathway] = useState<CandidatePathway | null>(null);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Pathway Feasibility</h1>
          <p className="text-xs text-slate-400 mt-1">
            Technical screening of material against configured pathway requirements and chemical thresholds.
          </p>
        </div>

        {/* Top Material Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target Material:</span>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="bg-[#090b10] border border-slate-800 rounded px-3 py-1.5 text-xs text-teal-400 font-mono focus:outline-none focus:border-teal-500"
            >
              {mockMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name} ({m.quantity} t)
                </option>
              ))}
            </select>
          </div>

          <button className="industrial-button-primary">
            <span>Check Feasibility</span>
          </button>
        </div>
      </div>

      {/* PATHWAY MATRIX TABLE */}
      <div className="industrial-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold font-mono text-slate-200">Configured Technical Pathway Matrix</h2>
            <p className="text-[11px] font-mono text-slate-400">
              Evaluating material chemical properties against ASTM & Indian Standards (IS 3812).
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            Rule Version: 2026.4
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-3">Pathway Application</th>
                <th className="py-3 px-3">Status Badge</th>
                <th className="py-3 px-3 text-center">Technical Fit</th>
                <th className="py-3 px-3 text-center">Processing</th>
                <th className="py-3 px-3 text-center">Evidence</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {mockCandidatePathways.map((pw) => (
                <tr 
                  key={pw.id}
                  onClick={() => setSelectedPathway(pw)}
                  className="hover:bg-[#141924] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3 font-semibold text-slate-100 font-sans flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                    {pw.name}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                      pw.status === 'DIRECT' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : pw.status === 'PROCESS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : pw.status === 'UNKNOWN'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {pw.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {pw.technicalFeasible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-blue-400 mx-auto" />
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono">
                    {pw.processingRequired ? (
                      <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60 text-[10px]">
                        Required
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {pw.evidenceVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/60 text-[10px]">
                        Missing
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPathway(pw);
                      }}
                      className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center justify-end gap-1"
                    >
                      View Checks <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEAR-MISS CARD FOR UNKNOWN OR PROCESS PATHWAYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Near Miss 1 */}
        <div className="industrial-card p-5 border-amber-500/30 bg-[#121017] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono text-amber-300">What would unlock "Road Sub-base"?</h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">PROCESS REQUIRED</span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            High moisture content (3.4%) exceeds direct dosing limit. Mechanical screening required.
          </p>

          <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1 text-xs font-mono">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">Required Action:</span>
            <span className="text-slate-200">Route material to Grinding & Rotary Drying Unit G-01 prior to dispatch.</span>
          </div>

          <button className="industrial-button-secondary w-full justify-center text-amber-300 border-amber-800/60 hover:bg-amber-950/30">
            Schedule Processing Unit G-01
          </button>
        </div>

        {/* Near Miss 2 */}
        <div className="industrial-card p-5 border-blue-500/30 bg-[#0e131e] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold font-mono text-blue-300">What would unlock "Mine Backfill"?</h3>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">EVIDENCE MISSING</span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            TCLP Heavy metals leaching report absent from current evidence registry.
          </p>

          <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1 text-xs font-mono">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">Required Action:</span>
            <span className="text-slate-200">Upload accredited NABL laboratory TCLP leaching certificate.</span>
          </div>

          <button className="industrial-button-secondary w-full justify-center text-blue-300 border-blue-800/60 hover:bg-blue-950/30">
            Upload TCLP Lab Certificate
          </button>
        </div>
      </div>

      {/* RIGHT DRAWER FOR DETAILED PATHWAY PROPERTY CHECKS */}
      {selectedPathway && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0e1118] border-l border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
          <div className="space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Pathway Screening</span>
                <h3 className="text-base font-bold font-mono text-teal-400">{selectedPathway.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPathway(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary */}
            <div className="p-3 bg-[#131722] rounded border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Technical Status:</span>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                selectedPathway.status === 'DIRECT' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : selectedPathway.status === 'PROCESS'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}>
                {selectedPathway.status === 'DIRECT' ? 'DIRECTLY FEASIBLE' : selectedPathway.status}
              </span>
            </div>

            {/* Detailed Property Check Rules */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Configured Technical Rule Verification
              </h4>

              <div className="space-y-2">
                {selectedPathway.propertyChecks.map((chk, idx) => (
                  <div key={idx} className="p-3 bg-[#090b10] rounded border border-slate-800 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{chk.property}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        chk.status === 'PASS' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : chk.status === 'WARNING' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {chk.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Observed: <strong className="text-teal-300">{chk.observed}</strong></span>
                      <span>Rule: <strong className="text-slate-300">{chk.requirement}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Audit Confirmation */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded text-xs font-mono text-emerald-300 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Evidence verified against NABL accredited lab certificate.</span>
            </div>
          </div>

          {/* Legal / Technical Disclaimer at Bottom */}
          <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center space-y-2">
            <p className="italic">
              * Technical screening only. This evaluation does not constitute regulatory environmental certification.
            </p>
            <button 
              onClick={() => setSelectedPathway(null)}
              className="industrial-button-primary w-full justify-center"
            >
              Close Detail Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
