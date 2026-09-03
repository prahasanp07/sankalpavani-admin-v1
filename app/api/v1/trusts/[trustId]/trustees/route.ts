import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { trusteeRepository } from '@/lib/repositories/trustee.repository';
import { z } from 'zod';

const AppointTrusteeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  gotra: z.string().optional(),
  avatarUrl: z.string().optional(),
  designationId: z.string().optional(),
  customDesignationName: z.string().optional(),
  trusteeType: z.string().default('Elected Board Trustee'),
  cadreRank: z.string().default('Apex Governance & Trust Board'),
  termStart: z.string().min(4, 'Term start date is required'),
  termEnd: z.string().nullable().optional(),
  resolutionNo: z.string().optional(),
  responsibilities: z.string().optional(),
  notes: z.string().optional()
});

// Global in-memory trustee store for dev / offline mode resilience
declare global {
  // eslint-disable-next-line no-var
  var __devTrustees: Map<string, any[]> | undefined;
}

if (!global.__devTrustees) {
  global.__devTrustees = new Map();
}

function getInitialTrustees(trustId: string) {
  return [
    {
      id: 'trustee_dharmadhikari',
      userId: 'usr_vidhushekhara',
      name: 'Sri Vidyaranya Shastri',
      email: 'dharmadhikari@sringeri.org',
      phone: '+91 82652 50123',
      gotra: 'Kashyapa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      designationId: 'desig_dharmadhikari',
      designationName: 'Managing Trustee & Dharmadhikari',
      trusteeType: 'Managing Trustee / Dharmadhikari',
      cadreRank: 'Apex Governance & Trust Board',
      responsibilities: 'Overall spiritual stewardship, Veda Pathashala patron, ritual compliance',
      resolutionNo: 'TR-2022/01',
      termStart: '2022-01-01T00:00:00.000Z',
      termEnd: null,
      isLifeTerm: true,
      appointmentStatus: 'ACTIVE'
    },
    {
      id: 'trustee_treasurer',
      userId: 'usr_srikanth',
      name: 'Sri Srikanth Sastry',
      email: 'treasurer@sringeri.org',
      phone: '+91 98450 11000',
      gotra: 'Vasishta',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      designationId: 'desig_treasurer',
      designationName: 'Treasurer & Finance Trustee',
      trusteeType: 'Elected Board Trustee',
      cadreRank: 'Apex Governance & Trust Board',
      responsibilities: 'Hundi collections reconciliation, statutory audits, bank operations',
      resolutionNo: 'TR-2024/08',
      termStart: '2024-01-01T00:00:00.000Z',
      termEnd: '2027-01-01T00:00:00.000Z',
      isLifeTerm: false,
      appointmentStatus: 'ACTIVE'
    }
  ];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trustId: string }> }
) {
  try {
    const { trustId } = await params;
    try {
      const ctx = await resolveRequestContext({ trustId });
      const trustees = await trusteeRepository.listTrustees(ctx);

      return NextResponse.json({
        data: trustees,
        meta: { requestId: ctx.requestId, count: trustees.length }
      });
    } catch (dbErr: any) {
      console.warn(`[Trustees API] Using fallback store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devTrustees!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialTrustees(trustId));
      }

      const list = store.get(trustId) || [];
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
    const validated = AppointTrusteeSchema.parse(body);

    try {
      const ctx = await resolveRequestContext({ trustId });
      const appointment = await trusteeRepository.appointTrustee(ctx, validated);

      return NextResponse.json(
        { data: appointment, meta: { requestId: ctx.requestId } },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn(`[Trustees API] Saving trustee to in-memory store for trust '${trustId}':`, dbErr.message);
      
      const store = global.__devTrustees!;
      if (!store.has(trustId)) {
        store.set(trustId, getInitialTrustees(trustId));
      }

      const currentList = store.get(trustId) || [];
      const newTrustee = {
        id: `trustee_${Date.now().toString(36)}`,
        userId: `usr_${Date.now().toString(36)}`,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || '',
        gotra: validated.gotra || '',
        avatarUrl: validated.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        designationId: validated.designationId || `desig_custom_${Date.now().toString(36)}`,
        designationName: validated.customDesignationName || 'Trust Board Member',
        trusteeType: validated.trusteeType,
        cadreRank: validated.cadreRank,
        responsibilities: validated.responsibilities || '',
        resolutionNo: validated.resolutionNo || '',
        termStart: validated.termStart,
        termEnd: validated.termEnd,
        isLifeTerm: validated.trusteeType.includes('Life') || !validated.termEnd,
        appointmentStatus: 'ACTIVE',
        createdAt: new Date().toISOString()
      };

      currentList.unshift(newTrustee);
      store.set(trustId, currentList);

      return NextResponse.json(
        { data: newTrustee, meta: { requestId: `req_dev_${Date.now()}`, isFallback: true } },
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
