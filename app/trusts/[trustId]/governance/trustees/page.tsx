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
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import TrusteeCard from '@/components/governance/TrusteeCard';
import AppointTrusteeModal, { AppointTrusteeFormData } from '@/components/governance/AppointTrusteeModal';

interface TrusteeItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  avatarUrl?: string;
  designationId: string;
  designationName: string;
  designationDescription?: string;
  trusteeType: string;
  cadreRank: string;
  responsibilities?: string;
  notes?: string;
  resolutionNo?: string;
  termStart: string;
  termEnd?: string | null;
  isLifeTerm: boolean;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
}

interface DesignationOption {
  id: string;
  name: string;
  description?: string;
}

const TRUSTEE_CATEGORIES = [
  'Managing Trustee / Dharmadhikari',
  'Hereditary Trustee (Vamshaparamparya)',
  'Endowment / Govt Nominated Trustee',
  'Elected Board Trustee',
  'Advisory Committee Member',
  'Life Trustee',
  'Honorary Patron'
];

export default function TrusteesManagementPage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const [trustees, setTrustees] = useState<TrusteeItem[]>([]);
  const [designations, setDesignations] = useState<DesignationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isCustomDesigMode, setIsCustomDesigMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gotra: '',
    avatarUrl: '',
    designationId: '',
    customDesignationName: '',
    trusteeType: 'Elected Board Trustee',
    cadreRank: 'Apex Governance & Trust Board',
    termStart: new Date().toISOString().split('T')[0],
    termEnd: '',
    isLifeTerm: false,
    resolutionNo: '',
    responsibilities: '',
    notes: ''
  });

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
    } catch (err) {
      console.error('Failed to fetch governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trustId]);

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
        avatarUrl: formData.avatarUrl,
        designationId: isCustomDesigMode ? undefined : formData.designationId,
        customDesignationName: isCustomDesigMode ? formData.customDesignationName : undefined,
        trusteeType: formData.trusteeType,
        cadreRank: formData.cadreRank,
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

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to appoint trustee');
      }

      setIsAppointModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        gotra: '',
        avatarUrl: '',
        designationId: '',
        customDesignationName: '',
        trusteeType: 'Elected Board Trustee',
        cadreRank: 'Apex Governance & Trust Board',
        termStart: new Date().toISOString().split('T')[0],
        termEnd: '',
        isLifeTerm: false,
        resolutionNo: '',
        responsibilities: '',
        notes: ''
      });
      setIsCustomDesigMode(false);
      await fetchData();
    } catch (err: any) {
      setModalError(err.message || 'An error occurred during appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (trusteeId: string, newStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED') => {
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/trustees/${trusteeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentStatus: newStatus })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to update trustee status:', err);
    }
  };

  const filteredTrustees = trustees.filter(t => {
    const matchesQuery = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.designationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.resolutionNo && t.resolutionNo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'ALL' || t.trusteeType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.appointmentStatus === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  const activeCount = trustees.filter(t => t.appointmentStatus === 'ACTIVE').length;
  const hereditaryCount = trustees.filter(t => t.trusteeType.includes('Hereditary')).length;
  const nominatedCount = trustees.filter(t => t.trusteeType.includes('Nominated')).length;
  const lifeCount = trustees.filter(t => t.isLifeTerm).length;

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
                  Trust Governance & Board
                </span>
                <span className="text-xs text-on-surface-variant font-mono">{trustId}</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight mt-1">
                Trustees & Trust Board Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Refresh Registry"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/roles`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck size={16} />
              <span>Dynamic RBAC Policies</span>
            </button>

            <button
              onClick={() => setIsAppointModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-sans text-xs font-bold shadow-sacred transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Appoint New Trustee</span>
            </button>
          </div>
        </div>

        {/* Board Analytics KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Board Members</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{activeCount} Trustees</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{trustees.length} Total Historical Appointments</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Life & Hereditary Terms</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{lifeCount + hereditaryCount}</h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{hereditaryCount} Vamshaparamparya Lineage</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Sparkles size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Govt / Nominated</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{nominatedCount} Appointees</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Endowments Department</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
              <Landmark size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Dynamic Titles Registered</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{designations.length} Titles</h3>
              <p className="text-[10px] text-primary font-bold mt-0.5">Configured for this Trust</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Trustees Directory & Controls */}
        <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Users size={20} /> Trust Board of Trustees Registry
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Authoritative legal appointments, official titles, resolution numbers, and active term durations.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search by name, designation, resolution..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Trustee Categories</option>
                {TRUSTEE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="RESIGNED">RESIGNED</option>
                <option value="REVOKED">REVOKED</option>
              </select>
            </div>
          </div>

          {/* Trustees Cards Grid with Visual Term Lifecycle Progress */}
          {filteredTrustees.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
              <Users size={40} className="mx-auto text-primary/40 mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface">No Trustees Found</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No trustees match your active filters. Try broadening your query.'
                  : 'No trustees have been formally appointed yet. Click "+ Appoint New Trustee" to initialize the board.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTrustees.map((t) => (
                <TrusteeCard
                  key={t.id}
                  trustee={{
                    id: t.id,
                    name: t.name,
                    avatarUrl: t.avatarUrl,
                    trusteeType: t.trusteeType,
                    designationName: t.designationName,
                    gotra: t.gotra,
                    phone: t.phone,
                    email: t.email,
                    resolutionNo: t.resolutionNo,
                    termStart: t.termStart,
                    termEnd: t.termEnd,
                    isLifeTerm: t.isLifeTerm,
                    appointmentStatus: t.appointmentStatus,
                    responsibilities: t.responsibilities
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* APPOINT TRUSTEE MODAL */}
      <AppointTrusteeModal
        isOpen={isAppointModalOpen}
        onClose={() => setIsAppointModalOpen(false)}
        onSubmit={async (data: AppointTrusteeFormData) => {
          const payload = {
            name: data.name,
            email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@sankalpvani.org`,
            phone: data.phone,
            gotra: data.gotra,
            avatarUrl: data.avatarUrl,
            customDesignationName: data.designationName,
            trusteeType: data.trusteeType,
            cadreRank: 'Apex Governance & Trust Board',
            termStart: new Date(data.termStart).toISOString(),
            termEnd: data.isLifeTerm || !data.termEnd ? null : new Date(data.termEnd).toISOString(),
            resolutionNo: data.resolutionNo,
            responsibilities: data.responsibilities
          };

          const res = await fetch(`/api/v1/trusts/${trustId}/trustees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const json = await res.json();
          if (!res.ok) {
            throw new Error(json.error?.message || 'Failed to appoint trustee');
          }

          await fetchData();
        }}
      />
    </div>
  );
}
