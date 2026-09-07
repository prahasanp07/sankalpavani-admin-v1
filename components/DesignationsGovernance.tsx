'use client';

import React, { useState, useEffect } from 'react';
import {
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
  Link,
  Crown,
  ChevronRight,
  Moon,
  Compass,
  Tag,
  Layers
} from 'lucide-react';
import { STANDARD_GOTRAS, STANDARD_NAKSHATRAS } from './TrusteesGovernance';
import GovernanceMastersModal from '@/components/governance/GovernanceMastersModal';
import { MasterType } from '@/lib/types/masters';

export interface DesignationItem {
  id: string;
  trustId: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  scopeName: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  activeAppointeesCount: number;
  roleBinding?: {
    roleId: string;
    roleName: string;
    autoAssign: boolean;
  } | null;
}

export interface OfficeBearerItem {
  id: string;
  trustId: string;
  scopeId: string;
  scopeName: string;
  userId: string;
  personName: string;
  email: string;
  phone: string;
  gotra?: string;
  nakshatra?: string;
  photoUrl: string;
  designationId: string;
  designationName: string;
  termStart: string;
  termEnd: string | null;
  isLifeTerm: boolean;
  resolutionNo: string;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
}

interface TempleOption {
  id: string;
  name: string;
  code: string;
}

interface RoleOption {
  id: string;
  name: string;
  roleKey: string;
}

interface DesignationsGovernanceProps {
  trustId?: string;
  trustName?: string;
  onBack?: () => void;
}

