import { z } from 'zod';

/**
 * 5MB File size constraint in bytes (5 * 1024 * 1024)
 */
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENT_SIZE_LABEL = '5MB';

/**
 * Zod Schema: Schedule a New Governance Meeting
 */
export const scheduleMeetingSchema = z.object({
  title: z
    .string()
    .min(3, 'Meeting title must be at least 3 characters')
    .max(150, 'Meeting title must not exceed 150 characters'),
  scheduledAt: z
    .string()
    .min(1, 'Meeting date & time is required'),
  committeeId: z
    .string()
    .optional()
    .nullable(),
  inviteeIds: z
    .array(z.string())
    .min(1, 'Please select at least one invitee for this meeting'),
  agenda: z
    .string()
    .max(20000, 'Agenda details must not exceed 20,000 characters')
    .optional()
    .nullable(),
  location: z
    .string()
    .max(200, 'Location must not exceed 200 characters')
    .optional()
    .nullable(),
});

export type ScheduleMeetingInput = z.infer<typeof scheduleMeetingSchema>;

/**
 * Zod Schema: Publish Minutes of Meeting (MoM)
 * Specifically includes a custom .refine() rule on the attachment field to enforce a strict 5MB maximum file size.
 */
export const publishMoMSchema = z.object({
  meetingId: z
    .string()
    .min(1, 'Meeting ID is required'),
  momText: z
    .string()
    .min(20, 'Minutes of Meeting (MoM) text must be at least 20 characters to capture key decisions'),
  attachment: z
    .any()
    .optional()
    .nullable()
    .refine(
      (file) => {
        if (!file) return true;
        // Check standard browser File instance
        if (typeof window !== 'undefined' && typeof File !== 'undefined' && file instanceof File) {
          return file.size <= MAX_ATTACHMENT_SIZE_BYTES;
        }
        // Check file object containing size property (e.g. from state or drag-drop)
        if (typeof file === 'object' && 'size' in file && typeof file.size === 'number') {
          return file.size <= MAX_ATTACHMENT_SIZE_BYTES;
        }
        return true;
      },
      {
        message: `Attachment file exceeds the maximum allowed size of ${MAX_ATTACHMENT_SIZE_LABEL} (5,242,880 bytes). Please upload a smaller document.`,
      }
    ),
});

export type PublishMoMInput = z.infer<typeof publishMoMSchema>;

// ==========================================
// Types for UI State & Presentation
// ==========================================

export interface MeetingInviteeItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  designation: string;
  rsvpStatus: 'ACCEPTED' | 'PENDING' | 'DECLINED';
  committeeIds?: string[];
  isExternal?: boolean;
  organization?: string;
}

export interface AttachmentMetadata {
  id: string;
  name: string;
  sizeBytes: number;
  formattedSize: string;
  mimeType: string;
  url: string;
}

export interface MeetingNoteItem {
  id: string;
  meetingId: string;
  momText: string;
  attachmentUrls: AttachmentMetadata[];
  publishedAt: string;
  publishedByUserId: string;
  publishedByName: string;
  publishedByDesignation: string;
  resolutionNumber?: string;
}

export interface MeetingItem {
  id: string;
  trustId: string;
  title: string;
  scheduledAt: string; // ISO String
  hostUserId: string;
  hostName: string;
  hostAvatar: string;
  hostDesignation: string;
  committeeId?: string | null;
  committeeName?: string | null;
  committeeCategory?: string | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  agenda?: string | null;
  location?: string;
  invitees: MeetingInviteeItem[];
  notes?: MeetingNoteItem | null;
  createdAt: string;
}

// ==========================================
// Realistic Mock Data for Interactive Demos
// ==========================================

export const MOCK_GOVERNANCE_COMMITTEES = [
  { id: 'comm_apex', name: 'Apex Dharmika Board', category: 'STANDING' },
  { id: 'comm_jeerno', name: 'Jeernodharana & Renovation Committee', category: 'RENOVATION' },
  { id: 'comm_utsavam', name: 'Maha Utsavam & Festival Steering Wing', category: 'FESTIVAL' },
  { id: 'comm_finance', name: 'Finance, Hundi & Treasury Advisory', category: 'FINANCE' },
  { id: 'comm_agama', name: 'Agama Sastra & Archaka Council', category: 'ADVISORY' },
  { id: 'comm_legal', name: 'Endowment Legal & Land Affairs Panel', category: 'LEGAL' },
];

