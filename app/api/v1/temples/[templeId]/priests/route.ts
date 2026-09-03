import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { priestRepository } from '@/lib/repositories/priest.repository';
import { z } from 'zod';

const CreatePriestSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional(),
  varnaGotra: z.string().optional(),
  vedicQualification: z.string().optional(),
  specialization: z.string().optional(),
  roleTitle: z.string().optional(),
  status: z.string().optional(),
  avatarUrl: z.string().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const priests = await priestRepository.listPriests(ctx, templeId);

    return NextResponse.json({ data: priests, meta: { requestId: ctx.requestId } });
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

    const validated = CreatePriestSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const result = await priestRepository.createPriest(ctx, templeId, validated);
    return NextResponse.json({ data: result, meta: { requestId: ctx.requestId } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
