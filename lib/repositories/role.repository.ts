import { db } from '../db/client';
import { 
  roles, 
  permissionDefinitions, 
  rolePermissions, 
  roleInheritances, 
  roleAssignments, 
  policyVersions, 
  users, 
  auditEvents 
} from '../../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { RequestContext } from '../tenant/context';
import { authorization } from '../authorization/service';

export interface CreateRoleInput {
  name: string;
  roleKey: string;
  description?: string;
  scopeType?: 'TRUST' | 'TEMPLE';
  scopeId?: string;
  isInheritable?: boolean;
  permissionIds?: string[];
  permissions?: Array<{
    permissionId: string;
    effect?: 'ALLOW' | 'DENY';
    scopeMode?: 'EXACT' | 'TRUST_ONLY' | 'ALL_DESCENDANTS' | 'SELECTED_DESCENDANTS';
    scopeSelectorJson?: any;
  }>;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
  permissionIds?: string[];
  permissions?: Array<{
    permissionId: string;
    effect?: 'ALLOW' | 'DENY';
    scopeMode?: 'EXACT' | 'TRUST_ONLY' | 'ALL_DESCENDANTS' | 'SELECTED_DESCENDANTS';
    scopeSelectorJson?: any;
  }>;
}

export interface AssignRoleInput {
  roleId: string;
  userId: string;
  scopeId?: string;
  assignmentSource?: 'DIRECT' | 'DESIGNATION_BINDING' | 'DELEGATION';
  validFrom?: string;
  validUntil?: string | null;
}

export class RoleRepository {
  /**
   * Bump monotonically increasing policy version for real-time cache invalidation
   */
  private async bumpPolicyVersion(ctx: RequestContext, changeSummary: string) {
    const latest = await db.query.policyVersions.findFirst({
      where: eq(policyVersions.trustId, ctx.trustId),
      orderBy: [desc(policyVersions.versionNumber)]
    });

    const nextVersion = (latest?.versionNumber || 0) + 1;
    const versionId = `pv_${Date.now().toString(36)}_${nextVersion}`;

    await db.insert(policyVersions).values({
      id: versionId,
      trustId: ctx.trustId,
      versionNumber: nextVersion,
      status: 'PUBLISHED',
      publishedBy: ctx.userId,
      changeSummary
    });

    return nextVersion;
  }

