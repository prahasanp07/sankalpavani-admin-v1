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
  Clock,
  CheckCircle2,
  UserCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Crown,
  Building2,
  Moon,
  Compass,
  Layers,
  Bookmark
} from 'lucide-react';
import GovernanceMastersModal from './governance/GovernanceMastersModal';

export interface TrusteeItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  nakshatra?: string;
  avatarUrl?: string;
  designationId: string;
  designationName: string;
  designationDescription?: string;
  trusteeType: string;
  cadreRank: string;
  assignedTemples?: string[];
  responsibilities?: string;
  notes?: string;
  resolutionNo?: string;
  termStart: string;
  termEnd?: string | null;
  isLifeTerm: boolean;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
  createdAt?: string;
}

interface DesignationOption {
  id: string;
  name: string;
  description?: string;
}

interface TempleOption {
  id: string;
  name: string;
  code: string;
}

export const TRUSTEE_CATEGORIES = [
  'Managing Trustee / Dharmadhikari',
  'Hereditary Trustee (Vamshaparamparya)',
  'Endowment / Govt Nominated Trustee',
  'Elected Board Trustee',
  'Advisory Committee Member',
  'Life Trustee',
  'Honorary Patron'
];

export const STANDARD_GOTRAS = [
  'Kashyapa',
  'Vasishta',
  'Bharadwaja',
  'Vishwamitra',
  'Gautama',
  'Jamadagni',
  'Atri',
  'Agastya',
  'Harita',
  'Kaundinya',
  'Mudgala',
  'Sandilya',
  'Garga',
  'Angirasa',
  'Kaushika',
  'Srivatsa',
  'Parashara',
  'Naidhruva',
  'Shathamarshana',
  'Kutsa'
];

export const STANDARD_NAKSHATRAS = [
  'Ashwini (ಅಶ್ವಿನಿ)',
  'Bharani (ಭರಣಿ)',
  'Krittika (ಕೃತಿಕಾ)',
  'Rohini (ರೋಹಿಣಿ)',
  'Mrigashira (ಮೃಗಶಿರಾ)',
  'Ardra (ಆರ್ದ್ರಾ)',
  'Punarvasu (ಪುನರ್ವಸು)',
  'Pushya (ಪುಷ್ಯ)',
  'Ashlesha (ಆಶ್ಲೇಷಾ)',
  'Magha (ಮಖಾ)',
  'Purva Phalguni (ಪುಬ್ಬಾ)',
  'Uttara Phalguni (ಉತ್ತರಾ)',
  'Hasta (ಹಸ್ತಾ)',
  'Chitra (ಚಿತ್ತಾ)',
  'Swati (ಸ್ವಾತಿ)',
  'Vishakha (ವಿಶಾಖಾ)',
  'Anuradha (ಅನುರಾಧಾ)',
  'Jyeshtha (ಜ್ಯೇಷ್ಠಾ)',
  'Mula (ಮೂಲಾ)',
  'Purva Ashadha (ಪೂರ್ವಾಷಾಢ)',
  'Uttara Ashadha (ಉತ್ತರಾಷಾಢ)',
  'Shravana (ಶ್ರವಣ)',
  'Dhanishta (ಧನಿಷ್ಠಾ)',
  'Shatabhisha (ಶತಭಿಷ)',
  'Purva Bhadrapada (ಪೂರ್ವಾಭಾದ್ರ)',
  'Uttara Bhadrapada (ಉತ್ತರಾಭಾದ್ರ)',
  'Revati (ರೇವತಿ)'
];

interface TrusteesGovernanceProps {
  trustId?: string;
  trustName?: string;
  onBack?: () => void;
  onNavigate?: (tab: string) => void;
}

