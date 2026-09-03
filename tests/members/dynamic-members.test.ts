/**
 * SankalpVani Dynamic Members & Committee Assignments Tests
 * Verifies dynamic member onboarding, multi-temple assignments, committee linkages, status lifecycles, and cross-tenant isolation.
 */

export interface MockMember {
  userId: string;
  trustId: string;
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  membershipType: 'STANDARD' | 'GOVERNANCE_HEAD' | 'TRUSTEE' | 'STAFF' | 'PRIEST' | 'VOLUNTEER' | 'DONOR';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED';
  assignedTemples: string[];
  assignedCommittees: Array<{ committeeId: string; role: string }>;
}

export class MockMemberRegistry {
  private members: MockMember[] = [];
  private auditEvents: any[] = [];

  addMember(trustId: string, input: {
    userId?: string;
    name: string;
    email: string;
    phone?: string;
    gotra?: string;
    membershipType?: 'STANDARD' | 'GOVERNANCE_HEAD' | 'TRUSTEE' | 'STAFF' | 'PRIEST' | 'VOLUNTEER' | 'DONOR';
    templeIds?: string[];
    committeeId?: string;
    committeeRole?: string;
  }) {
    const email = input.email.toLowerCase().trim();
    let member = this.members.find(m => m.trustId === trustId && m.email === email);

    if (member) {
      // Update existing member assignments
      if (input.templeIds) {
        for (const tid of input.templeIds) {
          if (!member.assignedTemples.includes(tid)) member.assignedTemples.push(tid);
        }
      }
      if (input.committeeId) {
        if (!member.assignedCommittees.some(c => c.committeeId === input.committeeId)) {
          member.assignedCommittees.push({ committeeId: input.committeeId, role: input.committeeRole || 'MEMBER' });
        }
      }
      return member;
    }

    const userId = input.userId || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    member = {
      userId,
      trustId,
      name: input.name,
      email,
      phone: input.phone,
      gotra: input.gotra,
      membershipType: input.membershipType || 'STANDARD',
      status: 'ACTIVE',
      assignedTemples: input.templeIds || [],
      assignedCommittees: input.committeeId ? [{ committeeId: input.committeeId, role: input.committeeRole || 'MEMBER' }] : []
    };
    this.members.push(member);

    this.auditEvents.push({
      eventType: 'MEMBER_REGISTERED',
      trustId,
      userId,
      email,
      membershipType: member.membershipType
    });

    return member;
  }

  updateMemberStatus(trustId: string, userId: string, status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED') {
    const member = this.members.find(m => m.trustId === trustId && m.userId === userId);
    if (!member) throw new Error('Member not found');
    member.status = status;

    this.auditEvents.push({
      eventType: 'MEMBER_UPDATED',
      trustId,
      userId,
      status
    });

    return member;
  }

  revokeTempleAssignment(trustId: string, userId: string, templeId: string) {
    const member = this.members.find(m => m.trustId === trustId && m.userId === userId);
    if (!member) throw new Error('Member not found');
    member.assignedTemples = member.assignedTemples.filter(id => id !== templeId);
    return member;
  }

  listMembers(trustId: string, filter?: { membershipType?: string; templeId?: string }) {
    return this.members.filter(m => {
      if (m.trustId !== trustId) return false;
      if (filter?.membershipType && m.membershipType !== filter.membershipType) return false;
      if (filter?.templeId && !m.assignedTemples.includes(filter.templeId)) return false;
      return true;
    });
  }

  getAuditEvents(trustId: string) {
    return this.auditEvents.filter(a => a.trustId === trustId);
  }
}

