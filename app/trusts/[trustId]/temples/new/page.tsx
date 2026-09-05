'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Menu,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Building2,
  Sparkles,
  Landmark,
  PlusCircle
} from 'lucide-react';
import { AuthProvider, useAuth } from '../../../../../contexts/AuthContext';
import RequirePermission, { LockedViewFallback } from '../../../../../components/RequirePermission';
import Sidebar from '../../../../../components/Sidebar';
import MastersHub from '../../../../../components/MastersHub';

function NewTempleCreationContent() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const { session, isLoggedIn, isMounted, logout } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('temple_info');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [trustName, setTrustName] = useState('Sri Sringeri Sharada Dharma Trust');

  // Fetch Trust Name for context
  useEffect(() => {
    const fetchTrustMeta = async () => {
      try {
        const res = await fetch(`/api/v1/trusts/${trustId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.name) {
            setTrustName(json.data.name);
          }
        }
      } catch (err) {
        console.warn('Fallback to default trust metadata', err);
      }
    };
    fetchTrustMeta();
  }, [trustId]);

  // Live Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const displayName = session?.name || 'Administrator';
  const displayEmail = session?.email || 'admin@temple1.com';
  const displayRole = session?.designation || session?.role || 'Super Administrator';
  const displayAvatar = session?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150';

  const handleSaveSuccess = (newTempleId: string) => {
    router.push(`/trusts/${trustId}/dashboard`);
  };

  const handleBackToDashboard = () => {
    router.push(`/trusts/${trustId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background flex font-sans antialiased text-on-surface">
      {/* Global Navigation Sidebar */}
      <Sidebar
        activeTab="add_temple"
        setActiveTab={(tab) => {
          if (tab === 'dashboard') {
            router.push(`/trusts/${trustId}/dashboard`);
          } else if (tab === 'designations') {
            router.push(`/trusts/${trustId}/governance/designations`);
          }
        }}
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
              className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-xl focus:outline-none hover:bg-surface-container cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Back Button to Trust Dashboard */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-primary text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Return to Trust Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Trust Dashboard</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-variant font-medium">
              <span>/</span>
              <span className="font-serif font-bold text-primary text-sm flex items-center gap-1.5">
                <PlusCircle size={15} className="text-amber-700" />
                Add New Temple
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-on-surface-variant text-xs font-mono">
              <Clock size={13} className="text-primary" />
              <span>{currentTime || 'Loading...'}</span>
            </div>

            {/* Active Role Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs cursor-default">
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
          {/* Context Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                <Landmark size={20} />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                  Registering Temple Under Trust
                </div>
                <h3 className="font-serif text-base font-bold text-primary">
                  {trustName}
                </h3>
              </div>
            </div>
            <div className="text-xs text-on-surface-variant font-medium">
              Fill in the general details below to create and publish this temple.
            </div>
          </div>

          <RequirePermission
            permission={['MANAGE_TEMPLE_INFO', 'MANAGE_SEVAS', 'MANAGE_FACILITIES', 'MANAGE_PRIESTS', 'MANAGE_ROSTER', 'VIEW_SEVAS', 'VIEW_PRIESTS']}
            mode="any"
            fallback={<LockedViewFallback requiredPermission="MANAGE_TEMPLE_INFO" title="Masters Hub Access Restricted" />}
          >
            <MastersHub
              activeSubTab={activeSubTab}
              onNavigate={(tab) => {
                if (tab === 'dashboard') {
                  handleBackToDashboard();
                } else {
                  setActiveSubTab(tab);
                }
              }}
              isCreationMode={true}
              trustId={trustId}
              onSaveSuccess={handleSaveSuccess}
              onBack={handleBackToDashboard}
            />
          </RequirePermission>
        </main>
      </div>
    </div>
  );
}

export default function NewTemplePage() {
  return (
    <AuthProvider>
      <NewTempleCreationContent />
    </AuthProvider>
  );
}
