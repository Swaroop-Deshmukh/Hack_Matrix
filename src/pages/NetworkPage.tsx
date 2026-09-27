import React, { useState } from 'react';
import { mockNodes, mockNetworkRoutes } from '../data';
import type { NodeLocation, NetworkRoute } from '../types';
import { 
  Network as NetworkIcon, 
  CheckCircle2, 
  ArrowRight, 
  X,
  SlidersHorizontal
} from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const [selectedRoute] = useState<NetworkRoute | null>(mockNetworkRoutes[0]);
  const [selectedNode, setSelectedNode] = useState<NodeLocation | null>(null);
  const [layerFilter, setLayerFilter] = useState<string>('ALL');

  const filteredNodes = mockNodes.filter((node) => {
    if (layerFilter === 'ALL') return true;
    return node.type === layerFilter;
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight flex items-center gap-2">
            <NetworkIcon className="w-5 h-5 text-teal-400" /> Industrial Spatial GIS Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Regional logistics nodes, processing facilities, and optimized transport corridors.
          </p>
        </div>

        {/* Layer Toggles & Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#090b10] p-1 rounded border border-slate-800 text-xs font-mono">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-1" />
            {['ALL', 'SOURCE', 'PROCESSING', 'DESTINATION', 'DISPOSAL'].map((type) => (
              <button
                key={type}
                onClick={() => setLayerFilter(type)}
                className={`px-2 py-0.5 rounded transition-all ${
                  layerFilter === type
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Command Center Layout (Map + Detail Panel) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left GIS Spatial Canvas / Map Area (8 Cols) */}
        <div className="lg:col-span-8 industrial-card relative overflow-hidden flex flex-col justify-between p-4 bg-[#090b10] border-slate-800">
          {/* Legend Overlay at Top Left */}
          <div className="absolute top-4 left-4 z-20 bg-[#0c0e14]/90 backdrop-blur-md p-3 rounded border border-slate-800 text-xs font-mono space-y-2 shadow-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block border-b border-slate-800 pb-1">
              GIS Layer Legend
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-300">● Waste Source</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rotate-45 bg-amber-400 inline-block" />
                <span className="text-slate-300">◆ Processing Facility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-400 inline-block" />
                <span className="text-slate-300">■ Destination Sink</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                <span className="text-slate-300">× Regulated Disposal</span>
              </div>
            </div>
          </div>

          {/* Interactive Vector GIS Simulation Map Canvas */}
          <div className="relative w-full h-full min-h-[400px] bg-[#07090e] rounded border border-slate-900 flex items-center justify-center overflow-hidden">
            {/* Dark GIS Topo Grid Graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

            {/* Simulated Vector Route Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* Active Route Line 1 */}
              <line x1="22%" y1="45%" x2="52%" y2="35%" stroke="url(#routeGrad)" strokeWidth="3" className="animate-flow-dash" />
              <line x1="52%" y1="35%" x2="80%" y2="40%" stroke="url(#routeGrad)" strokeWidth="3" className="animate-flow-dash" />

              {/* Alternative Feasible Route Line 2 */}
              <line x1="22%" y1="45%" x2="40%" y2="75%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
            </svg>

            {/* Interactive GIS Node Markers */}
            {filteredNodes.map((node) => {
              let positionClass = '';

              if (node.id === 'n1') positionClass = 'top-[45%] left-[22%]';
              if (node.id === 'n2') positionClass = 'top-[35%] left-[52%]';
              if (node.id === 'n3') positionClass = 'top-[40%] left-[80%]';
              if (node.id === 'n4') positionClass = 'top-[75%] left-[40%]';
              if (node.id === 'n5') positionClass = 'top-[25%] left-[15%]';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute ${positionClass} -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30`}
                >
                  <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute -inset-2 rounded-full bg-teal-500/20 animate-ping" />

                    {/* Marker Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-125 border ${
                      node.type === 'SOURCE' 
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300' 
                        : node.type === 'PROCESSING'
                        ? 'bg-amber-950 border-amber-400 text-amber-300 rotate-45'
                        : node.type === 'DESTINATION'
                        ? 'bg-blue-950 border-blue-400 text-blue-300'
                        : 'bg-slate-900 border-slate-600 text-slate-400'
                    }`}>
                      <span className={node.type === 'PROCESSING' ? '-rotate-45' : ''}>
                        {node.type === 'SOURCE' && 'S'}
                        {node.type === 'PROCESSING' && 'P'}
                        {node.type === 'DESTINATION' && 'D'}
                        {node.type === 'DISPOSAL' && 'X'}
                      </span>
                    </div>

                    {/* Node Hover Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 bg-[#090b10] border border-slate-800 text-[10px] font-mono text-slate-200 rounded whitespace-nowrap shadow-md opacity-90 group-hover:opacity-100">
                      {node.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom GIS Status Footer */}
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Coordinates: 21.1458° N, 79.0882° E (Central India Corridor)</span>
            <span className="text-teal-400">Map Scale: 1:250,000 (Vector Engine)</span>
          </div>
        </div>

        {/* Right GIS Route & Allocation Panel (4 Cols) */}
        <div className="lg:col-span-4 industrial-card p-5 flex flex-col justify-between bg-[#0e1118] space-y-4">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Corridor Telemetry</span>
                <h3 className="text-sm font-bold font-mono text-teal-400">Selected Route & Allocation</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                OPTIMAL
              </span>
            </div>

            {selectedRoute && (
              <div className="space-y-4 text-xs font-mono">
                {/* Route Path Flow Card */}
                <div className="p-3 bg-[#131722] rounded border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <span>{selectedRoute.sourceName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{selectedRoute.destinationName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Material: <strong className="text-teal-300">{selectedRoute.materialName}</strong></span>
                    <span>Allocated: <strong className="text-slate-100">{selectedRoute.quantity} t</strong></span>
                  </div>
                </div>

                {/* Spatial Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Transport Distance</span>
                    <span className="text-sm font-bold text-slate-200">{selectedRoute.distanceKm} km</span>
                  </div>

                  <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Transport Cost</span>
                    <span className="text-sm font-bold text-slate-200">₹{selectedRoute.transportCost} L</span>
                  </div>

                  <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Processing Cost</span>
                    <span className="text-sm font-bold text-slate-200">₹{selectedRoute.processingCost} L</span>
                  </div>

                  <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Mass Yield</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedRoute.yieldPercentage}%</span>
                  </div>
                </div>

                {/* Technical System Checks */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Feasibility & Capacity Verification</span>

                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Technically Feasible
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Capacity Available
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED</span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sink Demand Available
                    </span>
                    <span className="text-emerald-400 font-bold">PASSED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Node Drawer / Info */}
            {selectedNode && (
              <div className="p-3 bg-teal-950/20 border border-teal-500/40 rounded text-xs font-mono space-y-1">
                <div className="flex items-center justify-between font-bold text-teal-300">
                  <span>{selectedNode.name}</span>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">{selectedNode.address}</p>
                <p className="text-slate-300 text-[11px]">Capacity: <strong>{selectedNode.capacity}</strong></p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button className="industrial-button-primary w-full justify-center">
              View Complete Route Allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
