import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { committeeRepository } from '@/lib/repositories/committee.repository';
import { z } from 'zod';

const CreateCommitteeSchema = z.object({
  name: z.string().min(2, 'Committee name is required'),
  code: z.string().min(2, 'Code is required').max(15, 'Code too long'),
  scopeType: z.enum(['TRUST', 'TEMPLE']).default('TRUST'),
  scopeId: z.string().optional(),
  parentId: z.string().nullable().optional(),
  category: z.string().optional().default('STANDING'),
  mandate: z.string().optional(),
  formationDate: z.string().optional(),
  dissolutionDate: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'DISSOLVED', 'SUSPENDED']).default('ACTIVE'),
  metadataJson: z.record(z.any()).optional()
});

// Global in-memory committee store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devCommittees: Map<string, any[]> | undefined;
}

if (!global.__devCommittees) {
  global.__devCommittees = new Map();
}

function getInitialCommittees(trustId: string) {
  return [
    {
      id: 'comm_advisory_apex',
      trustId,
      name: 'Apex Dharma Advisory Board',
      code: 'DAB-01',
      scopeType: 'TRUST',
      scopeId: trustId,
      parentId: null,
      category: 'ADVISORY',
      mandate: 'Preserve Shastric traditions, Agama rituals, and Vedic education',
      formationDate: '2022-01-01T00:00:00.000Z',
      dissolutionDate: null,
      status: 'ACTIVE',
      memberCount: 5,
      convenerName: 'Sri Vidyaranya Shastri',
      createdAt: new Date('2022-01-01').toISOString()
    },
    {
      id: 'comm_jeernodharana_2026',
      trustId,
      name: 'Jeernodharana & Temple Renovation Committee',
      code: 'JRC-26',
      scopeType: 'TRUST',
      scopeId: trustId,
      parentId: null,
      category: 'RENOVATION',
      mandate: 'Oversight of ancient stone sanctum conservation and mandapam restoration',
      formationDate: '2024-06-01T00:00:00.000Z',
      dissolutionDate: null,
      status: 'ACTIVE',
      memberCount: 8,
      convenerName: 'Srikanth Sastry',
      createdAt: new Date('2024-06-01').toISOString()
    },
    {
      id: 'comm_festival_navaratri',
      trustId,
      name: 'Sharannavaratri Mahotsava Committee',
      code: 'SMC-26',
      scopeType: 'TRUST',
      scopeId: trustId,
      parentId: null,
      category: 'FESTIVAL',
      mandate: 'Manage grand Rathotsava, Suhasini poojas, and cultural sabhas',
      formationDate: '2025-08-01T00:00:00.000Z',
      dissolutionDate: null,
      status: 'ACTIVE',
      memberCount: 12,
      convenerName: 'Smt. Gayatri Devi',
      createdAt: new Date('2025-08-01').toISOString()
    }
  ];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeType = (url.searchParams.get('scopeType') as 'TRUST' | 'TEMPLE') || undefined;
    const scopeId = url.searchParams.get('scopeId') || undefined;
    const category = url.searchParams.get('category') || undefined;

    try {
      const ctx = await resolveRequestContext({ trustId });
      const list = await committeeRepository.listCommittees(ctx, { scopeType, scopeId, category });

      return NextResponse.json({
        data: list,
        meta: { requestId: ctx.requestId, count: list.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Committees API] Using fallback store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devCommittees!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialCommittees(trustId));
      }

      let list = store.get(trustId) || [];
      if (scopeType) list = list.filter(c => c.scopeType === scopeType);
      if (scopeId) list = list.filter(c => c.scopeId === scopeId);
      if (category) list = list.filter(c => c.category === category);

      return NextResponse.json({
        data: list,
        meta: { requestId: `req_fallback_${Date.now()}`, count: list.length, isFallback: true }
      });
    }
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
    const validated = CreateCommitteeSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const created = await committeeRepository.createCommittee(ctx, validated);

      return NextResponse.json(
        { data: created, meta: { requestId: ctx.requestId } },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn(`[Committees API] Saving to in-memory store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devCommittees!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialCommittees(trustId));
      }

      const currentList = store.get(trustId) || [];
      const normalizedCode = validated.code.trim().toUpperCase();

      const newCommittee = {
        id: `comm_${normalizedCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`,
        trustId,
        name: validated.name,
        code: normalizedCode,
        scopeType: validated.scopeType,
        scopeId: validated.scopeId || trustId,
        parentId: validated.parentId || null,
        category: validated.category,
        mandate: validated.mandate || '',
        formationDate: validated.formationDate || new Date().toISOString(),
        dissolutionDate: validated.dissolutionDate || null,
        status: validated.status,
        memberCount: 0,
        convenerName: 'Pending Appointment',
        metadataJson: validated.metadataJson || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      currentList.unshift(newCommittee);
      store.set(trustId, currentList);

      return NextResponse.json(
        { data: newCommittee, meta: { requestId: `req_dev_${Date.now()}`, isFallback: true } },
        { status: 201 }
      );
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
