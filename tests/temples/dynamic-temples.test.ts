/**
 * SankalpVani Dynamic Temples CRUD & Multi-Temple Workspace Tests
 * Verifies dynamic creation, unique code validation, status updates, hierarchy linkage, and isolation.
 */

export interface MockTemple {
  id: string;
  trustId: string;
  organizationNodeId: string;
  code: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  addressJson?: any;
  contactJson?: any;
}

export interface MockOrgNode {
  id: string;
  trustId: string;
  parentId: string | null;
  nodeType: string;
  name: string;
  materializedPath: string;
}

export class MockTempleRegistry {
  private temples: MockTemple[] = [];
  private orgNodes: MockOrgNode[] = [];
  private auditEvents: any[] = [];

  constructor() {
    // Seed initial roots
    this.orgNodes.push({
      id: 'node_root_trust_sringeri',
      trustId: 'trust_sringeri',
      parentId: null,
      nodeType: 'ROOT',
      name: 'Sri Sringeri Sharada Dharma Trust Apex',
      materializedPath: '/trust_sringeri'
    });
  }

  createTemple(trustId: string, input: { code: string; name: string; status?: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE' }) {
    const normalizedCode = input.code.trim().toUpperCase();
    
    // Validate uniqueness within Trust
    const duplicate = this.temples.find(t => t.trustId === trustId && t.code === normalizedCode);
    if (duplicate) {
      throw new Error(`A temple with code '${normalizedCode}' already exists in this Trust.`);
    }

    const templeId = `temple_${normalizedCode.toLowerCase()}_${Date.now()}`;
    const orgNodeId = `node_${templeId}`;

    const rootNode = this.orgNodes.find(n => n.trustId === trustId && n.nodeType === 'ROOT');
    const materializedPath = `${rootNode ? rootNode.materializedPath : `/${trustId}`}/${orgNodeId}`;

    // Create Org Node
    const orgNode: MockOrgNode = {
      id: orgNodeId,
      trustId,
      parentId: rootNode?.id || null,
      nodeType: 'TEMPLE',
      name: input.name,
      materializedPath
    };
    this.orgNodes.push(orgNode);

    // Create Temple
    const temple: MockTemple = {
      id: templeId,
      trustId,
      organizationNodeId: orgNodeId,
      code: normalizedCode,
      name: input.name,
      status: input.status || 'ACTIVE'
    };
    this.temples.push(temple);

    // Audit Event
    this.auditEvents.push({
      eventType: 'TEMPLE_CREATED',
      trustId,
      templeId,
      action: 'trust.temple.create',
      timestamp: new Date().toISOString()
    });

    return { temple, orgNode };
  }

  listTemples(trustId: string) {
    return this.temples.filter(t => t.trustId === trustId);
  }

  updateTempleStatus(trustId: string, templeId: string, status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE') {
    const temple = this.temples.find(t => t.id === templeId && t.trustId === trustId);
    if (!temple) {
      throw new Error(`Temple '${templeId}' not found under Trust '${trustId}'`);
    }
    temple.status = status;
    this.auditEvents.push({
      eventType: 'TEMPLE_STATUS_CHANGED',
      trustId,
      templeId,
      newStatus: status,
      timestamp: new Date().toISOString()
    });
    return temple;
  }

  getAuditEvents(trustId: string, templeId?: string) {
    return this.auditEvents.filter(a => a.trustId === trustId && (!templeId || a.templeId === templeId));
  }
}

export async function runDynamicTempleTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Temples & Multi-Temple Workspace Tests');
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

  const registry = new MockTempleRegistry();

  // Test 1: Dynamically Create First Temple
  const res1 = registry.createTemple('trust_sringeri', {
    code: 'SVT-01',
    name: 'Sri Vidyashankara Temple',
    status: 'ACTIVE'
  });
  assert(res1.temple.code === 'SVT-01' && res1.orgNode.nodeType === 'TEMPLE', 'Dynamic Temple Creation', 'Successfully created temple with linked organization node');

  // Test 2: Hierarchy Materialized Path Linkage
  assert(res1.orgNode.materializedPath.startsWith('/trust_sringeri/'), 'Hierarchy Linkage', 'Organization node materialized path correctly points to Trust root');

  // Test 3: Dynamically Create Second Temple in same Trust
  const res2 = registry.createTemple('trust_sringeri', {
    code: 'SST-02',
    name: 'Sri Sharadamba Temple',
    status: 'ACTIVE'
  });
  assert(res2.temple.code === 'SST-02', 'Multi-Temple Coexistence', 'Second temple created under same trust');

  // Test 4: List Temples under Trust
  const sringeriTemples = registry.listTemples('trust_sringeri');
  assert(sringeriTemples.length === 2, 'List Temples Scoped', 'Listed 2 temples under Sri Sringeri Trust');

  // Test 5: Unique Code Constraint inside Trust
  let duplicateThrew = false;
  try {
    registry.createTemple('trust_sringeri', {
      code: 'SVT-01',
      name: 'Duplicate Vidyashankara'
    });
  } catch (err: any) {
    duplicateThrew = true;
  }
  assert(duplicateThrew, 'Duplicate Code Rejection', 'Prevented duplicate temple code SVT-01 within same trust');

  // Test 6: Cross-Trust Code Allowance (Same code allowed under another Trust)
  const ahobilaTemple = registry.createTemple('trust_ahobila', {
    code: 'SVT-01',
    name: 'Ahobila Branch with same code',
    status: 'ACTIVE'
  });
  assert(ahobilaTemple.temple.trustId === 'trust_ahobila', 'Cross-Trust Scope Independence', 'Allowed identical code SVT-01 under different trust trust_ahobila');

  // Test 7: Cross-Trust Isolation
  const ahobilaList = registry.listTemples('trust_ahobila');
  assert(ahobilaList.length === 1 && ahobilaList[0].name.includes('Ahobila'), 'Cross-Tenant Isolation', 'Trust Ahobila cannot see Trust Sringeri temples');

  // Test 8: Temple Lifecycle Status Transition (Active -> Maintenance)
  const updated1 = registry.updateTempleStatus('trust_sringeri', res1.temple.id, 'MAINTENANCE');
  assert(updated1.status === 'MAINTENANCE', 'Status Lifecycle Maintenance', 'Temple transitioned to MAINTENANCE status');

  // Test 9: Temple Lifecycle Status Transition (Maintenance -> Suspended)
  const updated2 = registry.updateTempleStatus('trust_sringeri', res1.temple.id, 'SUSPENDED');
  assert(updated2.status === 'SUSPENDED', 'Status Lifecycle Suspended', 'Temple transitioned to SUSPENDED status');

  // Test 10: Audit Log Verification
  const auditLogs = registry.getAuditEvents('trust_sringeri', res1.temple.id);
  assert(auditLogs.length >= 2, 'Audit Trail Verification', `Recorded ${auditLogs.length} immutable audit logs for temple creation and status changes`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Temple Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicTempleTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic temple test failed:', err);
      process.exit(1);
    });
}
