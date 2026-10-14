'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  X,
  Calendar,
  Clock,
  Layers,
  Users,
  Check,
  AlertCircle,
  FileText,
  MapPin,
  Sparkles,
  CalendarPlus,
  UserPlus,
  Globe,
  Crown,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  scheduleMeetingSchema,
  ScheduleMeetingInput,
  MeetingItem,
  MeetingInviteeItem,
  MOCK_GOVERNANCE_COMMITTEES,
  MOCK_GOVERNANCE_MEMBERS,
} from '@/schemas/meeting.schema';
import RichTextEditor from './RichTextEditor';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (newMeeting: MeetingItem) => void;
  trustId: string;
  committees?: typeof MOCK_GOVERNANCE_COMMITTEES;
  availableMembers?: MeetingInviteeItem[];
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  onSchedule,
  trustId,
  committees = MOCK_GOVERNANCE_COMMITTEES,
  availableMembers = MOCK_GOVERNANCE_MEMBERS,
}: ScheduleMeetingModalProps) {
  // Local members list allowing dynamically added external invitees / outsiders
  const [membersList, setMembersList] = useState<MeetingInviteeItem[]>(availableMembers);
  const [selectedInviteeIds, setSelectedInviteeIds] = useState<string[]>([
    availableMembers[0]?.id || 'usr_dharmadhikari',
    availableMembers[1]?.id || 'usr_archaka',
    availableMembers[2]?.id || 'usr_eo',
  ]);
  const [submitting, setSubmitting] = useState(false);

  // External guest inline form state
  const [isAddingExternalGuest, setIsAddingExternalGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestDesignation, setGuestDesignation] = useState('');
  const [guestError, setGuestError] = useState('');

  // Active filter tab for invitee roster
  const [inviteeFilterTab, setInviteeFilterTab] = useState<'all' | 'committee' | 'trustees' | 'external'>('all');

  // Default to tomorrow at 10:00 AM
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleMeetingInput>({
    resolver: zodResolver(scheduleMeetingSchema),
    defaultValues: {
      title: '',
      scheduledAt: getDefaultDateTime(),
      committeeId: '',
      inviteeIds: selectedInviteeIds,
      agenda: '',
      location: 'Sri Sringeri Sharada Peetham Boardroom, Vidyaniketan Block',
    },
  });

  const selectedCommitteeId = watch('committeeId');
  const matchedCommittee = committees.find((c) => c.id === selectedCommitteeId);

  // Handle Committee Dropdown Selection
  const handleCommitteeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const commId = e.target.value;
    setValue('committeeId', commId, { shouldValidate: true });

    if (commId) {
      // Find members specifically belonging to this committee
      const committeeMemberIds = membersList
        .filter((m) => m.committeeIds?.includes(commId))
        .map((m) => m.id);

      if (committeeMemberIds.length > 0) {
        // Pre-select committee members
        setSelectedInviteeIds(committeeMemberIds);
        setValue('inviteeIds', committeeMemberIds, { shouldValidate: true });
        setInviteeFilterTab('all');
      }
    }
  };

  // Pre-select committee members only
  const selectCommitteeOnly = (commId: string) => {
    const committeeMemberIds = membersList
      .filter((m) => m.committeeIds?.includes(commId))
      .map((m) => m.id);
    setSelectedInviteeIds(committeeMemberIds);
    setValue('inviteeIds', committeeMemberIds, { shouldValidate: true });
  };

  if (!isOpen) return null;

  const toggleInvitee = (id: string) => {
    const next = selectedInviteeIds.includes(id)
      ? selectedInviteeIds.filter((item) => item !== id)
      : [...selectedInviteeIds, id];
    setSelectedInviteeIds(next);
    setValue('inviteeIds', next, { shouldValidate: true });
  };

  const selectAllInvitees = () => {
    const allIds = membersList.map((m) => m.id);
    setSelectedInviteeIds(allIds);
    setValue('inviteeIds', allIds, { shouldValidate: true });
  };

  const clearAllInvitees = () => {
    setSelectedInviteeIds([]);
    setValue('inviteeIds', [], { shouldValidate: true });
  };

  // Add external guest / outsider to the meeting roster
  const handleAddExternalGuest = () => {
    if (!guestName.trim()) {
      setGuestError('Guest name is required');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setGuestError('A valid email address is required for sending the meeting invite');
      return;
    }

    const newGuest: MeetingInviteeItem = {
      id: `ext_guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: guestName.trim(),
      email: guestEmail.trim(),
      designation: guestDesignation.trim() || 'Special Invitee / External Observer',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName.trim())}&background=4f46e5&color=fff&bold=true`,
      rsvpStatus: 'PENDING',
      isExternal: true,
    };

    const updatedList = [...membersList, newGuest];
    setMembersList(updatedList);

    // Auto-select the newly added guest
    const updatedSelectedIds = [...selectedInviteeIds, newGuest.id];
    setSelectedInviteeIds(updatedSelectedIds);
    setValue('inviteeIds', updatedSelectedIds, { shouldValidate: true });

    // Reset guest form
    setGuestName('');
    setGuestEmail('');
    setGuestDesignation('');
    setGuestError('');
    setIsAddingExternalGuest(false);
  };

  // Filter members list based on active tab & committee
  const committeeMembers = membersList.filter((m) =>
    selectedCommitteeId ? m.committeeIds?.includes(selectedCommitteeId) : false
  );
  const otherTrustees = membersList.filter(
    (m) => !m.isExternal && (!selectedCommitteeId || !m.committeeIds?.includes(selectedCommitteeId))
  );
  const externalGuests = membersList.filter((m) => m.isExternal);

  const displayedMembers = membersList.filter((m) => {
    if (inviteeFilterTab === 'committee' && selectedCommitteeId) {
      return m.committeeIds?.includes(selectedCommitteeId);
    }
    if (inviteeFilterTab === 'trustees') {
      return !m.isExternal && (!selectedCommitteeId || !m.committeeIds?.includes(selectedCommitteeId));
    }
    if (inviteeFilterTab === 'external') {
      return Boolean(m.isExternal);
    }
    return true; // 'all'
  });

  const isAllSelected =
    membersList.length > 0 && selectedInviteeIds.length === membersList.length;
  const hasSelected = selectedInviteeIds.length > 0;

  const onSubmit = async (data: ScheduleMeetingInput) => {
    setSubmitting(true);
    try {
      const host = membersList[0] || {
        id: 'usr_dharmadhikari',
        name: 'Sri V. R. Gowrishankar',
        designation: 'CEO & Dharmadhikari',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
        email: 'dharmadhikari@sringeri.org',
        rsvpStatus: 'ACCEPTED' as const,
      };

      const selectedInvitees = membersList.filter((m) =>
        data.inviteeIds.includes(m.id)
      );

      const newMeeting: MeetingItem = {
        id: `mtg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        trustId,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        hostUserId: host.id,
        hostName: host.name,
        hostAvatar: host.avatarUrl || '',
        hostDesignation: host.designation,
        committeeId: data.committeeId || null,
        committeeName: matchedCommittee?.name || 'Trust Apex Board',
        committeeCategory: matchedCommittee?.category || 'STANDING',
        status: 'SCHEDULED',
        agenda: data.agenda || null,
        location: data.location || 'Trust Board Room',
        invitees: selectedInvitees,
        notes: null,
        createdAt: new Date().toISOString(),
      };

      onSchedule(newMeeting);
      reset();
      onClose();
    } catch (e) {
      console.error('Failed to schedule meeting', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface-container-lowest border border-amber-900/20 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 z-10 animate-[scaleUp_0.25s_ease-out]">
        {/* Sacred Header with Gold Accent */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-50 flex items-center justify-between border-b border-amber-800/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <CalendarPlus size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Trust Governance
                </span>
                <span className="text-[10px] text-amber-300/80 font-sans">
                  SankalpVani Apex System
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-amber-100 tracking-wide mt-0.5">
                Schedule Governance Meeting
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 flex items-center justify-center transition-colors cursor-pointer border border-amber-700/40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* Meeting Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans">
              Meeting Title / Subject <span className="text-amber-800">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Q4 Executive Trust Board - Annual Budget & Brahmotsavam Review"
              className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-xl text-xs font-sans text-on-surface focus:outline-none focus:ring-2 transition-all ${errors.title
                  ? 'border-error focus:ring-error/20'
                  : 'border-outline-variant/60 focus:border-primary focus:ring-primary/20'
                }`}
            />
            {errors.title && (
              <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
                <AlertCircle size={12} /> {errors.title.message}
              </p>
            )}
          </div>

          {/* Date & Time + Committee Link Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time (datetime-local) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Clock size={13} className="text-amber-700" />
                Date & Time (IST) <span className="text-amber-800">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('scheduledAt')}
                className={`w-full px-3.5 py-2.5 bg-surface-container-low border rounded-xl text-xs font-sans text-on-surface focus:outline-none focus:ring-2 transition-all ${errors.scheduledAt
                    ? 'border-error focus:ring-error/20'
                    : 'border-outline-variant/60 focus:border-primary focus:ring-primary/20'
                  }`}
              />
              {errors.scheduledAt && (
                <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {errors.scheduledAt.message}
                </p>
              )}
            </div>

            {/* Optional Committee Link with Dynamic Auto-Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-amber-700" />
                  Governing Committee (Optional)
                </span>
                {selectedCommitteeId && (
                  <span className="text-[10px] text-amber-700 font-bold lowercase bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-600/30">
                    auto-selects members
                  </span>
                )}
              </label>
              <select
                value={selectedCommitteeId || ''}
                onChange={handleCommitteeChange}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="">— Full Apex Board (No Specific Committee) —</option>
                {committees.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name} ({comm.category})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-on-surface-variant/70 font-sans">
                Selecting a committee auto-selects its members while still allowing other board trustees & outsiders to be invited.
              </p>
            </div>
          </div>

          {/* Contextual Committee Banner */}
          {matchedCommittee && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-600/30 rounded-2xl text-xs text-amber-950 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-start sm:items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Crown size={14} />
                </div>
                <div>
                  <p className="font-bold text-amber-950 leading-tight">
                    {matchedCommittee.name} ({committeeMembers.length} assigned members)
                  </p>
                  <p className="text-[11px] text-amber-900/80 leading-snug">
                    Committee members are pre-selected. You can also invite other board trustees or external experts as Special Invitees below.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => selectCommitteeOnly(matchedCommittee.id)}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-500/25 hover:bg-amber-500/35 rounded-lg border border-amber-600/40 cursor-pointer transition-colors shadow-2xs"
                  title="Select only the appointed members of this committee"
                >
                  Committee Only
                </button>
              </div>
            </div>
          )}

          {/* Location / Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-700" />
              Venue / Meeting Location
            </label>
            <input
              type="text"
              {...register('location')}
              placeholder="e.g. Sri Sringeri Sharada Peetham Boardroom, Vidyaniketan Block / Video Conference"
              className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Invitees Multi-Select Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
              {/* Left: Section Label & Non-wrapping Counter Badge */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5 whitespace-nowrap">
                  <Users size={14} className="text-amber-700 shrink-0" />
                  <span>Invitees & Board Members</span>
                  <span className="text-amber-800">*</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-500/15 border border-amber-600/30 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-2xs">
                  <span className="font-mono font-bold">{selectedInviteeIds.length} / {membersList.length}</span>
                  <span>Selected</span>
                </span>
              </div>

              {/* Right: Uniform Actions Toolbar (Equal Height h-8, Harmonious Alignment) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* External Guest Trigger Butt on */}
                <button
                  type="button"
                  onClick={() => setIsAddingExternalGuest(!isAddingExternalGuest)}
                  className={`h-8 px-3 text-[11px] font-bold rounded-xl border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap ${isAddingExternalGuest
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'text-indigo-800 bg-indigo-50/90 hover:bg-indigo-100 border-indigo-200/90 hover:border-indigo-300'
                    }`}
                  title="Invite an outsider or external guest (e.g. Govt Officer, Auditor, Special Invitee)"
                >
                  <UserPlus size={13} className="shrink-0" />
                  <span>+ Add External Guest</span>
                </button>

                {/* Segmented Select All / Unselect All Toggle Group */}
                <div className="inline-flex items-center h-8 bg-surface-container-low border border-outline-variant/60 rounded-xl p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={selectAllInvitees}
                    disabled={isAllSelected}
                    className={`h-7 px-2.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap inline-flex items-center gap-1 ${isAllSelected
                        ? 'text-on-surface-variant/40 cursor-not-allowed'
                        : 'text-amber-950 hover:bg-amber-500/15 active:bg-amber-500/25 cursor-pointer'
                      }`}
                    title="Select all available invitees"
                  >
                    <span>Select All</span>
                  </button>

                  <span className="w-px h-3.5 bg-outline-variant/50" aria-hidden="true" />

                  <button
                    type="button"
                    onClick={clearAllInvitees}
                    disabled={!hasSelected}
                    className={`h-7 px-2.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap inline-flex items-center gap-1 ${!hasSelected
                        ? 'text-on-surface-variant/40 cursor-not-allowed'
                        : 'text-amber-950 hover:text-error hover:bg-error/10 active:bg-error/15 cursor-pointer'
                      }`}
                    title="Clear all selected invitees"
                  >
                    <span>Unselect All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Expandable Inline Form: Add External Guest / Outsider */}
            {isAddingExternalGuest && (
              <div className="p-3.5 bg-gradient-to-br from-indigo-50/90 to-surface-container-low border border-indigo-200 rounded-2xl space-y-3 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Globe size={13} className="text-indigo-600" />
                    <span>Invite External Guest / Special Observer (Outsider)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingExternalGuest(false)}
                    className="text-on-surface-variant hover:text-on-surface p-1"
                  >
                    <X size={14} />
                  </button>
                </div>

                {guestError && (
                  <p className="text-[11px] text-error font-medium flex items-center gap-1 bg-error/10 p-1.5 rounded-lg border border-error/20">
                    <AlertCircle size={12} /> {guestError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Full Name *"
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Guest Official Email *"
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <input
                    type="text"
                    value={guestDesignation}
                    onChange={(e) => setGuestDesignation(e.target.value)}
                    placeholder="Role / Org (e.g. Govt Observer)"
                    className="px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingExternalGuest(false)}
                    className="px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExternalGuest}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus size={13} />
                    <span>Add to Meeting Roster</span>
                  </button>
                </div>
              </div>
            )}

            {/* Filter Tabs for Easy Scoping */}
            <div className="flex items-center gap-1.5 border-b border-outline-variant/30 pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setInviteeFilterTab('all')}
                className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${inviteeFilterTab === 'all'
                    ? 'bg-amber-900 text-amber-50 shadow-2xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
                  }`}
              >
                <span>All Invitees</span>
                <span className="font-mono text-[11px] opacity-80">({membersList.length})</span>
              </button>

              {selectedCommitteeId && committeeMembers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInviteeFilterTab('committee')}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${inviteeFilterTab === 'committee'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-600/30'
                    }`}
                >
                  <Crown size={12} className="shrink-0" />
                  <span>Committee</span>
                  <span className="font-mono text-[11px] opacity-80">({committeeMembers.length})</span>
                </button>
              )}

              {selectedCommitteeId && otherTrustees.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInviteeFilterTab('trustees')}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${inviteeFilterTab === 'trustees'
                      ? 'bg-amber-900 text-amber-50 shadow-2xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
                    }`}
                >
                  <span>Other Trustees</span>
                  <span className="font-mono text-[11px] opacity-80">({otherTrustees.length})</span>
                </button>
              )}

              {externalGuests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInviteeFilterTab('external')}
                  className={`h-7 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${inviteeFilterTab === 'external'
                      ? 'bg-indigo-700 text-white shadow-2xs'
                      : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                >
                  <Globe size={12} className="shrink-0" />
                  <span>External Guests</span>
                  <span className="font-mono text-[11px] opacity-80">({externalGuests.length})</span>
                </button>
              )}
            </div>

            {errors.inviteeIds && (
              <p className="text-[11px] text-error font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {errors.inviteeIds.message}
              </p>
            )}

            {/* Member Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-outline-variant/40 p-2.5 rounded-2xl bg-surface-container-lowest max-h-52 overflow-y-auto">
              {displayedMembers.length === 0 ? (
                <div className="col-span-full py-6 text-center text-xs text-on-surface-variant">
                  No invitees match the selected filter.
                </div>
              ) : (
                displayedMembers.map((member) => {
                  const isSelected = selectedInviteeIds.includes(member.id);
                  const isCommitteeMember =
                    selectedCommitteeId && member.committeeIds?.includes(selectedCommitteeId);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleInvitee(member.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all border cursor-pointer ${isSelected
                          ? member.isExternal
                            ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                            : 'bg-amber-500/10 border-amber-600/40 text-amber-950 shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                        }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${isSelected
                            ? member.isExternal
                              ? 'bg-indigo-600 border-indigo-700 text-white'
                              : 'bg-amber-600 border-amber-700 text-white'
                            : 'border-outline-variant/60 bg-white'
                          }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      <img
                        src={member.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120'}
                        alt={member.name}
                        className={`w-7 h-7 rounded-full object-cover shrink-0 border ${member.isExternal ? 'border-indigo-400' : 'border-amber-600/30'
                          }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold truncate leading-tight">{member.name}</p>
                          {member.isExternal ? (
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded border border-indigo-200 shrink-0">
                              External
                            </span>
                          ) : isCommitteeMember ? (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-600/30 shrink-0 flex items-center gap-0.5">
                              <Crown size={9} /> Member
                            </span>
                          ) : selectedCommitteeId ? (
                            <span className="text-[9px] font-medium text-on-surface-variant bg-surface-container px-1 py-0.2 rounded border border-outline-variant/40 shrink-0">
                              Special Invitee
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-on-surface-variant truncate font-sans">
                          {member.designation}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Agenda & Key Discussion Points (Rich Text Editor) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
              <FileText size={13} className="text-amber-700" />
              Meeting Agenda & Key Discussion Points
            </label>
            <RichTextEditor
              value={watch('agenda') || ''}
              onChange={(content) => setValue('agenda', content, { shouldValidate: true })}
              placeholder="Type details for this new meeting"
              minHeight="140px"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <CalendarPlus size={15} />
              <span>{submitting ? 'Scheduling...' : 'Schedule & Send Invites'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
