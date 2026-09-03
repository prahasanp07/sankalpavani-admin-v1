import { db } from '../db/client';
import { priestProfiles, personProfiles, templeStaffAssignments, auditEvents } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreatePriestInput {
  name: string;
  phone: string;
  email?: string;
  varnaGotra?: string;
  vedicQualification?: string;
  specialization?: string;
  roleTitle?: string;
  status?: string;
  avatarUrl?: string;
}

export class PriestRepository {
  /**
   * List priests assigned to this temple
   */
  async listPriests(ctx: RequestContext, templeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.priest.view',
      resourceType: 'priest'
    });

    return db.query.templeStaffAssignments.findMany({
      where: and(
        eq(templeStaffAssignments.templeId, templeId),
        eq(templeStaffAssignments.trustId, ctx.trustId)
      )
    });
  }

  /**
   * Register a new Priest / Archaka
   */
  async createPriest(ctx: RequestContext, templeId: string, input: CreatePriestInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: templeId,
      action: 'temple.priest.manage',
      resourceType: 'priest'
    });

    const personId = `pers_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const priestProfileId = `prst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const assignmentId = `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Create Person Profile
    const [person] = await db.insert(personProfiles).values({
      id: personId,
      trustId: ctx.trustId,
      fullName: input.name,
      phone: input.phone,
      gotra: input.varnaGotra,
      photoUrl: input.avatarUrl
    }).returning();

    // 2. Create Priest Profile
    const [profile] = await db.insert(priestProfiles).values({
      id: priestProfileId,
      trustId: ctx.trustId,
      personProfileId: person.id,
      systemCode: `ARCH-${Date.now().toString().slice(-4)}`,
      tradition: 'Smartha / Vaidika',
      specialization: input.specialization || 'Vaidika Rituals & Pooja',
      qualification: input.vedicQualification || 'Veda Adhyayana',
      dutyStatus: input.status || 'Active'
    }).returning();

    // 3. Create Temple Staff Assignment
    const [assignment] = await db.insert(templeStaffAssignments).values({
      id: assignmentId,
      trustId: ctx.trustId,
      templeId,
      personProfileId: person.id,
      department: 'Spiritual',
      cadreRank: input.roleTitle || 'Archaka',
      status: input.status || 'Active'
    }).returning();

    // 4. Audit Log
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      templeId,
      actorUserId: ctx.userId,
      eventType: 'PRIEST_REGISTERED',
      targetType: 'priest',
      targetId: assignment.id,
      action: 'temple.priest.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { priestName: input.name, role: input.roleTitle }
    });

    return { person, profile, assignment };
  }
}

export const priestRepository = new PriestRepository();
