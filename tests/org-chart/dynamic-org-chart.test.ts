/**
 * SankalpVani Dynamic Org Chart & Matrix Reporting Tests
 * Verifies dynamic graph builder, primary & matrix edges, cycle detection algorithms, and cross-tenant isolation.
 */

export interface MockStaffMember {
  id: string;
  trustId: string;
  scopeId: string;
  name: string;
  role: string;
  department: 'Spiritual' | 'Admin' | 'Operations' | 'Finance';
  primarySupervisorId: string | null;
  secondarySupervisorIds: string[];
  status: 'Active' | 'On Leave' | 'Duty-Assign';
}

export class MockOrgChartGraphBuilder {
  private staff: MockStaffMember[] = [];
  private auditEvents: any[] = [];

  checkCycle(targetUserId: string, proposedSupervisorId: string): boolean {
    if (targetUserId === proposedSupervisorId) return true;

    const visited = new Set<string>();
    const queue = [proposedSupervisorId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetUserId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const member = this.staff.find(s => s.id === current);
      if (member) {
        if (member.primarySupervisorId) queue.push(member.primarySupervisorId);
        if (member.secondarySupervisorIds) {
          for (const s of member.secondarySupervisorIds) {
            queue.push(s);
          }
        }
      }
    }

    return false;
  }

  saveStaffMember(trustId: string, input: {
    id?: string;
    name: string;
    role: string;
    department: 'Spiritual' | 'Admin' | 'Operations' | 'Finance';
    scopeId?: string;
    primarySupervisorId?: string | null;
    secondarySupervisorIds?: string[];
  }) {
    const id = input.id || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const primarySupervisorId = input.primarySupervisorId || null;
    const secondarySupervisorIds = input.secondarySupervisorIds || [];

    // Cycle check on primary supervisor
    if (primarySupervisorId && this.checkCycle(id, primarySupervisorId)) {
      throw new Error('Invalid reporting line: Creates circular hierarchy loop.');
    }

    // Cycle check on matrix supervisors
    for (const secId of secondarySupervisorIds) {
      if (this.checkCycle(id, secId)) {
        throw new Error('Invalid matrix reporting line: Creates circular hierarchy loop.');
      }
    }

    const existingIdx = this.staff.findIndex(s => s.id === id && s.trustId === trustId);
    const member: MockStaffMember = {
      id,
      trustId,
      scopeId: input.scopeId || trustId,
      name: input.name,
      role: input.role,
      department: input.department,
      primarySupervisorId,
      secondarySupervisorIds,
      status: 'Active'
    };

    if (existingIdx >= 0) {
      this.staff[existingIdx] = member;
    } else {
      this.staff.push(member);
    }

    this.auditEvents.push({
      eventType: 'ORG_CHART_UPDATED',
      trustId,
      staffId: id,
      name: input.name,
      primarySupervisorId,
      secondarySupervisorIds
    });

    return member;
  }

  getGraph(trustId: string, scopeId?: string) {
    const list = this.staff.filter(s => s.trustId === trustId && (!scopeId || s.scopeId === scopeId));

    const edges: Array<{ id: string; source: string; target: string; type: 'PRIMARY' | 'MATRIX' }> = [];

    for (const s of list) {
      if (s.primarySupervisorId) {
        edges.push({
          id: `edge_p_${s.primarySupervisorId}_${s.id}`,
          source: s.primarySupervisorId,
          target: s.id,
          type: 'PRIMARY'
        });
      }

      for (const secId of s.secondarySupervisorIds) {
        edges.push({
          id: `edge_m_${secId}_${s.id}`,
          source: secId,
          target: s.id,
          type: 'MATRIX'
        });
      }
    }

    const nodes = list.map(s => {
      const subCount = list.filter(other => other.primarySupervisorId === s.id).length;
      const matrixCount = list.filter(other => other.secondarySupervisorIds.includes(s.id)).length;
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        subordinatesCount: subCount,
        matrixCount: matrixCount
      };
    });

