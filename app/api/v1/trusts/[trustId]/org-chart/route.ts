import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { orgChartRepository } from '@/lib/repositories/org-chart.repository';
import { z } from 'zod';

const SaveStaffSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Designation / Role is required'),
  department: z.string().default('Admin'),
  subDepartment: z.string().optional(),
  scopeId: z.string().optional(),
  cadreRank: z.string().optional(),
  avatar: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  joinedYear: z.string().optional(),
  status: z.enum(['Active', 'On Leave', 'Duty-Assign']).default('Active'),
  primarySupervisorId: z.string().nullable().optional(),
  secondarySupervisorIds: z.array(z.string()).optional(),
  responsibilities: z.string().optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeId = url.searchParams.get('scopeId') || undefined;

    const ctx = await resolveRequestContext({ trustId });
    const graph = await orgChartRepository.getOrgChartGraph(ctx, scopeId);

    return NextResponse.json({
      data: graph,
      meta: { requestId: ctx.requestId }
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
    const validated = SaveStaffSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const updatedGraph = await orgChartRepository.saveStaffMemberWithReporting(ctx, validated);

    return NextResponse.json({
      data: updatedGraph,
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
