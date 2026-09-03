'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  ChevronRight,
  CheckCircle,
  Home,
  Bath,
  Hotel,
  UtensilsCrossed,
  Sparkles,
  Droplets,
  Gift,
  Building2,
  ShieldCheck,
  Plus,
  PlusCircle,
  Edit2,
  Trash2,
  XCircle
} from 'lucide-react';

interface TempleFacilitiesProps {
  onBack: () => void;
}

interface FacilityItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

type FacilityIconName = 'building2' | 'bath' | 'hotel' | 'utensils' | 'sparkles' | 'droplets' | 'gift' | 'home';

const DEFAULT_FACILITIES: FacilityItem[] = [
  {
    id: 'function-hall',
    name: 'Function Hall / Choultry',
    description: 'Availability for weddings, ceremonies, and community events.',
    enabled: true,
    icon: 'building2'
  },
  {
    id: 'rest-rooms',
    name: 'Rest Rooms',
    description: 'Clean and accessible washroom facilities for devotees.',
    enabled: true,
    icon: 'bath'
  },
  {
    id: 'accommodation',
    name: 'Accommodation',
    description: 'Guest rooms and stay arrangements for pilgrims.',
    enabled: true,
    icon: 'hotel'
  },
  {
    id: 'dining-hall',
    name: 'Dining Hall',
    description: 'Meal service areas for visitors and volunteers.',
    enabled: true,
    icon: 'utensils'
  },
  {
    id: 'private-poojas',
    name: 'Private Poojas',
    description: 'Dedicated booking support for personal rituals and ceremonies.',
    enabled: true,
    icon: 'sparkles'
  },
  {
    id: 'drinking-water',
    name: 'Drinking Water Facility',
    description: 'Filtered water stations across the temple premises.',
    enabled: true,
    icon: 'droplets'
  },
  {
    id: 'prasadam',
    name: 'Prasadam Counter',
    description: 'Distribution of eatables, non-eatables, and devotional items.',
    enabled: true,
    icon: 'gift'
  }
];

const iconMap: Record<FacilityIconName, React.ElementType> = {
  building2: Building2,
  bath: Bath,
  hotel: Hotel,
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
  droplets: Droplets,
  gift: Gift,
  home: Home
};

const normalizeFacility = (facility: Partial<FacilityItem> & { icon?: unknown }, fallbackId?: string): FacilityItem => {
  const id = facility.id || fallbackId || 'facility';
  const defaultFacility = DEFAULT_FACILITIES.find((item) => item.id === id) || DEFAULT_FACILITIES[0];
  const iconValue = typeof facility.icon === 'string' ? facility.icon : defaultFacility.icon;

  return {
    id,
    name: facility.name || defaultFacility.name,
    description: facility.description || defaultFacility.description,
    enabled: typeof facility.enabled === 'boolean' ? facility.enabled : defaultFacility.enabled,
    icon: iconValue as FacilityIconName
  };
};

