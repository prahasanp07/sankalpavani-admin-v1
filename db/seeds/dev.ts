import { db } from '../../lib/db/client';
import {
  trusts,
  organizationNodes,
  temples,
  users,
  trustMemberships,
  templeMemberships,
  designations,
  officeBearers,
  permissionDefinitions,
  roles,
  rolePermissions,
  roleAssignments,
  policyVersions,
  templeSettings,
  templeSchedules,
  templeFacilities,
  personProfiles,
  priestProfiles,
  templeStaffAssignments,
  sevas,
  bookings,
  bookingPilgrims,
  receipts,
  shipments,
  shifts
} from '../schema';

export async function seedDevelopmentDatabase() {
  console.log('🌱 Starting SankalpVani Development Database Seed...');

  const now = new Date();

  // ==========================================
  // 1. SEED TRUSTS (Multi-Tenant Isolation Roots)
  // ==========================================
  console.log('--> Seeding Trusts...');
  await db.insert(trusts).values([
    {
      id: 'trust_sringeri',
      tenantId: 'trust_sringeri',
      legalName: 'Sri Sringeri Sharada Dharma Trust',
      registrationNumber: 'TR-KA-1972-0042',
      addressJson: {
        line1: 'Sri Sringeri Matha Complex',
        city: 'Sringeri',
        district: 'Chikkamagaluru',
        state: 'Karnataka',
        postalCode: '577139',
        country: 'India'
      },
      contactJson: {
        phone: '+91 82652 50123',
        email: 'info@sringeridharmatrust.org',
        website: 'https://sringeri.net'
      },
      status: 'ACTIVE'
    },
    {
      id: 'trust_ahobila',
      tenantId: 'trust_ahobila',
      legalName: 'Sri Ahobila Matha Devasthanam Trust',
      registrationNumber: 'TR-AP-1965-0108',
      addressJson: {
        line1: 'Ahobilam Complex',
        city: 'Ahobilam',
        district: 'Nandyal',
        state: 'Andhra Pradesh',
        postalCode: '518543',
        country: 'India'
      },
      contactJson: {
        phone: '+91 85192 40011',
        email: 'contact@ahobilamatha.org',
        website: 'https://ahobilamatha.org'
      },
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 2. SEED ORGANIZATION NODES & TEMPLES
  // ==========================================
  console.log('--> Seeding Organization Hierarchy & Temples...');
  await db.insert(organizationNodes).values([
    {
      id: 'node_sringeri_root',
      trustId: 'trust_sringeri',
      nodeType: 'ROOT',
      name: 'Sri Sringeri Sharada Dharma Peetham Apex',
      materializedPath: '/trust_sringeri',
      hierarchyVersion: 1,
      status: 'ACTIVE'
    },
    {
      id: 'node_vidyashankara',
      trustId: 'trust_sringeri',
      parentId: 'node_sringeri_root',
      nodeType: 'TEMPLE',
      name: 'Sri Vidyashankara Temple',
      materializedPath: '/trust_sringeri/node_vidyashankara',
      hierarchyVersion: 1,
      status: 'ACTIVE'
    },
    {
      id: 'node_sharadamba',
      trustId: 'trust_sringeri',
      parentId: 'node_sringeri_root',
      nodeType: 'TEMPLE',
      name: 'Sri Sharadamba Temple',
      materializedPath: '/trust_sringeri/node_sharadamba',
      hierarchyVersion: 1,
      status: 'ACTIVE'
    },
    {
      id: 'node_ahobila_root',
      trustId: 'trust_ahobila',
      nodeType: 'ROOT',
      name: 'Sri Ahobila Matha Apex Board',
      materializedPath: '/trust_ahobila',
      hierarchyVersion: 1,
      status: 'ACTIVE'
    },
    {
      id: 'node_narasimha',
      trustId: 'trust_ahobila',
      parentId: 'node_ahobila_root',
      nodeType: 'TEMPLE',
      name: 'Sri Lakshmi Narasimha Swamy Temple',
      materializedPath: '/trust_ahobila/node_narasimha',
      hierarchyVersion: 1,
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // Seed Temples
  await db.insert(temples).values([
    {
      id: 'temple_vidyashankara',
      trustId: 'trust_sringeri',
      organizationNodeId: 'node_vidyashankara',
      code: 'SVT-01',
      name: 'Sri Vidyashankara Temple',
      addressJson: {
        address: 'Tunga River Bank, Sringeri',
        district: 'Chikkamagaluru',
        state: 'Karnataka',
        postalCode: '577139'
      },
      contactJson: {
        hotline: '+91 82652 50123',
        email: 'vidyashankara@sringeritemple.org'
      },
      status: 'ACTIVE'
    },
    {
      id: 'temple_sharadamba',
      trustId: 'trust_sringeri',
      organizationNodeId: 'node_sharadamba',
      code: 'SST-02',
      name: 'Sri Sharadamba Temple',
      addressJson: {
        address: 'Main Sanctum Enclosure, Sringeri',
        district: 'Chikkamagaluru',
        state: 'Karnataka',
        postalCode: '577139'
      },
      contactJson: {
        hotline: '+91 82652 50124',
        email: 'sharadamba@sringeritemple.org'
      },
      status: 'ACTIVE'
    },
    {
      id: 'temple_narasimha',
      trustId: 'trust_ahobila',
      organizationNodeId: 'node_narasimha',
      code: 'LNT-01',
      name: 'Sri Lakshmi Narasimha Swamy Temple',
      addressJson: {
        address: 'Upper Ahobilam, Garudadri Hills',
        district: 'Nandyal',
        state: 'Andhra Pradesh',
        postalCode: '518543'
      },
      contactJson: {
        hotline: '+91 85192 40011',
        email: 'sanctum@ahobilamatha.org'
      },
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 3. SEED USERS & IDENTITIES
  // ==========================================
  console.log('--> Seeding Users...');
  await db.insert(users).values([
    {
      id: 'user_vidyaranya',
      identityProviderId: 'auth_vidyaranya',
      name: 'Sri Vidyaranya Shastri',
      email: 'admin@temple1.com', // Retains default demo email for frictionless local login
      mobileNumber: '+91 98450 11000',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
      status: 'ACTIVE',
      mfaEnabled: false
    },
    {
      id: 'user_subramanya_bhat',
      identityProviderId: 'auth_subramanya',
      name: 'Sri Subramanya Bhat',
      email: 'archaka@sringeri.org',
      mobileNumber: '+91 98450 22001',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANcPfzsfum8zGj2STDpP_Eds0xOoXxtm_OjHwVkP2MZOW3999u6oVf8P-7GeIMQA1hFSnmMM-gxsed4iDD-ruqP0OJKhI0LBMl2OTllKr3RJspedpV9pOsdDyz43dF_teOB1cC39MQgm579_rgeQq4Evh6iDEqE4aFi5LR5E3SLkqyCjsFrlyNnt_YF1ph80p1i-M4ec2yFc2A9oBE9U3sOA8W64XAiqtD-IxdDQLuoEYwwIz6gU1SePMjmWX2QVVSn1bT8aiesII',
      status: 'ACTIVE',
      mfaEnabled: false
    },
    {
      id: 'user_ranganatha_rao',
      identityProviderId: 'auth_ranganatha',
      name: 'Sri Ranganatha Rao',
      email: 'treasurer@sringeri.org',
      mobileNumber: '+91 98450 33002',
      status: 'ACTIVE',
      mfaEnabled: false
    },
    {
      id: 'user_raghavan_acharya',
      identityProviderId: 'auth_raghavan',
      name: 'Sri Raghavan Acharya',
      email: 'admin@ahobilamatha.org',
      mobileNumber: '+91 94440 99887',
      status: 'ACTIVE',
      mfaEnabled: false
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 4. SEED MEMBERSHIPS
  // ==========================================
  console.log('--> Seeding Memberships...');
  await db.insert(trustMemberships).values([
    {
      id: 'tmb_vidyaranya_sringeri',
      trustId: 'trust_sringeri',
      userId: 'user_vidyaranya',
      status: 'ACTIVE',
      membershipType: 'GOVERNANCE_HEAD'
    },
    {
      id: 'tmb_subramanya_sringeri',
      trustId: 'trust_sringeri',
      userId: 'user_subramanya_bhat',
      status: 'ACTIVE',
      membershipType: 'PRIEST_STAFF'
    },
    {
      id: 'tmb_ranganatha_sringeri',
      trustId: 'trust_sringeri',
      userId: 'user_ranganatha_rao',
      status: 'ACTIVE',
      membershipType: 'FINANCE_STAFF'
    },
    {
      id: 'tmb_raghavan_ahobila',
      trustId: 'trust_ahobila',
      userId: 'user_raghavan_acharya',
      status: 'ACTIVE',
      membershipType: 'GOVERNANCE_HEAD'
    }
  ]).onConflictDoNothing();

  await db.insert(templeMemberships).values([
    {
      id: 'tmp_vidyaranya_svt',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      userId: 'user_vidyaranya',
      status: 'ACTIVE'
    },
    {
      id: 'tmp_vidyaranya_sst',
      trustId: 'trust_sringeri',
      templeId: 'temple_sharadamba',
      userId: 'user_vidyaranya',
      status: 'ACTIVE'
    },
    {
      id: 'tmp_subramanya_svt',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      userId: 'user_subramanya_bhat',
      status: 'ACTIVE'
    },
    {
      id: 'tmp_raghavan_lnt',
      trustId: 'trust_ahobila',
      templeId: 'temple_narasimha',
      userId: 'user_raghavan_acharya',
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 5. SEED STANDARD PERMISSION DEFINITIONS
  // ==========================================
  console.log('--> Seeding System Granular Permissions Catalog...');
  const permissionsCatalog = [
    // Trust Governance
    { id: 'p_trust_temple_create', namespace: 'trust', resourceType: 'temple', action: 'create', desc: 'Create new temples under Trust' },
    { id: 'p_trust_temple_manage', namespace: 'trust', resourceType: 'temple', action: 'manage', desc: 'Manage trust temple configurations' },
    { id: 'p_trust_finance_view', namespace: 'trust', resourceType: 'finance', action: 'view', desc: 'View aggregate trust-wide financial metrics' },
    { id: 'p_trust_finance_export', namespace: 'trust', resourceType: 'finance', action: 'export', desc: 'Export trust financial spreadsheets' },
    { id: 'p_trust_audit_read', namespace: 'trust', resourceType: 'audit', action: 'read', desc: 'Inspect trust audit trail & logs' },
    // Policy & RBAC
    { id: 'p_policy_role_create', namespace: 'policy', resourceType: 'role', action: 'create', desc: 'Create custom dynamic roles' },
    { id: 'p_policy_role_assign', namespace: 'policy', resourceType: 'role', action: 'assign', desc: 'Assign roles to staff & users' },
    { id: 'p_policy_role_revoke', namespace: 'policy', resourceType: 'role', action: 'revoke', desc: 'Revoke active role assignments' },
    // Temple Operations
    { id: 'p_temple_dashboard_view', namespace: 'temple', resourceType: 'dashboard', action: 'view', desc: 'View temple executive dashboard' },
    { id: 'p_temple_info_manage', namespace: 'temple', resourceType: 'info', action: 'manage', desc: 'Update temple contact & darshan timings' },
    { id: 'p_temple_facilities_manage', namespace: 'temple', resourceType: 'facilities', action: 'manage', desc: 'Configure guest amenities & choultry' },
    { id: 'p_temple_priest_view', namespace: 'temple', resourceType: 'priest', action: 'view', desc: 'View registered priests & acharyas' },
    { id: 'p_temple_priest_manage', namespace: 'temple', resourceType: 'priest', action: 'manage', desc: 'Add/edit priest profiles & specializations' },
    { id: 'p_temple_seva_view', namespace: 'temple', resourceType: 'seva', action: 'view', desc: 'Browse pooja offerings & rates' },
    { id: 'p_temple_seva_manage', namespace: 'temple', resourceType: 'seva', action: 'manage', desc: 'Create, price, and publish sevas' },
    { id: 'p_temple_roster_view', namespace: 'temple', resourceType: 'roster', action: 'view', desc: 'View 4-day duty shift roster' },
    { id: 'p_temple_roster_manage', namespace: 'temple', resourceType: 'roster', action: 'manage', desc: 'Assign shifts & resolve clashes' },
    { id: 'p_temple_booking_view', namespace: 'temple', resourceType: 'booking', action: 'view', desc: 'Browse booking calendar & rosters' },
    { id: 'p_temple_booking_create', namespace: 'temple', resourceType: 'booking', action: 'create', desc: 'Register devotee seva bookings' },
    { id: 'p_temple_booking_cancel', namespace: 'temple', resourceType: 'booking', action: 'cancel', desc: 'Cancel bookings & process refunds' },
    { id: 'p_temple_finance_view', namespace: 'temple', resourceType: 'finance', action: 'view', desc: 'View financial ledger & transactions' },
    { id: 'p_temple_finance_manage', namespace: 'temple', resourceType: 'finance', action: 'manage', desc: 'Manage payment states & approvals' },
    { id: 'p_temple_receipt_print', namespace: 'temple', resourceType: 'receipt', action: 'print', desc: 'Print thermal slips & official receipts' },
    { id: 'p_temple_prasadam_ship', namespace: 'temple', resourceType: 'prasadam', action: 'ship', desc: 'Manage remote prasadam postal shipments' },
    { id: 'p_temple_org_view', namespace: 'temple', resourceType: 'org', action: 'view', desc: 'View devasthanam organization tree' },
    { id: 'p_temple_org_manage', namespace: 'temple', resourceType: 'org', action: 'manage', desc: 'Restructure reporting lines & matrix nodes' },
    { id: 'p_temple_reports_view', namespace: 'temple', resourceType: 'reports', action: 'view', desc: 'View system telemetry & reports' }
  ];

  await db.insert(permissionDefinitions).values(
    permissionsCatalog.map(p => ({
      id: p.id,
      trustId: null, // System-wide standard permission
      namespace: p.namespace,
      resourceType: p.resourceType,
      action: p.action,
      description: p.desc,
      enforcementKey: `${p.namespace}.${p.resourceType}.${p.action}`,
      status: 'ACTIVE',
      version: 1
    }))
  ).onConflictDoNothing();

  // ==========================================
  // 6. SEED DYNAMIC ROLES & PERMISSION BINDINGS
  // ==========================================
  console.log('--> Seeding Dynamic Roles...');
  await db.insert(roles).values([
    // Trust-Wide Dharmadhikari Role
    {
      id: 'role_trust_apex',
      trustId: 'trust_sringeri',
      scopeType: 'TRUST',
      scopeId: 'trust_sringeri',
      name: 'Dharmadhikari Apex Governance',
      roleKey: 'dharmadhikari_apex',
      description: 'Unrestricted steward authority cascading across all temples in Sringeri Trust.',
      version: 1,
      isInheritable: true,
      status: 'ACTIVE'
    },
    // Temple Chief Archaka Role (Scoped to Vidyashankara Temple)
    {
      id: 'role_chief_archaka_svt',
      trustId: 'trust_sringeri',
      scopeType: 'TEMPLE',
      scopeId: 'temple_vidyashankara',
      name: 'Pradhana Archaka (Chief Priest)',
      roleKey: 'pradhana_archaka',
      description: 'Agamic leadership, ritual schedules, seva setup, and shift management at Vidyashankara Temple.',
      version: 1,
      isInheritable: true,
      status: 'ACTIVE'
    },
    // Temple Finance Officer Role
    {
      id: 'role_finance_officer_sringeri',
      trustId: 'trust_sringeri',
      scopeType: 'TRUST',
      scopeId: 'trust_sringeri',
      name: 'Devasthanam Finance & Accounts Officer',
      roleKey: 'finance_officer',
      description: 'Ledger management, receipt printing, and collection auditing across all Sringeri Temples.',
      version: 1,
      isInheritable: true,
      status: 'ACTIVE'
    },
    // Ahobila Matha Admin Role
    {
      id: 'role_ahobila_admin',
      trustId: 'trust_ahobila',
      scopeType: 'TRUST',
      scopeId: 'trust_ahobila',
      name: 'Ahobila Matha Executive Trustee',
      roleKey: 'ahobila_executive',
      description: 'Full administrative governance for Ahobila Devasthanam.',
      version: 1,
      isInheritable: true,
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // Bind All Permissions to Apex Role with ALL_DESCENDANTS cascade
  const allPerms = await db.query.permissionDefinitions.findMany();
  await db.insert(rolePermissions).values(
    allPerms.map(p => ({
      id: `rp_apex_${p.id}`,
      roleId: 'role_trust_apex',
      permissionId: p.id,
      effect: 'ALLOW',
      scopeMode: 'ALL_DESCENDANTS' // Cascades to all current and future temples under trust_sringeri
    }))
  ).onConflictDoNothing();

  // Bind Archaka permissions
  const archakaPermKeys = [
    'p_temple_dashboard_view',
    'p_temple_seva_view',
    'p_temple_seva_manage',
    'p_temple_priest_view',
    'p_temple_priest_manage',
    'p_temple_roster_view',
    'p_temple_roster_manage',
    'p_temple_booking_view',
    'p_temple_booking_create',
    'p_temple_receipt_print',
    'p_temple_org_view'
  ];
  await db.insert(rolePermissions).values(
    archakaPermKeys.map(pk => ({
      id: `rp_archaka_${pk}`,
      roleId: 'role_chief_archaka_svt',
      permissionId: pk,
      effect: 'ALLOW',
      scopeMode: 'EXACT'
    }))
  ).onConflictDoNothing();

  // Bind Ahobila Admin permissions
  await db.insert(rolePermissions).values(
    allPerms.map(p => ({
      id: `rp_ahobila_${p.id}`,
      roleId: 'role_ahobila_admin',
      permissionId: p.id,
      effect: 'ALLOW',
      scopeMode: 'ALL_DESCENDANTS'
    }))
  ).onConflictDoNothing();

  // ==========================================
  // 7. SEED ROLE ASSIGNMENTS
  // ==========================================
  console.log('--> Seeding Role Assignments...');
  await db.insert(roleAssignments).values([
    {
      id: 'assign_vidyaranya_apex',
      trustId: 'trust_sringeri',
      roleId: 'role_trust_apex',
      userId: 'user_vidyaranya',
      scopeId: 'trust_sringeri',
      assignmentSource: 'DIRECT',
      status: 'ACTIVE'
    },
    {
      id: 'assign_subramanya_archaka',
      trustId: 'trust_sringeri',
      roleId: 'role_chief_archaka_svt',
      userId: 'user_subramanya_bhat',
      scopeId: 'temple_vidyashankara',
      assignmentSource: 'DIRECT',
      status: 'ACTIVE'
    },
    {
      id: 'assign_raghavan_ahobila',
      trustId: 'trust_ahobila',
      roleId: 'role_ahobila_admin',
      userId: 'user_raghavan_acharya',
      scopeId: 'trust_ahobila',
      assignmentSource: 'DIRECT',
      status: 'ACTIVE'
    }
  ]).onConflictDoNothing();

  // Policy version publication
  await db.insert(policyVersions).values([
    {
      id: 'pv_sringeri_1',
      trustId: 'trust_sringeri',
      versionNumber: 1,
      status: 'PUBLISHED',
      publishedBy: 'user_vidyaranya',
      changeSummary: 'Initial baseline dynamic RBAC policy published.'
    },
    {
      id: 'pv_ahobila_1',
      trustId: 'trust_ahobila',
      versionNumber: 1,
      status: 'PUBLISHED',
      publishedBy: 'user_raghavan_acharya',
      changeSummary: 'Initial Ahobila Matha policy published.'
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 8. SEED TEMPLE MASTER DATA & SETTINGS
  // ==========================================
  console.log('--> Seeding Temple Master Data...');
  await db.insert(templeSettings).values([
    {
      id: 'sett_vidyashankara',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      tagline: 'Ancient 14th-century architectural marvel and Agamic sanctum on the Tunga River',
      description: 'Consecrated by Sri Bharati Tirtha and Sri Vidyaranya in memory of Guru Sri Vidyashankara Tirtha. The temple features 12 zodiac pillars (Rashi Stambhas) upon which the sun rays fall in solar sequence.',
      hotline: '+91 82652 50123',
      officialEmail: 'vidyashankara@sringeritemple.org',
      websiteUrl: 'https://sringeri.net/temples/vidyashankara',
      mapsUrl: 'https://maps.google.com/?q=Sringeri+Sharada+Peetham',
      photos: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuANcPfzsfum8zGj2STDpP_Eds0xOoXxtm_OjHwVkP2MZOW3999u6oVf8P-7GeIMQA1hFSnmMM-gxsed4iDD-ruqP0OJKhI0LBMl2OTllKr3RJspedpV9pOsdDyz43dF_teOB1cC39MQgm579_rgeQq4Evh6iDEqE4aFi5LR5E3SLkqyCjsFrlyNnt_YF1ph80p1i-M4ec2yFc2A9oBE9U3sOA8W64XAiqtD-IxdDQLuoEYwwIz6gU1SePMjmWX2QVVSn1bT8aiesII'
      ],
      primaryPhotoIndex: 0
    }
  ]).onConflictDoNothing();

  // Temple Schedules (4 Tiers)
  await db.insert(templeSchedules).values([
    {
      id: 'sched_svt_normal',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      scheduleType: 'NORMAL',
      title: 'Normal Weekday Schedule (Mon - Fri)',
      morningDarshan: '06:00 AM - 02:00 PM',
      eveningDarshan: '05:00 PM - 09:00 PM',
      specialNotes: 'Mahamangalarathi at 12:00 PM and 08:30 PM daily.',
      isActive: true
    },
    {
      id: 'sched_svt_weekend',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      scheduleType: 'WEEKEND',
      title: 'Weekend & Holiday Darshan (Sat - Sun)',
      morningDarshan: '05:30 AM - 02:30 PM',
      eveningDarshan: '04:30 PM - 09:30 PM',
      specialNotes: 'Continuous sanctum queue without afternoon closure.',
      isActive: true
    }
  ]).onConflictDoNothing();

  // Temple Facilities
  await db.insert(templeFacilities).values([
    {
      id: 'fac_svt_choultry',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      facilityKey: 'guest_choultry',
      title: 'Yatri Nivas & Guest Choultry',
      description: 'Clean Vedic guest rooms and air-cooled suites for visiting pilgrims and sadhakas.',
      iconName: 'Building',
      isEnabled: true,
      capacity: 350
    },
    {
      id: 'fac_svt_annadana',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      facilityKey: 'annadana_bhojanasala',
      title: 'Sri Bharati Tirtha Nitya Annadana Hall',
      description: 'Sacred Mahaprasadam served twice daily to over 5,000 devotees in pure traditional seated pankti format.',
      iconName: 'Utensils',
      isEnabled: true,
      capacity: 2500
    }
  ]).onConflictDoNothing();

  // ==========================================
  // 9. SEED SEVAS & POOJAS
  // ==========================================
  console.log('--> Seeding Sevas...');
  await db.insert(sevas).values([
    {
      id: 'seva_svt_rudrabhisheka',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      code: 'SEVA-RUD-01',
      name: 'Mahanyasa Poorvaka Ekadasa Rudrabhishekam',
      category: 'Daily',
      description: 'Principal Agamic sanctum abhisheka with sacred cow milk, panchamrita, and Vedic chanting of Sri Rudram by 11 Ritwiks.',
      instructions: 'Devotees are requested to report in traditional attire (Dhoti/Uttariyam or Saree) 30 minutes prior to Sankalpa.',
      price: '1500.00',
      includedPersons: 2,
      extraPersonPrice: '250.00',
      maxCapacityPerSlot: 40,
      durationMinutes: 90,
      reportingTime: '06:30 AM',
      timingsDisplay: '07:00 AM - 08:30 AM',
      isActive: true
    },
    {
      id: 'seva_svt_sahasranama',
      trustId: 'trust_sringeri',
      templeId: 'temple_vidyashankara',
      code: 'SEVA-SAH-02',
      name: 'Sri Vidya Sahasranama Kumkumarchana',
      category: 'Daily',
      description: 'Devout 1,008 sacred names recitation with energized vermilion at the sanctum pedam.',
      instructions: 'Sacred prasadam packet including energized kumkum box will be provided after mangalarathi.',
      price: '500.00',
      includedPersons: 1,
      extraPersonPrice: '100.00',
      maxCapacityPerSlot: 100,
      durationMinutes: 45,
      reportingTime: '09:00 AM',
      timingsDisplay: '09:30 AM - 10:15 AM',
      isActive: true
    }
  ]).onConflictDoNothing();

  console.log('✅ Development Seed Completed Successfully!');
}
