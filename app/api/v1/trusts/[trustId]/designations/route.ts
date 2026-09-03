import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { designationRepository } from '@/lib/repositories/designation.repository';
import { z } from 'zod';

const CreateDesignationSchema = z.object({
  name: z.string().min(2, 'Designation name is required'),
  description: z.string().optional(),
  scopeType: z.enum(['TRUST', 'TEMPLE']).default('TRUST'),
  scopeId: z.string().optional(),
  cadreRank: z.string().optional(),
  department: z.string().optional(),
  roleBinding: z.object({
    roleId: z.string(),
    autoAssign: z.boolean().default(true)
  }).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeType = (url.searchParams.get('scopeType') as 'TRUST' | 'TEMPLE') || undefined;
    const scopeId = url.searchParams.get('scopeId') || undefined;

    const ctx = await resolveRequestContext({ trustId });
    const list = await designationRepository.listDesignations(ctx, { scopeType, scopeId });

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
    const validated = CreateDesignationSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const created = await designationRepository.createDesignation(ctx, validated);

    return NextResponse.json(
      { data: created, meta: { requestId: ctx.requestId } },
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