export default function TempleFacilities({ onBack }: TempleFacilitiesProps) {
  const [facilities, setFacilities] = useState<FacilityItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_temple_facilities');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as Array<Partial<FacilityItem>>;
          if (Array.isArray(parsed) && parsed.length) {
            return parsed.map((facility, index) => normalizeFacility(facility, facility.id || `facility-${index}`));
          }
        } catch (e) {
          console.error('Failed to parse temple facilities', e);
        }
      }
    }
    return DEFAULT_FACILITIES;
  });

  // Load live facilities from temple profile endpoint with fallback
  useEffect(() => {
    async function loadLiveFacilities() {
      try {
        const res = await fetch('/api/v1/temples/temple_vidyashankara/info?trustId=trust_sringeri');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.facilities && json.data.facilities.length > 0) {
            const mapped: FacilityItem[] = json.data.facilities.map((f: any) => ({
              id: f.facilityCode || f.id,
              name: f.name,
              description: f.descriptionJson?.description || `${f.name} for visiting devotees.`,
              enabled: f.isActive,
              icon: (f.facilityCode || 'home') as FacilityIconName
            }));
            setFacilities(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local facilities fallback');
      }
    }

    loadLiveFacilities();
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleFacility = (id: string) => {
    setFacilities(prev => prev.map(facility =>
      facility.id === id ? { ...facility, enabled: !facility.enabled } : facility
    ));
  };

  const [newFacilityName, setNewFacilityName] = useState('');
  const [newFacilityDesc, setNewFacilityDesc] = useState('');
  const [newFacilityIcon, setNewFacilityIcon] = useState<FacilityIconName>('home');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIcon, setEditIcon] = useState<FacilityIconName>('home');

  const handleAddFacility = () => {
    if (!newFacilityName.trim()) {
      alert("Please enter a facility name.");
      return;
    }
    const cleanName = newFacilityName.trim();
    const facilityId = cleanName.toLowerCase().replace(/\s+/g, '-');

    if (facilities.some((f) => f.id === facilityId)) {
      setDuplicateError("A facility with this name already exists.");
      return;
    }

    const newItem: FacilityItem = {
      id: facilityId,
      name: cleanName,
      description: newFacilityDesc.trim() || `${cleanName} facility for devotees.`,
      enabled: true,
      icon: newFacilityIcon
    };

    setFacilities([...facilities, newItem]);
    setNewFacilityName('');
    setNewFacilityDesc('');
    setNewFacilityIcon('home');
    setDuplicateError(null);
    setShowAddForm(false);
  };

  const startEdit = (facility: FacilityItem) => {
    setEditingId(facility.id);
    setEditName(facility.name);
    setEditDesc(facility.description);
    setEditIcon(facility.icon as FacilityIconName);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) {
      alert("Name cannot be empty.");
      return;
    }
    setFacilities(prev => prev.map(f => 
      f.id === id ? { ...f, name: editName.trim(), description: editDesc.trim(), icon: editIcon } : f
    ));
    setEditingId(null);
  };

  const handleDeleteFacility = (id: string) => {
    if (confirm("Are you sure you want to delete this facility?")) {
      setFacilities(prev => prev.filter(f => f.id !== id));
    }
  };

  const [isDraft, setIsDraft] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_temple_facilities_draft');
      return cached === 'true';
    }
    return false;
  });

  const handleSave = (publish: boolean) => {
    setIsSaving(true);
    setSuccess(false);

    setTimeout(() => {
      localStorage.setItem('sankalpvani_temple_facilities', JSON.stringify(facilities));
      localStorage.setItem('sankalpvani_temple_facilities_draft', (!publish).toString());
      setIsDraft(!publish);
      setIsSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(true);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 border border-green-200 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-green-600 animate-bounce" />
          <span className="font-sans text-sm font-semibold">Temple facilities updated successfully!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-primary-container/10 rounded-full text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary tracking-wider uppercase mb-0.5">
              <span>Masters</span>
              <ChevronRight size={12} className="text-on-surface-variant" />
              <span>Temple Facilities Master</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-3xl font-semibold text-primary">Temple Facilities Setup</h2>
              {isDraft ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Draft
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-on-primary-container text-on-primary text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Close Setup Form' : 'Create New Facility'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add New Facility Card */}
        {showAddForm && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6 animate-[scaleIn_0.15s_ease-out]">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle size={18} className="text-primary" />
              <h3 className="font-serif text-lg font-bold text-primary">Add New Facility</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Facility Name</label>
                <input
                  type="text"
                  placeholder="e.g., Cloak Room, Library"
                  value={newFacilityName}
                  onChange={(e) => {
                    setNewFacilityName(e.target.value);
                    setDuplicateError(null);
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-on-surface"
                />
                {duplicateError && (
                  <p className="text-xs text-red-600 font-semibold mt-1">{duplicateError}</p>
                )}
              </div>
              
              <div className="md:col-span-5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Secure room to store bags & shoes"
                  value={newFacilityDesc}
                  onChange={(e) => setNewFacilityDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-on-surface"
                />
              </div>
              
              <div className="md:col-span-3 flex gap-2">
                <div className="flex-grow">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Icon</label>
                  <select
                    value={newFacilityIcon}
                    onChange={(e) => setNewFacilityIcon(e.target.value as FacilityIconName)}
                    className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-on-surface"
                  >
                    <option value="building2">🏢 Choultry/Hall</option>
                    <option value="bath">🚿 Restrooms</option>
                    <option value="hotel">🏨 Accommodation</option>
                    <option value="utensils">🍴 Dining Hall</option>
                    <option value="sparkles">✨ Special Pooja</option>
                    <option value="droplets">💧 Drinking Water</option>
                    <option value="gift">🎁 Prasadam Counter</option>
                    <option value="home">🏡 General/Home</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddFacility}
                  className="bg-primary text-on-primary hover:bg-on-primary-container px-5 h-[42px] rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 self-end"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Facilities List Card */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home size={18} className="text-primary" />
            <h3 className="font-serif text-xl font-bold text-primary">Available Guest Facilities</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-6">
            Enable, disable, update, or remove temple amenities available to devotees and guests.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((facility) => {
              const isEditing = editingId === facility.id;
              return (
                <div
                  key={facility.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    facility.enabled
                      ? 'border-primary/30 bg-primary-container/10'
                      : 'border-outline-variant/40 bg-surface-container-low'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Facility Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-grow">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Icon</label>
                          <select
                            value={editIcon}
                            onChange={(e) => setEditIcon(e.target.value as FacilityIconName)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3 py-1.5 text-xs text-on-surface"
                          >
                            <option value="building2">🏢 Choultry/Hall</option>
                            <option value="bath">🚿 Restrooms</option>
                            <option value="hotel">🏨 Accommodation</option>
                            <option value="utensils">🍴 Dining Hall</option>
                            <option value="sparkles">✨ Special Pooja</option>
                            <option value="droplets">💧 Drinking Water</option>
                            <option value="gift">🎁 Prasadam Counter</option>
                            <option value="home">🏡 General/Home</option>
                          </select>
                        </div>
                        <div className="flex gap-1.5 self-end">
                          <button
                            type="button"
                            onClick={() => saveEdit(facility.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="bg-surface-container-high hover:bg-surface-container text-on-surface-variant text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${facility.enabled ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                          {React.createElement(iconMap[facility.icon as FacilityIconName] || iconMap.home, { size: 16 })}
                        </div>
                        <div>
                          <h4 className="font-sans text-sm font-bold text-on-surface">{facility.name}</h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{facility.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(facility)}
                            className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container transition-all cursor-pointer"
                            title="Edit Facility"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFacility(facility.id)}
                            className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50/50 transition-all cursor-pointer"
                            title="Delete Facility"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFacility(facility.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${facility.enabled ? 'bg-primary' : 'bg-outline-variant'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${facility.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-high rounded-2xl p-6 border border-outline-variant/30 text-center flex flex-col items-center">
          <ShieldCheck size={20} className="text-primary mb-2" />
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
            These facility settings will be reflected in temple visitor-facing modules and admin summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center w-full max-w-md">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="flex-1 bg-surface-container-low hover:bg-primary-container/10 border border-outline-variant/40 text-on-surface-variant hover:text-primary py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="flex-grow bg-primary hover:bg-on-primary-container text-on-primary py-3 px-6 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle size={16} />
              <span>Save & Publish</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
