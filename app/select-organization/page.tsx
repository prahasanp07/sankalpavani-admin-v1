'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Landmark, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  UserCheck, 
  Check, 
  Layers, 
  Calendar, 
  Receipt, 
  Utensils, 
  Clock 
} from 'lucide-react';
import { useAuth, STAKEHOLDER_PERSONAS } from '../../contexts/AuthContext';

interface TrustOption {
  trustId: string;
  trustName: string;
  membershipType: string;
  status: string;
}

interface TempleOption {
  trustId: string;
  templeId: string;
  templeName: string;
  templeCode: string;
  status: string;
  deity?: string;
}

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { session, updateSession } = useAuth();

  // Screen 1 Direct Routing: Redirect straight to Trust Dashboard
  useEffect(() => {
    const targetTrustId = session?.trustId || 'trust_sringeri';
    router.replace(`/trusts/${targetTrustId}/dashboard`);
  }, [session, router]);

  const [trusts, setTrusts] = useState<TrustOption[]>([
    {
      trustId: 'trust_sringeri',
      trustName: 'Sri Sringeri Sharada Dharma Trust',
      membershipType: 'GOVERNANCE_HEAD',
      status: 'ACTIVE'
    },
    {
      trustId: 'trust_ahobila',
      trustName: 'Sri Ahobila Matha Devasthanam Trust',
      membershipType: 'GOVERNANCE_HEAD',
      status: 'ACTIVE'
    }
  ]);

  const [temples, setTemples] = useState<TempleOption[]>([
    {
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      templeName: 'Sri Vidyashankara Temple',
      templeCode: 'SVT-01',
      status: 'ACTIVE',
      deity: 'Lord Vidyashankara (Shiva Linga)'
    },
    {
      trustId: 'trust_sringeri',
      templeId: 'temple_sharadamba',
      templeName: 'Sri Sharadamba Temple',
      templeCode: 'SST-02',
      status: 'ACTIVE',
      deity: 'Goddess Sharadamba'
    },
    {
      trustId: 'trust_ahobila',
      templeId: 'temple_narasimha',
      templeName: 'Sri Lakshmi Narasimha Swamy Temple',
      templeCode: 'LNT-01',
      status: 'ACTIVE',
      deity: 'Lord Narasimha Swamy'
    }
  ]);

  const [selectedTrustId, setSelectedTrustId] = useState<string>('trust_sringeri');

  // Sync selectedTrustId whenever session changes
  useEffect(() => {
    if (session?.trustId) {
      setSelectedTrustId(session.trustId);
    }
  }, [session]);

  useEffect(() => {
    const loadDynamicTemples = async () => {
      try {
        const res = await fetch(`/api/v1/trusts/${selectedTrustId}/temples`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const dynamicList: TempleOption[] = json.data.map((t: any) => ({
              trustId: t.trustId,
              templeId: t.id,
              templeName: t.name,
              templeCode: t.code,
              status: t.status,
              deity: t.tagline || (t.contactJson?.deity ? `Sanctum: ${t.contactJson.deity}` : '')
            }));

            setTemples(prev => {
              const otherTrustTemples = prev.filter(t => t.trustId !== selectedTrustId);
              return [...otherTrustTemples, ...dynamicList];
            });
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic temples:', err);
      }
    };

    loadDynamicTemples();
  }, [selectedTrustId]);

  // Strict Tenant Isolation: Only show the trust assigned to the active session
  const authorizedTrusts = trusts.filter(t => !session?.trustId || t.trustId === session.trustId);
  const activeTrust = trusts.find(t => t.trustId === selectedTrustId) || authorizedTrusts[0] || trusts[0];
  const filteredTemples = temples.filter(t => t.trustId === selectedTrustId);

  const handleEnterTrustDashboard = (trustId: string) => {
    router.push(`/trusts/${trustId}/dashboard`);
  };

  const handleEnterTrustRoles = (trustId: string) => {
    router.push(`/trusts/${trustId}/governance/roles`);
  };

  const handleEnterTempleDashboard = (trustId: string, templeId: string) => {
    router.push(`/trusts/${trustId}/temples/${templeId}/dashboard`);
  };

  const currentRole = session?.designation || 'Trust Apex Trustee';
  const currentTrustName = activeTrust?.trustName || 'Trust Operations';

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between p-4 md:p-10 relative overflow-hidden">
      {/* Background Sacred Accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 pb-4 border-b divider-gold">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary-container/40 border border-primary/30 flex items-center justify-center text-primary shadow-sacred">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-primary tracking-tight">SankalpVani</h1>
            <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
              Trust & Temple Governance Platform
            </p>
          </div>
        </div>

        {/* Active Stakeholder Card & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <ShieldCheck size={14} />
            <span>{currentRole}</span>
            <span className="text-[10px] font-mono text-on-surface-variant/70">({session?.trustId || selectedTrustId})</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:border-error/40 text-xs font-semibold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Selection Area */}
      <main className="max-w-6xl w-full mx-auto my-8 z-10 space-y-8">
        {/* Stakeholder Role Simulator Banner with Tenant Partitioning */}
        <div className="bg-surface-container/80 backdrop-blur-md rounded-2xl border border-primary/20 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <UserCheck size={16} />
              <span>Simulate Tenant-Isolated Login Accounts:</span>
            </div>
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
              Zero Cross-Tenant Data Leakage
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Trust 1 Personas */}
            <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Sri Sringeri Sharada Dharma Trust</span>
                <span className="text-[9px] font-mono bg-primary/10 px-1.5 py-0.5 rounded">trust_sringeri</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  STAKEHOLDER_PERSONAS.SRINGERI_APEX_TRUSTEE,
                  STAKEHOLDER_PERSONAS.EXECUTIVE_OFFICER_SRINGERI,
                  STAKEHOLDER_PERSONAS.CHIEF_ARCHAKA,
                  STAKEHOLDER_PERSONAS.BOOKING_CLERK,
                  STAKEHOLDER_PERSONAS.STATUTORY_AUDITOR
                ].filter(Boolean).map((persona) => (
                  <button
                    key={persona.email}
                    onClick={() => {
                      updateSession(persona);
                      setSelectedTrustId(persona.trustId || 'trust_sringeri');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                      session?.email === persona.email
                        ? 'bg-primary text-on-primary shadow-xs scale-102 ring-1 ring-primary'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                    }`}
                  >
                    {persona.designation}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust 2 Personas */}
            <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                <span>Sri Ahobila Matha Devasthanam Trust</span>
                <span className="text-[9px] font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">trust_ahobila</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  STAKEHOLDER_PERSONAS.AHOBILA_APEX_TRUSTEE,
                  STAKEHOLDER_PERSONAS.EXECUTIVE_OFFICER_AHOBILA
                ].filter(Boolean).map((persona) => (
                  <button
                    key={persona.email}
                    onClick={() => {
                      updateSession(persona);
                      setSelectedTrustId(persona.trustId || 'trust_ahobila');
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                      session?.email === persona.email
                        ? 'bg-amber-800 text-white shadow-xs scale-102 ring-1 ring-amber-700'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30'
                    }`}
                  >
                    {persona.designation}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Tenant Organization Card (Strictly Isolated) */}
        <div className="bg-surface-container/90 backdrop-blur-md rounded-3xl border border-primary/30 p-5 shadow-sacred">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Building2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                    Active Tenant Boundary
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">{selectedTrustId}</span>
                </div>
                <h2 className="font-serif text-lg md:text-xl font-bold text-on-surface mt-0.5">
                  {currentTrustName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-800 font-bold border border-emerald-500/20 flex items-center gap-1.5">
                <ShieldCheck size={14} /> Strict Tenant Isolation Active
              </span>
            </div>
          </div>
        </div>

        {/* 2-TIER HIERARCHICAL WORKSPACES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TIER 1: TRUST-LEVEL GOVERNANCE (1 Column) */}
          <div className="lg:col-span-1 bg-surface-container/70 backdrop-blur-md rounded-3xl border border-primary/30 p-6 shadow-sacred flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-400/30">
                  Tier 1: Trust Level
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">{selectedTrustId}</span>
              </div>

              <h3 className="font-serif text-xl font-bold text-primary">
                Trust Apex Governance
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Umbrella administration across all child temples, dynamic RBAC role authoring, and consolidated audit trails.
              </p>

              <div className="space-y-2.5 mt-6">
                <div className="flex items-center gap-2 text-xs text-on-surface font-semibold p-2.5 rounded-xl bg-surface-container/50">
                  <ShieldCheck size={15} className="text-primary" />
                  <span>Dynamic RBAC & Role Builder</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface font-semibold p-2.5 rounded-xl bg-surface-container/50">
                  <Layers size={15} className="text-primary" />
                  <span>Cross-Temple Portfolio Aggregates</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface font-semibold p-2.5 rounded-xl bg-surface-container/50">
                  <Landmark size={15} className="text-primary" />
                  <span>{filteredTemples.length} Authorized Child Temples</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-6 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => handleEnterTrustRoles(selectedTrustId)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-sans text-xs font-bold shadow-sacred transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Dynamic Roles & Policies</span>
                </div>
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => handleEnterTrustDashboard(selectedTrustId)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-primary font-sans text-xs font-bold transition-all cursor-pointer"
              >
                <span>Trust Portfolio Overview</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* TIER 2: TEMPLE-LEVEL OPERATIONAL WORKPLACES (2 Columns) */}
          <div className="lg:col-span-2 bg-surface-container/70 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                  Tier 2: Temple Level
                </span>
                <span className="text-xs text-on-surface-variant font-bold">
                  {filteredTemples.length} Operational Branches
                </span>
              </div>

              <h3 className="font-serif text-xl md:text-2xl font-bold text-primary">
                Individual Temple Operational Workplaces
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5">
                Launch day-to-day counter operations, seva bookings, priest duty rosters, and thermal receipt printers for each temple.
              </p>

              {/* Temple Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {filteredTemples.map((temple) => (
                  <div
                    key={temple.templeId}
                    onClick={() => handleEnterTempleDashboard(selectedTrustId, temple.templeId)}
                    className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                          {temple.templeCode}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <Check size={12} /> {temple.status}
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                        {temple.templeName}
                      </h4>
                      {temple.deity && (
                        <p className="text-[11px] text-on-surface-variant mt-0.5 italic">
                          Sanctum: {temple.deity}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-outline-variant/30 text-[10px] text-center">
                        <div className="bg-surface-container/60 p-1.5 rounded-lg">
                          <p className="font-bold text-on-surface">Sevas</p>
                          <p className="text-primary font-bold">18 Active</p>
                        </div>
                        <div className="bg-surface-container/60 p-1.5 rounded-lg">
                          <p className="font-bold text-on-surface">Archakas</p>
                          <p className="text-on-surface-variant">5 On Duty</p>
                        </div>
                        <div className="bg-surface-container/60 p-1.5 rounded-lg">
                          <p className="font-bold text-on-surface">Receipts</p>
                          <p className="text-emerald-700 font-bold">Thermal POS</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-primary mt-4 pt-2 group-hover:translate-x-1 transition-transform">
                      <span>Launch Workplace</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-on-surface-variant/70 border-t divider-gold pt-4 z-10">
        <p>SankalpVani Multi-Tenant Trust & Temple Management Architecture • Strict Tenant & Scoped Role Isolation</p>
      </footer>
    </div>
  );
}
