import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { designationRepository } from '@/lib/repositories/designation.repository';
import { z } from 'zod';

const CreateDesignationSchema = z.object({
  name: z.string().min(2, 'Designation name is required'),
  description: z.string().optional(),
  scopeType: z.enum(['TRUST', 'TEMPLE']).default('TRUST'),
  scopeId: z.string().optional(),
  cadreRank: z.string().optional(),
  department: z.string().optional(),
  roleBinding: z.object({
    roleId: z.string(),
    autoAssign: z.boolean().default(true)
  }).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeType = (url.searchParams.get('scopeType') as 'TRUST' | 'TEMPLE') || undefined;
    const scopeId = url.searchParams.get('scopeId') || undefined;

    try {
      const ctx = await resolveRequestContext({ trustId });
      const list = await designationRepository.listDesignations(ctx, { scopeType, scopeId });

      return NextResponse.json({
        data: list,
        meta: { requestId: ctx.requestId, count: list.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Designations API] DB resolution fallback for trust '${trustId}':`, dbErr.message);

      const defaultDesignations = [
        {
          id: 'desig_dharmadhikari',
          trustId,
          scopeType: 'TRUST',
          scopeId: trustId,
          scopeName: 'Trust Umbrella',
          name: 'Dharmadhikari & Managing Trustee',
          description: 'Apex custodian of spiritual, agamic, and administrative trust governance',
          status: 'ACTIVE',
          activeAppointeesCount: 1,
          roleBinding: {
            roleId: 'role_trust_admin',
            roleName: 'Apex Trust Administrator',
            autoAssign: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'desig_treasurer',
          trustId,
          scopeType: 'TRUST',
          scopeId: trustId,
          scopeName: 'Trust Umbrella',
          name: 'Bhandari & Chief Treasurer',
          description: 'Chief custodian of sacred jewellery, treasury, and financial endowments',
          status: 'ACTIVE',
          activeAppointeesCount: 1,
          roleBinding: {
            roleId: 'role_finance_head',
            roleName: 'Finance & Treasury Head',
            autoAssign: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'desig_pradhana_archaka',
          trustId,
          scopeType: 'TEMPLE',
          scopeId: 'temple_vidyashankara',
          scopeName: 'Sri Vidyashankara Temple',
          name: 'Pradhana Archaka (Chief Priest)',
          description: 'Sanctum leadership, nitya pooja scheduling, and archaka shifts',
          status: 'ACTIVE',
          activeAppointeesCount: 1,
          roleBinding: {
            roleId: 'role_chief_priest',
            roleName: 'Chief Priest Lead',
            autoAssign: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'desig_yajnadhikari',
          trustId,
          scopeType: 'TRUST',
          scopeId: trustId,
          scopeName: 'Trust Umbrella',
          name: 'Yajnadhikari & Agama Advisor',
          description: 'Supervision of Maha Yagnas, Kumbhabhishekam, and Veda Parayanam',
          status: 'ACTIVE',
          activeAppointeesCount: 0,
          roleBinding: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'desig_paricharakar',
          trustId,
          scopeType: 'TEMPLE',
          scopeId: 'temple_vidyashankara',
          scopeName: 'Sri Vidyashankara Temple',
          name: 'Paricharakar (Sanctum Attendant)',
          description: 'Daily sanctum preparation, holy water collection, and floral offerings',
          status: 'ACTIVE',
          activeAppointeesCount: 2,
          roleBinding: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'desig_annadanam_supt',
          trustId,
          scopeType: 'TEMPLE',
          scopeId: 'temple_sharadamba',
          scopeName: 'Sri Sharadamba Temple',
          name: 'Madi Kitchen & Annadanam Superintendent',
          description: 'Strict madi prasadam preparation and large-scale annadanam services',
          status: 'ACTIVE',
          activeAppointeesCount: 1,
          roleBinding: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        data: defaultDesignations,
        meta: { requestId: `req_fallback_${Date.now()}`, count: defaultDesignations.length, isFallback: true }
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
    const validated = CreateDesignationSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const created = await designationRepository.createDesignation(ctx, validated);

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
