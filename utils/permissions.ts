/**
 * SankalpVani Devasthanam Dynamic RBAC Permission Registry
 * Centralized definition of all granular capabilities and access controls.
 */

export type PermissionKey =
  // Dashboard
  | 'DASHBOARD_VIEW'
  // Rituals & Sevas
  | 'VIEW_SEVAS'
  | 'MANAGE_SEVAS'
  | 'VIEW_PRIESTS'
  | 'MANAGE_PRIESTS'
  | 'VIEW_ROSTER'
  | 'MANAGE_ROSTER'
  // Bookings & Devotee Services
  | 'VIEW_BOOKINGS'
  | 'REGISTER_BOOKINGS'
  | 'CANCEL_BOOKINGS'
  // Finance & Transactions
  | 'VIEW_FINANCE'
  | 'MANAGE_FINANCE'
  | 'PRINT_RECEIPTS'
  // Logistics & Holy Prasadam
  | 'PROCESS_LOGISTICS'
  | 'PRINT_SHIPPING_LABELS'
  // Org Chart & Governance
  | 'VIEW_ORG_CHART'
  | 'MANAGE_ORG_CHART'
  | 'MANAGE_STAFF'
  // Temple Masters & Configuration
  | 'MANAGE_TEMPLE_INFO'
  | 'MANAGE_FACILITIES'
  | 'VIEW_REPORTS'
  | 'EXPORT_REPORTS'
  | 'MANAGE_SETTINGS'
  // Super Admin Override
  | 'SUPER_ADMIN';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: PermissionCategory;
}

export type PermissionCategory =
  | 'Rituals & Sevas'
  | 'Devotee Bookings'
  | 'Finance & Receipts'
  | 'Prasadam Logistics'
  | 'Staff & Org Governance'
  | 'Temple Masters & Settings'
  | 'Reports & Analytics';

