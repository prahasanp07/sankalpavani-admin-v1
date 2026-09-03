/**
 * SankalpVani Dynamic Designations & Office Bearers Tests
 * Verifies custom title authoring, scope binding, office-bearer appointments, resolution numbers, role auto-assignments, and cross-tenant isolation.
 */

export interface MockDesignation {
  id: string;
  trustId: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  name: string;
  description?: string;
  roleBinding?: { roleId: string; autoAssign: boolean };
}

export interface MockOfficeBearer {
  id: string;
  trustId: string;
  scopeId: string;
  userId: string;
  designationId: string;
  termStart: string;
  termEnd: string | null;
  resolutionNo?: string;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
}

export class MockDesignationRegistry {
  private designations: MockDesignation[] = [];
  private officeBearers: MockOfficeBearer[] = [];
  private roleAssignments: Array<{ id: string; trustId: string; userId: string; roleId: string; status: 'ACTIVE' | 'REVOKED' }> = [];
  private auditEvents: any[] = [];

  createDesignation(trustId: string, input: {
    name: string;
    scopeType?: 'TRUST' | 'TEMPLE';
    scopeId?: string;
    description?: string;
    roleBinding?: { roleId: string; autoAssign?: boolean };
  }) {
    const desigId = `desig_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const desig: MockDesignation = {
      id: desigId,
      trustId,
      scopeType: input.scopeType || 'TRUST',
      scopeId: input.scopeId || trustId,
      name: input.name,
      description: input.description,
      roleBinding: input.roleBinding ? {
        roleId: input.roleBinding.roleId,
        autoAssign: input.roleBinding.autoAssign !== undefined ? input.roleBinding.autoAssign : true
      } : undefined
    };
    this.designations.push(desig);

    this.auditEvents.push({
      eventType: 'DESIGNATION_CREATED',
      trustId,
      designationId: desigId,
      name: input.name
    });

    return desig;
  }

  appointOfficeBearer(trustId: string, input: {
    userId: string;
    designationId: string;
    scopeId?: string;
    termStart: string;
    termEnd?: string | null;
    resolutionNo?: string;
  }) {
    const desig = this.designations.find(d => d.id === input.designationId && d.trustId === trustId);
    if (!desig) throw new Error(`Designation not found`);

    const appointmentId = `ob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const ob: MockOfficeBearer = {
      id: appointmentId,
      trustId,
      scopeId: input.scopeId || trustId,
      userId: input.userId,
      designationId: input.designationId,
      termStart: input.termStart,
      termEnd: input.termEnd || null,
      resolutionNo: input.resolutionNo,
      appointmentStatus: 'ACTIVE'
    };
    this.officeBearers.push(ob);

    // If designation has roleBinding with autoAssign, grant role assignment
    if (desig.roleBinding?.autoAssign) {
      this.roleAssignments.push({
        id: `ra_ob_${appointmentId}`,
        trustId,
        userId: input.userId,
        roleId: desig.roleBinding.roleId,
        status: 'ACTIVE'
      });
    }

    this.auditEvents.push({
      eventType: 'OFFICE_BEARER_APPOINTED',
      trustId,
      appointmentId,
      userId: input.userId,
      resolutionNo: input.resolutionNo
    });

    return ob;
  }

  updateOfficeBearerStatus(trustId: string, appointmentId: string, status: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED') {
    const ob = this.officeBearers.find(o => o.id === appointmentId && o.trustId === trustId);
    if (!ob) throw new Error('Appointment not found');
    ob.appointmentStatus = status;

    if (status !== 'ACTIVE') {
      const ra = this.roleAssignments.find(r => r.id === `ra_ob_${appointmentId}`);
      if (ra) ra.status = 'REVOKED';
    }

    this.auditEvents.push({
      eventType: 'OFFICE_BEARER_STATUS_CHANGED',
      trustId,
      appointmentId,
      status
    });

    return ob;
  }

  listDesignations(trustId: string) {
    return this.designations.filter(d => d.trustId === trustId);
  }

  listOfficeBearers(trustId: string) {
    return this.officeBearers.filter(o => o.trustId === trustId);
  }

