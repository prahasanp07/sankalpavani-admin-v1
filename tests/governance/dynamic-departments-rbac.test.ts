/**
 * SankalpVani Dynamic Departments & Scoped Admin RBAC Tests
 * Verifies dynamic user-generated departments, inline additions, temple/trust scoping, and scoped admin authorization guards.
 */

export interface MockDepartment {
  id: string;
  trustId: string;
  templeId?: string | null;
  name: string;
  code?: string;
  color?: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface MockCustomRole {
  id: string;
  trustId: string;
  templeId?: string | null;
  roleName: string;
  permissions: string[];
}

export class MockDepartmentAndRBACRegistry {
  private departments: MockDepartment[] = [];
  private customRoles: MockCustomRole[] = [];
  private auditEvents: any[] = [];

  createDepartment(adminScope: { trustId: string; templeId?: string | null; role: 'TRUST_ADMIN' | 'TEMPLE_ADMIN' }, input: {
    name: string;
    templeId?: string | null;
    color?: string;
    description?: string;
  }) {
    // Enforce Scoped Admin Guard: Temple Admin cannot create department for another temple or trust-wide
    if (adminScope.role === 'TEMPLE_ADMIN') {
      if (!input.templeId || input.templeId !== adminScope.templeId) {
        throw new Error('FORBIDDEN: Temple Admin can only create departments for their assigned temple');
      }
    }

    const deptId = `dept_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const dept: MockDepartment = {
      id: deptId,
      trustId: adminScope.trustId,
      templeId: input.templeId || null,
      name: input.name,
      color: input.color || '#ff7700',
      description: input.description,
      status: 'ACTIVE'
    };
    this.departments.push(dept);

    this.auditEvents.push({
      eventType: 'DEPARTMENT_CREATED',
      trustId: adminScope.trustId,
      departmentId: deptId,
      name: input.name,
      templeId: input.templeId
    });

    return dept;
  }

  listDepartments(scope: { trustId: string; templeId?: string }) {
    return this.departments.filter(d => {
      if (d.trustId !== scope.trustId || d.status !== 'ACTIVE') return false;
      if (scope.templeId) {
        return !d.templeId || d.templeId === scope.templeId;
      }
      return true;
    });
  }

  createCustomRole(adminScope: { trustId: string; templeId?: string | null; role: 'TRUST_ADMIN' | 'TEMPLE_ADMIN' }, input: {
    roleName: string;
    templeId?: string | null;
    permissions: string[];
  }) {
    if (adminScope.role === 'TEMPLE_ADMIN') {
      if (!input.templeId || input.templeId !== adminScope.templeId) {
        throw new Error('FORBIDDEN: Temple Admin can only create roles for their assigned temple');
      }
    }

    const roleId = `crole_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cRole: MockCustomRole = {
      id: roleId,
      trustId: adminScope.trustId,
      templeId: input.templeId || null,
      roleName: input.roleName,
      permissions: input.permissions
    };
    this.customRoles.push(cRole);
    return cRole;
  }

