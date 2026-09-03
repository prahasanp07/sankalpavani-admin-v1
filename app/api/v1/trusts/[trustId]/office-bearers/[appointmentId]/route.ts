import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { designationRepository } from '@/lib/repositories/designation.repository';
import { z } from 'zod';

const UpdateOfficeBearerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'EXPIRED', 'RESIGNED', 'REVOKED'])
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; appointmentId: string }> }
) {
  try {
    const { trustId, appointmentId } = await params;
    const body = await request.json();
    const validated = UpdateOfficeBearerStatusSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const updated = await designationRepository.updateOfficeBearerStatus(ctx, appointmentId, validated.status);

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
