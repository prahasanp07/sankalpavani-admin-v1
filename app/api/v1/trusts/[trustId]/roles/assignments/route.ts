import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { roleRepository } from '@/lib/repositories/role.repository';
import { z } from 'zod';

const AssignRoleSchema = z.object({
  roleId: z.string().min(2, 'Role ID is required'),
  userId: z.string().min(2, 'User ID is required'),
  scopeId: z.string().optional(),
  assignmentSource: z.enum(['DIRECT', 'DESIGNATION_BINDING', 'DELEGATION']).default('DIRECT'),
  validFrom: z.string().optional(),
  validUntil: z.string().nullable().optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || undefined;
    const scopeId = url.searchParams.get('scopeId') || undefined;

    const ctx = await resolveRequestContext({ trustId });
    const list = await roleRepository.listRoleAssignments(ctx, { userId, scopeId });

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
    const validated = AssignRoleSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const assigned = await roleRepository.assignRoleToUser(ctx, validated);

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
