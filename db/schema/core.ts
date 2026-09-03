import { pgTable, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Trust Table - The root business organization and tenant isolation boundary.
 */
export const trusts = pgTable('trust', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  legalName: text('legal_name').notNull(),
  registrationNumber: text('registration_number'),
  addressJson: jsonb('address_json'),
  contactJson: jsonb('contact_json'),
  logoAssetId: text('logo_asset_id'),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('trust_tenant_idx').on(table.tenantId),
  index('trust_status_idx').on(table.status),
]);

/**
 * Organization Node - Hierarchical tree for trusts and descendant departments/temples.
 */
export const organizationNodes = pgTable('organization_node', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  parentId: text('parent_id'),
  nodeType: text('node_type').notNull(), // 'ROOT' | 'TEMPLE' | 'DIVISION' | 'DEPARTMENT'
  name: text('name').notNull(),
  materializedPath: text('materialized_path').notNull(),
  hierarchyVersion: integer('hierarchy_version').default(1).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('org_node_trust_idx').on(table.trustId),
  index('org_node_parent_idx').on(table.parentId),
  index('org_node_path_idx').on(table.materializedPath),
]);

/**
 * Temple Table - Child operational organization under exactly one Trust.
 */
export const temples = pgTable('temple', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  organizationNodeId: text('organization_node_id').references(() => organizationNodes.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  addressJson: jsonb('address_json'),
  locationJson: jsonb('location_json'),
  contactJson: jsonb('contact_json'),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('temple_trust_idx').on(table.trustId),
  uniqueIndex('temple_trust_code_idx').on(table.trustId, table.code),
]);

/**
 * User Table - Global identity capable of holding memberships across multiple Trusts/Temples.
 */
export const users = pgTable('user', {
  id: text('id').primaryKey(),
  identityProviderId: text('identity_provider_id').unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  mobileNumber: text('mobile_number'),
  avatarUrl: text('avatar_url'),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'INVITED' | 'SUSPENDED'
  mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('user_email_idx').on(table.email),
  index('user_status_idx').on(table.status),
]);

/**
 * Trust Membership - Association between a global User and a specific Trust.
 */
export const trustMemberships = pgTable('trust_membership', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'REVOKED'
  membershipType: text('membership_type').default('STANDARD').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('trust_member_trust_user_idx').on(table.trustId, table.userId),
  uniqueIndex('unique_trust_user_membership').on(table.trustId, table.userId),
]);

/**
 * Temple Membership - Association between a User and a specific Temple under a Trust.
 */
export const templeMemberships = pgTable('temple_membership', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('temple_member_temple_user_idx').on(table.templeId, table.userId),
  uniqueIndex('unique_temple_user_membership').on(table.trustId, table.templeId, table.userId),
]);

/**
 * Designation - Organizational/legal/traditional title (e.g. Dharmadhikari, Pradhana Archaka, Treasurer).
 * Note: A designation is NOT a software permission role.
 */
export const designations = pgTable('designation', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  scopeType: text('scope_type').notNull(), // 'TRUST' | 'TEMPLE'
  scopeId: text('scope_id').notNull(), // trust_id or temple_id
  name: text('name').notNull(),
  description: text('description'),
  metadataJson: jsonb('metadata_json'),
  status: text('status').default('ACTIVE').notNull(),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('designation_trust_scope_idx').on(table.trustId, table.scopeType, table.scopeId),
]);

/**
 * Office Bearer - Time-bound legal or official appointment of a person to a designation.
 */
export const officeBearers = pgTable('office_bearer', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  scopeId: text('scope_id').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  designationId: text('designation_id').references(() => designations.id, { onDelete: 'cascade' }).notNull(),
  termStart: timestamp('term_start', { withTimezone: true }).notNull(),
  termEnd: timestamp('term_end', { withTimezone: true }),
  resolutionNo: text('resolution_no'),
  metadataJson: jsonb('metadata_json'),
  appointmentStatus: text('appointment_status').default('ACTIVE').notNull(), // 'ACTIVE' | 'EXPIRED' | 'RESIGNED' | 'REVOKED'
  appointedBy: text('appointed_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('office_bearer_trust_user_idx').on(table.trustId, table.userId),
  index('office_bearer_scope_idx').on(table.trustId, table.scopeId),
]);