  getRoleAssignments(trustId: string, userId: string) {
    return this.roleAssignments.filter(r => r.trustId === trustId && r.userId === userId && r.status === 'ACTIVE');
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicDesignationsTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Designations & Office Bearers Tests');
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

  const registry = new MockDesignationRegistry();

  // Test 1: Create Trust-Level Custom Title
  const d1 = registry.createDesignation('trust_sringeri', {
    name: 'Chief Dharmadhikari & Managing Trustee',
    scopeType: 'TRUST',
    description: 'Apex spiritual and administrative custodian'
  });
  assert(d1.scopeType === 'TRUST' && d1.name.includes('Dharmadhikari'), 'Trust-Level Designation', 'Created Trust-scoped apex Dharmadhikari title');

  // Test 2: Create Temple-Level Traditional Sanctum Title with Role Binding
  const d2 = registry.createDesignation('trust_sringeri', {
    name: 'Pradhana Archaka (Chief Priest)',
    scopeType: 'TEMPLE',
    scopeId: 'temple_sharadamba',
    description: 'Sanctum chief priest and ritual scheduler',
    roleBinding: {
      roleId: 'role_priest_superintendent',
      autoAssign: true
    }
  });
  assert(
    d2.scopeType === 'TEMPLE' && d2.roleBinding?.roleId === 'role_priest_superintendent',
    'Temple Title with Role Binding',
    'Created Temple-level Pradhana Archaka title with auto software role binding'
  );

  // Test 3: Appoint Office Bearer with Resolution Reference
  const ob1 = registry.appointOfficeBearer('trust_sringeri', {
    userId: 'usr_dikshidar',
    designationId: d2.id,
    scopeId: 'temple_sharadamba',
    termStart: '2024-01-01',
    termEnd: '2028-12-31',
    resolutionNo: 'TR-2024/09-ARCH'
  });
  assert(
    ob1.resolutionNo === 'TR-2024/09-ARCH' && ob1.appointmentStatus === 'ACTIVE',
    'Office Bearer Appointment',
    'Appointed Pradhana Archaka with official resolution reference TR-2024/09-ARCH'
  );

  // Test 4: Verify Auto-Assigned Software Role
  const rolesGranted = registry.getRoleAssignments('trust_sringeri', 'usr_dikshidar');
  assert(
    rolesGranted.some(r => r.roleId === 'role_priest_superintendent'),
    'Auto Role Assignment via Title',
    'Office bearer automatically granted role_priest_superintendent on appointment'
  );

  // Test 5: Appoint Hereditary / Life Term Office Bearer
  const obLife = registry.appointOfficeBearer('trust_sringeri', {
    userId: 'usr_vidhushekhara',
    designationId: d1.id,
    termStart: '2015-01-01',
    termEnd: null, // Life term
    resolutionNo: 'PEETHAM-2015/01'
  });
  assert(obLife.termEnd === null, 'Life Term Appointment', 'Appointed apex Dharmadhikari with indefinite life term');

  // Test 6: List Designations and Office Bearers
  const desigList = registry.listDesignations('trust_sringeri');
  const obList = registry.listOfficeBearers('trust_sringeri');
  assert(desigList.length === 2 && obList.length === 2, 'Roster and Title Listing', 'Listed all custom designations and appointed office bearers');

  // Test 7: Resignation Lifecycle and Automatic Role Revocation
  registry.updateOfficeBearerStatus('trust_sringeri', ob1.id, 'RESIGNED');
  const rolesAfterResign = registry.getRoleAssignments('trust_sringeri', 'usr_dikshidar');
  assert(
    rolesAfterResign.length === 0,
    'Resignation & Role Revocation',
    'Resignation transitioned status to RESIGNED and auto-revoked temporary software role'
  );

  // Test 8: Status Transition to Expired
  const obExpired = registry.updateOfficeBearerStatus('trust_sringeri', ob1.id, 'EXPIRED');
  assert(obExpired.appointmentStatus === 'EXPIRED', 'Status Lifecycle Expired', 'Transitioned status to EXPIRED');

  // Test 9: Cross-Tenant Isolation
  const ahobilaDesig = registry.createDesignation('trust_ahobila', {
    name: 'Ahobila Jeeyar',
    scopeType: 'TRUST'
  });
  const sringeriDesigs = registry.listDesignations('trust_sringeri');
  assert(
    !sringeriDesigs.some(d => d.id === ahobilaDesig.id),
    'Cross-Tenant Title Isolation',
    'Trust Ahobila designations are strictly isolated from Trust Sringeri'
  );

  // Test 10: Immutable Audit Trail
  const audits = registry.getAuditEvents('trust_sringeri');
  assert(audits.length >= 4, 'Audit Trail Completeness', `Recorded ${audits.length} immutable audit logs for titles and appointments`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Designations Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicDesignationsTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic designations test failed:', err);
      process.exit(1);
    });
}