export default function TrusteesGovernance({
  trustId = 'trust_sringeri',
  trustName,
  onBack,
  onNavigate
}: TrusteesGovernanceProps) {
  const currentTrustName = (
    trustName ||
    (trustId === 'trust_ahobila'
      ? 'Sri Ahobila Matha Devasthanam Trust'
      : 'Sri Sringeri Sharada Dharma Trust')
  ).toUpperCase();
  const [trustees, setTrustees] = useState<TrusteeItem[]>([]);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [temples, setTemples] = useState<TempleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Masters State
  const [trusteeCategories, setTrusteeCategories] = useState<string[]>(TRUSTEE_CATEGORIES);
  const [isMastersModalOpen, setIsMastersModalOpen] = useState(false);

  // Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCustomDesigMode, setIsCustomDesigMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gotra: '',
    nakshatra: '',
    avatarUrl: '',
    designationId: '',
    customDesignationName: 'Trust Board Member',
    trusteeType: 'Elected Board Trustee',
    cadreRank: 'Apex Governance & Trust Board',
    assignedTemples: [] as string[],
    termStart: new Date().toISOString().split('T')[0],
    termEnd: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isLifeTerm: false,
    resolutionNo: '',
    responsibilities: '',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Trustees
      const tRes = await fetch(`/api/v1/trusts/${trustId}/trustees`);
      if (tRes.ok) {
        const json = await tRes.json();
        if (json.data) setTrustees(json.data);
      }

      // 2. Fetch Designations
      const dRes = await fetch(`/api/v1/trusts/${trustId}/designations`);
      if (dRes.ok) {
        const json = await dRes.json();
        if (json.data) setDesignations(json.data);
      }

      // 3. Fetch Temples
      const tempRes = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (tempRes.ok) {
        const json = await tempRes.json();
        if (json.data) setTemples(json.data);
      }

      // 4. Fetch Master Trustee Categories
      const mRes = await fetch(`/api/v1/trusts/${trustId}/masters?type=TRUSTEE_CATEGORY`);
      if (mRes.ok) {
        const json = await mRes.json();
        if (json.data && json.data.length > 0) {
          setTrusteeCategories(json.data.map((item: any) => item.name));
        }
      }
    } catch (err) {
      console.error('Failed to fetch trustees governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trustId]);

  const toggleTempleAssignment = (templeName: string) => {
    setFormData(prev => {
      const exists = prev.assignedTemples.includes(templeName);
      return {
        ...prev,
        assignedTemples: exists
          ? prev.assignedTemples.filter(t => t !== templeName)
          : [...prev.assignedTemples, templeName]
      };
    });
  };

  const handleAppoint = async (e: React.FormEvent) => {
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
        avatarUrl: formData.avatarUrl,
        designationId: isCustomDesigMode ? undefined : formData.designationId,
        customDesignationName: isCustomDesigMode ? formData.customDesignationName : (
          designations.find(d => d.id === formData.designationId)?.name || formData.customDesignationName
        ),
        trusteeType: formData.trusteeType,
        cadreRank: formData.cadreRank,
        assignedTemples: formData.assignedTemples,
        termStart: new Date(formData.termStart).toISOString(),
        termEnd: formData.isLifeTerm || !formData.termEnd ? null : new Date(formData.termEnd).toISOString(),
        resolutionNo: formData.resolutionNo,
        responsibilities: formData.responsibilities,
        notes: formData.notes
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/trustees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Failed to appoint trustee');
      }

      const resJson = await res.json();
      if (resJson.data) {
        setTrustees(prev => [{ ...resJson.data, nakshatra: formData.nakshatra, assignedTemples: formData.assignedTemples }, ...prev]);
      }

      showToast(`Successfully appointed "${formData.name}" to the Board of Trustees!`);
      setIsAppointModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        gotra: '',
        nakshatra: '',
        avatarUrl: '',
        designationId: '',
        customDesignationName: 'Trust Board Member',
        trusteeType: 'Elected Board Trustee',
        cadreRank: 'Apex Governance & Trust Board',
        assignedTemples: [],
        termStart: new Date().toISOString().split('T')[0],
        termEnd: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isLifeTerm: false,
        resolutionNo: '',
        responsibilities: '',
        notes: ''
      });
    } catch (err: any) {
      setModalError(err.message || 'Error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrustees = trustees.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.gotra && t.gotra.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.nakshatra && t.nakshatra.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.designationName && t.designationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.resolutionNo && t.resolutionNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || t.trusteeType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.appointmentStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = trustees.filter(t => t.appointmentStatus === 'ACTIVE').length;
  const lifeCount = trustees.filter(t => t.isLifeTerm).length;
  const electedCount = trustees.filter(t => t.trusteeType.includes('Elected')).length;

  const defaultAvailableTemples: TempleOption[] = temples.length > 0 ? temples : [
    { id: 'temple_vidyashankara', name: 'Sri Vidyashankara Temple', code: 'SVT-01' },
    { id: 'temple_sharadamba', name: 'Sri Sharadamba Temple', code: 'SST-02' }
  ];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-[slideUp_0.3s_ease-out]">
          <Sparkles size={18} className="text-amber-300" />
          <span className="font-sans text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              Apex Board Governance
            </span>
            <span className="text-xs font-bold font-sans text-on-surface uppercase tracking-wide">
              {currentTrustName}
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Trustees & Board of Management
          </h1>
          <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
            Administer the Board of Trustees, custodial office terms, board resolutions, and hereditary appointments across the Trust umbrella.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            className="p-2.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-xs"
            title="Refresh Board Data"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsMastersModalOpen(true)}
            className="px-3 py-2 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-sans text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            title="Configure Governance & Trustee Categories"
          >
            <Bookmark size={14} className="text-primary" />
            <span>Master Categories</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAppointModalOpen(true)}
            className="px-4 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-2xl font-sans text-xs font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Appoint Board Trustee</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Board</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{trustees.length} Trustees</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{activeCount} Active / In-Office</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Permanent / Life</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{lifeCount} Lifetime</h3>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">Hereditary & Spiritual</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Award size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Elected Cadre</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{electedCount} Board Members</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5">Term-bound Governance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Quorum & Compliance</p>
            <h3 className="font-serif text-2xl font-bold text-emerald-700 mt-1">100% Valid</h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Statutory & Agamic Compliant</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Main Filter & Board Grid Section */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
              <Users size={18} /> Board Members Registry
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {filteredTrustees.length} showing
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search trustee, gotra, nakshatra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface font-sans focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Board Categories</option>
              {trusteeCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-[11px] font-bold">
              {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${statusFilter === st
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {st === 'ALL' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trustees Grid */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-sans text-xs text-on-surface-variant font-medium">Synchronizing Board Registry...</p>
          </div>
        ) : filteredTrustees.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl space-y-3">
            <Users size={36} className="mx-auto text-primary/40" />
            <h3 className="font-serif text-base font-bold text-on-surface">No Board Trustees Found</h3>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Adjust your search query or filter tags to display members.'
                : 'Click "+ Appoint Board Trustee" to register your first Board member under this Trust.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAppointModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus size={14} />
              <span>Appoint First Trustee</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTrustees.map((trustee) => (
              <div
                key={trustee.id}
                className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 shadow-xs hover:shadow-sacred transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={trustee.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                      alt={trustee.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-primary/20 shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-serif text-sm font-bold text-primary truncate" title={trustee.name}>
                          {trustee.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${trustee.appointmentStatus === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                          : 'bg-on-surface-variant/10 text-on-surface-variant'
                          }`}>
                          {trustee.appointmentStatus}
                        </span>
                      </div>

                      <p className="font-sans text-xs font-semibold text-on-surface truncate mt-0.5">
                        {trustee.designationName || 'Trustee Member'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 font-medium">
                          {trustee.trusteeType}
                        </span>
                        {trustee.gotra && (
                          <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container px-1.5 py-0.5 rounded">
                            {trustee.gotra}
                          </span>
                        )}
                        {trustee.nakshatra && (
                          <span className="text-[10px] text-primary font-mono bg-primary/5 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Moon size={9} /> {trustee.nakshatra.split('(')[0].trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 pt-3 border-t border-outline-variant/30 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant truncate">
                      <Mail size={12} className="shrink-0 text-primary" />
                      <span className="truncate">{trustee.email}</span>
                    </div>
                    {trustee.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                        <Phone size={12} className="shrink-0 text-primary" />
                        <span>{trustee.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Child Temples */}
                  {trustee.assignedTemples && trustee.assignedTemples.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                        <Building2 size={10} className="text-amber-700" /> Scopes:
                      </span>
                      {trustee.assignedTemples.map((temp, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/40 text-on-surface font-medium">
                          {temp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tenure / Board Resolution */}
                  <div className="mt-3 bg-surface-container/60 p-2.5 rounded-xl border border-outline-variant/30 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <Calendar size={11} className="text-amber-700" /> Tenure:
                      </span>
                      <span className="font-bold text-on-surface">
                        {trustee.isLifeTerm ? (
                          <span className="text-amber-700 font-serif font-bold">Lifetime Appointment</span>
                        ) : (
                          `${new Date(trustee.termStart).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} - ${trustee.termEnd ? new Date(trustee.termEnd).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Indefinite'
                          }`
                        )}
                      </span>
                    </div>

                    {trustee.resolutionNo && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-on-surface-variant flex items-center gap-1">
                          <FileText size={10} className="text-primary" /> Resolution:
                        </span>
                        <span className="font-mono font-semibold text-primary">{trustee.resolutionNo}</span>
                      </div>
                    )}
                  </div>

                  {/* Portfolios / Responsibilities */}
                  {trustee.responsibilities && (
                    <div className="mt-2.5 text-[11px] text-on-surface-variant line-clamp-2 bg-surface-container/30 px-2.5 py-1.5 rounded-lg">
                      <span className="font-bold text-on-surface">Portfolio: </span>
                      {trustee.responsibilities}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant">
                  <span className="font-mono">{trustee.cadreRank || 'Trust Board'}</span>
                  <span className="flex items-center gap-1 text-primary font-bold">
                    <Check size={11} /> Verified Custodian
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appoint Trustee Modal */}
      {isAppointModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b divider-gold flex items-center justify-between bg-surface-container/60">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Appoint Trustee / Board Member</h3>
                  <p className="font-sans text-xs text-on-surface-variant">Formalize tenure appointments & legal board resolutions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAppointModalOpen(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAppoint} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
              {modalError && (
                <div className="p-3 bg-error-container/20 text-error border border-error/20 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Row 1: Full Legal Name & Designation / Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srikanth Sastry / Sri Vidyaranya"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Designation / Title *</label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDesigMode(!isCustomDesigMode)}
                      className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                    >
                      {isCustomDesigMode ? 'Select existing' : '+ Custom title'}
                    </button>
                  </div>
                  {isCustomDesigMode ? (
                    <input
                      type="text"
                      placeholder="Trust Board Member"
                      value={formData.customDesignationName}
                      onChange={(e) => setFormData({ ...formData, customDesignationName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  ) : (
                    <select
                      value={formData.designationId}
                      onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                    >
                      <option value="">Trust Board Member</option>
                      {designations.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 2: Trustee Category & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-on-surface">Trustee Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsMastersModalOpen(true)}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      + Add / Manage
                    </button>
                  </div>
                  <select
                    value={formData.trusteeType}
                    onChange={(e) => setFormData({ ...formData, trusteeType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                  >
                    {trusteeCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="trustee@sringeri.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </div>

              {/* Row 3: Phone Number, Gotra, Nakshatra */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98450 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                {/* Gotra Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Compass size={12} className="text-amber-700" /> Gotra
                  </label>
                  <select
                    value={formData.gotra}
                    onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                  >
                    <option value="">Select Gotra...</option>
                    {STANDARD_GOTRAS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Nakshatra Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Moon size={12} className="text-amber-700" /> Nakshatra
                  </label>
                  <select
                    value={formData.nakshatra}
                    onChange={(e) => setFormData({ ...formData, nakshatra: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                  >
                    <option value="">Select Nakshatra...</option>
                    {STANDARD_NAKSHATRAS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign to Temples (Multi-Temple Scope) - Positioned directly above Tenure & Term Limits */}
              <div className="bg-surface-container/60 rounded-2xl border border-outline-variant/40 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-amber-700 shrink-0" />
                  <span className="font-bold text-xs text-on-surface">
                    Assign to Temples (Multi-Temple Scope)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {defaultAvailableTemples.map((temple) => {
                    const isChecked = formData.assignedTemples.includes(temple.name);
                    return (
                      <label
                        key={temple.id}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs cursor-pointer transition-all ${isChecked
                          ? 'bg-primary-container/20 border-primary text-primary font-bold shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTempleAssignment(temple.name)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/40"
                        />
                        <span>{temple.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tenure & Term Limits Distinct Container Section */}
              <div className="bg-surface-container/60 rounded-2xl border border-outline-variant/40 p-4 md:p-5 space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Calendar size={15} />
                    <span className="font-bold text-[11px] uppercase tracking-wider font-sans">
                      TENURE & TERM LIMITS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="lifeTrusteeCheckbox"
                      checked={formData.isLifeTerm}
                      onChange={(e) => setFormData({
                        ...formData,
                        isLifeTerm: e.target.checked,
                        termEnd: e.target.checked ? '' : formData.termEnd
                      })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer border-outline-variant/40"
                    />
                    <label htmlFor="lifeTrusteeCheckbox" className="text-xs font-semibold text-on-surface cursor-pointer">
                      Life Trustee (Permanent)
                    </label>
                  </div>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Appointment Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.termStart}
                      onChange={(e) => setFormData({ ...formData, termStart: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface">Appointment End Date</label>
                    <input
                      type="date"
                      disabled={formData.isLifeTerm}
                      value={formData.termEnd}
                      onChange={(e) => setFormData({ ...formData, termEnd: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Board Resolution Row */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                    <FileText size={14} />
                    <span>Board Resolution / Order Number (Optional)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. TR-2026/04 or GOV-ENDOW/8892/2026"
                    value={formData.resolutionNo}
                    onChange={(e) => setFormData({ ...formData, resolutionNo: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface font-mono placeholder:font-sans placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    Capture official legal audit reference number or government endowment gazette order.
                  </p>
                </div>
              </div>

              {/* Key Duties & Portfolio Oversight */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">Key Duties & Portfolio Oversight</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Overseeing Veda Pathashala expansion, statutory financial audits, and Jeernodharana projects..."
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t divider-gold flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAppointModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-xl text-xs font-bold shadow-sacred hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{isSubmitting ? 'Formalizing...' : 'Formalize Appointment'}</span>
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
        initialTab="TRUSTEE_CATEGORY"
        onMasterUpdated={fetchData}
      />
    </div>
  );
}
