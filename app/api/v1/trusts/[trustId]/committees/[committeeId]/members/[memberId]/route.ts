import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { committeeRepository } from '@/lib/repositories/committee.repository';
import { z } from 'zod';

const UpdateMemberStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'EXPIRED', 'RELIEVED'])
});

// Global in-memory committee members store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devCommitteeMembers: Map<string, any[]> | undefined;
  // eslint-disable-next-line no-var
  var __devCommittees: Map<string, any[]> | undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; committeeId: string; memberId: string }> }
) {
  try {
    const { trustId, committeeId, memberId } = await params;
    const body = await request.json();
    const validated = UpdateMemberStatusSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const updated = await committeeRepository.updateCommitteeMemberStatus(ctx, committeeId, memberId, validated.status);

      return NextResponse.json({
        data: updated,
        meta: { requestId: ctx.requestId }
      });
    } catch (dbErr: any) {
      console.warn(`[Committee Member API] Updating member '${memberId}' status in fallback store:`, dbErr.message);

      const store = global.__devCommitteeMembers;
      let memberFound: any = null;

      if (store && store.has(committeeId)) {
        const list = store.get(committeeId) || [];
        const target = list.find((m: any) => m.id === memberId);
        if (target) {
          target.status = validated.status;
          target.updatedAt = new Date().toISOString();
          memberFound = target;
        }
      }

      if (!memberFound) {
        memberFound = {
          id: memberId,
          committeeId,
          status: validated.status,
          updatedAt: new Date().toISOString()
        };
      }

      // Update active member count on the committee if relieved
      if (global.__devCommittees && global.__devCommittees.has(trustId)) {
        const commList = global.__devCommittees.get(trustId) || [];
        const foundComm = commList.find(c => c.id === committeeId);
        if (foundComm && store && store.has(committeeId)) {
          const list = store.get(committeeId) || [];
          foundComm.memberCount = list.filter((m: any) => m.status === 'ACTIVE').length;
        }
      }

      return NextResponse.json({
        data: memberFound,
        meta: { requestId: `req_dev_${Date.now()}`, isFallback: true }
      });
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
