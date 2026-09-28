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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Portfolio Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
              Active Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Monitor industrial material flows, reuse opportunities and circular resource allocation across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Last Optimized</span>
            <span className="text-xs font-sans text-slate-700 font-semibold">{mockMetricSummary.lastOptimizedTime}</span>
          </div>

          <button 
            onClick={() => navigate('/materials')}
            className="industrial-button-secondary"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>+ Add Material</span>
          </button>

          <button 
            onClick={() => {
              const evt = new CustomEvent('trigger-opt');
              window.dispatchEvent(evt);
            }}
            className="industrial-button-primary"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Optimization</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Material */}
        <div className="industrial-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Material</span>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {mockMetricSummary.totalMaterialTonnes.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">t</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Across 5 active industrial waste streams
          </div>
        </div>

        {/* KPI 2: Diverted Material */}
        <div className="industrial-card p-5 space-y-2 border-green-500/30 bg-green-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-green-800 tracking-wider">Diverted Waste</span>
            <div className="p-2 bg-green-100 rounded-lg text-green-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-green-800">
              {mockMetricSummary.divertedTonnes.toLocaleString()} <span className="text-sm font-semibold text-green-700">t</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-900 border border-green-300">
              {mockMetricSummary.divertedPercentage}%
            </span>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Redirected from landfill / disposal
          </div>
        </div>

        {/* KPI 3: Net Cost */}
        <div className="industrial-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Net Cost</span>
            <span className="text-xs font-bold text-slate-400">₹ Lakhs</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{mockMetricSummary.netCostLakhs}
            </span>
            <span className="text-sm font-semibold text-slate-500">L</span>
          </div>
          <div className="text-xs font-semibold text-green-700 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-green-600" />
            14.2% lower than baseline disposal
          </div>
        </div>

        {/* KPI 4: Comparative ΔCO₂e */}
        <div className="industrial-card p-5 space-y-2 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Comparative ΔCO₂e</span>
              <div 
                className="relative inline-block"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 font-sans leading-relaxed">
                    Modeled net emissions reduction compared to virgin material extraction and standard disposal pathways.
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-green-700">
              {mockMetricSummary.comparativeEmissionsDeltaTonnes.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-green-600">tCO₂e</span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Calculated via LCA Accounting Engine
          </div>
        </div>
      </div>

      {/* Main Flow Section (Clean Industrial Sankey Diagram) */}
      <div className="industrial-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Portfolio Material Flow</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive waste-to-sink mapping. Click any flow node to view detailed optimization stats.
            </p>
          </div>
          <span className="text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full border border-green-200">
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
        <div className="lg:col-span-7 industrial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-base font-bold text-slate-800">Material Portfolio</h2>
            <button 
              onClick={() => navigate('/materials')}
              className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Evidence</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {mockMaterials.slice(0, 4).map((mat) => (
                  <tr 
                    key={mat.id}
                    onClick={() => navigate(`/materials/${mat.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-green-700 font-mono">{mat.id}</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">{mat.name}</td>
                    <td className="py-3 px-3 font-semibold">{mat.quantity.toLocaleString()} {mat.unit}</td>
                    <td className="py-3 px-3 text-slate-500">{mat.location}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-full rounded-full ${
                              mat.evidenceCompleteness > 90 ? 'bg-green-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${mat.evidenceCompleteness}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{mat.evidenceCompleteness}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        mat.status === 'READY' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
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
        <div className="lg:col-span-5 industrial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <h2 className="text-base font-bold text-slate-800">Current Bottlenecks</h2>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
              Attention Needed
            </span>
          </div>

          <div className="space-y-3">
            {mockBottlenecks.map((btn) => (
              <div
                key={btn.id}
                onClick={() => setSelectedBottleneck(btn)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  btn.status === 'critical'
                    ? 'bg-red-50/60 border-red-200 hover:border-red-300'
                    : btn.status === 'warning'
                    ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      btn.status === 'critical' ? 'text-red-600' : btn.status === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                    <span className="text-xs font-bold text-slate-800">{btn.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-xs">
                    {btn.facility}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Capacity Utilization</span>
                  <span className={`font-bold ${btn.utilization > 90 ? 'text-red-700' : 'text-amber-700'}`}>
                    {btn.utilization}%
                  </span>
                </div>

                <div className="mt-1.5 w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full ${
                      btn.utilization > 90 ? 'bg-red-600' : 'bg-amber-500'
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
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-slate-400 block">Flow Details</span>
                <h3 className="text-base font-bold text-green-800">{selectedFlow.pathway}</h3>
              </div>
              <button 
                onClick={() => setSelectedFlow(null)}
                className="p-1 rounded.lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source:</span>
                  <span className="text-slate-900 font-bold">{selectedFlow.sourceMaterial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="text-slate-900 font-bold">{selectedFlow.destination}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Allocated Quantity:</span>
                  <span className="text-green-800 font-bold">{selectedFlow.tonnes.toLocaleString()} tonnes</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase text-slate-400 font-bold block">Feasibility & Logistics</span>
                <div className="flex items-center justify-between text-xs p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileCheck2 className="w-4 h-4 text-green-600" /> Chemical Compatibility
                  </span>
                  <span className="text-green-800 font-bold">PASSED</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                  <span className="flex items-center gap-2 text-slate-700 font-medium">
                    <Truck className="w-4 h-4 text-green-600" /> Transport Corridor
                  </span>
                  <span className="text-green-800 font-bold">184 km (Optimal)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button 
              onClick={() => navigate('/feasibility')}
              className="w-full industrial-button-green"
            >
              Verify Feasibility Rules
            </button>
          </div>
        </div>
      )}

      {/* Bottleneck Modal */}
      {selectedBottleneck && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-2xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">{selectedBottleneck.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedBottleneck(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Impacted Facility</span>
                <span className="text-sm font-bold text-slate-800">{selectedBottleneck.facility}</span>
                <p className="text-slate-600 text-xs pt-2 leading-relaxed">{selectedBottleneck.description}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
                <span className="text-slate-600 font-medium">Utilization Rate:</span>
                <span className="text-amber-700 font-bold text-sm">{selectedBottleneck.utilization}%</span>
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
                className="industrial-button-green"
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
