import { PermissionKey, ALL_PERMISSIONS } from '../../utils/permissions';

export type DepartmentType = 'Spiritual' | 'Admin' | 'Operations' | 'Finance';
export type StaffStatus = 'Active' | 'On Leave' | 'Duty-Assign';

export type TrusteeType = 
  | 'Managing Trustee / Dharmadhikari'
  | 'Hereditary Trustee (Vamshaparamparya)'
  | 'Endowment / Govt Nominated Trustee'
  | 'Elected Board Trustee'
  | 'Advisory Committee Member'
  | 'Non-Trustee Staff';

export type OfficeBearerRole = 
  | 'President / Chairman'
  | 'Vice President'
  | 'General Secretary'
  | 'Treasurer / Bhandari'
  | 'Joint Secretary'
  | 'Executive Committee Member'
  | 'None';

export type CadreRank = 
  | 'Apex Governance & Trust Board'
  | 'Sanctum & Agama Leadership'
  | 'Departmental Superintendent'
  | 'Operational Officer & Desk'
  | 'Sanctum Sevaka & Staff'
  | 'Voluntary Sevarthi';

export const SUB_DEPARTMENTS: Record<DepartmentType, string[]> = {
  Spiritual: [
    'Main Sanctum (Garbhagriha & Moolasthanam)',
    'Utsavam & Special Festivals Wing',
    'Veda, Agama & Sthothra Pathashala',
    'Yagasala & Homakunda Wing',
    'Gosala (Sacred Cattle Sanctuary)'
  ],
  Admin: [
    'Executive Secretariat & Trust Office',
    'Devotee Seva Booking Desk',
    'Temple Estate, Lands & Legal Affairs',
    'Devotee Relations & Public Grievances',
    'Personnel & HR Management'
  ],
  Operations: [
    'Holy Prasadam & Annadanam Kitchen',
    'Crowd Management & Security Wing',
    'Choultry, Cottages & Pilgrim Accommodations',
    'Sanitation, Cleaning & Green Campus',
    'IT, CCTV & Live Broadcast'
  ],
  Finance: [
    'Sacred Treasury (Hundi & Bullion Vault)',
    'Accounts, Audit & GST Reconciliation',
    'Devotee Donations & Corpus Fund',
    'Procurement, Stores & Inventory'
  ]
};

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: DepartmentType;
  subDepartment?: string;
  reportsTo: string | null; // Primary supervisor ID
  secondaryReports: string[]; // Secondary / Matrix supervisor IDs
  avatar?: string;
  phone?: string;
  email?: string;
  status: StaffStatus;
  responsibilities?: string;
  location?: string;
  joinedYear?: string;
  permissions?: PermissionKey[]; // Dynamic RBAC permissions granted to this staff / designation
  
  // Temple Governance & Trust Classification
  isTrustee?: boolean;
  trusteeType?: TrusteeType;
  isOfficeBearer?: boolean;
  officeBearerRole?: OfficeBearerRole;
  cadreRank?: CadreRank;
  termStart?: string;
  termEnd?: string;
  resolutionNo?: string;
}

export interface BentoNodeData {
  staff: StaffMember;
  onEdit: (staff: StaffMember) => void;
  onDelete: (id: string) => void;
  onAddSubordinate: (parentStaff: StaffMember) => void;
  onAddMatrixRelation: (targetStaff: StaffMember) => void;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  primaryManagerName?: string;
  secondaryManagerNames?: string[];
  reporteeCount?: number;
  matrixReporteeCount?: number;
}

