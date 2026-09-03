import { 
  AuthorizationRequest, 
  AuthorizationDecision, 
  AuthorizationProvider, 
  MatchedGrant,
  AuthorizationError
} from './types';
import { db } from '../db/client';
import { 
  roleAssignments, 
  roles, 
  rolePermissions, 
  permissionDefinitions,
  roleInheritances,
  designationRoleBindings,
  officeBearers,
  delegationGrants,
  policyVersions,
  trustMemberships,
  templeMemberships,
  temples
} from '../../db/schema';
import { eq, and, or, isNull, gte, lte } from 'drizzle-orm';

/**
 * SQL-Backed Authoritative Authorization Service
 * Implements granular, tenant-scoped dynamic authorization.
 */
export class DynamicAuthorizationService implements AuthorizationProvider {
  /**
   * Main Policy Decision Point (PDP)
   */
  async check(input: AuthorizationRequest): Promise<AuthorizationDecision> {
    const { subjectId, trustId, action, scopeId } = input;
    const now = new Date();

    // 1. Verify Active Trust Membership
    const trustMembership = await db.query.trustMemberships.findFirst({
      where: and(
        eq(trustMemberships.trustId, trustId),
        eq(trustMemberships.userId, subjectId),
        eq(trustMemberships.status, 'ACTIVE'),
        lte(trustMemberships.validFrom, now),
        or(isNull(trustMemberships.validUntil), gte(trustMemberships.validUntil, now))
      )
    });

    if (!trustMembership) {
      return {
        decision: 'DENY',
        reasonCode: 'NO_ACTIVE_TRUST_MEMBERSHIP',
        policyVersion: 1,
        matchedGrants: []
      };
    }

    // 2. Fetch Latest Policy Version for Trust
    const latestPolicy = await db.query.policyVersions.findFirst({
      where: eq(policyVersions.trustId, trustId),
      orderBy: (pv, { desc }) => [desc(pv.versionNumber)]
    });
    const currentPolicyVersion = latestPolicy?.versionNumber || 1;

    // 3. Find Matching Permission Definition(s)
    const permission = await db.query.permissionDefinitions.findFirst({
      where: and(
        or(isNull(permissionDefinitions.trustId), eq(permissionDefinitions.trustId, trustId)),
        eq(permissionDefinitions.enforcementKey, action),
        eq(permissionDefinitions.status, 'ACTIVE')
      )
    });

    if (!permission) {
      return {
        decision: 'DENY',
        reasonCode: 'PERMISSION_NOT_DEFINED',
        policyVersion: currentPolicyVersion,
        matchedGrants: []
      };
    }

    const matchedGrants: MatchedGrant[] = [];

    // 4. Resolve Direct Role Assignments
    const directAssignments = await db.query.roleAssignments.findMany({
      where: and(
        eq(roleAssignments.trustId, trustId),
        eq(roleAssignments.userId, subjectId),
        eq(roleAssignments.status, 'ACTIVE'),
        lte(roleAssignments.validFrom, now),
        or(isNull(roleAssignments.validUntil), gte(roleAssignments.validUntil, now))
      ),
      with: {
        // Will evaluate role permissions below
      }
    });

    // 5. Resolve Office Bearer -> Designation -> Role Bindings
    const userOfficeBearerTerms = await db.query.officeBearers.findMany({
      where: and(
        eq(officeBearers.trustId, trustId),
        eq(officeBearers.userId, subjectId),
        eq(officeBearers.appointmentStatus, 'ACTIVE'),
        lte(officeBearers.termStart, now),
        or(isNull(officeBearers.termEnd), gte(officeBearers.termEnd, now))
      )
    });

    const designationIds = userOfficeBearerTerms.map(ob => ob.designationId);
    let designationBindings: any[] = [];
    if (designationIds.length > 0) {
      designationBindings = await db.query.designationRoleBindings.findMany({
        where: and(
          eq(designationRoleBindings.status, 'ACTIVE'),
          lte(designationRoleBindings.validFrom, now),
          or(isNull(designationRoleBindings.validUntil), gte(designationRoleBindings.validUntil, now))
        )
      });
      designationBindings = designationBindings.filter(b => designationIds.includes(b.designationId));
    }

    // 6. Resolve Active Delegations
    const activeDelegations = await db.query.delegationGrants.findMany({
      where: and(
        eq(delegationGrants.trustId, trustId),
        eq(delegationGrants.delegateeUserId, subjectId),
        eq(delegationGrants.approvalStatus, 'APPROVED'),
        lte(delegationGrants.validFrom, now),
        gte(delegationGrants.validUntil, now),
        isNull(delegationGrants.revokedAt)
      )
    });

    // Collect all candidate role IDs to inspect
    const directRoleIds = directAssignments.map(a => a.roleId);
    const boundRoleIds = designationBindings.map(b => b.roleId);
    const allAssignedRoleIds = Array.from(new Set([...directRoleIds, ...boundRoleIds]));

    if (allAssignedRoleIds.length === 0 && activeDelegations.length === 0) {
      return {
        decision: 'DENY',
        reasonCode: 'NO_ROLES_ASSIGNED',
        policyVersion: currentPolicyVersion,
        matchedGrants: []
      };
    }

    // 7. Resolve Role Inheritances (Acyclic BFS)
    const effectiveRoleIds = new Set<string>(allAssignedRoleIds);
    let queue = [...allAssignedRoleIds];
    const visited = new Set<string>(allAssignedRoleIds);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const parentLinks = await db.query.roleInheritances.findMany({
        where: and(
          eq(roleInheritances.childRoleId, currentId),
          eq(roleInheritances.status, 'ACTIVE')
        )
      });

      for (const link of parentLinks) {
        if (!visited.has(link.parentRoleId)) {
          visited.add(link.parentRoleId);
          effectiveRoleIds.add(link.parentRoleId);
          queue.push(link.parentRoleId);
        }
      }
    }

