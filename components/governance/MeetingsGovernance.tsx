'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarClock,
  CalendarPlus,
  Calendar,
  Clock,
  Layers,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCheck,
  Paperclip,
  Download,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  UserCheck,
  Tag,
} from 'lucide-react';
import {
  MeetingItem,
  MeetingNoteItem,
  INITIAL_UPCOMING_MEETINGS,
  INITIAL_PAST_MOMS,
  MOCK_GOVERNANCE_COMMITTEES,
  MOCK_GOVERNANCE_MEMBERS,
} from '@/schemas/meeting.schema';
import ScheduleMeetingModal from './ScheduleMeetingModal';
import PublishMoMModal from './PublishMoMModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface MeetingsGovernanceProps {
  trustId: string;
  onBack?: () => void;
  trustName?: string;
}

export default function MeetingsGovernance({
  trustId,
  onBack,
  trustName = 'Sri Sringeri Sharada Peetham Trust',
}: MeetingsGovernanceProps) {
  const { t } = useLanguage();

  // Sliding Tabs State
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommitteeFilter, setSelectedCommitteeFilter] = useState<string>('ALL');

  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [targetMeetingForMoM, setTargetMeetingForMoM] = useState<MeetingItem | null>(null);

  // Expanded Reader Views for MoMs
  const [expandedMeetingIds, setExpandedMeetingIds] = useState<Record<string, boolean>>({
    mtg_past_01: true, // First past MoM expanded by default
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent / Mock Meeting State
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`sankalpvani_upcoming_meetings_${trustId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_UPCOMING_MEETINGS;
  });

  const [pastMeetings, setPastMeetings] = useState<MeetingItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`sankalpvani_past_meetings_${trustId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_PAST_MOMS;
  });

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `sankalpvani_upcoming_meetings_${trustId}`,
        JSON.stringify(upcomingMeetings)
      );
    }
  }, [upcomingMeetings, trustId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `sankalpvani_past_meetings_${trustId}`,
        JSON.stringify(pastMeetings)
      );
    }
  }, [pastMeetings, trustId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format Date and Time
  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  // Relative Countdown for Upcoming
  const getRelativeTimeLabel = (isoString: string) => {
    const now = new Date().getTime();
    const target = new Date(isoString).getTime();
    const diffHours = Math.round((target - now) / (1000 * 60 * 60));

    if (diffHours < 0) return 'Conducted / Pending MoM';
    if (diffHours < 24) return `In ${diffHours} Hours`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} Days`;
  };

  // Add scheduled meeting
  const handleScheduleMeeting = (newMeeting: MeetingItem) => {
    setUpcomingMeetings((prev) => [newMeeting, ...prev]);
    showToast(`Meeting "${newMeeting.title}" successfully scheduled & invitations dispatched.`);
  };

  // Publish MoM
  const handlePublishMoMSuccess = (meetingId: string, note: MeetingNoteItem) => {
    // 1. Check if it's in upcoming, move to past
    const target = upcomingMeetings.find((m) => m.id === meetingId);
    if (target) {
      const completedMeeting: MeetingItem = {
        ...target,
        status: 'COMPLETED',
        notes: note,
      };
      setUpcomingMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      setPastMeetings((prev) => [completedMeeting, ...prev]);
      setExpandedMeetingIds((prev) => ({ ...prev, [meetingId]: true }));
      setActiveTab('past');
    } else {
      // Update in past meetings
      setPastMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, notes: note, status: 'COMPLETED' } : m))
      );
      setExpandedMeetingIds((prev) => ({ ...prev, [meetingId]: true }));
    }

    showToast(`Official Minutes of Meeting published with Resolution #${note.resolutionNumber || 'TR-2026'}.`);
  };

  // Toggle MoM Reader View
  const toggleExpand = (id: string) => {
    setExpandedMeetingIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Cancel Meeting
  const handleCancelMeeting = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled governance meeting?')) {
      setUpcomingMeetings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'CANCELLED' } : m))
      );
      showToast('Meeting cancelled and cancellation notifications sent to invitees.');
    }
  };

  // Filter meetings
  const filterList = (list: MeetingItem[]) => {
    return list.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.agenda && m.agenda.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.committeeName && m.committeeName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCommittee =
        selectedCommitteeFilter === 'ALL' || m.committeeId === selectedCommitteeFilter;

      return matchesSearch && matchesCommittee;
    });
  };

  const filteredUpcoming = filterList(upcomingMeetings);
  const filteredPast = filterList(pastMeetings);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-950 text-amber-100 border border-amber-600/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
          <span className="font-sans text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Apex Breadcrumb & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-3xl border border-amber-900/15 shadow-sm relative overflow-hidden">
        {/* Background Subtle Sacred Geometry Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface flex items-center justify-center transition-colors cursor-pointer mr-1"
                title="Return to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-600/30 flex items-center gap-1.5">
              <Building2 size={11} /> {trustName}
            </span>
            <span className="text-xs text-on-surface-variant font-sans">• Apex Governance</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-amber-950 tracking-tight flex items-center gap-2.5">
            <CalendarClock size={26} className="text-amber-800" />
            <span>Meetings & Minutes of Meeting (MoM)</span>
          </h1>

          <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Statutory records, board proceedings, resolution logs, and AI-assisted Minutes of Meeting (MoM) drafting under strict Trust Board governance.
          </p>
        </div>

        {/* Primary Schedule Action */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <CalendarPlus size={16} />
            <span>Schedule New Meeting</span>
          </button>
        </div>
      </div>

      {/* Controls: Search, Committee Filter & Sliding Tabs */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Framer Motion Sliding Tabs: "Upcoming Meetings" and "Past Meetings & MoMs" */}
        <div className="flex items-center p-1.5 bg-surface-container-low border border-outline-variant/40 rounded-2xl relative self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 z-10 ${
              activeTab === 'upcoming' ? 'text-amber-950' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'upcoming' && (
              <motion.div
                layoutId="meetingActiveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-amber-900/15"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Clock size={14} className="relative z-10" />
            <span className="relative z-10">Upcoming Meetings</span>
            <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-900 font-bold ml-0.5">
              {upcomingMeetings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 z-10 ${
              activeTab === 'past' ? 'text-amber-950' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'past' && (
              <motion.div
                layoutId="meetingActiveTab"
                className="absolute inset-0 bg-white rounded-xl shadow-xs border border-amber-900/15"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <FileCheck size={14} className="relative z-10" />
            <span className="relative z-10">Past Meetings & MoMs</span>
            <span className="relative z-10 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-900 font-bold ml-0.5">
              {pastMeetings.length}
            </span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings, topics, resolutions..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Committee Filter */}
          <div className="relative">
            <select
              value={selectedCommitteeFilter}
              onChange={(e) => setSelectedCommitteeFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-sans font-medium text-on-surface focus:outline-none focus:border-primary cursor-pointer pr-8"
            >
              <option value="ALL">All Committees</option>
              {MOCK_GOVERNANCE_COMMITTEES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Area with Animated Switcher */}
      <AnimatePresence mode="wait">
        {activeTab === 'upcoming' ? (
          <motion.div
            key="upcoming-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {filteredUpcoming.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant/60 rounded-3xl p-12 text-center">
                <CalendarClock size={36} className="mx-auto text-amber-800/60 mb-3" />
                <h3 className="font-serif text-base font-bold text-on-surface">No Upcoming Meetings Found</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? 'No scheduled meetings matched your search criteria.'
                    : 'All scheduled trust meetings have been concluded. Click below to schedule a new governance session.'}
                </p>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <CalendarPlus size={14} /> Schedule Meeting
                </button>
              </div>
            ) : (
              filteredUpcoming.map((meeting) => {
                const { day, date, time } = formatDateTime(meeting.scheduledAt);
                const countdown = getRelativeTimeLabel(meeting.scheduledAt);

                return (
                  <div
                    key={meeting.id}
                    className="bg-surface-container-lowest border border-amber-900/15 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Date Badge + Title & Meta */}
                      <div className="flex items-start gap-4">
                        {/* Sacred Gold Calendar Badge */}
                        <div className="w-16 h-18 rounded-2xl bg-gradient-to-b from-amber-500/15 via-amber-600/10 to-amber-700/15 border border-amber-600/30 flex flex-col items-center justify-center p-2 text-center shrink-0 shadow-inner">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                            {day}
                          </span>
                          <span className="font-serif text-xl font-bold text-amber-950 leading-none my-0.5">
                            {date.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono text-amber-900/80 font-bold">
                            {date.split(' ')[1]}
                          </span>
                        </div>

                        {/* Title and Metadata */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-900 border border-amber-500/30 flex items-center gap-1">
                              <Layers size={10} /> {meeting.committeeName || 'Apex Board'}
                            </span>

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 border border-emerald-500/30">
                              {countdown}
                            </span>

                            {meeting.status === 'CANCELLED' && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-error-container text-error">
                                Cancelled
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-base font-bold text-amber-950 tracking-tight leading-snug">
                            {meeting.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant font-sans">
                            <span className="flex items-center gap-1.5 text-on-surface">
                              <Clock size={13} className="text-amber-700" />
                              <strong>{time}</strong> IST
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-amber-700" />
                              <span className="truncate max-w-xs">{meeting.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-2 self-start lg:self-center">
                        {/* Primary: Publish MoM Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetMeetingForMoM(meeting);
                            setPublishModalOpen(true);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                          title="Record proceedings and publish official MoM"
                        >
                          <FileCheck size={14} />
                          <span>Publish MoM</span>
                        </button>

                        {meeting.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleCancelMeeting(meeting.id)}
                            className="px-3 py-2 border border-outline-variant/60 hover:bg-error-container/20 text-on-surface-variant hover:text-error rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            title="Cancel meeting"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Agenda Snippet */}
                    {meeting.agenda && (
                      <div className="bg-surface-container-low/70 p-3 rounded-2xl border border-outline-variant/20 text-xs font-sans text-on-surface/90">
                        <span className="font-bold text-[10px] uppercase font-mono text-amber-900 block mb-1">
                          Agenda / Key Points:
                        </span>
                        {meeting.agenda.includes('<') ? (
                          <div
                            className="prose prose-amber max-w-none text-xs leading-relaxed [&_ul]:my-1 [&_ol]:my-1 [&_p]:my-0.5 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs"
                            dangerouslySetInnerHTML={{ __html: meeting.agenda }}
                          />
                        ) : (
                          <p className="whitespace-pre-line text-xs leading-relaxed">{meeting.agenda}</p>
                        )}
                      </div>
                    )}

                    {/* Invitees & Host Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant/20 text-xs">
                      {/* Host Info */}
                      <div className="flex items-center gap-2">
                        <img
                          src={meeting.hostAvatar}
                          alt={meeting.hostName}
                          className="w-6 h-6 rounded-full object-cover border border-amber-600/30"
                        />
                        <span className="text-[11px] text-on-surface-variant">
                          Convened by <strong className="text-on-surface">{meeting.hostName}</strong> ({meeting.hostDesignation})
                        </span>
                      </div>

                      {/* Invitees Avatar Stack */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-on-surface-variant font-medium mr-1">
                          Invitees ({meeting.invitees.length}):
                        </span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {meeting.invitees.slice(0, 5).map((inv) => (
                            <img
                              key={inv.id}
                              src={inv.avatarUrl}
                              alt={inv.name}
                              title={`${inv.name} (${inv.designation})`}
                              className="w-6 h-6 rounded-full object-cover border-2 border-white ring-1 ring-amber-900/20"
                            />
                          ))}
                        </div>
                        {meeting.invitees.length > 5 && (
                          <span className="text-[10px] font-mono text-amber-900 bg-amber-500/20 font-bold px-1.5 py-0.5 rounded-full">
                            +{meeting.invitees.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        ) : (
          <motion.div
            key="past-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {filteredPast.length === 0 ? (
              <div className="bg-surface-container-lowest border border-dashed border-outline-variant/60 rounded-3xl p-12 text-center">
                <FileCheck size={36} className="mx-auto text-amber-800/60 mb-3" />
                <h3 className="font-serif text-base font-bold text-on-surface">No Past MoMs Found</h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? 'No minutes of meeting matched your filter.'
                    : 'No past minutes of meeting have been recorded yet.'}
                </p>
              </div>
            ) : (
              filteredPast.map((meeting) => {
                const { date, time } = formatDateTime(meeting.scheduledAt);
                const isExpanded = !!expandedMeetingIds[meeting.id];

                return (
                  <div
                    key={meeting.id}
                    className="bg-surface-container-lowest border border-amber-900/20 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    {/* Header Strip */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/30">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-950 border border-amber-500/30">
                            {meeting.committeeName || 'Apex Board'}
                          </span>

                          {meeting.notes?.resolutionNumber && (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-100 flex items-center gap-1 shadow-xs">
                              <ShieldCheck size={11} className="text-amber-300" />
                              {meeting.notes.resolutionNumber}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-emerald-800 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15">
                            Conducted on {date}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-amber-950 tracking-tight">
                          {meeting.title}
                        </h3>
                      </div>

                      {/* Expand / Collapse Button */}
                      <div className="flex items-center gap-2">
                        {meeting.notes ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(meeting.id)}
                            className="px-3.5 py-1.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>{isExpanded ? 'Collapse MoM' : 'View Full MoM'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetMeetingForMoM(meeting);
                              setPublishModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-amber-900 cursor-pointer shadow-xs"
                          >
                            <FileText size={13} />
                            <span>Draft & Publish MoM</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Published Attribution */}
                    {meeting.notes && (
                      <div className="flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2 bg-amber-500/5 px-3.5 py-2 rounded-xl border border-amber-900/10">
                        <div className="flex items-center gap-1.5">
                          <UserCheck size={14} className="text-amber-800" />
                          <span>
                            Recorded & Published by{' '}
                            <strong className="text-on-surface">{meeting.notes.publishedByName}</strong> (
                            {meeting.notes.publishedByDesignation})
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-on-surface-variant/80">
                          Published: {new Date(meeting.notes.publishedAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    )}

                    {/* MoM Display using @tailwindcss/typography (prose prose-amber) as required */}
                    {meeting.notes && isExpanded && (
                      <div className="space-y-4 pt-1">
                        <div className="bg-amber-50/40 p-6 rounded-2xl border border-amber-900/15">
                          {/* Exact requirement: prose prose-amber styling */}
                          <div className="prose prose-amber max-w-none text-xs sm:text-sm font-sans text-on-surface leading-relaxed">
                            {meeting.notes.momText.split('\n').map((line, idx) => {
                              if (line.startsWith('### ')) {
                                return (
                                  <h4
                                    key={idx}
                                    className="font-serif text-sm font-bold text-amber-950 border-b border-amber-800/20 pb-1 mt-4 mb-2 first:mt-0"
                                  >
                                    {line.replace('### ', '')}
                                  </h4>
                                );
                              }
                              if (line.startsWith('- ')) {
                                return (
                                  <li key={idx} className="ml-4 list-disc text-xs sm:text-sm my-1 text-on-surface/90">
                                    <span dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                  </li>
                                );
                              }
                              if (/^\d+\.\s/.test(line)) {
                                return (
                                  <div key={idx} className="ml-4 text-xs sm:text-sm my-1 font-medium text-on-surface">
                                    <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                  </div>
                                );
                              }
                              if (line.startsWith('---')) {
                                return <hr key={idx} className="my-4 border-amber-800/20" />;
                              }
                              if (line.trim() === '') {
                                return <div key={idx} className="h-2" />;
                              }
                              return (
                                <p key={idx} className="text-xs sm:text-sm my-1.5 text-on-surface/90">
                                  <span dangerouslySetInnerHTML={{ __html: line.replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                </p>
                              );
                            })}
                          </div>
                        </div>

                        {/* Attachments Section */}
                        {meeting.notes.attachmentUrls && meeting.notes.attachmentUrls.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-outline-variant/30">
                            <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-sans flex items-center gap-1.5">
                              <Paperclip size={13} className="text-amber-800" />
                              Official Signed Resolutions & Gazette Attachments
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {meeting.notes.attachmentUrls.map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-amber-900/15 hover:border-amber-600/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-900 flex items-center justify-center shrink-0">
                                      <FileText size={15} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-on-surface truncate">{att.name}</p>
                                      <p className="text-[10px] text-on-surface-variant font-mono">
                                        {att.formattedSize} • Signed Official Document
                                      </p>
                                    </div>
                                  </div>

                                  <a
                                    href={att.url}
                                    download={att.name}
                                    onClick={(e) => {
                                      if (att.url === '#') {
                                        e.preventDefault();
                                        showToast(`Downloading signed resolution document: ${att.name}`);
                                      }
                                    }}
                                    className="p-1.5 text-amber-800 hover:bg-amber-500/15 rounded-lg transition-colors cursor-pointer shrink-0"
                                    title="Download Document"
                                  >
                                    <Download size={14} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Export & Action Utility Strip */}
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>Print MoM</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => showToast('MoM link copied to clipboard for email circulation.')}
                            className="px-3 py-1.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Share2 size={13} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleScheduleMeeting}
        trustId={trustId}
      />

      {/* Publish MoM Modal */}
      <PublishMoMModal
        isOpen={publishModalOpen}
        onClose={() => {
          setPublishModalOpen(false);
          setTargetMeetingForMoM(null);
        }}
        meeting={targetMeetingForMoM}
        onPublishSuccess={handlePublishMoMSuccess}
      />
    </div>
  );
}
