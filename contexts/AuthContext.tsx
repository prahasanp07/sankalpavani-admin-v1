'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  PermissionKey, 
  ALL_PERMISSIONS, 
  hasPermission as checkHasPermission, 
  hasAnyPermission as checkHasAnyPermission, 
  hasAllPermissions as checkHasAllPermission 
} from '../utils/permissions';
import { StaffMember } from '../components/org-chart/types';

export interface UserSession {
  email: string;
  name: string;
  avatar: string;
  designation: string;
  phone?: string;
  role?: string;
  department?: string;
  permissions: PermissionKey[];
  isSuperAdmin?: boolean;
  staffId?: string;
  scope?: 'TRUST' | 'TEMPLE';
  trustId?: string;
  templeId?: string | null;
  templeName?: string | null;
}

export interface AuthContextType {
  session: UserSession | null;
  isLoggedIn: boolean;
  isMounted: boolean;
  activeScope: 'TRUST' | 'TEMPLE';
  activeTrustId: string;
  activeTempleId: string | null;
  activeTempleName: string | null;
  availableTemples: Array<{ id: string; name: string; code?: string }>;
  switchScope: (scope: 'TRUST' | 'TEMPLE', templeId?: string | null, templeName?: string | null) => void;
  login: (email: string, customProps?: Partial<UserSession>) => void;
  logout: () => void;
  updateSession: (updates: Partial<UserSession>) => void;
  hasPermission: (permission: PermissionKey | PermissionKey[], mode?: 'all' | 'any') => boolean;
  switchStaffPersona: (staff: StaffMember) => void;
  resetToSuperAdmin: () => void;
}