export const PERMISSION_REGISTRY: Record<PermissionKey, PermissionDefinition> = {
  SUPER_ADMIN: {
    key: 'SUPER_ADMIN',
    label: 'Super Admin Override',
    description: 'Unrestricted master access across all Devasthanam modules and configuration.',
    category: 'Temple Masters & Settings'
  },
  DASHBOARD_VIEW: {
    key: 'DASHBOARD_VIEW',
    label: 'View Dashboard & KPIs',
    description: 'Access the executive dashboard overview, KPI stats, and daily charts.',
    category: 'Reports & Analytics'
  },
  VIEW_SEVAS: {
    key: 'VIEW_SEVAS',
    label: 'View Seva Offerings',
    description: 'Browse the catalog of temple sevas, pooja rates, and capacity limits.',
    category: 'Rituals & Sevas'
  },
  MANAGE_SEVAS: {
    key: 'MANAGE_SEVAS',
    label: 'Manage Seva Master',
    description: 'Create, modify, price, and activate/suspend seva pooja offerings.',
    category: 'Rituals & Sevas'
  },
  VIEW_PRIESTS: {
    key: 'VIEW_PRIESTS',
    label: 'View Acharyas Directory',
    description: 'Access the registered list of archakas, purohits, and ritual specialists.',
    category: 'Rituals & Sevas'
  },
  MANAGE_PRIESTS: {
    key: 'MANAGE_PRIESTS',
    label: 'Manage Priest Registry',
    description: 'Add and edit official priest profiles, roles, and duty status.',
    category: 'Rituals & Sevas'
  },
  VIEW_ROSTER: {
    key: 'VIEW_ROSTER',
    label: 'View Duty Roster',
    description: 'View the 4-day priest duty schedule and shift allocations.',
    category: 'Rituals & Sevas'
  },
  MANAGE_ROSTER: {
    key: 'MANAGE_ROSTER',
    label: 'Manage Shift Rosters',
    description: 'Assign duty shifts to priests and resolve scheduling conflicts.',
    category: 'Rituals & Sevas'
  },
  VIEW_BOOKINGS: {
    key: 'VIEW_BOOKINGS',
    label: 'View Bookings Calendar',
    description: 'Browse monthly booking calendar and daily agenda rosters.',
    category: 'Devotee Bookings'
  },
  REGISTER_BOOKINGS: {
    key: 'REGISTER_BOOKINGS',
    label: 'Register Seva Bookings',
    description: 'Create and issue new devotee seva booking registrations.',
    category: 'Devotee Bookings'
  },
  CANCEL_BOOKINGS: {
    key: 'CANCEL_BOOKINGS',
    label: 'Cancel / Refund Bookings',
    description: 'Cancel scheduled devotee bookings and issue refunds.',
    category: 'Devotee Bookings'
  },
  VIEW_FINANCE: {
    key: 'VIEW_FINANCE',
    label: 'View Transactions Ledger',
    description: 'Access financial transaction records, receipt history, and collection metrics.',
    category: 'Finance & Receipts'
  },
  MANAGE_FINANCE: {
    key: 'MANAGE_FINANCE',
    label: 'Manage Payment Status',
    description: 'Modify payment states (Paid / Pending / Refunded) and ledger reconciliations.',
    category: 'Finance & Receipts'
  },
  PRINT_RECEIPTS: {
    key: 'PRINT_RECEIPTS',
    label: 'Print Thermal Slips',
    description: 'Trigger official thermal receipts and Darshan slip printouts.',
    category: 'Finance & Receipts'
  },
  PROCESS_LOGISTICS: {
    key: 'PROCESS_LOGISTICS',
    label: 'Process Prasadam Orders',
    description: 'Manage remote delivery shipments, packing statuses, and dispatch pipelines.',
    category: 'Prasadam Logistics'
  },
  PRINT_SHIPPING_LABELS: {
    key: 'PRINT_SHIPPING_LABELS',
    label: 'Print Packing Labels',
    description: 'Generate and print India Post packaging labels and assign tracking codes.',
    category: 'Prasadam Logistics'
  },
  VIEW_ORG_CHART: {
    key: 'VIEW_ORG_CHART',
    label: 'View Devasthanam Org Chart',
    description: 'Explore the hierarchical tree and matrix reporting graph.',
    category: 'Staff & Org Governance'
  },
  MANAGE_ORG_CHART: {
    key: 'MANAGE_ORG_CHART',
    label: 'Manage Org Chart & Nodes',
    description: 'Restructure reporting lines, auto-layout trees, and reassign supervisors.',
    category: 'Staff & Org Governance'
  },
  MANAGE_STAFF: {
    key: 'MANAGE_STAFF',
    label: 'Manage Staff & Dynamic RBAC',
    description: 'Create/edit staff profiles, assign custom designations, and grant permissions.',
    category: 'Staff & Org Governance'
  },
  MANAGE_TEMPLE_INFO: {
    key: 'MANAGE_TEMPLE_INFO',
    label: 'Manage Temple Info & Schedules',
    description: 'Configure temple contact info, primary photos, and 4-tier Darshan timings.',
    category: 'Temple Masters & Settings'
  },
  MANAGE_FACILITIES: {
    key: 'MANAGE_FACILITIES',
    label: 'Manage Temple Facilities',
    description: 'Enable or disable guest amenities (choultry, dining, rooms, water).',
    category: 'Temple Masters & Settings'
  },
  VIEW_REPORTS: {
    key: 'VIEW_REPORTS',
    label: 'View Infrastructure Reports',
    description: 'Review CPU latency, network uptime, and operational aggregates.',
    category: 'Reports & Analytics'
  },
  EXPORT_REPORTS: {
    key: 'EXPORT_REPORTS',
    label: 'Export Analytics & CSV Data',
    description: 'Download CSV spreadsheets for financial, booking, and shipping data.',
    category: 'Reports & Analytics'
  },
  MANAGE_SETTINGS: {
    key: 'MANAGE_SETTINGS',
    label: 'Manage System & Safety Settings',
    description: 'Configure SMS alerts, MFA, session timeouts, and factory reset diagnostics.',
    category: 'Temple Masters & Settings'
  }
};

export const ALL_PERMISSIONS: PermissionKey[] = Object.keys(PERMISSION_REGISTRY) as PermissionKey[];

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  'Rituals & Sevas',
  'Devotee Bookings',
  'Finance & Receipts',
  'Prasadam Logistics',
  'Staff & Org Governance',
  'Temple Masters & Settings',
  'Reports & Analytics'
];

/**
 * Predefined Role / Designation Templates for 1-click permission assignment
 */
