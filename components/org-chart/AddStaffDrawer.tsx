'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  X, 
  Check, 
  User, 
  Briefcase, 
  Building2, 
  Flame, 
  ShieldCheck, 
  Coins, 
  Search, 
  ChevronDown, 
  Share2, 
  Phone, 
  Mail, 
  Camera, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  GitFork,
  ArrowRight,
  ArrowLeft,
  Key
} from 'lucide-react';
import { 
  StaffMember, 
  DepartmentType, 
  StaffStatus, 
  DEPARTMENT_CONFIG,
  TrusteeType,
  OfficeBearerRole,
  CadreRank,
  SUB_DEPARTMENTS
} from './types';
import { 
  PermissionKey, 
  PERMISSION_REGISTRY, 
  PERMISSION_CATEGORIES, 
  ALL_PERMISSIONS, 
  ROLE_TEMPLATES, 
  PermissionCategory,
  RoleTemplate,
  getAllRolePresets,
  saveCustomRolePreset,
  deleteCustomRolePreset
} from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Lock, CheckSquare, Square, Plus, Trash2, BookmarkPlus, Crown, Award, BookMarked, Landmark } from 'lucide-react';

interface AddStaffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  editingStaff: StaffMember | null;
  existingStaffList: StaffMember[];
  defaultParentId?: string | null;
  defaultMatrixId?: string | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'
];

interface PlainEnglishCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  badgeColor: string;
  keys: PermissionKey[];
}

const PLAIN_ENGLISH_CATEGORIES: PlainEnglishCategory[] = [
  {
    id: 'finance',
    name: 'Finance & Treasury Operations',
    description: 'Permissions for inspecting books, hundis, ledger journals, and issuing receipts',
    icon: Coins,
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    keys: ['VIEW_FINANCE', 'MANAGE_FINANCE', 'PRINT_RECEIPTS']
  },
  {
    id: 'rituals',
    name: 'Sacred Rituals & Seva Master',
    description: 'Permissions for cataloging sevas, managing offerings, and registering devotee bookings',
    icon: Flame,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    keys: ['VIEW_SEVAS', 'MANAGE_SEVAS', 'VIEW_BOOKINGS', 'REGISTER_BOOKINGS', 'CANCEL_BOOKINGS']
  },
  {
    id: 'governance',
    name: 'Priests, Roster & Staff Governance',
    description: 'Permissions for archaka management, sanctum rosters, and hierarchical reporting lines',
    icon: ShieldCheck,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    keys: ['VIEW_PRIESTS', 'MANAGE_PRIESTS', 'VIEW_ROSTER', 'MANAGE_ROSTER', 'MANAGE_STAFF', 'VIEW_ORG_CHART', 'MANAGE_ORG_CHART']
  },
  {
    id: 'logistics',
    name: 'Facilities & Logistics',
    description: 'Permissions for mandapams, sanctum complexes, and holy prasadam postal dispatch',
    icon: Building2,
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    keys: ['MANAGE_TEMPLE_INFO', 'MANAGE_FACILITIES', 'PROCESS_LOGISTICS', 'PRINT_SHIPPING_LABELS']
  },
  {
    id: 'admin',
    name: 'Analytics, Audit & Administration',
    description: 'Permissions for executive dashboards, statutory exports, and system settings',
    icon: Sparkles,
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    keys: ['DASHBOARD_VIEW', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'MANAGE_SETTINGS', 'SUPER_ADMIN']
  }
];

const PLAIN_ENGLISH_TOGGLES: Record<PermissionKey, { title: string; subtitle: string }> = {
  // Finance
  VIEW_FINANCE: { title: 'Can view financial ledgers', subtitle: 'Inspect cash balances, daily hundi collection totals & accounting ledgers' },
  MANAGE_FINANCE: { title: 'Can manage financial ledgers', subtitle: 'Create journal entries, reconcile hundis & post financial adjustments' },
  PRINT_RECEIPTS: { title: 'Can issue & print official receipts', subtitle: 'Generate and print official devotee donation and seva payment receipts' },

  // Rituals & Sevas
  VIEW_SEVAS: { title: 'Can view pooja & seva catalogue', subtitle: 'Browse temple sevas, daily schedule timings, and seva rates' },
  MANAGE_SEVAS: { title: 'Can edit Seva prices & offerings', subtitle: 'Create, modify, price, and activate/suspend temple sevas' },
  VIEW_BOOKINGS: { title: 'Can view devotee bookings', subtitle: 'View sankalpam details, Gotra, and daily booking queues' },
  REGISTER_BOOKINGS: { title: 'Can register new devotee bookings', subtitle: 'Book sevas at counter, assign sankalpam slots & issue tokens' },
  CANCEL_BOOKINGS: { title: 'Can cancel or refund bookings', subtitle: 'Process seva cancellations, refunds, and schedule adjustments' },

  // Staff & Priests
  VIEW_PRIESTS: { title: 'Can view priests & archaka directory', subtitle: 'Inspect sanctum archakas, Purohits, and lineage details' },
  MANAGE_PRIESTS: { title: 'Can manage priest profiles', subtitle: 'Register and update archakas, Purohits, and sanctum leads' },
  VIEW_ROSTER: { title: 'Can view sanctum duty roster', subtitle: 'Inspect daily shift assignments, timings, and duties' },
  MANAGE_ROSTER: { title: 'Can manage shift duty assignments', subtitle: 'Schedule priest shifts, replacements, and duty rosters' },
  MANAGE_STAFF: { title: 'Can manage staff & designations', subtitle: 'Add, update, and manage team members and office bearers' },
  VIEW_ORG_CHART: { title: 'Can view matrix organization tree', subtitle: 'Explore the full Devasthanam hierarchical tree and chart' },
  MANAGE_ORG_CHART: { title: 'Can edit org chart hierarchy', subtitle: 'Modify direct managers and cross-functional reporting lines' },

  // Facilities & Logistics
  MANAGE_TEMPLE_INFO: { title: 'Can manage temple information', subtitle: 'Update temple history, photos, timings, and contact details' },
  MANAGE_FACILITIES: { title: 'Can manage temple facilities', subtitle: 'Manage Kalyana Mandapams, rooms, and queue complexes' },
  PROCESS_LOGISTICS: { title: 'Can dispatch holy prasadam', subtitle: 'Pack consecrated offerings and enter India Post tracking' },
  PRINT_SHIPPING_LABELS: { title: 'Can print logistics shipping labels', subtitle: 'Generate dispatch barcodes and devotee postal slips' },

  // Analytics & Administration
  DASHBOARD_VIEW: { title: 'Can view executive dashboard', subtitle: 'Access high-level KPI cards, stats graphs, and daily counts' },
  VIEW_REPORTS: { title: 'Can view operational reports', subtitle: 'Analyze occupancy rates, revenue trends, and seva reports' },
  EXPORT_REPORTS: { title: 'Can export sensitive reports', subtitle: 'Download audit trails and financial summaries as CSV/PDF' },
  MANAGE_SETTINGS: { title: 'Can configure system settings', subtitle: 'Manage system parameters, integrations, and preferences' },
  SUPER_ADMIN: { title: 'Apex Super Admin Override', subtitle: 'Unrestricted master control across all platform capabilities' }
};