export default function DesignationsGovernance({
  trustId = 'trust_sringeri',
  trustName,
  onBack
}: DesignationsGovernanceProps) {
  const currentTrustName = (
    trustName ||
    (trustId === 'trust_ahobila'
      ? 'Sri Ahobila Matha Devasthanam Trust'
      : 'Sri Sringeri Sharada Dharma Trust')
  ).toUpperCase();
  const [activeTab, setActiveTab] = useState<'DESIGNATIONS' | 'OFFICE_BEARERS'>('DESIGNATIONS');
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [officeBearers, setOfficeBearers] = useState<OfficeBearerItem[]>([]);
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'TRUST' | 'TEMPLE'>('ALL');

  // Create Designation Modal
  const [isCreateDesigOpen, setIsCreateDesigOpen] = useState(false);
  const [isSubmittingDesig, setIsSubmittingDesig] = useState(false);
  const [desigModalError, setDesigModalError] = useState<string | null>(null);
  const [desigFormData, setDesigFormData] = useState({
    name: '',
    description: '',
    scopeType: 'TRUST' as 'TRUST' | 'TEMPLE',
    scopeId: '',
    roleId: '',
    autoAssign: true
  });

  // Appoint Office Bearer Modal
  const [isAppointOpen, setIsAppointOpen] = useState(false);
  const [isSubmittingAppoint, setIsSubmittingAppoint] = useState(false);
  const [appointModalError, setAppointModalError] = useState<string | null>(null);
  const [appointFormData, setAppointFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    photoUrl: '',
    designationId: '',
    scopeId: '',
    termStart: new Date().toISOString().split('T')[0],
    termEnd: '',
    isLifeTerm: false,
    resolutionNo: ''
  });

  // Category Masters Modal
  const [isMastersModalOpen, setIsMastersModalOpen] = useState(false);
  const [mastersInitialTab, setMastersInitialTab] = useState<MasterType>('TRUSTEE_CATEGORY');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Designations
      const dRes = await fetch(`/api/v1/trusts/${trustId}/designations`);
      if (dRes.ok) {
        const json = await dRes.json();
        if (json.data) setDesignations(json.data);
      }

      // 2. Fetch Office Bearers
      const obRes = await fetch(`/api/v1/trusts/${trustId}/office-bearers`);
      if (obRes.ok) {
        const json = await obRes.json();
        if (json.data) setOfficeBearers(json.data);
      }

      // 3. Fetch Temples
      const tRes = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (tRes.ok) {
        const json = await tRes.json();
        if (json.data) setTemples(json.data);
      }

      // 4. Fetch Roles for Binding Dropdown
      const rRes = await fetch(`/api/v1/trusts/${trustId}/roles`);
      if (rRes.ok) {
        const json = await rRes.json();
        if (json.data) setRoles(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trustId]);

  const handleCreateDesignation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDesig(true);
    setDesigModalError(null);

    try {
      const payload: any = {
        name: desigFormData.name,
        description: desigFormData.description,
        scopeType: desigFormData.scopeType,
        scopeId: desigFormData.scopeType === 'TEMPLE' ? desigFormData.scopeId : trustId
      };

      if (desigFormData.roleId) {
        payload.roleBinding = {
          roleId: desigFormData.roleId,
          autoAssign: desigFormData.autoAssign
        };
      }

      const res = await fetch(`/api/v1/trusts/${trustId}/designations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create designation');
      }

      setIsCreateDesigOpen(false);
      setDesigFormData({
        name: '',
        description: '',
        scopeType: 'TRUST',
        scopeId: '',
        roleId: '',
        autoAssign: true
      });
      await fetchData();
    } catch (err: any) {
      setDesigModalError(err.message || 'Error creating designation');
    } finally {
      setIsSubmittingDesig(false);
    }
  };

  const handleAppointOfficeBearer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAppoint(true);
    setAppointModalError(null);

    try {
      const payload = {
        name: appointFormData.name,
        email: appointFormData.email,
        phone: appointFormData.phone,
        gotra: appointFormData.gotra,
        nakshatra: appointFormData.nakshatra,
        photoUrl: appointFormData.photoUrl,
        designationId: appointFormData.designationId,
        scopeId: appointFormData.scopeId || trustId,
        termStart: new Date(appointFormData.termStart).toISOString(),
        termEnd: appointFormData.isLifeTerm ? null : appointFormData.termEnd ? new Date(appointFormData.termEnd).toISOString() : null,
        resolutionNo: appointFormData.resolutionNo
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/office-bearers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to appoint office bearer');
      }

      setIsAppointOpen(false);
      setAppointFormData({
        name: '',
        email: '',
        phone: '',
        gotra: '',
        nakshatra: '',
        photoUrl: '',
        designationId: '',
        scopeId: '',
        termStart: new Date().toISOString().split('T')[0],
        termEnd: '',
        isLifeTerm: false,
        resolutionNo: ''
      });
      await fetchData();
    } catch (err: any) {
      setAppointModalError(err.message || 'Error appointing office bearer');
    } finally {
      setIsSubmittingAppoint(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED') => {
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/office-bearers/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredDesignations = designations.filter(d => {
    const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'ALL' || d.scopeType === scopeFilter;
    return matchesQuery && matchesScope;
  });

  const filteredOfficeBearers = officeBearers.filter(ob => {
    const matchesQuery =
      ob.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ob.designationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ob.resolutionNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesQuery;
  });

  const trustTitlesCount = designations.filter(d => d.scopeType === 'TRUST').length;
  const templeTitlesCount = designations.filter(d => d.scopeType === 'TEMPLE').length;
  const activeOfficeBearersCount = officeBearers.filter(ob => ob.appointmentStatus === 'ACTIVE').length;
  const titlesWithRolesCount = designations.filter(d => !!d.roleBinding).length;

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
              Trust Governance & Designations
            </span>
            <span className="text-xs font-bold font-sans text-on-surface uppercase tracking-wide">
              {currentTrustName}
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight mt-0.5">
            Designations & Office Bearers
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setIsCreateDesigOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-2xl font-sans text-xs font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={14} />
            <span>Create Designation</span>
          </button>

          {/* <button
            onClick={() => setIsAppointOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-sans text-xs font-bold shadow-sacred transition-all cursor-pointer"
          >
            <Award size={14} />
            <span>Appoint Office Bearer</span>
          </button> */}
        </div>
      </div>

      {/* Category Masters & Action Modals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Block 1: Trust Categories - Master */}
        <div
          onClick={() => {
            setMastersInitialTab('TRUSTEE_CATEGORY');
            setIsMastersModalOpen(true);
          }}
          className="p-5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">Trust Categories</h3>
            <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bold mt-0.5 flex items-center gap-1">Open Category Master →</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Tag size={24} />
          </div>
        </div>

        {/* Block 2: Membership Type - Master */}
        <div
          onClick={() => {
            setMastersInitialTab('MEMBERSHIP_TYPE');
            setIsMastersModalOpen(true);
          }}
          className="p-5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">Membership Type</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5 flex items-center gap-1">Open Membership Master →</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Users size={24} />
          </div>
        </div>

        {/* Block 3: Committee Category - Master */}
        <div
          onClick={() => {
            setMastersInitialTab('COMMITTEE_CATEGORY');
            setIsMastersModalOpen(true);
          }}
          className="p-5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-purple-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">Committee Category</h3>
            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-0.5 flex items-center gap-1">Open Committee Master →</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Layers size={24} />
          </div>
        </div>

        {/* Block 4: Appoint Office Bearer */}
        <div
          onClick={() => setIsAppointOpen(true)}
          className="p-5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/30 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div>
            <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors mt-0.5">Appointing Trustees</h3>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold mt-0.5 flex items-center gap-1">Launch Appointment Form →</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30 text-xs font-bold">
          <button
            onClick={() => setActiveTab('DESIGNATIONS')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'DESIGNATIONS'
              ? 'bg-primary text-on-primary shadow-sacred'
              : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            Designations Catalog ({designations.length})
          </button>
          <button
            onClick={() => setActiveTab('OFFICE_BEARERS')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${activeTab === 'OFFICE_BEARERS'
              ? 'bg-primary text-on-primary shadow-sacred'
              : 'text-on-surface-variant hover:text-primary'
              }`}
          >
            Active Office Bearers ({officeBearers.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder={activeTab === 'DESIGNATIONS' ? "Search title name, description..." : "Search appointee, resolution..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>

          {activeTab === 'DESIGNATIONS' && (
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Scopes</option>
              <option value="TRUST">Trust Umbrella</option>
              <option value="TEMPLE">Temple Specific</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: DESIGNATIONS CATALOG */}
      {activeTab === 'DESIGNATIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDesignations.map((d) => (
            <div
              key={d.id}
              className="p-5 rounded-3xl bg-surface-container/60 border border-outline-variant/30 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                    {d.scopeType === 'TRUST' ? 'Trust Umbrella' : `Temple: ${d.scopeName}`}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {d.activeAppointeesCount} Appointees
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-on-surface">
                  {d.name}
                </h3>

                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {d.description || 'Traditional or administrative organizational title.'}
                </p>

                {(() => {
                  const activeAppointees = officeBearers.filter(
                    (ob) => ob.designationId === d.id && ob.appointmentStatus === 'ACTIVE'
                  );
                  return (
                    <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-on-surface-variant text-[11px] shrink-0">
                        <Users size={13} className="text-primary" />
                        <span>Appointed Member:</span>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        {activeAppointees.length > 0 ? (
                          <div className="flex items-center gap-1.5 truncate">
                            {activeAppointees[0].photoUrl ? (
                              <img
                                src={activeAppointees[0].photoUrl}
                                alt={activeAppointees[0].personName}
                                className="w-5 h-5 rounded-full object-cover border border-primary/30 shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {activeAppointees[0].personName.charAt(0)}
                              </div>
                            )}
                            <span
                              className="font-bold text-on-surface text-xs truncate max-w-[170px]"
                              title={activeAppointees.map((a) => a.personName).join(', ')}
                            >
                              {activeAppointees.map((a) => a.personName).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant italic">None appointed yet</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant font-mono">ID: {d.id}</span>
                <button
                  onClick={() => {
                    setAppointFormData(prev => ({ ...prev, designationId: d.id, scopeId: d.scopeId }));
                    setIsAppointOpen(true);
                  }}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Appoint Person</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ACTIVE OFFICE BEARERS */}
      {activeTab === 'OFFICE_BEARERS' && (
        <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 shadow-sacred space-y-4">
          <div className="flex items-center justify-between pb-4 border-b divider-gold">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <Award size={20} /> Current Board & Temple Office Bearers
              </h3>
              <p className="text-xs text-on-surface-variant">Time-bound legal and traditional appointees with resolution references</p>
            </div>
          </div>

          {filteredOfficeBearers.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
              <Users size={36} className="mx-auto text-primary/40 mb-2" />
              <h4 className="font-serif text-base font-bold text-on-surface">No Office Bearers Found</h4>
              <p className="text-xs text-on-surface-variant mt-1">Click "Appoint Office Bearer" to register your first appointee.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficeBearers.map((ob) => (
                <div
                  key={ob.id}
                  className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col justify-between text-xs shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {ob.scopeName}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${ob.appointmentStatus === 'ACTIVE'
                        ? 'text-emerald-700 bg-emerald-500/10'
                        : 'text-error bg-error/10'
                        }`}>
                        {ob.appointmentStatus}
                      </span>
                    </div>

                    <div>
                      <p className="font-serif font-bold text-base text-on-surface">{ob.personName}</p>
                      <p className="text-xs font-bold text-primary">{ob.designationName}</p>
                    </div>

                    <div className="space-y-1 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
                      {ob.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={12} className="text-primary/70" /> {ob.phone}
                        </p>
                      )}
                      {ob.email && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Mail size={12} className="text-primary/70" /> {ob.email}
                        </p>
                      )}
                      {(ob.gotra || ob.nakshatra) && (
                        <p className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
                          <Compass size={12} className="text-amber-700" />
                          <span>{[ob.gotra ? `${ob.gotra} Gotra` : null, ob.nakshatra].filter(Boolean).join(' • ')}</span>
                        </p>
                      )}
                      {ob.resolutionNo && (
                        <p className="flex items-center gap-1.5 font-mono text-[10px] text-amber-800">
                          <FileText size={12} className="text-amber-700" /> Res: {ob.resolutionNo}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary/70" />
                        <span>
                          {new Date(ob.termStart).toLocaleDateString()} ➔ {ob.isLifeTerm ? 'Indefinite (Life Term)' : ob.termEnd ? new Date(ob.termEnd).toLocaleDateString() : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant font-mono text-[9px]">{ob.id}</span>
                    {ob.appointmentStatus === 'ACTIVE' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(ob.id, 'RESIGNED')}
                          className="text-error hover:underline font-bold cursor-pointer"
                        >
                          Mark Resigned
                        </button>
                        <button
                          onClick={() => handleStatusChange(ob.id, 'EXPIRED')}
                          className="text-amber-700 hover:underline font-bold cursor-pointer"
                        >
                          Expire Term
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(ob.id, 'ACTIVE')}
                        className="text-primary hover:underline font-bold cursor-pointer"
                      >
                        Re-activate Term
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Governance KPI Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Designations Catalog</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{designations.length} Titles</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{trustTitlesCount} Trust / {templeTitlesCount} Temple</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Crown size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Office Bearers</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{activeOfficeBearersCount} Appointees</h3>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">Term-Bound Appointees</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Role-Bound Titles</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{titlesWithRolesCount} Linked</h3>
            <p className="text-[10px] text-purple-700 font-bold mt-0.5">Auto Software Permissions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center">
            <Link size={24} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">PRD Architectural Law</p>
            <h3 className="font-serif text-sm font-bold text-primary mt-1">Designation ≠ Role</h3>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Title vs Software Access Separation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* CREATE DESIGNATION MODAL */}
      {isCreateDesigOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-lg w-full p-6 shadow-sacred space-y-4">
            <div className="flex items-center justify-between pb-3 border-b divider-gold">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-primary" />
                <h3 className="font-serif text-lg font-bold text-primary">Define New Designation Title</h3>
              </div>
              <button
                onClick={() => setIsCreateDesigOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {desigModalError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{desigModalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDesignation} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Designation Title Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dharmadhikari / Managing Trustee"
                  value={desigFormData.name}
                  onChange={(e) => setDesigFormData({ ...desigFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Description / Traditional Responsibilities</label>
                <textarea
                  rows={2}
                  placeholder="Describe legal authority or honorary traditions..."
                  value={desigFormData.description}
                  onChange={(e) => setDesigFormData({ ...desigFormData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Designation for</label>
                  <select
                    value={desigFormData.scopeType}
                    onChange={(e) => setDesigFormData({ ...desigFormData, scopeType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="TRUST">Trust</option>
                    <option value="TEMPLE">Temple</option>
                  </select>
                </div>

                {desigFormData.scopeType === 'TEMPLE' && (
                  <div className="space-y-1">
                    <label className="font-bold text-on-surface">For Temple</label>
                    <select
                      value={desigFormData.scopeId}
                      onChange={(e) => setDesigFormData({ ...desigFormData, scopeId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="">Select Temple...</option>
                      {temples.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Role Binding */}
              {/* <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Link size={14} />
                  <span>Optional Software Role Binding</span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Automatically grants administrative system permissions whenever a person is appointed to this title.
                </p>
                <select
                  value={desigFormData.roleId}
                  onChange={(e) => setDesigFormData({ ...desigFormData, roleId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface"
                >
                  <option value="">No Automatic Software Role</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} ({r.roleKey})</option>
                  ))}
                </select>
              </div> */}

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsCreateDesigOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDesig}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingDesig ? 'Creating...' : 'Save Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPOINT OFFICE BEARER MODAL */}
      {isAppointOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-lg w-full p-6 shadow-sacred space-y-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b divider-gold">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-primary" />
                <h3 className="font-serif text-lg font-bold text-primary">Formal Office Bearer Appointment</h3>
              </div>
              <button
                onClick={() => setIsAppointOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {appointModalError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{appointModalError}</span>
              </div>
            )}

            <form onSubmit={handleAppointOfficeBearer} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-on-surface">Trust Designation *</label>
                <select
                  required
                  value={appointFormData.designationId}
                  onChange={(e) => {
                    const sel = designations.find(d => d.id === e.target.value);
                    setAppointFormData({
                      ...appointFormData,
                      designationId: e.target.value,
                      scopeId: sel?.scopeId || ''
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">Select Designation...</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.scopeType === 'TRUST' ? 'Trust' : d.scopeName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Member Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srikanth Sastry"
                    value={appointFormData.name}
                    onChange={(e) => setAppointFormData({ ...appointFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="appointee@trust.org"
                    value={appointFormData.email}
                    onChange={(e) => setAppointFormData({ ...appointFormData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={appointFormData.phone}
                    onChange={(e) => setAppointFormData({ ...appointFormData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface flex items-center gap-1">
                    <Compass size={12} className="text-amber-700" /> Gotram
                  </label>
                  <select
                    value={appointFormData.gotra}
                    onChange={(e) => setAppointFormData({ ...appointFormData, gotra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Gotram...</option>
                    {STANDARD_GOTRAS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface flex items-center gap-1">
                    <Moon size={12} className="text-amber-700" /> Nakshatra
                  </label>
                  <select
                    value={appointFormData.nakshatra}
                    onChange={(e) => setAppointFormData({ ...appointFormData, nakshatra: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">Select Nakshatra...</option>
                    {STANDARD_NAKSHATRAS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Board Resolution / Order Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RES-2026/04-09B"
                  value={appointFormData.resolutionNo}
                  onChange={(e) => setAppointFormData({ ...appointFormData, resolutionNo: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 font-mono text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* Term Duration */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-on-surface">Term Duration</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-primary">
                    <input
                      type="checkbox"
                      checked={appointFormData.isLifeTerm}
                      onChange={(e) => setAppointFormData({ ...appointFormData, isLifeTerm: e.target.checked })}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span>Indefinite / Life Term</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">Term Start Date</span>
                    <input
                      type="date"
                      required
                      value={appointFormData.termStart}
                      onChange={(e) => setAppointFormData({ ...appointFormData, termStart: e.target.value })}
                      className="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface"
                    />
                  </div>
                  {!appointFormData.isLifeTerm && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase">Term End Date</span>
                      <input
                        type="date"
                        required={!appointFormData.isLifeTerm}
                        value={appointFormData.termEnd}
                        onChange={(e) => setAppointFormData({ ...appointFormData, termEnd: e.target.value })}
                        className="w-full p-2 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAppointOpen(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface font-bold hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAppoint}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-sacred hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAppoint ? 'Appointing...' : 'Confirm Appointment'}
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
        trustName={currentTrustName}
        initialTab={mastersInitialTab}
      />
    </div>
  );
}
