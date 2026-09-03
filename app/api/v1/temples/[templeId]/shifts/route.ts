import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { schedulingRepository } from '@/lib/repositories/scheduling.repository';
import { z } from 'zod';

const AssignShiftSchema = z.object({
  priestProfileId: z.string(),
  shiftName: z.string(),
  dutyType: z.string(),
  startAt: z.string().transform(str => new Date(str)),
  endAt: z.string().transform(str => new Date(str)),
  status: z.string().optional(),
  notes: z.string().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const shifts = await schedulingRepository.listShifts(ctx, templeId);

    return NextResponse.json({ data: shifts, meta: { requestId: ctx.requestId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const body = await request.json();
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const validated = AssignShiftSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const newShift = await schedulingRepository.assignShift(ctx, templeId, validated);
    return NextResponse.json({ data: newShift, meta: { requestId: ctx.requestId } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