export const STAKEHOLDER_PERSONAS: Record<string, UserSession> = {
  SRINGERI_APEX_TRUSTEE: {
    email: 'dharmadhikari@sringeri.org',
    name: 'Sri Sringeri Dharmadhikari',
    designation: 'Sringeri Apex Trustee',
    role: 'Managing Trustee',
    department: 'Apex Governance',
    phone: '+91 98450 00001',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
    permissions: [...ALL_PERMISSIONS],
    isSuperAdmin: false,
    staffId: 'staff-sringeri-apex',
    scope: 'TRUST',
    trustId: 'trust_sringeri',
    templeId: null,
    templeName: null
  },
  AHOBILA_APEX_TRUSTEE: {
    email: 'dharmadhikari@ahobila.org',
    name: 'Sri Ahobila Matha Jeeyar Swamy',
    designation: 'Ahobila Apex Trustee',
    role: 'Peethadhipathi & Trustee',
    department: 'Apex Governance',
    phone: '+91 98450 00002',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    permissions: [...ALL_PERMISSIONS],
    isSuperAdmin: false,
    staffId: 'staff-ahobila-apex',
    scope: 'TRUST',
    trustId: 'trust_ahobila',
    templeId: null,
    templeName: null
  },
  EXECUTIVE_OFFICER_SRINGERI: {
    email: 'eo@vidyashankara.org',
    name: 'Sri Vidyaranya Shastri',
    designation: 'Executive Officer (EO)',
    role: 'Executive Officer',
    department: 'Admin',
    phone: '+91 98450 11000',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'MANAGE_SEVAS',
      'VIEW_PRIESTS',
      'MANAGE_PRIESTS',
      'VIEW_ROSTER',
      'MANAGE_ROSTER',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'CANCEL_BOOKINGS',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'PRINT_RECEIPTS',
      'PROCESS_LOGISTICS',
      'PRINT_SHIPPING_LABELS',
      'VIEW_ORG_CHART',
      'MANAGE_ORG_CHART',
      'MANAGE_STAFF',
      'MANAGE_TEMPLE_INFO',
      'MANAGE_FACILITIES',
      'VIEW_REPORTS',
      'EXPORT_REPORTS',
      'MANAGE_SETTINGS'
    ],
    isSuperAdmin: false,
    staffId: 'staff-eo-sringeri',
    scope: 'TEMPLE',
    trustId: 'trust_sringeri',
    templeId: 'temple_vidyashankara',
    templeName: 'Sri Vidyashankara Temple'
  },
  EXECUTIVE_OFFICER_AHOBILA: {
    email: 'eo@ahobila.org',
    name: 'Sri Narasimha Charyulu',
    designation: 'Executive Officer (Ahobilam)',
    role: 'Executive Officer',
    department: 'Admin',
    phone: '+91 98450 12000',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'MANAGE_SEVAS',
      'VIEW_PRIESTS',
      'MANAGE_PRIESTS',
      'VIEW_ROSTER',
      'MANAGE_ROSTER',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'CANCEL_BOOKINGS',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'PRINT_RECEIPTS',
      'PROCESS_LOGISTICS',
      'PRINT_SHIPPING_LABELS',
      'VIEW_ORG_CHART',
      'MANAGE_ORG_CHART',
      'MANAGE_STAFF',
      'MANAGE_TEMPLE_INFO',
      'MANAGE_FACILITIES',
      'VIEW_REPORTS',
      'EXPORT_REPORTS',
      'MANAGE_SETTINGS'
    ],
    isSuperAdmin: false,
    staffId: 'staff-eo-ahobila',
    scope: 'TEMPLE',
    trustId: 'trust_ahobila',
    templeId: 'temple_narasimha',
    templeName: 'Sri Lakshmi Narasimha Swamy Temple'
  },
  CHIEF_ARCHAKA: {
    email: 'raghavan.bhattar@vidyashankara.org',
    name: 'Sri Raghavan Bhattar',
    designation: 'Chief Archaka (Pradhana Acharya)',
    role: 'Chief Archaka',
    department: 'Spiritual',
    phone: '+91 98450 22000',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'MANAGE_SEVAS',
      'VIEW_PRIESTS',
      'MANAGE_PRIESTS',
      'VIEW_ROSTER',
      'MANAGE_ROSTER',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'VIEW_ORG_CHART',
      'MANAGE_TEMPLE_INFO'
    ],
    isSuperAdmin: false,
    staffId: 'staff-chief-archaka',
    scope: 'TEMPLE',
    trustId: 'trust_sringeri',
    templeId: 'temple_vidyashankara',
    templeName: 'Sri Vidyashankara Temple'
  },
  BOOKING_CLERK: {
    email: 'counter.clerk@vidyashankara.org',
    name: 'Smt. Lakshmi Devi',
    designation: 'Booking Counter Clerk',
    role: 'Counter Operator',
    department: 'Operations',
    phone: '+91 98450 33000',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'VIEW_SEVAS',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'PRINT_RECEIPTS'
    ],
    isSuperAdmin: false,
    staffId: 'staff-clerk',
    scope: 'TEMPLE',
    trustId: 'trust_sringeri',
    templeId: 'temple_vidyashankara',
    templeName: 'Sri Vidyashankara Temple'
  },
  PRASADAM_MANAGER: {
    email: 'logistics@vidyashankara.org',
    name: 'Sri Narayana Prasad',
    designation: 'Prasadam Logistics Manager',
    role: 'Logistics Lead',
    department: 'Operations',
    phone: '+91 98450 44000',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'PROCESS_LOGISTICS',
      'PRINT_SHIPPING_LABELS'
    ],
    isSuperAdmin: false,
    staffId: 'staff-prasadam',
    scope: 'TEMPLE',
    trustId: 'trust_sringeri',
    templeId: 'temple_vidyashankara',
    templeName: 'Sri Vidyashankara Temple'
  },
  STATUTORY_AUDITOR: {
    email: 'auditor@sringeri.org',
    name: 'Sri S. Ramanathan FCA',
    designation: 'Statutory Auditor',
    role: 'Auditor',
    department: 'Finance',
    phone: '+91 98450 55000',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_FINANCE',
      'VIEW_REPORTS',
      'EXPORT_REPORTS'
    ],
    isSuperAdmin: false,
    staffId: 'staff-auditor',
    scope: 'TRUST',
    trustId: 'trust_sringeri',
    templeId: null,
    templeName: null
  }
};

const DEFAULT_SUPER_ADMIN: UserSession = STAKEHOLDER_PERSONAS.SRINGERI_APEX_TRUSTEE;

