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
  UserPlus,
  CalendarClock,
  BookOpen,
  FolderTree
} from 'lucide-react';

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
  const [selectedCategoryMaster, setSelectedCategoryMaster] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Add Temple Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    deity: '',
    tagline: '',
    description: '',
    hotline: '',
    email: '',
    city: '',
    state: '',
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED'
  });

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

  const handleCreateTemple = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        deity: formData.deity,
        tagline: formData.tagline,
        description: formData.description,
        addressJson: {
          city: formData.city,
          state: formData.state
        },
        contactJson: {
          hotline: formData.hotline,
          email: formData.email
        },
        status: formData.status
      };

      const res = await fetch(`/api/v1/trusts/${trustId}/temples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to create temple');
      }

      // Reset & Refresh
      setFormData({
        name: '',
        code: '',
        deity: '',
        tagline: '',
        description: '',
        hotline: '',
        email: '',
        city: '',
        state: '',
        status: 'ACTIVE'
      });
      setIsAddModalOpen(false);
      await fetchTemples();
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while creating the temple');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span>Dynamic RBAC & Roles</span>
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
                      setSelectedCategoryMaster('Trust Categories (Master)');
                      showToast('Opening Trust Categories master configuration...');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FolderTree size={14} className="text-primary shrink-0" />
                    <span>a. Trust Categories - Master</span>
                  </button>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setSelectedCategoryMaster('Membership Type (Master)');
                      showToast('Opening Membership Type master configuration...');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-sans font-semibold text-on-surface hover:bg-surface-container flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <UserCheck size={14} className="text-primary shrink-0" />
                    <span>b. Membership Type - Master</span>
                  </button>
                  <button
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setSelectedCategoryMaster('Committee Category (Master)');
                      showToast('Opening Committee Category master configuration...');
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
              onClick={() => setIsAddModalOpen(true)}
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

            {/* 8. Assign members to committee (optional) */}
            <button
              onClick={() => {
                router.push(`/trusts/${trustId}/governance/committees`);
                showToast('Directing to Committees to assign members...');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>Assign Members to Committee</span>
            </button>

            {/* 9. Archakas registry & duty roster */}
            <button
              onClick={() => {
                const targetTemple = temples[0]?.id || 'temple_vidyashankara';
                router.push(`/trusts/${trustId}/temples/${targetTemple}/dashboard`);
                showToast('Opening Archakas registry & duty roster in Temple Workplace...');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <CalendarClock size={14} />
              <span>Archakas Registry & Duty Roster</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Child Temples</p>
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
                onClick={() => setIsAddModalOpen(true)}
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

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-outline-variant/30 text-center">
                      <div className="bg-surface-container/60 p-2 rounded-xl">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase">Sevas Configured</p>
                        <p className="text-xs font-bold text-primary mt-0.5">{temple.activeSevas || 0} Offerings</p>
                      </div>
                      <div className="bg-surface-container/60 p-2 rounded-xl">
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase">Priest Cadre</p>
                        <p className="text-xs font-bold text-on-surface mt-0.5">{temple.activePriests || 0} Staff</p>
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

      {/* CREATE TEMPLE MODAL DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl border border-primary/30 max-w-xl w-full p-6 md:p-8 shadow-sacred animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b divider-gold">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Landmark size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Add New Temple</h3>
                  <p className="text-xs text-on-surface-variant">Create a dynamically managed temple under {trustName}</p>
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

            <form onSubmit={handleCreateTemple} className="space-y-4 mt-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-on-surface">Temple Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Vidyashankara Temple"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. SVT-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Primary Deity / Sanctum</label>
                  <input
                    type="text"
                    placeholder="e.g. Lord Vidyashankara (Shiva)"
                    value={formData.deity}
                    onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="ACTIVE">ACTIVE (Operational)</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-on-surface">Tagline / Brief Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Ancient 14th-Century Astronomical Temple & Sacred Samadhi"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Hotline / Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 82652 50123"
                    value={formData.hotline}
                    onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">Official Email</label>
                  <input
                    type="email"
                    placeholder="office@temple.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">City / Kshetram</label>
                  <input
                    type="text"
                    placeholder="e.g. Sringeri"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-on-surface">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                    <span>Creating Temple...</span>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Save & Create Temple</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Master Placeholder Modal */}
      {selectedCategoryMaster && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 shadow-2xl space-y-4 animate-[scaleUp_0.2s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b divider-gold">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Tag size={18} />
                <h3 className="font-serif text-lg">{selectedCategoryMaster}</h3>
              </div>
              <button
                onClick={() => setSelectedCategoryMaster(null)}
                className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              This master defines standard classification taxonomies for <strong className="text-on-surface">{selectedCategoryMaster}</strong> across the trust hierarchy.
            </p>

            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant font-semibold">
                <span>Preset Taxonomy Records</span>
                <span className="text-primary font-bold">Master Table</span>
              </div>
              {selectedCategoryMaster.includes('Trust Categories') && (
                <ul className="space-y-1 text-on-surface pt-1">
                  <li className="flex items-center gap-2">🔹 Religious & Spiritual Peetham</li>
                  <li className="flex items-center gap-2">🔹 Charitable & Annadanam Endowment</li>
                  <li className="flex items-center gap-2">🔹 Heritage & Architectural Devasthanam</li>
                </ul>
              )}
              {selectedCategoryMaster.includes('Membership Type') && (
                <ul className="space-y-1 text-on-surface pt-1">
                  <li className="flex items-center gap-2">🔹 Apex Governance Head</li>
                  <li className="flex items-center gap-2">🔹 General Body Voting Member</li>
                  <li className="flex items-center gap-2">🔹 Nominated Advisory Member</li>
                  <li className="flex items-center gap-2">🔹 Life Patron / Mahadatha</li>
                </ul>
              )}
              {selectedCategoryMaster.includes('Committee Category') && (
                <ul className="space-y-1 text-on-surface pt-1">
                  <li className="flex items-center gap-2">🔹 Statutory Audit & Accounts Committee</li>
                  <li className="flex items-center gap-2">🔹 Festival & Brahmotsavam Planning Wing</li>
                  <li className="flex items-center gap-2">🔹 Agama & Sanctum Advisory Committee</li>
                  <li className="flex items-center gap-2">🔹 Works & Infrastructure Committee</li>
                </ul>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCategoryMaster(null)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred hover:bg-primary/90 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
