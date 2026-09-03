/**
 * SankalpVani Dynamic Committees & Sub-Committees Management Tests
 * Verifies dynamic creation, sub-committee hierarchy, member appointments, dissolution lifecycles, and cross-tenant isolation.
 */

export interface MockCommittee {
  id: string;
  trustId: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId: string;
  parentId: string | null;
  organizationNodeId: string;
  code: string;
  name: string;
  category: string;
  mandate?: string;
  status: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED';
}

export interface MockCommitteeMember {
  id: string;
  trustId: string;
  committeeId: string;
  userId: string;
  committeeRole: string;
  termStart: string;
  termEnd?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'RELIEVED';
}

export class MockCommitteeRegistry {
  private committees: MockCommittee[] = [];
  private members: MockCommitteeMember[] = [];
  private orgNodes: Array<{ id: string; trustId: string; parentId: string | null; nodeType: string; materializedPath: string }> = [];
  private auditEvents: any[] = [];

  constructor() {
    this.orgNodes.push({
      id: 'node_root_trust_sringeri',
      trustId: 'trust_sringeri',
      parentId: null,
      nodeType: 'ROOT',
      materializedPath: '/trust_sringeri'
    });
  }

  createCommittee(trustId: string, input: {
    name: string;
    code: string;
    scopeType: 'TRUST' | 'TEMPLE';
    scopeId?: string;
    parentId?: string | null;
    category?: string;
    mandate?: string;
  }) {
    const normalizedCode = input.code.trim().toUpperCase();
    const existing = this.committees.find(c => c.trustId === trustId && c.code === normalizedCode);
    if (existing) {
      throw new Error(`A committee with code '${normalizedCode}' already exists in this Trust.`);
    }

    const commId = `comm_${normalizedCode.toLowerCase()}_${Date.now()}`;
    const orgNodeId = `node_${commId}`;

    let parentNodePath = `/${trustId}`;
    if (input.parentId) {
      const parentComm = this.committees.find(c => c.id === input.parentId && c.trustId === trustId);
      if (parentComm) {
        const pNode = this.orgNodes.find(n => n.id === parentComm.organizationNodeId);
        if (pNode) parentNodePath = pNode.materializedPath;
      }
    }

    const orgNode = {
      id: orgNodeId,
      trustId,
      parentId: input.parentId ? `node_${input.parentId}` : 'node_root_trust_sringeri',
      nodeType: input.parentId ? 'SUB_COMMITTEE' : 'COMMITTEE',
      materializedPath: `${parentNodePath}/${orgNodeId}`
    };
    this.orgNodes.push(orgNode);

    const comm: MockCommittee = {
      id: commId,
      trustId,
      scopeType: input.scopeType,
      scopeId: input.scopeId || trustId,
      parentId: input.parentId || null,
      organizationNodeId: orgNodeId,
      code: normalizedCode,
      name: input.name,
      category: input.category || 'STANDING',
      mandate: input.mandate,
      status: 'ACTIVE'
    };
    this.committees.push(comm);

    this.auditEvents.push({
      eventType: 'COMMITTEE_CREATED',
      trustId,
      committeeId: commId,
      code: normalizedCode,
      timestamp: new Date().toISOString()
    });

    return { committee: comm, orgNode };
  }

  listCommittees(trustId: string, scopeType?: 'TRUST' | 'TEMPLE') {
    return this.committees.filter(c => c.trustId === trustId && (!scopeType || c.scopeType === scopeType));
  }

