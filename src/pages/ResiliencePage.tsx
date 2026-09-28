import React, { useState } from 'react';
import { scenarioService } from '../services';
import type { ScenarioResult } from '../types';
import { 
  ShieldAlert, 
  Sliders, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight
} from 'lucide-react';

export const ResiliencePage: React.FC = () => {
  const [cementPlantAvailable, setCementPlantAvailable] = useState(true);
  const [grindingCapacity, setGrindingCapacity] = useState(100);
  const [demandPercentage, setDemandPercentage] = useState(100);
  const [transportPercentage, setTransportPercentage] = useState(100);

  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  const handleSimulateScenario = async (presetName?: string) => {
    setIsSimulating(true);

    if (presetName === 'Destination Closure') {
      setCementPlantAvailable(false);
    } else if (presetName === 'Processing Capacity Loss') {
      setGrindingCapacity(50);
    } else if (presetName === 'Transport Disruption') {
      setTransportPercentage(60);
    }

    const res = await scenarioService.simulateScenario({
      presetName,
      cementPlantAvailable: presetName === 'Destination Closure' ? false : cementPlantAvailable,
      grindingCapacity,
      demandPercentage,
      transportPercentage
    });

    setIsSimulating(false);
    setScenarioResult(res);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Scenario & Resilience Testing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test how the optimized portfolio behaves when industrial supply chain conditions change.
          </p>
        </div>
      </div>

      {/* SCENARIO CONTROLS & PRESETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Controls (7 Cols) */}
        <div className="lg:col-span-7 industrial-card p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200">Industrial Parameter Controls</h2>
            <Sliders className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-4">
            {/* Control 1: Destination Availability */}
            <div className="flex items-center justify-between p-3 bg-[#090b10] rounded border border-slate-800">
              <div>
                <span className="text-slate-200 font-bold block">Cement Plant C-01 Availability</span>
                <span className="text-[10px] text-slate-500">Simulate major plant shutdown</span>
              </div>
              <button
                onClick={() => setCementPlantAvailable(!cementPlantAvailable)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  cementPlantAvailable
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                {cementPlantAvailable ? 'AVAILABLE' : 'SHUTDOWN'}
              </button>
            </div>

            {/* Control 2: Grinding Capacity */}
            <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-200 font-bold">Grinding Unit G-01 Capacity</span>
                <span className="text-teal-400 font-bold">{grindingCapacity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={grindingCapacity}
                onChange={(e) => setGrindingCapacity(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-800"
              />
            </div>

            {/* Control 3: Demand */}
            <div className="p-3 bg-[#090b10] rounded border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-200 font-bold">Sink Demand Shock</span>
                <span className="text-teal-400 font-bold">{demandPercentage}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={demandPercentage}
                onChange={(e) => setDemandPercentage(Number(e.target.value))}
                className="w-full accent-teal-400 bg-slate-800"
              />
            </div>
          </div>

          <button
            onClick={() => handleSimulateScenario()}
            disabled={isSimulating}
            className="industrial-button-primary w-full justify-center py-2.5"
          >
            {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>SIMULATE STRESS SCENARIO</span>
          </button>
        </div>

        {/* Presets (5 Cols) */}
        <div className="lg:col-span-5 industrial-card p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200">Preset Stress Test Scenarios</h2>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Destination Closure', desc: 'Silo failure at Ultratech C-01' },
              { name: 'Demand Shock', desc: 'Regional construction slowdown (-40%)' },
              { name: 'Transport Disruption', desc: 'Monsoon highway bridge closure' },
              { name: 'Processing Capacity Loss', desc: 'Grinding G-01 mechanical breakdown' }
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => handleSimulateScenario(p.name)}
                className="w-full text-left p-3 bg-[#090b10] hover:bg-[#131722] rounded border border-slate-800 hover:border-amber-500/40 transition-all space-y-0.5"
              >
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>{p.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] text-slate-400">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCENARIO RESULTS COMPARISON */}
      {scenarioResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="industrial-card p-4 border-amber-500/40 bg-[#16120d] flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">SCENARIO GENERATED: {scenarioResult.name}</h3>
                <span className="text-[10px] text-slate-400">Re-optimizing network allocation under stress conditions</span>
              </div>
            </div>
          </div>

          {/* Baseline vs Scenario Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="industrial-card p-4 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Diversion Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-400 line-through">{scenarioResult.baselineDiversionPercentage}%</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                <span className="text-lg font-bold text-amber-300">{scenarioResult.scenarioDiversionPercentage}%</span>
              </div>
            </div>

            <div className="industrial-card p-4 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Net Cost</span>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-400 line-through">₹{scenarioResult.baselineCostLakhs} L</span>
                <ArrowRight className="w-3 h-3 text-red-400" />
                <span className="text-lg font-bold text-red-400">₹{scenarioResult.scenarioCostLakhs} L</span>
              </div>
            </div>

            <div className="industrial-card p-4 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Comparative ΔCO₂e</span>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-400 line-through">{scenarioResult.baselineEmissionsDeltaTonnes}</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                <span className="text-lg font-bold text-amber-300">{scenarioResult.scenarioEmissionsDeltaTonnes} tCO₂e</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
