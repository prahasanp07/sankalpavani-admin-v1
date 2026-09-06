'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  Clock,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Check,
  X,
  Key,
  Phone,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';
import { AuthProvider, useAuth, UserSession } from '../contexts/AuthContext';
import RequirePermission, { LockedViewFallback } from '../components/RequirePermission';
import LoginScreen from '../components/LoginScreen';
import Sidebar from '../components/Sidebar';
import DashboardPortal from '../components/DashboardPortal';
import TrustDashboardPortfolio from '../components/TrustDashboardPortfolio';
import DesignationsGovernance from '../components/DesignationsGovernance';
import RolesGovernance from '../components/RolesGovernance';
import TrusteesGovernance from '../components/TrusteesGovernance';
import CommitteesGovernance from '../components/CommitteesGovernance';
import MembersGovernance from '../components/MembersGovernance';
import MastersHub from '../components/MastersHub';
import PriestMaster from '../components/PriestMaster';
import SevaMaster from '../components/SevaMaster';
import TempleInfo from '../components/TempleInfo';
import TempleFacilities from '../components/TempleFacilities';
import Transactions from '../components/Transactions';
import Scheduling from '../components/Scheduling';
import Prasadam from '../components/Prasadam';
import SystemOverview from '../components/SystemOverview';
import Settings from '../components/Settings';
import CalendarView from '../components/CalendarView';
import OrgChart from '../components/OrgChart';
import Header from '../components/Header';
import { ALL_PERMISSIONS } from '../utils/permissions';

interface NavigationState {
  activeTab: string;
  parentTab: string | null;
}

