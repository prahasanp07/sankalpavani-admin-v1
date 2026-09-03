'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Building2, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TrustTenantGuardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ trustId: string }>;
}) {
  const router = useRouter();
  const { session, isMounted } = useAuth();
  const resolvedParams = use(params);
  const targetTrustId = resolvedParams.trustId;

  // Wait for client session hydration
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="font-sans text-xs text-on-surface-variant font-medium">
            Verifying tenant authorization...
          </p>
        </div>
      </div>
    );
  }

  // Tenant Boundary Check: Active session must match target trustId
  const userTrustId = session?.trustId || 'trust_sringeri';
  const isAuthorized = userTrustId === targetTrustId || session?.isSuperAdmin;

  if (!isAuthorized) {
    const userTrustDisplayName = userTrustId === 'trust_sringeri' 
      ? 'Sri Sringeri Sharada Dharma Trust' 
      : userTrustId === 'trust_ahobila' 
        ? 'Sri Ahobila Matha Devasthanam Trust' 
        : userTrustId;

    const targetTrustDisplayName = targetTrustId === 'trust_sringeri'
      ? 'Sri Sringeri Sharada Dharma Trust'
      : targetTrustId === 'trust_ahobila'
        ? 'Sri Ahobila Matha Devasthanam Trust'
        : targetTrustId;

    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Sacred Accents */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-error/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-surface-container/90 backdrop-blur-md rounded-3xl border border-error/30 p-6 md:p-8 shadow-2xl space-y-6 text-center animate-[scaleUp_0.2s_ease-out]">
          <div className="w-16 h-16 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center text-error mx-auto shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-error px-2 py-0.5 rounded bg-error/10 border border-error/20">
                403 Tenant Boundary Violation
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-on-surface tracking-tight">
              Cross-Tenant Access Denied
            </h2>
            <p className="font-sans text-xs text-on-surface-variant mt-2 leading-relaxed">
              You are signed in as <span className="font-bold text-on-surface">{session?.name || 'Authorized User'}</span> under <span className="font-bold text-primary">{userTrustDisplayName}</span> (<code className="font-mono text-[11px]">{userTrustId}</code>), but attempted to access records for <span className="font-bold text-error">{targetTrustDisplayName}</span> (<code className="font-mono text-[11px]">{targetTrustId}</code>).
            </p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-3.5 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-on-surface font-semibold">
              <Lock size={14} className="text-error" />
              <span>Multi-Tenant Security Invariant:</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Trust operational records, temple ledgers, devotee bookings, and committees are strictly segregated by Row-Level Security (RLS) and cryptographic tenant boundary policies.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => router.push(`/trusts/${userTrustId}/dashboard`)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred hover:shadow-md transition-all cursor-pointer"
            >
              <Building2 size={16} />
              <span>Return to My Authorized Trust ({userTrustId})</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-sans text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Switch Tenant Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