const DEFAULT_TEMPLES = [
  { id: 'temple_vidyashankara', name: 'Sri Vidyashankara Temple', code: 'VST' },
  { id: 'temple_sharadamba', name: 'Sri Sharadamba Temple', code: 'SST' },
  { id: 'temple_torana_ganapati', name: 'Sri Torana Ganapati Temple', code: 'TGT' }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeScope, setActiveScope] = useState<'TRUST' | 'TEMPLE'>('TRUST');
  const [activeTrustId, setActiveTrustId] = useState<string>('trust_sringeri');
  const [activeTempleId, setActiveTempleId] = useState<string | null>(null);
  const [activeTempleName, setActiveTempleName] = useState<string | null>(null);
  const [availableTemples, setAvailableTemples] = useState<Array<{ id: string; name: string; code?: string }>>(DEFAULT_TEMPLES);

  // Fetch available temples from API
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await fetch(`/api/v1/trusts/${activeTrustId}/temples`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setAvailableTemples(json.data.map((t: any) => ({
              id: t.id,
              name: t.name,
              code: t.code
            })));
          }
        }
      } catch (e) {
        console.debug('Failed to fetch temples for scope switcher', e);
      }
    };
    fetchTemples();
  }, [activeTrustId]);

  // Initialize session and active scope from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedScope = localStorage.getItem('sankalpvani_active_scope') as 'TRUST' | 'TEMPLE' | null;
        const savedTempleId = localStorage.getItem('sankalpvani_active_temple_id');
        const savedTempleName = localStorage.getItem('sankalpvani_active_temple_name');

        if (savedScope) {
          setActiveScope(savedScope);
          setActiveTempleId(savedTempleId || (savedScope === 'TEMPLE' ? DEFAULT_TEMPLES[0].id : null));
          setActiveTempleName(savedTempleName || (savedScope === 'TEMPLE' ? DEFAULT_TEMPLES[0].name : null));
        }

        const rawSession = localStorage.getItem('sankalpvani_session');
        if (rawSession) {
          try {
            // Check if stored as JSON object
            const parsed = JSON.parse(rawSession);
            if (typeof parsed === 'object' && parsed !== null) {
              const loadedSession: UserSession = {
                email: parsed.email || 'admin@temple1.com',
                name: parsed.name || 'Admin User',
                avatar: parsed.avatar || DEFAULT_SUPER_ADMIN.avatar,
                designation: parsed.designation || parsed.role || 'Administrator',
                role: parsed.role || 'Administrator',
                phone: parsed.phone || '+91 98450 11000',
                department: parsed.department,
                permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [...ALL_PERMISSIONS],
                isSuperAdmin: parsed.isSuperAdmin ?? (parsed.permissions?.includes('SUPER_ADMIN') || false),
                staffId: parsed.staffId,
                scope: parsed.scope || (parsed.isSuperAdmin ? 'TRUST' : 'TEMPLE'),
                trustId: parsed.trustId || 'trust_sringeri',
                templeId: parsed.templeId,
                templeName: parsed.templeName
              };
              setSession(loadedSession);

              if (!savedScope) {
                const s = loadedSession.scope || (loadedSession.isSuperAdmin ? 'TRUST' : 'TEMPLE');
                setActiveScope(s);
                setActiveTempleId(loadedSession.templeId || (s === 'TEMPLE' ? DEFAULT_TEMPLES[0].id : null));
                setActiveTempleName(loadedSession.templeName || (s === 'TEMPLE' ? DEFAULT_TEMPLES[0].name : null));
              }
            } else if (typeof parsed === 'string') {
              // Legacy string email fallback
              setSession({
                ...DEFAULT_SUPER_ADMIN,
                email: parsed
              });
            }
          } catch (e) {
            // Raw string (e.g. "admin@temple1.com")
            setSession({
              ...DEFAULT_SUPER_ADMIN,
              email: rawSession
            });
          }
        }
      } catch (err) {
        console.error('Error loading session from localStorage', err);
      } finally {
        setIsMounted(true);
      }
    }
  }, []);

  const switchScope = useCallback((scope: 'TRUST' | 'TEMPLE', templeId?: string | null, templeName?: string | null) => {
    setActiveScope(scope);
    const targetTempleId = scope === 'TEMPLE' ? (templeId || DEFAULT_TEMPLES[0].id) : null;
    const targetTempleName = scope === 'TEMPLE' ? (templeName || DEFAULT_TEMPLES[0].name) : null;

    setActiveTempleId(targetTempleId);
    setActiveTempleName(targetTempleName);

    if (typeof window !== 'undefined') {
      localStorage.setItem('sankalpvani_active_scope', scope);
      if (targetTempleId) {
        localStorage.setItem('sankalpvani_active_temple_id', targetTempleId);
      } else {
        localStorage.removeItem('sankalpvani_active_temple_id');
      }
      if (targetTempleName) {
        localStorage.setItem('sankalpvani_active_temple_name', targetTempleName);
      } else {
        localStorage.removeItem('sankalpvani_active_temple_name');
      }
      window.dispatchEvent(new CustomEvent('sankalpvani_scope_updated', {
        detail: { scope, templeId: targetTempleId, templeName: targetTempleName }
      }));
    }
  }, []);

  // Save session to LocalStorage and sync server session cookie
  const persistSession = (newSession: UserSession | null) => {
    setSession(newSession);
    if (typeof window !== 'undefined') {
      if (newSession) {
        localStorage.setItem('sankalpvani_session', JSON.stringify(newSession));
        localStorage.setItem('sankalpvani_admin_profile', JSON.stringify({
          name: newSession.name,
          email: newSession.email,
          phone: newSession.phone || '+91 98450 11000',
          role: newSession.designation,
          avatar: newSession.avatar
        }));

        if (newSession.scope) {
          switchScope(newSession.scope, newSession.templeId, newSession.templeName);
        }

        window.dispatchEvent(new Event('sankalpvani_session_updated'));

        // Sync with server session cookie
        fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newSession.email })
        }).catch(err => console.debug('Auto-session cookie sync:', err));
      } else {
        localStorage.removeItem('sankalpvani_session');
        window.dispatchEvent(new Event('sankalpvani_session_updated'));
        fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
      }
    }
  };

  const login = useCallback((email: string, customProps?: Partial<UserSession>) => {
    const newSession: UserSession = {
      ...DEFAULT_SUPER_ADMIN,
      email,
      ...customProps,
      permissions: customProps?.permissions || [...ALL_PERMISSIONS]
    };
    persistSession(newSession);
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
  }, []);

  const updateSession = useCallback((updates: Partial<UserSession>) => {
    setSession(prev => {
      if (!prev) return null;
      const updated: UserSession = {
        ...prev,
        ...updates
      };
      persistSession(updated);
      return updated;
    });
  }, []);

  const switchStaffPersona = useCallback((staff: StaffMember) => {
    const staffPermissions: PermissionKey[] = (staff as any).permissions && Array.isArray((staff as any).permissions) && (staff as any).permissions.length > 0
      ? (staff as any).permissions
      : staff.role.toLowerCase().includes('dharmadhikari') || staff.role.toLowerCase().includes('executive')
        ? [...ALL_PERMISSIONS]
        : ['DASHBOARD_VIEW', 'VIEW_SEVAS', 'VIEW_PRIESTS', 'VIEW_BOOKINGS', 'VIEW_ORG_CHART'];

    const isSuper = staffPermissions.includes('SUPER_ADMIN') || staff.reportsTo === null;
    const staffScope: 'TRUST' | 'TEMPLE' = isSuper || staff.department === 'Admin' ? 'TRUST' : 'TEMPLE';

    const staffSession: UserSession = {
      email: staff.email || `${staff.name.toLowerCase().replace(/\s+/g, '.')}@sankalpvani.org`,
      name: staff.name,
      designation: staff.role,
      role: staff.role,
      department: staff.department,
      phone: staff.phone || '+91 98450 00000',
      avatar: staff.avatar || DEFAULT_SUPER_ADMIN.avatar,
      permissions: staffPermissions,
      isSuperAdmin: isSuper,
      staffId: staff.id,
      scope: staffScope,
      trustId: 'trust_sringeri',
      templeId: staffScope === 'TEMPLE' ? 'temple_vidyashankara' : null,
      templeName: staffScope === 'TEMPLE' ? 'Sri Vidyashankara Temple' : null
    };

    persistSession(staffSession);
  }, []);

  const resetToSuperAdmin = useCallback(() => {
    persistSession(DEFAULT_SUPER_ADMIN);
  }, []);

  const hasPermission = useCallback((permission: PermissionKey | PermissionKey[], mode: 'all' | 'any' = 'all'): boolean => {
    if (!session) return false;
    if (session.isSuperAdmin || session.permissions.includes('SUPER_ADMIN')) return true;

    if (Array.isArray(permission)) {
      return mode === 'any' 
        ? checkHasAnyPermission(session.permissions, permission)
        : checkHasAllPermission(session.permissions, permission);
    }
    return checkHasPermission(session.permissions, permission);
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoggedIn: !!session,
        isMounted,
        activeScope,
        activeTrustId,
        activeTempleId,
        activeTempleName,
        availableTemples,
        switchScope,
        login,
        logout,
        updateSession,
        hasPermission,
        switchStaffPersona,
        resetToSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
