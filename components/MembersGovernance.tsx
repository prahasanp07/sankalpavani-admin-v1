'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Landmark,
  Users,
  ShieldCheck,
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Award,
  FileText,
  Phone,
  Mail,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Flame,
  UserPlus,
  Crown,
  HeartHandshake,
  UserCheck,
  Briefcase,
  Bookmark
} from 'lucide-react';
import MemberCard, { MemberCardData } from './governance/MemberCard';
import { STANDARD_GOTRAS, STANDARD_NAKSHATRAS } from './TrusteesGovernance';
import GovernanceMastersModal from './governance/GovernanceMastersModal';
import { DEFAULT_MEMBERSHIP_TYPES } from '@/lib/types/masters';
import { useLanguage } from '../contexts/LanguageContext';

export interface MemberItem {
  id: string;
  userId: string;
  trustId: string;
  name: string;
  email: string;
  phone: string;
  gotra: string;
  nakshatra?: string;
  photoUrl: string;
  membershipType: 'STANDARD' | 'GOVERNANCE_HEAD' | 'TRUSTEE' | 'STAFF' | 'PRIEST' | 'VOLUNTEER' | 'DONOR';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED';
  validFrom: string;
  validUntil: string | null;
  assignedTemples: Array<{
    templeId: string;
    templeName: string;
    templeCode: string;
    status: string;
  }>;
  assignedCommittees: Array<{
    committeeId: string;
    committeeName: string;
    committeeRole: string;
    status: string;
  }>;
  activeDesignations: Array<{
    designationId: string;
    designationName: string;
    scopeId: string;
    resolutionNo: string;
  }>;
  createdAt: string;
}

interface TempleOption {
  id: string;
  name: string;
  code: string;
}

interface CommitteeOption {
  id: string;
  name: string;
  code: string;
}

const MEMBERSHIP_TYPE_PILLS = [
  { key: 'ALL', label: 'All Members' },
  { key: 'TRUSTEE', label: 'Trustees & Board' },
  { key: 'PRIEST', label: 'Acharyas & Priests' },
  { key: 'STAFF', label: 'Temple Staff' },
  { key: 'VOLUNTEER', label: 'Seva Volunteers' },
  { key: 'DONOR', label: 'Patrons & Donors' },
  { key: 'STANDARD', label: 'General Members' }
];

