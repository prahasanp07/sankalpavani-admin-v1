import { db } from '../db/client';
import { shifts, auditEvents } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface AssignShiftInput {
  priestProfileId: string;
  shiftName: string;
  dutyType: string;
  startAt: Date;
  endAt: Date;
  status?: string;
  notes?: string;
}

export class SchedulingRepository {
  /**
   * List duty shifts for a temple
   */
  async listShifts(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.roster.view',
      resourceType: 'shift'
    });

    return db.query.shifts.findMany({
      where: and(
        eq(shifts.templeId, templeId),
        eq(shifts.trustId, ctx.trustId)
      )
    });
  }

  /**
   * Assign or update a duty shift
   */
  async assignShift(ctx: RequestContext, templeId: string, input: AssignShiftInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.roster.manage',
      resourceType: 'shift'
    });

    const shiftId = `shft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const [newShift] = await db.insert(shifts).values({
      id: shiftId,
      trustId: ctx.trustId,
      templeId,
      priestProfileId: input.priestProfileId,
      shiftDate: input.startAt,
      startTime: '06:00 AM',
      endTime: '12:30 PM',
      dutyRole: input.shiftName,
      assignedSanctum: 'Main Sanctum',
      status: input.status || 'Confirmed'
    }).returning();

    // Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'SHIFT_ASSIGNED',
      targetType: 'shift',
      targetId: newShift.id,
      action: 'temple.roster.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { shiftName: input.shiftName, priest: input.priestProfileId }
    });

    return newShift;
  }
}

export const schedulingRepository = new SchedulingRepository();
