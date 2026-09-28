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
  X
} from 'lucide-react';

export const OptimizePage: React.FC = () => {
  const [selectedObjective, setSelectedObjective] = useState<'MINIMUM_COST' | 'MAXIMUM_DIVERSION' | 'MINIMUM_EMISSIONS' | 'BALANCED'>('BALANCED');
  const [selectedConstraintInfo, setSelectedConstraintInfo] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [hasRun, setHasRun] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>('alloc-1');
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
    'Loading Material Passport...',
    'Checking Feasibility...',
    'Generating Candidate Routes...',
    'Applying Constraints...',
    'Calculating Cost...',
    'Calculating Environmental Impact...',
    'Solving Portfolio...'
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Portfolio Optimization</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">
              SOLVER CONFIGURATOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Allocate industrial material across feasible circular pathways while respecting supply, demand, capacity, processing and mass-balance constraints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Optimization Run</span>
            <span className="text-xs font-mono text-teal-400 font-bold">RUN-0042</span>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            READY
          </span>
        </div>
      </div>

      {/* STEP 1 & 2 GRID: PORTFOLIO & DESTINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STEP 1: PORTFOLIO MATERIALS */}
        <div className="industrial-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
              <h2 className="text-sm font-semibold font-mono text-slate-200">Selected Industrial Portfolio</h2>
            </div>
            <button className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" /> Edit Portfolio
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono">
            {materials.map((m) => (
              <div key={m.id} className="p-3 bg-[#090b10] rounded border border-slate-800">
                <span className="text-[10px] text-teal-400 font-bold block">{m.id}</span>
                <span className="text-xs font-medium text-slate-200 block truncate">{m.name}</span>
                <span className="text-sm font-bold text-slate-100 mt-1 block">{m.tonnes.toLocaleString()} t</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 2: DESTINATIONS */}
        <div className="industrial-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
              <h2 className="text-sm font-semibold font-mono text-slate-200">Destination Sinks & Capacity</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">4 Active Sinks</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            {destinations.map((d) => (
              <div key={d.id} className="p-3 bg-[#090b10] rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{d.name}</span>
                  <span className="text-[10px] text-slate-500 block">Cap: {d.capacity}</span>
                </div>
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 3: OBJECTIVE SELECTOR */}
      <div className="industrial-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
            <h2 className="text-sm font-semibold font-mono text-slate-200">Select Optimization Objective</h2>
          </div>
          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            Multi-Objective Linear Solver
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              onClick={() => setSelectedObjective(obj.id as any)}
              className={`p-4 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                selectedObjective === obj.id
                  ? 'bg-[#151a26] border-teal-500/80 shadow-lg shadow-teal-950/20'
                  : 'bg-[#090b10] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-200">{obj.name}</span>
                  {selectedObjective === obj.id && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  {obj.desc}
                </p>
              </div>

              {selectedObjective === obj.id && (
                <span className="mt-3 text-[9px] font-mono text-teal-400 uppercase font-semibold block">
                  Active Objective
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 4: CONSTRAINTS & RUN BUTTON */}
      <div className="industrial-card p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">4</span>
            <h2 className="text-sm font-semibold font-mono text-slate-200">Configured System Constraints</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Click constraint chip to view details</span>
        </div>

        {/* Constraint Chips */}
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {constraints.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedConstraintInfo(c.explanation)}
              className="px-3 py-1.5 rounded bg-[#090b10] border border-slate-800 text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Constraint Explanation Alert */}
        {selectedConstraintInfo && (
          <div className="p-3 bg-[#131722] border border-teal-500/30 rounded text-xs font-mono text-teal-300 flex items-center justify-between">
            <span>{selectedConstraintInfo}</span>
            <button onClick={() => setSelectedConstraintInfo(null)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Run Button Area */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Engine: <strong className="text-slate-200">Google OR-Tools CP-SAT Architecture</strong>
          </div>

          <button
            onClick={handleRunOptimization}
            disabled={isSimulating}
            className="industrial-button-primary px-6 py-2.5 text-sm"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RUN OPTIMIZATION</span>
          </button>
        </div>
      </div>

      {/* ASYNC SIMULATION LOADING MODAL */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="industrial-card p-6 w-full max-w-md space-y-4 shadow-2xl border border-teal-500/40">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100">Simulating LP Solver Execution</h3>
                <span className="text-[10px] font-mono text-amber-400">Prototype simulation</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-xs pt-2">
              {simulationStepsList.map((stepText, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={idx <= simulationStep ? 'text-slate-200' : 'text-slate-600'}>
                    {stepText}
                  </span>
                  {idx < simulationStep && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {idx === simulationStep && <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />}
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
          <div className="industrial-card p-4 border-emerald-500/40 bg-[#0d1617] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold font-mono text-emerald-300">OPTIMAL SOLUTION FOUND</h2>
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Prototype simulation
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Solved in <strong>1.82 sec</strong> using CP-SAT Presolve + Simplex Duality.
                </p>
              </div>
            </div>
          </div>

          {/* Results Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono">
            <div className="industrial-card p-4">
              <span className="text-[10px] text-slate-500 uppercase block">Total Input</span>
              <span className="text-xl font-bold text-slate-100">12,450 t</span>
            </div>

            <div className="industrial-card p-4 border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase block">Reused Tonnage</span>
              <span className="text-xl font-bold text-emerald-300">9,820 t</span>
            </div>

            <div className="industrial-card p-4">
              <span className="text-[10px] text-slate-500 uppercase block">Disposal / Storage</span>
              <span className="text-xl font-bold text-slate-400">2,630 t</span>
            </div>

            <div className="industrial-card p-4">
              <span className="text-[10px] text-slate-500 uppercase block">Net Cost</span>
              <span className="text-xl font-bold text-slate-100">₹8.42 L</span>
            </div>

            <div className="industrial-card p-4 border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase block">Comparative ΔCO₂e</span>
              <span className="text-xl font-bold text-emerald-400">-1,284 tCO₂e</span>
            </div>
          </div>

          {/* ALLOCATION TABLE */}
          <div className="industrial-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold font-mono text-slate-200">Optimized Material Allocations</h3>
              <span className="text-[10px] font-mono text-teal-400">Click row to expand details</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Pathway</th>
                    <th className="py-2.5 px-3">Processing</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Net Cost</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {mockAllocations.map((alloc) => {
                    const isExpanded = expandedRowId === alloc.id;
                    return (
                      <React.Fragment key={alloc.id}>
                        <tr
                          onClick={() => setExpandedRowId(isExpanded ? null : alloc.id)}
                          className="hover:bg-[#141924] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-bold text-teal-400">{alloc.sourceId}</td>
                          <td className="py-3 px-3 font-semibold text-slate-100">{alloc.destinationName}</td>
                          <td className="py-3 px-3 text-slate-300">{alloc.pathwayName}</td>
                          <td className="py-3 px-3 text-slate-400">{alloc.processingFacility}</td>
                          <td className="py-3 px-3 font-bold text-slate-100">{alloc.quantityTonnes.toLocaleString()} t</td>
                          <td className="py-3 px-3 text-slate-200">₹{alloc.netCostLakhs} L</td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {alloc.status}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Row Detail */}
                        {isExpanded && (
                          <tr className="bg-[#090b10] border-b border-slate-800">
                            <td colSpan={7} className="p-4 space-y-2">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase block">Transport Freight</span>
                                  <span className="text-slate-200 font-bold">₹{alloc.transportCostLakhs} L</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase block">Pre-Processing Cost</span>
                                  <span className="text-slate-200 font-bold">₹{alloc.processingCostLakhs} L</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase block">Residual Generation</span>
                                  <span className="text-slate-400">{alloc.residualTonnes} t</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-slate-500 uppercase block">Technical Status</span>
                                  <span className="text-emerald-400 font-semibold">{alloc.technicalStatus}</span>
                                </div>
                              </div>
                              <div className="pt-2 text-[11px] font-mono text-slate-400">
                                <strong>Decision Reason:</strong> {alloc.decisionReason}
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
          <div className="industrial-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold font-mono text-slate-200">Portfolio Flow Optimization Sankey</h3>
              <span className="text-[10px] font-mono text-teal-400">Click flow for allocation drawer</span>
            </div>

            <div className="space-y-3 py-2">
              {mockAllocations.map((alloc) => (
                <div
                  key={alloc.id}
                  onClick={() => setSelectedSankeyFlow(alloc)}
                  className="p-3 bg-[#0d1017] rounded border border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-400">{alloc.sourceName}</span>
                  </div>

                  <div className="flex-1 flex items-center gap-2 px-4">
                    <div className="h-px flex-1 bg-teal-500/40 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 border border-slate-800 text-[10px] text-teal-300">
                        {alloc.pathwayName} ({alloc.processingFacility})
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">{alloc.destinationName}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-teal-500/30 text-teal-400 font-bold">
                      {alloc.quantityTonnes.toLocaleString()} t
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
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0e1118] border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase text-slate-500">Allocation Telemetry</span>
                <h3 className="text-sm font-bold text-teal-400">{selectedSankeyFlow.pathwayName}</h3>
              </div>
              <button onClick={() => setSelectedSankeyFlow(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 p-3 bg-[#131722] rounded border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Source:</span>
                <span className="text-slate-200 font-bold">{selectedSankeyFlow.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="text-slate-200 font-bold">{selectedSankeyFlow.destinationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Allocated Tonnage:</span>
                <span className="text-teal-400 font-bold">{selectedSankeyFlow.quantityTonnes.toLocaleString()} t</span>
              </div>
            </div>
          </div>

          <button onClick={() => setSelectedSankeyFlow(null)} className="industrial-button-primary w-full justify-center">
            Close Allocation Drawer
          </button>
        </div>
      )}
    </div>
  );
};
