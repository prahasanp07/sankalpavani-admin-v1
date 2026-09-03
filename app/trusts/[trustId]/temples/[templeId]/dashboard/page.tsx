'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Menu, 
  Bell, 
  Clock, 
  Settings as SettingsIcon, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  ArrowLeft,
  Building2
} from 'lucide-react';
import { AuthProvider, useAuth } from '../../../../../../contexts/AuthContext';
import RequirePermission, { LockedViewFallback } from '../../../../../../components/RequirePermission';
import Sidebar from '../../../../../../components/Sidebar';
import DashboardPortal from '../../../../../../components/DashboardPortal';
import MastersHub from '../../../../../../components/MastersHub';
import OrgChart from '../../../../../../components/OrgChart';
import Transactions from '../../../../../../components/Transactions';
import Scheduling from '../../../../../../components/Scheduling';
import Prasadam from '../../../../../../components/Prasadam';
import SystemOverview from '../../../../../../components/SystemOverview';
import Settings from '../../../../../../components/Settings';
import CalendarView from '../../../../../../components/CalendarView';

function TempleWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';
  const templeId = (params?.templeId as string) || 'temple_vidyashankara';

  const { session, isLoggedIn, isMounted, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [dynamicTempleName, setDynamicTempleName] = useState<string>('');

  // Fetch dynamic temple metadata
  useEffect(() => {
    const fetchTempleMeta = async () => {
      try {
        const res = await fetch(`/api/v1/trusts/${trustId}/temples/${templeId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.temple?.name) {
            setDynamicTempleName(json.data.temple.name);
          }
        }
      } catch (err) {
        console.error('Error fetching temple metadata:', err);
      }
    };
    fetchTempleMeta();
  }, [trustId, templeId]);

  // Live Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      };
      setCurrentTime(now.toLocaleString('en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTempleDisplayName = () => {
    if (dynamicTempleName) return dynamicTempleName;
    if (templeId === 'temple_vidyashankara') return 'Sri Vidyashankara Temple';
    if (templeId === 'temple_sharadamba') return 'Sri Sharadamba Temple';
    if (templeId === 'temple_narasimha') return 'Sri Lakshmi Narasimha Swamy Temple';
    return 'Temple Operational Workspace';
  };

  const getPageHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return `${getTempleDisplayName()} - Dashboard`;
      case 'masters_hub': return 'Structural Masters Hub';
      case 'org_chart': return 'Devasthanam Organization Chart & Matrix Reporting';
      case 'archaka_master': return 'Acharyas & Archakas Registry';
      case 'seva_master': return 'Seva Offerings Setup';
      case 'temple_info': return 'Temple Profile & Core Timings';
      case 'temple_facilities': return 'Facilities & Guest Amenities';
      case 'scheduling': return 'Priest Rostering & Shift Scheduling';
      case 'transactions': return 'Financial Ledger & Darshan Receipts';
      case 'prasadam': return 'Remote Prasadam Dispatch & Logistics';
      case 'system_overview': return 'System Performance & Security Logs';
      case 'calendar': return 'Devotee Bookings Calendar';
      case 'settings': return 'Administrative Configuration & Settings';
      default: return 'Temple Administration Portal';
    }
  };

  const displayName = session?.name || 'Sri Vidyaranya Shastri';
  const displayEmail = session?.email || 'admin@temple1.com';
  const displayRole = session?.designation || session?.role || 'Executive Officer';
  const displayAvatar = session?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ';

  return (
    <div className="min-h-screen bg-background flex font-sans antialiased text-on-surface">
      {/* Sidebar with Scoped Context */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => setActiveTab(tab)} 
        currentUser={displayEmail} 
        onLogout={logout} 
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        adminName={displayName}
        adminAvatar={displayAvatar}
      />

      {/* Main Workplace Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Header Bar */}
        <header className="h-16 border-b divider-gold bg-surface-container/60 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sacred">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl focus:outline-none hover:bg-surface-container"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb to Trust & Switcher */}
            <button
              onClick={() => router.push(`/select-organization`)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary text-[11px] font-bold transition-colors cursor-pointer"
              title="Switch Trust / Temple Workspace"
            >
              <Building2 size={13} />
              <span>Switch Workspace</span>
            </button>

            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base md:text-lg font-bold text-primary tracking-tight">
                {getPageHeaderTitle()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface-variant text-xs font-mono">
              <Clock size={13} className="text-primary" />
              <span>{currentTime || 'Loading...'}</span>
            </div>

            {/* Active Role Badge */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs cursor-default"
            >
              <ShieldCheck size={13} />
              <span className="truncate max-w-[180px]">{displayRole}</span>
            </div>

            {/* Profile Avatar */}
            <img 
              alt="Admin" 
              className="w-8 h-8 rounded-full object-cover border border-primary/40 shadow-xs cursor-pointer" 
              src={displayAvatar} 
              onClick={() => router.push(`/select-organization`)}
              title="Click to Switch Organization"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <RequirePermission 
              permission="DASHBOARD_VIEW"
              fallback={<LockedViewFallback requiredPermission="DASHBOARD_VIEW" title="Executive Dashboard Restricted" />}
            >
              <DashboardPortal onNavigate={(tab) => setActiveTab(tab)} />
            </RequirePermission>
          )}

          {['masters_hub', 'temple_info', 'seva_master', 'temple_facilities', 'archaka_master', 'scheduling'].includes(activeTab) && (
            <RequirePermission 
              permission={['MANAGE_TEMPLE_INFO', 'MANAGE_SEVAS', 'MANAGE_FACILITIES', 'MANAGE_PRIESTS', 'MANAGE_ROSTER', 'MANAGE_ORG_CHART', 'VIEW_SEVAS', 'VIEW_PRIESTS']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_TEMPLE_INFO" title="Masters Hub Restricted" />}
            >
              <MastersHub 
                activeSubTab={activeTab === 'masters_hub' ? 'temple_info' : activeTab} 
                onNavigate={(tab) => setActiveTab(tab)} 
              />
            </RequirePermission>
          )}

          {activeTab === 'org_chart' && (
            <RequirePermission 
              permission={['VIEW_ORG_CHART', 'MANAGE_ORG_CHART']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="VIEW_ORG_CHART" title="Organization Chart Restricted" />}
            >
              <OrgChart onBack={() => setActiveTab('dashboard')} />
            </RequirePermission>
          )}

          {activeTab === 'transactions' && (
            <RequirePermission 
              permission="VIEW_FINANCE"
              fallback={<LockedViewFallback requiredPermission="VIEW_FINANCE" title="Financial Ledger Restricted" />}
            >
              <Transactions />
            </RequirePermission>
          )}

          {activeTab === 'prasadam' && (
            <RequirePermission 
              permission="PROCESS_LOGISTICS"
              fallback={<LockedViewFallback requiredPermission="PROCESS_LOGISTICS" title="Holy Prasadam Logistics Restricted" />}
            >
              <Prasadam />
            </RequirePermission>
          )}

          {activeTab === 'system_overview' && (
            <RequirePermission 
              permission="VIEW_REPORTS"
              fallback={<LockedViewFallback requiredPermission="VIEW_REPORTS" title="System Reports Restricted" />}
            >
              <SystemOverview />
            </RequirePermission>
          )}

          {activeTab === 'calendar' && (
            <RequirePermission 
              permission={['VIEW_BOOKINGS', 'REGISTER_BOOKINGS']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="VIEW_BOOKINGS" title="Bookings Calendar Restricted" />}
            >
              <CalendarView />
            </RequirePermission>
          )}

          {activeTab === 'settings' && (
            <RequirePermission 
              permission="MANAGE_SETTINGS"
              fallback={<LockedViewFallback requiredPermission="MANAGE_SETTINGS" title="System Configuration Restricted" />}
            >
              <Settings />
            </RequirePermission>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ScopedTemplePage() {
  return (
    <AuthProvider>
      <TempleWorkspaceContent />
    </AuthProvider>
  );
}
