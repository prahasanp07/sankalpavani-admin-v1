import { db } from '../db/client';
import { 
  users, 
  personProfiles, 
  trustMemberships, 
  templeMemberships, 
  committeeMembers, 
  committees, 
  designations, 
  officeBearers, 
  temples, 
  trusts, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface AddMemberInput {
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  photoUrl?: string;
  membershipType?: 'STANDARD' | 'GOVERNANCE_HEAD' | 'TRUSTEE' | 'STAFF' | 'PRIEST' | 'VOLUNTEER' | 'DONOR';
  validFrom?: string;
  validUntil?: string | null;
  templeIds?: string[]; // Multi-temple assignments
  committeeId?: string; // Optional committee assignment
  committeeRole?: string; // Optional committee role ('CHAIRMAN' | 'CONVENER' | 'MEMBER' etc.)
  designationId?: string; // Optional traditional/official title
  notes?: string;
}

export interface UpdateMemberInput {
  name?: string;
  phone?: string;
  gotra?: string;
  photoUrl?: string;
  membershipType?: 'STANDARD' | 'GOVERNANCE_HEAD' | 'TRUSTEE' | 'STAFF' | 'PRIEST' | 'VOLUNTEER' | 'DONOR';
  status?: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED';
  validFrom?: string;
  validUntil?: string | null;
}

export class MemberRepository {
  /**
   * List all members of a Trust with full demographic profiles, temple assignments, and committee roles
   */
  async listTrustMembers(ctx: RequestContext, filter?: { 
    membershipType?: string; 
    status?: string; 
    searchQuery?: string;
    templeId?: string;
  }) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [eq(trustMemberships.trustId, ctx.trustId)];
    if (filter?.membershipType) conditions.push(eq(trustMemberships.membershipType, filter.membershipType));
    if (filter?.status) conditions.push(eq(trustMemberships.status, filter.status));

    const tMembers = await db.query.trustMemberships.findMany({
      where: and(...conditions),
      orderBy: (trustMemberships, { desc }) => [desc(trustMemberships.createdAt)]
    });

    const allTemples = await db.query.temples.findMany({
      where: eq(temples.trustId, ctx.trustId)
    });

    const results = await Promise.all(
      tMembers.map(async (tm) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, tm.userId) });
        const profile = await db.query.personProfiles.findFirst({
          where: and(eq(personProfiles.userId, tm.userId), eq(personProfiles.trustId, ctx.trustId))
        });

        // Fetch assigned temple memberships
        const activeTempleMemberships = await db.query.templeMemberships.findMany({
          where: and(
            eq(templeMemberships.trustId, ctx.trustId),
            eq(templeMemberships.userId, tm.userId),
            eq(templeMemberships.status, 'ACTIVE')
          )
        });

        const assignedTemples = activeTempleMemberships.map(atm => {
          const t = allTemples.find(x => x.id === atm.templeId);
          return {
            templeId: atm.templeId,
            templeName: t?.name || atm.templeId,
            templeCode: t?.code || '',
            status: atm.status
          };
        });

        // Fetch committee assignments
        const commMemberships = await db.query.committeeMembers.findMany({
          where: and(
            eq(committeeMembers.trustId, ctx.trustId),
            eq(committeeMembers.userId, tm.userId),
            eq(committeeMembers.status, 'ACTIVE')
          )
        });

        const assignedCommittees = await Promise.all(
          commMemberships.map(async (cm) => {
            const c = await db.query.committees.findFirst({ where: eq(committees.id, cm.committeeId) });
            return {
              committeeId: cm.committeeId,
              committeeName: c?.name || cm.committeeId,
              committeeRole: cm.committeeRole,
              status: cm.status
            };
          })
        );

        // Fetch office bearer appointments
        const obAppointees = await db.query.officeBearers.findMany({
          where: and(
            eq(officeBearers.trustId, ctx.trustId),
            eq(officeBearers.userId, tm.userId),
            eq(officeBearers.appointmentStatus, 'ACTIVE')
          )
        });

        const activeDesignations = await Promise.all(
          obAppointees.map(async (ob) => {
            const desig = await db.query.designations.findFirst({ where: eq(designations.id, ob.designationId) });
            return {
              designationId: ob.designationId,
              designationName: desig?.name || 'Custom Title',
              scopeId: ob.scopeId,
              resolutionNo: ob.resolutionNo || ''
            };
          })
        );

        return {
          id: tm.id,
          userId: tm.userId,
          trustId: tm.trustId,
          name: profile?.fullName || user?.name || 'Unknown',
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          gotra: profile?.gotra || '',
          photoUrl: profile?.photoUrl || user?.avatarUrl || '',
          membershipType: tm.membershipType,
          status: tm.status,
          validFrom: tm.validFrom,
          validUntil: tm.validUntil,
          assignedTemples,
          assignedCommittees,
          activeDesignations,
          createdAt: tm.createdAt
        };
      })
    );

    // Apply templeId filter if present
    if (filter?.templeId) {
      return results.filter(r => r.assignedTemples.some(t => t.templeId === filter.templeId));
    }

    return results;
  }

  /**
   * Invite or add a new member with multi-temple & committee assignments
   */
  async inviteOrAddMember(ctx: RequestContext, input: AddMemberInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    // 1. Resolve or Create User
    let user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      const [createdUser] = await db.insert(users).values({
        id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        email,
        name,
        mobileNumber: input.phone || null,
        avatarUrl: input.photoUrl || null,
        status: 'ACTIVE'
      }).returning();
      user = createdUser;
    }

    // 2. Resolve or Create Person Profile
    let profile = await db.query.personProfiles.findFirst({
      where: and(eq(personProfiles.userId, user.id), eq(personProfiles.trustId, ctx.trustId))
    });
    if (!profile) {
      await db.insert(personProfiles).values({
        id: `pp_${user.id}`,
        trustId: ctx.trustId,
        userId: user.id,
        fullName: name,
        phone: input.phone || null,
        gotra: input.gotra || null,
        photoUrl: input.photoUrl || null
      });
    }

    // 3. Upsert Trust Membership
    let trustMem = await db.query.trustMemberships.findFirst({
      where: and(eq(trustMemberships.userId, user.id), eq(trustMemberships.trustId, ctx.trustId))
    });
    if (!trustMem) {
      const [newTm] = await db.insert(trustMemberships).values({
        id: `tm_${user.id}_${ctx.trustId}`,
        trustId: ctx.trustId,
        userId: user.id,
        membershipType: input.membershipType || 'STANDARD',
        validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        status: 'ACTIVE'
      }).returning();
      trustMem = newTm;
    }

    // 4. Multi-Temple Assignments
    if (input.templeIds && input.templeIds.length > 0) {
      for (const templeId of input.templeIds) {
        const existingTmp = await db.query.templeMemberships.findFirst({
          where: and(
            eq(templeMemberships.trustId, ctx.trustId),
            eq(templeMemberships.templeId, templeId),
            eq(templeMemberships.userId, user.id)
          )
        });
        if (!existingTmp) {
          await db.insert(templeMemberships).values({
            id: `tem_mem_${user.id}_${templeId}`,
            trustId: ctx.trustId,
            templeId,
            userId: user.id,
            status: 'ACTIVE',
            validFrom: new Date()
          });
        }
      }
    }

    // 5. Committee Assignment
    if (input.committeeId) {
      const existingCm = await db.query.committeeMembers.findFirst({
        where: and(
          eq(committeeMembers.trustId, ctx.trustId),
          eq(committeeMembers.committeeId, input.committeeId),
          eq(committeeMembers.userId, user.id)
        )
      });
      if (!existingCm) {
        await db.insert(committeeMembers).values({
          id: `cm_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          trustId: ctx.trustId,
          committeeId: input.committeeId,
          userId: user.id,
          designationId: input.designationId || null,
          committeeRole: (input.committeeRole || 'MEMBER').toUpperCase(),
          status: 'ACTIVE',
          appointedBy: ctx.userId
        });
      }
    }

    // 6. Audit Logging
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'MEMBER_REGISTERED',
      targetType: 'trust_membership',
      targetId: trustMem.id,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        userId: user.id,
        name,
        email,
        membershipType: input.membershipType,
        templeIds: input.templeIds,
        committeeId: input.committeeId
      }
    });

    return {
      userId: user.id,
      name,
      email,
      membershipType: trustMem.membershipType,
      status: trustMem.status
    };
  }

  /**
   * Update member demographic profile and membership status
   */
  async updateMember(ctx: RequestContext, userId: string, input: UpdateMemberInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    if (input.name) {
      await db.update(users)
        .set({ name: input.name.trim(), mobileNumber: input.phone || null, avatarUrl: input.photoUrl || null, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    // Update person profile
    const profile = await db.query.personProfiles.findFirst({
      where: and(eq(personProfiles.userId, userId), eq(personProfiles.trustId, ctx.trustId))
    });
    if (profile) {
      await db.update(personProfiles)
        .set({
          fullName: input.name ? input.name.trim() : profile.fullName,
          phone: input.phone !== undefined ? input.phone : profile.phone,
          gotra: input.gotra !== undefined ? input.gotra : profile.gotra,
          photoUrl: input.photoUrl !== undefined ? input.photoUrl : profile.photoUrl,
          updatedAt: new Date()
        })
        .where(eq(personProfiles.id, profile.id));
    }

    // Update trust membership
    const tmUpdates: any = { updatedAt: new Date() };
    if (input.membershipType) tmUpdates.membershipType = input.membershipType;
    if (input.status) tmUpdates.status = input.status;
    if (input.validFrom) tmUpdates.validFrom = new Date(input.validFrom);
    if (input.validUntil !== undefined) tmUpdates.validUntil = input.validUntil ? new Date(input.validUntil) : null;

    await db.update(trustMemberships)
      .set(tmUpdates)
      .where(and(eq(trustMemberships.userId, userId), eq(trustMemberships.trustId, ctx.trustId)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'MEMBER_UPDATED',
      targetType: 'trust_membership',
      targetId: userId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { updatedFields: Object.keys(input) }
    });

    return { userId, status: input.status || 'ACTIVE' };
  }

  /**
   * List members scoped to a specific child temple
   */
  async listTempleMembers(ctx: RequestContext, templeId: string) {
    const list = await db.query.templeMemberships.findMany({
      where: and(
        eq(templeMemberships.trustId, ctx.trustId),
        eq(templeMemberships.templeId, templeId),
        eq(templeMemberships.status, 'ACTIVE')
      )
    });

    const results = await Promise.all(
      list.map(async (tm) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, tm.userId) });
        const profile = await db.query.personProfiles.findFirst({
          where: and(eq(personProfiles.userId, tm.userId), eq(personProfiles.trustId, ctx.trustId))
        });
        return {
          id: tm.id,
          userId: tm.userId,
          templeId: tm.templeId,
          name: profile?.fullName || user?.name || 'Unknown',
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          status: tm.status,
          validFrom: tm.validFrom
        };
      })
    );

    return results;
  }

  /**
   * Assign or revoke member to a specific child temple
   */
  async assignTempleMembership(ctx: RequestContext, templeId: string, userId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const existing = await db.query.templeMemberships.findFirst({
      where: and(
        eq(templeMemberships.trustId, ctx.trustId),
        eq(templeMemberships.templeId, templeId),
        eq(templeMemberships.userId, userId)
      )
    });

    if (existing) {
      if (existing.status !== 'ACTIVE') {
        await db.update(templeMemberships)
          .set({ status: 'ACTIVE', updatedAt: new Date() })
          .where(eq(templeMemberships.id, existing.id));
      }
      return existing;
    }

    const [created] = await db.insert(templeMemberships).values({
      id: `tem_mem_${userId}_${templeId}`,
      trustId: ctx.trustId,
      templeId,
      userId,
      status: 'ACTIVE',
      validFrom: new Date()
    }).returning();

    return created;
  }

  async revokeTempleMembership(ctx: RequestContext, templeId: string, userId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    await db.update(templeMemberships)
      .set({ status: 'REVOKED', updatedAt: new Date() })
      .where(and(
        eq(templeMemberships.trustId, ctx.trustId),
        eq(templeMemberships.templeId, templeId),
        eq(templeMemberships.userId, userId)
      ));

    return { success: true, templeId, userId };
  }
}

export const memberRepository = new MemberRepository();
