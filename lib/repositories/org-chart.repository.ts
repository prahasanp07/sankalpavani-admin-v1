import { db } from '../db/client';
import { 
  reportingRelationships, 
  users, 
  personProfiles, 
  designations, 
  temples, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface SaveStaffMemberInput {
  id?: string;
  userId?: string;
  name: string;
  role: string; // Designation Title
  department: 'Spiritual' | 'Admin' | 'Operations' | 'Finance' | string;
  subDepartment?: string;
  scopeId?: string;
  cadreRank?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  joinedYear?: string;
  status?: 'Active' | 'On Leave' | 'Duty-Assign';
  primarySupervisorId?: string | null;
  secondarySupervisorIds?: string[];
  responsibilities?: string;
}

export class OrgChartRepository {
  /**
   * Cycle Detection: Checks whether setting `supervisorId` for `targetUserId` creates a circular loop.
   */
  private checkCycle(
    allRelationships: Array<{ userId: string; primarySupervisorUserId: string | null; secondarySupervisorUserIds: string[] }>,
    targetUserId: string,
    proposedSupervisorId: string
  ): boolean {
    if (targetUserId === proposedSupervisorId) return true;

    const visited = new Set<string>();
    const queue = [proposedSupervisorId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetUserId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const rel = allRelationships.find(r => r.userId === current);
      if (rel) {
        if (rel.primarySupervisorUserId) queue.push(rel.primarySupervisorUserId);
        if (rel.secondarySupervisorUserIds) {
          for (const s of rel.secondarySupervisorUserIds) {
            queue.push(s);
          }
        }
      }
    }

    return false;
  }

  /**
   * Get dynamic org chart graph (nodes, edges, staff members)
   */
  async getOrgChartGraph(ctx: RequestContext, scopeId?: string) {
    const targetScopeId = scopeId || ctx.trustId;

    let relationships = await db.query.reportingRelationships.findMany({
      where: and(
        eq(reportingRelationships.trustId, ctx.trustId),
        eq(reportingRelationships.scopeId, targetScopeId)
      )
    });

    // Seed default baseline organization graph if empty
    if (relationships.length === 0) {
      const defaultMembers = [
        {
          name: 'Sri Vidhushekhara Bharati',
          role: 'Dharmadhikari & Managing Trustee',
          department: 'Spiritual',
          subDepartment: 'Apex Peetham Council',
          cadreRank: 'Apex',
          email: 'peetham@sringeri.org',
          phone: '+91 8265 250123',
          location: 'Sringeri Matha Campus',
          joinedYear: '2012',
          status: 'Active' as const,
          primarySupervisorId: null,
          secondarySupervisorIds: [],
          responsibilities: 'Spiritual guidance, Agama approvals, apex trust policies'
        },
        {
          name: 'Sri K. Venkataramanan',
          role: 'Chief Executive Officer (CEO)',
          department: 'Admin',
          subDepartment: 'Central Secretariat',
          cadreRank: 'Executive',
          email: 'ceo@sringeri.org',
          phone: '+91 8265 250456',
          location: 'Administrative Block, Gr. Floor',
          joinedYear: '2018',
          status: 'Active' as const,
          primarySupervisorId: null, // will link to Vidhushekhara Bharati
          secondarySupervisorIds: [],
          responsibilities: 'Day-to-day administration, budgeting, HR, inter-temple coordination'
        },
        {
          name: 'Sri V. Sitarama Sastry',
          role: 'Chief Financial Officer (CFO)',
          department: 'Finance',
          subDepartment: 'Treasury & Audit',
          cadreRank: 'Executive',
          email: 'cfo@sringeri.org',
          phone: '+91 8265 250789',
          location: 'Treasury Wing, 1st Floor',
          joinedYear: '2019',
          status: 'Active' as const,
          primarySupervisorId: null,
          secondarySupervisorIds: [],
          responsibilities: 'Hundi collections, bank operations, financial reporting'
        },
        {
          name: 'Sri R. Ramanatha Dikshidar',
          role: 'Chief Priest (Pradhana Archaka)',
          department: 'Spiritual',
          subDepartment: 'Sanctum Services',
          cadreRank: 'Superintendent',
          email: 'archaka.head@sringeri.org',
          phone: '+91 8265 250321',
          location: 'Sri Sharadamba Sannidhi',
          joinedYear: '2015',
          status: 'Active' as const,
          primarySupervisorId: null,
          secondarySupervisorIds: [],
          responsibilities: 'Nitya pooja, Utsavam vidhi, archaka shift scheduling'
        },
        {
          name: 'Sri M. Ganeshan',
          role: 'Booking Desk Superintendent',
          department: 'Operations',
          subDepartment: 'Devotee Services',
          cadreRank: 'Superintendent',
          email: 'booking.lead@sringeri.org',
          phone: '+91 8265 250654',
          location: 'Devotee Reception Counter 1',
          joinedYear: '2020',
          status: 'Duty-Assign' as const,
          primarySupervisorId: null,
          secondarySupervisorIds: [],
          responsibilities: 'Gotra seva bookings, counter queues, receipt reconciliations'
        }
      ];

      // Insert default users and relationships
      const insertedUsers: string[] = [];
      for (const m of defaultMembers) {
        const userId = `usr_org_${m.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
        insertedUsers.push(userId);

        await db.insert(users).values({
          id: userId,
          email: m.email,
          name: m.name,
          mobileNumber: m.phone,
          status: 'ACTIVE'
        });

        await db.insert(personProfiles).values({
          id: `pp_${userId}`,
          trustId: ctx.trustId,
          userId,
          fullName: m.name,
          phone: m.phone
        });
      }

      // Link relationships
      // 0: Vidhushekhara (Apex)
      // 1: CEO -> reports to 0
      // 2: CFO -> reports to 1 (CEO), matrix to 0
      // 3: Chief Priest -> reports to 0, matrix to 1
      // 4: Booking Superintendent -> reports to 1 (CEO), matrix to 3 (Chief Priest)
      const relConfigs = [
        { userIdx: 0, primaryIdx: null, matrixIdxs: [] },
        { userIdx: 1, primaryIdx: 0, matrixIdxs: [] },
        { userIdx: 2, primaryIdx: 1, matrixIdxs: [0] },
        { userIdx: 3, primaryIdx: 0, matrixIdxs: [1] },
        { userIdx: 4, primaryIdx: 1, matrixIdxs: [3] }
      ];

      for (let i = 0; i < defaultMembers.length; i++) {
        const m = defaultMembers[i];
        const cfg = relConfigs[i];
        const userId = insertedUsers[cfg.userIdx];
        const primarySupervisorUserId = cfg.primaryIdx !== null ? insertedUsers[cfg.primaryIdx] : null;
        const secondarySupervisorUserIds = cfg.matrixIdxs.map(idx => insertedUsers[idx]);

        await db.insert(reportingRelationships).values({
          id: `rel_${userId}`,
          trustId: ctx.trustId,
          scopeId: targetScopeId,
          userId,
          primarySupervisorUserId,
          secondarySupervisorUserIds,
          department: m.department,
          subDepartment: m.subDepartment,
          cadreRank: m.cadreRank,
          status: m.status,
          responsibilities: m.responsibilities,
          location: m.location,
          joinedYear: m.joinedYear
        });
      }

      relationships = await db.query.reportingRelationships.findMany({
        where: and(
          eq(reportingRelationships.trustId, ctx.trustId),
          eq(reportingRelationships.scopeId, targetScopeId)
        )
      });
    }

    // Build staff members array
    const staffMembers = await Promise.all(
      relationships.map(async (r) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, r.userId) });
        const profile = await db.query.personProfiles.findFirst({
          where: and(eq(personProfiles.userId, r.userId), eq(personProfiles.trustId, ctx.trustId))
        });

        // Count subordinates (direct reportees)
        const subCount = relationships.filter(other => other.primarySupervisorUserId === r.userId).length;
        // Count matrix reportees
        const matrixCount = relationships.filter(other => other.secondarySupervisorUserIds?.includes(r.userId)).length;

        return {
          id: r.userId,
          name: profile?.fullName || user?.name || 'Staff Member',
          role: r.cadreRank || 'Staff',
          department: r.department as any,
          subDepartment: r.subDepartment || '',
          avatar: user?.avatarUrl || profile?.photoUrl || undefined,
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          location: r.location || 'Temple Campus',
          joinedYear: r.joinedYear || '2023',
          status: r.status as any,
          primarySupervisorId: r.primarySupervisorUserId || undefined,
          secondarySupervisorIds: r.secondarySupervisorUserIds || [],
          responsibilities: r.responsibilities || '',
          subordinatesCount: subCount,
          matrixCount: matrixCount
        };
      })
    );

    // Build graph edges
    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: 'smoothstep' | 'matrix';
      animated?: boolean;
      data?: any;
    }> = [];

    for (const r of relationships) {
      if (r.primarySupervisorUserId) {
        edges.push({
          id: `edge-primary-${r.primarySupervisorUserId}-${r.userId}`,
          source: r.primarySupervisorUserId,
          target: r.userId,
          type: 'smoothstep'
        });
      }

      if (r.secondarySupervisorUserIds && r.secondarySupervisorUserIds.length > 0) {
        for (const secId of r.secondarySupervisorUserIds) {
          edges.push({
            id: `edge-matrix-${secId}-${r.userId}`,
            source: secId,
            target: r.userId,
            type: 'matrix',
            animated: true,
            data: { label: 'Matrix Oversight' }
          });
        }
      }
    }

    return {
      staffMembers,
      edges,
      totalStaffCount: staffMembers.length
    };
  }

  /**
   * Save or update staff member and reporting relationships with Cycle Detection
   */
  async saveStaffMemberWithReporting(ctx: RequestContext, input: SaveStaffMemberInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const targetScopeId = input.scopeId || ctx.trustId;
    let userId = input.userId || input.id;

    // Resolve or create user if needed
    if (!userId) {
      const email = input.email?.trim().toLowerCase() || `staff_${Date.now()}@sankalpvani.org`;
      let user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (!user) {
        const [createdUser] = await db.insert(users).values({
          id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          email,
          name: input.name.trim(),
          mobileNumber: input.phone || null,
          avatarUrl: input.avatar || null,
          status: 'ACTIVE'
        }).returning();
        user = createdUser;
      }
      userId = user.id;

      // Upsert person profile
      const profile = await db.query.personProfiles.findFirst({
        where: and(eq(personProfiles.userId, userId), eq(personProfiles.trustId, ctx.trustId))
      });
      if (!profile) {
        await db.insert(personProfiles).values({
          id: `pp_${userId}`,
          trustId: ctx.trustId,
          userId,
          fullName: input.name.trim(),
          phone: input.phone || null,
          photoUrl: input.avatar || null
        });
      }
    }

    // Cycle Detection
    const allRelationships = await db.query.reportingRelationships.findMany({
      where: and(
        eq(reportingRelationships.trustId, ctx.trustId),
        eq(reportingRelationships.scopeId, targetScopeId)
      )
    });

    if (input.primarySupervisorId) {
      const isCycle = this.checkCycle(
        allRelationships.map(r => ({
          userId: r.userId,
          primarySupervisorUserId: r.primarySupervisorUserId,
          secondarySupervisorUserIds: r.secondarySupervisorUserIds || []
        })),
        userId,
        input.primarySupervisorId
      );
      if (isCycle) {
        throw new Error('Invalid reporting line: Setting this supervisor creates a circular hierarchy loop.');
      }
    }

    if (input.secondarySupervisorIds && input.secondarySupervisorIds.length > 0) {
      for (const secId of input.secondarySupervisorIds) {
        const isCycle = this.checkCycle(
          allRelationships.map(r => ({
            userId: r.userId,
            primarySupervisorUserId: r.primarySupervisorUserId,
            secondarySupervisorUserIds: r.secondarySupervisorUserIds || []
          })),
          userId,
          secId
        );
        if (isCycle) {
          throw new Error('Invalid matrix reporting line: Setting this matrix supervisor creates a circular hierarchy loop.');
        }
      }
    }

    // Upsert reporting relationship
    const existing = await db.query.reportingRelationships.findFirst({
      where: and(
        eq(reportingRelationships.trustId, ctx.trustId),
        eq(reportingRelationships.scopeId, targetScopeId),
        eq(reportingRelationships.userId, userId)
      )
    });

    if (existing) {
      await db.update(reportingRelationships)
        .set({
          primarySupervisorUserId: input.primarySupervisorId || null,
          secondarySupervisorUserIds: input.secondarySupervisorIds || [],
          department: input.department,
          subDepartment: input.subDepartment || null,
          cadreRank: input.role || input.cadreRank || 'Staff',
          status: input.status || 'Active',
          responsibilities: input.responsibilities || null,
          location: input.location || null,
          joinedYear: input.joinedYear || null,
          updatedAt: new Date()
        })
        .where(eq(reportingRelationships.id, existing.id));
    } else {
      await db.insert(reportingRelationships).values({
        id: `rel_${userId}`,
        trustId: ctx.trustId,
        scopeId: targetScopeId,
        userId,
        primarySupervisorUserId: input.primarySupervisorId || null,
        secondarySupervisorUserIds: input.secondarySupervisorIds || [],
        department: input.department,
        subDepartment: input.subDepartment || null,
        cadreRank: input.role || input.cadreRank || 'Staff',
        status: input.status || 'Active',
        responsibilities: input.responsibilities || null,
        location: input.location || null,
        joinedYear: input.joinedYear || null
      });
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'ORG_CHART_UPDATED',
      targetType: 'reporting_relationship',
      targetId: userId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        userId,
        name: input.name,
        department: input.department,
        primarySupervisorId: input.primarySupervisorId,
        secondarySupervisorIds: input.secondarySupervisorIds
      }
    });

    return this.getOrgChartGraph(ctx, targetScopeId);
  }

  /**
   * Delete or archive staff reporting relationship
   */
  async deleteStaffReporting(ctx: RequestContext, userId: string, scopeId?: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const targetScopeId = scopeId || ctx.trustId;

    await db.delete(reportingRelationships)
      .where(and(
        eq(reportingRelationships.trustId, ctx.trustId),
        eq(reportingRelationships.scopeId, targetScopeId),
        eq(reportingRelationships.userId, userId)
      ));

    // Remove as supervisor from other rows
    await db.update(reportingRelationships)
      .set({ primarySupervisorUserId: null })
      .where(and(
        eq(reportingRelationships.trustId, ctx.trustId),
        eq(reportingRelationships.primarySupervisorUserId, userId)
      ));

    return { success: true, userId };
  }
}

export const orgChartRepository = new OrgChartRepository();
