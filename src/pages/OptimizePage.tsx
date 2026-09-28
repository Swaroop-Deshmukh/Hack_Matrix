import React, { useState } from 'react';
import { mockAllocations } from '../data';
import type { Allocation } from '../types';
import { 
  Play, 
  CheckCircle2, 
  Edit3, 
  Building2, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  X,
  Check
} from 'lucide-react';

export const OptimizePage: React.FC = () => {
  const [selectedObjective, setSelectedObjective] = useState<'MINIMUM_COST' | 'MAXIMUM_DIVERSION' | 'MINIMUM_EMISSIONS' | 'BALANCED'>('BALANCED');
  const [selectedConstraintInfo, setSelectedConstraintInfo] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>('al-1');
  const [selectedSankeyFlow, setSelectedSankeyFlow] = useState<Allocation | null>(null);

  const materials = [
    { id: 'FA-001', name: 'Fly Ash', tonnes: 5000 },
    { id: 'SL-002', name: 'Blast Furnace Slag', tonnes: 3200 },
    { id: 'MW-003', name: 'Mine Waste', tonnes: 4250 }
  ];

  const destinations = [
    { id: 'C-01', name: 'Cement Plant C-01', capacity: '6,000 t' },
    { id: 'B-01', name: 'Block Plant B-01', capacity: '3,000 t' },
    { id: 'R-01', name: 'Road Project R-01', capacity: '4,000 t' },
    { id: 'M-01', name: 'Mine Fill M-01', capacity: '3,500 t' }
  ];

  const objectives = [
    { id: 'MINIMUM_COST', name: 'MINIMUM COST', desc: 'Prioritize net economic savings and transport distance minimization.' },
    { id: 'MAXIMUM_DIVERSION', name: 'MAXIMUM DIVERSION', desc: 'Maximize tonnage redirected from landfill regardless of unit freight.' },
    { id: 'MINIMUM_EMISSIONS', name: 'MINIMUM COMPARATIVE EMISSIONS', desc: 'Minimize net CO2e footprint across transport and pre-treatment.' },
    { id: 'BALANCED', name: 'BALANCED CIRCULAR DECISION', desc: 'Optimal multi-objective compromise weighting cost, diversion & emissions.' }
  ];

  const constraints = [
    { name: 'Supply', explanation: 'Total material allocated cannot exceed source production inventory.' },
    { name: 'Demand', explanation: 'Sink allocation capped by receiving facility manufacturing intake limit.' },
    { name: 'Destination Capacity', explanation: 'Silo and storage hopper mechanical throughput limits enforced.' },
    { name: 'Processing Capacity', explanation: 'Grinding, drying and screening unit daily capacity bounds.' },
    { name: 'Technical Feasibility', explanation: 'Only chemical & physical IS 3812 verified pathways included.' },
    { name: 'Mass Balance', explanation: 'Input mass = Output yield + Residual mass balance enforced.' },
    { name: 'Residual Handling', explanation: 'Secondary processing waste routed to regulated ash pond storage.' },
    { name: 'Disposal Option', explanation: 'Fallback safety disposal route available at penalizing cost factor.' }
  ];

  const simulationStepsList = [
    'Loading Material Passport Registry...',
    'Checking Feasibility Rule Matrix...',
    'Generating Candidate Transport Routes...',
    'Applying Supply & Capacity Constraints...',
    'Calculating Net Economic Costs...',
    'Calculating Comparative Emissions...',
    'Solving CP-SAT Portfolio Objective...'
  ];

  const handleRunOptimization = () => {
    setIsSimulating(true);
    setSimulationStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < simulationStepsList.length) {
        setSimulationStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setHasRun(true);
      }
    }, 450);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Optimize Material Allocation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
              OR-Tools CP-SAT Solver
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Configure multi-objective solver to balance cost, tonnage diversion, and environmental emissions across destinations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Solver Instance</span>
            <span className="text-xs font-mono font-bold text-green-800">CP-SAT-RUN-2026</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            CONFIGURED
          </span>
        </div>
      </div>

      {/* STEP 1 & 2 GRID: PORTFOLIO & DESTINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STEP 1: PORTFOLIO MATERIALS */}
        <div className="industrial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center">1</span>
              <h2 className="text-base font-bold text-slate-800">Selected Industrial Materials</h2>
            </div>
            <button className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Edit Streams
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {materials.map((m) => (
              <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-green-700 block font-mono">{m.id}</span>
                <span className="text-xs font-bold text-slate-800 block truncate">{m.name}</span>
                <span className="text-sm font-extrabold text-slate-900 block">{m.tonnes.toLocaleString()} t</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 2: DESTINATIONS */}
        <div className="industrial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-slate-800">Destination Sinks & Capacity</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">4 Active Sinks</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {destinations.map((d) => (
              <div key={d.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{d.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">Cap: {d.capacity}</span>
                </div>
                <div className="p-2 bg-white rounded-lg text-slate-500 border border-slate-200">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 3: OBJECTIVE SELECTOR */}
      <div className="industrial-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center">3</span>
            <h2 className="text-base font-bold text-slate-800">Optimization Objective Weights</h2>
          </div>
          <span className="text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-200">
            Multi-Objective CP-SAT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              onClick={() => setSelectedObjective(obj.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                selectedObjective === obj.id
                  ? 'bg-green-50/90 border-green-500 shadow-md ring-2 ring-green-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{obj.name}</span>
                  {selectedObjective === obj.id && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {obj.desc}
                </p>
              </div>

              {selectedObjective === obj.id && (
                <span className="mt-3 text-[10px] font-bold text-green-800 uppercase block">
                  ✓ Active Objective
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 4: CONSTRAINTS & RUN BUTTON */}
      <div className="industrial-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 font-bold text-xs flex items-center justify-center">4</span>
            <h2 className="text-base font-bold text-slate-800">System Boundaries & Constraints</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Click constraint to view mathematical bounds</span>
        </div>

        {/* Constraint Chips */}
        <div className="flex flex-wrap gap-2 text-xs">
          {constraints.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedConstraintInfo(c.explanation)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:border-green-500 hover:text-green-900 transition-all flex items-center gap-1.5 font-medium cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Constraint Explanation Alert */}
        {selectedConstraintInfo && (
          <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs font-medium text-green-900 flex items-center justify-between shadow-xs">
            <span>{selectedConstraintInfo}</span>
            <button onClick={() => setSelectedConstraintInfo(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Run Button Area */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Engine Architecture: <strong className="text-slate-800">Google OR-Tools CP-SAT Linear Program</strong>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={isSimulating}
            className="industrial-button-primary px-8 py-3 text-sm"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>RUN OPTIMIZATION</span>
          </button>
        </div>
      </div>

      {/* ASYNC SIMULATION LOADING MODAL */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-green-600 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Solving CP-SAT Optimization</h3>
                <span className="text-xs font-medium text-slate-500">Evaluating multi-objective bounds...</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              {simulationStepsList.map((stepText, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                  <span className={idx <= simulationStep ? 'text-slate-900 font-semibold' : 'text-slate-400'}>
                    {stepText}
                  </span>
                  {idx < simulationStep && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {idx === simulationStep && <RefreshCw className="w-3.5 h-3.5 text-green-600 animate-spin" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRAMATIC OPTIMIZATION RESULT AREA */}
      {hasRun && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Optimal Solution Banner */}
          <div className="industrial-card p-5 border-green-300 bg-gradient-to-r from-green-100/70 via-white to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-green-900">OPTIMAL ALLOCATION SOLVED</h2>
                  <span className="text-[10px] font-bold bg-green-200 text-green-900 px-2.5 py-0.5 rounded-full">
                    CP-SAT SOLVED
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Solved in <strong>0.34 sec</strong> with 100% constraint satisfaction & mass balance.
                </p>
              </div>
            </div>
          </div>

          {/* Results Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="industrial-card p-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Input Waste</span>
              <span className="text-2xl font-extrabold text-slate-900">12,450 t</span>
            </div>

            <div className="industrial-card p-5 border-green-200 bg-green-50/40">
              <span className="text-[10px] text-green-800 font-bold uppercase block">Reused Tonnage</span>
              <span className="text-2xl font-extrabold text-green-800">9,820 t</span>
            </div>

            <div className="industrial-card p-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Disposal / Residual</span>
              <span className="text-2xl font-extrabold text-slate-700">2,630 t</span>
            </div>

            <div className="industrial-card p-5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Optimized Net Cost</span>
              <span className="text-2xl font-extrabold text-slate-900">₹8.42 L</span>
            </div>

            <div className="industrial-card p-5 border-green-200 bg-green-50/40">
              <span className="text-[10px] text-green-800 font-bold uppercase block">Comparative ΔCO₂e</span>
              <span className="text-2xl font-extrabold text-green-800">-1,284 tCO₂e</span>
            </div>
          </div>

          {/* ALLOCATION TABLE */}
          <div className="industrial-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-800">Optimized Material Allocation Summary</h3>
              <span className="text-xs font-bold text-green-700">Click row to expand breakdown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-3">Source ID</th>
                    <th className="py-3 px-3">Destination Sink</th>
                    <th className="py-3 px-3">Pathway</th>
                    <th className="py-3 px-3">Pre-Processing</th>
                    <th className="py-3 px-3">Allocated Qty</th>
                    <th className="py-3 px-3">Net Cost</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {mockAllocations.map((alloc) => {
                    const isExpanded = expandedRowId === alloc.id;
                    return (
                      <React.Fragment key={alloc.id}>
                        <tr
                          onClick={() => setExpandedRowId(isExpanded ? null : alloc.id)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-3 font-bold text-green-700 font-mono">{alloc.materialId}</td>
                          <td className="py-3.5 px-3 font-bold text-slate-900">{alloc.destination || alloc.destinationName}</td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">{alloc.pathway || alloc.pathwayName}</td>
                          <td className="py-3.5 px-3 text-slate-500">{alloc.processingFacility || 'Direct'}</td>
                          <td className="py-3.5 px-3 font-extrabold text-slate-900">{(alloc.quantityTonnes ?? alloc.quantity ?? 0).toLocaleString()} t</td>
                          <td className="py-3.5 px-3 font-bold text-slate-900">₹{alloc.netCostLakhs ?? alloc.totalCost} L</td>
                          <td className="py-3.5 px-3 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                              OPTIMAL
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Row Detail */}
                        {isExpanded && (
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <td colSpan={7} className="p-4 space-y-2">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport Freight</span>
                                  <span className="text-slate-900 font-bold">₹{alloc.transportCostLakhs ?? 2.8} L</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pre-Processing Cost</span>
                                  <span className="text-slate-900 font-bold">₹{alloc.processingCostLakhs ?? 0.8} L</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Residual Generation</span>
                                  <span className="text-slate-600 font-semibold">{alloc.residualTonnes ?? 0} t</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Technical Status</span>
                                  <span className="text-green-800 font-bold">{alloc.technicalStatus ?? 'Feasible'}</span>
                                </div>
                              </div>
                              <div className="pt-2 text-xs text-slate-600">
                                <strong>Decision Reason:</strong> {alloc.decisionReason || 'Optimal transport corridor cost & chemical compatibility'}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* OPTIMIZATION SANKEY VISUALIZATION */}
          <div className="industrial-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-800">Portfolio Flow Optimization Sankey</h3>
              <span className="text-xs font-bold text-green-700">Click flow for allocation details</span>
            </div>

            <div className="space-y-3 py-2">
              {mockAllocations.map((alloc) => (
                <div
                  key={alloc.id}
                  onClick={() => setSelectedSankeyFlow(alloc)}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-green-500 cursor-pointer transition-all flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-800">{alloc.materialName}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-2 px-4">
                    <div className="h-0.5 flex-1 bg-green-400 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-0.5 border border-slate-200 text-[10px] font-bold text-green-800 rounded-full shadow-xs">
                        {alloc.pathway || alloc.pathwayName}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-600 shrink-0" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{alloc.destination || alloc.destinationName}</span>
                    <span className="px-3 py-1 rounded-lg bg-green-100 border border-green-300 text-green-900 font-extrabold">
                      {(alloc.quantityTonnes ?? alloc.quantity ?? 0).toLocaleString()} t
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALLOCATION DETAIL DRAWER */}
      {selectedSankeyFlow && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Allocation Details</span>
                <h3 className="text-base font-bold text-slate-900">{selectedSankeyFlow.pathway || selectedSankeyFlow.pathwayName}</h3>
              </div>
              <button onClick={() => setSelectedSankeyFlow(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Material Stream:</span>
                <span className="text-slate-900 font-bold">{selectedSankeyFlow.materialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="text-slate-900 font-bold">{selectedSankeyFlow.destination || selectedSankeyFlow.destinationName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Allocated Tonnage:</span>
                <span className="text-green-800 font-extrabold">{(selectedSankeyFlow.quantityTonnes ?? selectedSankeyFlow.quantity ?? 0).toLocaleString()} tonnes</span>
              </div>
            </div>
          </div>

          <button onClick={() => setSelectedSankeyFlow(null)} className="industrial-button-green w-full justify-center">
            Close Allocation Panel
          </button>
        </div>
      )}
    </div>
  );
};
