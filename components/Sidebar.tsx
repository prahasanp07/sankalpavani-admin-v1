'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Grid,
  Calendar,
  Receipt,
  Utensils,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  Network,
  Lock,
  ShieldCheck,
  Building2,
  Landmark,
  Layers,
  ChevronDown
} from 'lucide-react';

import { useAuth, STAKEHOLDER_PERSONAS } from '../contexts/AuthContext';
import { PermissionKey } from '../utils/permissions';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: string;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  adminName?: string;
  adminAvatar?: string;
  scopeContext?: 'trust' | 'temple';
  activeTrustId?: string;
  activeTempleId?: string;
}

const TEMPLE_TAB_PERMISSIONS: Record<string, PermissionKey[]> = {
  dashboard: ['DASHBOARD_VIEW'],
  masters_hub: ['MANAGE_TEMPLE_INFO', 'MANAGE_SEVAS', 'MANAGE_FACILITIES', 'MANAGE_PRIESTS', 'MANAGE_ROSTER', 'MANAGE_ORG_CHART', 'VIEW_SEVAS', 'VIEW_PRIESTS'],
  org_chart: ['VIEW_ORG_CHART', 'MANAGE_ORG_CHART'],
  calendar: ['VIEW_BOOKINGS', 'REGISTER_BOOKINGS'],
  transactions: ['VIEW_FINANCE', 'MANAGE_FINANCE', 'PRINT_RECEIPTS'],
  prasadam: ['PROCESS_LOGISTICS', 'PRINT_SHIPPING_LABELS'],
  system_overview: ['VIEW_REPORTS', 'EXPORT_REPORTS'],
  settings: ['MANAGE_SETTINGS']
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  mobileOpen = false,
  setMobileOpen,
  adminName = 'Admin User',
  adminAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
  scopeContext = 'temple',
  activeTrustId: propTrustId = 'trust_sringeri',
  activeTempleId: propTempleId = 'temple_vidyashankara'
}: SidebarProps) {
  const { 
    session, 
    hasPermission, 
    updateSession, 
    activeScope, 
    activeTrustId,
    activeTempleName, 
    activeTempleId, 
    availableTemples, 
    switchScope 
  } = useAuth();
  const [templeLogo, setTempleLogo] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuANcPfzsfum8zGj2STDpP_Eds0xOoXxtm_OjHwVkP2MZOW3999u6oVf8P-7GeIMQA1hFSnmMM-gxsed4iDD-ruqP0OJKhI0LBMl2OTllKr3RJspedpV9pOsdDyz43dF_teOB1cC39MQgm579_rgeQq4Evh6iDEqE4aFi5LR5E3SLkqyCjsFrlyNnt_YF1ph80p1i-M4ec2yFc2A9oBE9U3sOA8W64XAiqtD-IxdDQLuoEYwwIz6gU1SePMjmWX2QVVSn1bT8aiesII');
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  useEffect(() => {
    const updateLogo = () => {
      const cached = localStorage.getItem('sankalpvani_temple_details');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.photos && parsed.photos.length > 0) {
            const primaryIndex = parsed.primaryPhotoIndex ?? 0;
            if (parsed.photos[primaryIndex]) {
              setTempleLogo(parsed.photos[primaryIndex]);
              return;
            }
          }
        } catch (e) { }
      }
    };

    updateLogo();
    window.addEventListener('sankalpvani_temple_details_updated', updateLogo);
    return () => {
      window.removeEventListener('sankalpvani_temple_details_updated', updateLogo);
    };
  }, []);

  // Effective scope context
  const effectiveScope = activeScope.toLowerCase() as 'trust' | 'temple';

  // Temple Level Operational Nav Items
  const templeNavItems = [
    { id: 'dashboard', label: 'Temple Dashboard', icon: LayoutDashboard, perm: ['DASHBOARD_VIEW'] },
    { id: 'calendar', label: 'Devotee Bookings', icon: Calendar, perm: ['VIEW_BOOKINGS', 'REGISTER_BOOKINGS'] },
    { id: 'transactions', label: 'Financial Ledger', icon: Receipt, perm: ['VIEW_FINANCE', 'PRINT_RECEIPTS'] },
    { id: 'masters_hub', label: 'Rituals & Masters', icon: Grid, perm: ['VIEW_SEVAS', 'MANAGE_SEVAS', 'VIEW_PRIESTS', 'MANAGE_PRIESTS', 'MANAGE_TEMPLE_INFO'] },
    { id: 'prasadam', label: 'Prasadam Dispatch', icon: Utensils, perm: ['PROCESS_LOGISTICS'] },
    // { id: 'org_chart', label: 'Org Hierarchy', icon: Network, perm: ['VIEW_ORG_CHART'] }, // TEMPORARILY COMMENTED OUT FROM UI
    { id: 'system_overview', label: 'Temple Reports', icon: BarChart3, perm: ['VIEW_REPORTS'] },
    { id: 'settings', label: 'Temple Settings', icon: Settings, perm: ['MANAGE_SETTINGS'] },
  ];

  // Filter items strictly by user's role permissions (Dynamic Role-based Display)
  const visibleTempleNavItems = templeNavItems.filter(item => {
    if (!item.perm) return true;
    return hasPermission(item.perm as PermissionKey[], 'any');
  });

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const displayName = session?.name || adminName;
  const displayAvatar = session?.avatar || adminAvatar;
  const displayDesignation = session?.designation || session?.role || 'Staff Member';
  const isTrustAdmin = session?.isSuperAdmin || hasPermission('SUPER_ADMIN');

  return (
    <>
      {/* Sidebar navigation container for desktop */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container border-r border-outline-variant/20 py-4 z-20">
        {/* Brand & Context Scope Header */}
        <div className="px-5 py-4 flex flex-col items-center border-b divider-gold mb-4">
          <img
            alt="SankalpVani Logo"
            className="w-12 h-12 rounded-full shadow-sacred mb-2.5 object-cover border border-outline-variant/30"
            src={templeLogo}
          />
          <h1 className="font-serif text-xl text-primary text-center font-bold tracking-tight">SankalpVani</h1>
          <div className="flex items-center gap-1.5 mt-2 w-full justify-center">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-center shadow-xs truncate max-w-[210px] ${
              activeScope === 'TRUST'
                ? 'bg-red-800 text-white'
                : 'bg-orange-600 text-white'
            }`}>
              {activeScope === 'TRUST'
                ? 'Viewing: Global Trust Operations'
                : `Viewing: ${activeTempleName || 'Sri Vidyashankara Temple'}`}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 hide-scrollbar">
          <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/70 mb-2 px-3">
            {activeScope === 'TRUST' ? 'Trust Governance' : 'Temple Operations'}
          </p>

          {activeScope === 'TEMPLE' && visibleTempleNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id ||
              (item.id === 'masters_hub' && ['archaka_master', 'seva_master', 'temple_info', 'temple_facilities', 'scheduling'].includes(activeTab));

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-98 text-left ${isSelected
                  ? 'text-primary bg-primary-container/10 border-r-4 border-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:bg-primary-container/5 hover:text-primary'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          {scopeContext === 'trust' && (
            <div className="space-y-1">
              <a
                href={`/trusts/${activeTrustId}/dashboard`}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-sans text-xs font-bold text-primary bg-primary-container/10 border-r-4 border-primary shadow-xs"
              >
                <LayoutDashboard size={16} />
                <span>Trust Portfolio</span>
              </a>
              <a
                href={`/trusts/${activeTrustId}/governance/roles`}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-sans text-xs font-semibold text-on-surface-variant hover:bg-primary-container/5 hover:text-primary transition-all"
              >
                <ShieldCheck size={16} />
                <span>Dynamic RBAC & Roles</span>
              </a>
            </div>
          )}

          {/* Trust Portfolio Dashboard Link */}
          <div className="pt-3 pb-1 border-t border-outline-variant/30 mt-3">
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-on-surface-variant/70 mb-1.5 px-3">
              Trust Control Center
            </p>
            <a
              href={`/trusts/${activeTrustId}/dashboard`}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl font-sans text-xs font-bold text-amber-800 hover:bg-amber-500/10 transition-colors"
              title="Open Trust Portfolio"
            >
              <Landmark size={14} className="shrink-0" />
              <span>Trust Dashboard</span>
            </a>
          </div>
        </nav>

        {/* Footer Stakeholder Persona Switcher & Profile */}
        <div className="px-3 mt-auto space-y-2 pt-2 border-t border-outline-variant/30">
          {/* Quick Persona Switcher for Verification */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-[11px] font-sans font-bold text-primary transition-colors cursor-pointer"
              title="Test Different Stakeholder Personas"
            >
              <div className="flex items-center gap-1.5 truncate">
                <UserCheck size={13} className="shrink-0 text-primary" />
                <span className="truncate">Role: {displayDesignation}</span>
              </div>
              <ChevronDown size={13} className={`shrink-0 transition-transform ${personaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {personaMenuOpen && (
              <div className="absolute bottom-full left-0 w-64 mb-1 bg-surface-container-highest border border-outline-variant/40 rounded-2xl shadow-2xl p-2 z-50 space-y-2 animate-[fadeIn_0.15s_ease-out] max-h-96 overflow-y-auto">
                <div className="border-b border-outline-variant/30 pb-1 px-1">
                  <p className="text-[9px] font-mono font-bold uppercase text-on-surface-variant">
                    Simulate Login Account:
                  </p>
                  <p className="text-[8px] text-on-surface-variant/70">
                    Dev Testing & Demonstration
                  </p>
                </div>

                {/* Sringeri Trust Group */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10 block">
                    Sri Sringeri Sharada Dharma Trust
                  </span>
                  {[
                    STAKEHOLDER_PERSONAS.SRINGERI_APEX_TRUSTEE,
                    STAKEHOLDER_PERSONAS.EXECUTIVE_OFFICER_SRINGERI,
                    STAKEHOLDER_PERSONAS.CHIEF_ARCHAKA,
                    STAKEHOLDER_PERSONAS.BOOKING_CLERK,
                    STAKEHOLDER_PERSONAS.PRASADAM_MANAGER,
                    STAKEHOLDER_PERSONAS.STATUTORY_AUDITOR
                  ].filter(Boolean).map((persona) => (
                    <button
                      key={persona.email}
                      onClick={() => {
                        updateSession(persona);
                        setPersonaMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-colors cursor-pointer flex flex-col ${
                        session?.email === persona.email ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="font-bold truncate">{persona.designation}</span>
                      <span className="text-[8px] opacity-80 truncate">{persona.name} ({persona.email})</span>
                    </button>
                  ))}
                </div>

                {/* Ahobila Trust Group */}
                <div className="space-y-1 pt-1 border-t border-outline-variant/30">
                  <span className="text-[9px] font-bold font-mono text-amber-800 px-1.5 py-0.5 rounded bg-amber-500/10 block">
                    Sri Ahobila Matha Devasthanam Trust
                  </span>
                  {[
                    STAKEHOLDER_PERSONAS.AHOBILA_APEX_TRUSTEE,
                    STAKEHOLDER_PERSONAS.EXECUTIVE_OFFICER_AHOBILA
                  ].filter(Boolean).map((persona) => (
                    <button
                      key={persona.email}
                      onClick={() => {
                        updateSession(persona);
                        setPersonaMenuOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-sans font-semibold transition-colors cursor-pointer flex flex-col ${
                        session?.email === persona.email ? 'bg-amber-800 text-white shadow-xs' : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="font-bold truncate">{persona.designation}</span>
                      <span className="text-[8px] opacity-80 truncate">{persona.name} ({persona.email})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active User Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl border border-outline-variant/30 bg-white/70 backdrop-blur-sm shadow-xs">
            <img
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/40 shrink-0"
              src={displayAvatar}
            />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[11px] font-bold text-on-surface truncate">{displayName}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck size={9} className="text-amber-800 shrink-0" />
                <span className="text-[9px] text-on-surface-variant font-mono truncate">
                  {session?.permissions?.length || 0} Permissions
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-3 py-1.5 rounded-xl border border-outline-variant/40 font-sans text-xs font-bold text-error hover:bg-error-container hover:text-on-error-container transition-all duration-150 cursor-pointer"
          >
            <LogOut size={13} className="mr-1.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative flex flex-col w-64 max-w-xs bg-surface-container h-full p-4 shadow-2xl animate-[slideIn_0.3s_ease-out]">
            <div className="flex flex-col items-center border-b divider-gold pb-4 mb-4">
              <img
                alt="SankalpVani Logo"
                className="w-12 h-12 rounded-full shadow-sacred mb-2 object-cover"
                src={templeLogo}
              />
              <h1 className="font-serif text-xl text-primary text-center font-bold">SankalpVani</h1>
              <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
                {scopeContext === 'trust' ? 'Trust Scope' : 'Temple Scope'}
              </p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {scopeContext === 'temple' && visibleTempleNavItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-sans text-xs font-semibold transition-all text-left ${isSelected
                      ? 'text-primary bg-primary-container/10 font-bold'
                      : 'text-on-surface-variant hover:bg-primary-container/5 hover:text-primary'
                      }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 pb-1 border-t border-outline-variant/30 mt-2">
                <a
                  href="/select-organization"
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold text-on-surface-variant"
                >
                  <Building2 size={14} />
                  <span>Switch Workspace</span>
                </a>
              </div>
            </nav>

            <div className="mt-auto pt-3 border-t divider-gold space-y-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center px-3 py-2 rounded-xl border border-outline-variant/40 font-sans text-xs font-bold text-error cursor-pointer"
              >
                <LogOut size={13} className="mr-1.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
