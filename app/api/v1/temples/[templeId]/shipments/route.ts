import { NextResponse } from 'next/server';
import { resolveRequestContext } from '@/lib/tenant/resolver';
import { shipmentRepository } from '@/lib/repositories/shipment.repository';
import { z } from 'zod';

const UpdateShipmentSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  courierProvider: z.string().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ templeId: string }> }) {
  try {
    const { templeId } = await params;
    const url = new URL(request.url);
    const trustId = url.searchParams.get('trustId') || 'trust_sringeri';

    const ctx = await resolveRequestContext({ trustId, templeId });
    const shipments = await shipmentRepository.listShipments(ctx, templeId);

    return NextResponse.json({ data: shipments, meta: { requestId: ctx.requestId } });
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
    const shipmentId = url.searchParams.get('shipmentId');

    if (!shipmentId) {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Missing shipmentId parameter' } }, { status: 400 });
    }

    const validated = UpdateShipmentSchema.parse(body);
    const ctx = await resolveRequestContext({ trustId, templeId });

    const updated = await shipmentRepository.updateShipment(ctx, templeId, shipmentId, validated);
    return NextResponse.json({ data: updated, meta: { requestId: ctx.requestId } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: err.code || 'ERROR', message: err.message } },
      { status: err.status || 500 }
    );
  }
}