export interface RoleTemplate {
  id?: string;
  name: string;
  designation: string;
  department: 'Spiritual' | 'Admin' | 'Operations' | 'Finance';
  description: string;
  permissions: PermissionKey[];
  isCustom?: boolean;
}

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    name: 'Executive Officer / Dharmadhikari',
    designation: 'Executive Officer / Dharmadhikari',
    department: 'Admin',
    description: 'Full uninhibited stewardship across all administrative, spiritual, and financial assets.',
    permissions: [...ALL_PERMISSIONS]
  },
  CHIEF_ARCHAKA: {
    id: 'CHIEF_ARCHAKA',
    name: 'Chief Archaka (Pradhana Acharya)',
    designation: 'Chief Archaka (Pradhana Acharya)',
    department: 'Spiritual',
    description: 'Leads Agamic rituals, sanctum services, priest assignments, and seva schedules.',
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
      'MANAGE_TEMPLE_INFO',
      'PRINT_RECEIPTS'
    ]
  },
  CHIEF_ADMIN_OFFICER: {
    id: 'CHIEF_ADMIN_OFFICER',
    name: 'Chief Administrative Officer (CAO)',
    designation: 'Chief Administrative Officer',
    department: 'Admin',
    description: 'Manages temple workforce, facilities, reporting, estate, and operations.',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_BOOKINGS',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'VIEW_ORG_CHART',
      'MANAGE_ORG_CHART',
      'MANAGE_STAFF',
      'MANAGE_TEMPLE_INFO',
      'MANAGE_FACILITIES',
      'VIEW_REPORTS',
      'EXPORT_REPORTS',
      'MANAGE_SETTINGS'
    ]
  },
  SEVA_BOOKING_DESK: {
    id: 'SEVA_BOOKING_DESK',
    name: 'Seva & Booking Desk Officer',
    designation: 'Seva Booking Coordinator',
    department: 'Admin',
    description: 'Front-desk operations, issuing seva tickets, printing darshan receipts, and recording gotras.',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'VIEW_ROSTER',
      'PRINT_RECEIPTS',
      'VIEW_FINANCE'
    ]
  },
  PRASADAM_LOGISTICS: {
    id: 'PRASADAM_LOGISTICS',
    name: 'Prasadam Logistics Superintendent',
    designation: 'Prasadam Logistics Manager',
    department: 'Operations',
    description: 'Oversees remote holy prasadam packing, courier coordination, and postal dispatch.',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_BOOKINGS',
      'PROCESS_LOGISTICS',
      'PRINT_SHIPPING_LABELS',
      'EXPORT_REPORTS'
    ]
  },
  FINANCE_OFFICER: {
    id: 'FINANCE_OFFICER',
    name: 'Finance & Accounts Officer',
    designation: 'Finance Officer',
    department: 'Finance',
    description: 'Manages ledger reconciliations, collection auditing, refunds, and financial reporting.',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'VIEW_BOOKINGS',
      'CANCEL_BOOKINGS',
      'PRINT_RECEIPTS',
      'VIEW_REPORTS',
      'EXPORT_REPORTS'
    ]
  },
  ARCHAKA_PRIEST: {
    id: 'ARCHAKA_PRIEST',
    name: 'Archaka / Pujari Staff',
    designation: 'Sanctum Pujari',
    department: 'Spiritual',
    description: 'Conducts daily poojas, views allocated duty rosters and scheduled devotee bookings.',
    permissions: [
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_ROSTER',
      'VIEW_BOOKINGS'
    ]
  }
};

/**
 * Dynamic Designation Presets Storage Helpers
 */
export const CUSTOM_PRESETS_STORAGE_KEY = 'sankalpvani_custom_designation_presets';

export function getCustomRolePresets(): RoleTemplate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load custom role presets', e);
    return [];
  }
}

export function saveCustomRolePreset(preset: Omit<RoleTemplate, 'id' | 'isCustom'>): RoleTemplate {
  const customPresets = getCustomRolePresets();
  const newPreset: RoleTemplate = {
    ...preset,
    id: `custom-preset-${Date.now()}`,
    isCustom: true
  };
  const updated = [...customPresets, newPreset];
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sankalpvani_presets_updated'));
  }
  return newPreset;
}

export function deleteCustomRolePreset(presetId: string): void {
  const customPresets = getCustomRolePresets();
  const updated = customPresets.filter(p => p.id !== presetId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sankalpvani_presets_updated'));
  }
}

export function getAllRolePresets(): RoleTemplate[] {
  const defaultList = Object.entries(ROLE_TEMPLATES).map(([key, tpl]) => ({
    ...tpl,
    id: key,
    isCustom: false
  }));
  const customList = getCustomRolePresets();
  return [...defaultList, ...customList];
}

/**
 * Permission Verification Utilities
 */

/**
 * Checks if a user permission list contains a given permission key.
 * Accounts for SUPER_ADMIN wildcard override.
 */
export function hasPermission(
  userPermissions: PermissionKey[] | undefined | null,
  required: PermissionKey
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('SUPER_ADMIN')) return true;
  return userPermissions.includes(required);
}

/**
 * Checks if a user has ANY of the required permissions.
 */
export function hasAnyPermission(
  userPermissions: PermissionKey[] | undefined | null,
  required: PermissionKey[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('SUPER_ADMIN')) return true;
  return required.some(p => userPermissions.includes(p));
}

/**
 * Checks if a user has ALL of the required permissions.
 */
export function hasAllPermissions(
  userPermissions: PermissionKey[] | undefined | null,
  required: PermissionKey[]
): boolean {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('SUPER_ADMIN')) return true;
  return required.every(p => userPermissions.includes(p));
}

