'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Phone, 
  ArrowLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import RequirePermission from './RequirePermission';

interface Archaka {
  id: string;
  name: string;
  role: string;
  specialization: string;
  mobile: string;
  status: 'Active' | 'On Leave' | 'Duty-Assign';
  avatarColor: string;
  isDraft?: boolean;
}

interface PriestMasterProps {
  onBack: () => void;
}

const DEFAULT_PRIESTS: Archaka[] = [
  { id: '1', name: 'Raghavan Bhattar', role: 'Chief Archaka', specialization: 'Maha Rudrabhishek, Chandi Homa', mobile: '+91 98450 12345', status: 'Active', avatarColor: 'bg-primary text-on-primary' },
  { id: '2', name: 'Sunder Raman', role: 'Senior Archaka', specialization: 'Sathyanarayana Puja, Vivaha', mobile: '+91 98450 67890', status: 'Active', avatarColor: 'bg-secondary text-on-secondary' },
  { id: '3', name: 'Madhavan Shastri', role: 'Archaka', specialization: 'Archana, Upanayana, Vahan Puja', mobile: '+91 97321 44556', status: 'Duty-Assign', avatarColor: 'bg-tertiary text-on-tertiary' },
  { id: '4', name: 'Vasudevan Swamy', role: 'Archaka', specialization: 'Daily Alankara, Abhisheka', mobile: '+91 99001 22334', status: 'On Leave', avatarColor: 'bg-[#735c00] text-white' },
  { id: '5', name: 'Ganesha Dikshidar', role: 'Rigveda specialist', specialization: 'Veda Parayana, Homam', mobile: '+91 98888 77766', status: 'Active', avatarColor: 'bg-secondary-fixed-dim text-on-secondary-fixed' }
];

