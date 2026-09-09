'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Menu,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { AuthProvider, useAuth } from '../../../../../contexts/AuthContext';
import RequirePermission, { LockedViewFallback } from '../../../../../components/RequirePermission';
import Sidebar from '../../../../../components/Sidebar';
import DesignationsGovernance from '../../../../../components/DesignationsGovernance';

function DesignationsManagementContent() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const { session, isLoggedIn, isMounted, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Live Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short'
        })
      );
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
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

  const handleBackToDashboard = () => {
    router.push(`/trusts/${trustId}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-background flex font-sans antialiased text-on-surface">
      {/* Global Navigation Sidebar */}
      <Sidebar
        activeTab="designations"
        setActiveTab={() => {}}
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
                <Crown size={15} className="text-amber-700" />
                Designations & Titles
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface-variant font-mono">
              <Clock size={13} className="text-primary shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-medium text-on-surface-variant">{currentDate || 'Loading...'}</span>
                <span className="text-[11px] font-bold text-on-surface">{currentTime}</span>
              </div>
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
          <RequirePermission
            permission={['MANAGE_STAFF', 'MANAGE_ORG_CHART', 'VIEW_ORG_CHART', 'SUPER_ADMIN', 'DASHBOARD_VIEW']}
            mode="any"
            fallback={<LockedViewFallback requiredPermission="MANAGE_STAFF" title="Governance Restricted" />}
          >
            <DesignationsGovernance
              trustId={trustId}
              onBack={handleBackToDashboard}
            />
          </RequirePermission>
        </main>
      </div>
    </div>
  );
}

export default function DesignationsManagementPage() {
  return (
    <AuthProvider>
      <DesignationsManagementContent />
    </AuthProvider>
  );
}
