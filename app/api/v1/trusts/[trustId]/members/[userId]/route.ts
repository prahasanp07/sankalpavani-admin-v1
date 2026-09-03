import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { memberRepository } from '@/lib/repositories/member.repository';
import { z } from 'zod';

const UpdateMemberSchema = z.object({
  name: z.string().optional(),
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
  ]).optional(),
  status: z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'REVOKED']).optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; userId: string }> }
) {
  try {
    const { trustId, userId } = await params;
    const body = await request.json();
    const validated = UpdateMemberSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const updated = await memberRepository.updateMember(ctx, userId, validated);

    return NextResponse.json({
      data: updated,
      meta: { requestId: ctx.requestId }
    });
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