export async function runDynamicMembersTests() {
  console.log('\n================================================================');
  console.log('🏛️  SankalpVani Dynamic Members & Committee Assignments Tests');
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

  const registry = new MockMemberRegistry();

  // Test 1: Register Chief Priest with Gotra and Multi-Temple Assignment
  const priest = registry.addMember('trust_sringeri', {
    name: 'Sri Raghavan Bhattar',
    email: 'raghavan.bhattar@sringeri.org',
    phone: '+91 98450 22000',
    gotra: 'Kashyapa',
    membershipType: 'PRIEST',
    templeIds: ['temple_vidyashankara', 'temple_sharadamba']
  });
  assert(
    priest.membershipType === 'PRIEST' && priest.assignedTemples.length === 2 && priest.gotra === 'Kashyapa',
    'Priest Multi-Temple Member',
    'Registered Chief Archaka with Gotra and dual temple operational assignments'
  );

  // Test 2: Register Staff Member with Committee Assignment
  const staff = registry.addMember('trust_sringeri', {
    name: 'Sri Ramesh Sthapathi',
    email: 'ramesh.sthapathi@sringeri.org',
    membershipType: 'STAFF',
    templeIds: ['temple_sharadamba'],
    committeeId: 'comm_jeer_2026',
    committeeRole: 'TECHNICAL_EXPERT'
  });
  assert(
    staff.assignedCommittees.some(c => c.committeeId === 'comm_jeer_2026' && c.role === 'TECHNICAL_EXPERT'),
    'Member Committee Linkage',
    'Linked member to Jeernodharana committee as TECHNICAL_EXPERT'
  );

  // Test 3: Register Apex Trustee Member
  const trustee = registry.addMember('trust_sringeri', {
    name: 'Sri Sringeri Dharmadhikari',
    email: 'dharmadhikari@sringeri.org',
    membershipType: 'TRUSTEE'
  });
  assert(trustee.membershipType === 'TRUSTEE', 'Trustee Registration', 'Registered apex trustee member');

  // Test 4: Filter Members by Type (PRIEST)
  const priests = registry.listMembers('trust_sringeri', { membershipType: 'PRIEST' });
  assert(priests.length === 1 && priests[0].email === 'raghavan.bhattar@sringeri.org', 'Filter by Membership Type', 'Filtered members by PRIEST type');

  // Test 5: Filter Members by Assigned Child Temple
  const vidyashankaraStaff = registry.listMembers('trust_sringeri', { templeId: 'temple_vidyashankara' });
  assert(vidyashankaraStaff.length === 1, 'Filter by Assigned Temple', 'Filtered members assigned to Sri Vidyashankara Temple');

  // Test 6: Revoke Temple Assignment while Preserving Trust Membership
  const updatedPriest = registry.revokeTempleAssignment('trust_sringeri', priest.userId, 'temple_vidyashankara');
  assert(
    !updatedPriest.assignedTemples.includes('temple_vidyashankara') && updatedPriest.assignedTemples.includes('temple_sharadamba'),
    'Temple Revocation Preservation',
    'Revoked Sri Vidyashankara temple scope while preserving Sri Sharadamba scope and Trust membership'
  );

  // Test 7: Status Lifecycle (ACTIVE -> SUSPENDED)
  const suspended = registry.updateMemberStatus('trust_sringeri', staff.userId, 'SUSPENDED');
  assert(suspended.status === 'SUSPENDED', 'Member Status Suspension', 'Suspended member access');

  // Test 8: Status Lifecycle (SUSPENDED -> REVOKED)
  const revoked = registry.updateMemberStatus('trust_sringeri', staff.userId, 'REVOKED');
  assert(revoked.status === 'REVOKED', 'Member Status Revocation', 'Revoked member access');

  // Test 9: Cross-Tenant Isolation
  const ahobilaMember = registry.addMember('trust_ahobila', {
    name: 'Sri Ahobila Paricharakar',
    email: 'paricharakar@ahobila.org',
    membershipType: 'STAFF'
  });
  const sringeriRoster = registry.listMembers('trust_sringeri');
  assert(
    !sringeriRoster.some(m => m.userId === ahobilaMember.userId),
    'Cross-Tenant Member Isolation',
    'Trust Ahobila member roster is strictly isolated from Trust Sringeri'
  );

  // Test 10: Immutable Audit Logging
  const audits = registry.getAuditEvents('trust_sringeri');
  assert(audits.length >= 5, 'Audit Trail Completeness', `Recorded ${audits.length} immutable audit logs for member registrations and status updates`);

  console.log('\n================================================================');
  console.log(`📊  Dynamic Members Tests Summary: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return { passed, failed };
}

if (require.main === module) {
  runDynamicMembersTests()
    .then(res => process.exit(res.failed > 0 ? 1 : 0))
    .catch(err => {
      console.error('Dynamic members test failed:', err);
      process.exit(1);
    });
}
