import { db } from '../db/client';
import { sevas, auditEvents } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateSevaInput {
  code: string;
  name: string;
  category: string;
  description: string;
  instructions?: string;
  price: string;
  includedPersons?: number;
  extraPersonPrice?: string;
  maxCapacityPerSlot?: number;
  durationMinutes?: number;
  reportingTime: string;
  timingsDisplay: string;
}

export interface UpdateSevaInput extends Partial<CreateSevaInput> {
  isActive?: boolean;
}

export class SevaRepository {
  /**
   * List all sevas for a temple (Scoped to Trust & Temple)
   */
  async listSevas(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.seva.view',
      resourceType: 'seva'
    });

    return db.query.sevas.findMany({
      where: and(
        eq(sevas.templeId, templeId),
        eq(sevas.trustId, ctx.trustId)
      ),
      orderBy: (s, { asc }) => [asc(s.category), asc(s.name)]
    });
  }

  /**
   * Create a new seva offering with server-side validation & PEP
   */
  async createSeva(ctx: RequestContext, templeId: string, input: CreateSevaInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.seva.manage',
      resourceType: 'seva'
    });

    const sevaId = `seva_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const [newSeva] = await db.insert(sevas).values({
      id: sevaId,
      trustId: ctx.trustId,
      templeId,
      code: input.code,
      name: input.name,
      category: input.category,
      description: input.description,
      instructions: input.instructions,
      price: input.price,
      includedPersons: input.includedPersons ?? 1,
      extraPersonPrice: input.extraPersonPrice ?? '0',
      maxCapacityPerSlot: input.maxCapacityPerSlot ?? 50,
      durationMinutes: input.durationMinutes ?? 60,
      reportingTime: input.reportingTime,
      timingsDisplay: input.timingsDisplay,
      isActive: true
    }).returning();

    // Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'SEVA_CREATED',
      targetType: 'seva',
      targetId: newSeva.id,
      action: 'temple.seva.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { sevaCode: input.code, price: input.price }
    });

    return newSeva;
  }

  /**
   * Update an existing seva offering
   */
  async updateSeva(ctx: RequestContext, templeId: string, sevaId: string, input: UpdateSevaInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.seva.manage',
      resourceType: 'seva',
      resourceId: sevaId
    });

    const [updated] = await db.update(sevas)
      .set({
        ...input,
        updatedAt: new Date()
      })
      .where(and(
        eq(sevas.id, sevaId),
        eq(sevas.templeId, templeId),
        eq(sevas.trustId, ctx.trustId)
      ))
      .returning();

    // Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'SEVA_UPDATED',
      targetType: 'seva',
      targetId: sevaId,
      action: 'temple.seva.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { fields: Object.keys(input) }
    });

    return updated;
  }
}

export const sevaRepository = new SevaRepository();
