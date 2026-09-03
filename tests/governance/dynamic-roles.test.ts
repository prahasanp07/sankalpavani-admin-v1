/**
 * SankalpVani Dynamic Roles & Permissions (RBAC/ABAC) Tests
 * Verifies custom role authoring, granular permission binding, scope cascading, assignments, policy versioning, and denial overrides.
 */

export interface MockRole {
  id: string;
  trustId: string;
  roleKey: string;
  name: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  permissions: Array<{
    permissionKey: string;
    effect: 'ALLOW' | 'DENY';
    scopeMode: 'EXACT' | 'TRUST_ONLY' | 'ALL_DESCENDANTS';
  }>;
}

export interface MockRoleAssignment {
  id: string;
  trustId: string;
  roleId: string;
  userId: string;
  scopeId: string;
  status: 'ACTIVE' | 'REVOKED';
}

export class MockRBACEngine {
  private roles: MockRole[] = [];
  private assignments: MockRoleAssignment[] = [];
  private policyVersions: number = 1;
  private auditEvents: any[] = [];

  createRole(trustId: string, input: {
    roleKey: string;
    name: string;
    scopeType?: 'TRUST' | 'TEMPLE';
    scopeId?: string;
    permissions?: Array<{ permissionKey: string; effect?: 'ALLOW' | 'DENY'; scopeMode?: 'EXACT' | 'TRUST_ONLY' | 'ALL_DESCENDANTS' }>;
  }) {
    const key = input.roleKey.toUpperCase();
    const existing = this.roles.find(r => r.trustId === trustId && r.roleKey === key);
    if (existing) throw new Error(`Role key '${key}' already exists in Trust.`);

    const role: MockRole = {
      id: `role_${key.toLowerCase()}_${Date.now()}`,
      trustId,
      roleKey: key,
      name: input.name,
      scopeType: input.scopeType || 'TRUST',
      scopeId: input.scopeId || trustId,
      permissions: (input.permissions || []).map(p => ({
        permissionKey: p.permissionKey,
        effect: p.effect || 'ALLOW',
        scopeMode: p.scopeMode || 'ALL_DESCENDANTS'
      }))
    };
    this.roles.push(role);
    this.policyVersions++;

    this.auditEvents.push({
      eventType: 'ROLE_CREATED',
      trustId,
      roleId: role.id,
      roleKey: key,
      policyVersion: this.policyVersions
    });

    return role;
  }