export const MOCK_GOVERNANCE_MEMBERS: MeetingInviteeItem[] = [
  {
    id: 'usr_dharmadhikari',
    name: 'Sri V. R. Gowrishankar',
    email: 'dharmadhikari@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    designation: 'CEO & Dharmadhikari',
    rsvpStatus: 'ACCEPTED',
    committeeIds: ['comm_apex', 'comm_jeerno', 'comm_utsavam', 'comm_finance', 'comm_agama', 'comm_legal'],
  },
  {
    id: 'usr_archaka',
    name: 'Veda Brahma Sri Shankara Bhatta',
    email: 'archaka.head@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    designation: 'Pradhana Archaka (Chief Priest)',
    rsvpStatus: 'ACCEPTED',
    committeeIds: ['comm_apex', 'comm_utsavam', 'comm_agama'],
  },
  {
    id: 'usr_eo',
    name: 'Dr. K. N. Srikumar, IAS (Retd.)',
    email: 'executive.officer@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    designation: 'Executive Officer (EO)',
    rsvpStatus: 'ACCEPTED',
    committeeIds: ['comm_apex', 'comm_jeerno', 'comm_utsavam', 'comm_finance', 'comm_legal'],
  },
  {
    id: 'usr_bhandari',
    name: 'Sri B. S. Subbaraya',
    email: 'treasury@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    designation: 'Bhandari & Finance Custodian',
    rsvpStatus: 'PENDING',
    committeeIds: ['comm_apex', 'comm_utsavam', 'comm_finance'],
  },
  {
    id: 'usr_sthapathi',
    name: 'Shilpakala Praveena K. Radhakrishnan',
    email: 'sthapathi.temple@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    designation: 'Chief Temple Architect (Sthapathi)',
    rsvpStatus: 'ACCEPTED',
    committeeIds: ['comm_jeerno', 'comm_utsavam', 'comm_agama'],
  },
  {
    id: 'usr_legal',
    name: 'Advocate P. Narayana Murthy',
    email: 'legal.counsel@sringeri.org',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    designation: 'Senior Legal Advisor',
    rsvpStatus: 'PENDING',
    committeeIds: ['comm_finance', 'comm_legal', 'comm_apex'],
  },
];

