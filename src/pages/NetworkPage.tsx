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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <NetworkIcon className="w-6 h-6 text-green-700" /> Maps & Network Command Center
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Regional logistics nodes, processing facilities, and optimized transport corridors.
          </p>
        </div>

        {/* Layer Toggles & Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {['ALL', 'SOURCE', 'PROCESSING', 'DESTINATION', 'DISPOSAL'].map((type) => (
              <button
                key={type}
                onClick={() => setLayerFilter(type)}
                className={`px-3 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                  layerFilter === type
                    ? 'bg-green-100 text-green-900 border border-green-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Command Center Layout (Map + Detail Panel) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">
        {/* Left GIS Spatial Canvas / Map Area (8 Cols) */}
        <div className="lg:col-span-8 industrial-card relative overflow-hidden flex flex-col justify-between p-4 bg-slate-50 border-slate-200">
          {/* Legend Overlay at Top Left */}
          <div className="absolute top-6 left-6 z-20 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-xs space-y-2 shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block border-b border-slate-100 pb-1">
              GIS Layer Legend
            </span>
            <div className="space-y-1.5 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
                <span className="text-slate-800">● Waste Source</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rotate-45 bg-amber-500 inline-block" />
                <span className="text-slate-800">◆ Processing Unit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 inline-block" />
                <span className="text-slate-800">■ Destination Sink</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400 inline-block" />
                <span className="text-slate-800">× Regulated Disposal</span>
              </div>
            </div>
          </div>

          {/* Interactive Vector GIS Simulation Map Canvas */}
          <div className="relative w-full h-full min-h-[420px] bg-emerald-50/40 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
            {/* Grid Graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

            {/* Vector Route Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* Active Route Line 1 */}
              <line x1="22%" y1="45%" x2="52%" y2="35%" stroke="url(#routeGradLight)" strokeWidth="4" className="animate-flow-dash" />
              <line x1="52%" y1="35%" x2="80%" y2="40%" stroke="url(#routeGradLight)" strokeWidth="4" className="animate-flow-dash" />

              {/* Alternative Feasible Route Line 2 */}
              <line x1="22%" y1="45%" x2="40%" y2="75%" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="5 5" opacity="0.7" />
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
                    <div className="absolute -inset-2 rounded-full bg-green-400/30 animate-ping" />

                    {/* Marker Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md transition-transform group-hover:scale-125 border ${
                      node.type === 'SOURCE' 
                        ? 'bg-green-600 border-green-700 text-white' 
                        : node.type === 'PROCESSING'
                        ? 'bg-amber-500 border-amber-600 text-white rotate-45'
                        : node.type === 'DESTINATION'
                        ? 'bg-blue-600 border-blue-700 text-white'
                        : 'bg-slate-500 border-slate-600 text-white'
                    }`}>
                      <span className={node.type === 'PROCESSING' ? '-rotate-45' : ''}>
                        {node.type === 'SOURCE' && 'S'}
                        {node.type === 'PROCESSING' && 'P'}
                        {node.type === 'DESTINATION' && 'D'}
                        {node.type === 'DISPOSAL' && 'X'}
                      </span>
                    </div>

                    {/* Node Hover Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-lg whitespace-nowrap shadow-md opacity-95 group-hover:opacity-100">
                      {node.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom GIS Status Footer */}
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600 pt-2 border-t border-slate-200">
            <span>Coordinates: 21.1458° N, 79.0882° E (Central India Circular Network)</span>
            <span className="text-green-800 font-bold">Vector Scale: 1:250,000</span>
          </div>
        </div>

        {/* Right GIS Route & Allocation Panel (4 Cols) */}
        <div className="lg:col-span-4 industrial-card p-6 flex flex-col justify-between bg-white space-y-4">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Corridor Telemetry</span>
                <h3 className="text-base font-bold text-slate-900">Selected Route & Allocation</h3>
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-900 px-3 py-1 rounded-full border border-green-200">
                OPTIMAL
              </span>
            </div>

            {selectedRoute && (
              <div className="space-y-4 text-xs">
                {/* Route Path Flow Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span>{selectedRoute.sourceName}</span>
                    <ArrowRight className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{selectedRoute.destinationName}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200">
                    <span>Material: <strong className="text-green-800">{selectedRoute.materialName}</strong></span>
                    <span>Allocated: <strong className="text-slate-900">{selectedRoute.quantity} t</strong></span>
                  </div>
                </div>

                {/* Spatial Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport Distance</span>
                    <span className="text-sm font-bold text-slate-900">{selectedRoute.distanceKm} km</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport Freight</span>
                    <span className="text-sm font-bold text-slate-900">₹{selectedRoute.transportCost} L</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Pre-Processing Cost</span>
                    <span className="text-sm font-bold text-slate-900">₹{selectedRoute.processingCost} L</span>
                  </div>

                  <div className="p-3.5 bg-green-50 rounded-xl border border-green-200 space-y-1">
                    <span className="text-[10px] text-green-800 font-bold uppercase block">Mass Yield</span>
                    <span className="text-sm font-extrabold text-green-800">{selectedRoute.yieldPercentage}%</span>
                  </div>
                </div>

                {/* Technical System Checks */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs uppercase text-slate-400 font-bold block">Feasibility & Capacity Verification</span>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Technically Feasible
                    </span>
                    <span className="text-green-800 font-bold">PASSED</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Capacity Available
                    </span>
                    <span className="text-green-800 font-bold">PASSED</span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Sink Demand Available
                    </span>
                    <span className="text-green-800 font-bold">PASSED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Node Info Drawer */}
            {selectedNode && (
              <div className="p-4 bg-green-50/80 border border-green-300 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-green-900">
                  <span>{selectedNode.name}</span>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-600 text-xs">{selectedNode.address}</p>
                <p className="text-slate-800 text-xs pt-1">Capacity: <strong>{selectedNode.capacity}</strong></p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            <button className="industrial-button-green w-full justify-center">
              View Complete Route Allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
