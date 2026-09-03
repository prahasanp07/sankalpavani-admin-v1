'use client';

import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
import { PermissionKey } from '../utils/permissions';
import { useAuth } from '../contexts/AuthContext';

export interface RequirePermissionProps {
  permission: PermissionKey | PermissionKey[];
  mode?: 'all' | 'any';
  fallback?: React.ReactNode;
  showLockedUI?: boolean;
  lockedMessage?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Global UI Guard Component
 * Wraps buttons, sections, or entire views to enforce granular Dynamic RBAC capabilities.
 */
export default function RequirePermission({
  permission,
  mode = 'all',
  fallback = null,
  showLockedUI = false,
  lockedMessage,
  className = '',
  children
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  const allowed = hasPermission(permission, mode);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback !== null) {
    return <>{fallback}</>;
  }

  if (showLockedUI) {
    const permString = Array.isArray(permission) ? permission.join(', ') : permission;
    return (
      <div 
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/30 text-on-surface-variant/50 text-xs cursor-not-allowed select-none ${className}`}
        title={lockedMessage || `Capability locked: requires [${permString}] permission`}
      >
        <Lock size={12} className="text-amber-700/60" />
        <span className="font-semibold text-[11px]">
          {lockedMessage || 'Access Restricted'}
        </span>
      </div>
    );
  }

  return null;
}

/**
 * Hook to check permissions dynamically within any component logic
 */
export function usePermission(permission: PermissionKey | PermissionKey[], mode: 'all' | 'any' = 'all'): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission, mode);
}

/**
 * Full page / section locked placeholder card
 */
export function LockedViewFallback({
  requiredPermission,
  title = 'Access Restricted',
  description = 'Your administrative designation does not have the necessary capability granted for this module.'
}: {
  requiredPermission: PermissionKey | PermissionKey[];
  title?: string;
  description?: string;
}) {
  const { session, resetToSuperAdmin } = useAuth();
  const permString = Array.isArray(requiredPermission) ? requiredPermission.join(', ') : requiredPermission;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sacred max-w-lg mx-auto my-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 mb-4 shadow-inner">
        <ShieldAlert size={32} />
      </div>
      <h3 className="font-serif text-xl font-bold text-primary mb-2">
        {title}
      </h3>
      <p className="font-sans text-xs text-on-surface-variant leading-relaxed max-w-md mb-4">
        {description}
      </p>

      <div className="bg-surface-container-low/60 border border-outline-variant/20 px-3.5 py-2 rounded-xl text-[11px] font-mono text-on-surface-variant mb-6">
        <span className="font-bold text-primary">Required Permission: </span>
        <span className="font-semibold">{permString}</span>
      </div>

      <div className="text-[11px] text-on-surface-variant/80 space-y-1 mb-6">
        <div>Current Designation: <span className="font-bold text-on-surface">{session?.designation || 'Staff'}</span></div>
        <div>Active Account: <span className="font-bold text-on-surface">{session?.name}</span> ({session?.email})</div>
      </div>

      <button
        type="button"
        onClick={resetToSuperAdmin}
        className="px-4 py-2 bg-primary hover:bg-[#7a4300] text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
      >
        <Lock size={13} />
        <span>Elevate to Super Admin</span>
      </button>
    </div>
  );
}