    // 8. Inspect Permissions for all Effective Roles
    for (const roleId of effectiveRoleIds) {
      const role = await db.query.roles.findFirst({
        where: and(
          eq(roles.id, roleId),
          eq(roles.trustId, trustId),
          eq(roles.status, 'ACTIVE')
        )
      });

      if (!role) continue;

      const rPerms = await db.query.rolePermissions.findMany({
        where: and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permission.id),
          lte(rolePermissions.validFrom, now),
          or(isNull(rolePermissions.validUntil), gte(rolePermissions.validUntil, now))
        )
      });

      for (const rp of rPerms) {
        // Scope Validation:
        // If target scopeId is provided (e.g. specific Temple A)
        const isScopeValid = this.evaluateScopeMatch(role.scopeType, role.scopeId, rp.scopeMode, rp.scopeSelectorJson, scopeId, trustId);

        if (isScopeValid) {
          const isDirect = directRoleIds.includes(roleId);
          const isBound = boundRoleIds.includes(roleId);
          matchedGrants.push({
            roleId: role.id,
            roleName: role.name,
            permissionId: permission.id,
            source: isDirect ? 'DIRECT' : isBound ? 'DESIGNATION_BINDING' : 'INHERITED',
            scopeMode: rp.scopeMode,
            effect: rp.effect as 'ALLOW' | 'DENY'
          });
        }
      }
    }

    // 9. Evaluation Decision Matrix
    // Rule: Explicit DENY overrides any ALLOW
    const explicitDeny = matchedGrants.find(g => g.effect === 'DENY');
    if (explicitDeny) {
      return {
        decision: 'DENY',
        reasonCode: `EXPLICIT_DENY_FROM_${explicitDeny.roleName.toUpperCase().replace(/\s+/g, '_')}`,
        policyVersion: currentPolicyVersion,
        matchedGrants
      };
    }

    const allowGrant = matchedGrants.find(g => g.effect === 'ALLOW');
    if (allowGrant) {
      return {
        decision: 'ALLOW',
        reasonCode: `GRANTED_BY_${allowGrant.roleName.toUpperCase().replace(/\s+/g, '_')}`,
        policyVersion: currentPolicyVersion,
        matchedGrants
      };
    }

    return {
      decision: 'DENY',
      reasonCode: 'PERMISSION_NOT_GRANTED_IN_SCOPE',
      policyVersion: currentPolicyVersion,
      matchedGrants: []
    };
  }

  /**
   * Helper: Match scope hierarchy (Trust -> Temple cascade)
   */
  private evaluateScopeMatch(
    roleScopeType: string,
    roleScopeId: string,
    scopeMode: string,
    scopeSelectorJson: any,
    targetScopeId?: string,
    trustId?: string
  ): boolean {
    if (!targetScopeId) return true; // Target is global or unspecified

    // If role is defined at the exact same scope
    if (roleScopeId === targetScopeId) return true;

    // If role is Trust-level and target is Temple-level:
    if (roleScopeType === 'TRUST' || roleScopeId === trustId) {
      if (scopeMode === 'ALL_DESCENDANTS' || scopeMode === 'DIRECT_CHILDREN') {
        return true;
      }
      if (scopeMode === 'SELECTED_DESCENDANTS' && Array.isArray(scopeSelectorJson)) {
        return scopeSelectorJson.includes(targetScopeId);
      }
      if (scopeMode === 'TRUST_ONLY' && targetScopeId !== trustId) {
        return false;
      }
    }

    // Temple roles never inherit upward to Trust or across sibling Temples
    return false;
  }

  /**
   * Enforce permission or throw 403 AuthorizationError
   */
  async require(input: AuthorizationRequest): Promise<void> {
    const decision = await this.check(input);
    if (decision.decision !== 'ALLOW') {
      throw new AuthorizationError(
        `Access denied for action '${input.action}' on ${input.resourceType}${input.scopeId ? ` in scope ${input.scopeId}` : ''}. Reason: ${decision.reasonCode}`,
        decision
      );
    }
  }

  async batchCheck(inputs: AuthorizationRequest[]): Promise<AuthorizationDecision[]> {
    return Promise.all(inputs.map(input => this.check(input)));
  }

  async explain(input: AuthorizationRequest): Promise<AuthorizationDecision> {
    return this.check(input);
  }

  async listAuthorizedScopes(input: { subjectId: string; trustId: string; action: string }): Promise<string[]> {
    const templesList = await db.query.temples.findMany({
      where: eq(temples.trustId, input.trustId)
    });

    const authorizedScopes: string[] = [];

    // Check Trust-level
    const trustDecision = await this.check({
      subjectId: input.subjectId,
      trustId: input.trustId,
      action: input.action,
      resourceType: 'trust',
      scopeId: input.trustId
    });
    if (trustDecision.decision === 'ALLOW') {
      authorizedScopes.push(input.trustId);
    }

    // Check each Temple
    for (const temple of templesList) {
      const templeDecision = await this.check({
        subjectId: input.subjectId,
        trustId: input.trustId,
        action: input.action,
        resourceType: 'temple',
        scopeId: temple.id
      });
      if (templeDecision.decision === 'ALLOW') {
        authorizedScopes.push(temple.id);
      }
    }

    return authorizedScopes;
  }
}

export const authorization = new DynamicAuthorizationService();
