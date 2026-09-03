import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { trusteeRepository } from '@/lib/repositories/trustee.repository';
import { z } from 'zod';

const UpdateTrusteeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  avatarUrl: z.string().optional(),
  designationId: z.string().optional(),
  trusteeType: z.string().optional(),
  cadreRank: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().nullable().optional(),
  resolutionNo: z.string().optional(),
  appointmentStatus: z.enum(['ACTIVE', 'EXPIRED', 'RESIGNED', 'REVOKED']).optional(),
  responsibilities: z.string().optional(),
  notes: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; trusteeId: string }> }
) {
  try {
    const { trustId, trusteeId } = await params;
    const body = await request.json();
    const validated = UpdateTrusteeSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const updated = await trusteeRepository.updateTrusteeAppointment(ctx, trusteeId, validated);

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