  /**
   * List custom dynamic roles with attached permissions and user counts
   */
  async listRoles(ctx: RequestContext, scopeType?: string, scopeId?: string): Promise<any[]> {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.view',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const conditions = [eq(roles.trustId, ctx.trustId)];
    if (scopeType) conditions.push(eq(roles.scopeType, scopeType));
    if (scopeId) conditions.push(eq(roles.scopeId, scopeId));

    const roleList = await db.query.roles.findMany({
      where: and(...conditions),
      orderBy: (roles, { asc }) => [asc(roles.name)]
    });

    // Seed baseline roles if empty for Trust
    if (roleList.length === 0 && (!scopeType || scopeType === 'TRUST')) {
      const presets = [
        { name: 'Trust Apex Administrator', key: 'TRUST_APEX_ADMIN', desc: 'Full administrative oversight across Trust and all Temples' },
        { name: 'Temple Executive Officer', key: 'TEMPLE_EXECUTIVE_OFFICER', desc: 'Operational leadership for temple facilities, sevas, and bookings' },
        { name: 'Sanctum & Priest Superintendent', key: 'PRIEST_SUPERINTENDENT', desc: 'Agama ritual scheduling and priest roster assignments' },
        { name: 'Devotee Seva Booking Desk', key: 'BOOKING_DESK_OPERATOR', desc: 'Counter bookings, Gotra registries, and thermal receipts' },
        { name: 'Sacred Treasury & Finance Officer', key: 'FINANCE_TREASURY_OFFICER', desc: 'Hundi counting, payment records, and ledger management' },
        { name: 'Statutory Trust Auditor (Read-Only)', key: 'STATUTORY_AUDITOR', desc: 'Audit inspection of finance, bookings, and security logs' }
      ];

      const inserted = await Promise.all(
        presets.map(async (p) => {
          const roleId = `role_${p.key.toLowerCase()}_${Date.now().toString(36)}`;
          const [created] = await db.insert(roles).values({
            id: roleId,
            trustId: ctx.trustId,
            scopeType: 'TRUST',
            scopeId: ctx.trustId,
            name: p.name,
            roleKey: p.key,
            description: p.desc,
            status: 'ACTIVE',
            createdBy: ctx.userId
          }).returning();
          return created;
        })
      );
      return this.listRoles(ctx, scopeType, scopeId);
    }

    const results = await Promise.all(
      roleList.map(async (r) => {
        // Fetch permissions for role
        const perms = await db.query.rolePermissions.findMany({
          where: eq(rolePermissions.roleId, r.id)
        });

        // Count active user assignments
        const userCountRes = await db
          .select({ count: sql<number>`count(*)` })
          .from(roleAssignments)
          .where(and(eq(roleAssignments.roleId, r.id), eq(roleAssignments.status, 'ACTIVE')));

        return {
          id: r.id,
          trustId: r.trustId,
          scopeType: r.scopeType,
          scopeId: r.scopeId,
          name: r.name,
          roleKey: r.roleKey,
          description: r.description || '',
          version: r.version,
          isInheritable: r.isInheritable,
          status: r.status,
          permissionCount: perms.length,
          permissions: perms,
          assignedUsersCount: Number(userCountRes[0]?.count || 0),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      })
    );

    return results;
  }

  /**
   * Create custom dynamic role with granular permissions
   */
  async createRole(ctx: RequestContext, input: CreateRoleInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const roleKey = input.roleKey.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const scopeId = input.scopeId || ctx.trustId;
    const scopeType = input.scopeType || 'TRUST';

    const existing = await db.query.roles.findFirst({
      where: and(
        eq(roles.trustId, ctx.trustId),
        eq(roles.scopeId, scopeId),
        eq(roles.roleKey, roleKey)
      )
    });

    if (existing) {
      throw new Error(`A role with key '${roleKey}' already exists in this scope.`);
    }

    const roleId = `role_${roleKey.toLowerCase()}_${Date.now().toString(36)}`;
    const [createdRole] = await db.insert(roles).values({
      id: roleId,
      trustId: ctx.trustId,
      scopeType,
      scopeId,
      name: input.name.trim(),
      roleKey,
      description: input.description || null,
      isInheritable: input.isInheritable !== undefined ? input.isInheritable : true,
      status: 'ACTIVE',
      createdBy: ctx.userId
    }).returning();

    // Bind Permissions
    if (input.permissions && input.permissions.length > 0) {
      await Promise.all(
        input.permissions.map(async (p) => {
          await db.insert(rolePermissions).values({
            id: `rp_${roleId}_${p.permissionId}`,
            roleId,
            permissionId: p.permissionId,
            effect: p.effect || 'ALLOW',
            scopeMode: p.scopeMode || (scopeType === 'TRUST' ? 'ALL_DESCENDANTS' : 'EXACT'),
            scopeSelectorJson: p.scopeSelectorJson || null
          });
        })
      );
    } else if (input.permissionIds && input.permissionIds.length > 0) {
      await Promise.all(
        input.permissionIds.map(async (permId) => {
          await db.insert(rolePermissions).values({
            id: `rp_${roleId}_${permId}`,
            roleId,
            permissionId: permId,
            effect: 'ALLOW',
            scopeMode: scopeType === 'TRUST' ? 'ALL_DESCENDANTS' : 'EXACT'
          });
        })
      );
    }

    await this.bumpPolicyVersion(ctx, `Created role ${input.name} (${roleKey})`);

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'ROLE_CREATED',
      targetType: 'role',
      targetId: roleId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        roleKey,
        name: input.name,
        scopeType
      }
    });

    return createdRole;
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(ctx: RequestContext, input: AssignRoleInput) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    const scopeId = input.scopeId || ctx.trustId;
    const assignmentId = `ra_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const [assignment] = await db.insert(roleAssignments).values({
      id: assignmentId,
      trustId: ctx.trustId,
      roleId: input.roleId,
      userId: input.userId,
      scopeId,
      assignmentSource: input.assignmentSource || 'DIRECT',
      validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      status: 'ACTIVE',
      assignedBy: ctx.userId
    }).returning();

    await this.bumpPolicyVersion(ctx, `Assigned role ${input.roleId} to user ${input.userId}`);

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'ROLE_ASSIGNED',
      targetType: 'role_assignment',
      targetId: assignmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: {
        roleId: input.roleId,
        userId: input.userId,
        scopeId
      }
    });

    return assignment;
  }

  /**
   * List all role assignments
   */
  async listRoleAssignments(ctx: RequestContext, filter?: { userId?: string; scopeId?: string }) {
    const conditions = [eq(roleAssignments.trustId, ctx.trustId)];
    if (filter?.userId) conditions.push(eq(roleAssignments.userId, filter.userId));
    if (filter?.scopeId) conditions.push(eq(roleAssignments.scopeId, filter.scopeId));

    const list = await db.query.roleAssignments.findMany({
      where: and(...conditions),
      orderBy: (roleAssignments, { desc }) => [desc(roleAssignments.createdAt)]
    });

    const results = await Promise.all(
      list.map(async (ra) => {
        const user = await db.query.users.findFirst({ where: eq(users.id, ra.userId) });
        const role = await db.query.roles.findFirst({ where: eq(roles.id, ra.roleId) });

        return {
          id: ra.id,
          trustId: ra.trustId,
          roleId: ra.roleId,
          roleName: role?.name || 'Custom Role',
          roleKey: role?.roleKey || '',
          userId: ra.userId,
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || '',
          scopeId: ra.scopeId,
          assignmentSource: ra.assignmentSource,
          validFrom: ra.validFrom,
          validUntil: ra.validUntil,
          status: ra.status,
          createdAt: ra.createdAt
        };
      })
    );

    return results;
  }

  /**
   * Revoke role assignment
   */
  async revokeRoleAssignment(ctx: RequestContext, assignmentId: string) {
    await authorization.require({
      subjectId: ctx.userId,
      trustId: ctx.trustId,
      scopeId: ctx.trustId,
      action: 'trust.governance.manage',
      resourceType: 'trust',
      resourceId: ctx.trustId
    });

    await db.update(roleAssignments)
      .set({ status: 'REVOKED', updatedAt: new Date() })
      .where(and(eq(roleAssignments.id, assignmentId), eq(roleAssignments.trustId, ctx.trustId)));

    await this.bumpPolicyVersion(ctx, `Revoked role assignment ${assignmentId}`);

    await db.insert(auditEvents).values({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trustId: ctx.trustId,
      actorUserId: ctx.userId,
      eventType: 'ROLE_REVOKED',
      targetType: 'role_assignment',
      targetId: assignmentId,
      action: 'trust.governance.manage',
      decision: 'MUTATE',
      requestId: ctx.requestId,
      payloadJson: { assignmentId }
    });

    return { assignmentId, status: 'REVOKED' };
  }

  /**
   * List Permission Definitions Registry
   */
  async listPermissionRegistry(ctx: RequestContext) {
    const list = await db.query.permissionDefinitions.findMany({
      orderBy: (permissionDefinitions, { asc }) => [asc(permissionDefinitions.enforcementKey)]
    });

    if (list.length === 0) {
      // Seed default standard permission capabilities
      const standardPerms = [
        { key: 'temple.dashboard.view', namespace: 'temple', resource: 'dashboard', action: 'view', desc: 'View temple operational KPIs and overview' },
        { key: 'temple.info.manage', namespace: 'temple', resource: 'info', action: 'manage', desc: 'Update temple contact, geolocation, and darshan timings' },
        { key: 'temple.seva.manage', namespace: 'temple', resource: 'seva', action: 'manage', desc: 'Create, modify, and price seva offerings' },
        { key: 'temple.seva.view', namespace: 'temple', resource: 'seva', action: 'view', desc: 'View seva catalog and capacity' },
        { key: 'temple.booking.create', namespace: 'temple', resource: 'booking', action: 'create', desc: 'Register devotee seva bookings and issue receipts' },
        { key: 'temple.booking.view', namespace: 'temple', resource: 'booking', action: 'view', desc: 'View devotee reservation calendar and Gotra register' },
        { key: 'temple.finance.manage', namespace: 'temple', resource: 'finance', action: 'manage', desc: 'Record collections, void receipts, and manage accounts' },
        { key: 'temple.finance.view', namespace: 'temple', resource: 'finance', action: 'view', desc: 'View financial transaction ledger and receipts' },
        { key: 'temple.priest.manage', namespace: 'temple', resource: 'priest', action: 'manage', desc: 'Register priests, specializations, and duties' },
        { key: 'temple.roster.manage', namespace: 'temple', resource: 'roster', action: 'manage', desc: 'Assign priests to daily seva duty shifts and manage leave' },
        { key: 'temple.logistics.manage', namespace: 'temple', resource: 'logistics', action: 'manage', desc: 'Dispatch remote holy prasadam and print postage labels' },
        { key: 'temple.audit.view', namespace: 'temple', resource: 'audit', action: 'view', desc: 'Audit immutable activity logs' },
        { key: 'trust.governance.manage', namespace: 'trust', resource: 'governance', action: 'manage', desc: 'Author dynamic roles, designations, and trust policies' },
        { key: 'trust.temple.create', namespace: 'trust', resource: 'temple', action: 'create', desc: 'Dynamically create new temples under the Trust umbrella' }
      ];

      const inserted = await Promise.all(
        standardPerms.map(async (sp) => {
          const id = `perm_${sp.key.replace(/\./g, '_')}`;
          const [res] = await db.insert(permissionDefinitions).values({
            id,
            namespace: sp.namespace,
            resourceType: sp.resource,
            action: sp.action,
            description: sp.desc,
            enforcementKey: sp.key,
            status: 'ACTIVE'
          }).returning();
          return res;
        })
      );
      return inserted;
    }

    return list;
  }
}

export const roleRepository = new RoleRepository();
