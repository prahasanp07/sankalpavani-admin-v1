'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Plus,
  X,
  Search
} from 'lucide-react';

interface Shift {
  id: string;
  priestName: string;
  sevaName: string;
  date: string;
  slot: 'Morning (06:00 AM)' | 'Noon (11:00 AM)' | 'Evening (05:00 PM)';
  isDraft?: boolean;
}

interface SchedulingProps {
  onBack: () => void;
}

const INITIAL_SHIFTS: Shift[] = [
  { id: '1', priestName: 'Raghavan Bhattar', sevaName: 'Maha Abhisheka', date: '2026-06-28', slot: 'Morning (06:00 AM)' },
  { id: '2', priestName: 'Sunder Raman', sevaName: 'Archana Pooja', date: '2026-06-28', slot: 'Morning (06:00 AM)' },
  { id: '3', priestName: 'Madhavan Shastri', sevaName: 'Annadanam Seva', date: '2026-06-28', slot: 'Noon (11:00 AM)' },
  { id: '4', priestName: 'Madhavan Shastri', sevaName: 'Vahan Pooja', date: '2026-06-28', slot: 'Evening (05:00 PM)' },
  { id: '5', priestName: 'Sunder Raman', sevaName: 'Chandi Homa', date: '2026-06-29', slot: 'Morning (06:00 AM)' }
];

