import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { roleRepository } from '@/lib/repositories/role.repository';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ trustId: string; assignmentId: string }> }
) {
  try {
    const { trustId, assignmentId } = await params;
    const ctx = await resolveRequestContext({ trustId });
    const revoked = await roleRepository.revokeRoleAssignment(ctx, assignmentId);

    return NextResponse.json({
      data: revoked,
      meta: { requestId: ctx.requestId }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
