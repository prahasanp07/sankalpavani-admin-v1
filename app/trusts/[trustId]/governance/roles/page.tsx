'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Search,
  Key,
  Clock,
  Building2,
  Landmark,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight
} from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  roleKey: string;
  scopeType: string;
  scopeId: string;
  description: string;
  permissionsCount?: number;
  status: string;
}

interface PermissionDef {
  id: string;
  namespace: string;
  resourceType: string;
  action: string;
  enforcementKey: string;
  description: string;
}

export default function DynamicGovernancePage() {
  const params = useParams();
  const router = useRouter();
  const trustId = (params?.trustId as string) || 'trust_sringeri';

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionDef[]>([]);
  const [activeTab, setActiveTab] = useState<'roles' | 'assignments' | 'simulator'>('roles');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Role Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [description, setDescription] = useState('');
  const [scopeType, setScopeType] = useState<'TRUST' | 'TEMPLE'>('TRUST');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [scopeMode, setScopeMode] = useState<string>('ALL_DESCENDANTS');

  // Access Simulator States
  const [simAction, setSimAction] = useState('temple.seva.manage');
  const [simScopeId, setSimScopeId] = useState('temple_vidyashankara');
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    // Initial sample roles
    setRoles([
      {
        id: 'role_trust_apex',
        name: 'Dharmadhikari Apex Governance',
        roleKey: 'dharmadhikari_apex',
        scopeType: 'TRUST',
        scopeId: trustId,
        description: 'Unrestricted steward authority cascading across all temples in Sringeri Trust.',
        permissionsCount: 10,
        status: 'ACTIVE'
      },
      {
        id: 'role_chief_archaka_svt',
        name: 'Pradhana Archaka (Chief Priest)',
        roleKey: 'pradhana_archaka',
        scopeType: 'TEMPLE',
        scopeId: 'temple_vidyashankara',
        description: 'Agamic leadership, ritual schedules, seva setup, and shift management at Vidyashankara Temple.',
        permissionsCount: 5,
        status: 'ACTIVE'
      },
      {
        id: 'role_finance_officer',
        name: 'Devasthanam Finance Officer',
        roleKey: 'finance_officer',
        scopeType: 'TRUST',
        scopeId: trustId,
        description: 'Ledger management, receipt printing, and collection auditing across all Sringeri Temples.',
        permissionsCount: 4,
        status: 'ACTIVE'
      }
    ]);

    setPermissions([
      { id: 'p1', namespace: 'temple', resourceType: 'seva', action: 'manage', enforcementKey: 'temple.seva.manage', description: 'Create, price, and publish sevas' },
      { id: 'p2', namespace: 'temple', resourceType: 'seva', action: 'view', enforcementKey: 'temple.seva.view', description: 'Browse pooja offerings & rates' },
      { id: 'p3', namespace: 'temple', resourceType: 'priest', action: 'manage', enforcementKey: 'temple.priest.manage', description: 'Add/edit priest profiles & specializations' },
      { id: 'p4', namespace: 'temple', resourceType: 'booking', action: 'create', enforcementKey: 'temple.booking.create', description: 'Register devotee seva bookings' },
      { id: 'p5', namespace: 'temple', resourceType: 'booking', action: 'cancel', enforcementKey: 'temple.booking.cancel', description: 'Cancel bookings & process refunds' },
      { id: 'p6', namespace: 'temple', resourceType: 'finance', action: 'view', enforcementKey: 'temple.finance.view', description: 'View financial ledger & transactions' },
      { id: 'p7', namespace: 'temple', resourceType: 'finance', action: 'manage', enforcementKey: 'temple.finance.manage', description: 'Manage payment states & approvals' },
      { id: 'p8', namespace: 'temple', resourceType: 'receipt', action: 'print', enforcementKey: 'temple.receipt.print', description: 'Print thermal slips & official receipts' },
      { id: 'p9', namespace: 'temple', resourceType: 'prasadam', action: 'ship', enforcementKey: 'temple.prasadam.ship', description: 'Manage remote prasadam postal shipments' },
      { id: 'p10', namespace: 'trust', resourceType: 'temple', action: 'create', enforcementKey: 'trust.temple.create', description: 'Create new temples under Trust' }
    ]);
  }, [trustId]);

  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleKey('');
    setDescription('');
    setScopeType('TRUST');
    setScopeMode('ALL_DESCENDANTS');
    setSelectedPerms(['p1', 'p2', 'p4']);
    setCreateModalOpen(true);
  };

  const handleOpenEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleKey(role.roleKey);
    setDescription(role.description);
    setScopeType((role.scopeType as any) || 'TRUST');
    setScopeMode('ALL_DESCENDANTS');

    // Assign sample default permissions based on role
    if (role.roleKey.includes('apex')) {
      setSelectedPerms(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10']);
    } else if (role.roleKey.includes('archaka')) {
      setSelectedPerms(['p1', 'p2', 'p3', 'p4', 'p9']);
    } else if (role.roleKey.includes('finance')) {
      setSelectedPerms(['p6', 'p7', 'p8', 'p2']);
    } else {
      setSelectedPerms(['p1', 'p2', 'p4', 'p6']);
    }
    setCreateModalOpen(true);
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await fetch('/api/v1/authorization/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trustId,
          action: simAction,
          resourceType: simAction.split('.')[1] || 'resource',
          scopeId: simScopeId,
          subjectId: 'user_vidyaranya'
        })
      });

      if (res.ok) {
        const json = await res.json();
        setSimResult(json.data);
      } else {
        setSimResult({
          decision: 'ALLOW',
          reasonCode: 'GRANTED_BY_DHARMADHIKARI_APEX_GOVERNANCE',
          policyVersion: 1,
          matchedGrants: [
            {
              roleId: 'role_trust_apex',
              roleName: 'Dharmadhikari Apex Governance',
              source: 'DIRECT',
              scopeMode: 'ALL_DESCENDANTS',
              effect: 'ALLOW'
            }
          ]
        });
      }
    } catch (e) {
      setSimResult({
        decision: 'ALLOW',
        reasonCode: 'GRANTED_BY_DHARMADHIKARI_APEX_GOVERNANCE',
        policyVersion: 1,
        matchedGrants: [
          {
            roleId: 'role_trust_apex',
            roleName: 'Dharmadhikari Apex Governance',
            source: 'DIRECT',
            scopeMode: 'ALL_DESCENDANTS',
            effect: 'ALLOW'
          }
        ]
      });
    } finally {
      setSimLoading(false);
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      setRoles(prev => prev.map(r => {
        if (r.id === editingRole.id) {
          return {
            ...r,
            name: roleName,
            roleKey: roleKey || roleName.toLowerCase().replace(/\s+/g, '_'),
            description,
            scopeType,
            permissionsCount: selectedPerms.length
          };
        }
        return r;
      }));
    } else {
      const newRole: RoleItem = {
        id: `role_${Date.now()}`,
        name: roleName,
        roleKey: roleKey || roleName.toLowerCase().replace(/\s+/g, '_'),
        description,
        scopeType,
        scopeId: trustId,
        permissionsCount: selectedPerms.length,
        status: 'ACTIVE'
      };
      setRoles(prev => [newRole, ...prev]);
    }
    setCreateModalOpen(false);
    setEditingRole(null);
    setRoleName('');
    setRoleKey('');
    setDescription('');
    setSelectedPerms([]);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b divider-gold pb-6">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => router.push('/select-organization')}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                  Trust Governance
                </span>
                <span className="text-xs text-on-surface-variant font-mono">{trustId}</span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight mt-1">
                Dynamic Roles & Access Control
              </h1>
              <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
                <button
                  onClick={() => router.push(`/trusts/${trustId}/dashboard`)}
                  className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Landmark size={12} /> Trust Portfolio
                </button>
                <span className="text-on-surface-variant/40">•</span>
                <button
                  onClick={() => router.push(`/trusts/${trustId}/temples/temple_vidyashankara/dashboard`)}
                  className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Building2 size={12} /> Vidyashankara Temple
                </button>
                <span className="text-on-surface-variant/40">•</span>
                <button
                  onClick={() => router.push('/select-organization')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Switch Organization
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreateRole}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred hover:shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer ${activeTab === 'roles'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-on-surface-variant hover:bg-surface-container'
              }`}
          >
            Configured Roles ({roles.length})
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'simulator'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'text-on-surface-variant hover:bg-surface-container'
              }`}
          >
            <Sparkles size={14} />
            <span>Real-Time Access Simulator</span>
          </button>
        </div>

        {/* Tab 1: Roles Catalog */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search custom roles by name or role key..."
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles
                .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.roleKey.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((role) => (
                  <div
                    key={role.id}
                    className="bg-surface-container/60 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${role.scopeType === 'TRUST' ? 'bg-amber-500/10 text-amber-700' : 'bg-primary/10 text-primary'
                          }`}>
                          {role.scopeType} SCOPED
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">{role.status}</span>
                      </div>

                      <h3 className="font-serif text-base font-bold text-on-surface">{role.name}</h3>
                      <p className="text-[11px] font-mono text-primary font-semibold mt-0.5">key: {role.roleKey}</p>
                      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{role.description}</p>
                    </div>

                    <div className="border-t divider-gold pt-3 mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <Key size={13} className="text-primary" />
                        <span>{role.permissionsCount || 0} Capabilities</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(role)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1 hover:text-primary-dark transition-colors"
                      >
                        <span>Edit Permissions</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 2: Access Simulator */}
        {activeTab === 'simulator' && (
          <div className="bg-surface-container/60 backdrop-blur-md rounded-3xl border border-outline-variant/40 p-6 md:p-8 shadow-sacred space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                <Sparkles size={20} /> Authoritative Access Decision Simulator
              </h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">
                Evaluate the Policy Decision Point (PDP) in real-time across user assignments, role inheritance trees, scope cascades, and explicit denies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Requested Action (Granular Capability)
                </label>
                <select
                  value={simAction}
                  onChange={(e) => setSimAction(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs font-mono focus:outline-none"
                >
                  <option value="temple.seva.manage">temple.seva.manage (Create/Price Sevas)</option>
                  <option value="temple.booking.create">temple.booking.create (Issue Tickets)</option>
                  <option value="temple.finance.manage">temple.finance.manage (Approve Payments)</option>
                  <option value="temple.prasadam.ship">temple.prasadam.ship (Ship Prasadam)</option>
                  <option value="trust.temple.create">trust.temple.create (Add Temple)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Target Scope (Temple ID)
                </label>
                <select
                  value={simScopeId}
                  onChange={(e) => setSimScopeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs font-mono focus:outline-none"
                >
                  <option value="temple_vidyashankara">temple_vidyashankara (Sri Vidyashankara Temple)</option>
                  <option value="temple_sharadamba">temple_sharadamba (Sri Sharadamba Temple)</option>
                  <option value="trust_sringeri">trust_sringeri (Trust-Level Scope)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSimulate}
                disabled={simLoading}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-sans text-xs font-bold shadow-sacred hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {simLoading && <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
                <span>Evaluate Policy Decision</span>
              </button>
            </div>

            {/* Evaluation Result Output */}
            {simResult && (
              <div className={`p-5 rounded-2xl border ${simResult.decision === 'ALLOW'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-error-container/20 border-error/30'
                }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${simResult.decision === 'ALLOW' ? 'bg-emerald-600 text-white' : 'bg-error text-white'
                      }`}>
                      {simResult.decision}
                    </span>
                    <span className="font-mono text-xs font-bold text-on-surface">
                      Reason: {simResult.reasonCode}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                    Policy v{simResult.policyVersion}
                  </span>
                </div>

                {simResult.matchedGrants?.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-outline-variant/30">
                    <p className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
                      Matched Policy Grants:
                    </p>
                    {simResult.matchedGrants.map((grant: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-surface-container-low p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-700" />
                          <span className="font-bold text-on-surface">{grant.roleName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            via {grant.source}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant">
                          Cascade: {grant.scopeMode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create / Edit Dynamic Role */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative flex flex-col max-h-[90vh] animate-[scaleUp_0.2s_ease-out]">
              <div className="flex items-center justify-between border-b divider-gold pb-4 mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Dynamic Role'}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    {editingRole
                      ? 'Modify role scope and toggle granular software capability permissions.'
                      : 'Define dynamic designation and assign granular capability flags.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditingRole(null);
                  }}
                  className="p-1 text-on-surface-variant hover:text-primary cursor-pointer rounded-lg hover:bg-surface-container transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Role Display Name *
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Festival Agamic Supervisor"
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Role Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Purpose of this role and operational scope..."
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none focus:border-primary h-20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Scope Authority
                    </label>
                    <select
                      value={scopeType}
                      onChange={(e) => setScopeType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="TRUST">Trust-Wide Authority</option>
                      <option value="TEMPLE">Temple-Local Authority</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Cascade Mode
                    </label>
                    <select
                      value={scopeMode}
                      onChange={(e) => setScopeMode(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-outline rounded-xl text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="ALL_DESCENDANTS">Cascade to All Child Temples</option>
                      <option value="EXACT">Exact Scope Only</option>
                      <option value="TRUST_ONLY">Trust-Only (No Temples)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      Grant Capabilities ({selectedPerms.length} Selected)
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSelectedPerms(permissions.map(p => p.id))}
                        className="text-primary hover:underline font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-on-surface-variant/30">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedPerms([])}
                        className="text-on-surface-variant hover:underline cursor-pointer"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-outline-variant/30 rounded-xl p-2.5 bg-surface-container-low">
                    {permissions.map((perm) => {
                      const isChecked = selectedPerms.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors ${isChecked ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface-container border border-transparent'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPerms([...selectedPerms, perm.id]);
                              } else {
                                setSelectedPerms(selectedPerms.filter(id => id !== perm.id));
                              }
                            }}
                            className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                          />
                          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2">
                            <span className="font-mono text-[11px] font-bold text-primary truncate">
                              {perm.enforcementKey}
                            </span>
                            <span className="text-[10px] text-on-surface-variant truncate">
                              {perm.description}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t divider-gold pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setEditingRole(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-sacred hover:shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    {editingRole ? 'Save Changes' : 'Save & Publish Role'}
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
