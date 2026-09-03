import { db } from '../db/client';
import { 
  designations, 
  officeBearers, 
  designationRoleBindings, 
  roles, 
  roleAssignments, 
  users, 
  personProfiles, 
  temples, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateDesignationInput {
  name: string;
  scopeType: 'TRUST' | 'TEMPLE';
  scopeId?: string;
  description?: string;
  cadreRank?: string;
  department?: string;
  roleBinding?: {
    roleId: string;
    autoAssign?: boolean;
  };
}

export interface UpdateDesignationInput {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  cadreRank?: string;
  department?: string;
  roleBinding?: {
    roleId: string;
    autoAssign?: boolean;
  };
}

export interface AppointOfficeBearerInput {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  gotra?: string;
  photoUrl?: string;
  designationId: string;
  scopeId?: string;
  termStart?: string;
  termEnd?: string | null;
  resolutionNo?: string;
  metadataJson?: Record<string, any>;
}

export class DesignationRepository {
  /**
   * List all designations under a Trust (filterable by scope: Trust or Temple)
   */
  async listDesignations(ctx: RequestContext, filter?: { scopeType?: 'TRUST' | 'TEMPLE'; scopeId?: string }) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [eq(designations.trustId, ctx.trustId)];
    if (filter?.scopeType) conditions.push(eq(designations.scopeType, filter.scopeType));
    if (filter?.scopeId) conditions.push(eq(designations.scopeId, filter.scopeId));

    let list = await db.query.designations.findMany({
      where: and(...conditions),
      orderBy: (designations, { asc }) => [asc(designations.name)]
    });

    // Seed default baseline traditional designations if empty
    if (list.length === 0) {
      const presets = [
        { name: 'Dharmadhikari & Managing Trustee', scopeType: 'TRUST' as const, desc: 'Apex custodian of spiritual, agamic, and administrative trust governance' },
        { name: 'Bhandari & Chief Treasurer', scopeType: 'TRUST' as const, desc: 'Chief custodian of sacred jewellery, treasury, and financial endowments' },
        { name: 'Pradhana Archaka (Chief Priest)', scopeType: 'TEMPLE' as const, desc: 'Sanctum leadership, nitya pooja scheduling, and archaka shifts' },
        { name: 'Yajnadhikari & Agama Advisor', scopeType: 'TRUST' as const, desc: 'Supervision of Maha Yagnas, Kumbhabhishekam, and Veda Parayanam' },
        { name: 'Paricharakar (Sanctum Attendant)', scopeType: 'TEMPLE' as const, desc: 'Daily sanctum preparation, holy water collection, and floral offerings' },
        { name: 'Madi Kitchen & Annadanam Superintendent', scopeType: 'TEMPLE' as const, desc: 'Strict madi prasadam preparation and large-scale annadanam services' }
      ];

      for (const p of presets) {
        const id = `desig_${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
        await db.insert(designations).values({
          id,
          trustId: ctx.trustId,
          scopeType: p.scopeType,
          scopeId: ctx.trustId,
          name: p.name,
          description: p.desc,
          status: 'ACTIVE'
        });
      }

      list = await db.query.designations.findMany({
        where: and(...conditions),
        orderBy: (designations, { asc }) => [asc(designations.name)]
      });
    }

    const results = await Promise.all(
      list.map(async (d) => {
        // Count active office bearers currently holding this designation
        const obCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(officeBearers)
          .where(and(eq(officeBearers.designationId, d.id), eq(officeBearers.appointmentStatus, 'ACTIVE')));

        // Check if a role binding is attached
        const binding = await db.query.designationRoleBindings.findFirst({
          where: eq(designationRoleBindings.designationId, d.id)
        });

        let boundRoleName = '';
        if (binding) {
          const r = await db.query.roles.findFirst({ where: eq(roles.id, binding.roleId) });
          boundRoleName = r?.name || '';
        }

        let scopeName = 'Trust Umbrella';
        if (d.scopeType === 'TEMPLE') {
          const t = await db.query.temples.findFirst({ where: eq(temples.id, d.scopeId) });
          scopeName = t?.name || d.scopeId;
        }

        return {
          id: d.id,
          trustId: d.trustId,
          scopeType: d.scopeType,
          scopeId: d.scopeId,
          scopeName,
          name: d.name,
          description: d.description || '',
          status: d.status,
          activeAppointeesCount: Number(obCount[0]?.count || 0),
          roleBinding: binding ? {
            roleId: binding.roleId,
            roleName: boundRoleName,
            autoAssign: binding.autoAssign
          } : null,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        };
      })
    );

    return results;
  }

  /**
   * Create custom dynamic designation
   */
  async createDesignation(ctx: RequestContext, input: CreateDesignationInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const scopeId = input.scopeId || ctx.trustId;
    const scopeType = input.scopeType || 'TRUST';

    const existing = await db.query.designations.findFirst({
      where: and(
        eq(designations.trustId, ctx.trustId),
        eq(designations.scopeId, scopeId),
        eq(designations.name, input.name.trim())
      )
    });

    if (existing) {
      return existing;
    }

    const designationId = `desig_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const [created] = await db.insert(designations).values({
      id: designationId,
      trustId: ctx.trustId,
      scopeType,
      scopeId,
      name: input.name.trim(),
      description: input.description || null,
      status: 'ACTIVE'
    }).returning();

    // Attach role binding if specified
    if (input.roleBinding?.roleId) {
      await db.insert(designationRoleBindings).values({
        id: `drb_${designationId}_${input.roleBinding.roleId}`,
        designationId,
        roleId: input.roleBinding.roleId,
        autoAssign: input.roleBinding.autoAssign !== undefined ? input.roleBinding.autoAssign : true
      });
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'DESIGNATION_CREATED',
      targetType: 'designation',
      targetId: designationId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        name: input.name,
        scopeType,
        scopeId,
        roleBinding: input.roleBinding
      }
    });

    return created;
  }

  /**
   * Appoint an Office Bearer to a designation
   */
  async appointOfficeBearer(ctx: RequestContext, input: AppointOfficeBearerInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    let userId = input.userId;

    // Auto-resolve or create user & person profile if provided
    if (!userId && input.email && input.name) {
      const email = input.email.trim().toLowerCase();
      let user = await db.query.users.findFirst({ where: eq(users.email, email) });
      if (!user) {
        const [createdUser] = await db.insert(users).values({
          id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          email,
          name: input.name.trim(),
          mobileNumber: input.phone || null,
          avatarUrl: input.photoUrl || null,
          status: 'ACTIVE'
        }).returning();
        user = createdUser;
      }
      userId = user.id;

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
          gotra: input.gotra || null,
          photoUrl: input.photoUrl || null
        });
      }
    }

    if (!userId) {
      throw new Error('User ID or complete Person details (name, email) are required for appointment.');
    }

    const scopeId = input.scopeId || ctx.trustId;
    const appointmentId = `ob_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const [appointment] = await db.insert(officeBearers).values({
      id: appointmentId,
      trustId: ctx.trustId,
      scopeId,
      userId,
      designationId: input.designationId,
      termStart: input.termStart ? new Date(input.termStart) : new Date(),
      termEnd: input.termEnd ? new Date(input.termEnd) : null,
      resolutionNo: input.resolutionNo || null,
      metadataJson: input.metadataJson || {},
      appointmentStatus: 'ACTIVE',
      appointedBy: ctx.userId
    }).returning();

    // Auto-grant linked software role if autoAssign is enabled
    const binding = await db.query.designationRoleBindings.findFirst({
      where: and(
        eq(designationRoleBindings.designationId, input.designationId),
        eq(designationRoleBindings.autoAssign, true)
      )
    });

    if (binding) {
      await db.insert(roleAssignments).values({
        id: `ra_ob_${appointmentId}`,
        trustId: ctx.trustId,
        roleId: binding.roleId,
        userId,
        scopeId,
        assignmentSource: 'DESIGNATION_BINDING',
        validFrom: appointment.termStart,
        validUntil: appointment.termEnd,
        status: 'ACTIVE',
        assignedBy: ctx.userId
      });
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'OFFICE_BEARER_APPOINTED',
      targetType: 'office_bearer',
      targetId: appointmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        userId,
        designationId: input.designationId,
        scopeId,
        resolutionNo: input.resolutionNo
      }
    });

    return appointment;
  }

  /**
   * List all office-bearer appointments across Trust and child Temples
   */
  async listOfficeBearers(ctx: RequestContext, filter?: { scopeId?: string; designationId?: string; status?: string }) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [eq(officeBearers.trustId, ctx.trustId)];
    if (filter?.scopeId) conditions.push(eq(officeBearers.scopeId, filter.scopeId));
    if (filter?.designationId) conditions.push(eq(officeBearers.designationId, filter.designationId));
    if (filter?.status) conditions.push(eq(officeBearers.appointmentStatus, filter.status));

    const list = await db.query.officeBearers.findMany({
      where: and(...conditions),
      orderBy: (officeBearers, { desc }) => [desc(officeBearers.createdAt)]
    });

    const results = await Promise.all(
      list.map(async (ob) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, ob.userId) });
        const profile = await db.query.personProfiles.findFirst({
          where: and(eq(personProfiles.userId, ob.userId), eq(personProfiles.trustId, ctx.trustId))
        });
        const designation = await db.query.designations.findFirst({
          where: eq(designations.id, ob.designationId)
        });

        let scopeName = 'Trust Umbrella';
        if (ob.scopeId !== ctx.trustId) {
          const t = await db.query.temples.findFirst({ where: eq(temples.id, ob.scopeId) });
          scopeName = t?.name || ob.scopeId;
        }

        return {
          id: ob.id,
          trustId: ob.trustId,
          scopeId: ob.scopeId,
          scopeName,
          userId: ob.userId,
          personName: profile?.fullName || user?.name || 'Unknown',
          email: user?.email || '',
          phone: profile?.phone || user?.mobileNumber || '',
          gotra: profile?.gotra || '',
          photoUrl: profile?.photoUrl || user?.avatarUrl || '',
          designationId: ob.designationId,
          designationName: designation?.name || 'Custom Designation',
          termStart: ob.termStart,
          termEnd: ob.termEnd,
          isLifeTerm: ob.termEnd === null,
          resolutionNo: ob.resolutionNo || '',
          metadataJson: ob.metadataJson || {},
          appointmentStatus: ob.appointmentStatus,
          createdAt: ob.createdAt
        };
      })
    );

    return results;
  }

  /**
   * Update Office Bearer status (ACTIVE | EXPIRED | RESIGNED | REVOKED)
   */
  async updateOfficeBearerStatus(
    ctx: RequestContext, 
    appointmentId: string, 
    status: 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED'
  ) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const existing = await db.query.officeBearers.findFirst({
      where: and(eq(officeBearers.id, appointmentId), eq(officeBearers.trustId, ctx.trustId))
    });

    if (!existing) throw new Error(`Appointment '${appointmentId}' not found.`);

    await db.update(officeBearers)
      .set({ appointmentStatus: status, updatedAt: new Date() })
      .where(and(eq(officeBearers.id, appointmentId), eq(officeBearers.trustId, ctx.trustId)));

    // If resigned/revoked/expired, also revoke auto-bound role assignment if present
    if (status !== 'ACTIVE') {
      await db.update(roleAssignments)
        .set({ status: 'REVOKED', updatedAt: new Date() })
        .where(eq(roleAssignments.id, `ra_ob_${appointmentId}`));
    }

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'OFFICE_BEARER_STATUS_CHANGED',
      targetType: 'office_bearer',
      targetId: appointmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { newStatus: status }
    });

    return { appointmentId, status };
  }
}

export const designationRepository = new DesignationRepository();
