'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
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
  Clock,
  CheckCircle2,
  UserCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  Scale,
  Coins,
  BookOpen,
  Briefcase,
  UserPlus,
  Building2,
  Moon,
  Compass,
  Bookmark
} from 'lucide-react';
import { STANDARD_GOTRAS, STANDARD_NAKSHATRAS } from './TrusteesGovernance';
import GovernanceMastersModal from './governance/GovernanceMastersModal';
import { DEFAULT_COMMITTEE_CATEGORIES } from '@/lib/types/masters';

export interface CommitteeItem {
  id: string;
  trustId: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  scopeName: string;
  parentId?: string | null;
  organizationNodeId?: string;
  code: string;
  name: string;
  category: 'STANDING' | 'AD_HOC' | 'ADVISORY' | 'RENOVATION' | 'FESTIVAL' | 'FINANCE' | 'LEGAL' | 'CUSTOM';
  mandate: string;
  formationDate: string;
  dissolutionDate?: string | null;
  status: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED';
  memberCount: number;
  convenerName?: string;
  members?: CommitteeMemberItem[];
}

export interface CommitteeMemberItem {
  id: string;
  committeeId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  nakshatra?: string;
  avatarUrl?: string;
  committeeRole: string;
  designationName?: string;
  termStart: string;
  termEnd?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'RELIEVED';
}

interface TempleOption {
  id: string;
  name: string;
  code: string;
}

const COMMITTEE_CATEGORIES = [
  { key: 'ALL', label: 'All Categories', icon: Layers },
  { key: 'RENOVATION', label: 'Jeernodharana & Renovation', icon: Flame },
  { key: 'FESTIVAL', label: 'Festival & Utsavam', icon: Sparkles },
  { key: 'FINANCE', label: 'Finance & Hundi Audit', icon: Coins },
  { key: 'ADVISORY', label: 'Agama & Vidwat Advisory', icon: BookOpen },
  { key: 'STANDING', label: 'Standing Committees', icon: Briefcase },
  { key: 'LEGAL', label: 'Estate & Legal Cell', icon: Scale }
];

