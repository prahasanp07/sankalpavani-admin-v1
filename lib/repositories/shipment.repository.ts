import { db } from '../db/client';
import { shipments, auditEvents } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface UpdateShipmentInput {
  status?: string;
  trackingNumber?: string;
  courierProvider?: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export class ShipmentRepository {
  /**
   * List shipments for a temple
   */
  async listShipments(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.logistics.view',
      resourceType: 'shipment'
    });

    return db.query.shipments.findMany({
      where: and(
        eq(shipments.templeId, templeId),
        eq(shipments.trustId, ctx.trustId)
      ),
      orderBy: [desc(shipments.createdAt)]
    });
  }

  /**
   * Update shipment dispatch/tracking state
   */
  async updateShipment(ctx: RequestContext, templeId: string, shipmentId: string, input: UpdateShipmentInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.logistics.manage',
      resourceType: 'shipment',
      resourceId: shipmentId
    });

    const [updated] = await db.update(shipments)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(and(
        eq(shipments.id, shipmentId),
        eq(shipments.templeId, templeId),
        eq(shipments.trustId, ctx.trustId)
      ))
      .returning();

    // Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'SHIPMENT_UPDATED',
      targetType: 'shipment',
      targetId: shipmentId,
      action: 'temple.logistics.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { status: input.status, trackingNumber: input.trackingNumber }
    });

    return updated;
  }
}

export const shipmentRepository = new ShipmentRepository();
