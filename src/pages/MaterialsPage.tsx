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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Materials Registry</h1>
          <p className="text-xs text-slate-600 mt-1">
            Industrial waste streams, chemical passports, and lab evidence records.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="industrial-button-green"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Waste Stream</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="industrial-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material ID, name, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-green-600 font-sans shadow-xs"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
          </div>

          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 gap-1 text-xs font-bold">
            {['ALL', 'READY', 'REVIEW', 'INCOMPLETE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-green-100 text-green-900 border border-green-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="industrial-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
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
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredMaterials.map((mat) => (
                <tr 
                  key={mat.id}
                  onClick={() => navigate(`/materials/${mat.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-3 font-bold text-green-700 font-mono">{mat.id}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400 group-hover:text-green-600 transition-colors" />
                    {mat.name}
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">
                    {mat.quantity.toLocaleString()} {mat.unit}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{mat.source}</td>
                  <td className="py-3.5 px-3 text-slate-600">{mat.location}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-full rounded-full ${
                            mat.evidenceCompleteness > 90 
                              ? 'bg-green-600' 
                              : mat.evidenceCompleteness > 70 
                              ? 'bg-amber-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${mat.evidenceCompleteness}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{mat.evidenceCompleteness}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                      {mat.candidatePathwaysCount} Candidate
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      mat.status === 'READY' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : mat.status === 'REVIEW' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
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
                      className="text-slate-400 hover:text-green-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-bold text-slate-900">Register New Waste Stream</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 text-xs font-bold block mb-1">Material ID</label>
                  <input
                    type="text"
                    disabled
                    value={newMat.id}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-bold block mb-1">Material Name *</label>
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
                  <label className="text-slate-700 text-xs font-bold block mb-1">Quantity (Tonnes) *</label>
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
                  <label className="text-slate-700 text-xs font-bold block mb-1">Source Facility *</label>
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
                <label className="text-slate-700 text-xs font-bold block mb-1">Location / Cluster *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paradeep, Odisha"
                  value={newMat.location}
                  onChange={(e) => setNewMat({...newMat, location: e.target.value})}
                  className="industrial-input w-full"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="industrial-button-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="industrial-button-green"
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
