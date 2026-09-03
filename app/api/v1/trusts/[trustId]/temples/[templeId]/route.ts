import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { templeRepository } from '@/lib/repositories/temple.repository';
import { z } from 'zod';

const UpdateTempleSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).max(10).optional(),
  addressJson: z.record(z.any()).optional(),
  locationJson: z.record(z.any()).optional(),
  contactJson: z.record(z.any()).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'MAINTENANCE']).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string; templeId: string }> }
) {
  try {
    const { trustId, templeId } = await params;
    const ctx = await resolveRequestContext({ trustId, templeId });
    const profile = await templeRepository.getTempleProfile(ctx, templeId);

    if (!profile) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Temple not found in this Trust' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: profile,
      meta: { requestId: ctx.requestId }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; templeId: string }> }
) {
  try {
    const { trustId, templeId } = await params;
    const body = await request.json();
    const validated = UpdateTempleSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId, templeId });
    const updated = await templeRepository.updateTemple(ctx, templeId, validated);

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
