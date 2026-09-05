import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { templeRepository } from '@/lib/repositories/temple.repository';
import { z } from 'zod';

const UpdateInfoSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  deity: z.string().optional(),
  status: z.enum(['ACTIVE', 'OPERATIONAL', 'MAINTENANCE', 'SUSPENDED']).optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  hotline: z.string().optional(),
  officialEmail: z.string().email().optional().or(z.literal('')),
  websiteUrl: z.string().optional(),
  mapsUrl: z.string().optional(),
  photos: z.array(z.string()).optional(),
  primaryPhotoIndex: z.number().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const profile = await templeRepository.getTempleProfile(ctx, templeId);

    if (!profile) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Temple not found' } }, { status: 404 });
    }

    return NextResponse.json({ data: profile, meta: { requestId: ctx.requestId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const body = await request.json();
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const validated = UpdateInfoSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const updated = await templeRepository.updateTempleProfile(ctx, templeId, validated);
    return NextResponse.json({ data: updated, meta: { requestId: ctx.requestId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
