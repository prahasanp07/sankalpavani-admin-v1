import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { committeeRepository } from '@/lib/repositories/committee.repository';
import { z } from 'zod';

const AppointMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  avatarUrl: z.string().optional(),
  committeeRole: z.string().default('MEMBER'),
  designationId: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().nullable().optional()
});

// Global in-memory committee members store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devCommitteeMembers: Map<string, any[]> | undefined;
}

if (!global.__devCommitteeMembers) {
  global.__devCommitteeMembers = new Map();
}

function getInitialCommitteeMembers(committeeId: string) {
  if (committeeId.includes('advisory')) {
    return [
      {
        id: 'cm_vidhushekhara',
        committeeId,
        userId: 'usr_vidhushekhara',
        name: 'Sri Vidyaranya Shastri',
        email: 'dharmadhikari@sringeri.org',
        phone: '+91 82652 50123',
        gotra: 'Kashyapa',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        committeeRole: 'CHAIRMAN',
        designationName: 'Managing Trustee & Dharmadhikari',
        termStart: '2022-01-01T00:00:00.000Z',
        termEnd: null,
        status: 'ACTIVE',
        appointedAt: new Date('2022-01-01').toISOString()
      }
    ];
  }
  return [];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string; committeeId: string }> }
) {
  try {
    const { trustId, committeeId } = await params;
    try {
      const ctx = await resolveRequestContext({ trustId });
      const members = await committeeRepository.listCommitteeMembers(ctx, committeeId);

      return NextResponse.json({
        data: members,
        meta: { requestId: ctx.requestId, count: members.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Committee Members API] Using fallback store for committee '${committeeId}':`, dbErr.message);
      
      const store = global.__devCommitteeMembers!;
      if (!store.has(committeeId)) {
        store.set(committeeId, getInitialCommitteeMembers(committeeId));
      }

      const list = store.get(committeeId) || [];
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
  { params }: { params: Promise<{ trustId: string; committeeId: string }> }
) {
  try {
    const { trustId, committeeId } = await params;
    const body = await request.json();
    const validated = AppointMemberSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const appointed = await committeeRepository.appointCommitteeMember(ctx, committeeId, validated);

      return NextResponse.json(
        { data: appointed, meta: { requestId: ctx.requestId } },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn(`[Committee Members API] Saving member to in-memory store for committee '${committeeId}':`, dbErr.message);
      
      const store = global.__devCommitteeMembers!;
      if (!store.has(committeeId)) {
        store.set(committeeId, getInitialCommitteeMembers(committeeId));
      }

      const currentList = store.get(committeeId) || [];
      const newMember = {
        id: `cm_${Date.now().toString(36)}`,
        committeeId,
        userId: `usr_${Date.now().toString(36)}`,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || '',
        gotra: validated.gotra || '',
        avatarUrl: validated.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        committeeRole: validated.committeeRole || 'MEMBER',
        designationName: validated.committeeRole === 'CONVENER' ? 'Committee Convener' : 'Committee Member',
        termStart: validated.termStart || new Date().toISOString(),
        termEnd: validated.termEnd || null,
        status: 'ACTIVE',
        appointedAt: new Date().toISOString()
      };

      currentList.unshift(newMember);
      store.set(committeeId, currentList);

      // Also update memberCount in __devCommittees if present
      if (global.__devCommittees && global.__devCommittees.has(trustId)) {
        const commList = global.__devCommittees.get(trustId) || [];
        const found = commList.find(c => c.id === committeeId);
        if (found) {
          found.memberCount = currentList.length;
          if (validated.committeeRole === 'CONVENER' || validated.committeeRole === 'CHAIRMAN') {
            found.convenerName = validated.name;
          }
        }
      }

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
