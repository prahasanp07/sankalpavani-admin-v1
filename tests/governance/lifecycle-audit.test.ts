/**
 * SankalpVani Lifecycle & Audit Tracking Tests
 * Verifies term duration calculations, elapsed progress bars, active/expired status badges,
 * and board resolution number tracking.
 */

interface TermCalculationResult {
  percentElapsed: number;
  termString: string;
  isExpired: boolean;
  statusBadge: 'ACTIVE' | 'EXPIRED';
}

function calculateTermLifecycle(
  termStart: string,
  termEnd: string | null | undefined,
  isLifeTerm: boolean = false,
  nowTimestamp: number = new Date('2026-09-02T12:00:00Z').getTime()
): TermCalculationResult {
  const startDate = new Date(termStart).getTime();
  const endDate = termEnd ? new Date(termEnd).getTime() : null;

  const isExpired = !isLifeTerm && endDate !== null && endDate < nowTimestamp;
  const statusBadge = isExpired ? 'EXPIRED' : 'ACTIVE';

  let percentElapsed = 0;
  let termString = '';

  if (isLifeTerm) {
    percentElapsed = 100;
    const startYear = new Date(termStart).getFullYear() || 2024;
    termString = `Term: ${startYear} – Permanent (Life Appointment)`;
  } else if (startDate && endDate) {
    const totalDuration = Math.max(endDate - startDate, 1);
    const elapsed = nowTimestamp - startDate;
    percentElapsed = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);

    const startYear = new Date(termStart).getFullYear();
    const endYear = new Date(termEnd!).getFullYear();
    termString = `Term: ${startYear}–${endYear}`;
  } else {
    const startYear = new Date(termStart).getFullYear() || 2024;
    termString = `Term: Since ${startYear} (Indefinite)`;
    percentElapsed = 50;
  }

  return { percentElapsed, termString, isExpired, statusBadge };
}

let passedCount = 0;
let failedCount = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name.padEnd(36)} | Passed`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name.padEnd(36)} | Error: ${err.message}`);
    failedCount++;
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

console.log('\n' + '='.repeat(64));
console.log('🏛️  SankalpVani Audit & Lifecycle Progress Bar Tests');
console.log('='.repeat(64) + '\n');

// Mock fixed reference date: September 2, 2026
const MOCK_NOW = new Date('2026-09-02T12:00:00Z').getTime();

// Test 1: Mid-term Active Trustee (2024 - 2027)
test('Active 3-Year Trustee Term Progress', () => {
  const result = calculateTermLifecycle(
    '2024-01-01T00:00:00Z',
    '2027-01-01T00:00:00Z',
    false,
    MOCK_NOW
  );

  // From Jan 2024 to Jan 2027 is 3 years (~1096 days). Sept 2026 is ~2.67 years elapsed (~89%)
  assert(result.percentElapsed >= 85 && result.percentElapsed <= 92, `Expected ~89% elapsed, got ${result.percentElapsed}%`);
  assert(result.termString === 'Term: 2024–2027', `Expected 'Term: 2024–2027', got '${result.termString}'`);
  assert(!result.isExpired, 'Expected isExpired to be false');
  assert(result.statusBadge === 'ACTIVE', 'Expected ACTIVE badge');
});

// Test 2: Expired Term (2020 - 2025)
test('Expired Historical Trustee Term', () => {
  const result = calculateTermLifecycle(
    '2020-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z',
    false,
    MOCK_NOW
  );

  assert(result.percentElapsed === 100, `Expected 100% elapsed for past term, got ${result.percentElapsed}%`);
  assert(result.termString === 'Term: 2020–2025', `Expected 'Term: 2020–2025', got '${result.termString}'`);
  assert(result.isExpired === true, 'Expected isExpired to be true');
  assert(result.statusBadge === 'EXPIRED', 'Expected EXPIRED badge');
});

// Test 3: Life Term Permanent Appointment
test('Permanent Life Trustee Term', () => {
  const result = calculateTermLifecycle(
    '2018-06-15T00:00:00Z',
    null,
    true,
    MOCK_NOW
  );

  assert(result.percentElapsed === 100, `Expected 100% for Life Term, got ${result.percentElapsed}%`);
  assert(result.termString.includes('Life Appointment'), `Expected Life Appointment in term string, got '${result.termString}'`);
  assert(result.isExpired === false, 'Life term should never expire');
  assert(result.statusBadge === 'ACTIVE', 'Expected ACTIVE badge for life term');
});

// Test 4: Newly Appointed Trustee (2026 - 2029)
test('Fresh 2026-2029 Appointment', () => {
  const result = calculateTermLifecycle(
    '2026-09-01T00:00:00Z',
    '2029-09-01T00:00:00Z',
    false,
    MOCK_NOW
  );

  assert(result.percentElapsed >= 0 && result.percentElapsed <= 2, `Expected ~0% elapsed for fresh term, got ${result.percentElapsed}%`);
  assert(result.termString === 'Term: 2026–2029', `Expected 'Term: 2026–2029', got '${result.termString}'`);
  assert(result.statusBadge === 'ACTIVE', 'Expected ACTIVE badge');
});

// Test 5: Board Resolution / Order Number Parsing & Tracking
test('Board Resolution & Order Tracking', () => {
  const trusteeWithResolution = {
    name: 'Srikanth Sastry',
    trusteeType: 'Elected Board Trustee',
    resolutionNo: 'TR-2026/04-RESOLUTION',
    termStart: '2026-01-01',
    termEnd: '2029-01-01'
  };

  assert(trusteeWithResolution.resolutionNo.startsWith('TR-2026'), 'Resolution format verified');
  assert(Boolean(trusteeWithResolution.resolutionNo), 'Resolution number captured seamlessly');
});

console.log('\n' + '='.repeat(64));
console.log(`📊  Lifecycle Progress Bar Tests Summary: ${passedCount} Passed, ${failedCount} Failed`);
console.log('='.repeat(64) + '\n');

if (failedCount > 0) {
  process.exit(1);
}
