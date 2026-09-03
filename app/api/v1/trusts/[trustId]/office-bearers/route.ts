import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { designationRepository } from '@/lib/repositories/designation.repository';
import { z } from 'zod';

const AppointOfficeBearerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  photoUrl: z.string().optional(),
  designationId: z.string().min(2, 'Designation ID is required'),
  scopeId: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().nullable().optional(),
  resolutionNo: z.string().optional(),
  metadataJson: z.record(z.any()).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeId = url.searchParams.get('scopeId') || undefined;
    const designationId = url.searchParams.get('designationId') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const ctx = await resolveRequestContext({ trustId });
    const list = await designationRepository.listOfficeBearers(ctx, { scopeId, designationId, status });

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
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const body = await request.json();
    const validated = AppointOfficeBearerSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const appointed = await designationRepository.appointOfficeBearer(ctx, validated);

    return NextResponse.json(
      { data: appointed, meta: { requestId: ctx.requestId } },
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
