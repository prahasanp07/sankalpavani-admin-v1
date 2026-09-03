import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { memberRepository } from '@/lib/repositories/member.repository';
import { z } from 'zod';

const AddMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  photoUrl: z.string().optional(),
  membershipType: z.enum([
    'STANDARD',
    'GOVERNANCE_HEAD',
    'TRUSTEE',
    'STAFF',
    'PRIEST',
    'VOLUNTEER',
    'DONOR'
  ]).default('STANDARD'),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional(),
  templeIds: z.array(z.string()).optional(),
  committeeId: z.string().optional(),
  committeeRole: z.string().optional(),
  designationId: z.string().optional()
});

// Global in-memory members store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devMembers: Map<string, any[]> | undefined;
}

if (!global.__devMembers) {
  global.__devMembers = new Map();
}

function getInitialMembers(trustId: string) {
  return [
    {
      id: 'mem_vidhushekhara',
      userId: 'usr_vidhushekhara',
      trustId,
      name: 'Sri Vidyaranya Shastri',
      email: 'dharmadhikari@sringeri.org',
      phone: '+91 82652 50123',
      gotra: 'Kashyapa',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      membershipType: 'GOVERNANCE_HEAD',
      status: 'ACTIVE',
      validFrom: '2022-01-01T00:00:00.000Z',
      validUntil: null,
      assignedTemples: [
        { templeId: 'temple_vidyashankara', templeName: 'Sri Vidyashankara Temple', templeCode: 'SVT-01', status: 'ACTIVE' },
        { templeId: 'temple_sharadamba', templeName: 'Sri Sharadamba Temple', templeCode: 'SST-02', status: 'ACTIVE' }
      ],
      assignedCommittees: [
        { committeeId: 'comm_advisory_apex', committeeName: 'Apex Dharma Advisory Board', committeeRole: 'CHAIRMAN', status: 'ACTIVE' }
      ],
      activeDesignations: [
        { designationId: 'desig_dharmadhikari', designationName: 'Managing Trustee & Dharmadhikari', scopeId: trustId, resolutionNo: 'TR-2022/01' }
      ],
      createdAt: new Date('2022-01-01').toISOString()
    },
    {
      id: 'mem_srikanth',
      userId: 'usr_srikanth',
      trustId,
      name: 'Sri Srikanth Sastry',
      email: 'treasurer@sringeri.org',
      phone: '+91 98450 11000',
      gotra: 'Vasishta',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      membershipType: 'TRUSTEE',
      status: 'ACTIVE',
      validFrom: '2024-01-01T00:00:00.000Z',
      validUntil: '2027-01-01T00:00:00.000Z',
      assignedTemples: [
        { templeId: 'temple_vidyashankara', templeName: 'Sri Vidyashankara Temple', templeCode: 'SVT-01', status: 'ACTIVE' }
      ],
      assignedCommittees: [
        { committeeId: 'comm_jeernodharana_2026', committeeName: 'Jeernodharana & Temple Renovation Committee', committeeRole: 'CONVENER', status: 'ACTIVE' }
      ],
      activeDesignations: [
        { designationId: 'desig_treasurer', designationName: 'Treasurer & Finance Trustee', scopeId: trustId, resolutionNo: 'TR-2024/08' }
      ],
      createdAt: new Date('2024-01-01').toISOString()
    },
    {
      id: 'mem_narasimha',
      userId: 'usr_narasimha',
      trustId,
      name: 'Sri Narasimha Bhattar',
      email: 'chief.archaka@sringeri.org',
      phone: '+91 98450 22334',
      gotra: 'Gautama',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
      membershipType: 'PRIEST',
      status: 'ACTIVE',
      validFrom: '2023-01-01T00:00:00.000Z',
      validUntil: null,
      assignedTemples: [
        { templeId: 'temple_vidyashankara', templeName: 'Sri Vidyashankara Temple', templeCode: 'SVT-01', status: 'ACTIVE' }
      ],
      assignedCommittees: [],
      activeDesignations: [
        { designationId: 'desig_chief_priest', designationName: 'Pradhana Archaka (Chief Priest)', scopeId: 'temple_vidyashankara', resolutionNo: '' }
      ],
      createdAt: new Date('2023-01-01').toISOString()
    }
  ];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const membershipType = url.searchParams.get('membershipType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const templeId = url.searchParams.get('templeId') || undefined;

    try {
      const ctx = await resolveRequestContext({ trustId });
      const list = await memberRepository.listTrustMembers(ctx, { membershipType, status, templeId });

      return NextResponse.json({
        data: list,
        meta: { requestId: ctx.requestId, count: list.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Members API] Using fallback store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devMembers!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialMembers(trustId));
      }

      let list = store.get(trustId) || [];
      if (membershipType) list = list.filter(m => m.membershipType === membershipType);
      if (status) list = list.filter(m => m.status === status);
      if (templeId) list = list.filter(m => m.assignedTemples.some((t: any) => t.templeId === templeId));

      return NextResponse.json({
        data: list,
        meta: { requestId: `req_fallback_${Date.now()}`, count: list.length, isFallback: true }
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const body = await request.json();
    const validated = AddMemberSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const created = await memberRepository.inviteOrAddMember(ctx, validated);

      return NextResponse.json(
        { data: created, meta: { requestId: ctx.requestId } },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn(`[Members API] Saving member to in-memory store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devMembers!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialMembers(trustId));
      }

      const currentList = store.get(trustId) || [];
      const newMember = {
        id: `mem_${Date.now().toString(36)}`,
        userId: `usr_${Date.now().toString(36)}`,
        trustId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || '',
        gotra: validated.gotra || '',
        photoUrl: validated.photoUrl || '',
        membershipType: validated.membershipType,
        status: 'ACTIVE',
        validFrom: validated.validFrom || new Date().toISOString(),
        validUntil: validated.validUntil || null,
        assignedTemples: (validated.templeIds || []).map(tId => ({
          templeId: tId,
          templeName: tId.includes('sharadamba') ? 'Sri Sharadamba Temple' : 'Sri Vidyashankara Temple',
          templeCode: tId.includes('sharadamba') ? 'SST-02' : 'SVT-01',
          status: 'ACTIVE'
        })),
        assignedCommittees: validated.committeeId ? [
          {
            committeeId: validated.committeeId,
            committeeName: 'Active Committee Portfolio',
            committeeRole: validated.committeeRole || 'MEMBER',
            status: 'ACTIVE'
          }
        ] : [],
        activeDesignations: [],
        createdAt: new Date().toISOString()
      };

      currentList.unshift(newMember);
      store.set(trustId, currentList);

      return NextResponse.json(
        { data: newMember, meta: { requestId: `req_dev_${Date.now()}`, isFallback: true } },
        { status: 201 }
      );
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: err.errors.map(e => e.message).join(', ') } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
