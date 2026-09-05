export type MasterType = 'TRUSTEE_CATEGORY' | 'MEMBERSHIP_TYPE' | 'COMMITTEE_CATEGORY';

export interface MasterCategoryItem {
  id: string;
  trustId: string;
  type: MasterType;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isSystemDefault?: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TRUSTEE_CATEGORIES: Array<Omit<MasterCategoryItem, 'id' | 'trustId' | 'createdAt' | 'updatedAt'>> = [
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'MANAGING_TRUSTEE',
    name: 'Managing Trustee / Dharmadhikari',
    description: 'Apex custodian of spiritual, agamic, and administrative trust governance',
    color: 'amber',
    icon: 'Crown',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 1
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'HEREDITARY_TRUSTEE',
    name: 'Hereditary Trustee (Vamshaparamparya)',
    description: 'Traditional lineage-based custodian with ancestral hereditary rights',
    color: 'purple',
    icon: 'Shield',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 2
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'GOVT_NOMINATED',
    name: 'Endowment / Govt Nominated Trustee',
    description: 'Representative appointed by the State Hindu Religious & Charitable Endowments department',
    color: 'blue',
    icon: 'Building2',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 3
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'ELECTED_BOARD',
    name: 'Elected Board Trustee',
    description: 'Elected governing board member with executive fiduciary responsibilities',
    color: 'emerald',
    icon: 'Users',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 4
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'LIFE_TRUSTEE',
    name: 'Life Trustee',
    description: 'Lifetime board appointment with permanent advisory and voting privileges',
    color: 'yellow',
    icon: 'Award',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 5
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'HONORARY_PATRON',
    name: 'Honorary Patron',
    description: 'Distinguished philanthropist or spiritual luminary serving in an honorary capacity',
    color: 'rose',
    icon: 'Sparkles',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 6
  },
  {
    type: 'TRUSTEE_CATEGORY',
    code: 'ADVISORY_MEMBER',
    name: 'Advisory Committee Member',
    description: 'Specialist advisor providing guidance on legal, financial, or agama protocols',
    color: 'teal',
    icon: 'FileText',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 7
  }
];

export const DEFAULT_MEMBERSHIP_TYPES: Array<Omit<MasterCategoryItem, 'id' | 'trustId' | 'createdAt' | 'updatedAt'>> = [
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'TRUSTEE',
    name: 'Trustees & Board',
    description: 'Fiduciary custodians holding active board appointments and voting rights',
    color: 'amber',
    icon: 'Crown',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 1
  },
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'PRIEST',
    name: 'Acharyas & Priests',
    description: 'Sanctum archakas, paricharakars, and agamic scholars performing daily rituals',
    color: 'rose',
    icon: 'Sparkles',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 2
  },
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'STAFF',
    name: 'Temple Staff',
    description: 'Administrative, treasury, kitchen, and facilities operational personnel',
    color: 'blue',
    icon: 'Building2',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 3
  },
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'VOLUNTEER',
    name: 'Seva Volunteers',
    description: 'Registered devotees contributing seva during festivals, annadanam, and darshan queues',
    color: 'emerald',
    icon: 'Users',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 4
  },
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'DONOR',
    name: 'Patrons & Donors',
    description: 'Endowment benefactors, nitya-annadana donors, and gold/silver seva sponsors',
    color: 'purple',
    icon: 'Award',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 5
  },
  {
    type: 'MEMBERSHIP_TYPE',
    code: 'STANDARD',
    name: 'General Members',
    description: 'Devotee community members participating in temple sevas and public updates',
    color: 'zinc',
    icon: 'User',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 6
  }
];

export const DEFAULT_COMMITTEE_CATEGORIES: Array<Omit<MasterCategoryItem, 'id' | 'trustId' | 'createdAt' | 'updatedAt'>> = [
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'FESTIVAL',
    name: 'Festival & Utsavam',
    description: 'Brahmotsavam, Rathotsavam, Navaratri, and special religious processions',
    color: 'amber',
    icon: 'Sparkles',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 1
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'AGAMA_VEDA',
    name: 'Agama & Veda Vidwat Sabha',
    description: 'Preservation of agamic rites, veda pathashala supervision, and priest certifications',
    color: 'rose',
    icon: 'BookOpen',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 2
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'ANNADANAM',
    name: 'Annadanam & Madi Kitchen',
    description: 'Strict madi prasadam supervision, pilgrim feast distribution, and kitchen logistics',
    color: 'emerald',
    icon: 'Utensils',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 3
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'FINANCE',
    name: 'Finance & Audit Committee',
    description: 'Hundi collections verification, annual audit, statutory compliance, and treasury',
    color: 'blue',
    icon: 'Landmark',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 4
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'RENOVATION',
    name: 'Temple Renovation & Shilpa',
    description: 'Gopuram repairs, sanctum preservation, stone carvings, and Kumbhabhishekam works',
    color: 'purple',
    icon: 'Hammer',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 5
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'SECURITY',
    name: 'Security & Crowd Management',
    description: 'Pilgrim safety, queue management, CCTV monitoring, and disaster preparedness',
    color: 'teal',
    icon: 'Shield',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 6
  },
  {
    type: 'COMMITTEE_CATEGORY',
    code: 'DISCIPLINARY',
    name: 'Ethics & Grievances',
    description: 'Staff conduct, dispute mediation, devotee grievance redressal, and code of conduct',
    color: 'red',
    icon: 'FileWarning',
    isSystemDefault: true,
    status: 'ACTIVE',
    orderIndex: 7
  }
];
