import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { departmentRepository } from '@/lib/repositories/department.repository';
import { z } from 'zod';

const CreateDeptSchema = z.object({
  name: z.string().min(2, 'Department name is required'),
  templeId: z.string().optional(),
  code: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const templeId = url.searchParams.get('templeId') || undefined;

    const ctx = await resolveRequestContext({ trustId, templeId });
    const list = await departmentRepository.listDepartments(ctx, { templeId });

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
    const validated = CreateDeptSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId, templeId: validated.templeId });
    const created = await departmentRepository.createDepartment(ctx, validated);

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
