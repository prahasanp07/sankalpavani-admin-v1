'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  Landmark,
  Users,
  Receipt,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Search,
  Check,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Layers,
  Crown,
  UserCheck,
  Tag,
  ChevronDown,
  FolderTree
} from 'lucide-react';
import GovernanceMastersModal from '@/components/governance/GovernanceMastersModal';
import { MasterType } from '@/lib/types/masters';

interface TempleItem {
  id: string;
  trustId: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  tagline?: string;
  description?: string;
  hotline?: string;
  officialEmail?: string;
  addressJson?: any;
  locationJson?: any;
  contactJson?: any;
  activeSevas?: number;
  activePriests?: number;
  todayCollections?: string | number;
}

export default function TrustDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const [trustName, setTrustName] = useState('Sri Sringeri Sharada Dharma Trust');
  const [temples, setTemples] = useState<TempleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED'>('ALL');

  // Category Master & Navigation States
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isMastersModalOpen, setIsMastersModalOpen] = useState(false);
  const [mastersInitialTab, setMastersInitialTab] = useState<MasterType>('TRUSTEE_CATEGORY');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };


  const fetchTemples = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTemples(json.data);
          return;
        }
      }
      // If server returned non-ok or empty data, use standard initial temples
      if (temples.length === 0) {
        setTemples([
          {
            id: 'temple_vidyashankara',
            trustId,
            name: 'Sri Vidyashankara Temple',
            code: 'SVT-01',
            status: 'ACTIVE',
            tagline: 'Sanctum of Lord Vidyashankara',
            hotline: '+91 82652 50123',
            officialEmail: 'info@vidyashankara.org',
            todayCollections: '₹ 4,80,000',
            activeSevas: 18,
            activePriests: 5
          },
          {
            id: 'temple_sharadamba',
            trustId,
            name: 'Sri Sharadamba Temple',
            code: 'SST-02',
            status: 'ACTIVE',
            tagline: 'Sanctum of Goddess Sharadamba',
            hotline: '+91 82652 50555',
            officialEmail: 'contact@sharadamba.org',
            todayCollections: '₹ 3,45,000',
            activeSevas: 24,
            activePriests: 8
          }
        ]);
      }
    } catch (err: any) {
      console.warn('Network / offline fallback for temples:', err.message);
      if (temples.length === 0) {
        setTemples([
          {
            id: 'temple_vidyashankara',
            trustId,
            name: 'Sri Vidyashankara Temple',
            code: 'SVT-01',
            status: 'ACTIVE',
            tagline: 'Sanctum of Lord Vidyashankara',
            hotline: '+91 82652 50123',
            officialEmail: 'info@vidyashankara.org',
            todayCollections: '₹ 4,80,000',
            activeSevas: 18,
            activePriests: 5
          },
          {
            id: 'temple_sharadamba',
            trustId,
            name: 'Sri Sharadamba Temple',
            code: 'SST-02',
            status: 'ACTIVE',
            tagline: 'Sanctum of Goddess Sharadamba',
            hotline: '+91 82652 50555',
            officialEmail: 'contact@sharadamba.org',
            todayCollections: '₹ 3,45,000',
            activeSevas: 24,
            activePriests: 8
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
    if (trustId === 'trust_ahobila') {
      setTrustName('Sri Ahobila Matha Devasthanam Trust');
    } else {
      setTrustName('Sri Sringeri Sharada Dharma Trust');
    }
  }, [trustId]);


  const filteredTemples = temples.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tagline && t.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = temples.filter(t => t.status === 'ACTIVE').length;
  const totalSevas = temples.reduce((acc, t) => acc + (t.activeSevas || 0), 0);
  const totalPriests = temples.reduce((acc, t) => acc + (t.activePriests || 0), 0);

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b divider-gold pb-6">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
              title="Return to Temple Operational Dashboard"
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-bold font-sans">Dashboard</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                  Trust Isolation Root
                </span>
                <span className="text-xs text-on-surface-variant font-mono">{trustId}</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight mt-1">
                {trustName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchTemples}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Refresh Portfolio"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* 1. Designation & Titles */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/designations`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Crown size={14} />
              <span>Designation & Titles</span>
            </button>

            {/* 2. Dynamic RBAC & Roles */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/roles`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ShieldCheck size={14} />
              <span>Dynamic RBAC & Roles <span className="italic font-normal text-[10px] text-on-surface-variant">(Optional)</span></span>
            </button>

            {/* 3. Category (New implementation - Placeholder) */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-amber-500/40 text-amber-800 font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Tag size={14} />
                <span>Category</span>
                <ChevronDown size={13} className={`transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-64 bg-surface-container-highest border border-outline-variant/40 rounded-2xl shadow-xl p-2 z-50 space-y-1 animate-[fadeIn_0.15s_ease-out]">
                  <div className="px-2 py-1 border-b border-outline-variant/20 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-on-surface-variant">
                      Category Masters (New)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setMastersInitialTab('TRUSTEE_CATEGORY');
                      setIsMastersModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FolderTree size={14} className="text-primary shrink-0" />
                    <span>a. Trust Categories - Master</span>
                  </button>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setMastersInitialTab('MEMBERSHIP_TYPE');
                      setIsMastersModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserCheck size={14} className="text-primary shrink-0" />
                    <span>b. Membership Type - Master</span>
                  </button>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setMastersInitialTab('COMMITTEE_CATEGORY');
                      setIsMastersModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Layers size={14} className="text-primary shrink-0" />
                    <span>c. Committee Category - Master</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. Add New Temple */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/temples/new`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-sans text-xs font-bold shadow-sacred transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add New Temple</span>
            </button>

            {/* 5. Trustees & Board */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/trustees`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Users size={14} />
              <span>Trustees & Board</span>
            </button>

            {/* 6. Committees */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/committees`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Layers size={14} />
              <span>Committees</span>
            </button>

            {/* 7. Members */}
            <button
              onClick={() => router.push(`/trusts/${trustId}/governance/members`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <UserCheck size={14} />
              <span>Members</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Temples</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{temples.length} Registered</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{activeCount} Active / Operational</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Landmark size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Staff & Priests</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalPriests || 14} Priests</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Across all branch shrines</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Today's Collections</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">₹ 8,25,000</h3>
              <p className="text-[10px] text-primary font-bold mt-0.5">Consolidated Ledger</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Receipt size={24} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Sevas</p>
              <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalSevas || 42} Offerings</h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Available for Devotees</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={24} />
            </div>
          </div>
        </div>

        {/* Temple Portfolio Table & Controls */}
        <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Landmark size={20} /> Dynamic Temple Portfolio
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Launch individual temple operational workplaces or dynamically administer child shrines under this Trust.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search temples..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-[11px] font-bold">
                {(['ALL', 'ACTIVE', 'MAINTENANCE', 'SUSPENDED'] as const).map((st) => (
                  <button
                    key={st}
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

          {/* Temple Cards Grid */}
          {filteredTemples.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl">
              <Landmark size={40} className="mx-auto text-primary/40 mb-3" />
              <h3 className="font-serif text-lg font-bold text-on-surface">No Temples Found</h3>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search criteria or filter options.'
                  : 'No temples have been created under this Trust yet. Click "+ Add New Temple" to initialize your first temple.'}
              </p>
              <button
                onClick={() => router.push(`/trusts/${trustId}/temples/new`)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred cursor-pointer"
              >
                <Plus size={14} />
                <span>Add First Temple</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemples.map((temple) => (
                <div
                  key={temple.id}
                  onClick={() => router.push(`/trusts/${trustId}/temples/${temple.id}/dashboard`)}
                  className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                        {temple.code}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded ${temple.status === 'ACTIVE'
                        ? 'text-emerald-700 bg-emerald-500/10'
                        : temple.status === 'MAINTENANCE'
                          ? 'text-amber-700 bg-amber-500/10'
                          : 'text-error bg-error/10'
                        }`}>
                        <Check size={12} /> {temple.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {temple.name}
                    </h3>

                    {temple.tagline && (
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 italic">
                        {temple.tagline}
                      </p>
                    )}

                    {/* Contact & Location snippet */}
                    <div className="mt-3 space-y-1 text-[11px] text-on-surface-variant">
                      {temple.hotline && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-primary/70" />
                          <span>{temple.hotline}</span>
                        </div>
                      )}
                      {temple.officialEmail && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail size={12} className="text-primary/70" />
                          <span className="truncate">{temple.officialEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mt-4 pt-3 border-t border-outline-variant/30 text-center">
                      <div className="bg-surface-container/60 p-2 rounded-xl flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">Today's Collections</p>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-500 mt-0.5">{temple.todayCollections || '₹ 4,80,000'}</p>
                      </div>
                      <div className="bg-surface-container/60 p-2 rounded-xl flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">Sevas Configured</p>
                        <p className="text-xs font-bold text-primary mt-0.5">{temple.activeSevas || 18} Offerings</p>
                      </div>
                      <div className="bg-surface-container/60 p-2 rounded-xl flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">Priest Cadre</p>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 mt-0.5">{temple.activePriests || 5} Staff</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-primary mt-4 pt-3 border-t border-outline-variant/20 group-hover:translate-x-1 transition-transform">
                    <span>Enter Operational Workplace</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Governance Masters Modal */}
      <GovernanceMastersModal
        isOpen={isMastersModalOpen}
        onClose={() => setIsMastersModalOpen(false)}
        trustId={trustId}
        initialTab={mastersInitialTab}
      />

      {/* Floating Toast Alert */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-[slideIn_0.3s_ease-out]">
          <Sparkles size={16} />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
}
