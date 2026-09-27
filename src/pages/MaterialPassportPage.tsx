import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockMaterials, mockCandidatePathways } from '../data';
import { 
  ArrowLeft, 
  CheckCircle2, 
  FlaskConical, 
  FileCheck, 
  Building2, 
  MapPin, 
  Upload, 
  Zap,
  ArrowUpRight
} from 'lucide-react';

export const MaterialPassportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find material by ID, or fallback to FA-001
  const material = mockMaterials.find((m) => m.id === id) || mockMaterials[0];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/materials')}
        className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Material Registry</span>
      </button>

      {/* Scientific Record Header */}
      <div className="industrial-card p-6 border-teal-500/30 bg-[#10141e] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-teal-400">{material.id}</span>
              <h1 className="text-2xl font-bold font-mono text-slate-100">{material.name}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold tracking-wider ${
                material.status === 'READY' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/40'
              }`}>
                {material.status} PASSPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-4">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-500" /> {material.source}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {material.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/feasibility')}
              className="industrial-button-primary"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Run Feasibility Check</span>
            </button>
          </div>
        </div>

        {/* Key Passport Metadata Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs font-mono">
          <div className="bg-[#090b10] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Available Quantity</span>
            <span className="text-base font-bold text-slate-100">{material.quantity.toLocaleString()} {material.unit}</span>
          </div>

          <div className="bg-[#090b10] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Evidence Provenance</span>
            <span className="text-base font-bold text-emerald-400">{material.evidenceCompleteness}% Verified</span>
          </div>

          <div className="bg-[#090b10] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Candidate Pathways</span>
            <span className="text-base font-bold text-teal-400">{material.candidatePathwaysCount} Screened</span>
          </div>

          <div className="bg-[#090b10] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Window of Availability</span>
            <span className="text-xs font-semibold text-slate-300">{material.availability}</span>
          </div>
        </div>
      </div>

      {/* SECTION: CHEMICAL & PHYSICAL COMPOSITION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h2 className="text-sm font-semibold font-mono text-slate-200 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-400" /> Chemical & Physical Profile
          </h2>
          <span className="text-[10px] font-mono text-slate-500">ISO 17025 Compliant Test Protocol</span>
        </div>

        {/* Chemical Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
          {Object.entries(material.chemicalComposition).map(([compound, val]) => (
            <div key={compound} className="industrial-card p-3 text-center hover:border-teal-500/40 transition-colors">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">{compound}</span>
              <span className="text-lg font-bold text-slate-100 mt-1 block">{val}%</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">XRF Spectrometry</span>
            </div>
          ))}
        </div>

        {/* Physical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono pt-2">
          <div className="industrial-card p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Moisture Content</span>
            <span className="text-base font-bold text-slate-200">{material.physicalProperties.moisture}%</span>
            <span className="text-[9px] text-slate-500">Target &lt; 5.0%</span>
          </div>
          <div className="industrial-card p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Fineness (Passing 45µm)</span>
            <span className="text-base font-bold text-slate-200">{material.physicalProperties.fineness}%</span>
            <span className="text-[9px] text-slate-500">Blaine Specific Area</span>
          </div>
          <div className="industrial-card p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Specific Gravity / Density</span>
            <span className="text-base font-bold text-slate-200">{material.physicalProperties.density || '2.2'} g/cm³</span>
            <span className="text-[9px] text-slate-500">Standard ASTM D854</span>
          </div>
          <div className="industrial-card p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">Particle Size Median</span>
            <span className="text-base font-bold text-slate-200">{material.physicalProperties.particleSize || '22'} µm</span>
            <span className="text-[9px] text-slate-500">Laser Diffraction</span>
          </div>
        </div>
      </div>

      {/* SECTION: EVIDENCE PROVENANCE */}
      <div className="industrial-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold font-mono text-slate-200">Evidence Provenance Registry</h2>
          </div>
          <button className="industrial-button-secondary">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload Lab Assay PDF</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 px-3">Property</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3">Verification Badge</th>
                <th className="py-2.5 px-3">Source Audit Trail</th>
                <th className="py-2.5 px-3">Assay Date</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {material.evidenceRecords.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-slate-200">{ev.property}</td>
                  <td className="py-3 px-3 text-teal-400 font-bold">{ev.value}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ev.type === 'LAB VERIFIED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {ev.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-sans">{ev.source}</td>
                  <td className="py-3 px-3 text-slate-400">{ev.date || 'Current'}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {ev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: CANDIDATE PATHWAYS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h2 className="text-sm font-semibold font-mono text-slate-200">Candidate Circular Pathways</h2>
          <span className="text-[10px] font-mono text-teal-400">Configured Rule Matrix v4.2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCandidatePathways.map((pw) => (
            <div 
              key={pw.id}
              onClick={() => navigate('/feasibility')}
              className="industrial-card p-4 space-y-3 hover:border-teal-500/60 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-100">{pw.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    pw.status === 'DIRECT' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40' 
                      : pw.status === 'PROCESS'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/40'
                  }`}>
                    {pw.status}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  {pw.status === 'DIRECT' && 'Direct substitute in raw material mix without pre-treatment.'}
                  {pw.status === 'PROCESS' && 'Requires pre-grinding & moisture reduction prior to dosing.'}
                  {pw.status === 'UNKNOWN' && 'Awaiting lab leaching verification for compliance screening.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-teal-400">
                <span>View Rule Checks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
