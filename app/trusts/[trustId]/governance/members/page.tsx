'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Briefcase
} from 'lucide-react';
import MemberCard from '@/components/governance/MemberCard';

interface MemberItem {
  id: string;
  userId: string;
  trustId: string;
  name: string;
  email: string;
  phone: string;
  gotra: string;
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

export default function MembersDirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    photoUrl: '',
    membershipType: 'STAFF' as any,
    templeIds: [] as string[],
    committeeId: '',
    committeeRole: 'MEMBER',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: ''
  });

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
        photoUrl: '',
        membershipType: 'STAFF',
        templeIds: [],
        committeeId: '',
        committeeRole: 'MEMBER',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: ''
      });
      await fetchData();
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
    const matchesTemple = templeFilter === 'ALL' || m.assignedTemples.some(t => t.templeId === templeFilter);

    return matchesQuery && matchesType && matchesStatus && matchesTemple;
  });

  const totalMembersCount = members.length;
  const trusteesCount = members.filter(m => m.membershipType === 'TRUSTEE' || m.membershipType === 'GOVERNANCE_HEAD').length;
  const priestsCount = members.filter(m => m.membershipType === 'PRIEST').length;
  const staffCount = members.filter(m => m.membershipType === 'STAFF').length;
  const committeeAppointeesCount = members.filter(m => m.assignedCommittees.length > 0).length;

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b divider-gold pb-6">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push(`/trusts/${trustId}/dashboard`)}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant transition-colors cursor-pointer"
              title="Back to Trust Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                  Trust & Temple Hierarchy Roster
                </span>
                <span className="text-xs text-on-surface-variant font-mono">{trustId}</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight mt-1">
                Members, Staff & Committee Appointees
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Refresh Roster"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-sans text-xs font-bold shadow-sacred transition-all cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Add / Invite Member</span>
            </button>
          </div>
        </div>

        {/* Member Analytics KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Members</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalMembersCount} Registered</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Trust Umbrella Roster</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Trustees & Governance</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{trusteesCount} Trustees</h3>
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">Apex Trust Board</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Crown size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Archakas & Priests</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{priestsCount} Acharyas</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Sanctum Pooja Duties</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Flame size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Committee Appointees</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{committeeAppointeesCount} Active</h3>
              <p className="text-[10px] text-purple-700 font-bold mt-0.5">Jeernodharana & Festival Wings</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {MEMBERSHIP_TYPE_PILLS.map(pill => (
            <button
              key={pill.key}
              onClick={() => setTypeFilter(pill.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                typeFilter === pill.key
                  ? 'bg-primary text-on-primary shadow-sacred scale-102'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Members Directory */}
        <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Users size={20} /> Member Directory & Multi-Temple Assignments
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Manage personal profiles, Gotras, multi-temple operational assignments, and committee roles.
              </p>
            </div>

            {/* Search & Temple Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search name, gotra, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
                />
              </div>

              <select
                value={templeFilter}
                onChange={(e) => setTempleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Temples</option>
                {temples.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
              <Users size={40} className="mx-auto text-primary/40 mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface">No Members Found</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                {searchQuery || typeFilter !== 'ALL' || templeFilter !== 'ALL'
                  ? 'No members match your current filters.'
                  : 'No members have been registered yet. Click "+ Add / Invite Member" to register your first member.'}
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
                    templeAssignments: m.assignedTemples.map(t => ({
                      templeId: t.templeId,
                      templeName: t.templeName,
                      roleName: t.status || 'Assigned',
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
      </div>

      {/* ADD / INVITE MEMBER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-xl w-full p-6 md:p-8 shadow-sacred animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b divider-gold">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Add / Invite Member</h3>
                  <p className="text-xs text-on-surface-variant">Register person, assign temples & committees</p>
                </div>
              </div>
              <button
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
                    placeholder="Sri Ramanatha Dikshidar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="member@sringeri.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 11223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Gotra</label>
                  <input
                    type="text"
                    placeholder="e.g. Kashyapa / Vasishta"
                    value={formData.gotra}
                    onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Membership Type *</label>
                  <select
                    value={formData.membershipType}
                    onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="STAFF">Temple Staff</option>
                    <option value="PRIEST">Acharya / Priest</option>
                    <option value="TRUSTEE">Trustee / Board Member</option>
                    <option value="VOLUNTEER">Seva Volunteer</option>
                    <option value="DONOR">Patron / Donor</option>
                    <option value="STANDARD">General Member</option>
                  </select>
                </div>
              </div>

              {/* Multi-Temple Selection */}
              <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-2">
                <label className="font-bold text-on-surface flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  <span>Assign to Child Temples (Multi-Temple Scope)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {temples.map((t) => {
                    const isChecked = formData.templeIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTempleSelection(t.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Committee Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Assign to Committee (Optional)</label>
                  <select
                    value={formData.committeeId}
                    onChange={(e) => setFormData({ ...formData, committeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="">None</option>
                    {committees.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                {formData.committeeId && (
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">Committee Role</label>
                    <select
                      value={formData.committeeRole}
                      onChange={(e) => setFormData({ ...formData, committeeRole: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
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
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}
