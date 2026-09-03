import { db } from '../db/client';
import { 
  trusts, 
  temples, 
  organizationNodes, 
  committees, 
  committeeMembers, 
  users, 
  personProfiles, 
  designations, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateCommitteeInput {
  name: string;
  code: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId?: string;
  parentId?: string | null;
  category?: 'STANDING' | 'AD_HOC' | 'ADVISORY' | 'RENOVATION' | 'FESTIVAL' | 'FINANCE' | 'LEGAL' | 'CUSTOM';
  mandate?: string;
  formationDate?: string;
  dissolutionDate?: string | null;
  status?: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED';
  metadataJson?: Record<string, any>;
}

export interface UpdateCommitteeInput {
  name?: string;
  code?: string;
  category?: 'STANDING' | 'AD_HOC' | 'ADVISORY' | 'RENOVATION' | 'FESTIVAL' | 'FINANCE' | 'LEGAL' | 'CUSTOM';
  mandate?: string;
  formationDate?: string;
  dissolutionDate?: string | null;
  status?: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED';
  metadataJson?: Record<string, any>;
}

export interface AppointCommitteeMemberInput {
  name: string;
  email: string;
  phone?: string;
  gotra?: string;
  avatarUrl?: string;
  committeeRole: string; // 'CHAIRMAN' | 'CONVENER' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'TECHNICAL_EXPERT' | 'ADVISOR'
  designationId?: string;
  termStart?: string;
  termEnd?: string | null;
}

export class CommitteeRepository {
  /**
   * List all committees under a Trust (filterable by scope and category)
   */
  async listCommittees(ctx: RequestContext, filter?: { scopeType?: 'TRUST' | 'TEMPLE'; scopeId?: string; category?: string }) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [eq(committees.trustId, ctx.trustId)];
    if (filter?.scopeType) conditions.push(eq(committees.scopeType, filter.scopeType));
    if (filter?.scopeId) conditions.push(eq(committees.scopeId, filter.scopeId));
    if (filter?.category) conditions.push(eq(committees.category, filter.category));

    const committeeList = await db.query.committees.findMany({
      where: and(...conditions),
      orderBy: (committees, { asc }) => [asc(committees.name)]
    });

    const results = await Promise.all(
      committeeList.map(async (c) => {
        // Count active members
        const memberCountRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(committeeMembers)
          .where(and(eq(committeeMembers.committeeId, c.id), eq(committeeMembers.status, 'ACTIVE')));

        // Find Convener / Chairman
        const leadMember = await db.query.committeeMembers.findFirst({
          where: and(
            eq(committeeMembers.committeeId, c.id),
            eq(committeeMembers.status, 'ACTIVE'),
            sql`${committeeMembers.committeeRole} IN ('CHAIRMAN', 'CONVENER', 'PRESIDENT')`
          )
        });

        let leadName = '';
        if (leadMember) {
          const u = await db.query.users.findFirst({ where: eq(users.id, leadMember.userId) });
          leadName = u?.name || '';
        }

        let scopeName = 'Trust Umbrella';
        if (c.scopeType === 'TEMPLE') {
          const t = await db.query.temples.findFirst({ where: eq(temples.id, c.scopeId) });
          scopeName = t?.name || c.scopeId;
        }

        return {
          id: c.id,
          trustId: c.trustId,
          scopeType: c.scopeType,
          scopeId: c.scopeId,
          scopeName,
          parentId: c.parentId,
          organizationNodeId: c.organizationNodeId,
          code: c.code,
          name: c.name,
          category: c.category,
          mandate: c.mandate || '',
          formationDate: c.formationDate,
          dissolutionDate: c.dissolutionDate,
          status: c.status,
          metadataJson: c.metadataJson || {},
          memberCount: Number(memberCountRes[0]?.count || 0),
          convenerName: leadName,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        };
      })
    );

    return results;
  }

  /**
   * Create a dynamic committee or sub-committee
   */
  async createCommittee(ctx: RequestContext, input: CreateCommitteeInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const normalizedCode = input.code.trim().toUpperCase();
    const existing = await db.query.committees.findFirst({
      where: and(
        eq(committees.trustId, ctx.trustId),
        eq(committees.code, normalizedCode)
      )
    });

    if (existing) {
      throw new Error(`A committee with code '${normalizedCode}' already exists in this Trust.`);
    }

    const scopeId = input.scopeId || ctx.trustId;
    const committeeId = `comm_${normalizedCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const orgNodeId = `node_${committeeId}`;

    // Ensure parent org node
    let parentOrgNodeId: string | null = null;
    let parentPath = `/${ctx.trustId}`;

    if (input.parentId) {
      const parentComm = await db.query.committees.findFirst({
        where: and(eq(committees.id, input.parentId), eq(committees.trustId, ctx.trustId))
      });
      if (parentComm?.organizationNodeId) {
        const pNode = await db.query.organizationNodes.findFirst({
          where: eq(organizationNodes.id, parentComm.organizationNodeId)
        });
        if (pNode) {
          parentOrgNodeId = pNode.id;
          parentPath = pNode.materializedPath;
        }
      }
    } else if (input.scopeType === 'TEMPLE') {
      const temple = await db.query.temples.findFirst({
        where: and(eq(temples.id, scopeId), eq(temples.trustId, ctx.trustId))
      });
      if (temple?.organizationNodeId) {
        parentOrgNodeId = temple.organizationNodeId;
        parentPath = `/${ctx.trustId}/${temple.organizationNodeId}`;
      }
    }

    // Insert Organization Node
    const materializedPath = `${parentPath}/${orgNodeId}`;
    await db.insert(organizationNodes).values({
      id: orgNodeId,
      trustId: ctx.trustId,
      parentId: parentOrgNodeId,
      nodeType: input.parentId ? 'SUB_COMMITTEE' : 'COMMITTEE',
      name: input.name.trim(),
      materializedPath,
      hierarchyVersion: 1,
      status: 'ACTIVE'
    });

    // Insert Committee
    const [created] = await db.insert(committees).values({
      id: committeeId,
      trustId: ctx.trustId,
      scopeType: input.scopeType,
      scopeId,
      parentId: input.parentId || null,
      organizationNodeId: orgNodeId,
      code: normalizedCode,
      name: input.name.trim(),
      category: input.category || 'STANDING',
      mandate: input.mandate || null,
      formationDate: input.formationDate ? new Date(input.formationDate) : new Date(),
      dissolutionDate: input.dissolutionDate ? new Date(input.dissolutionDate) : null,
      status: input.status || 'ACTIVE',
      metadataJson: input.metadataJson || {}
    }).returning();

    // Insert Audit Event
    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'COMMITTEE_CREATED',
      targetType: 'committee',
      targetId: committeeId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        code: normalizedCode,
        name: input.name,
        category: input.category,
        scopeType: input.scopeType,
        scopeId
      }
    });

    return created;
  }

  /**
   * Get committee details with complete member roster
   */
  async getCommitteeById(ctx: RequestContext, committeeId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const committee = await db.query.committees.findFirst({
      where: and(
        eq(committees.id, committeeId),
        eq(committees.trustId, ctx.trustId)
      )
    });

    if (!committee) return null;

    const members = await this.listCommitteeMembers(ctx, committeeId);
    return {
      ...committee,
      members
    };
  }

  /**
   * Update committee details
   */
  async updateCommittee(ctx: RequestContext, committeeId: string, input: UpdateCommitteeInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const existing = await db.query.committees.findFirst({
      where: and(eq(committees.id, committeeId), eq(committees.trustId, ctx.trustId))
    });

    if (!existing) throw new Error(`Committee '${committeeId}' not found.`);

    const updates: Partial<typeof committees.$inferInsert> = {
      updatedAt: new Date()
    };

    if (input.name) updates.name = input.name.trim();
    if (input.code) updates.code = input.code.trim().toUpperCase();
    if (input.category) updates.category = input.category;
    if (input.mandate !== undefined) updates.mandate = input.mandate;
    if (input.formationDate) updates.formationDate = new Date(input.formationDate);
    if (input.dissolutionDate !== undefined) updates.dissolutionDate = input.dissolutionDate ? new Date(input.dissolutionDate) : null;
    if (input.status) updates.status = input.status;
    if (input.metadataJson) updates.metadataJson = input.metadataJson;

    await db.update(committees)
      .set(updates)
      .where(and(eq(committees.id, committeeId), eq(committees.trustId, ctx.trustId)));

    if (input.name && existing.organizationNodeId) {
      await db.update(organizationNodes)
        .set({ name: input.name.trim(), updatedAt: new Date() })
        .where(eq(organizationNodes.id, existing.organizationNodeId));
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'COMMITTEE_UPDATED',
      targetType: 'committee',
      targetId: committeeId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { updatedFields: Object.keys(input) }
    });

    return db.query.committees.findFirst({
      where: and(eq(committees.id, committeeId), eq(committees.trustId, ctx.trustId))
    });
  }

  /**
   * Appoint a user/trustee to a Committee
   */
  async appointCommitteeMember(ctx: RequestContext, committeeId: string, input: AppointCommitteeMemberInput) {
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

    // Resolve or Create User
    let user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      const userId = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const [createdUser] = await db.insert(users).values({
        id: userId,
        email,
        name,
        mobileNumber: input.phone || null,
        avatarUrl: input.avatarUrl || null,
        status: 'ACTIVE'
      }).returning();
      user = createdUser;
    }

    // Resolve or Create Person Profile
    let profile = await db.query.personProfiles.findFirst({
      where: and(eq(personProfiles.userId, user.id), eq(personProfiles.trustId, ctx.trustId))
    });
    if (!profile) {
      await db.insert(personProfiles).values({
        id: `pp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        trustId: ctx.trustId,
        userId: user.id,
        fullName: name,
        gotra: input.gotra || null,
        phone: input.phone || null,
        photoUrl: input.avatarUrl || null
      });
    }

    const memberId = `cm_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const [appointed] = await db.insert(committeeMembers).values({
      id: memberId,
      trustId: ctx.trustId,
      committeeId,
      userId: user.id,
      designationId: input.designationId || null,
      committeeRole: input.committeeRole.toUpperCase(),
      termStart: input.termStart ? new Date(input.termStart) : new Date(),
      termEnd: input.termEnd ? new Date(input.termEnd) : null,
      status: 'ACTIVE',
      appointedBy: ctx.userId
    }).returning();

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'COMMITTEE_MEMBER_APPOINTED',
      targetType: 'committee_member',
      targetId: memberId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        committeeId,
        memberName: name,
        committeeRole: input.committeeRole
      }
    });

    return appointed;
  }

  /**
   * List members of a committee
   */
  async listCommitteeMembers(ctx: RequestContext, committeeId: string) {
    const list = await db.query.committeeMembers.findMany({
      where: and(
        eq(committeeMembers.committeeId, committeeId),
        eq(committeeMembers.trustId, ctx.trustId)
      ),
      orderBy: (committeeMembers, { asc }) => [asc(committeeMembers.createdAt)]
    });

    const results = await Promise.all(
      list.map(async (m) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, m.userId) });
        const profile = await db.query.personProfiles.findFirst({
          where: and(eq(personProfiles.userId, m.userId), eq(personProfiles.trustId, ctx.trustId))
        });
        const designation = m.designationId 
          ? await db.query.designations.findFirst({ where: eq(designations.id, m.designationId) }) 
          : null;

        return {
          id: m.id,
          committeeId: m.committeeId,
          userId: m.userId,
          name: profile?.fullName || user?.name || 'Unknown',
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          gotra: profile?.gotra || '',
          avatarUrl: user?.avatarUrl || profile?.photoUrl || '',
          committeeRole: m.committeeRole,
          designationName: designation?.name || '',
          termStart: m.termStart,
          termEnd: m.termEnd,
          status: m.status,
          createdAt: m.createdAt
        };
      })
    );

    return results;
  }

  /**
   * Update Committee Member Status (ACTIVE | EXPIRED | RELIEVED)
   */
  async updateCommitteeMemberStatus(ctx: RequestContext, committeeId: string, memberId: string, status: 'ACTIVE' | 'EXPIRED' | 'RELIEVED') {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    await db.update(committeeMembers)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(committeeMembers.id, memberId), eq(committeeMembers.committeeId, committeeId), eq(committeeMembers.trustId, ctx.trustId)));

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'COMMITTEE_MEMBER_STATUS_CHANGED',
      targetType: 'committee_member',
      targetId: memberId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { newStatus: status }
    });

    return { memberId, status };
  }
}

export const committeeRepository = new CommitteeRepository();
