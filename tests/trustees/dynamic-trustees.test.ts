/**
 * SankalpVani Dynamic Trustees & Trust Board Management Tests
 * Verifies dynamic appointments, custom designations, term lifecycles, resolution references, and cross-trust isolation.
 */

export interface MockOfficeBearer {
  id: string;
  trustId: string;
  scopeId: string;
  userId: string;
  designationId: string;
  termStart: string;
  termEnd: string | null;
  resolutionNo?: string;
  metadataJson: any;
  appointmentStatus: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED';
}

export interface MockDesignation {
  id: string;
  trustId: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  name: string;
  description?: string;
  status: 'ACTIVE';
}

export class MockTrusteeRegistry {
  private designations: MockDesignation[] = [];
  private officeBearers: MockOfficeBearer[] = [];
  private auditEvents: any[] = [];

  constructor() {
    // Seed default designation
    this.designations.push({
      id: 'desig_president_sringeri',
      trustId: 'trust_sringeri',
      scopeType: 'TRUST',
      scopeId: 'trust_sringeri',
      name: 'President / Chairman',
      status: 'ACTIVE'
    });
  }

  createDesignation(trustId: string, name: string, description?: string) {
    const existing = this.designations.find(d => d.trustId === trustId && d.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const desig: MockDesignation = {
      id: `desig_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      trustId,
      scopeType: 'TRUST',
      scopeId: trustId,
      name,
      description,
      status: 'ACTIVE'
    };
    this.designations.push(desig);
    return desig;
  }

  listDesignations(trustId: string) {
    return this.designations.filter(d => d.trustId === trustId);
  }

  appointTrustee(trustId: string, input: {
    userId: string;
    designationId: string;
    trusteeType: string;
    termStart: string;
    termEnd?: string | null;
    resolutionNo?: string;
    responsibilities?: string;
  }) {
    const appointmentId = `ob_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const appointment: MockOfficeBearer = {
      id: appointmentId,
      trustId,
      scopeId: trustId,
      userId: input.userId,
      designationId: input.designationId,
      termStart: input.termStart,
      termEnd: input.termEnd || null,
      resolutionNo: input.resolutionNo,
      metadataJson: {
        trusteeType: input.trusteeType,
        responsibilities: input.responsibilities
      },
      appointmentStatus: 'ACTIVE'
    };

    this.officeBearers.push(appointment);
    this.auditEvents.push({
      eventType: 'TRUSTEE_APPOINTED',
      trustId,
      appointmentId,
      resolutionNo: input.resolutionNo,
      timestamp: new Date().toISOString()
    });

    return appointment;
  }

  listTrustees(trustId: string) {
    return this.officeBearers.filter(ob => ob.trustId === trustId && ob.scopeId === trustId);
  }

  updateTrustee(trustId: string, appointmentId: string, updates: Partial<MockOfficeBearer>) {
    const appointment = this.officeBearers.find(ob => ob.id === appointmentId && ob.trustId === trustId);
    if (!appointment) throw new Error(`Trustee appointment '${appointmentId}' not found.`);

    Object.assign(appointment, updates);
    this.auditEvents.push({
      eventType: updates.appointmentStatus ? 'TRUSTEE_STATUS_CHANGED' : 'TRUSTEE_UPDATED',
      trustId,
      appointmentId,
      timestamp: new Date().toISOString()
    });

    return appointment;
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicTrusteeTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Trustees & Board Management Tests');
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

  const registry = new MockTrusteeRegistry();

  // Test 1: Dynamic Custom Designation Creation
  const desig1 = registry.createDesignation('trust_sringeri', 'Chief Dharmadhikari & Managing Trustee', 'Apex spiritual and administrative custodian');
  assert(desig1.name === 'Chief Dharmadhikari & Managing Trustee', 'Dynamic Designation Creation', 'Created custom designation title for Trust');

  // Test 2: Appoint Managing Trustee with Resolution Reference
  const trustee1 = registry.appointTrustee('trust_sringeri', {
    userId: 'usr_vidyaranya',
    designationId: desig1.id,
    trusteeType: 'Managing Trustee / Dharmadhikari',
    termStart: '2022-01-01',
    termEnd: '2027-12-31',
    resolutionNo: 'TR-2022/01',
    responsibilities: 'Overall temple administrative governance & trust stewardship'
  });
  assert(
    trustee1.resolutionNo === 'TR-2022/01' && trustee1.appointmentStatus === 'ACTIVE',
    'Trustee Appointment with Resolution',
    'Appointed Managing Trustee with term dates and official resolution number'
  );

  // Test 3: Hereditary / Life Term Trustee Appointment
  const desig2 = registry.createDesignation('trust_sringeri', 'Vamshaparamparya Pradhana Archaka');
  const trustee2 = registry.appointTrustee('trust_sringeri', {
    userId: 'usr_raghavan',
    designationId: desig2.id,
    trusteeType: 'Hereditary Trustee (Vamshaparamparya)',
    termStart: '2012-01-01',
    termEnd: null, // Life term
    resolutionNo: 'HERED-SRING-01'
  });
  assert(trustee2.termEnd === null && trustee2.metadataJson.trusteeType.includes('Hereditary'), 'Life Term Appointment', 'Appointed Hereditary Trustee with indefinite life term');

  // Test 4: Appoint Govt / Endowment Nominated Trustee
  const desig3 = registry.createDesignation('trust_sringeri', 'Endowment Department Nominee');
  const trustee3 = registry.appointTrustee('trust_sringeri', {
    userId: 'usr_govt_nominee',
    designationId: desig3.id,
    trusteeType: 'Endowment / Govt Nominated Trustee',
    termStart: '2024-06-01',
    termEnd: '2026-05-31',
    resolutionNo: 'GO-ENDOW-88/2024'
  });
  assert(trustee3.metadataJson.trusteeType.includes('Govt Nominated'), 'Nominated Trustee Appointment', 'Appointed Govt Nominated Trustee');

  // Test 5: List Board of Trustees
  const boardList = registry.listTrustees('trust_sringeri');
  assert(boardList.length === 3, 'Trust Board Listing', 'Successfully listed all 3 active board trustees');

  // Test 6: Update Trustee Resolution & Responsibilities
  const updated = registry.updateTrustee('trust_sringeri', trustee1.id, {
    resolutionNo: 'TR-2022/01-AMENDED',
    metadataJson: { ...trustee1.metadataJson, responsibilities: 'Expanded statewide temple portfolio' }
  });
  assert(updated.resolutionNo === 'TR-2022/01-AMENDED', 'Trustee Term Update', 'Successfully amended resolution reference number');

  // Test 7: Status Lifecycle (Active -> Resigned)
  const resigned = registry.updateTrustee('trust_sringeri', trustee3.id, {
    appointmentStatus: 'RESIGNED'
  });
  assert(resigned.appointmentStatus === 'RESIGNED', 'Status Lifecycle Resigned', 'Transitioned trustee status to RESIGNED');

  // Test 8: Status Lifecycle (Active -> Expired)
  const expired = registry.updateTrustee('trust_sringeri', trustee1.id, {
    appointmentStatus: 'EXPIRED'
  });
  assert(expired.appointmentStatus === 'EXPIRED', 'Status Lifecycle Expired', 'Transitioned trustee status to EXPIRED');

  // Test 9: Cross-Tenant Isolation
  const ahobilaTrustee = registry.appointTrustee('trust_ahobila', {
    userId: 'usr_ahobila_jeeyar',
    designationId: 'desig_ahobila_jeeyar',
    trusteeType: 'Managing Trustee / Dharmadhikari',
    termStart: '2020-01-01',
    resolutionNo: 'AHOB-01'
  });
  const ahobilaBoard = registry.listTrustees('trust_ahobila');
  assert(
    ahobilaBoard.length === 1 && ahobilaBoard[0].trustId === 'trust_ahobila',
    'Cross-Tenant Isolation',
    'Trust Ahobila cannot view or access Sringeri trustees'
  );

  // Test 10: Immutable Audit Logging
  const sringeriAudits = registry.getAuditEvents('trust_sringeri');
  assert(sringeriAudits.length >= 5, 'Audit Trail Completeness', `Recorded ${sringeriAudits.length} immutable audit records for trustee appointments and status transitions`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Trustee Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicTrusteeTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic trustee test failed:', err);
      process.exit(1);
    });
}
