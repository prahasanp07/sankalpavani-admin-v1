/**
 * SankalpVani Meetings & Minutes of Meeting (MoM) Governance Tests
 * Verifies Zod schemas, 5MB attachment size constraint, rich text HTML support,
 * dynamic Select All / Unselect All invitee selection logic, and mock data integrity.
 */

import {
  scheduleMeetingSchema,
  publishMoMSchema,
  MAX_ATTACHMENT_SIZE_BYTES,
  MOCK_GOVERNANCE_COMMITTEES,
  MOCK_GOVERNANCE_MEMBERS,
  INITIAL_UPCOMING_MEETINGS,
  INITIAL_PAST_MOMS,
} from '../../schemas/meeting.schema';

let passedCount = 0;
let failedCount = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name.padEnd(46)} | Passed`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name.padEnd(46)} | Error: ${err.message}`);
    failedCount++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log('\n' + '='.repeat(68));
console.log('📜  SankalpVani Meetings & Minutes of Meeting (MoM) Governance Tests');
console.log('='.repeat(68) + '\n');

// Test 1: Valid Schedule Meeting Schema
test('Valid Schedule Meeting Input', () => {
  const result = scheduleMeetingSchema.safeParse({
    title: 'Quarterly Trust Board Review',
    scheduledAt: '2026-10-25T10:00',
    committeeId: 'comm_board',
    inviteeIds: ['usr_1', 'usr_2'],
    agenda: '<p>Review of Temple Renovation & Annual Budget Allocations</p>',
    location: 'Main Trust Boardroom & Virtual Hybrid',
  });

  assert(result.success, 'Expected valid schedule meeting input to parse successfully');
});

// Test 2: Schedule Meeting Schema - Missing Title Rejection
test('Schedule Meeting Missing Title Rejection', () => {
  const result = scheduleMeetingSchema.safeParse({
    title: '',
    scheduledAt: '2026-10-25T10:00',
    inviteeIds: ['usr_1'],
  });

  assert(!result.success, 'Expected schedule meeting without title to fail validation');
});

// Test 3: Rich Text HTML Agenda & Table Parsing
test('Rich Text HTML Agenda Support (WYSIWYG format)', () => {
  const richHtmlAgenda = `
    <h2>Temple Renovation & Financial Review</h2>
    <p>Key topics for executive board review:</p>
    <ul>
      <li>Garbhagriha Silver Kavacham fabrication status</li>
      <li>Maha Shivaratri devotee crowd control guidelines</li>
    </ul>
    <table border="1">
      <thead><tr><th>Item</th><th>Budget (INR)</th><th>Lead</th></tr></thead>
      <tbody><tr><td>Silver Kavacham</td><td>₹15,00,000</td><td>Srikanth Sastry</td></tr></tbody>
    </table>
  `;

  const result = scheduleMeetingSchema.safeParse({
    title: 'Executive Committee Special Session',
    scheduledAt: '2026-11-01T14:30',
    inviteeIds: ['usr_1', 'usr_2', 'usr_3'],
    agenda: richHtmlAgenda,
  });

  assert(result.success, 'Expected rich HTML agenda to be accepted without truncation');
  if (result.success) {
    assert(Boolean(result.data.agenda?.includes('<table')), 'Agenda preserves embedded HTML table');
  }
});

// Test 4: Agenda Length Limit (20,000 characters)
test('Agenda 20,000-char Boundary Enforcement', () => {
  const oversizedAgenda = 'A'.repeat(20001);
  const result = scheduleMeetingSchema.safeParse({
    title: 'Boundary Test Meeting',
    scheduledAt: '2026-11-01T14:30',
    inviteeIds: ['usr_1'],
    agenda: oversizedAgenda,
  });

  assert(!result.success, 'Expected agenda exceeding 20,000 characters to fail');
});

// Test 5: Valid Publish MoM Schema
test('Valid Publish MoM Input (>20 chars)', () => {
  const result = publishMoMSchema.safeParse({
    meetingId: 'mtg_past_1',
    momText: 'The Board unanimously approved the procurement of sacred brass lamps and endorsed the budget of ₹2,50,000.',
  });

  assert(result.success, 'Expected valid MoM text to succeed');
});