  appointMember(trustId: string, committeeId: string, input: {
    userId: string;
    committeeRole: string;
    termStart?: string;
  }) {
    const memberId = `cm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const member: MockCommitteeMember = {
      id: memberId,
      trustId,
      committeeId,
      userId: input.userId,
      committeeRole: input.committeeRole.toUpperCase(),
      termStart: input.termStart || new Date().toISOString(),
      status: 'ACTIVE'
    };
    this.members.push(member);

    this.auditEvents.push({
      eventType: 'COMMITTEE_MEMBER_APPOINTED',
      trustId,
      committeeId,
      memberId,
      role: input.committeeRole,
      timestamp: new Date().toISOString()
    });

    return member;
  }

  listMembers(trustId: string, committeeId: string) {
    return this.members.filter(m => m.trustId === trustId && m.committeeId === committeeId);
  }

  updateMemberStatus(trustId: string, memberId: string, status: 'ACTIVE' | 'EXPIRED' | 'RELIEVED') {
    const member = this.members.find(m => m.id === memberId && m.trustId === trustId);
    if (!member) throw new Error(`Member not found`);
    member.status = status;
    return member;
  }

  updateCommitteeStatus(trustId: string, committeeId: string, status: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED') {
    const comm = this.committees.find(c => c.id === committeeId && c.trustId === trustId);
    if (!comm) throw new Error(`Committee not found`);
    comm.status = status;
    return comm;
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicCommitteeTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Committees & Sub-Committees Tests');
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

  const registry = new MockCommitteeRegistry();

  // Test 1: Create Trust-Level Standing Committee
  const c1 = registry.createCommittee('trust_sringeri', {
    code: 'EXEC-01',
    name: 'Standing Executive Committee (Karyakari Samithi)',
    scopeType: 'TRUST',
    category: 'STANDING',
    mandate: 'Apex routine executive administration of all temples under Sri Sringeri Matha'
  });
  assert(c1.committee.code === 'EXEC-01' && c1.orgNode.nodeType === 'COMMITTEE', 'Standing Committee Creation', 'Formed Trust-wide Standing Executive Committee');

  // Test 2: Create Temple-Level Jeernodharana / Renovation Committee
  const c2 = registry.createCommittee('trust_sringeri', {
    code: 'JEER-SST-01',
    name: 'Sri Sharadamba Maha Samprokshanam & Jeernodharana Samithi',
    scopeType: 'TEMPLE',
    scopeId: 'temple_sharadamba',
    category: 'RENOVATION',
    mandate: 'Complete Rajagopuram renovation, silver chariot gilding, and consecration'
  });
  assert(c2.committee.category === 'RENOVATION' && c2.committee.scopeType === 'TEMPLE', 'Renovation Committee Creation', 'Formed Temple-scoped Jeernodharana Committee');

  // Test 3: Nested Sub-Committee Hierarchy
  const subWing = registry.createCommittee('trust_sringeri', {
    code: 'JEER-CIVIL-01',
    name: 'Civil & Sthapathi Engineering Sub-Wing',
    scopeType: 'TEMPLE',
    scopeId: 'temple_sharadamba',
    parentId: c2.committee.id,
    category: 'RENOVATION',
    mandate: 'Direct supervision of granite carving and stone masonry works'
  });
  assert(
    subWing.committee.parentId === c2.committee.id && subWing.orgNode.nodeType === 'SUB_COMMITTEE',
    'Sub-Committee Nesting',
    'Created child Sub-Committee nested under Jeernodharana parent'
  );
  assert(
    subWing.orgNode.materializedPath.includes(c2.committee.organizationNodeId),
    'Materialized Hierarchy Path',
    'Materialized path accurately links parent committee node to child sub-wing'
  );

  // Test 4: Appoint Convener and Members
  const lead = registry.appointMember('trust_sringeri', c2.committee.id, {
    userId: 'usr_sthapathi_ramesh',
    committeeRole: 'CONVENER'
  });
  const treasurer = registry.appointMember('trust_sringeri', c2.committee.id, {
    userId: 'usr_parthasarathy',
    committeeRole: 'TREASURER'
  });
  const member = registry.appointMember('trust_sringeri', c2.committee.id, {
    userId: 'usr_dikshidar',
    committeeRole: 'TECHNICAL_EXPERT'
  });
  assert(lead.committeeRole === 'CONVENER' && treasurer.committeeRole === 'TREASURER', 'Committee Member Appointments', 'Appointed Convener, Treasurer, and Technical Expert');

  // Test 5: List Committee Members
  const members = registry.listMembers('trust_sringeri', c2.committee.id);
  assert(members.length === 3, 'Committee Roster Listing', 'Listed all 3 active appointed members on the committee');

  // Test 6: Relieve / Expire Committee Member
  const relieved = registry.updateMemberStatus('trust_sringeri', member.id, 'RELIEVED');
  assert(relieved.status === 'RELIEVED', 'Member Status Lifecycle', 'Successfully relieved member from committee duty');

  // Test 7: Dissolve Ad-Hoc Committee on Project Completion
  const dissolved = registry.updateCommitteeStatus('trust_sringeri', c2.committee.id, 'DISSOLVED');
  assert(dissolved.status === 'DISSOLVED', 'Committee Dissolution Lifecycle', 'Dissolved Jeernodharana committee following consecration');

  // Test 8: Duplicate Code Rejection
  let duplicateThrew = false;
  try {
    registry.createCommittee('trust_sringeri', {
      code: 'EXEC-01',
      name: 'Duplicate Exec Committee',
      scopeType: 'TRUST'
    });
  } catch (err) {
    duplicateThrew = true;
  }
  assert(duplicateThrew, 'Duplicate Committee Code Check', 'Rejected duplicate committee code EXEC-01');

  // Test 9: Cross-Tenant Isolation
  const ahobilaComm = registry.createCommittee('trust_ahobila', {
    code: 'FEST-AHOB-01',
    name: 'Ahobila Brahmotsavam Samithi',
    scopeType: 'TRUST'
  });
  const sringeriList = registry.listCommittees('trust_sringeri');
  assert(
    sringeriList.every(c => c.trustId === 'trust_sringeri') && sringeriList.length === 3,
    'Cross-Tenant Isolation',
    'Trust Ahobila committees are strictly isolated from Trust Sringeri'
  );

  // Test 10: Immutable Audit Logging
  const audits = registry.getAuditEvents('trust_sringeri');
  assert(audits.length >= 6, 'Audit Trail Verification', `Recorded ${audits.length} immutable audit logs for committee formations and member appointments`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Committee Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicCommitteeTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic committee test failed:', err);
      process.exit(1);
    });
}
