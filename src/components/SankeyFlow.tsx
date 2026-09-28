import type { MaterialFlowItem } from '../types';
import { ArrowRight, Layers, Building2 } from 'lucide-react';

interface SankeyFlowProps {
  flows: MaterialFlowItem[];
  onSelectFlow?: (flow: MaterialFlowItem) => void;
  selectedFlowId?: string;
}

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ flows, onSelectFlow, selectedFlowId }) => {
  return (
    <div className="w-full space-y-3.5 py-2">
      {flows.map((flow) => {
        const isSelected = selectedFlowId === flow.id;

        return (
          <div
            key={flow.id}
            onClick={() => onSelectFlow?.(flow)}
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
              isSelected 
                ? 'bg-green-50/90 border-green-500 shadow-md' 
                : 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* Flow Card Layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              {/* Left Material Source */}
              <div className="flex items-center gap-3 min-w-[220px]">
                <div className="w-9 h-9 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center text-green-800 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Source Material</span>
                  <span className="font-bold text-slate-900 text-sm">{flow.sourceMaterial}</span>
                </div>
              </div>

              {/* Middle Pathway & Connection Graphic */}
              <div className="flex-1 flex items-center gap-2 px-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-green-300 via-green-500 to-green-300 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 border border-slate-200 rounded-full text-xs font-bold text-green-800 shadow-xs">
                    {flow.pathway}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-green-600 shrink-0" />
              </div>

              {/* Right Destination & Tonnage */}
              <div className="flex items-center justify-between md:justify-end gap-5 min-w-[260px]">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Destination / Sink</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {flow.destination}
                  </span>
                </div>

                <div className="px-3.5 py-1.5 bg-green-100/80 border border-green-300 rounded-lg text-right shrink-0">
                  <span className="text-xs font-extrabold text-green-900">{flow.tonnes.toLocaleString()} t</span>
                </div>
              </div>
            </div>

            {/* Bottom Progress Indicator Bar */}
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (flow.tonnes / 5000) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