/**
 * Committee - Standing or Ad-hoc governance committees (Jeernodharana, Festival, Finance, Advisory, etc.)
 */
export const committees = pgTable('committee', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  scopeType: text('scope_type').notNull(), // 'TRUST' | 'TEMPLE'
  scopeId: text('scope_id').notNull(), // trustId or templeId
  parentId: text('parent_id'), // Self-reference for sub-committees / wings
  organizationNodeId: text('organization_node_id').references(() => organizationNodes.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').default('STANDING').notNull(), // 'STANDING' | 'AD_HOC' | 'ADVISORY' | 'RENOVATION' | 'FESTIVAL' | 'FINANCE' | 'LEGAL' | 'CUSTOM'
  mandate: text('mandate'),
  formationDate: timestamp('formation_date', { withTimezone: true }).defaultNow().notNull(),
  dissolutionDate: timestamp('dissolution_date', { withTimezone: true }),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED'
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('committee_trust_idx').on(table.trustId),
  index('committee_scope_idx').on(table.trustId, table.scopeType, table.scopeId),
  uniqueIndex('unique_committee_code_in_trust').on(table.trustId, table.code),
]);

/**
 * Committee Member - Appointment of a user/trustee to a committee with a specific role.
 */
export const committeeMembers = pgTable('committee_member', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  committeeId: text('committee_id').references(() => committees.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  designationId: text('designation_id').references(() => designations.id),
  committeeRole: text('committee_role').default('MEMBER').notNull(), // 'CHAIRMAN' | 'CONVENER' | 'SECRETARY' | 'TREASURER' | 'MEMBER' | 'TECHNICAL_EXPERT' | 'ADVISOR'
  termStart: timestamp('term_start', { withTimezone: true }).defaultNow().notNull(),
  termEnd: timestamp('term_end', { withTimezone: true }),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'EXPIRED' | 'RELIEVED'
  appointedBy: text('appointed_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('comm_member_committee_idx').on(table.committeeId),
  index('comm_member_user_idx').on(table.userId),
  uniqueIndex('unique_user_in_committee').on(table.committeeId, table.userId),
]);

/**
 * Reporting Relationship - Dual hierarchy graph structure (Primary supervisor + Secondary Matrix supervisors).
 */
export const reportingRelationships = pgTable('reporting_relationship', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  scopeId: text('scope_id').notNull(), // trustId or templeId
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  primarySupervisorUserId: text('primary_supervisor_user_id').references(() => users.id),
  secondarySupervisorUserIds: jsonb('secondary_supervisor_user_ids').$type<string[]>().default([]).notNull(),
  department: text('department').default('Admin').notNull(), // 'Spiritual' | 'Admin' | 'Operations' | 'Finance' | custom
  subDepartment: text('sub_department'),
  cadreRank: text('cadre_rank').default('Staff').notNull(),
  status: text('status').default('Active').notNull(), // 'Active' | 'On Leave' | 'Duty-Assign'
  responsibilities: text('responsibilities'),
  location: text('location'),
  joinedYear: text('joined_year'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('reporting_user_idx').on(table.userId),
  index('reporting_primary_idx').on(table.primarySupervisorUserId),
  uniqueIndex('unique_user_reporting_scope').on(table.trustId, table.scopeId, table.userId),
]);

/**
 * Departments Table - Dynamic user-generated departments per Trust / Temple.
 */
export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code'),
  color: text('color').default('#ff7700'),
  description: text('description'),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('dept_trust_idx').on(table.trustId),
  index('dept_temple_idx').on(table.templeId),
]);

/**
 * Custom Roles Table - Dynamic designations and granular permissions per Trust / Temple.
 */
export const customRoles = pgTable('custom_roles', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }),
  roleName: text('role_name').notNull(),
  permissionsJsonb: jsonb('permissions_jsonb').$type<string[]>().default([]).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('custom_role_trust_idx').on(table.trustId),
  index('custom_role_temple_idx').on(table.templeId),
]);

