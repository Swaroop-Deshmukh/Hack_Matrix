import type { MaterialFlowItem } from '../types';
import { ArrowRight, Layers, Building2 } from 'lucide-react';

interface SankeyFlowProps {
  flows: MaterialFlowItem[];
  onSelectFlow?: (flow: MaterialFlowItem) => void;
  selectedFlowId?: string;
}

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ flows, onSelectFlow, selectedFlowId }) => {
  return (
    <div className="w-full space-y-3 py-2">
      {flows.map((flow) => {
        const isSelected = selectedFlowId === flow.id;

        return (
          <div
            key={flow.id}
            onClick={() => onSelectFlow?.(flow)}
            className={`group relative p-3 rounded-md border transition-all cursor-pointer ${
              isSelected 
                ? 'bg-[#151924] border-teal-500/60 shadow-md shadow-teal-950/20' 
                : 'bg-[#0d1017]/80 border-slate-800/80 hover:bg-[#131722] hover:border-slate-700/80'
            }`}
          >
            {/* Flow Card Layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              {/* Left Material Source */}
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700/80 flex items-center justify-center text-teal-400 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Source Material</span>
                  <span className="font-semibold text-slate-200 font-mono">{flow.sourceMaterial}</span>
                </div>
              </div>

              {/* Middle Pathway & Connection Graphic */}
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="h-px flex-1 bg-gradient-to-r from-teal-500/40 via-teal-400/80 to-teal-500/40 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d1017] px-2 py-0.5 border border-slate-800 rounded text-[10px] font-mono text-teal-300 font-medium">
                    {flow.pathway}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0 animate-pulse" />
              </div>

              {/* Right Destination & Tonnage */}
              <div className="flex items-center justify-between md:justify-end gap-4 min-w-[240px]">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Destination / Sink</span>
                  <span className="font-medium text-slate-300 font-mono flex items-center gap-1 justify-end">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    {flow.destination}
                  </span>
                </div>

                <div className="px-3 py-1 bg-slate-900 border border-teal-500/30 rounded text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-teal-400">{flow.tonnes.toLocaleString()} t</span>
                </div>
              </div>
            </div>

            {/* Subtle animated bottom bar */}
            <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-slate-800/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500/60 rounded-full transition-all duration-300 group-hover:bg-teal-400"
                style={{ width: `${Math.min(100, (flow.tonnes / 5000) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