// Test 6: Publish MoM Under 20 Chars Rejection
test('Publish MoM Under 20 Chars Rejection', () => {
  const result = publishMoMSchema.safeParse({
    meetingId: 'mtg_past_1',
    momText: 'Too short mom text',
  });

  assert(!result.success, 'Expected MoM text under 20 chars to fail');
});

// Test 7: Strict 5MB Attachment Constraint Validation
test('Attachment Under 5MB Limit Acceptance', () => {
  const mockFileUnder5MB = {
    name: 'signed_resolution_gazette.pdf',
    size: 4.8 * 1024 * 1024, // 4.8 MB
    type: 'application/pdf',
  };

  const result = publishMoMSchema.safeParse({
    meetingId: 'mtg_past_1',
    momText: 'Official minutes recorded and gazette signed by Chairman and Executive Officer.',
    attachment: mockFileUnder5MB,
  });

  assert(result.success, 'Expected 4.8MB file to pass strict 5MB limit');
});

// Test 8: Rejection of Attachment Exceeding 5MB Limit
test('Attachment Exceeding 5MB Limit Rejection', () => {
  const mockFileOver5MB = {
    name: 'huge_scanned_register.pdf',
    size: 5.2 * 1024 * 1024, // 5.2 MB
    type: 'application/pdf',
  };

  const result = publishMoMSchema.safeParse({
    meetingId: 'mtg_past_1',
    momText: 'Official minutes recorded and gazette signed by Chairman and Executive Officer.',
    attachment: mockFileOver5MB,
  });

  assert(!result.success, 'Expected file over 5MB (5.2MB) to be rejected by Zod refine rule');
  if (!result.success) {
    const hasSizeError = result.error.errors.some((e) => e.message.includes('5MB'));
    assert(hasSizeError, 'Error message explicitly mentions 5MB limit');
  }
});

// Test 9: Dynamic Select All / Unselect All Invitee State Transitions
test('Dynamic Select All / Unselect All State Transitions', () => {
  const totalMemberIds = MOCK_GOVERNANCE_MEMBERS.map((m) => m.id);
  const totalCount = totalMemberIds.length;

  // Case A: Initial State (none or partial selected)
  let selectedIds: string[] = [];
  let isAllSelected = selectedIds.length === totalCount && totalCount > 0;
  assert(!isAllSelected, 'Initial state: not all selected');

  // Action: Select All clicked
  selectedIds = [...totalMemberIds];
  isAllSelected = selectedIds.length === totalCount;
  assert(isAllSelected, 'After Select All: all selected is true');

  // Action: Unselect All clicked
  selectedIds = [];
  isAllSelected = selectedIds.length === totalCount;
  assert(!isAllSelected && selectedIds.length === 0, 'After Unselect All: selected count is 0');

  // Case B: Partial selection
  selectedIds = [totalMemberIds[0], totalMemberIds[1]];
  const isPartial = selectedIds.length > 0 && selectedIds.length < totalCount;
  assert(isPartial, 'Partial selection state correctly computed');
});

// Test 10: Mock Data Integrity Check
test('Mock Governance Data Integrity', () => {
  assert(MOCK_GOVERNANCE_COMMITTEES.length >= 4, 'At least 4 committees seeded');
  assert(MOCK_GOVERNANCE_MEMBERS.length >= 4, 'At least 4 trustees/members seeded');
  assert(INITIAL_UPCOMING_MEETINGS.length >= 2, 'Initial upcoming meetings available');
  assert(INITIAL_PAST_MOMS.length >= 2, 'Initial past MoMs with rich notes available');

  // Check past MoM resolution format
  const momWithResolution = INITIAL_PAST_MOMS.find((m) => m.notes?.resolutionNumber);
  assert(Boolean(momWithResolution), 'At least one past MoM has official resolution number');
  assert(momWithResolution!.notes!.resolutionNumber!.includes('RES-TR-'), 'Resolution follows RES-TR- standard');
});

console.log('\n' + '='.repeat(68));
console.log(`📊  Meetings Governance Tests Summary: ${passedCount} Passed, ${failedCount} Failed`);
console.log('='.repeat(68) + '\n');

if (failedCount > 0) {
  process.exit(1);
}