export default function AddStaffDrawer({
  isOpen,
  onClose,
  onSave,
  editingStaff,
  existingStaffList,
  defaultParentId,
  defaultMatrixId
}: AddStaffDrawerProps) {
  // Form State & Wizard Step (1: Official Identity, 2: App Access Rights)
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState<DepartmentType>('Spiritual');
  const [subDepartment, setSubDepartment] = useState('');
  const [reportsTo, setReportsTo] = useState<string | null>(null);
  const [secondaryReports, setSecondaryReports] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [responsibilities, setResponsibilities] = useState('');
  const [location, setLocation] = useState('');
  const [joinedYear, setJoinedYear] = useState('2026');
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);

  // Temple Trust & Entity Governance State
  const [isTrustee, setIsTrustee] = useState(false);
  const [trusteeType, setTrusteeType] = useState<TrusteeType>('Non-Trustee Staff');
  const [isOfficeBearer, setIsOfficeBearer] = useState(false);
  const [officeBearerRole, setOfficeBearerRole] = useState<OfficeBearerRole>('None');
  const [cadreRank, setCadreRank] = useState<CadreRank>('Operational Officer & Desk');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [resolutionNo, setResolutionNo] = useState('');

  // Dynamic Custom Presets State
  const [rolePresets, setRolePresets] = useState<RoleTemplate[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDept, setNewPresetDept] = useState<DepartmentType>('Spiritual');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [presetSuccessMsg, setPresetSuccessMsg] = useState('');

  // Dynamic Departments State & API Loading
  const params = useParams();
  const trustId = (params?.trustId as string) || 'trust_sringeri';
  const templeId = (params?.templeId as string) || undefined;
  
  const { activeScope, activeTempleId, activeTempleName } = useAuth();
  const effectiveTempleId = templeId || (activeScope === 'TEMPLE' ? (activeTempleId || 'temple_vidyashankara') : undefined);
  
  const [dynamicDepartments, setDynamicDepartments] = useState<Array<{ id: string; name: string; code?: string; color?: string; description?: string }>>([
    { id: 'dept_spiritual', name: 'Spiritual', color: '#ff7700', description: 'Archakas & Purohits' },
    { id: 'dept_admin', name: 'Admin', color: '#d4af37', description: 'Management & Officers' },
    { id: 'dept_operations', name: 'Operations', color: '#059669', description: 'Facilities & Logistics' },
    { id: 'dept_finance', name: 'Finance', color: '#2563eb', description: 'Hundi & Treasury' }
  ]);
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#ff7700');
  const [isSavingDept, setIsSavingDept] = useState(false);

  // Fetch dynamic departments strictly filtered by active scope
  const fetchDepartments = async () => {
    try {
      const url = effectiveTempleId 
        ? `/api/v1/trusts/${trustId}/temples/${effectiveTempleId}/departments`
        : `/api/v1/trusts/${trustId}/departments`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Strictly filter out departments belonging to other temples
          const filtered = json.data.filter((d: any) => {
            if (activeScope === 'TEMPLE') {
              return !d.templeId || d.templeId === effectiveTempleId;
            }
            return true;
          });
          setDynamicDepartments(filtered);
        }
      }
    } catch (err) {
      console.debug('Error loading dynamic departments:', err);
    }
  };

  const handleCreateDynamicDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setIsSavingDept(true);
    try {
      const url = effectiveTempleId 
        ? `/api/v1/trusts/${trustId}/temples/${effectiveTempleId}/departments`
        : `/api/v1/trusts/${trustId}/departments`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          color: newDeptColor,
          templeId: effectiveTempleId || null
        })
      });
      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        setDynamicDepartments(prev => [...prev, created]);
        setDepartment(created.name as any);
        setSubDepartment('General Wing');
        setNewDeptName('');
        setIsAddingNewDept(false);
      }
    } catch (err) {
      console.error('Failed to create dynamic department:', err);
    } finally {
      setIsSavingDept(false);
    }
  };

  // Search & Combobox Dropdown States
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);

  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [isMatrixDropdownOpen, setIsMatrixDropdownOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  const managerDropdownRef = useRef<HTMLDivElement>(null);
  const matrixDropdownRef = useRef<HTMLDivElement>(null);

  // Load and listen for dynamic designation presets
  const loadPresets = () => {
    setRolePresets(getAllRolePresets());
  };

  useEffect(() => {
    loadPresets();
    window.addEventListener('sankalpvani_presets_updated', loadPresets);
    return () => window.removeEventListener('sankalpvani_presets_updated', loadPresets);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
    window.addEventListener('sankalpvani_scope_updated', fetchDepartments);
    return () => window.removeEventListener('sankalpvani_scope_updated', fetchDepartments);
  }, [isOpen, trustId, effectiveTempleId, activeScope]);

  // Initialize or reset form when drawer opens / editingStaff changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingStaff) {
      setName(editingStaff.name);
      setRole(editingStaff.role);
      setDepartment(editingStaff.department);
      setSubDepartment(editingStaff.subDepartment || SUB_DEPARTMENTS[editingStaff.department]?.[0] || '');
      setReportsTo(editingStaff.reportsTo);
      setSecondaryReports(editingStaff.secondaryReports || []);
      setAvatar(editingStaff.avatar || AVATAR_PRESETS[0]);
      setPhone(editingStaff.phone || '');
      setEmail(editingStaff.email || '');
      setStatus(editingStaff.status);
      setResponsibilities(editingStaff.responsibilities || '');
      setLocation(editingStaff.location || '');
      setJoinedYear(editingStaff.joinedYear || '2026');
      setPermissions(
        editingStaff.permissions && editingStaff.permissions.length > 0
          ? editingStaff.permissions
          : editingStaff.reportsTo === null
            ? [...ALL_PERMISSIONS]
            : ['DASHBOARD_VIEW', 'VIEW_SEVAS', 'VIEW_PRIESTS', 'VIEW_BOOKINGS', 'VIEW_ORG_CHART']
      );
      setIsTrustee(editingStaff.isTrustee || false);
      setTrusteeType(editingStaff.trusteeType || 'Non-Trustee Staff');
      setIsOfficeBearer(editingStaff.isOfficeBearer || false);
      setOfficeBearerRole(editingStaff.officeBearerRole || 'None');
      setCadreRank(editingStaff.cadreRank || 'Operational Officer & Desk');
      setTermStart(editingStaff.termStart || '');
      setTermEnd(editingStaff.termEnd || '');
      setResolutionNo(editingStaff.resolutionNo || '');
    } else {
      setName('');
      setRole('');
      setDepartment('Spiritual');
      setSubDepartment(SUB_DEPARTMENTS.Spiritual[0]);
      setReportsTo(defaultParentId || (existingStaffList.length > 0 ? existingStaffList[0].id : null));
      setSecondaryReports(defaultMatrixId ? [defaultMatrixId] : []);
      setAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
      setPhone('+91 98');
      setEmail('');
      setStatus('Active');
      setResponsibilities('');
      setLocation('Main Devasthanam Complex');
      setJoinedYear(new Date().getFullYear().toString());
      setPermissions([
        'DASHBOARD_VIEW', 
        'VIEW_SEVAS', 
        'VIEW_PRIESTS', 
        'VIEW_BOOKINGS', 
        'VIEW_ORG_CHART'
      ]);
      setIsTrustee(false);
      setTrusteeType('Non-Trustee Staff');
      setIsOfficeBearer(false);
      setOfficeBearerRole('None');
      setCadreRank('Operational Officer & Desk');
      setTermStart('');
      setTermEnd('');
      setResolutionNo('');
    }
    setErrorMessage('');
    setManagerSearchQuery('');
    setMatrixSearchQuery('');
    setIsCreatingPreset(false);
  }, [isOpen, editingStaff, defaultParentId, defaultMatrixId, existingStaffList]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (managerDropdownRef.current && !managerDropdownRef.current.contains(e.target as Node)) {
        setIsManagerDropdownOpen(false);
      }
      if (matrixDropdownRef.current && !matrixDropdownRef.current.contains(e.target as Node)) {
        setIsMatrixDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Eligible primary managers (cannot report to self)
  const eligibleManagers = useMemo(() => {
    return existingStaffList.filter(s => !editingStaff || s.id !== editingStaff.id);
  }, [existingStaffList, editingStaff]);

  // Filtered managers for combobox
  const filteredManagers = useMemo(() => {
    if (!managerSearchQuery.trim()) return eligibleManagers;
    const query = managerSearchQuery.toLowerCase();
    return eligibleManagers.filter(
      s => s.name.toLowerCase().includes(query) || s.role.toLowerCase().includes(query) || s.department.toLowerCase().includes(query)
    );
  }, [eligibleManagers, managerSearchQuery]);

  // Eligible secondary / matrix supervisors (cannot be self, and cannot be primary manager)
  const eligibleMatrixSupervisors = useMemo(() => {
    return existingStaffList.filter(
      s => (!editingStaff || s.id !== editingStaff.id) && s.id !== reportsTo
    );
  }, [existingStaffList, editingStaff, reportsTo]);

  // Filtered matrix options
  const filteredMatrixOptions = useMemo(() => {
    if (!matrixSearchQuery.trim()) return eligibleMatrixSupervisors;
    const query = matrixSearchQuery.toLowerCase();
    return eligibleMatrixSupervisors.filter(
      s => s.name.toLowerCase().includes(query) || s.role.toLowerCase().includes(query) || s.department.toLowerCase().includes(query)
    );
  }, [eligibleMatrixSupervisors, matrixSearchQuery]);

  const selectedManager = eligibleManagers.find(m => m.id === reportsTo);

  const handleToggleSecondarySupervisor = (supervisorId: string) => {
    if (secondaryReports.includes(supervisorId)) {
      setSecondaryReports(prev => prev.filter(id => id !== supervisorId));
    } else {
      setSecondaryReports(prev => [...prev, supervisorId]);
    }
  };

  const handleTogglePermission = (key: PermissionKey) => {
    setPermissions(prev => {
      // If SUPER_ADMIN was present, expand to all granular permissions so individual items can be toggled
      const current = prev.includes('SUPER_ADMIN')
        ? ALL_PERMISSIONS.filter(p => p !== 'SUPER_ADMIN')
        : [...prev];

      return current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key];
    });
  };

  const handleToggleCategory = (category: PermissionCategory) => {
    const categoryKeys = Object.values(PERMISSION_REGISTRY)
      .filter(p => p.category === category)
      .map(p => p.key);
    
    setPermissions(prev => {
      const current = prev.includes('SUPER_ADMIN')
        ? ALL_PERMISSIONS.filter(p => p !== 'SUPER_ADMIN')
        : [...prev];

      const allSelected = categoryKeys.every(k => current.includes(k));
      if (allSelected) {
        return current.filter(k => !categoryKeys.includes(k));
      } else {
        return Array.from(new Set([...current, ...categoryKeys]));
      }
    });
  };

  const handleApplyPreset = (preset: RoleTemplate | 'CLEAR') => {
    if (preset === 'CLEAR') {
      setPermissions([]);
      setActivePresetId(null);
      return;
    }

    const presetId = preset.id || preset.name;
    const isCurrentlyActive = activePresetId === presetId || role === (preset.designation || preset.name);

    if (isCurrentlyActive) {
      // 2nd click: Toggle off / deselect
      setActivePresetId(null);
      setRole('');
      setPermissions([]);
      return;
    }

    // 1st click: Apply preset
    setActivePresetId(presetId);
    setPermissions([...preset.permissions]);
    setRole(preset.designation || preset.name);
    if (preset.department) {
      setDepartment(preset.department);
      if (SUB_DEPARTMENTS[preset.department]?.[0]) {
        setSubDepartment(SUB_DEPARTMENTS[preset.department][0]);
      }
    }
    if (preset.id === 'SUPER_ADMIN') {
      setIsTrustee(true);
      setTrusteeType('Managing Trustee / Dharmadhikari');
      setIsOfficeBearer(true);
      setOfficeBearerRole('President / Chairman');
      setCadreRank('Apex Governance & Trust Board');
    }
  };

  const handleSaveCurrentAsPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      alert('Please enter a Designation Title for the preset.');
      return;
    }

    if (permissions.length === 0) {
      alert('Please select at least 1 capability before saving as a Preset.');
      return;
    }

    saveCustomRolePreset({
      name: newPresetName.trim(),
      designation: newPresetName.trim(),
      department: newPresetDept,
      description: newPresetDesc.trim() || `Custom designation preset with ${permissions.length} capabilities.`,
      permissions: [...permissions]
    });

    setIsCreatingPreset(false);
    setNewPresetName('');
    setNewPresetDesc('');
    setPresetSuccessMsg(`Saved "${newPresetName.trim()}" preset successfully!`);
    setTimeout(() => setPresetSuccessMsg(''), 3500);
  };

  const handleDeleteCustomPreset = (e: React.MouseEvent, presetId: string, presetName: string) => {
    e.stopPropagation();
    if (confirm(`Remove custom designation preset "${presetName}"?`)) {
      deleteCustomRolePreset(presetId);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter the Staff / Archaka Name.');
      return;
    }
    if (!role.trim()) {
      setErrorMessage('Please enter the Role / Designation.');
      return;
    }

    // Duplicate check
    const isDuplicate = existingStaffList.some(
      s => s.name.trim().toLowerCase() === name.trim().toLowerCase() && (!editingStaff || s.id !== editingStaff.id)
    );
    if (isDuplicate) {
      setErrorMessage(`A staff member with the name "${name}" already exists in the Devasthanam.`);
      return;
    }

    // Cycle Detection Pre-Check: Prevent circular reporting loops
    if (editingStaff && reportsTo) {
      const isDescendant = (candidateId: string, ancestorId: string, visited = new Set<string>()): boolean => {
        if (candidateId === ancestorId) return true;
        if (visited.has(candidateId)) return false;
        visited.add(candidateId);
        const candidate = existingStaffList.find(s => s.id === candidateId);
        if (!candidate) return false;
        if (candidate.reportsTo && isDescendant(candidate.reportsTo, ancestorId, visited)) return true;
        for (const sec of candidate.secondaryReports || []) {
          if (isDescendant(sec, ancestorId, visited)) return true;
        }
        return false;
      };

      if (isDescendant(reportsTo, editingStaff.id)) {
        const mgr = existingStaffList.find(s => s.id === reportsTo);
        const mgrName = mgr ? mgr.name : 'Selected manager';
        const errorMsg = `Cannot assign this manager. ${mgrName} already reports to ${name.trim()}. A person cannot report to their own subordinate.`;
        setErrorMessage(errorMsg);
        return;
      }
    }

    const payload: StaffMember = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      department,
      subDepartment: subDepartment.trim() || undefined,
      reportsTo,
      secondaryReports: secondaryReports.filter(id => id !== reportsTo && (!editingStaff || id !== editingStaff.id)),
      avatar: avatar || AVATAR_PRESETS[0],
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      status,
      responsibilities: responsibilities.trim() || undefined,
      location: location.trim() || undefined,
      joinedYear: joinedYear.trim() || undefined,
      permissions: permissions.length > 0 ? permissions : undefined,
      isTrustee,
      trusteeType: isTrustee ? trusteeType : 'Non-Trustee Staff',
      isOfficeBearer,
      officeBearerRole: isOfficeBearer ? officeBearerRole : 'None',
      cadreRank,
      termStart: termStart.trim() || undefined,
      termEnd: termEnd.trim() || undefined,
      resolutionNo: resolutionNo.trim() || undefined
    };

    setIsSubmitting(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-surface-container-lowest shadow-2xl border-l border-outline-variant/30 flex flex-col animate-[slideIn_0.3s_ease-out]">
          
          {/* Drawer Header */}
          <div className="p-6 border-b divider-gold flex items-center justify-between bg-surface-container-low/60">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                <Sparkles size={14} className="text-primary" />
                <span>Devasthanam Staff Management</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                {editingStaff ? 'Edit Staff Profile' : 'Add New Staff / Archaka'}
              </h3>
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                Configure hierarchy tree (reports to) and cross-departmental matrix reporting.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* 2-Step Wizard Navigation Bar */}
          <div className="px-6 py-3 bg-surface-container-low/60 border-b border-outline-variant/30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setWizardStep(1);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                wizardStep === 1
                  ? 'bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
              }`}
            >
              <User size={15} className={wizardStep === 1 ? 'text-on-primary' : 'text-primary'} />
              <span>Step 1: Official Identity</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setErrorMessage('Please enter the Staff / Archaka Full Name first.');
                  return;
                }
                if (!role.trim()) {
                  setErrorMessage('Please enter their Traditional Title / Sacred Designation first.');
                  return;
                }
                setErrorMessage('');
                setWizardStep(2);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                wizardStep === 2
                  ? 'bg-primary text-on-primary border-primary shadow-sm ring-2 ring-primary/20'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container'
              }`}
            >
              <ShieldCheck size={15} className={wizardStep === 2 ? 'text-on-primary' : 'text-primary'} />
              <span>Step 2: App Access Rights</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                wizardStep === 2 ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
              }`}>
                {permissions.length}
              </span>
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
            
            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2 border border-error/30 animate-[shake_0.3s_ease-in-out]">
                <AlertCircle size={16} className="shrink-0 text-error" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: OFFICIAL IDENTITY                                                 */}
            {/* ========================================================================= */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Field 1: Name & Traditional Title / Sacred Designation */}
                <div className="space-y-4 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                      <User size={14} />
                      <span>Official Identity & Title</span>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">
                      Step 1 of 2
                    </span>
                  </div>

                  {/* Quick Template Selector Chips */}
                  <div className="space-y-1.5 bg-primary/5 p-3 rounded-xl border border-primary/15">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Apply Traditional Title Template:</span>
                      </span>
                      <span className="text-[9px] text-on-surface-variant font-mono">
                        Auto-fills Title & Dept
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {rolePresets.map((tpl) => (
                        <button
                          key={tpl.id || tpl.name}
                          type="button"
                          onClick={() => handleApplyPreset(tpl)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-2xs flex items-center gap-1 ${
                            role === (tpl.designation || tpl.name)
                              ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/30'
                              : tpl.isCustom
                              ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                              : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:border-primary/50'
                          }`}
                        >
                          {tpl.id === 'SUPER_ADMIN' && <Crown size={11} />}
                          <span>{tpl.name}</span>
                          {tpl.isCustom && (
                            <span className="text-[8px] bg-purple-700 text-white px-1 py-0.2 rounded font-extrabold ml-0.5 uppercase">
                              Custom
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Staff / Archaka Full Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Raghavan Bhattar / Sri Vidyaranya / Sharma Sastry"
                        required
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                          Traditional Title / Sacred Designation <span className="text-error">*</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Maha-Purohita / Pradhana Archaka / Executive Officer / Bhandari"
                        required
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                      />
                      <p className="font-sans text-[11px] text-on-surface-variant/80 mt-1 italic">
                        This is their official ceremonial or administrative title.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field 2: Dynamic Department & Granular Sub-Department */}
                <div className="space-y-4 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                      <Building2 size={14} />
                      <span>Dynamic Department & Wing Assignment</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewDept(!isAddingNewDept)}
                      className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{isAddingNewDept ? 'Cancel' : '+ Add New Department'}</span>
                    </button>
                  </div>

                  {/* Inline Add New Department Form */}
                  {isAddingNewDept && (
                    <div className="p-3.5 rounded-xl bg-surface-container-high border border-primary/30 space-y-2.5 animate-[fadeIn_0.2s_ease-out]">
                      <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                        <Sparkles size={12} /> Create Custom Dynamic Department
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Annadanam Wing / Veda Pathashala"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-surface-container-low border border-outline-variant/50 rounded-xl focus:outline-none focus:border-primary text-on-surface"
                        />
                        <div className="flex items-center gap-1">
                          {['#ff7700', '#d4af37', '#059669', '#2563eb', '#7c3aed', '#db2777'].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setNewDeptColor(c)}
                              className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                                newDeptColor === c ? 'scale-125 border-white shadow-xs' : 'border-transparent opacity-70'
                              }`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={isSavingDept || !newDeptName.trim()}
                          onClick={handleCreateDynamicDept}
                          className="px-3 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {isSavingDept ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dynamically Rendered Department Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dynamicDepartments.map((dept) => {
                      const isSelected = department === dept.name;
                      const deptColor = dept.color || '#ff7700';

                      return (
                        <label 
                          key={dept.id || dept.name}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20'
                              : 'border-outline-variant/40 bg-surface-container-low hover:border-primary/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="department"
                            value={dept.name}
                            checked={isSelected}
                            onChange={() => {
                              setDepartment(dept.name as any);
                              setSubDepartment(SUB_DEPARTMENTS[dept.name as DepartmentType]?.[0] || 'General Wing');
                            }}
                            className="accent-primary w-4 h-4 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: deptColor }}></span>
                              <span className="font-serif text-xs font-bold text-on-surface truncate">{dept.name}</span>
                            </div>
                            <p className="font-sans text-[10px] text-on-surface-variant mt-0.5 truncate">
                              {dept.description || 'Dynamic temple operational wing'}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Sub-Department Wing Dropdown */}
                  <div className="pt-1">
                    <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Sub-Department / Temple Wing
                    </label>
                    <div className="relative">
                      {SUB_DEPARTMENTS[department] ? (
                        <select
                          value={subDepartment}
                          onChange={(e) => setSubDepartment(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary cursor-pointer text-on-surface"
                        >
                          {SUB_DEPARTMENTS[department]?.map((wing) => (
                            <option key={wing} value={wing}>
                              {wing}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={subDepartment}
                          onChange={(e) => setSubDepartment(e.target.value)}
                          placeholder="e.g. Sanctum Pooja Desk / General Wing"
                          className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-on-surface"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Field 3: Direct Manager (Required) */}
                <div className="space-y-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                      <GitFork size={14} />
                      <span>Direct Manager <span className="text-error">*</span></span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      Solid Saffron Line
                    </span>
                  </div>

                  <div className="relative" ref={managerDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsManagerDropdownOpen(!isManagerDropdownOpen)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low border rounded-xl text-left transition-all cursor-pointer ${
                        errorMessage && errorMessage.includes('Cannot assign this manager')
                          ? 'border-error ring-1 ring-error/30'
                          : 'border-outline-variant/50 hover:border-primary'
                      }`}
                    >
                      {selectedManager ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={selectedManager.avatar || AVATAR_PRESETS[0]} 
                            alt={selectedManager.name} 
                            className="w-7 h-7 rounded-lg object-cover border"
                          />
                          <div className="min-w-0">
                            <p className="font-sans text-xs font-bold text-on-surface truncate">
                              {selectedManager.name}
                            </p>
                            <p className="font-sans text-[10px] text-primary truncate">
                              {selectedManager.role} ({selectedManager.department})
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="text-xs font-semibold">None (Top Apex Leader / Dharmadhikari)</span>
                        </div>
                      )}
                      <ChevronDown size={16} className={`text-on-surface-variant transition-transform ${isManagerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {errorMessage && errorMessage.includes('Cannot assign this manager') && (
                      <p className="mt-2 text-xs font-bold text-error flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                        <AlertCircle size={14} className="shrink-0 text-error" />
                        <span>{errorMessage}</span>
                      </p>
                    )}

                    {/* Combobox Dropdown */}
                    {isManagerDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl z-50 overflow-hidden animate-[slideDown_0.2s_ease-out]">
                        <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low/60 flex items-center gap-2">
                          <Search size={14} className="text-on-surface-variant" />
                          <input
                            type="text"
                            value={managerSearchQuery}
                            onChange={(e) => setManagerSearchQuery(e.target.value)}
                            placeholder="Search direct manager by name or role..."
                            className="w-full bg-transparent text-xs focus:outline-none placeholder:text-on-surface-variant/50"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 hide-scrollbar">
                          {/* Top leader / None option */}
                          <button
                            type="button"
                            onClick={() => {
                              setReportsTo(null);
                              setIsManagerDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                              reportsTo === null ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container text-on-surface'
                            }`}
                          >
                            <span className="font-sans text-xs">None (Top Apex Leader / Dharmadhikari)</span>
                            {reportsTo === null && <Check size={14} className="text-primary" />}
                          </button>

                          {filteredManagers.map((mgr) => {
                            const isSelected = reportsTo === mgr.id;
                            return (
                              <button
                                key={mgr.id}
                                type="button"
                                onClick={() => {
                                  setReportsTo(mgr.id);
                                  setSecondaryReports(prev => prev.filter(id => id !== mgr.id));
                                  setIsManagerDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container text-on-surface'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img src={mgr.avatar || AVATAR_PRESETS[0]} alt={mgr.name} className="w-7 h-7 rounded-lg object-cover border" />
                                  <div className="min-w-0">
                                    <p className="font-sans text-xs font-bold truncate">{mgr.name}</p>
                                    <p className="font-sans text-[10px] text-on-surface-variant opacity-80 truncate">{mgr.role} • {mgr.department}</p>
                                  </div>
                                </div>
                                {isSelected && <Check size={14} className="text-primary" />}
                              </button>
                            );
                          })}

                          {filteredManagers.length === 0 && (
                            <p className="p-3 text-center text-xs text-on-surface-variant font-medium">
                              No matching direct managers found.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 4: Also Reports To (Optional) */}
                <div className="space-y-3 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                      <Share2 size={14} className="text-on-surface-variant" />
                      <span>Also Reports To (Optional)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                      Dashed Grey Line
                    </span>
                  </div>

                  <p className="font-sans text-xs text-on-surface-variant">
                    Select any secondary supervisors or cross-functional leads this person also coordinates with.
                  </p>

                  {/* Selected Pills Container */}
                  <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-surface-container-low border border-outline-variant/40 rounded-xl">
                    {secondaryReports.length === 0 && (
                      <span className="text-xs text-on-surface-variant/50 self-center pl-1">
                        No secondary supervisors assigned yet.
                      </span>
                    )}

                    {secondaryReports.map((supId) => {
                      const sup = existingStaffList.find(s => s.id === supId);
                      if (!sup) return null;
                      return (
                        <span
                          key={supId}
                          className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs animate-[fadeIn_0.15s_ease-out]"
                        >
                          <img src={sup.avatar || AVATAR_PRESETS[0]} alt={sup.name} className="w-4 h-4 rounded-full object-cover" />
                          <span>{sup.name}</span>
                          <span className="text-[10px] opacity-75">({sup.role})</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSecondarySupervisor(supId)}
                            className="p-0.5 hover:bg-purple-200 text-purple-800 rounded transition-colors cursor-pointer"
                            title="Remove matrix link"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>

                  {/* Multi-select Picker Dropdown */}
                  <div className="relative" ref={matrixDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMatrixDropdownOpen(!isMatrixDropdownOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-surface-container-lowest border border-purple-200 rounded-xl text-left hover:border-purple-500 transition-all cursor-pointer"
                    >
                      <span className="font-sans text-xs font-semibold text-purple-900">
                        + Add / Select Secondary Matrix Supervisors...
                      </span>
                      <ChevronDown size={16} className={`text-purple-700 transition-transform ${isMatrixDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isMatrixDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-container-lowest border border-purple-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-[slideDown_0.2s_ease-out]">
                        <div className="p-2 border-b border-outline-variant/20 bg-surface-container-low/60 flex items-center gap-2">
                          <Search size={14} className="text-on-surface-variant" />
                          <input
                            type="text"
                            value={matrixSearchQuery}
                            onChange={(e) => setMatrixSearchQuery(e.target.value)}
                            placeholder="Search eligible matrix leads..."
                            className="w-full bg-transparent text-xs focus:outline-none placeholder:text-on-surface-variant/50"
                            autoFocus
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 hide-scrollbar">
                          {filteredMatrixOptions.map((opt) => {
                            const isSelected = secondaryReports.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleToggleSecondarySupervisor(opt.id)}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                                  isSelected ? 'bg-purple-100 text-purple-950 font-bold' : 'hover:bg-surface-container text-on-surface'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img src={opt.avatar || AVATAR_PRESETS[0]} alt={opt.name} className="w-7 h-7 rounded-lg object-cover border" />
                                  <div className="min-w-0">
                                    <p className="font-sans text-xs font-bold truncate">{opt.name}</p>
                                    <p className="font-sans text-[10px] text-on-surface-variant opacity-80 truncate">{opt.role} • {opt.department}</p>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-purple-700 border-purple-700 text-white' : 'border-outline-variant'
                                }`}>
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                              </button>
                            );
                          })}

                          {filteredMatrixOptions.length === 0 && (
                            <p className="p-3 text-center text-xs text-on-surface-variant font-medium">
                              No other eligible matrix leads found.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Field 5: Temple Trust, Office Bearer & Cadre Governance */}
                <div className="space-y-4 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/25">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                      <Landmark size={15} className="text-amber-700" />
                      <span>Temple Governance & Entity Specification</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-900">
                      Trust Board & Cadres
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Trustee Specification Toggle */}
                    <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          <Crown size={14} className="text-amber-600" />
                          <span>Board Trustee?</span>
                        </label>
                        <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/40 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setIsTrustee(false);
                              setTrusteeType('Non-Trustee Staff');
                            }}
                            className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              !isTrustee ? 'bg-surface-container-highest text-on-surface shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTrustee(true);
                              if (trusteeType === 'Non-Trustee Staff') {
                                setTrusteeType('Managing Trustee / Dharmadhikari');
                              }
                            }}
                            className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              isTrustee ? 'bg-amber-600 text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>

                      {isTrustee && (
                        <div className="space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Trustee Classification
                          </label>
                          <select
                            value={trusteeType}
                            onChange={(e) => setTrusteeType(e.target.value as TrusteeType)}
                            className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
                          >
                            <option value="Managing Trustee / Dharmadhikari">Managing Trustee / Dharmadhikari</option>
                            <option value="Hereditary Trustee (Vamshaparamparya)">Hereditary Trustee (Vamshaparamparya)</option>
                            <option value="Endowment / Govt Nominated Trustee">Endowment / Govt Nominated Trustee</option>
                            <option value="Elected Board Trustee">Elected Board Trustee</option>
                            <option value="Advisory Committee Member">Advisory Committee Member</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Office Bearer Specification Toggle */}
                    <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          <Award size={14} className="text-yellow-600" />
                          <span>Office Bearer?</span>
                        </label>
                        <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/40 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOfficeBearer(false);
                              setOfficeBearerRole('None');
                            }}
                            className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              !isOfficeBearer ? 'bg-surface-container-highest text-on-surface shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOfficeBearer(true);
                              if (officeBearerRole === 'None') {
                                setOfficeBearerRole('President / Chairman');
                              }
                            }}
                            className={`px-2.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                              isOfficeBearer ? 'bg-yellow-600 text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>

                      {isOfficeBearer && (
                        <div className="space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                            Office Bearer Designation
                          </label>
                          <select
                            value={officeBearerRole}
                            onChange={(e) => setOfficeBearerRole(e.target.value as OfficeBearerRole)}
                            className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
                          >
                            <option value="President / Chairman">President / Chairman</option>
                            <option value="Vice President">Vice President</option>
                            <option value="General Secretary">General Secretary</option>
                            <option value="Treasurer / Bhandari">Treasurer / Bhandari</option>
                            <option value="Joint Secretary">Joint Secretary</option>
                            <option value="Executive Committee Member">Executive Committee Member</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cadre Rank Level Dropdown */}
                  <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2">
                    <label className="block text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <BookMarked size={14} className="text-primary" />
                      <span>Devasthanam Cadre Rank Level</span>
                    </label>
                    <select
                      value={cadreRank}
                      onChange={(e) => setCadreRank(e.target.value as CadreRank)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Apex Governance & Trust Board">Level 1: Apex Governance & Trust Board (Dharmadhikari / EO / President)</option>
                      <option value="Sanctum & Agama Leadership">Level 2: Sanctum & Agama Leadership (Chief Archaka / Pradhana Acharya)</option>
                      <option value="Departmental Superintendent">Level 3: Departmental Superintendent / CAO (Estate, Seva Desk, Logistics)</option>
                      <option value="Operational Officer & Desk">Level 4: Operational Officer & Front Desk Staff</option>
                      <option value="Sanctum Sevaka & Staff">Level 5: Sanctum Sevaka & Pujari Staff</option>
                      <option value="Voluntary Sevarthi">Level 6: Voluntary Sevarthi & Honorary Member</option>
                    </select>
                  </div>

                  {/* Term & Gazette / Resolution Info */}
                  {(isTrustee || isOfficeBearer) && (
                    <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-2.5 animate-[fadeIn_0.15s_ease-out]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        Tenure Term & Trust Resolution
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">Term Start</label>
                          <input
                            type="date"
                            value={termStart}
                            onChange={(e) => setTermStart(e.target.value)}
                            className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/50 rounded-md text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">Term End</label>
                          <input
                            type="date"
                            value={termEnd}
                            onChange={(e) => setTermEnd(e.target.value)}
                            className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/50 rounded-md text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-on-surface-variant mb-0.5">Resolution / Gazette No.</label>
                          <input
                            type="text"
                            value={resolutionNo}
                            onChange={(e) => setResolutionNo(e.target.value)}
                            placeholder="e.g. TR-2026/04"
                            className="w-full px-2 py-1 bg-surface-container-low border border-outline-variant/50 rounded-md text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field 6: Profile Photo, Status & Contact Details */}
                <div className="space-y-4 bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                    <Camera size={14} />
                    <span>Profile Details & Contact</span>
                  </div>

                  {/* Avatar Preset Grid */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Select Avatar Icon / Photo
                    </label>
                    <div className="grid grid-cols-5 gap-2.5">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(preset)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                            avatar === preset ? 'border-primary ring-2 ring-primary/30 scale-95 shadow-md' : 'border-outline-variant/40 hover:border-primary/50'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          {avatar === preset && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <span className="bg-primary text-on-primary rounded-full p-0.5">
                                <Check size={10} strokeWidth={3} />
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {(['Active', 'Duty-Assign', 'On Leave'] as StaffStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          status === st 
                            ? 'bg-primary text-on-primary border-primary shadow-sm' 
                            : 'bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Phone & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98450 00000"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                        Sanctum / Wing Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Moolasthanam / Block A"
                        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                      Key Sacred & Administrative Duties
                    </label>
                    <textarea
                      rows={2}
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      placeholder="e.g. Temple abhishekam, prasadam preparation oversight, devotee seva queuing..."
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs font-medium focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </div>

                {/* Step 1 Footer Action */}
                <div className="sticky bottom-0 pt-4 pb-2 bg-surface-container-lowest border-t divider-gold flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container border border-outline-variant/40 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim()) {
                        setErrorMessage('Please enter the Staff / Archaka Full Name.');
                        return;
                      }
                      if (!role.trim()) {
                        setErrorMessage('Please enter their Traditional Title / Sacred Designation.');
                        return;
                      }
                      setErrorMessage('');
                      setWizardStep(2);
                    }}
                    className="px-6 py-2.5 bg-primary hover:bg-[#7a4300] text-on-primary rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                  >
                    <span>Next: Configure Access Rights</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: APP ACCESS RIGHTS (Decoupled Granular Permissions)                 */}
            {/* ========================================================================= */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                
                {/* Step 2 Header Card */}
                <div className="bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent p-4 rounded-2xl border border-primary/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                      <ShieldCheck size={16} className="text-primary" />
                      <span>Step 2: App Access Rights Configuration</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary text-on-primary shadow-2xs">
                      {permissions.includes('SUPER_ADMIN')
                        ? 'Super Admin Override'
                        : `${permissions.filter(p => p !== 'SUPER_ADMIN').length} / ${ALL_PERMISSIONS.filter(p => p !== 'SUPER_ADMIN').length} Enabled`}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-on-surface font-semibold">
                    Configuring software capabilities for <span className="text-primary font-bold">{name || 'Staff Member'}</span> ({role || 'Ceremonial Title'})
                  </p>
                  <p className="font-sans text-[11px] text-on-surface-variant">
                    Decouple traditional titles from software permissions. Toggle the specific operational actions this person is authorized to perform in the system.
                  </p>
                </div>

                {/* Quick Designation Presets Toolbar */}
                <div className="space-y-2 bg-surface-container/30 p-3.5 rounded-2xl border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Designation Templates:
                      </label>
                      <span className="text-[9px] font-mono text-primary font-bold">
                        ({rolePresets.length} Available)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingPreset(!isCreatingPreset);
                          if (!isCreatingPreset) {
                            setNewPresetName(role || name ? `${role || name} Template` : 'Custom Access Template');
                            setNewPresetDept(department);
                            setNewPresetDesc(responsibilities || `Configured with ${permissions.length} granular capabilities.`);
                          }
                        }}
                        className="text-[10px] font-bold text-primary hover:text-[#7a4300] flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-all cursor-pointer shadow-2xs"
                        title="Save the currently selected toggles as a reusable preset"
                      >
                        <Plus size={12} />
                        <span>{isCreatingPreset ? 'Cancel Creation' : '+ Save Current as Preset'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('CLEAR')}
                        className="text-[10px] font-bold text-error hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Preset Success Alert */}
                  {presetSuccessMsg && (
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                      <Check size={13} className="text-emerald-700" />
                      <span>{presetSuccessMsg}</span>
                    </div>
                  )}

                  {/* Dynamic Preset Creation Form Card */}
                  {isCreatingPreset && (
                    <div className="p-3.5 bg-surface-container-lowest border-2 border-primary/40 rounded-xl shadow-md space-y-3 animate-[slideDown_0.2s_ease-out]">
                      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                          <BookmarkPlus size={14} />
                          <span>Save Custom Access Rights Preset</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {permissions.length} Capabilities
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                            Preset Template Name *
                          </label>
                          <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="e.g. Senior Archaka Access"
                            className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                            Primary Department
                          </label>
                          <select
                            value={newPresetDept}
                            onChange={(e) => setNewPresetDept(e.target.value as DepartmentType)}
                            className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
                          >
                            <option value="Spiritual">Spiritual / Dharmic</option>
                            <option value="Admin">Administration</option>
                            <option value="Operations">Operations & Security</option>
                            <option value="Finance">Treasury & Accounts</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCreatingPreset(false)}
                          className="px-3 py-1 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCurrentAsPreset}
                          className="px-4 py-1.5 bg-primary hover:bg-[#7a4300] text-on-primary rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={13} />
                          <span>Save Preset</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {rolePresets.map((tpl) => {
                      const isCustom = tpl.isCustom;
                      const isSuper = tpl.id === 'SUPER_ADMIN';
                      
                      let bgClass = 'bg-surface-container-low text-on-surface border-outline-variant/40 hover:bg-surface-container';
                      if (isSuper) {
                        bgClass = 'bg-primary text-on-primary hover:bg-[#7a4300] shadow-xs';
                      } else if (tpl.department === 'Spiritual') {
                        bgClass = 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
                      } else if (tpl.department === 'Admin') {
                        bgClass = 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200';
                      } else if (tpl.department === 'Operations') {
                        bgClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200';
                      } else if (tpl.department === 'Finance') {
                        bgClass = 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200';
                      }

                      if (isCustom) {
                        bgClass = 'bg-purple-100 text-purple-950 border-purple-300 hover:bg-purple-200 ring-1 ring-purple-400/40';
                      }

                      return (
                        <div
                          key={tpl.id || tpl.name}
                          className={`group inline-flex items-center rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${bgClass}`}
                          title={`${tpl.description || tpl.name} (${tpl.permissions.length} capabilities)`}
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(tpl)}
                            className="px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                          >
                            {isSuper && <Sparkles size={11} />}
                            <span>{tpl.name}</span>
                            {isCustom && (
                              <span className="text-[9px] bg-purple-700 text-white px-1 py-0.2 rounded font-extrabold ml-0.5 uppercase tracking-wide">
                                Custom
                              </span>
                            )}
                          </button>

                          {isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomPreset(e, tpl.id!, tpl.name)}
                              className="pr-1.5 pl-0.5 text-purple-700 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete custom preset"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plain-English Categorized Toggle Switches Grid */}
                <div className="space-y-4">
                  {PLAIN_ENGLISH_CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const grantedCount = cat.keys.filter(k => permissions.includes(k)).length;
                    const allCatSelected = cat.keys.length > 0 && cat.keys.every(k => permissions.includes(k));

                    return (
                      <div 
                        key={cat.id}
                        className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs"
                      >
                        {/* Category Header */}
                        <div className="px-4 py-3 bg-surface-container-low/70 border-b border-outline-variant/20 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                              <CatIcon size={15} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-serif text-xs font-bold text-on-surface truncate">{cat.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                                  {grantedCount} / {cat.keys.length} Enabled
                                </span>
                              </div>
                              <p className="font-sans text-[10px] text-on-surface-variant truncate">
                                {cat.description}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (allCatSelected) {
                                setPermissions(prev => prev.filter(k => !cat.keys.includes(k)));
                              } else {
                                setPermissions(prev => Array.from(new Set([...prev, ...cat.keys])));
                              }
                            }}
                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer shrink-0 ml-2"
                          >
                            {allCatSelected ? 'Disable All' : 'Enable All'}
                          </button>
                        </div>

                        {/* Plain English Toggle Grid */}
                        <div className="p-3 grid grid-cols-1 gap-2.5">
                          {cat.keys.map((key) => {
                            const isGranted = permissions.includes(key);
                            const toggleInfo = PLAIN_ENGLISH_TOGGLES[key] || {
                              title: key,
                              subtitle: PERMISSION_REGISTRY[key]?.description || ''
                            };

                            return (
                              <div
                                key={key}
                                onClick={() => handleTogglePermission(key)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                  isGranted 
                                    ? 'bg-amber-50/70 border-primary/40 shadow-xs' 
                                    : 'bg-surface-container-low/30 border-outline-variant/20 hover:bg-surface-container-low/60 hover:border-outline-variant/40'
                                }`}
                              >
                                <div className="min-w-0 pr-3">
                                  <p className={`font-sans text-xs font-bold leading-tight ${
                                    isGranted ? 'text-on-surface' : 'text-on-surface/80'
                                  }`}>
                                    {toggleInfo.title}
                                  </p>
                                  <p className="font-sans text-[10px] text-on-surface-variant leading-snug mt-0.5">
                                    {toggleInfo.subtitle}
                                  </p>
                                </div>

                                {/* Modern Switch Toggle */}
                                <div className="shrink-0">
                                  <div
                                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                                      isGranted ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant/40'
                                    }`}
                                  >
                                    <div 
                                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 transform ${
                                        isGranted ? 'translate-x-5' : 'translate-x-0'
                                      }`} 
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step 2 Footer Actions */}
                <div className="sticky bottom-0 pt-4 pb-2 bg-surface-container-lowest border-t divider-gold flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setWizardStep(1);
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container border border-outline-variant/40 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Official Identity</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary hover:bg-[#7a4300] text-on-primary rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>{isSubmitting ? 'Saving Profile...' : (editingStaff ? 'Update Staff Member' : 'Save to Org Chart')}</span>
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>
      </div>
    </div>
  );
}
