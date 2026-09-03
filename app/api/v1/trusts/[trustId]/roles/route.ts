import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { roleRepository } from '@/lib/repositories/role.repository';
import { z } from 'zod';

const CreateRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  roleKey: z.string().min(2, 'Role key is required'),
  description: z.string().optional(),
  scopeType: z.enum(['TRUST', 'TEMPLE']).default('TRUST'),
  scopeId: z.string().optional(),
  isInheritable: z.boolean().default(true),
  permissionIds: z.array(z.string()).optional(),
  permissions: z.array(z.object({
    permissionId: z.string(),
    effect: z.enum(['ALLOW', 'DENY']).default('ALLOW'),
    scopeMode: z.enum(['EXACT', 'TRUST_ONLY', 'ALL_DESCENDANTS', 'SELECTED_DESCENDANTS']).default('ALL_DESCENDANTS'),
    scopeSelectorJson: z.any().optional()
  })).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeType = url.searchParams.get('scopeType') || undefined;
    const scopeId = url.searchParams.get('scopeId') || undefined;

    const ctx = await resolveRequestContext({ trustId });
    const list = await roleRepository.listRoles(ctx, scopeType, scopeId);

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
    const validated = CreateRoleSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const created = await roleRepository.createRole(ctx, validated);

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
