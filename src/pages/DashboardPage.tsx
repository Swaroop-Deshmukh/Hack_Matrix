import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockMetricSummary, mockMaterialFlows, mockMaterials, mockBottlenecks } from '../data';
import { SankeyFlow } from '../components/SankeyFlow';
import type { MaterialFlowItem, Bottleneck } from '../types';
import { 
  Plus, 
  Play, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight, 
  Layers, 
  TrendingDown,
  X,
  FileCheck2,
  Truck,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFlow, setSelectedFlow] = useState<MaterialFlowItem | null>(null);
  const [selectedBottleneck, setSelectedBottleneck] = useState<Bottleneck | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Portfolio Overview</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Current industrial material flows and circular utilization status across 4 regional clusters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Last Optimized</span>
            <span className="text-xs font-mono text-slate-300 font-semibold">{mockMetricSummary.lastOptimizedTime}</span>
          </div>

          <button 
            onClick={() => navigate('/materials')}
            className="industrial-button-secondary"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>+ Add Material</span>
          </button>

          <button 
            onClick={() => {
              const evt = new CustomEvent('trigger-opt');
              window.dispatchEvent(evt);
            }}
            className="industrial-button-primary"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Run Optimization</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Material */}
        <div className="industrial-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Total Material</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {mockMetricSummary.totalMaterialTonnes.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-slate-400">t</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Across 5 active industrial waste streams
          </div>
        </div>

        {/* KPI 2: Diverted Material */}
        <div className="industrial-card p-4 space-y-2 border-teal-500/30 bg-[#111622]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-teal-400 font-medium tracking-wider">Diverted Waste</span>
            <CheckCircle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {mockMetricSummary.divertedTonnes.toLocaleString()} <span className="text-xs font-mono">t</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {mockMetricSummary.divertedPercentage}%
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Redirected from landfill / ash ponds
          </div>
        </div>

        {/* KPI 3: Net Cost */}
        <div className="industrial-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Net Cost</span>
            <span className="text-xs font-mono text-slate-500">₹ Lakhs</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-100">
              ₹{mockMetricSummary.netCostLakhs}
            </span>
            <span className="text-xs font-mono text-slate-400">L</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            14.2% lower than traditional disposal
          </div>
        </div>

        {/* KPI 4: Comparative ΔCO₂e */}
        <div className="industrial-card p-4 space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Comparative ΔCO₂e</span>
              <div 
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-3.5 h-3.5 text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2 bg-[#181d28] border border-slate-700 text-[10px] text-slate-300 rounded shadow-xl z-50 font-sans leading-relaxed">
                    Modeled net emissions reduction compared to virgin material extraction and standard disposal pathways.
                  </div>
                )}
              </div>
            </div>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {mockMetricSummary.comparativeEmissionsDeltaTonnes.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-emerald-300">tCO₂e</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Calculated via LCA Module v2.1
          </div>
        </div>
      </div>

      {/* Main Flow Section (Sankey Diagram) */}
      <div className="industrial-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold font-mono text-slate-200">Portfolio Material Flow</h2>
            <p className="text-[11px] text-slate-400">
              Interactive waste-to-sink mapping. Click any flow node to view detailed optimization stats.
            </p>
          </div>
          <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20">
            4 Active Pathways
          </span>
        </div>

        <SankeyFlow 
          flows={mockMaterialFlows} 
          onSelectFlow={(flow) => setSelectedFlow(flow)}
          selectedFlowId={selectedFlow?.id}
        />
      </div>

      {/* Grid Row: Bottom Left Table & Bottom Right Bottlenecks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bottom Left: Material Portfolio Table (7 Cols) */}
        <div className="lg:col-span-7 industrial-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-semibold font-mono text-slate-200">Material Portfolio</h2>
            <button 
              onClick={() => navigate('/materials')}
              className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Material</th>
                  <th className="py-2 px-2">Quantity</th>
                  <th className="py-2 px-2">Location</th>
                  <th className="py-2 px-2">Evidence</th>
                  <th className="py-2 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {mockMaterials.slice(0, 4).map((mat) => (
                  <tr 
                    key={mat.id}
                    onClick={() => navigate(`/materials/${mat.id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 font-semibold text-teal-400">{mat.id}</td>
                    <td className="py-2.5 px-2 text-slate-200 font-sans font-medium">{mat.name}</td>
                    <td className="py-2.5 px-2">{mat.quantity.toLocaleString()} {mat.unit}</td>
                    <td className="py-2.5 px-2 text-slate-400">{mat.location}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-900 rounded-full h-1.5 border border-slate-800">
                          <div 
                            className={`h-full rounded-full ${
                              mat.evidenceCompleteness > 90 ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${mat.evidenceCompleteness}%` }}
                          />
                        </div>
                        <span className="text-[10px]">{mat.evidenceCompleteness}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        mat.status === 'READY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {mat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Right: Current Bottlenecks (5 Cols) */}
        <div className="lg:col-span-5 industrial-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-semibold font-mono text-slate-200">Current Bottlenecks</h2>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Attention Needed
            </span>
          </div>

          <div className="space-y-3">
            {mockBottlenecks.map((btn) => (
              <div
                key={btn.id}
                onClick={() => setSelectedBottleneck(btn)}
                className={`p-3 rounded border transition-all cursor-pointer ${
                  btn.status === 'critical'
                    ? 'bg-red-950/20 border-red-800/60 hover:border-red-600/80'
                    : btn.status === 'warning'
                    ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600/80'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-3.5 h-3.5 ${
                      btn.status === 'critical' ? 'text-red-400' : btn.status === 'warning' ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                    <span className="text-xs font-semibold font-mono text-slate-200">{btn.title}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {btn.facility}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Capacity Utilization</span>
                  <span className={`font-bold ${btn.utilization > 90 ? 'text-red-400' : 'text-amber-400'}`}>
                    {btn.utilization}%
                  </span>
                </div>

                <div className="mt-1.5 w-full bg-slate-900 rounded-full h-1.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${
                      btn.utilization > 90 ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${btn.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Drawer / Detail Panel for Selected Flow */}
      {selectedFlow && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0e1118] border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Flow Details</span>
                <h3 className="text-sm font-bold font-mono text-teal-400">{selectedFlow.pathway}</h3>
              </div>
              <button 
                onClick={() => setSelectedFlow(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#131722] rounded border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Source:</span>
                  <span className="text-slate-200 font-medium">{selectedFlow.sourceMaterial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="text-slate-200 font-medium">{selectedFlow.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Quantity:</span>
                  <span className="text-teal-400 font-bold">{selectedFlow.tonnes.toLocaleString()} tonnes</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block">Feasibility & Logistics</span>
                <div className="flex items-center justify-between text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Chemical Compatibility
                  </span>
                  <span className="text-emerald-400 font-semibold">PASSED</span>
                </div>
                <div className="flex items-center justify-between text-[11px] p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-teal-400" /> Transport Corridor
                  </span>
                  <span className="text-teal-400 font-semibold">184 km (Optimal)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button 
              onClick={() => navigate('/feasibility')}
              className="w-full industrial-button-primary"
            >
              Verify Feasibility Rules
            </button>
          </div>
        </div>
      )}

      {/* Bottleneck Modal */}
      {selectedBottleneck && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="industrial-card p-6 w-full max-w-md space-y-4 shadow-2xl border border-amber-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100">{selectedBottleneck.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedBottleneck(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#131722] rounded border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Impacted Facility</span>
                <span className="text-sm font-bold text-slate-200">{selectedBottleneck.facility}</span>
                <p className="text-slate-400 text-[11px] pt-2">{selectedBottleneck.description}</p>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400">Utilization Rate:</span>
                <span className="text-amber-400 font-bold text-sm">{selectedBottleneck.utilization}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedBottleneck(null)}
                className="industrial-button-secondary"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedBottleneck(null);
                  navigate('/network');
                }}
                className="industrial-button-primary"
              >
                Inspect Network
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
