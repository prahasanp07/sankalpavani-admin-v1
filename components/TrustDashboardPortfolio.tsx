'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Landmark,
  Users,
  Receipt,
  Sparkles,
  Search,
  Check,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface TempleItem {
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

interface TrustDashboardPortfolioProps {
  trustId?: string;
  trustName?: string;
  onNavigate?: (tabId: string) => void;
  onEnterTemple?: (templeId: string) => void;
}

const DEFAULT_TEMPLES: TempleItem[] = [
  {
    id: 'temple_vidyashankara',
    trustId: 'trust_sringeri',
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
    trustId: 'trust_sringeri',
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
];

export default function TrustDashboardPortfolio({
  trustId = 'trust_sringeri',
  trustName = 'Sri Sringeri Sharada Dharma Trust',
  onNavigate,
  onEnterTemple
}: TrustDashboardPortfolioProps) {
  const router = useRouter();
  const { switchScope } = useAuth();
  const { t } = useLanguage();

  const [temples, setTemples] = useState<TempleItem[]>(DEFAULT_TEMPLES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'SUSPENDED'>('ALL');

  const fetchTemples = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/trusts/${trustId}/temples`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTemples(json.data);
          return;
        }
      }
    } catch (err) {
      console.warn('Fallback to default temples for trust dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, [trustId]);

  const filteredTemples = temples.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tagline && item.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = temples.filter(t => t.status === 'ACTIVE').length;
  const totalSevas = temples.reduce((acc, t) => acc + (t.activeSevas || 0), 0) || 42;
  const totalPriests = temples.reduce((acc, t) => acc + (t.activePriests || 0), 0) || 13;

  const handleTempleClick = (temple: TempleItem) => {
    if (onEnterTemple) {
      onEnterTemple(temple.id);
    } else {
      switchScope('TEMPLE', temple.id);
      router.push(`/trusts/${trustId}/temples/${temple.id}/dashboard`);
    }
  };

  const handleAddNewTemple = () => {
    if (onNavigate) {
      onNavigate('add_temple');
    } else {
      router.push(`/trusts/${trustId}/temples/new`);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* 4 Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Temples */}
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiTemples', 'Temples')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{temples.length} {t('dashboard.kpiRegistered', 'Registered')}</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{activeCount} {t('dashboard.kpiActiveOperational', 'Active / Operational')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Landmark size={24} />
          </div>
        </div>

        {/* Card 2: Staff & Priests */}
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiStaffPriests', 'Staff & Priests')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalPriests} {t('dashboard.kpiPriests', 'Priests')}</h3>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{t('dashboard.kpiAcrossShrines', 'Across all branch shrines')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        {/* Card 3: Today's Collections */}
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiTodaysCollections', "Today's Collections")}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">₹ 8,25,000</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5">{t('dashboard.kpiConsolidatedLedger', 'Consolidated Ledger')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>

        {/* Card 4: Active Sevas */}
        <div className="p-5 rounded-2xl bg-surface-container/60 border border-outline-variant/30 shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t('dashboard.kpiActiveSevas', 'Active Sevas')}</p>
            <h3 className="font-serif text-2xl font-bold text-on-surface mt-1">{totalSevas} {t('dashboard.kpiOfferings', 'Offerings')}</h3>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{t('dashboard.kpiAvailableDevotees', 'Available for Devotees')}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Dynamic Temple Portfolio Section */}
      <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
              <Landmark size={20} /> {t('dashboard.templesGovernedBy', 'Temples Governed by')} {trustName}
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder={t('dashboard.searchTemplesPlaceholder', 'Search temples...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-[11px] font-bold">
              {(['ALL', 'ACTIVE', 'MAINTENANCE', 'SUSPENDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${statusFilter === st
                    ? 'bg-primary text-on-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {st === 'ALL'
                    ? t('dashboard.filterAll', 'All')
                    : st === 'ACTIVE'
                    ? t('dashboard.filterActive', 'Active')
                    : st === 'MAINTENANCE'
                    ? t('dashboard.filterMaintenance', 'Maintenance')
                    : t('dashboard.filterSuspended', 'Suspended')}
                </button>
              ))}
            </div>

            <button
              onClick={fetchTemples}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title="Refresh Portfolio"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Temple Cards Grid */}
        {filteredTemples.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low/40">
            <Landmark size={40} className="mx-auto text-primary/40 mb-3" />
            <h3 className="font-serif text-lg font-bold text-on-surface">No Temples Found</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter options.'
                : 'No temples have been created under this Trust yet. Click "+ Add New Temple" to initialize your first temple.'}
            </p>
            <button
              onClick={handleAddNewTemple}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred hover:bg-primary/90 cursor-pointer"
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
                onClick={() => handleTempleClick(temple)}
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

                  {/* Contact Snippet */}
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
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">{t('dashboard.cardCollections', "Today's Collections")}</p>
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-500 mt-0.5">{temple.todayCollections || '₹ 4,80,000'}</p>
                    </div>
                    <div className="bg-surface-container/60 p-2 rounded-xl flex flex-col justify-center">
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">{t('dashboard.cardSevasConfigured', 'Sevas Configured')}</p>
                      <p className="text-xs font-bold text-primary mt-0.5">{temple.activeSevas || 18} {t('dashboard.kpiOfferings', 'Offerings')}</p>
                    </div>
                    <div className="bg-surface-container/60 p-2 rounded-xl flex flex-col justify-center">
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tight">{t('dashboard.cardPriestCadre', 'Priest Cadre')}</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 mt-0.5">{temple.activePriests || 5} {t('dashboard.kpiStaff', 'Staff')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>{t('dashboard.launchActivities', 'Click here to launch Temple administration Activities')}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