export default function PriestMaster({ onBack }: PriestMasterProps) {
  const [priests, setPriests] = useState<Archaka[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_priests');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return DEFAULT_PRIESTS;
  });
  
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPriest, setEditingPriest] = useState<Archaka | null>(null);

  // New priest form state
  const [newPriest, setNewPriest] = useState({
    name: '',
    role: 'Archaka',
    specialization: '',
    mobile: '',
    status: 'Active' as const
  });

  // Load from live backend API with fallback
  useEffect(() => {
    async function loadLivePriests() {
      try {
        const res = await fetch('/api/v1/temples/temple_vidyashankara/priests?trustId=trust_sringeri');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped: Archaka[] = json.data.map((p: any) => ({
              id: p.id,
              name: p.personProfileId || 'Raghavan Bhattar',
              role: 'Chief Archaka',
              specialization: 'Shukla Yajurveda & Veda Bhashyam',
              mobile: '+91 98450 12345',
              status: p.status === 'Active' ? 'Active' : 'On Leave'
            }));
            setPriests(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local priests fallback');
      }

      const cached = localStorage.getItem('sankalpvani_priests');
      if (!cached) {
        localStorage.setItem('sankalpvani_priests', JSON.stringify(DEFAULT_PRIESTS));
        setPriests(DEFAULT_PRIESTS);
      } else {
        setPriests(JSON.parse(cached));
      }
    }

    loadLivePriests();
  }, []);

  const saveToStorage = (updatedList: Archaka[]) => {
    setPriests(updatedList);
    localStorage.setItem('sankalpvani_priests', JSON.stringify(updatedList));
  };

  const handleCreatePriest = async (publish: boolean) => {
    if (!newPriest.name.trim()) return;

    // Duplicate check
    const isDuplicate = priests.some(p => p.name.trim().toLowerCase() === newPriest.name.trim().toLowerCase());
    if (isDuplicate) {
      alert(`A Priest with the name "${newPriest.name}" already exists.`);
      return;
    }

    const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-[#735c00]', 'bg-secondary-fixed-dim'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const added: Archaka = {
      id: Date.now().toString(),
      name: newPriest.name.trim(),
      role: newPriest.role,
      specialization: newPriest.specialization || 'General Rituals',
      mobile: newPriest.mobile || '+91 99000 00000',
      status: newPriest.status,
      isDraft: !publish,
      avatarColor: randomColor
    };

    try {
      await fetch('/api/v1/temples/temple_vidyashankara/priests?trustId=trust_sringeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: added.name,
          phone: added.mobile,
          roleTitle: added.role,
          specialization: added.specialization,
          status: added.status
        })
      });
    } catch (e) {
      console.warn('Backend create priest fallback');
    }

    const updated = [...priests, added];
    saveToStorage(updated);
    
    window.dispatchEvent(new Event('sankalpvani_priests_updated'));

    setNewPriest({
      name: '',
      role: 'Archaka',
      specialization: '',
      mobile: '',
      status: 'Active'
    });
    setShowAddForm(false);
  };

  const handleAddPriest = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreatePriest(true);
  };

  const handleDeletePriest = (id: string) => {
    if (confirm('Are you sure you want to remove this archaka from the official registry?')) {
      const updated = priests.filter(p => p.id !== id);
      saveToStorage(updated);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = priests.map(p => {
      if (p.id === id) {
        const nextStatus: Archaka['status'] = p.status === 'Active' ? 'Duty-Assign' : p.status === 'Duty-Assign' ? 'On Leave' : 'Active';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    saveToStorage(updated);
  };

  const handleSaveEditPriest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriest || !editingPriest.name.trim()) return;

    const updated = priests.map(p => p.id === editingPriest.id ? editingPriest : p);
    saveToStorage(updated);
    setShowEditModal(false);
    setEditingPriest(null);
  };

  // Filter Logic
  const filteredPriests = priests.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.specialization.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || p.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-primary-container/10 rounded-full text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary tracking-wider uppercase mb-0.5">
              <span>Masters</span>
              <ChevronRight size={12} className="text-on-surface-variant" />
              <span>Archakas Registry</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-primary">Archakas Registry</h2>
          </div>
        </div>

        <RequirePermission 
          permission="MANAGE_PRIESTS" 
          showLockedUI={true} 
          lockedMessage="Registration Capability Locked"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-on-primary-container text-on-primary text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>{showAddForm ? 'Close Registration Form' : 'Register New Archaka'}</span>
          </button>
        </RequirePermission>
      </div>

      {/* Inline Registration Form */}
      {showAddForm && (
        <form onSubmit={handleAddPriest} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4 animate-[scaleIn_0.15s_ease-out]">
          <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            New Archaka Registration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Archaka Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Madhava Dikshidar"
                value={newPriest.name}
                onChange={(e) => setNewPriest({...newPriest, name: e.target.value})}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-primary ${
                  newPriest.name.trim() && priests.some(p => p.name.trim().toLowerCase() === newPriest.name.trim().toLowerCase())
                    ? 'border-error text-error focus:border-error focus:ring-error'
                    : 'border-outline'
                }`}
              />
              {newPriest.name.trim() && priests.some(p => p.name.trim().toLowerCase() === newPriest.name.trim().toLowerCase()) && (
                <p className="text-[11px] text-error font-semibold mt-1">An Archaka with this name already exists.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Official Role</label>
              <select
                value={newPriest.role}
                onChange={(e) => setNewPriest({...newPriest, role: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              >
                <option value="Chief Archaka">Chief Archaka</option>
                <option value="Senior Archaka">Senior Archaka</option>
                <option value="Archaka">Archaka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Contact Mobile</label>
              <input
                type="text"
                placeholder="+91 XXXXX XXXXX"
                value={newPriest.mobile}
                onChange={(e) => setNewPriest({...newPriest, mobile: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Ritual Specializations</label>
              <input
                type="text"
                placeholder="e.g. Homam rituals, Alankara expert"
                value={newPriest.specialization}
                onChange={(e) => setNewPriest({...newPriest, specialization: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t divider-gold flex justify-end gap-3">
            <button
              type="button"
              disabled={!newPriest.name.trim() || priests.some(p => p.name.trim().toLowerCase() === newPriest.name.trim().toLowerCase())}
              onClick={() => handleCreatePriest(false)}
              className="px-4 py-2.5 bg-surface-container-low hover:bg-primary-container/10 border border-outline-variant/40 text-on-surface-variant hover:text-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={!newPriest.name.trim() || priests.some(p => p.name.trim().toLowerCase() === newPriest.name.trim().toLowerCase())}
              onClick={() => handleCreatePriest(true)}
              className="px-5 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Publish
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input
            type="text"
            placeholder="Search name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/75 border border-outline rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Custom tabs based styling */}
        <div className="flex gap-2 p-1 bg-white/60 rounded-xl border border-outline-variant/30 w-full md:w-auto overflow-x-auto hide-scrollbar">
          {['All', 'Chief Archaka', 'Senior Archaka', 'Archaka'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRole === role 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/5'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Priest Table Grid list */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-4 px-6">Archaka / Acharya</th>
                <th className="py-4 px-6">Official Role</th>
                <th className="py-4 px-6">Specialized Rituals</th>
                <th className="py-4 px-6">Contact Details</th>
                <th className="py-4 px-6 text-center">Duty Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
              {filteredPriests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-on-surface-variant font-sans text-sm">
                    No active archakas matching your selected filters.
                  </td>
                </tr>
              ) : (
                filteredPriests.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${p.avatarColor} flex items-center justify-center font-bold text-sm shadow-inner`}>
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{p.name}</p>
                          <span className="font-mono text-[9px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={8} /> SV-ID: {p.id.padStart(3, '0')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-xs font-bold rounded-lg">
                        {p.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-xs font-semibold leading-relaxed max-w-xs truncate">
                      {p.specialization}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-xs text-on-surface font-semibold">
                        <Phone size={12} className="text-primary" />
                        <span>{p.mobile}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <button
                          onClick={() => toggleStatus(p.id)}
                          title="Click to cycle status"
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                            p.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : p.status === 'Duty-Assign'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </button>
                        {p.isDraft && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingPriest({ ...p });
                            setShowEditModal(true);
                          }}
                          className="p-1.5 hover:bg-primary-container/10 text-primary rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeletePriest(p.id)}
                          className="p-1.5 hover:bg-error-container text-error rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Edit Priest Modal Popup */}
      {showEditModal && editingPriest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-t-4 border-primary p-6 animate-[scaleIn_0.2s_ease-out]">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-2 hover:bg-surface-container-low text-on-surface-variant rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-2xl text-primary font-bold mb-4">Edit Archaka details</h3>

            <form onSubmit={handleSaveEditPriest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Archaka Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ganesha Dikshidar"
                  value={editingPriest.name}
                  onChange={(e) => setEditingPriest({...editingPriest, name: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Official Role</label>
                  <select
                    value={editingPriest.role}
                    onChange={(e) => setEditingPriest({...editingPriest, role: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Chief Archaka">Chief Archaka</option>
                    <option value="Senior Archaka">Senior Archaka</option>
                    <option value="Archaka">Archaka</option>
                    <option value="Rigveda specialist">Rigveda specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Contact Mobile</label>
                  <input
                    type="text"
                    placeholder="+91 XXXXX XXXXX"
                    value={editingPriest.mobile}
                    onChange={(e) => setEditingPriest({...editingPriest, mobile: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Ritual Specializations</label>
                <input
                  type="text"
                  placeholder="e.g. Homam rituals, Alankara expert"
                  value={editingPriest.specialization}
                  onChange={(e) => setEditingPriest({...editingPriest, specialization: e.target.value})}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t divider-gold flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-on-primary-container text-on-primary rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