export const DEFAULT_STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Sri Vidyaranya Shastri',
    role: 'Executive Officer / Dharmadhikari',
    department: 'Admin',
    subDepartment: 'Executive Secretariat & Trust Office',
    reportsTo: null,
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 11000',
    email: 'dharmadhikari@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Overall temple administrative governance & trust stewardship',
    location: 'Central Administrative Secretariat',
    joinedYear: '2016',
    isTrustee: true,
    trusteeType: 'Managing Trustee / Dharmadhikari',
    isOfficeBearer: true,
    officeBearerRole: 'President / Chairman',
    cadreRank: 'Apex Governance & Trust Board',
    termStart: '2022-01-01',
    termEnd: '2027-12-31',
    resolutionNo: 'TR-2022/01',
    permissions: [...ALL_PERMISSIONS]
  },
  {
    id: 'staff-2',
    name: 'Raghavan Bhattar',
    role: 'Chief Archaka (Pradhana Acharya)',
    department: 'Spiritual',
    subDepartment: 'Main Sanctum (Garbhagriha & Moolasthanam)',
    reportsTo: 'staff-1',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 12345',
    email: 'raghavan.bhattar@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Maha Samprokshanam, Garbhagriha Agamic sanctum rituals & Veda Parayana',
    location: 'Main Sanctum (Moolasthanam)',
    joinedYear: '2012',
    isTrustee: true,
    trusteeType: 'Hereditary Trustee (Vamshaparamparya)',
    isOfficeBearer: true,
    officeBearerRole: 'Vice President',
    cadreRank: 'Sanctum & Agama Leadership',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'MANAGE_SEVAS',
      'VIEW_PRIESTS',
      'MANAGE_PRIESTS',
      'VIEW_ROSTER',
      'MANAGE_ROSTER',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'VIEW_ORG_CHART',
      'MANAGE_TEMPLE_INFO',
      'PRINT_RECEIPTS'
    ]
  },
  {
    id: 'staff-3',
    name: 'V. Sundaresan',
    role: 'Chief Administrative Officer',
    department: 'Admin',
    subDepartment: 'Personnel & HR Management',
    reportsTo: 'staff-1',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 33445',
    email: 'sundaresan.cao@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Operational budget, temple estate operations, government protocol',
    location: 'Administration Wing Block A',
    joinedYear: '2018',
    isTrustee: false,
    trusteeType: 'Non-Trustee Staff',
    isOfficeBearer: true,
    officeBearerRole: 'General Secretary',
    cadreRank: 'Departmental Superintendent',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_BOOKINGS',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'VIEW_ORG_CHART',
      'MANAGE_ORG_CHART',
      'MANAGE_STAFF',
      'MANAGE_TEMPLE_INFO',
      'MANAGE_FACILITIES',
      'VIEW_REPORTS',
      'EXPORT_REPORTS',
      'MANAGE_SETTINGS'
    ]
  },
  {
    id: 'staff-4',
    name: 'Sunder Raman Dikshidar',
    role: 'Senior Archaka & Yajnadhikari',
    department: 'Spiritual',
    reportsTo: 'staff-2',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 67890',
    email: 'sunder.raman@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Homa Kunda vidhis, Chandi Homa, Vivaha Samskaras',
    location: 'Yagashala Complex',
    joinedYear: '2019',
    permissions: [
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_ROSTER',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS'
    ]
  },
  {
    id: 'staff-5',
    name: 'Madhavan Shastri',
    role: 'Archaka & Agama Scholar',
    department: 'Spiritual',
    reportsTo: 'staff-2',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    phone: '+91 97321 44556',
    email: 'madhavan.shastri@sankalpvani.org',
    status: 'Duty-Assign',
    responsibilities: 'Daily Nitya Sevas, Abhisheka & Vahan Pujas',
    location: 'North Sannidhi',
    joinedYear: '2021',
    permissions: [
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_ROSTER',
      'VIEW_BOOKINGS'
    ]
  },
  {
    id: 'staff-6',
    name: 'Smt. Gayatri Devi',
    role: 'Seva & Devotee Booking Superintendent',
    department: 'Admin',
    reportsTo: 'staff-3',
    secondaryReports: ['staff-2'], // Matrix reporting to Chief Archaka for ritual calendar & slot approval
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 77881',
    email: 'seva.coordinator@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Devotee online portal slots, Sankalpam registry, Priest allocation',
    location: 'Seva Counters & Helpdesk',
    joinedYear: '2020',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_SEVAS',
      'VIEW_BOOKINGS',
      'REGISTER_BOOKINGS',
      'VIEW_ROSTER',
      'PRINT_RECEIPTS',
      'VIEW_FINANCE'
    ]
  },
  {
    id: 'staff-7',
    name: 'K. Narayana Murthy',
    role: 'Prasadam & Annadanam Superintendent',
    department: 'Admin',
    reportsTo: 'staff-3',
    secondaryReports: ['staff-2'], // Matrix reporting to Chief Archaka for Madi Kitchen & Naivedyam timing
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 99221',
    email: 'annadanam@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Madapalli sacred kitchen supply chain, prasadam distribution, food safety',
    location: 'Annadana Mandapam & Kitchen',
    joinedYear: '2019',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_BOOKINGS',
      'PROCESS_LOGISTICS',
      'PRINT_SHIPPING_LABELS',
      'EXPORT_REPORTS'
    ]
  },
  {
    id: 'staff-8',
    name: 'Ganesha Dikshidar',
    role: 'Veda Parayana & Rigveda Shastri',
    department: 'Spiritual',
    reportsTo: 'staff-4',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98888 77766',
    email: 'ganesha.dikshidar@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Morning and evening Veda recital, Upanayana blessings',
    location: 'Veda Pathashala Hall',
    joinedYear: '2023',
    permissions: [
      'VIEW_SEVAS',
      'VIEW_PRIESTS',
      'VIEW_ROSTER',
      'VIEW_BOOKINGS'
    ]
  },
  {
    id: 'staff-9',
    name: 'R. Parthasarathy',
    role: 'Accounts & Hundi Treasury Officer',
    department: 'Finance',
    reportsTo: 'staff-3',
    secondaryReports: [],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 44332',
    email: 'treasury@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Hundi counting audits, donation reconciliation, bank disbursements',
    location: 'Treasury Vault & Accounts',
    joinedYear: '2017',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_FINANCE',
      'MANAGE_FINANCE',
      'VIEW_BOOKINGS',
      'CANCEL_BOOKINGS',
      'PRINT_RECEIPTS',
      'VIEW_REPORTS',
      'EXPORT_REPORTS'
    ]
  },
  {
    id: 'staff-10',
    name: 'Capt. C. Mahadevan (Retd.)',
    role: 'Security & Crowd Management In-Charge',
    department: 'Operations',
    reportsTo: 'staff-3',
    secondaryReports: ['staff-2'], // Matrix reporting to Chief Archaka during Utsavam procession security
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98450 55112',
    email: 'security@sankalpvani.org',
    status: 'Active',
    responsibilities: 'Utsava ratha yatra safety, CCTV monitoring, Q-line management',
    location: 'Security Control Room',
    joinedYear: '2022',
    permissions: [
      'DASHBOARD_VIEW',
      'VIEW_ORG_CHART',
      'VIEW_BOOKINGS',
      'VIEW_ROSTER'
    ]
  }
];