interface CommitteesGovernanceProps {
  trustId?: string;
  trustName?: string;
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export default function CommitteesGovernance({
  trustId = 'trust_sringeri',
  trustName,
  onBack,
  onNavigate
}: CommitteesGovernanceProps) {
  const currentTrustName = (
    trustName ||
    (trustId === 'trust_ahobila'
      ? 'Sri Ahobila Matha Devasthanam Trust'
      : 'Sri Sringeri Sharada Dharma Trust')
  ).toUpperCase();
  const [committees, setCommittees] = useState<CommitteeItem[]>([]);
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [committeeCategories, setCommitteeCategories] = useState<any[]>(DEFAULT_COMMITTEE_CATEGORIES);
  const [isMastersModalOpen, setIsMastersModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'TRUST' | 'TEMPLE'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expanded Committee for Member Roster
  const [expandedCommId, setExpandedCommId] = useState<string | null>(null);
  const [committeeMembersMap, setCommitteeMembersMap] = useState<Record<string, CommitteeMemberItem[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<Record<string, boolean>>({});

  // Create Committee Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    scopeType: 'TRUST' as 'TRUST' | 'TEMPLE',
    scopeId: '',
    parentId: '',
    category: '',
    mandate: '',
    formationDate: new Date().toISOString().split('T')[0],
    dissolutionDate: '',
    status: 'ACTIVE' as any
  });

  // Appoint Member Modal
  const [appointModalComm, setAppointModalComm] = useState<CommitteeItem | null>(null);
  const [isAppointingMember, setIsAppointingMember] = useState(false);
  const [appointMemberError, setAppointMemberError] = useState<string | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    avatarUrl: '',
    committeeRole: 'MEMBER',
    termStart: new Date().toISOString().split('T')[0],
    termEnd: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Committees
      const cRes = await fetch(`/api/v1/trusts/${trustId}/committees`);
      if (cRes.ok) {
        const json = await cRes.json();
        if (json.data) setCommittees(json.data);
      }

      // 2. Fetch Temples
      const tempRes = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (tempRes.ok) {
        const json = await tempRes.json();
        if (json.data) setTemples(json.data);
      }

      // 3. Fetch Master Committee Categories
      const mRes = await fetch(`/api/v1/trusts/${trustId}/masters?type=COMMITTEE_CATEGORY`);
      if (mRes.ok) {
        const json = await mRes.json();
        if (json.data && json.data.length > 0) setCommitteeCategories(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch committees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trustId]);

  const loadMembersForCommittee = async (commId: string) => {
    if (committeeMembersMap[commId]) return;
    setLoadingMembers(prev => ({ ...prev, [commId]: true }));
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/committees/${commId}/members`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setCommitteeMembersMap(prev => ({ ...prev, [commId]: json.data }));
        }
      }
    } catch (err) {
      console.error('Failed to load committee members:', err);
    } finally {
      setLoadingMembers(prev => ({ ...prev, [commId]: false }));
    }
  };

  const handleToggleExpand = (commId: string) => {
    if (expandedCommId === commId) {
      setExpandedCommId(null);
    } else {
      setExpandedCommId(commId);
      loadMembersForCommittee(commId);
    }
  };

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        scopeType: 'TRUST',
        scopeId: trustId,
        parentId: null,
        category: formData.category || 'STANDING',
        mandate: formData.mandate,
        formationDate: new Date(formData.formationDate).toISOString(),
        dissolutionDate: formData.dissolutionDate ? new Date(formData.dissolutionDate).toISOString() : null,
        status: formData.status
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/committees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create committee');
      }

      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        code: '',
        scopeType: 'TRUST',
        scopeId: '',
        parentId: '',
        category: '',
        mandate: '',
        formationDate: new Date().toISOString().split('T')[0],
        dissolutionDate: '',
        status: 'ACTIVE'
      });
      await fetchData();
      showToast('Committee formed successfully!');
    } catch (err: any) {
      setModalError(err.message || 'Error forming committee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppointMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointModalComm) return;
    setIsAppointingMember(true);
    setAppointMemberError(null);

    try {
      const payload = {
        name: memberFormData.name,
        email: memberFormData.email,
        phone: memberFormData.phone,
        gotra: memberFormData.gotra,
        nakshatra: memberFormData.nakshatra,
        avatarUrl: memberFormData.avatarUrl,
        committeeRole: memberFormData.committeeRole,
        termStart: new Date(memberFormData.termStart).toISOString(),
        termEnd: memberFormData.termEnd ? new Date(memberFormData.termEnd).toISOString() : null
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/committees/${appointModalComm.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to appoint member');
      }

      // Refresh members
      const refreshed = await fetch(`/api/v1/trusts/${trustId}/committees/${appointModalComm.id}/members`);
      if (refreshed.ok) {
        const rJson = await refreshed.json();
        setCommitteeMembersMap(prev => ({ ...prev, [appointModalComm.id]: rJson.data }));
      }

      setAppointModalComm(null);
      setMemberFormData({
        name: '',
        email: '',
        phone: '',
        gotra: '',
        nakshatra: '',
        avatarUrl: '',
        committeeRole: 'MEMBER',
        termStart: new Date().toISOString().split('T')[0],
        termEnd: ''
      });
      await fetchData();
      showToast(`Member appointed to ${appointModalComm.name}!`);
    } catch (err: any) {
      setAppointMemberError(err.message || 'Error appointing member');
    } finally {
      setIsAppointingMember(false);
    }
  };

  const handleMemberStatusChange = async (commId: string, memberId: string, newStatus: 'ACTIVE' | 'EXPIRED' | 'RELIEVED') => {
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/committees/${commId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const refreshed = await fetch(`/api/v1/trusts/${trustId}/committees/${commId}/members`);
        if (refreshed.ok) {
          const rJson = await refreshed.json();
          setCommitteeMembersMap(prev => ({ ...prev, [commId]: rJson.data }));
        }
        showToast(`Member status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update member status:', err);
    }
  };

  const filteredCommittees = committees.filter(c => {
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mandate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesScope = scopeFilter === 'ALL' || c.scopeType === scopeFilter;
    return matchesQuery && matchesCategory && matchesScope;
  });

  const activeCount = committees.filter(c => c.status === 'ACTIVE').length;
  const jeernodharanaCount = committees.filter(c => c.category === 'RENOVATION').length;
  const festivalCount = committees.filter(c => c.category === 'FESTIVAL').length;
  const subCommitteeCount = committees.filter(c => !!c.parentId).length;

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
              Governance Committees & Wings
            </span>
            <span className="text-xs font-bold font-sans text-on-surface uppercase tracking-wide">
              {currentTrustName}
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Committees & Sub-Committees Management
          </h1>
          <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Charter standing, festival, renovation, and advisory samithis, appoint conveners, and administer cross-temple wings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-xs"
            title="Refresh Committee Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsMastersModalOpen(true)}
            className="px-3 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-sans text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Configure Committee Category Masters"
          >
            <Bookmark size={14} className="text-primary" />
            <span>Committee Masters</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-2xl font-sans text-xs font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Form New Committee</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Committees</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{activeCount} Active</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{committees.length} Total Registered</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Jeernodharana & Renovation</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{jeernodharanaCount} Samithis</h3>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">Sanctum Restoration Projects</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Flame size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Grand Utsavam Wings</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{festivalCount} Wings</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Brahmotsavam / Rathotsavam</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Nested Sub-Committees</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{subCommitteeCount} Sub-Wings</h3>
            <p className="text-[10px] text-blue-700 font-bold mt-0.5">Departmental Hierarchy</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
            <Briefcase size={22} />
          </div>
        </div>
      </div>

