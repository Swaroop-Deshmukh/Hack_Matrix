import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockMaterials } from '../data';
import type { Material } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  ChevronRight,
  X
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [materialsList, setMaterialsList] = useState<Material[]>(mockMaterials);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Waste Stream Form State
  const [newMat, setNewMat] = useState({
    id: `FA-00${materialsList.length + 1}`,
    name: '',
    quantity: 1000,
    source: '',
    location: '',
    availability: '01 Nov — 31 Dec 2026'
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMat.name || !newMat.source || !newMat.location) return;

    const created: Material = {
      id: newMat.id,
      name: newMat.name,
      quantity: Number(newMat.quantity),
      unit: 't',
      source: newMat.source,
      location: newMat.location,
      evidenceCompleteness: 100,
      candidatePathwaysCount: 3,
      status: 'READY',
      availability: newMat.availability,
      createdAt: new Date().toISOString().split('T')[0],
      chemicalComposition: { SiO2: 45.0, Al2O3: 20.0, Fe2O3: 5.0, LOI: 1.5 },
      physicalProperties: { moisture: 2.5, fineness: 85 },
      evidenceRecords: [
        { property: 'SiO₂', value: '45.0%', type: 'LAB VERIFIED', source: 'Certified Assay', date: 'Today', status: 'Verified' }
      ]
    };

    setMaterialsList([created, ...materialsList]);
    setShowAddModal(false);
    setNewMat({ id: `FA-00${materialsList.length + 2}`, name: '', quantity: 1000, source: '', location: '', availability: '01 Nov — 31 Dec 2026' });
  };

  const filteredMaterials = materialsList.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100 tracking-tight">Material Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Industrial waste streams and their verified material properties.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="industrial-button-primary"
        >
          <Plus className="w-3.5 h-3.5 fill-slate-950" />
          <span>+ Add Waste Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="industrial-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material ID, name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#090b10] border border-slate-800 rounded text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/60 font-mono"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Status:</span>
          </div>

          <div className="flex items-center bg-[#090b10] p-1 rounded border border-slate-800 gap-1 text-xs font-mono">
            {['ALL', 'READY', 'REVIEW', 'INCOMPLETE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition-all ${
                  statusFilter === st
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Premium Table */}
      <div className="industrial-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <th className="py-3 px-3">Material ID</th>
                <th className="py-3 px-3">Material</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Source Facility</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Evidence</th>
                <th className="py-3 px-3">Pathways</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMaterials.map((mat) => (
                <tr 
                  key={mat.id}
                  onClick={() => navigate(`/materials/${mat.id}`)}
                  className="hover:bg-[#141924] cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3 font-semibold text-teal-400 font-mono">{mat.id}</td>
                  <td className="py-3.5 px-3 font-sans font-medium text-slate-100 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                    {mat.name}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-200">
                    {mat.quantity.toLocaleString()} {mat.unit}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 font-sans">{mat.source}</td>
                  <td className="py-3.5 px-3 text-slate-400 font-sans">{mat.location}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-900 rounded-full h-1.5 border border-slate-800">
                        <div 
                          className={`h-full rounded-full ${
                            mat.evidenceCompleteness > 90 
                              ? 'bg-emerald-400' 
                              : mat.evidenceCompleteness > 70 
                              ? 'bg-amber-400' 
                              : 'bg-red-400'
                          }`}
                          style={{ width: `${mat.evidenceCompleteness}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{mat.evidenceCompleteness}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                      {mat.candidatePathwaysCount} Candidate
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono ${
                      mat.status === 'READY' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : mat.status === 'REVIEW' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {mat.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/materials/${mat.id}`);
                      }}
                      className="text-slate-400 hover:text-teal-400 p-1.5 rounded hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Waste Stream Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="industrial-card p-6 w-full max-w-lg space-y-4 shadow-2xl border border-teal-500/40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold font-mono text-slate-100">Register New Industrial Waste Stream</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase block mb-1">Material ID</label>
                  <input
                    type="text"
                    disabled
                    value={newMat.id}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase block mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phosphogypsum"
                    value={newMat.name}
                    onChange={(e) => setNewMat({...newMat, name: e.target.value})}
                    className="industrial-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase block mb-1">Quantity (Tonnes) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newMat.quantity}
                    onChange={(e) => setNewMat({...newMat, quantity: Number(e.target.value)})}
                    className="industrial-input w-full"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase block mb-1">Source Facility *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fertilizer Plant Unit B"
                    value={newMat.source}
                    onChange={(e) => setNewMat({...newMat, source: e.target.value})}
                    className="industrial-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] uppercase block mb-1">Location / Cluster *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paradeep, Odisha"
                  value={newMat.location}
                  onChange={(e) => setNewMat({...newMat, location: e.target.value})}
                  className="industrial-input w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="industrial-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="industrial-button-primary"
                >
                  Register Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