export const INITIAL_UPCOMING_MEETINGS: MeetingItem[] = [
  {
    id: 'mtg_up_01',
    trustId: 'trust_sringeri',
    title: 'Q3 Executive Trust Board - Maha Deepotsavam & Sanctum Security Review',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // In ~2 days
    hostUserId: 'usr_dharmadhikari',
    hostName: 'Sri V. R. Gowrishankar',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'CEO & Dharmadhikari',
    committeeId: 'comm_apex',
    committeeName: 'Apex Dharmika Board',
    committeeCategory: 'STANDING',
    status: 'SCHEDULED',
    location: 'Sri Sringeri Sharada Peetham Boardroom, Vidyaniketan Block',
    agenda: '1. Maha Deepotsavam oil and brass diya procurement tender.\n2. Security deployment and pilgrim queue management protocol.\n3. Sanction of honorarium for Veda Pathashala vidyarthies on festival duty.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[1],
      MOCK_GOVERNANCE_MEMBERS[2],
      MOCK_GOVERNANCE_MEMBERS[3],
    ],
    notes: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mtg_up_02',
    trustId: 'trust_sringeri',
    title: 'Jeernodharana Sub-Committee: North Rajagopuram Gold Gilding & Granite Restoration',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // In ~5 days
    hostUserId: 'usr_sthapathi',
    hostName: 'Shilpakala Praveena K. Radhakrishnan',
    hostAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'Chief Temple Architect (Sthapathi)',
    committeeId: 'comm_jeerno',
    committeeName: 'Jeernodharana & Renovation Committee',
    committeeCategory: 'RENOVATION',
    status: 'SCHEDULED',
    location: 'Gopuram Heritage Site Office & Virtual Sync',
    agenda: '1. Review of architectural structural inspection report by Agama Sastra experts.\n2. Approval of copper plate fabrication and 24-karat gold foil electrolysis process.\n3. Scaffold safety protocols during ongoing darshan timings.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[2],
      MOCK_GOVERNANCE_MEMBERS[4],
    ],
    notes: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mtg_up_03',
    trustId: 'trust_sringeri',
    title: 'Treasury & Hundi Audit Committee: Shravana Masa Reconciliation & FD Renewals',
    scheduledAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), // In ~9 days
    hostUserId: 'usr_bhandari',
    hostName: 'Sri B. S. Subbaraya',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'Bhandari & Finance Custodian',
    committeeId: 'comm_finance',
    committeeName: 'Finance, Hundi & Treasury Advisory',
    committeeCategory: 'FINANCE',
    status: 'SCHEDULED',
    location: 'Central Treasury Counting Chamber (CCTV Zone)',
    agenda: '1. Verification of bullion (gold & silver) weights recorded during Shravana Masa hundi opening sessions.\n2. Competitive interest rate appraisal from nationalized banks for trust corpus fixed deposits.\n3. Annual statutory audit preparation schedule.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[2],
      MOCK_GOVERNANCE_MEMBERS[3],
      MOCK_GOVERNANCE_MEMBERS[5],
    ],
    notes: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_PAST_MOMS: MeetingItem[] = [
  {
    id: 'mtg_past_01',
    trustId: 'trust_sringeri',
    title: 'Sharada Sharannavaratri Utsavam 2026 - Master Operational Resolution',
    scheduledAt: '2026-09-24T10:00:00.000Z',
    hostUserId: 'usr_dharmadhikari',
    hostName: 'Sri V. R. Gowrishankar',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'CEO & Dharmadhikari',
    committeeId: 'comm_utsavam',
    committeeName: 'Maha Utsavam & Festival Steering Wing',
    committeeCategory: 'FESTIVAL',
    status: 'COMPLETED',
    location: 'Sri Sharada Peetham Board Room',
    agenda: 'Final sanction of Navaratri festival budget, Annadanam logistics for 100,000 devotees, and sacred Alankara schedule.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[1],
      MOCK_GOVERNANCE_MEMBERS[2],
      MOCK_GOVERNANCE_MEMBERS[3],
      MOCK_GOVERNANCE_MEMBERS[4],
    ],
    notes: {
      id: 'mom_01',
      meetingId: 'mtg_past_01',
      resolutionNumber: 'RES-TR-2026/09-04',
      publishedAt: '2026-09-24T17:30:00.000Z',
      publishedByUserId: 'usr_eo',
      publishedByName: 'Dr. K. N. Srikumar, IAS (Retd.)',
      publishedByDesignation: 'Executive Officer (EO)',
      momText: `### 1. Opening Prayer & Quorum Verification
The session commenced with the recitation of the *Sharada Gayatri Mantra* and *Guru Vandanam*. The Convener verified the presence of the requisite quorum (5 of 5 voting members present).

### 2. Resolutions Passed & Approvals
- **Resolution 1 (Alankara Schedule):** The sanctum daily alankara schedule for Goddess Sharadamba across all 9 days (Brahmi, Maheshwari, Kaumari, Vaishnavi, Varahi, Indrani, Chamundi, Rajarajeshwari, Durga) was unanimously approved in strict accordance with *Agama Sastra*.
- **Resolution 2 (Annadanam Provisioning):** Sanctioned budget of **₹ 48,50,000/-** for continuous Maha-Annadanam for an estimated 1,20,000 pilgrims during the Navaratri fortnight.
- **Resolution 3 (Veda Parayanam):** Approved honorarium and lodgings for 64 visiting Ghanapaathis from Rig, Krishna Yajur, and Sama Veda shakhas.

### 3. Action Items & Assignees
1. **Pradhana Archaka Sri Shankara Bhatta:** Finalize sacred thailam, chandan, and bilva patra suppliers by September 28.
2. **Executive Officer Dr. Srikumar:** Coordinate barricading and crowd management with district police superintendent.
3. **Bhandari Sri Subbaraya:** Issue token advances for kitchen supplies and grocery consignments.

---
*Signed and sealed under the sacred authority of the Executive Board of Sri Sringeri Sharada Peetham.*`,
      attachmentUrls: [
        {
          id: 'att_01',
          name: 'Navaratri_2026_Budget_Breakup_Signed.pdf',
          sizeBytes: 2450000,
          formattedSize: '2.34 MB',
          mimeType: 'application/pdf',
          url: '#',
        },
        {
          id: 'att_02',
          name: 'Agama_Alankara_Order_Gazette.pdf',
          sizeBytes: 1120000,
          formattedSize: '1.07 MB',
          mimeType: 'application/pdf',
          url: '#',
        },
      ],
    },
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'mtg_past_02',
    trustId: 'trust_sringeri',
    title: 'Vedic Pathashala Vidyarthi Welfare & Archaka Health Trust Session',
    scheduledAt: '2026-09-10T14:30:00.000Z',
    hostUserId: 'usr_archaka',
    hostName: 'Veda Brahma Sri Shankara Bhatta',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'Pradhana Archaka (Chief Priest)',
    committeeId: 'comm_agama',
    committeeName: 'Agama Sastra & Archaka Council',
    committeeCategory: 'ADVISORY',
    status: 'COMPLETED',
    location: 'Pathashala Sabha Bhavan',
    agenda: 'Revision of monthly stipends for hereditary Archaka families and health insurance group cover for sanctum staff.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[1],
      MOCK_GOVERNANCE_MEMBERS[3],
    ],
    notes: {
      id: 'mom_02',
      meetingId: 'mtg_past_02',
      resolutionNumber: 'RES-TR-2026/09-01',
      publishedAt: '2026-09-11T11:00:00.000Z',
      publishedByUserId: 'usr_dharmadhikari',
      publishedByName: 'Sri V. R. Gowrishankar',
      publishedByDesignation: 'CEO & Dharmadhikari',
      momText: `### 1. Opening & Overview
The meeting was convened to review the socio-economic welfare and traditional lineage preservation of hereditary archakas, paricharakas, and Veda pathashala students.

### 2. Key Deliberations & Sanctions
- **Stipend Increase:** Resolved to enhance the monthly *Gurukula Samrakshana* scholarship for advanced Veda adhyayana students by 25%, effective Kartik Masa.
- **Medical Insurance Scheme:** Enacted comprehensive cashless health insurance coverage (up to ₹ 5,00,000 per family per annum) for 42 registered sanctum priests and support staff.
- **Dharmika Library Upgradation:** Sanctioned digitization of 350 palm-leaf manuscripts preserved in the Peetham repository.

### 3. Decisions & Deadlines
- The Bhandari was directed to release premium amounts to the insurance custodian by the end of the current lunar fortnight.`,
      attachmentUrls: [
        {
          id: 'att_03',
          name: 'Archaka_Health_Insurance_Scheme_2026.pdf',
          sizeBytes: 3840000,
          formattedSize: '3.66 MB',
          mimeType: 'application/pdf',
          url: '#',
        },
      ],
    },
    createdAt: '2026-09-05T09:00:00.000Z',
  },
  {
    id: 'mtg_past_03',
    trustId: 'trust_sringeri',
    title: 'Emergency Sanctum Flood Mitigation & Tunga River Bank Reinforcement',
    scheduledAt: '2026-08-18T11:00:00.000Z',
    hostUserId: 'usr_eo',
    hostName: 'Dr. K. N. Srikumar, IAS (Retd.)',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    hostDesignation: 'Executive Officer (EO)',
    committeeId: 'comm_jeerno',
    committeeName: 'Jeernodharana & Renovation Committee',
    committeeCategory: 'RENOVATION',
    status: 'COMPLETED',
    location: 'Tunga Snana Ghatta Site Inspection Office',
    agenda: 'Engineering measures for flood water diversion away from the Vidyashankara Temple basement plinth.',
    invitees: [
      MOCK_GOVERNANCE_MEMBERS[0],
      MOCK_GOVERNANCE_MEMBERS[2],
      MOCK_GOVERNANCE_MEMBERS[4],
      MOCK_GOVERNANCE_MEMBERS[5],
    ],
    notes: {
      id: 'mom_03',
      meetingId: 'mtg_past_03',
      resolutionNumber: 'RES-TR-2026/08-12',
      publishedAt: '2026-08-18T18:00:00.000Z',
      publishedByUserId: 'usr_eo',
      publishedByName: 'Dr. K. N. Srikumar, IAS (Retd.)',
      publishedByDesignation: 'Executive Officer (EO)',
      momText: `### 1. Emergency Convening
In view of heavy catchment rains in the Western Ghats raising Tunga river levels near the Vidyashankara temple stone steps, the emergency steering panel was called to order.

### 2. Immediate Engineering Directives
- **Submersible Pumps Installation:** Deployed 4 high-capacity dewatering pumps with backup diesel generators.
- **Granite Retaining Wall:** Approved immediate reinforcement of the stepped embankment (*Sandhyavandana Mantapa*).
- **Sanctum Safeguards:** Inspected temple inner drainage vents; no water ingress detected in the sanctum sanctorum.

### 3. Conclusion
The Chief Temple Architect was authorized to execute emergency rock-bolting along the northern retaining embankment.`,
      attachmentUrls: [
        {
          id: 'att_04',
          name: 'Tunga_River_Embankment_Survey.pdf',
          sizeBytes: 4200000,
          formattedSize: '4.01 MB',
          mimeType: 'application/pdf',
          url: '#',
        },
      ],
    },
    createdAt: '2026-08-17T08:00:00.000Z',
  },
];