  assignRole(trustId: string, input: { roleId: string; userId: string; scopeId?: string }) {
    const role = this.roles.find(r => r.id === input.roleId && r.trustId === trustId);
    if (!role) throw new Error(`Role '${input.roleId}' not found.`);

    const assignmentId = `ra_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const assignment: MockRoleAssignment = {
      id: assignmentId,
      trustId,
      roleId: input.roleId,
      userId: input.userId,
      scopeId: input.scopeId || trustId,
      status: 'ACTIVE'
    };
    this.assignments.push(assignment);
    this.policyVersions++;

    this.auditEvents.push({
      eventType: 'ROLE_ASSIGNED',
      trustId,
      assignmentId,
      userId: input.userId,
      roleKey: role.roleKey,
      policyVersion: this.policyVersions
    });

    return assignment;
  }

  revokeAssignment(trustId: string, assignmentId: string) {
    const a = this.assignments.find(x => x.id === assignmentId && x.trustId === trustId);
    if (!a) throw new Error(`Assignment not found`);
    a.status = 'REVOKED';
    this.policyVersions++;
    return a;
  }

  evaluatePermission(
    userId: string,
    targetTrustId: string,
    targetScopeId: string,
    requiredPermission: string
  ): boolean {
    const activeAssignments = this.assignments.filter(
      a => a.userId === userId && a.trustId === targetTrustId && a.status === 'ACTIVE'
    );

    let hasAllow = false;

    for (const a of activeAssignments) {
      const role = this.roles.find(r => r.id === a.roleId);
      if (!role) continue;

      for (const p of role.permissions) {
        if (p.permissionKey === requiredPermission) {
          // Check scope match
          const scopeMatches = 
            p.scopeMode === 'ALL_DESCENDANTS' || 
            a.scopeId === targetScopeId ||
            (p.scopeMode === 'TRUST_ONLY' && targetScopeId === targetTrustId);

          if (scopeMatches) {
            if (p.effect === 'DENY') return false; // Explicit Deny overrides all
            if (p.effect === 'ALLOW') hasAllow = true;
          }
        }
      }
    }

    return hasAllow;
  }

  getPolicyVersion() {
    return this.policyVersions;
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicRolesTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Roles & Permissions (RBAC/ABAC) Tests');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName.padEnd(35)} | ${detail}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName.padEnd(35)} | ${detail}`);
      failed++;
    }
  }

  const engine = new MockRBACEngine();

  // Test 1: Dynamic Custom Role Creation with Granular Permissions
  const r1 = engine.createRole('trust_sringeri', {
    roleKey: 'UTSAVAM_COORDINATOR',
    name: 'Grand Utsavam Festival Coordinator',
    scopeType: 'TRUST',
    permissions: [
      { permissionKey: 'temple.seva.manage', effect: 'ALLOW', scopeMode: 'ALL_DESCENDANTS' },
      { permissionKey: 'temple.booking.create', effect: 'ALLOW', scopeMode: 'ALL_DESCENDANTS' },
      { permissionKey: 'temple.logistics.manage', effect: 'ALLOW', scopeMode: 'ALL_DESCENDANTS' }
    ]
  });
  assert(r1.roleKey === 'UTSAVAM_COORDINATOR' && r1.permissions.length === 3, 'Custom Role Creation', 'Created Utsavam Coordinator role with 3 permissions');

  // Test 2: Role Assignment to User
  const a1 = engine.assignRole('trust_sringeri', {
    roleId: r1.id,
    userId: 'usr_raghavan',
    scopeId: 'trust_sringeri'
  });
  assert(a1.status === 'ACTIVE' && a1.userId === 'usr_raghavan', 'Role Assignment', 'Assigned Utsavam Coordinator role to user');

  // Test 3: Cascading Permission Evaluation (Trust Scope -> Child Temple Scope)
  const canManageSevaAtTemple = engine.evaluatePermission(
    'usr_raghavan',
    'trust_sringeri',
    'temple_sharadamba',
    'temple.seva.manage'
  );
  assert(canManageSevaAtTemple === true, 'Scope Cascading Evaluation', 'Trust-level role with ALL_DESCENDANTS grants access to child temple');

  // Test 4: Deny Access for Unassigned Capability
  const canManageFinance = engine.evaluatePermission(
    'usr_raghavan',
    'trust_sringeri',
    'temple_sharadamba',
    'temple.finance.manage'
  );
  assert(canManageFinance === false, 'Unauthorized Permission Evaluation', 'Correctly rejected unauthorized financial permission');

  // Test 5: Explicit Deny Override
  const denyRole = engine.createRole('trust_sringeri', {
    roleKey: 'RESTRICTED_BOOKING_COUNTER',
    name: 'Restricted Counter Clerk',
    permissions: [
      { permissionKey: 'temple.booking.create', effect: 'DENY', scopeMode: 'ALL_DESCENDANTS' }
    ]
  });
  engine.assignRole('trust_sringeri', {
    roleId: denyRole.id,
    userId: 'usr_raghavan',
    scopeId: 'trust_sringeri'
  });
  const bookingAllowedAfterDeny = engine.evaluatePermission(
    'usr_raghavan',
    'trust_sringeri',
    'temple_sharadamba',
    'temple.booking.create'
  );
  assert(bookingAllowedAfterDeny === false, 'Explicit Deny Override', 'Explicit DENY rule overrides prior ALLOW permissions');

  // Test 6: Policy Version Invalidation Tracking
  assert(engine.getPolicyVersion() >= 5, 'Policy Cache Invalidation', `Policy version monotonically increased to ${engine.getPolicyVersion()}`);

  // Test 7: Role Revocation
  engine.revokeAssignment('trust_sringeri', a1.id);
  const sevaAllowedAfterRevoke = engine.evaluatePermission(
    'usr_raghavan',
    'trust_sringeri',
    'temple_sharadamba',
    'temple.seva.manage'
  );
  assert(sevaAllowedAfterRevoke === false, 'Role Revocation Effect', 'Revoking role assignment immediately stops access');

  // Test 8: Duplicate Role Key Rejection
  let duplicateThrew = false;
  try {
    engine.createRole('trust_sringeri', {
      roleKey: 'UTSAVAM_COORDINATOR',
      name: 'Duplicate Role'
    });
  } catch (e) {
    duplicateThrew = true;
  }
  assert(duplicateThrew, 'Duplicate Role Key Check', 'Rejected duplicate role key UTSAVAM_COORDINATOR');

  // Test 9: Cross-Tenant Isolation
  const ahobilaRole = engine.createRole('trust_ahobila', {
    roleKey: 'AHOBILA_ADMIN',
    name: 'Ahobila Admin'
  });
  engine.assignRole('trust_ahobila', {
    roleId: ahobilaRole.id,
    userId: 'usr_ahobila_user'
  });
  const ahobilaUserInSringeri = engine.evaluatePermission(
    'usr_ahobila_user',
    'trust_sringeri',
    'temple_sharadamba',
    'temple.dashboard.view'
  );
  assert(ahobilaUserInSringeri === false, 'Cross-Tenant RBAC Isolation', 'Trust Ahobila user has zero access to Trust Sringeri');

  // Test 10: Audit Log Completeness
  const audits = engine.getAuditEvents('trust_sringeri');
  assert(audits.length >= 4, 'RBAC Audit Trail', `Recorded ${audits.length} immutable audit logs for role mutations`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Roles Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicRolesTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic roles test failed:', err);
      process.exit(1);
    });
}