      {/* Category Pill Filters */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategoryFilter('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${categoryFilter === 'ALL'
              ? 'bg-primary text-on-primary shadow-sacred scale-102'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
            }`}
        >
          <Layers size={14} />
          <span>All Categories</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${categoryFilter === 'ALL' ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
            {committees.length}
          </span>
        </button>

        {committeeCategories.map(cat => {
          const count = committees.filter(c => c.category === cat.code).length;
          const isSelected = categoryFilter === cat.code;
          return (
            <button
              key={cat.id || cat.code}
              type="button"
              onClick={() => setCategoryFilter(cat.code)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                  ? 'bg-primary text-on-primary shadow-sacred scale-102'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
                }`}
            >
              <Sparkles size={14} />
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Committees Directory */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
              <Layers size={20} /> Active Committee Charters
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-0.5">
              Manage terms, member appointments, charters, and sub-committee wings across the Trust & Temple hierarchy.
            </p>
          </div>

          {/* Search & Scope Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search committees, codes, mandates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="ALL">All Scopes</option>
              <option value="TRUST">Trust-Wide Committees</option>
              <option value="TEMPLE">Temple-Specific Committees</option>
            </select>
          </div>
        </div>

        {/* Committee List */}
        {filteredCommittees.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
            <Layers size={40} className="mx-auto text-primary/40 mb-3" />
            <h3 className="font-serif text-lg font-bold text-on-surface">No Committees Found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              {searchQuery || categoryFilter !== 'ALL' || scopeFilter !== 'ALL'
                ? 'No committees match your current filters.'
                : 'No committees have been formed yet. Click "+ Form New Committee" to create your first committee charter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommittees.map((c) => {
              const isExpanded = expandedCommId === c.id;
              const members = committeeMembersMap[c.id] || [];
              const isMembersLoading = loadingMembers[c.id];

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                          {c.code}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-800 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/20">
                          {c.category}
                        </span>
                        <span className="text-[10px] font-sans font-bold text-blue-800 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-400/20">
                          Scope: {c.scopeName}
                        </span>
                        {c.parentId && (
                          <span className="text-[10px] font-sans font-bold text-purple-800 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-400/20">
                            Sub-Committee
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === 'ACTIVE'
                            ? 'text-emerald-700 bg-emerald-500/10'
                            : c.status === 'DISSOLVED'
                              ? 'text-on-surface-variant bg-surface-container'
                              : 'text-error bg-error/10'
                          }`}>
                          {c.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-on-surface">
                        {c.name}
                      </h3>

                      {c.mandate && (
                        <p className="text-xs text-on-surface-variant/90 italic">
                          "{c.mandate}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-on-surface-variant pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-primary/70" />
                          <span>Formed: {new Date(c.formationDate).toLocaleDateString()}</span>
                          {c.dissolutionDate && (
                            <span> ➔ Target Dissolution: {new Date(c.dissolutionDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {c.convenerName && (
                          <div className="flex items-center gap-1.5 font-bold text-primary">
                            <Award size={13} />
                            <span>Lead: {c.convenerName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 font-bold text-on-surface">
                          <Users size={13} className="text-primary/70" />
                          <span>{c.memberCount} Appointed Members</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-start lg:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAppointModalComm(c);
                          setAppointMemberError(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-sans text-xs font-bold transition-colors cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>Appoint Member</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleExpand(c.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-sans text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Members' : `View Roster (${c.memberCount})`}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE MEMBER ROSTER */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-3">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={14} /> Committee Roster & Portfolio Assignments
                      </h4>

                      {isMembersLoading ? (
                        <div className="p-4 text-center text-xs text-on-surface-variant animate-pulse">
                          Loading member roster...
                        </div>
                      ) : members.length === 0 ? (
                        <div className="p-4 text-center text-xs text-on-surface-variant bg-surface-container/40 rounded-xl border border-dashed border-outline-variant/30">
                          No members appointed to this committee yet. Click "Appoint Member" to add conveners and members.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {members.map((m) => (
                            <div
                              key={m.id}
                              className="p-3.5 rounded-xl bg-surface-container/80 border border-outline-variant/20 flex flex-col justify-between text-xs transition-shadow hover:shadow-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                                    {m.committeeRole}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${m.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-500/10' : 'text-on-surface-variant bg-surface-container'
                                    }`}>
                                    {m.status}
                                  </span>
                                </div>
                                <p className="font-serif font-bold text-on-surface text-sm">{m.name}</p>
                                {(m.gotra || m.nakshatra) && (
                                  <p className="text-[10px] text-amber-800 font-medium">
                                    {m.gotra ? `Gotra: ${m.gotra}` : ''}
                                    {m.gotra && m.nakshatra ? ' • ' : ''}
                                    {m.nakshatra ? `Nakshatra: ${m.nakshatra}` : ''}
                                  </p>
                                )}
                                {m.phone && (
                                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                                    <Phone size={10} className="text-primary" /> {m.phone}
                                  </p>
                                )}
                                {m.email && (
                                  <p className="text-[11px] text-on-surface-variant truncate flex items-center gap-1">
                                    <Mail size={10} className="text-primary" /> {m.email}
                                  </p>
                                )}
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px]">
                                <span className="text-on-surface-variant">
                                  Term: {new Date(m.termStart).toLocaleDateString()}
                                </span>
                                {m.status === 'ACTIVE' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMemberStatusChange(c.id, m.id, 'RELIEVED')}
                                    className="text-error hover:underline font-bold cursor-pointer"
                                  >
                                    Relieve
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleMemberStatusChange(c.id, m.id, 'ACTIVE')}
                                    className="text-primary hover:underline font-bold cursor-pointer"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FORM NEW COMMITTEE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-xl w-full p-6 md:p-8 shadow-sacred animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b divider-gold">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Form New Committee / Sub-Committee</h3>
                  <p className="text-xs text-on-surface-variant">Charter standing or ad-hoc temple committees</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleCreateCommittee} className="space-y-4 mt-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="e.g. JEER-SST-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface uppercase font-mono placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Committee Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Sharadamba Jeernodharana Samithi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category (Optional) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface">Category (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setIsMastersModalOpen(true)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    + Manage / Add
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">Select Category (Optional)...</option>
                  {committeeCategories.map(c => (
                    <option key={c.id || c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.formationDate}
                    onChange={(e) => setFormData({ ...formData, formationDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.dissolutionDate}
                    onChange={(e) => setFormData({ ...formData, dissolutionDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Charter / Mandate & Objectives</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Supervision of Rajagopuram renovation, Agama consultation, budget reconciliation..."
                  value={formData.mandate}
                  onChange={(e) => setFormData({ ...formData, mandate: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                    <span>Creating Committee...</span>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Form Committee</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINT COMMITTEE MEMBER MODAL */}
      {appointModalComm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-lg w-full p-6 md:p-8 shadow-sacred animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b divider-gold">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Appoint Member</h3>
                  <p className="text-xs text-on-surface-variant">To {appointModalComm.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppointModalComm(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {appointMemberError && (
              <div className="my-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{appointMemberError}</span>
              </div>
            )}

            <form onSubmit={handleAppointMember} className="space-y-4 mt-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Ramanathan"
                    value={memberFormData.name}
                    onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramanathan@sankalpvani.org"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98450 22334"
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Committee Role *</label>
                  <select
                    value={memberFormData.committeeRole}
                    onChange={(e) => setMemberFormData({ ...memberFormData, committeeRole: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="CONVENER">Convener / Chairman</option>
                    <option value="SECRETARY">Member Secretary</option>
                    <option value="TREASURER">Treasurer / Accounts</option>
                    <option value="TECHNICAL_EXPERT">Technical Expert / Sthapathi</option>
                    <option value="ADVISOR">Agama Advisor / Scholar</option>
                    <option value="MEMBER">Executive Member</option>
                  </select>
                </div>
              </div>

              {/* Gotra and Nakshatra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Gotra</label>
                  <select
                    value={memberFormData.gotra}
                    onChange={(e) => setMemberFormData({ ...memberFormData, gotra: e.target.value })}
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
                    value={memberFormData.nakshatra}
                    onChange={(e) => setMemberFormData({ ...memberFormData, nakshatra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Nakshatra...</option>
                    {STANDARD_NAKSHATRAS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Term Start Date *</label>
                  <input
                    type="date"
                    required
                    value={memberFormData.termStart}
                    onChange={(e) => setMemberFormData({ ...memberFormData, termStart: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Term End Date (Optional)</label>
                  <input
                    type="date"
                    value={memberFormData.termEnd}
                    onChange={(e) => setMemberFormData({ ...memberFormData, termEnd: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setAppointModalComm(null)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAppointingMember}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {isAppointingMember ? (
                    <span>Appointing...</span>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Appoint to Committee</span>
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
        initialTab="COMMITTEE_CATEGORY"
        onMasterUpdated={fetchData}
      />
    </div>
  );
}
