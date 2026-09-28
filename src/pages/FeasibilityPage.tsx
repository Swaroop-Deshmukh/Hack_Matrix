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
  ChevronRight,
  Check
} from 'lucide-react';

export const FeasibilityPage: React.FC = () => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('FA-001');
  const [selectedPathway, setSelectedPathway] = useState<CandidatePathway | null>(null);

  const selectedMaterial = mockMaterials.find(m => m.id === selectedMaterialId) || mockMaterials[0];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Feasibility Analysis</h1>
          <p className="text-xs text-slate-600 mt-1">
            Evaluate material compatibility against circular reuse pathways, chemical thresholds, and technical standards.
          </p>
        </div>

        {/* Target Material Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Target Material:</span>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-green-800 font-bold focus:outline-none focus:border-green-600 shadow-xs cursor-pointer"
            >
              {mockMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name} ({m.quantity} t)
                </option>
              ))}
            </select>
          </div>

          <button className="industrial-button-green">
            <span>Check Feasibility</span>
          </button>
        </div>
      </div>

      {/* QUICK SUMMARY CARD */}
      <div className="industrial-card p-6 bg-gradient-to-r from-green-50/80 via-white to-white border-green-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400">Target Material Selected</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                {selectedMaterial.id}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{selectedMaterial.name} ({selectedMaterial.quantity.toLocaleString()} {selectedMaterial.unit})</h2>
            <p className="text-xs text-slate-600">Origin: {selectedMaterial.source} — {selectedMaterial.location}</p>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Evidence Completeness</span>
              <span className="text-base font-extrabold text-green-700">{selectedMaterial.evidenceCompleteness}% Verified</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Feasible Pathways</span>
              <span className="text-base font-extrabold text-slate-800">3 of 4 Direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* PATHWAY MATRIX TABLE */}
      <div className="industrial-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Technical Screening Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating chemical properties against ASTM & Indian Standards (IS 3812 compliance).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Rule Standard: IS 3812 / ASTM C618
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">Pathway Application</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Technical Fit</th>
                <th className="py-3 px-3 text-center">Processing Needed</th>
                <th className="py-3 px-3 text-center">Evidence State</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {mockCandidatePathways.map((pw) => (
                <tr 
                  key={pw.id}
                  onClick={() => setSelectedPathway(pw)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-green-50 text-green-700">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <span>{pw.name}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      pw.status === 'DIRECT' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : pw.status === 'PROCESS'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : pw.status === 'UNKNOWN'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {pw.status === 'DIRECT' ? '✓ DIRECT FEASIBLE' : pw.status === 'PROCESS' ? '⚠️ PROCESS REQUIRED' : pw.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {pw.technicalFeasible ? (
                      <span className="inline-flex items-center gap-1 font-bold text-green-700">
                        <Check className="w-4 h-4 text-green-600" /> Suitable
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                        <HelpCircle className="w-4 h-4" /> Unverified
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {pw.processingRequired ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                        Rotary Screening
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {pw.evidenceVerified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-green-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Complete
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                        Assay Missing
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPathway(pw);
                      }}
                      className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center justify-end gap-1"
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

      {/* UNLOCK CARDS FOR PROCESS / MISSING PATHWAYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Near Miss 1 */}
        <div className="industrial-card p-6 border-amber-200 bg-amber-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">What unlocks "Road Sub-base Construction"?</h3>
            </div>
            <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">PROCESS REQUIRED</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            High moisture content (3.4%) exceeds direct dosing limit for sub-base compaction. Vibrating screen drying required.
          </p>

          <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-1 text-xs">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Required Action:</span>
            <span className="text-slate-800 font-semibold">Route material batch to Grinding & Rotary Drying Unit G-01 prior to dispatch.</span>
          </div>

          <button className="industrial-button-secondary w-full justify-center text-amber-900 border-amber-300 hover:bg-amber-100">
            Schedule Processing Unit G-01
          </button>
        </div>

        {/* Near Miss 2 */}
        <div className="industrial-card p-6 border-blue-200 bg-blue-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900">What unlocks "Mine Backfill & Stabilization"?</h3>
            </div>
            <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-2.5 py-0.5 rounded-full">EVIDENCE MISSING</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            TCLP heavy metals leaching assay report absent from current evidence registry.
          </p>

          <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-1 text-xs">
            <span className="text-slate-400 text-[10px] block uppercase font-bold">Required Action:</span>
            <span className="text-slate-800 font-semibold">Upload accredited NABL laboratory TCLP leaching certificate.</span>
          </div>

          <button className="industrial-button-secondary w-full justify-center text-blue-900 border-blue-300 hover:bg-blue-100">
            Upload TCLP Lab Certificate
          </button>
        </div>
      </div>

      {/* RIGHT DRAWER FOR DETAILED PATHWAY PROPERTY CHECKS */}
      {selectedPathway && (
        <div className="fixed inset-y-0 right-0 w-[460px] bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
          <div className="space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block">Pathway Screening</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedPathway.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPathway(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Feasibility Result:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedPathway.status === 'DIRECT' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : selectedPathway.status === 'PROCESS'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {selectedPathway.status === 'DIRECT' ? '✓ DIRECTLY FEASIBLE' : selectedPathway.status}
              </span>
            </div>

            {/* Detailed Property Check Rules */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Property Verification Table
              </h4>

              <div className="space-y-2">
                {selectedPathway.propertyChecks.map((chk, idx) => (
                  <div key={idx} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">{chk.property}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        chk.status === 'PASS' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : chk.status === 'WARNING' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {chk.status === 'PASS' ? '✓ PASS' : chk.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <span>Observed: <strong className="text-slate-900 font-bold">{chk.observed}</strong></span>
                      <span>Required: <strong className="text-slate-700">{chk.requirement}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Audit Confirmation */}
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs font-medium text-green-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Evidence verified against accredited NABL lab certificate.</span>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center space-y-2">
            <p className="italic">
              * Technical screening evaluation in compliance with IS 3812 circular standards.
            </p>
            <button 
              onClick={() => setSelectedPathway(null)}
              className="industrial-button-green w-full justify-center"
            >
              Close Detail Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