export const DEPARTMENT_CONFIG: Record<DepartmentType, {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  borderLeftClass: string;
  glowColor: string;
  colorHex: string;
  accentBg: string;
}> = {
  Spiritual: {
    label: 'Spiritual (Purohit/Archaka)',
    badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
    badgeText: 'text-amber-800',
    borderColor: '#ff7700',
    borderLeftClass: 'border-l-[6px] border-l-[#ff7700]',
    glowColor: 'rgba(255, 119, 0, 0.22)',
    colorHex: '#ff7700',
    accentBg: 'bg-orange-50'
  },
  Admin: {
    label: 'Administration & Governance',
    badgeBg: 'bg-yellow-100 text-yellow-900 border border-yellow-300',
    badgeText: 'text-yellow-800',
    borderColor: '#d4af37',
    borderLeftClass: 'border-l-[6px] border-l-[#d4af37]',
    glowColor: 'rgba(212, 175, 55, 0.22)',
    colorHex: '#d4af37',
    accentBg: 'bg-yellow-50'
  },
  Operations: {
    label: 'Operations & Security',
    badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    badgeText: 'text-emerald-800',
    borderColor: '#059669',
    borderLeftClass: 'border-l-[6px] border-l-[#059669]',
    glowColor: 'rgba(5, 150, 105, 0.22)',
    colorHex: '#059669',
    accentBg: 'bg-emerald-50'
  },
  Finance: {
    label: 'Treasury & Accounts',
    badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300',
    badgeText: 'text-blue-800',
    borderColor: '#2563eb',
    borderLeftClass: 'border-l-[6px] border-l-[#2563eb]',
    glowColor: 'rgba(37, 99, 235, 0.22)',
    colorHex: '#2563eb',
    accentBg: 'bg-blue-50'
  }
};
