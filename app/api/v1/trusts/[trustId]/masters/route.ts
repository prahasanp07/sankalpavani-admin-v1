import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { mastersRepository } from '@/lib/repositories/masters.repository';
import {
  MasterType,
  MasterCategoryItem,
  DEFAULT_TRUSTEE_CATEGORIES,
  DEFAULT_MEMBERSHIP_TYPES,
  DEFAULT_COMMITTEE_CATEGORIES
} from '@/lib/types/masters';
import { z } from 'zod';

const CreateMasterSchema = z.object({
  type: z.enum(['TRUSTEE_CATEGORY', 'MEMBERSHIP_TYPE', 'COMMITTEE_CATEGORY']),
  name: z.string().min(2, 'Name is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional()
});

// Resilient in-memory fallback store
declare global {
  // eslint-disable-next-line no-var
  var __devMastersStore: Map<string, MasterCategoryItem[]> | undefined;
}

if (!global.__devMastersStore) {
  global.__devMastersStore = new Map();
}

function getInitialMasters(trustId: string): MasterCategoryItem[] {
  const now = new Date().toISOString();
  const allDefaults = [
    ...DEFAULT_TRUSTEE_CATEGORIES,
    ...DEFAULT_MEMBERSHIP_TYPES,
    ...DEFAULT_COMMITTEE_CATEGORIES
  ];

  return allDefaults.map((d) => ({
    ...d,
    id: `mstr_${d.type.toLowerCase()}_${d.code.toLowerCase()}_${trustId}`,
    trustId,
    createdAt: now,
    updatedAt: now
  }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const typeParam = url.searchParams.get('type') as MasterType | null;

    try {
      const ctx = await resolveRequestContext({ trustId });
      const list = await mastersRepository.listMasters(ctx, typeParam || undefined);

      return NextResponse.json({
        data: list,
        meta: { requestId: ctx.requestId, count: list.length }
      });
    } catch (dbErr: any) {
      const store = global.__devMastersStore!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialMasters(trustId));
      }

      let list = store.get(trustId) || [];
      list = list.filter(item => item.status === 'ACTIVE');
      if (typeParam) {
        list = list.filter(item => item.type === typeParam);
      }

      return NextResponse.json({
        data: list.sort((a, b) => a.orderIndex - b.orderIndex),
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
    const validated = CreateMasterSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const created = await mastersRepository.createMaster(ctx, validated);

      return NextResponse.json(
        { data: created, meta: { requestId: ctx.requestId } },
        { status: 201 }
      );
    } catch (dbErr: any) {
      const store = global.__devMastersStore!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialMasters(trustId));
      }

      const list = store.get(trustId)!;
      const code = validated.code
        ? validated.code.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
        : validated.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_').substring(0, 32);

      const now = new Date().toISOString();
      const newItem: MasterCategoryItem = {
        id: `mstr_${validated.type.toLowerCase()}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        trustId,
        type: validated.type,
        code,
        name: validated.name.trim(),
        description: validated.description?.trim() || '',
        color: validated.color || 'amber',
        icon: validated.icon || 'Sparkles',
        isSystemDefault: false,
        status: 'ACTIVE',
        orderIndex: list.filter(i => i.type === validated.type).length + 1,
        createdAt: now,
        updatedAt: now
      };

      list.push(newItem);
      store.set(trustId, list);

      return NextResponse.json(
        { data: newItem, meta: { requestId: `req_fallback_${Date.now()}`, isFallback: true } },
        { status: 201 }
      );
    }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: err.issues[0]?.message || 'Invalid master input' } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Master category ID is required' } },
        { status: 400 }
      );
    }

    try {
      const ctx = await resolveRequestContext({ trustId });
      const result = await mastersRepository.deleteMaster(ctx, id);

      return NextResponse.json({
        data: result,
        meta: { requestId: ctx.requestId }
      });
    } catch (dbErr: any) {
      const store = global.__devMastersStore!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialMasters(trustId));
      }

      const list = store.get(trustId)!;
      const index = list.findIndex(i => i.id === id);
      if (index !== -1) {
        list[index].status = 'ARCHIVED';
      }

      return NextResponse.json({
        data: { success: true, id },
        meta: { requestId: `req_fallback_${Date.now()}`, isFallback: true }
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