export default function Scheduling({ onBack }: SchedulingProps) {
  const [shifts, setShifts] = useState<Shift[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sankalpvani_shifts');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return INITIAL_SHIFTS;
  });
  
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-28');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [rosterSearch, setRosterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave'>('All');

  const DEFAULT_PRIESTS = [
    { name: 'Raghavan Bhattar', role: 'Chief Archaka', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { name: 'Sunder Raman', role: 'Second Priest', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Madhavan Shastri', role: 'Purohit', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { name: 'Vasudevan Swamy', role: 'Assistant Priest', status: 'On Leave', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
    { name: 'Ganesha Dikshidar', role: 'Rigveda Scholar', status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
  ];

  const getWeekDates = (dateStr: string) => {
    // If selectedDate is invalid, default to '2026-06-28'
    let baseDate = new Date(dateStr);
    if (isNaN(baseDate.getTime())) {
      baseDate = new Date('2026-06-28');
    }
    const dayOfWeek = baseDate.getDay(); // 0 for Sunday
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - dayOfWeek);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      dates.push({
        name: dayNames[i],
        dateNum: d.getDate(),
        formattedDate: `${dd} ${monthNames[d.getMonth()]}`,
        value: `${yyyy}-${mm}-${dd}`
      });
    }
    return dates;
  };
  // Form states
  const [formPriest, setFormPriest] = useState('Raghavan Bhattar');
  const [formSeva, setFormSeva] = useState('Archana Pooja');
  const [formSlot, setFormSlot] = useState<Shift['slot']>('Morning (06:00 AM)');

  const [priestsData, setPriestsData] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const cachedPriests = localStorage.getItem('sankalpvani_priests');
      if (cachedPriests) {
        try {
          return JSON.parse(cachedPriests);
        } catch (e) {}
      }
    }
    return [];
  });

  const [activePriests, setActivePriests] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const cachedPriests = localStorage.getItem('sankalpvani_priests');
      if (cachedPriests) {
        try {
          const parsed = JSON.parse(cachedPriests);
          return parsed.map((p: any) => p.name);
        } catch (e) {}
      }
    }
    return ['Raghavan Bhattar', 'Sunder Raman', 'Madhavan Shastri', 'Vasudevan Swamy', 'Ganesha Dikshidar'];
  });

  useEffect(() => {
    const loadPriests = () => {
      const cachedPriests = localStorage.getItem('sankalpvani_priests');
      if (cachedPriests) {
        try {
          const parsed = JSON.parse(cachedPriests);
          setPriestsData(parsed);
          setActivePriests(parsed.map((p: any) => p.name));
          if (parsed.length > 0 && !parsed.map((p: any) => p.name).includes(formPriest)) {
            setFormPriest(parsed[0].name);
          }
        } catch (e) {}
      }
    };
    loadPriests();
    window.addEventListener('sankalpvani_priests_updated', loadPriests);
    return () => window.removeEventListener('sankalpvani_priests_updated', loadPriests);
  }, [formPriest]);

  // Load shifts from live backend API
  useEffect(() => {
    async function loadLiveShifts() {
      try {
        const res = await fetch('/api/v1/temples/temple_vidyashankara/shifts?trustId=trust_sringeri');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped: Shift[] = json.data.map((s: any) => ({
              id: s.id,
              priestName: s.personProfileId || 'Raghavan Bhattar',
              sevaName: s.shiftName || 'Maha Abhisheka',
              date: s.startAt.split('T')[0],
              slot: '09:00 AM - 12:00 PM'
            }));
            setShifts(mapped);
            return;
          }
        }
      } catch (err) {
        console.warn('Using local shifts fallback');
      }
    }
    loadLiveShifts();
  }, []);

  const displayPriests = priestsData.length > 0 
    ? priestsData.map((p, idx) => ({
        ...p,
        role: p.role || (idx === 0 ? 'Chief Archaka' : 'Archaka'),
        avatar: p.avatar || DEFAULT_PRIESTS[idx % DEFAULT_PRIESTS.length].avatar
      }))
    : DEFAULT_PRIESTS;

  const filteredPriests = displayPriests.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                          p.role.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const weekDays = getWeekDates(selectedDate);

  const handleCreateShift = (publish: boolean) => {
    // Check for double assignment conflict (same priest, same date, same slot)
    const conflict = shifts.find(s => s.priestName === formPriest && s.date === selectedDate && s.slot === formSlot);
    if (conflict) {
      alert(`Conflict Detected! Acharya ${formPriest} is already assigned to "${conflict.sevaName}" during ${formSlot} on this date.`);
      return;
    }

    // Check if the priest is currently marked "On Leave" in the Priest registry
    const priestRecord = priestsData.find(p => p.name === formPriest);
    if (priestRecord?.status === 'On Leave') {
      alert(`Cannot Assign Duty! Acharya ${formPriest} is currently marked "On Leave" in the Archakas Registry.`);
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      priestName: formPriest,
      sevaName: formSeva,
      date: selectedDate,
      slot: formSlot,
      isDraft: !publish
    };

    try {
      fetch('/api/v1/temples/temple_vidyashankara/shifts?trustId=trust_sringeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priestProfileId: newShift.priestName,
          shiftName: newShift.sevaName,
          dutyType: 'PRIMARY',
          startAt: new Date(newShift.date),
          endAt: new Date(newShift.date)
        })
      }).catch(e => console.warn('Background shift assignment fallback'));
    } catch (e) {
      console.warn('Shift assignment error');
    }

    const updated = [...shifts, newShift];
    setShifts(updated);
    localStorage.setItem('sankalpvani_shifts', JSON.stringify(updated));
    setShowAssignForm(false);
    
    setToastMessage(publish ? `Assigned and published shift for Acharya ${formPriest}.` : `Saved shift draft for Acharya ${formPriest}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateShift(true);
  };

  const handleDeleteShift = (id: string) => {
    if (confirm('Cancel this archaka assignment?')) {
      const updated = shifts.filter(s => s.id !== id);
      setShifts(updated);
      localStorage.setItem('sankalpvani_shifts', JSON.stringify(updated));
    }
  };

  // Pre-generate next 4 days for the calendar columns
  const calendarDates = [
    { label: 'Today (28 Jun)', value: '2026-06-28' },
    { label: 'Tomorrow (29 Jun)', value: '2026-06-29' },
    { label: 'Tue (30 Jun)', value: '2026-06-30' },
    { label: 'Wed (01 Jul)', value: '2026-07-01' }
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle size={18} className="text-primary animate-pulse" />
          <span className="font-sans text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

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
              <span>Roster & Scheduling</span>
            </div>
            <h2 className="font-serif text-3xl font-semibold text-primary">Archakas Duty Roster</h2>
          </div>
        </div>

        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="bg-primary hover:bg-on-primary-container text-on-primary text-sm font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <Plus size={16} />
          <span>{showAssignForm ? 'Close Assignment Form' : 'Assign Duty Shift'}</span>
        </button>
      </div>

      {/* Conflict banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider">Automated Conflict Safeguards</h4>
          <p className="font-sans text-xs mt-0.5 leading-relaxed">
            The scheduling engine guards against dual-booking of archakas for concurrent sevas or while they are marked &quot;On Leave&quot; in the Archakas Registry.
          </p>
        </div>
      </div>

      {/* Inline Shift Assignment Form */}
      {showAssignForm && (
        <form onSubmit={handleAssign} className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4 animate-[scaleIn_0.15s_ease-out]">
          <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Assign Archaka Duty Shift
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Target Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Choose Archaka *</label>
              <select
                value={formPriest}
                onChange={(e) => setFormPriest(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-primary ${
                  (priestsData.find(p => p.name === formPriest)?.status === 'On Leave' || 
                   shifts.some(s => s.priestName === formPriest && s.date === selectedDate && s.slot === formSlot))
                    ? 'border-error text-error focus:border-error focus:ring-error'
                    : 'border-outline'
                }`}
              >
                {activePriests.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {priestsData.find(p => p.name === formPriest)?.status === 'On Leave' && (
                <p className="text-[11px] text-error font-semibold mt-1">Archaka is marked "On Leave".</p>
              )}
              {shifts.some(s => s.priestName === formPriest && s.date === selectedDate && s.slot === formSlot) && (
                <p className="text-[11px] text-error font-semibold mt-1">Archaka is already busy at this time.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Target Seva Pooja</label>
              <select
                value={formSeva}
                onChange={(e) => setFormSeva(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              >
                <option value="Archana Pooja">Archana Pooja</option>
                <option value="Maha Abhisheka">Maha Abhisheka</option>
                <option value="Annadanam Seva">Annadanam Seva</option>
                <option value="Vahan Pooja">Vahan Pooja</option>
                <option value="Chandi Homa">Chandi Homa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Shift Time Slot</label>
              <select
                value={formSlot}
                onChange={(e) => setFormSlot(e.target.value as Shift['slot'])}
                className="w-full px-3.5 py-2.5 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:border-primary"
              >
                <option value="Morning (06:00 AM)">Morning (06:00 AM)</option>
                <option value="Noon (11:00 AM)">Noon (11:00 AM)</option>
                <option value="Evening (05:00 PM)">Evening (05:00 PM)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t divider-gold flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="px-4 py-2.5 bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                priestsData.find(p => p.name === formPriest)?.status === 'On Leave' || 
                shifts.some(s => s.priestName === formPriest && s.date === selectedDate && s.slot === formSlot)
              }
              onClick={() => handleCreateShift(true)}
              className="px-5 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Publish
            </button>
          </div>
        </form>
      )}

      {/* Roster Search and Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sacred">
        <div className="flex flex-1 items-center gap-3 max-w-md bg-surface-container-low border border-outline-variant/50 rounded-xl px-4.5 py-2.5">
          <Search size={18} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search archakas or roles..."
            value={rosterSearch}
            onChange={(e) => setRosterSearch(e.target.value)}
            className="w-full bg-transparent text-sm font-medium focus:outline-none text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex rounded-xl bg-surface-container-low p-1 border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'All' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              All Archakas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'Active' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('On Leave')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'On Leave' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              On Leave
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Week Base Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/50 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Roster Table Grid layout */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sacred">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="py-4 px-6 w-64">Employee</th>
                {weekDays.map((day) => (
                  <th key={day.value} className="py-4 px-4 text-center border-l border-outline-variant/10">
                    <div>{day.name}</div>
                    <div className="text-[10px] text-on-surface-variant/70 normal-case mt-0.5">{day.formattedDate}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 text-sm font-medium text-on-surface">
              {filteredPriests.map((priest) => {
                return (
                  <tr key={priest.name} className="hover:bg-surface-container-low/20 transition-colors">
                    {/* Employee Profile Cell */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={priest.avatar}
                          alt={priest.name}
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 shadow-sm"
                        />
                        <div>
                          <h4 className="font-sans text-sm font-bold text-on-surface leading-tight">{priest.name}</h4>
                          <span className="text-[11px] text-on-surface-variant font-semibold mt-0.5 block">{priest.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* 7 Days Columns */}
                    {weekDays.map((day) => {
                      const dayShifts = shifts.filter(s => s.priestName === priest.name && s.date === day.value);
                      const isPriestOnLeave = priest.status === 'On Leave';
                      const hasShifts = dayShifts.length > 0;

                      return (
                        <td
                          key={day.value}
                          onDoubleClick={() => {
                            setSelectedDate(day.value);
                            setFormPriest(priest.name);
                            setShowAssignForm(true);
                          }}
                          className={`py-4 px-3 text-center align-top min-h-[100px] border-l border-outline-variant/10 relative cursor-pointer select-none transition-all ${
                            !hasShifts && !isPriestOnLeave
                              ? 'bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.015),rgba(0,0,0,0.015)_6px,transparent_6px,transparent_12px)] hover:bg-surface-container-low/20'
                              : 'hover:bg-surface-container-low/20'
                          }`}
                          title="Double-click to assign shift"
                        >
                          {/* Date number label inside cell */}
                          <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant/40 mb-2">
                            <span>{day.dateNum}</span>
                          </div>

                          {isPriestOnLeave ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200/50 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                              <span>Leave</span>
                            </div>
                          ) : hasShifts ? (
                            <div className="flex flex-col gap-2">
                              {dayShifts.map((shift) => {
                                const isMorning = shift.slot.includes('Morning');
                                const isNoon = shift.slot.includes('Noon');
                                const bgClass = isMorning
                                  ? 'bg-green-50 text-green-700 border-green-200/50 hover:bg-green-100/50'
                                  : isNoon
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/50 hover:bg-amber-100/50'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200/50 hover:bg-indigo-100/50';
                                
                                return (
                                  <div
                                    key={shift.id}
                                    className={`group/item border p-2 rounded-xl text-left relative transition-all shadow-sm ${bgClass}`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteShift(shift.id)}
                                      className="absolute right-1 top-1 p-0.5 bg-white text-red-600 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity cursor-pointer shadow-sm border border-red-100"
                                      title="Cancel Shift"
                                    >
                                      <X size={10} />
                                    </button>

                                    <div className="font-bold text-[11px] leading-tight pr-3 truncate" title={shift.sevaName}>
                                      {shift.sevaName}
                                    </div>
                                    <div className="text-[9px] font-semibold opacity-85 mt-1 flex items-center gap-1">
                                      <Clock size={8} />
                                      <span>{shift.slot.split(' ')[0]}</span>
                                      {shift.isDraft && (
                                        <span className="px-1 py-0 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[8px] font-bold">
                                          Draft
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-on-surface-variant/20 italic select-none">Off</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