function AdminPortalContent() {
  const { session, isLoggedIn, isMounted, login, logout, updateSession, resetToSuperAdmin, activeScope, activeTrustId } = useAuth();

  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem('sankalpvani_navigation_state');
      if (storedState) {
        try {
          const parsed = JSON.parse(storedState) as Partial<NavigationState>;
          return {
            activeTab: parsed.activeTab || 'dashboard',
            parentTab: parsed.parentTab || null
          };
        } catch (e) {
          console.error('Failed to parse navigation state', e);
        }
      }
    }
    return { activeTab: 'dashboard', parentTab: null };
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Admin Profile States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile Editor Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formAvatar, setFormAvatar] = useState('');

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sankalpvani_navigation_state', JSON.stringify(navigationState));
    }
  }, [navigationState]);

  // Dynamic Clock update
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

  const handleNavigate = (tab: string, parentTabOverride?: string | null) => {
    setNavigationState(prev => ({
      activeTab: tab,
      parentTab: parentTabOverride ?? (
        ['archaka_master', 'seva_master', 'temple_info', 'temple_facilities', 'scheduling'].includes(tab) ? 'masters_hub' : null
      )
    }));
  };

  // Guard: Avoid hydration mismatches by returning a consistent loader on initial mount pass
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-serif text-sm font-bold tracking-widest uppercase">Sankalpvani</span>
        </div>
      </div>
    );
  }

  // Guard: If not logged in, render the login card screen
  if (!isLoggedIn || !session) {
    return <LoginScreen onLoginSuccess={login} />;
  }

  const activeTab = navigationState.activeTab;
  const parentTab = navigationState.parentTab;

  // Get human-friendly tab names
  const getPageHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return activeScope === 'TRUST'
          ? 'Trust Administrative Dashboard & Portfolio'
          : 'Temple-1 Administrative Dashboard';
      case 'designations': return 'Designations & Titles Management';
      case 'roles': return 'Dynamic Roles & Access Control';
      case 'trustees': return 'Trustees & Board of Management';
      case 'committees': return 'Committees & Sub-Committees Management';
      case 'members': return 'Members, Staff & Committee Appointees';
      case 'add_temple': return 'New Temple Registration';
      case 'masters_hub': return 'Structural Masters Hub';
      case 'org_chart': return 'Devasthanam Organization Chart & Matrix Reporting';
      case 'archaka_master': return 'Acharyas & Archakas Registry';
      case 'seva_master': return 'Seva offerings Setup';
      case 'temple_info': return 'Temple Profile & Core Timings';
      case 'temple_facilities': return 'Facilities & Guest Amenities';
      case 'scheduling': return 'Priest Rostering & Shift Scheduling';
      case 'transactions': return 'Seva Ledger & Darshan Receipts';
      case 'prasadam': return 'Remote Prasadam Dispatch & Logistics';
      case 'system_overview': return 'System Performance & Security Logs';
      case 'calendar': return 'Devotee Bookings Calendar';
      case 'settings': return 'Temple Notifications & Configuration';
      default: return 'Temple Administration Portal';
    }
  };

  const displayName = session.name;
  const displayEmail = session.email;
  const displayRole = session.designation || session.role || 'Administrator';
  const displayAvatar = session.avatar;

  return (
    <div className="min-h-screen bg-background flex font-sans antialiased text-on-surface">
      {/* Dynamic RBAC Global Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => handleNavigate(tab)}
        currentUser={displayEmail}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        adminName={displayName}
        adminAvatar={displayAvatar}
      />

      {/* Main Administrative Workplace Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Header Bar with Persistent Scoped Access Switcher */}
        <Header
          title={getPageHeaderTitle()}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Core Screen Display Switcher with Granular RBAC View-Level Guards */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <RequirePermission
              permission="DASHBOARD_VIEW"
              fallback={<LockedViewFallback requiredPermission="DASHBOARD_VIEW" title="Executive Dashboard Restricted" />}
            >
              {activeScope === 'TRUST' ? (
                <TrustDashboardPortfolio
                  trustId={activeTrustId || 'trust_sringeri'}
                  onNavigate={handleNavigate}
                />
              ) : (
                <DashboardPortal onNavigate={handleNavigate} />
              )}
            </RequirePermission>
          )}

          {activeTab === 'designations' && (
            <RequirePermission
              permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Designations & Governance Restricted" />}
            >
              <DesignationsGovernance
                trustId={activeTrustId || 'trust_sringeri'}
                onBack={() => handleNavigate('dashboard')}
              />
            </RequirePermission>
          )}

          {activeTab === 'roles' && (
            <RequirePermission
              permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Dynamic Roles & RBAC Restricted" />}
            >
              <RolesGovernance
                trustId={activeTrustId || 'trust_sringeri'}
                onBack={() => handleNavigate('dashboard')}
                onNavigate={handleNavigate}
              />
            </RequirePermission>
          )}

          {activeTab === 'trustees' && (
            <RequirePermission
              permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Trustees & Board Management Restricted" />}
            >
              <TrusteesGovernance
                trustId={activeTrustId || 'trust_sringeri'}
                onBack={() => handleNavigate('dashboard')}
                onNavigate={handleNavigate}
              />
            </RequirePermission>
          )}

          {activeTab === 'committees' && (
            <RequirePermission
              permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Committees Governance Restricted" />}
            >
              <CommitteesGovernance
                trustId={activeTrustId || 'trust_sringeri'}
                onBack={() => handleNavigate('dashboard')}
                onNavigate={handleNavigate}
              />
            </RequirePermission>
          )}

          {activeTab === 'members' && (
            <RequirePermission
              permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Members Directory Restricted" />}
            >
              <MembersGovernance
                trustId={activeTrustId || 'trust_sringeri'}
                onBack={() => handleNavigate('dashboard')}
                onNavigate={handleNavigate}
              />
            </RequirePermission>
          )}

          {activeTab === 'add_temple' && (
            <RequirePermission
              permission={['MANAGE_TEMPLE_INFO', 'MANAGE_SEVAS', 'MANAGE_FACILITIES', 'MANAGE_PRIESTS', 'MANAGE_ROSTER', 'VIEW_SEVAS', 'VIEW_PRIESTS', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_TEMPLE_INFO" title="Add Temple Restricted" />}
            >
              <MastersHub
                activeSubTab="temple_info"
                onNavigate={(tab) => {
                  if (tab === 'dashboard') handleNavigate('dashboard');
                  else handleNavigate(tab);
                }}
                isCreationMode={true}
                trustId={activeTrustId || 'trust_sringeri'}
                onSaveSuccess={() => handleNavigate('dashboard')}
                onBack={() => handleNavigate('dashboard')}
              />
            </RequirePermission>
          )}

          {['masters_hub', 'temple_info', 'seva_master', 'temple_facilities', 'archaka_master', 'scheduling'].includes(activeTab) && (
            <RequirePermission
              permission={['MANAGE_TEMPLE_INFO', 'MANAGE_SEVAS', 'MANAGE_FACILITIES', 'MANAGE_PRIESTS', 'MANAGE_ROSTER', 'MANAGE_ORG_CHART', 'VIEW_SEVAS', 'VIEW_PRIESTS']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="MANAGE_TEMPLE_INFO" title="Devasthanam Masters Hub Restricted" />}
            >
              <MastersHub
                activeSubTab={activeTab === 'masters_hub' ? 'temple_info' : activeTab}
                onNavigate={handleNavigate}
              />
            </RequirePermission>
          )}

          {/* {activeTab === 'org_chart' && (
            <RequirePermission 
              permission={['VIEW_ORG_CHART', 'MANAGE_ORG_CHART']}
              mode="any"
              fallback={<LockedViewFallback requiredPermission="VIEW_ORG_CHART" title="Devasthanam Org Chart Restricted" />}
            >
              <OrgChart onBack={() => handleNavigate('dashboard')} />
            </RequirePermission>
          )} */}

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
              fallback={<LockedViewFallback requiredPermission="VIEW_BOOKINGS" title="Devotee Bookings Calendar Restricted" />}
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

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-primary-container text-on-primary-container border border-primary/20 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out]">
            <CheckCircle size={20} className="text-primary animate-pulse" />
            <span className="font-sans text-sm font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Admin Profile Updation Screen Modal */}
        {profileModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setProfileModalOpen(false)} />

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-[scaleUp_0.3s_ease-out]">
              {/* Header */}
              <div className="px-6 py-5 border-b divider-gold flex justify-between items-center bg-surface-container/20">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                    <User size={20} className="text-primary" />
                    Modify Administrator Profile
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant font-medium mt-1">
                    Update your system access credentials, administrative persona, and contact defaults.
                  </p>
                </div>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="p-1.5 hover:bg-primary-container/10 text-on-surface-variant hover:text-primary rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={(e) => {
                e.preventDefault();

                // Password validation logic
                if (newPassword || confirmPassword || currentPassword) {
                  if (!currentPassword) {
                    setPasswordError('Current password is required to set a new password');
                    return;
                  }
                  if (newPassword.length < 6) {
                    setPasswordError('New password must be at least 6 characters long');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordError('New password and confirmation password do not match');
                    return;
                  }
                }

                updateSession({
                  name: formName || displayName,
                  email: formEmail || displayEmail,
                  phone: formPhone || session.phone,
                  designation: formRole || displayRole,
                  avatar: formAvatar || displayAvatar
                });

                setProfileModalOpen(false);
                setToastMessage('Administrative credentials and profile updated successfully!');
                setTimeout(() => setToastMessage(null), 3500);
              }} className="flex-1 overflow-y-auto p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Basic Details */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-sm font-bold text-primary border-b border-outline-variant/30 pb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} /> Basic Information
                    </h4>

                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Full Administrator Name
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Admin User"
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        required
                      />
                    </div>

                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="admin@temple1.com"
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        required
                      />
                    </div>

                    {/* Designation / Role Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Custom Designation / Title
                      </label>
                      <input
                        type="text"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="Chief Administrator"
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        required
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Emergency Contact Number
                      </label>
                      <input
                        type="text"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>

                  {/* Right Column: Avatar Choice & Security Credentials */}
                  <div className="space-y-6">
                    {/* Presets Grid */}
                    <div className="space-y-3">
                      <h4 className="font-serif text-sm font-bold text-primary border-b border-outline-variant/30 pb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera size={14} /> Profile Icon
                      </h4>

                      <div className="grid grid-cols-4 gap-3">
                        {[
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuANcPfzsfum8zGj2STDpP_Eds0xOoXxtm_OjHwVkP2MZOW3999u6oVf8P-7GeIMQA1hFSnmMM-gxsed4iDD-ruqP0OJKhI0LBMl2OTllKr3RJspedpV9pOsdDyz43dF_teOB1cC39MQgm579_rgeQq4Evh6iDEqE4aFi5LR5E3SLkqyCjsFrlyNnt_YF1ph80p1i-M4ec2yFc2A9oBE9U3sOA8W64XAiqtD-IxdDQLuoEYwwIz6gU1SePMjmWX2QVVSn1bT8aiesII',
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
                        ].map((avatarUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormAvatar(avatarUrl)}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${formAvatar === avatarUrl
                                ? 'border-primary ring-2 ring-primary/20 scale-95 shadow-md'
                                : 'border-outline-variant hover:border-primary/50'
                              }`}
                          >
                            <img src={avatarUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                            {formAvatar === avatarUrl && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <span className="bg-primary text-on-primary rounded-full p-0.5">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Custom Avatar URL */}
                      <div className="flex flex-col gap-1 mt-2">
                        <label className="font-sans text-[10px] font-bold text-on-surface-variant/85 uppercase">
                          Or custom avatar image URL
                        </label>
                        <input
                          type="text"
                          value={formAvatar}
                          onChange={(e) => setFormAvatar(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-3 py-1.5 bg-surface-container-low border border-outline rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="space-y-3 pt-2">
                      <h4 className="font-serif text-sm font-bold text-primary border-b border-outline-variant/30 pb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <Key size={14} /> Security Credentials
                      </h4>

                      {passwordError && (
                        <div className="bg-error-container/20 text-error border border-error/20 px-3 py-2 rounded-xl flex items-start gap-2 animate-[pulse_1.5s_infinite]">
                          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                          <span className="font-sans text-xs font-semibold">{passwordError}</span>
                        </div>
                      )}

                      <div className="space-y-3.5">
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setPasswordError('');
                            }}
                            placeholder="Enter current master password"
                            className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                setPasswordError('');
                              }}
                              placeholder="Min 6 characters"
                              className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setPasswordError('');
                              }}
                              placeholder="Repeat new password"
                              className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t divider-gold pt-5 flex justify-end gap-3 bg-surface-container-lowest sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/40 transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-on-primary-container text-on-primary rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Synchronize Profile</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <AdminPortalContent />
    </AuthProvider>
  );
}
