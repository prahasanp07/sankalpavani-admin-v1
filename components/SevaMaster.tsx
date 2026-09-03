'use client';

import React, { useState, useEffect } from 'react';
import TimeRangePicker from './TimeRangePicker';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Sparkles,
  BookOpen,
  ChevronRight,
  Info,
  Clock,
  Search,
  ChevronLeft,
  Download
} from 'lucide-react';
import RequirePermission from './RequirePermission';

interface Seva {
  id: string;
  name: string;
  price: number;
  capacity: number;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Annually' | 'Dhanur Masa' | 'Special';
  isActive: boolean;
  personsPerSeva?: number;
  extraPersonCost?: number;
  aboutSeva?: string;
  instructions?: string;
  timeRange?: string;
  isDraft?: boolean;
  selectedDays?: string[];
  selectedDate?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SevaMasterProps {
  onBack: () => void;
}

const DEFAULT_SEVAS: Seva[] = [
  { id: '1', name: 'Archana Pooja', price: 101, capacity: 200, type: 'Daily', isActive: true, timeRange: '06:00 AM - 08:30 PM' },
  { id: '2', name: 'Maha Abhisheka', price: 1500, capacity: 5, type: 'Weekly', isActive: true, timeRange: '06:00 AM - 08:00 AM' },
  { id: '3', name: 'Annadanam Seva', price: 2100, capacity: 10, type: 'Daily', isActive: true, timeRange: '12:00 PM - 02:30 PM' },
  { id: '4', name: 'Vahan Pooja', price: 1100, capacity: 15, type: 'Daily', isActive: true, timeRange: '09:00 AM - 05:00 PM' },
  { id: '5', name: 'Chandi Homa', price: 5001, capacity: 1, type: 'Special', isActive: true, timeRange: '07:00 AM - 11:30 AM' },
  { id: '6', name: 'Sahasranama Archana', price: 501, capacity: 50, type: 'Monthly', isActive: true, timeRange: '05:30 PM - 07:00 PM' }
];

export default function SevaMaster({ onBack }: SevaMasterProps) {
  const [sevas, setSevas] = useState<Seva[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_sevas');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) { }
      }
    }
    return DEFAULT_SEVAS;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Seva | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // New Seva Form State
  const [newSeva, setNewSeva] = useState({
    name: '',
    price: 150,
    capacity: 20,
    type: 'Daily' as Seva['type'],
    isActive: true,
    personsPerSeva: 1,
    extraPersonCost: 0,
    aboutSeva: '',
    instructions: '',
    timeRange: '06:00 AM - 12:30 PM',
    selectedDays: [] as string[],
    selectedDate: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load from backend API with fallback
  useEffect(() => {
    async function loadLiveSevas() {
      try {
        const res = await fetch('/api/v1/temples/temple_vidyashankara/sevas?trustId=trust_sringeri');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped: Seva[] = json.data.map((s: any) => ({
              id: s.id,
              name: s.name,
              price: Number(s.price),
              capacity: s.maxCapacityPerSlot,
              type: s.category as any,
              isActive: s.isActive,
              timeRange: s.timingsDisplay,
              personsPerSeva: s.includedPersons,
              extraPersonCost: Number(s.extraPersonPrice),
              aboutSeva: s.description,
              instructions: s.instructions
            }));
            setSevas(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local sevas fallback');
      }

      const cached = localStorage.getItem('sankalpvani_sevas');
      if (!cached) {
        localStorage.setItem('sankalpvani_sevas', JSON.stringify(DEFAULT_SEVAS));
      }
    }

    loadLiveSevas();
  }, []);

  const saveToStorage = (updated: Seva[]) => {
    setSevas(updated);
    localStorage.setItem('sankalpvani_sevas', JSON.stringify(updated));
  };

  const handleStartEdit = (seva: Seva) => {
    setEditingId(seva.id);
    setEditForm({ ...seva });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    const updated = sevas.map(s => s.id === editForm.id ? editForm : s);
    saveToStorage(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleCreateSeva = async (publish: boolean) => {
    if (!newSeva.name.trim()) return;

    // Duplicate check
    const isDuplicate = sevas.some(s => s.name.trim().toLowerCase() === newSeva.name.trim().toLowerCase());
    if (isDuplicate) {
      alert(`A Seva with the name "${newSeva.name}" already exists.`);
      return;
    }

    const added: Seva = {
      id: Date.now().toString(),
      name: newSeva.name.trim(),
      price: Number(newSeva.price) || 0,
      capacity: Number(newSeva.capacity) || 1,
      type: newSeva.type,
      isActive: publish,
      isDraft: !publish,
      personsPerSeva: Number(newSeva.personsPerSeva) || 1,
      extraPersonCost: Number(newSeva.extraPersonCost) || 0,
      aboutSeva: newSeva.aboutSeva || '',
      instructions: newSeva.instructions || '',
      timeRange: newSeva.timeRange || '06:00 AM - 12:30 PM',
      selectedDays: newSeva.selectedDays,
      selectedDate: newSeva.selectedDate,
      dateFrom: newSeva.dateFrom,
      dateTo: newSeva.dateTo
    };

    try {
      await fetch('/api/v1/temples/temple_vidyashankara/sevas?trustId=trust_sringeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: `SEVA-${Date.now().toString().slice(-4)}`,
          name: added.name,
          category: added.type,
          description: added.aboutSeva || added.name,
          instructions: added.instructions,
          price: added.price.toString(),
          includedPersons: added.personsPerSeva || 1,
          extraPersonPrice: (added.extraPersonCost ?? 0).toString(),
          maxCapacityPerSlot: added.capacity,
          reportingTime: (added.timeRange || '06:00 AM').split(' - ')[0],
          timingsDisplay: added.timeRange || '06:00 AM - 12:30 PM'
        })
      });
    } catch (e) {
      console.warn('Backend create seva fallback to local');
    }

    const updated = [...sevas, added];
    saveToStorage(updated);

    window.dispatchEvent(new Event('sankalpvani_sevas_updated'));
    setCurrentPage(1);

    setNewSeva({
      name: '',
      price: 150,
      capacity: 20,
      type: 'Daily',
      isActive: true,
      personsPerSeva: 1,
      extraPersonCost: 0,
      aboutSeva: '',
      instructions: '',
      timeRange: '06:00 AM - 12:30 PM',
      selectedDays: [],
      selectedDate: '',
      dateFrom: '',
      dateTo: ''
    });
    setShowAddForm(false);
  };

  const handleAddSeva = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateSeva(true);
  };

  const handleDeleteSeva = (id: string) => {
    if (confirm('Are you sure you want to retire this seva offering? Existing bookings remain in history.')) {
      const updated = sevas.filter(s => s.id !== id);
      saveToStorage(updated);
    }
  };

  const toggleActive = (id: string) => {
    const updated = sevas.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
  };
  // Filtered sevas based on search query and category type filter
  const filteredSevas = sevas.filter(s => {
    const matchesSearch = (() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.type.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
      );
    })();

    const matchesType = (() => {
      if (selectedTypeFilter === 'All') return true;
      return s.type === selectedTypeFilter;
    })();

    return matchesSearch && matchesType;
  });

  const exportToCSV = () => {
    // Generate CSV content from filtered sevas
    const headers = ['Offering ID', 'Ritual Offering Name', 'Category Type', 'Price Ticket (INR)', 'Daily Limit Capacity', 'Status Offer', 'Extra Person Cost (INR)', 'Persons Max', 'Time Range'];
    const rows = filteredSevas.map(s => [
      `SV-SV-${s.id.padStart(3, '0')}`,
      s.name,
      s.type,
      s.price,
      s.capacity === 999999 ? 'Unlimited' : s.capacity,
      s.isActive ? 'Active' : 'Suspended',
      s.extraPersonCost ?? 0,
      s.personsPerSeva ?? 1,
      s.timeRange ?? ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seva_offerings_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginated sevas
  const totalItems = filteredSevas.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedSevas = filteredSevas.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
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
              <span>Seva/Pooja Master</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-primary">Seva offerings Setup</h2>
          </div>
        </div>

        <RequirePermission 
          permission="MANAGE_SEVAS" 
          showLockedUI={true} 
          lockedMessage="Setup Capability Locked"
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary hover:bg-on-primary-container text-on-primary text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{showAddForm ? 'Close Setup Form' : 'Create New Seva'}</span>
          </button>
        </RequirePermission>
      </div>

      {/* Inline Registration Form */}
      {showAddForm && (
        <form onSubmit={handleAddSeva} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4 animate-[scaleIn_0.15s_ease-out]">
          <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
            <BookOpen size={18} />
            New Seva Booking Definition
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Seva Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Swarna Pushpa Archana"
                value={newSeva.name}
                onChange={(e) => setNewSeva({ ...newSeva, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-primary ${newSeva.name.trim() && sevas.some(s => s.name.trim().toLowerCase() === newSeva.name.trim().toLowerCase())
                  ? 'border-error text-error focus:border-error focus:ring-error'
                  : 'border-outline'
                  }`}
              />
              {newSeva.name.trim() && sevas.some(s => s.name.trim().toLowerCase() === newSeva.name.trim().toLowerCase()) && (
                <p className="text-[11px] text-error font-semibold mt-1">A Seva with this name already exists.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1"># Persons per Seva *</label>
              <input
                type="number"
                required
                min={1}
                value={newSeva.personsPerSeva}
                onChange={(e) => setNewSeva({ ...newSeva, personsPerSeva: Number(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min={1}
                value={newSeva.price}
                onChange={(e) => setNewSeva({ ...newSeva, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Extra Person Cost (₹)</label>
              <input
                type="number"
                min={0}
                value={newSeva.extraPersonCost}
                onChange={(e) => setNewSeva({ ...newSeva, extraPersonCost: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Daily Slot Capacity *</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  required
                  min={1}
                  disabled={newSeva.capacity === 999999}
                  value={newSeva.capacity === 999999 ? '' : newSeva.capacity}
                  onChange={(e) => setNewSeva({ ...newSeva, capacity: Number(e.target.value) || 1 })}
                  placeholder={newSeva.capacity === 999999 ? 'Unlimited' : 'e.g. 20'}
                  className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary disabled:bg-surface-container-low disabled:text-on-surface-variant/40"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="checkbox"
                    id="new-seva-unlimited"
                    checked={newSeva.capacity === 999999}
                    onChange={(e) => setNewSeva({ ...newSeva, capacity: e.target.checked ? 999999 : 20 })}
                    className="w-3.5 h-3.5 text-primary border-outline rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="new-seva-unlimited" className="text-xs font-bold text-on-surface-variant uppercase cursor-pointer select-none">Unlimited</label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">About Seva</label>
              <textarea
                rows={3}
                placeholder="Describe the significance and process of this seva..."
                value={newSeva.aboutSeva}
                onChange={(e) => setNewSeva({ ...newSeva, aboutSeva: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Instructions</label>
              <textarea
                rows={3}
                placeholder="Dress code, report time guidelines, items to bring..."
                value={newSeva.instructions}
                onChange={(e) => setNewSeva({ ...newSeva, instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Seva Type & Schedule Settings */}
          <div className="border-t divider-gold pt-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2.5">Seva Type & Performance</h4>
              <div className="flex gap-2 flex-wrap">
                {(['Daily', 'Weekly', 'Monthly', 'Annually', 'Special', 'Dhanur Masa'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewSeva({ ...newSeva, type: t })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${newSeva.type === t
                      ? 'bg-primary-container/20 text-primary border-primary'
                      : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional input fields based on Seva Type */}
            <div className="p-4 bg-white border border-outline-variant/25 rounded-2xl max-w-md space-y-4 shadow-sm animate-[fadeIn_0.15s_ease-out]">
              {newSeva.type === 'Weekly' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Day selection *</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => {
                      const isSelected = newSeva.selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const nextDays = isSelected
                              ? newSeva.selectedDays.filter(d => d !== day)
                              : [...newSeva.selectedDays, day];
                            setNewSeva({ ...newSeva, selectedDays: nextDays });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(newSeva.type === 'Monthly' || newSeva.type === 'Special' || newSeva.type === 'Annually') && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date selection *</label>
                  <input
                    type="date"
                    required
                    value={newSeva.selectedDate}
                    onChange={(e) => setNewSeva({ ...newSeva, selectedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              )}

              {newSeva.type === 'Dhanur Masa' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date selection *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-on-surface-variant/70 uppercase">From</span>
                      <input
                        type="date"
                        required
                        value={newSeva.dateFrom}
                        onChange={(e) => setNewSeva({ ...newSeva, dateFrom: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <span className="text-on-surface-variant/40 font-bold self-end pb-1.5 text-xs">to</span>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-on-surface-variant/70 uppercase">To</span>
                      <input
                        type="date"
                        required
                        value={newSeva.dateTo}
                        onChange={(e) => setNewSeva({ ...newSeva, dateTo: e.target.value })}
                        className="w-full px-2 py-1.5 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seva duration / Performance Timing - Always appears */}
              <div className="space-y-1.5 pt-2.5 border-t border-outline-variant/10">
                <TimeRangePicker
                  value={newSeva.timeRange}
                  onChange={(val) => setNewSeva({ ...newSeva, timeRange: val })}
                  label="Seva duration / Performance Timing"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pt-3 border-t divider-gold gap-2.5">
            <button
              type="button"
              disabled={!newSeva.name.trim() || sevas.some(s => s.name.trim().toLowerCase() === newSeva.name.trim().toLowerCase())}
              onClick={() => handleCreateSeva(false)}
              className="px-4 py-2.5 bg-surface-container-low hover:bg-primary-container/10 border border-outline-variant/40 text-on-surface-variant hover:text-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={
                !newSeva.name.trim() ||
                sevas.some(s => s.name.trim().toLowerCase() === newSeva.name.trim().toLowerCase()) ||
                Number(newSeva.price) <= 0 ||
                Number(newSeva.capacity) <= 0
              }
              onClick={() => handleCreateSeva(true)}
              className="px-5 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Publish
            </button>
          </div>
        </form>
      )}

      {/* Main Seva offerings list */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sacred border border-outline-variant/30 overflow-hidden">
        {/* Search and Table Actions Header Row */}
        <div className="p-4 bg-surface-container/10 border-b border-outline-variant/20 flex flex-col xl:flex-row gap-4 items-center justify-between">
          {/* Search bar on left */}
          <div className="relative w-full xl:max-w-xs shrink-0">
            <input
              type="text"
              placeholder="Search by Seva name or type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="absolute left-3 top-2.5 text-on-surface-variant/40">
              <Search size={16} />
            </div>
          </div>

          {/* Category Filter Pills in the middle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-outline-variant/30 overflow-x-auto max-w-full scrollbar-none gap-0.5 my-1 xl:my-0">
            {['All', 'Daily', 'Weekly', 'Monthly', 'Annually', 'Special', 'Dhanur Masa'].map((typeOpt) => {
              const isActive = selectedTypeFilter === typeOpt;
              return (
                <button
                  key={typeOpt}
                  type="button"
                  onClick={() => {
                    setSelectedTypeFilter(typeOpt);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                    }`}
                >
                  {typeOpt}
                </button>
              );
            })}
          </div>

          {/* Export CSV button on the right */}
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shrink-0 w-full xl:w-auto justify-center"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b divider-gold text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-4 px-6">Offering ID</th>
                <th className="py-4 px-6">Ritual Offering Name</th>
                <th className="py-4 px-6">Category Type</th>
                <th className="py-4 px-6">Price Ticket (₹)</th>
                <th className="py-4 px-6 text-center">Daily Limit Capacity</th>
                <th className="py-4 px-6 text-center">Status Offer</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-on-surface divide-y divide-outline-variant/10">
              {paginatedSevas.map((s) => {
                const isEditing = editingId === s.id;
                return (
                  <tr key={s.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-primary font-bold">
                      #SV-SV-{s.id.padStart(3, '0')}
                    </td>

                    <td className="py-4 px-6 min-w-[200px]">
                      {isEditing && editForm ? (
                        <div className="space-y-2 py-1">
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Seva Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-sm font-bold focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Perform Timings</label>
                            <input
                              type="text"
                              value={editForm.timeRange ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, timeRange: e.target.value })}
                              className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs font-semibold focus:outline-none focus:border-primary font-mono"
                              placeholder="e.g. 06:00 AM - 12:30 PM"
                            />
                          </div>

                          {/* Edit Schedule parameters */}
                          {editForm.type === 'Weekly' && (
                            <div>
                              <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Days (comma separated)</label>
                              <input
                                type="text"
                                value={editForm.selectedDays?.join(', ') ?? ''}
                                onChange={(e) => setEditForm({ ...editForm, selectedDays: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
                                placeholder="e.g. Sun, Mon, Tue"
                              />
                            </div>
                          )}

                          {(editForm.type === 'Monthly' || editForm.type === 'Special' || editForm.type === 'Annually') && (
                            <div>
                              <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Selected Date</label>
                              <input
                                type="date"
                                value={editForm.selectedDate ?? ''}
                                onChange={(e) => setEditForm({ ...editForm, selectedDate: e.target.value })}
                                className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
                              />
                            </div>
                          )}

                          {editForm.type === 'Dhanur Masa' && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <div>
                                <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">From Date</label>
                                <input
                                  type="date"
                                  value={editForm.dateFrom ?? ''}
                                  onChange={(e) => setEditForm({ ...editForm, dateFrom: e.target.value })}
                                  className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">To Date</label>
                                <input
                                  type="date"
                                  value={editForm.dateTo ?? ''}
                                  onChange={(e) => setEditForm({ ...editForm, dateTo: e.target.value })}
                                  className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary font-mono"
                                />
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-2">
                            <div>
                              <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">No. of Persons</label>
                              <input
                                type="number"
                                min={1}
                                value={editForm.personsPerSeva ?? 1}
                                onChange={(e) => setEditForm({ ...editForm, personsPerSeva: Number(e.target.value) })}
                                className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">About Seva</label>
                            <textarea
                              value={editForm.aboutSeva ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, aboutSeva: e.target.value })}
                              className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
                              rows={1}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Instructions</label>
                            <textarea
                              value={editForm.instructions ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                              className="w-full px-2.5 py-1 bg-white border border-outline rounded-lg text-xs focus:outline-none focus:border-primary"
                              rows={1}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-1">
                          <span className="font-bold text-on-surface block text-sm">{s.name}</span>
                          <div className="flex flex-wrap gap-1.5 items-center mt-1">
                            {s.timeRange && (
                              <span className="text-[10px] text-primary bg-primary-container/20 px-2 py-0.5 border border-primary/10 rounded-full font-semibold flex items-center gap-1.5 w-fit font-mono">
                                <Clock size={11} className="text-primary shrink-0" /> {s.timeRange}
                              </span>
                            )}
                            {s.type === 'Weekly' && s.selectedDays && s.selectedDays.length > 0 && (
                              <span className="text-[10px] text-secondary bg-secondary-container/20 px-2 py-0.5 border border-secondary/10 rounded-full font-semibold">
                                Days: {s.selectedDays.join(', ')}
                              </span>
                            )}
                            {(s.type === 'Monthly' || s.type === 'Special' || s.type === 'Annually') && s.selectedDate && (
                              <span className="text-[10px] text-secondary bg-secondary-container/20 px-2 py-0.5 border border-secondary/10 rounded-full font-semibold font-mono">
                                Date: {s.selectedDate}
                              </span>
                            )}
                            {s.type === 'Dhanur Masa' && s.dateFrom && s.dateTo && (
                              <span className="text-[10px] text-secondary bg-secondary-container/20 px-2 py-0.5 border border-secondary/10 rounded-full font-semibold font-mono">
                                Range: {s.dateFrom} to {s.dateTo}
                              </span>
                            )}
                            {s.personsPerSeva && (
                              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold">
                                {s.personsPerSeva} {s.personsPerSeva === 1 ? 'person' : 'persons'} max
                              </span>
                            )}
                          </div>
                          {s.aboutSeva && (
                            <p className="text-xs text-on-surface-variant/80 font-normal leading-relaxed max-w-sm">
                              {s.aboutSeva}
                            </p>
                          )}
                          {s.instructions && (
                            <p className="text-[11px] text-on-surface-variant/65 italic leading-relaxed max-w-sm">
                              <span className="font-bold not-italic text-[10px] text-on-surface-variant/85 uppercase">Instr:</span> {s.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {isEditing && editForm ? (
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Seva['type'] })}
                          className="px-2 py-1 bg-white border border-outline rounded-lg text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Annually">Annually</option>
                          <option value="Special">Special</option>
                          <option value="Dhanur Masa">Dhanur Masa</option>
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/20 text-xs font-semibold text-on-surface-variant">
                          {s.type}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {isEditing && editForm ? (
                        <div className="space-y-2 py-1">
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Base Price</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              className="w-24 px-2 py-1 bg-white border border-outline rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-on-surface-variant font-bold block mb-0.5">Extra Person</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.extraPersonCost ?? 0}
                              onChange={(e) => setEditForm({ ...editForm, extraPersonCost: Number(e.target.value) })}
                              className="w-24 px-2 py-1 bg-white border border-outline rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-bold text-on-surface block text-sm">₹{s.price.toLocaleString()}</span>
                          {s.extraPersonCost && s.extraPersonCost > 0 ? (
                            <span className="text-[10px] text-on-surface-variant/75 font-medium block whitespace-nowrap">
                              +₹{s.extraPersonCost.toLocaleString()}/extra person
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      {isEditing && editForm ? (
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            disabled={editForm.capacity === 999999}
                            value={editForm.capacity === 999999 ? '' : editForm.capacity}
                            onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) || 1 })}
                            placeholder={editForm.capacity === 999999 ? '∞' : 'Qty'}
                            className="w-16 px-2 py-1 bg-white border border-outline rounded-lg text-sm text-center disabled:bg-surface-container-low disabled:text-on-surface-variant/40"
                          />
                          <label className="flex items-center gap-1 cursor-pointer select-none text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                            <input
                              type="checkbox"
                              checked={editForm.capacity === 999999}
                              onChange={(e) => setEditForm({ ...editForm, capacity: e.target.checked ? 999999 : 20 })}
                              className="w-3 h-3 text-primary border-outline rounded accent-primary"
                            />
                            <span>Inf</span>
                          </label>
                        </div>
                      ) : (
                        <span className="font-mono text-xs font-bold text-on-surface-variant">
                          {s.capacity === 999999 ? 'Unlimited' : `${s.capacity} bookings/day`}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <button
                          onClick={() => toggleActive(s.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border cursor-pointer transition-all active:scale-95 ${s.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                        >
                          {s.isActive ? 'Active' : 'Suspended'}
                        </button>
                        {s.isDraft && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            Draft
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 hover:bg-green-100 text-green-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-red-100 text-red-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleStartEdit(s)}
                            className="p-1.5 hover:bg-primary-container/10 text-primary rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSeva(s.id)}
                            className="p-1.5 hover:bg-error-container text-error rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
        <div className="p-4 bg-surface-container/5 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-on-surface-variant font-medium">
            {totalItems > 0 ? (
              <span>Showing {startIndex + 1} to {endIndex} of {totalItems} entries</span>
            ) : (
              <span>No entries found</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Show entries select */}
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant shrink-0">
              <span>Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 bg-white border border-outline rounded-lg focus:outline-none focus:border-primary text-xs font-bold"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const isActive = p === activePage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'border border-outline-variant/35 bg-white text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seva guidelines alert info banner */}
      <div className="bg-primary-container/10 border border-primary/20 p-4 rounded-xl flex gap-3">
        <Info className="text-primary shrink-0" size={18} />
        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          <strong>Setup Compliance:</strong> Changing the ticket price of any seva will instantly propagate to the live online booking terminal. Existing pre-booked receipts will remain valid at their purchase values. Daily slot capacity limit resets automatically at midnight IST.
        </p>
      </div>
    </div>
  );
}
