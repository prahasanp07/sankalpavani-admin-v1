import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { memberRepository } from '@/lib/repositories/member.repository';
import { z } from 'zod';

const AssignTempleMemberSchema = z.object({
  userId: z.string().min(2, 'User ID is required')
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string; templeId: string }> }
) {
  try {
    const { trustId, templeId } = await params;
    const ctx = await resolveRequestContext({ trustId, templeId });
    const list = await memberRepository.listTempleMembers(ctx, templeId);

    return NextResponse.json({
      data: list,
      meta: { requestId: ctx.requestId, count: list.length }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ trustId: string; templeId: string }> }
) {
  try {
    const { trustId, templeId } = await params;
    const body = await request.json();
    const { userId } = AssignTempleMemberSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId, templeId });
    const assigned = await memberRepository.assignTempleMembership(ctx, templeId, userId);

    return NextResponse.json(
      { data: assigned, meta: { requestId: ctx.requestId } },
      { status: 201 }
    );
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
