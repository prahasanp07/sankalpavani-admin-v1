import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { committeeRepository } from '@/lib/repositories/committee.repository';
import { z } from 'zod';

const UpdateCommitteeSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  category: z.enum([
    'STANDING',
    'AD_HOC',
    'ADVISORY',
    'RENOVATION',
    'FESTIVAL',
    'FINANCE',
    'LEGAL',
    'CUSTOM'
  ]).optional(),
  mandate: z.string().optional(),
  formationDate: z.string().optional(),
  dissolutionDate: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'DISSOLVED', 'SUSPENDED']).optional(),
  metadataJson: z.record(z.any()).optional()
});

// Global in-memory committee store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devCommittees: Map<string, any[]> | undefined;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string; committeeId: string }> }
) {
  try {
    const { trustId, committeeId } = await params;
    try {
      const ctx = await resolveRequestContext({ trustId });
      const comm = await committeeRepository.getCommitteeById(ctx, committeeId);

      if (!comm) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Committee not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: comm,
        meta: { requestId: ctx.requestId }
      });
    } catch (dbErr: any) {
      console.warn(`[Committee API] Finding committee '${committeeId}' in fallback store:`, dbErr.message);

      const store = global.__devCommittees;
      if (store && store.has(trustId)) {
        const list = store.get(trustId) || [];
        const found = list.find((c: any) => c.id === committeeId);
        if (found) {
          return NextResponse.json({
            data: found,
            meta: { requestId: `req_dev_${Date.now()}`, isFallback: true }
          });
        }
      }

      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Committee not found in fallback store' } },
        { status: 404 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trustId: string; committeeId: string }> }
) {
  try {
    const { trustId, committeeId } = await params;
    const body = await request.json();
    const validated = UpdateCommitteeSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const updated = await committeeRepository.updateCommittee(ctx, committeeId, validated);

      return NextResponse.json({
        data: updated,
        meta: { requestId: ctx.requestId }
      });
    } catch (dbErr: any) {
      console.warn(`[Committee API] Updating committee '${committeeId}' in fallback store:`, dbErr.message);

      const store = global.__devCommittees;
      let commFound: any = null;

      if (store && store.has(trustId)) {
        const list = store.get(trustId) || [];
        const target = list.find((c: any) => c.id === committeeId);
        if (target) {
          Object.assign(target, validated, { updatedAt: new Date().toISOString() });
          commFound = target;
        }
      }

      if (!commFound) {
        commFound = {
          id: committeeId,
          trustId,
          ...validated,
          updatedAt: new Date().toISOString()
        };
      }

      return NextResponse.json({
        data: commFound,
        meta: { requestId: `req_dev_${Date.now()}`, isFallback: true }
      });
    }
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