    return { nodes, edges, totalCount: nodes.length };
  }

  deleteStaff(trustId: string, staffId: string) {
    const idx = this.staff.findIndex(s => s.id === staffId && s.trustId === trustId);
    if (idx < 0) throw new Error('Staff not found');
    const removed = this.staff.splice(idx, 1)[0];

    // Reassign subordinates' primary supervisor
    for (const s of this.staff) {
      if (s.primarySupervisorId === staffId) {
        s.primarySupervisorId = removed.primarySupervisorId;
      }
      s.secondarySupervisorIds = s.secondarySupervisorIds.filter(id => id !== staffId);
    }
    return true;
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicOrgChartTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Org Chart & Matrix Reporting Tests');
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

  const builder = new MockOrgChartGraphBuilder();

  // Test 1: Add Apex Spiritual Lead
  const apex = builder.saveStaffMember('trust_sringeri', {
    id: 'staff_vidhushekhara',
    name: 'Sri Vidhushekhara Bharati',
    role: 'Dharmadhikari & Managing Trustee',
    department: 'Spiritual',
    primarySupervisorId: null
  });
  assert(apex.primarySupervisorId === null, 'Apex Node Creation', 'Formed Apex Dharmadhikari root node without supervisor');

  // Test 2: Add CEO reporting to Apex
  const ceo = builder.saveStaffMember('trust_sringeri', {
    id: 'staff_ceo',
    name: 'Sri K. Venkataramanan',
    role: 'Chief Executive Officer (CEO)',
    department: 'Admin',
    primarySupervisorId: apex.id
  });
  assert(ceo.primarySupervisorId === apex.id, 'Primary Hierarchy Linkage', 'CEO reports directly to Apex Dharmadhikari');

  // Test 3: Add Chief Priest reporting to Apex with Matrix to CEO
  const chiefPriest = builder.saveStaffMember('trust_sringeri', {
    id: 'staff_pradhana_archaka',
    name: 'Sri R. Ramanatha Dikshidar',
    role: 'Chief Priest (Pradhana Archaka)',
    department: 'Spiritual',
    primarySupervisorId: apex.id,
    secondarySupervisorIds: [ceo.id]
  });
  assert(
    chiefPriest.primarySupervisorId === apex.id && chiefPriest.secondarySupervisorIds.includes(ceo.id),
    'Dual Matrix Hierarchy Linkage',
    'Chief Priest has primary spiritual reporting to Apex and dual matrix oversight from CEO'
  );

  // Test 4: Add Booking Desk Superintendent reporting to CEO with Matrix to Chief Priest
  const bookingLead = builder.saveStaffMember('trust_sringeri', {
    id: 'staff_booking_lead',
    name: 'Sri M. Ganeshan',
    role: 'Booking Desk Superintendent',
    department: 'Operations',
    primarySupervisorId: ceo.id,
    secondarySupervisorIds: [chiefPriest.id]
  });
  assert(
    bookingLead.primarySupervisorId === ceo.id && bookingLead.secondarySupervisorIds.includes(chiefPriest.id),
    'Cross-Functional Matrix Node',
    'Booking Lead reports to CEO with matrix line to Chief Priest for ritual dates'
  );

  // Test 5: Graph Generation (Nodes & Edges)
  const graph = builder.getGraph('trust_sringeri');
  const primaryEdges = graph.edges.filter(e => e.type === 'PRIMARY');
  const matrixEdges = graph.edges.filter(e => e.type === 'MATRIX');
  assert(
    graph.nodes.length === 4 && primaryEdges.length === 3 && matrixEdges.length === 2,
    'Dynamic Graph Construction',
    `Constructed graph with ${graph.nodes.length} nodes, ${primaryEdges.length} primary edges, and ${matrixEdges.length} matrix edges`
  );

  // Test 6: Subordinate & Matrix Count Calculation
  const apexNode = graph.nodes.find(n => n.id === apex.id);
  const ceoNode = graph.nodes.find(n => n.id === ceo.id);
  assert(apexNode?.subordinatesCount === 2, 'Subordinate Count Calculation', 'Apex node calculates 2 direct subordinates (CEO & Chief Priest)');
  assert(ceoNode?.matrixCount === 1, 'Matrix Reportee Count', 'CEO node calculates 1 matrix reportee (Chief Priest)');

  // Test 7: Direct Circular Loop Rejection (A -> A)
  let directLoopRejected = false;
  try {
    builder.saveStaffMember('trust_sringeri', {
      id: ceo.id,
      name: 'CEO',
      role: 'CEO',
      department: 'Admin',
      primarySupervisorId: ceo.id // self-referencing loop
    });
  } catch (err) {
    directLoopRejected = true;
  }
  assert(directLoopRejected, 'Direct Self-Loop Prevention', 'Prevented user from being their own supervisor');

  // Test 8: Multi-Hop Circular Hierarchy Rejection (Apex -> CEO -> BookingLead -> Apex)
  let multiHopLoopRejected = false;
  try {
    // Attempting to make Apex report to BookingLead creates a circular chain
    builder.saveStaffMember('trust_sringeri', {
      id: apex.id,
      name: apex.name,
      role: apex.role,
      department: 'Spiritual',
      primarySupervisorId: bookingLead.id
    });
  } catch (err) {
    multiHopLoopRejected = true;
  }
  assert(multiHopLoopRejected, 'Multi-Hop Cycle Detection', 'Algorithm prevented circular hierarchy loop (Apex -> CEO -> BookingLead -> Apex)');

  // Test 9: Staff Deletion with Subordinate Reassignment
  builder.deleteStaff('trust_sringeri', ceo.id);
  const updatedGraph = builder.getGraph('trust_sringeri');
  const reconnectedBookingLead = updatedGraph.nodes.find(n => n.id === bookingLead.id);
  const reconnectedStaff = builder['staff'].find(s => s.id === bookingLead.id);
  assert(
    reconnectedStaff?.primarySupervisorId === apex.id,
    'Orphan Reassignment on Deletion',
    'Subordinates of deleted CEO automatically reassigned to grandparent supervisor (Apex)'
  );

  // Test 10: Cross-Tenant Isolation
  const ahobilaStaff = builder.saveStaffMember('trust_ahobila', {
    id: 'staff_ahobila_jeeyar',
    name: 'Sri Ahobila Jeeyar Swamigal',
    role: 'Peethadhipathi',
    department: 'Spiritual'
  });
  const sringeriGraph = builder.getGraph('trust_sringeri');
  assert(
    !sringeriGraph.nodes.some(n => n.id === ahobilaStaff.id),
    'Cross-Tenant Org Chart Isolation',
    'Trust Ahobila staff nodes are strictly isolated from Trust Sringeri org graph'
  );

  console.log('\n================================================================');
  console.log(`📊  Dynamic Org Chart Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicOrgChartTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic org chart test failed:', err);
      process.exit(1);
    });
}
