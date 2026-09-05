import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { designationRepository } from '@/lib/repositories/designation.repository';
import { z } from 'zod';

const AppointOfficeBearerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  nakshatra: z.string().optional(),
  photoUrl: z.string().optional(),
  designationId: z.string().min(2, 'Designation ID is required'),
  scopeId: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().nullable().optional(),
  resolutionNo: z.string().optional(),
  metadataJson: z.record(z.any()).optional()
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    const url = new URL(request.url);
    const scopeId = url.searchParams.get('scopeId') || undefined;
    const designationId = url.searchParams.get('designationId') || undefined;
    const status = url.searchParams.get('status') || undefined;

    try {
      const ctx = await resolveRequestContext({ trustId });
      const list = await designationRepository.listOfficeBearers(ctx, { scopeId, designationId, status });

      return NextResponse.json({
        data: list,
        meta: { requestId: ctx.requestId, count: list.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Office Bearers API] DB resolution fallback for trust '${trustId}':`, dbErr.message);

      const defaultOfficeBearers = [
        {
          id: 'ob_vidhushekhara',
          trustId,
          scopeId: trustId,
          scopeName: 'Trust Umbrella',
          userId: 'usr_vidhushekhara',
          personName: 'Sri Sringeri Dharmadhikari',
          email: 'dharmadhikari@sringeri.org',
          phone: '+91 8265 250123',
          gotra: 'Kashyapa Gotra',
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvn8h5qEhb1tDXNVQmH_C-7Bf3AF9LFkxb3WKWAvVYmxKc-TcXh1fjMMz-WjPg9zbdjB7Yrhy9eiYGkJBLgHovr8GAsE2ft4v7PT9xcRcGGi3JzCKWBozxxFHni9LfCSubIqySEm5J4TesuWgBjdcdegth7w_Lsgvd39ZpYyq-IgCKk-0lzzWXTvduEcTeXKyNURY3AzLe-YP0InifLRv0R4KmiNUF_JDCpbPVweyINkAPtpA7Rfnc7ZfS2hPyvRu8cJGasIwQyYQ',
          designationId: 'desig_dharmadhikari',
          designationName: 'Dharmadhikari & Managing Trustee',
          termStart: '2024-01-01',
          termEnd: null,
          isLifeTerm: true,
          resolutionNo: 'TR-2024/01',
          metadataJson: {},
          appointmentStatus: 'ACTIVE',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ob_sundaresan',
          trustId,
          scopeId: trustId,
          scopeName: 'Trust Umbrella',
          userId: 'usr_treasurer',
          personName: 'Sri K. V. Sundaresan',
          email: 'treasury@sringeri.org',
          phone: '+91 98450 12345',
          gotra: 'Bharadwaja Gotra',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
          designationId: 'desig_treasurer',
          designationName: 'Bhandari & Chief Treasurer',
          termStart: '2023-04-01',
          termEnd: '2027-03-31',
          isLifeTerm: false,
          resolutionNo: 'TR-2023/14',
          metadataJson: {},
          appointmentStatus: 'ACTIVE',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ob_vidyaranya',
          trustId,
          scopeId: 'temple_vidyashankara',
          scopeName: 'Sri Vidyashankara Temple',
          userId: 'usr_vidyaranya',
          personName: 'Sri Vidyaranya Shastri',
          email: 'archaka@vidyashankara.org',
          phone: '+91 98450 11000',
          gotra: 'Vasishta Gotra',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          designationId: 'desig_pradhana_archaka',
          designationName: 'Pradhana Archaka (Chief Priest)',
          termStart: '2022-01-01',
          termEnd: null,
          isLifeTerm: true,
          resolutionNo: 'TPL-SVT-01',
          metadataJson: {},
          appointmentStatus: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        data: defaultOfficeBearers,
        meta: { requestId: `req_fallback_${Date.now()}`, count: defaultOfficeBearers.length, isFallback: true }
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
    const validated = AppointOfficeBearerSchema.parse(body);

    const ctx = await resolveRequestContext({ trustId });
    const appointed = await designationRepository.appointOfficeBearer(ctx, validated);

    return NextResponse.json(
      { data: appointed, meta: { requestId: ctx.requestId } },
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
