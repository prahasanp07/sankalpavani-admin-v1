import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { bookingRepository } from '@/lib/repositories/booking.repository';
import { z } from 'zod';

const PilgrimSchema = z.object({
  name: z.string().min(1),
  age: z.number().optional(),
  gender: z.string().optional(),
  gotra: z.string().optional(),
  nakshatra: z.string().optional(),
  relationship: z.string().optional()
});

const CreateBookingSchema = z.object({
  sevaId: z.string(),
  bookingDate: z.string().transform(str => new Date(str)),
  slotTime: z.string(),
  primaryDevoteeName: z.string().min(1),
  primaryPhone: z.string().min(8),
  primaryEmail: z.string().email().optional(),
  gotra: z.string().min(1),
  nakshatra: z.string().min(1),
  pilgrims: z.array(PilgrimSchema).optional(),
  paymentMethod: z.string().optional(),
  isHomeDelivery: z.boolean().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const bookingsList = await bookingRepository.listBookings(ctx, templeId);

    return NextResponse.json({ data: bookingsList, meta: { requestId: ctx.requestId } });
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

    const validated = CreateBookingSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const result = await bookingRepository.createBooking(ctx, templeId, validated);
    return NextResponse.json({ data: result, meta: { requestId: ctx.requestId } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