interface MembersGovernanceProps {
  trustId?: string;
  trustName?: string;
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export default function MembersGovernance({
  trustId = 'trust_sringeri',
  trustName,
  onBack,
  onNavigate
}: MembersGovernanceProps) {
  const currentTrustName = (
    trustName ||
    (trustId === 'trust_ahobila'
      ? 'Sri Ahobila Matha Devasthanam Trust'
      : 'Sri Sringeri Sharada Dharma Trust')
  ).toUpperCase();
  const { t } = useLanguage();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<any[]>(DEFAULT_MEMBERSHIP_TYPES);
  const [isMastersModalOpen, setIsMastersModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [templeFilter, setTempleFilter] = useState('ALL');

  // Add Member Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    photoUrl: '',
    preferredCommEmail: true,
    preferredCommWhatsAppSms: true,
    membershipType: 'STAFF' as any,
    templeIds: [] as string[],
    committeeId: '',
    committeeRole: 'MEMBER',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Trust Members
      const mRes = await fetch(`/api/v1/trusts/${trustId}/members`);
      if (mRes.ok) {
        const json = await mRes.json();
        if (json.data) setMembers(json.data);
      }

      // 2. Fetch Temples
      const tRes = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (tRes.ok) {
        const json = await tRes.json();
        if (json.data) setTemples(json.data);
      }

      // 3. Fetch Committees
      const cRes = await fetch(`/api/v1/trusts/${trustId}/committees`);
      if (cRes.ok) {
        const json = await cRes.json();
        if (json.data) setCommittees(json.data);
      }

      // 4. Fetch Master Membership Types
      const mstrRes = await fetch(`/api/v1/trusts/${trustId}/masters?type=MEMBERSHIP_TYPE`);
      if (mstrRes.ok) {
        const json = await mstrRes.json();
        if (json.data && json.data.length > 0) setMembershipTypes(json.data);
      }
    } catch (err) {
      console.error('Failed to load members directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trustId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gotra: formData.gotra,
        nakshatra: formData.nakshatra,
        photoUrl: formData.photoUrl,
        membershipType: formData.membershipType,
        templeIds: formData.templeIds,
        committeeId: formData.committeeId || undefined,
        committeeRole: formData.committeeRole,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to add member');
      }

      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        gotra: '',
        nakshatra: '',
        photoUrl: '',
        preferredCommEmail: true,
        preferredCommWhatsAppSms: true,
        membershipType: 'STAFF',
        templeIds: [],
        committeeId: '',
        committeeRole: 'MEMBER',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: ''
      });
      await fetchData();
      showToast(`Member "${payload.name}" registered successfully!`);
    } catch (err: any) {
      setModalError(err.message || 'Error adding member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') => {
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
        showToast(`Member status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update member status:', err);
    }
  };

  const toggleTempleSelection = (templeId: string) => {
    setFormData(prev => {
      const exists = prev.templeIds.includes(templeId);
      if (exists) {
        return { ...prev, templeIds: prev.templeIds.filter(id => id !== templeId) };
      } else {
        return { ...prev, templeIds: [...prev.templeIds, templeId] };
      }
    });
  };

  const filteredMembers = members.filter(m => {
    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gotra.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'ALL' || m.membershipType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesTemple = templeFilter === 'ALL' || m.assignedTemples.some(tm => tm.templeId === templeFilter);

    return matchesQuery && matchesType && matchesStatus && matchesTemple;
  });

  const totalMembersCount = members.length;
  const trusteesCount = members.filter(m => m.membershipType === 'TRUSTEE' || m.membershipType === 'GOVERNANCE_HEAD').length;
  const priestsCount = members.filter(m => m.membershipType === 'PRIEST').length;
  const staffCount = members.filter(m => m.membershipType === 'STAFF').length;
  const committeeAppointeesCount = members.filter(m => m.assignedCommittees.length > 0).length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
          <Sparkles size={18} className="text-amber-300" />
          <span className="font-sans text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              {t('members.badge', 'Trust & Temple Hierarchy Roster')}
            </span>
            <span className="text-xs font-bold font-sans text-on-surface uppercase tracking-wide">
              {currentTrustName}
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            {t('members.title', 'Members, Staff & Committee Appointees')}
          </h1>
          <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Administer temple staff, Acharyas, volunteers, patrons, and governance appointees across all associated temples.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-xs"
            title={t('common.refresh', 'Refresh Members Roster')}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsMastersModalOpen(true)}
            className="px-3 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-sans text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Configure Membership Type Masters"
          >
            <Bookmark size={14} className="text-primary" />
            <span>{t('designations.membershipType', 'Membership Masters')}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-2xl font-sans text-xs font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <UserPlus size={15} />
            <span>{t('members.addMember', 'Add Member')}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiStaffPriests', 'Total Members')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalMembersCount} {t('dashboard.kpiRegistered', 'Registered')}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('sidebar.governance', 'Trustees & Governance')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{trusteesCount} {t('designations.appointingTrustees', 'Trustees')}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Crown size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiPriests', 'Archakas & Priests')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{priestsCount} {t('dashboard.cardPriestCadre', 'Acharyas')}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Flame size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('sidebar.committees', 'Committee Appointees')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{committeeAppointeesCount} {t('common.active', 'Active')}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Dynamic Filter Pills Bar from Master */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setTypeFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${typeFilter === 'ALL'
            ? 'bg-primary text-on-primary shadow-sacred'
            : 'bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant'
            }`}
        >
          <span>{t('common.all', 'All Members')}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === 'ALL' ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
            {members.length}
          </span>
        </button>

        {membershipTypes.map((mType) => {
          const count = members.filter(m => m.membershipType === mType.code).length;
          return (
            <button
              key={mType.id || mType.code}
              type="button"
              onClick={() => setTypeFilter(mType.code)}
              className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${typeFilter === mType.code
                ? 'bg-primary text-on-primary shadow-sacred'
                : 'bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant'
                }`}
            >
              <span>{mType.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${typeFilter === mType.code ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Members Directory Section */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
              <Users size={20} /> {t('members.title', 'Member Directory & Multi-Temple Assignments')}
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Manage personal profiles, Gotras, multi-temple operational assignments, and committee roles.
            </p>
          </div>

          {/* Search & Temple Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder={t('members.searchPlaceholder', "Search name, gotra, email, phone...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={templeFilter}
              onChange={(e) => setTempleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="ALL">{t('designations.scopeAll', 'All Temples')}</option>
              {temples.map((temp) => (
                <option key={temp.id} value={temp.id}>{temp.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="ALL">{t('common.status', 'All Statuses')}</option>
              <option value="ACTIVE">{t('common.active', 'Active')}</option>
              <option value="SUSPENDED">{t('dashboard.filterSuspended', 'Suspended')}</option>
              <option value="REVOKED">{t('designations.markResigned', 'Revoked')}</option>
            </select>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
            <Users size={40} className="mx-auto text-primary/40 mb-3" />
            <h3 className="font-serif text-lg font-bold text-on-surface">{t('members.emptyState', 'No Members Found')}</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              {searchQuery || typeFilter !== 'ALL' || templeFilter !== 'ALL'
                ? t('members.emptyState', 'No members match your current filters.')
                : t('members.emptyState', 'No members have been registered yet. Click "+ Add Member" to register your first member.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m) => (
              <MemberCard
                key={m.id}
                member={{
                  id: m.id,
                  name: m.name,
                  photoUrl: m.photoUrl,
                  gotra: m.gotra,
                  membershipType: m.membershipType,
                  status: m.status === 'ACTIVE' ? 'ACTIVE' : m.status === 'SUSPENDED' ? 'SUSPENDED' : 'REVOKED',
                  phone: m.phone,
                  email: m.email,
                  termStart: m.validFrom,
                  termEnd: m.validUntil,
                  resolutionNo: m.activeDesignations[0]?.resolutionNo,
                  templeAssignments: m.assignedTemples.map(at => ({
                    templeId: at.templeId,
                    templeName: at.templeName,
                    roleName: at.status || 'Assigned',
                    isPrimary: true
                  })),
                  committeeMemberships: m.assignedCommittees.map(c => ({
                    committeeId: c.committeeId,
                    committeeName: c.committeeName,
                    role: c.committeeRole
                  }))
                }}
                onAssignTemple={() => setIsAddModalOpen(true)}
                onAssignCommittee={() => setIsAddModalOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ADD / INVITE MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-xl w-full p-6 md:p-8 shadow-sacred animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b divider-gold">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Add Member</h3>
                  <p className="text-xs text-on-surface-variant">Register person, assign temples & committees</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="my-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4 mt-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Ramanatha Dikshidar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. member@sringeri.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 2: Phone Number, Gotra, Nakshatra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98450 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Gotra</label>
                  <select
                    value={formData.gotra}
                    onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Gotra...</option>
                    {STANDARD_GOTRAS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Nakshatra</label>
                  <select
                    value={formData.nakshatra}
                    onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Nakshatra...</option>
                    {STANDARD_NAKSHATRAS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Communication */}
              <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-2">
                <label className="font-bold text-on-surface flex items-center gap-1.5">
                  <Mail size={14} className="text-primary" />
                  <span>Preferred Communication</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  <label
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${formData.preferredCommEmail
                      ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferredCommEmail}
                      onChange={(e) => setFormData({ ...formData, preferredCommEmail: e.target.checked })}
                      className="rounded text-primary focus:ring-primary accent-primary"
                    />
                    <span className="truncate">Email</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${formData.preferredCommWhatsAppSms
                      ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferredCommWhatsAppSms}
                      onChange={(e) => setFormData({ ...formData, preferredCommWhatsAppSms: e.target.checked })}
                      className="rounded text-primary focus:ring-primary accent-primary"
                    />
                    <span className="truncate">WhatsApp / SMS</span>
                  </label>
                </div>
              </div>

              {/* Row 3: Membership Type & Committee Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-on-surface">Membership Type *</label>
                    <button
                      type="button"
                      onClick={() => setIsMastersModalOpen(true)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      + Manage / Add
                    </button>
                  </div>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {membershipTypes.map((m) => (
                      <option key={m.id || m.code} value={m.code}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Assign to Committee (Optional)</label>
                  <select
                    value={formData.committeeId}
                    onChange={(e) => setFormData({ ...formData, committeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">None</option>
                    {committees.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.committeeId && (
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Committee Role</label>
                  <select
                    value={formData.committeeRole}
                    onChange={(e) => setFormData({ ...formData, committeeRole: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="MEMBER">Executive Member</option>
                    <option value="CONVENER">Convener / Chairman</option>
                    <option value="SECRETARY">Secretary</option>
                    <option value="TREASURER">Treasurer</option>
                    <option value="TECHNICAL_EXPERT">Technical Expert / Sthapathi</option>
                    <option value="ADVISOR">Agama Advisor</option>
                  </select>
                </div>
              )}

              {/* Multi-Temple Selection */}
              <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-2">
                <label className="font-bold text-on-surface flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  <span>Assign to Temple(s) (Multi-Temple Scope)</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {temples.map((t) => {
                    const isChecked = formData.templeIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all ${isChecked
                          ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTempleSelection(t.id)}
                          className="rounded text-primary focus:ring-primary accent-primary"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Valid From *</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Register Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Governance Masters Modal */}
      <GovernanceMastersModal
        isOpen={isMastersModalOpen}
        onClose={() => setIsMastersModalOpen(false)}
        trustId={trustId}
        initialTab="MEMBERSHIP_TYPE"
        onMasterUpdated={fetchData}
      />
    </div>
  );
}