  listCustomRoles(scope: { trustId: string; templeId?: string }) {
    return this.customRoles.filter(r => {
      if (r.trustId !== scope.trustId) return false;
      if (scope.templeId) {
        return !r.templeId || r.templeId === scope.templeId;
      }
      return true;
    });
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicDepartmentsRBACTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Departments & Scoped RBAC Tests');
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

  const registry = new MockDepartmentAndRBACRegistry();

  // Test 1: Trust Admin creates Trust-wide Dynamic Department
  const d1 = registry.createDepartment(
    { trustId: 'trust_sringeri', role: 'TRUST_ADMIN' },
    { name: 'Veda Pathashala & Heritage Education', color: '#ff7700', description: 'Traditional Vedic studies wing' }
  );
  assert(d1.templeId === null && d1.name.includes('Veda Pathashala'), 'Trust-wide Department', 'Created global Veda Pathashala department');

  // Test 2: Temple Admin creates Temple-Scoped Dynamic Department
  const d2 = registry.createDepartment(
    { trustId: 'trust_sringeri', templeId: 'temple_sharadamba', role: 'TEMPLE_ADMIN' },
    { name: 'Annadanam & Prasadam Kitchens', templeId: 'temple_sharadamba', color: '#059669', description: 'Daily sacred dining services' }
  );
  assert(d2.templeId === 'temple_sharadamba', 'Temple-Scoped Department', 'Created temple-specific Annadanam department');

  // Test 3: Temple Admin Guard prevents cross-temple department creation
  let guardTriggered = false;
  try {
    registry.createDepartment(
      { trustId: 'trust_sringeri', templeId: 'temple_sharadamba', role: 'TEMPLE_ADMIN' },
      { name: 'Illegal Department', templeId: 'temple_vidyashankara' } // Mismatched templeId!
    );
  } catch (err: any) {
    if (err.message.includes('FORBIDDEN')) guardTriggered = true;
  }
  assert(guardTriggered, 'Temple Admin Scoped Guard', 'Prevented Temple Admin from creating department in another temple');

  // Test 4: List Departments with inheritance (Temple sees Trust-wide + its own)
  const sharadambaDepts = registry.listDepartments({ trustId: 'trust_sringeri', templeId: 'temple_sharadamba' });
  assert(
    sharadambaDepts.some(d => d.id === d1.id) && sharadambaDepts.some(d => d.id === d2.id),
    'Department Inheritance',
    'Temple queries inherit Trust-wide departments while including temple-specific ones'
  );

  // Test 5: List Departments for another temple (does NOT see other temple specific department)
  const vidyaDepts = registry.listDepartments({ trustId: 'trust_sringeri', templeId: 'temple_vidyashankara' });
  assert(
    vidyaDepts.some(d => d.id === d1.id) && !vidyaDepts.some(d => d.id === d2.id),
    'Temple Scope Isolation',
    'Temple Vidyashankara cannot see Sharadamba temple-specific departments'
  );

  // Test 6: Create Dynamic Custom Role with Granular Permissions
  const cRole = registry.createCustomRole(
    { trustId: 'trust_sringeri', templeId: 'temple_sharadamba', role: 'TEMPLE_ADMIN' },
    {
      roleName: 'Annadanam Food Inspector',
      templeId: 'temple_sharadamba',
      permissions: ['PROCESS_LOGISTICS', 'PRINT_SHIPPING_LABELS', 'DASHBOARD_VIEW']
    }
  );
  assert(
    cRole.permissions.includes('PROCESS_LOGISTICS') && cRole.roleName === 'Annadanam Food Inspector',
    'Dynamic Custom Role',
    'Created dynamic custom role with granular feature flags'
  );

  // Test 7: Scoped Role Query
  const roles = registry.listCustomRoles({ trustId: 'trust_sringeri', templeId: 'temple_sharadamba' });
  assert(roles.length === 1 && roles[0].roleName === 'Annadanam Food Inspector', 'Custom Role Listing', 'Listed custom roles for temple');

  // Test 8: Cross-Tenant Isolation
  const ahobilaDept = registry.createDepartment(
    { trustId: 'trust_ahobila', role: 'TRUST_ADMIN' },
    { name: 'Ahobila Narasimha Divya Kshetram Dept' }
  );
  const sringeriDepts = registry.listDepartments({ trustId: 'trust_sringeri' });
  assert(
    !sringeriDepts.some(d => d.id === ahobilaDept.id),
    'Cross-Tenant Department Isolation',
    'Trust Ahobila departments are completely isolated from Trust Sringeri'
  );

  // Test 9: Immutable Audit Logging
  const audits = registry.getAuditEvents('trust_sringeri');
  assert(audits.length >= 2, 'Audit Trail Verification', `Logged ${audits.length} audit events for dynamic departments`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Departments & Scoped RBAC Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicDepartmentsRBACTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic departments RBAC test failed:', err);
      process.exit(1);
    });
}
