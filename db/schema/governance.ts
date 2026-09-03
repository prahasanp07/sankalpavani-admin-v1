import { pgTable, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { trusts, users, designations } from './core';

/**
 * Permission Definition - Granular system capability registered under a namespace.
 * Pattern: `namespace.resource.action` (e.g. `temple.seva.update`, `trust.temple.create`)
 */
export const permissionDefinitions = pgTable('permission_definition', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }), // Null for system defaults, non-null for tenant extensions
  namespace: text('namespace').notNull(), // 'trust' | 'temple' | 'policy' | 'report'
  resourceType: text('resource_type').notNull(),
  action: text('action').notNull(),
  description: text('description').notNull(),
  conditionSchemaJson: jsonb('condition_schema_json'),
  enforcementKey: text('enforcement_key').notNull(), // 'namespace.resourceType.action'
  status: text('status').default('ACTIVE').notNull(),
  version: integer('version').default(1).notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_perm_enforcement_key').on(table.trustId, table.enforcementKey),
  index('perm_namespace_idx').on(table.namespace),
]);

/**
 * Role - Dynamic collection of software permissions configured per Trust or Temple.
 */
export const roles = pgTable('role', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  scopeType: text('scope_type').notNull(), // 'TRUST' | 'TEMPLE'
  scopeId: text('scope_id').notNull(), // trust_id or temple_id
  name: text('name').notNull(),
  roleKey: text('role_key').notNull(),
  description: text('description'),
  version: integer('version').default(1).notNull(),
  isInheritable: boolean('is_inheritable').default(true).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('role_trust_scope_idx').on(table.trustId, table.scopeType, table.scopeId),
  uniqueIndex('unique_role_key_in_scope').on(table.trustId, table.scopeId, table.roleKey),
]);

/**
 * Role Permission Binding - Explicit permission grants/denies attached to a role.
 */
export const rolePermissions = pgTable('role_permission', {
  id: text('id').primaryKey(),
  roleId: text('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  permissionId: text('permission_id').references(() => permissionDefinitions.id, { onDelete: 'cascade' }).notNull(),
  effect: text('effect').default('ALLOW').notNull(), // 'ALLOW' | 'DENY'
  scopeMode: text('scope_mode').default('EXACT').notNull(), // 'EXACT' | 'TRUST_ONLY' | 'ALL_DESCENDANTS' | 'SELECTED_DESCENDANTS' | 'DIRECT_CHILDREN'
  scopeSelectorJson: jsonb('scope_selector_json'), // E.g. array of selected temple IDs
  conditionExpression: text('condition_expression'), // AST or validated expression
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('role_perm_role_idx').on(table.roleId),
  uniqueIndex('unique_role_permission').on(table.roleId, table.permissionId),
]);

/**
 * Role Inheritance - Composes parent roles into child roles (validated acyclic graph).
 */
export const roleInheritances = pgTable('role_inheritance', {
  id: text('id').primaryKey(),
  parentRoleId: text('parent_role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  childRoleId: text('child_role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  inheritanceMode: text('inheritance_mode').default('ALL').notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_role_inheritance').on(table.parentRoleId, table.childRoleId),
]);

/**
 * Role Assignment - Grants a role to a specific user or group within a scope.
 */
export const roleAssignments = pgTable('role_assignment', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  roleId: text('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  groupId: text('group_id'),
  scopeId: text('scope_id').notNull(), // Trust ID or Temple ID
  assignmentSource: text('assignment_source').default('DIRECT').notNull(), // 'DIRECT' | 'DESIGNATION_BINDING' | 'DELEGATION'
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  assignedBy: text('assigned_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('role_assign_user_trust_idx').on(table.trustId, table.userId, table.scopeId),
  index('role_assign_role_idx').on(table.roleId),
]);

/**
 * Designation Role Binding - Optional automatic binding between an office bearer designation and software roles.
 */
export const designationRoleBindings = pgTable('designation_role_binding', {
  id: text('id').primaryKey(),
  designationId: text('designation_id').references(() => designations.id, { onDelete: 'cascade' }).notNull(),
  roleId: text('role_id').references(() => roles.id, { onDelete: 'cascade' }).notNull(),
  scopeMode: text('scope_mode').default('EXACT').notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  autoAssign: boolean('auto_assign').default(true).notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  status: text('status').default('ACTIVE').notNull(),
}, (table) => [
  uniqueIndex('unique_designation_role_binding').on(table.designationId, table.roleId),
]);

/**
 * Delegation Grant - Temporary, audited delegation of authority to another user.
 */
export const delegationGrants = pgTable('delegation_grant', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  delegatorUserId: text('delegator_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  delegateeUserId: text('delegatee_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  scopeId: text('scope_id').notNull(),
  permissionFilterJson: jsonb('permission_filter_json'), // Specific permissions or wildcard subset
  resourceFilterJson: jsonb('resource_filter_json'),
  canRedelegate: boolean('can_redelegate').default(false).notNull(),
  approvalStatus: text('approval_status').default('APPROVED').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
}, (table) => [
  index('delegation_trust_delegator_idx').on(table.trustId, table.delegatorUserId),
  index('delegation_trust_delegatee_idx').on(table.trustId, table.delegateeUserId),
]);

/**
 * Policy Version - Monotonically increasing version tracker for cache invalidation.
 */
export const policyVersions = pgTable('policy_version', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  status: text('status').default('PUBLISHED').notNull(),
  publishedBy: text('published_by').references(() => users.id),
  publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  changeSummary: text('change_summary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_trust_policy_version').on(table.trustId, table.versionNumber),
]);
