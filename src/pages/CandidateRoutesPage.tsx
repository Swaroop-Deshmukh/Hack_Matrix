import React, { useState } from 'react';
import { Route as RouteIcon } from 'lucide-react';

export const CandidateRoutesPage: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState('Steel Scrap (MAT-001)');
  const [selectedLocation, setSelectedLocation] = useState('Pune (MH)');

  const candidateRoutes = [
    { id: 'CR-001', pathway: 'Recycling', destination: 'Shree Metal Pvt. Ltd.', feasibility: 'DIRECT', processing: 'None', distance: '120 km' },
    { id: 'CR-002', pathway: 'Recycling', destination: 'Green Steel Ltd.', feasibility: 'PROCESS', processing: 'Drying + Grinding', distance: '280 km' },
    { id: 'CR-003', pathway: 'Remanufacturing', destination: 'ABC Components', feasibility: 'DIRECT', processing: 'None', distance: '180 km' },
    { id: 'CR-004', pathway: 'Energy Recovery', destination: 'Waste-to-Energy Plant', feasibility: 'PROCESS', processing: 'Shredding', distance: '340 km' }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <RouteIcon className="w-6 h-6 text-green-700" /> Candidate Routes
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-sans">
            Pre-filtered, technically feasible routes prepared for linear optimization.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="industrial-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase block font-bold">Material</span>
            <select 
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="industrial-input w-52 font-semibold"
            >
              <option>Steel Scrap (MAT-001)</option>
              <option>Aluminium Waste (MAT-002)</option>
              <option>Fly Ash (FA-001)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase block font-bold">Location</span>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="industrial-input w-52 font-semibold"
            >
              <option>Pune (MH)</option>
              <option>Nagpur (MH)</option>
              <option>Bhilai (CG)</option>
            </select>
          </div>
        </div>

        <button className="industrial-button-green px-5 py-2.5">
          <span>Get Candidate Routes</span>
        </button>
      </div>

      {/* Candidate Routes Table */}
      <div className="industrial-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-3">Route ID</th>
                <th className="py-3 px-3">Pathway</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3">Feasibility</th>
                <th className="py-3 px-3">Processing Req.</th>
                <th className="py-3 px-3 text-right">Distance (km)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {candidateRoutes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-green-700 font-mono">{r.id}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{r.pathway}</td>
                  <td className="py-3.5 px-3 text-slate-800 font-semibold">{r.destination}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.feasibility === 'DIRECT' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {r.feasibility}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{r.processing}</td>
                  <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">{r.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
