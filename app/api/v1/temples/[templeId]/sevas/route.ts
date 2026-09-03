import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { sevaRepository } from '@/lib/repositories/seva.repository';
import { z } from 'zod';

const CreateSevaSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  category: z.string(),
  description: z.string(),
  instructions: z.string().optional(),
  price: z.string(),
  includedPersons: z.number().optional(),
  extraPersonPrice: z.string().optional(),
  maxCapacityPerSlot: z.number().optional(),
  durationMinutes: z.number().optional(),
  reportingTime: z.string(),
  timingsDisplay: z.string(),
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const sevasList = await sevaRepository.listSevas(ctx, templeId);

    return NextResponse.json({ data: sevasList, meta: { requestId: ctx.requestId } });
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

    const validated = CreateSevaSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const newSeva = await sevaRepository.createSeva(ctx, templeId, validated);
    return NextResponse.json({ data: newSeva, meta: { requestId: ctx.requestId } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
