import { pgTable, text, timestamp, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { trusts, temples, users } from './core';

/**
 * Audit Event - Immutable log of sensitive operations and security decisions.
 */
export const auditEvents = pgTable('audit_event', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'set null' }),
  actorUserId: text('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(), // E.g. 'ROLE_ASSIGNED', 'BOOKING_CREATED', 'PAYMENT_APPROVED'
  targetType: text('target_type').notNull(), // E.g. 'role_assignment', 'booking', 'seva'
  targetId: text('target_id').notNull(),
  action: text('action').notNull(),
  decision: text('decision').notNull(), // 'ALLOW' | 'DENY' | 'MUTATE'
  policyVersion: integer('policy_version'),
  requestId: text('request_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  payloadJson: jsonb('payload_json'), // Sanitized payload (no passwords/tokens)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_trust_event_idx').on(table.trustId, table.eventType, table.createdAt),
  index('audit_actor_idx').on(table.trustId, table.actorUserId),
  index('audit_target_idx').on(table.trustId, table.targetType, table.targetId),
]);

/**
 * Outbox Event - Transactional outbox pattern for asynchronous processing and domain events.
 */
export const outboxEvents = pgTable('outbox_event', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(), // E.g. 'NOTIFICATION_REQUESTED', 'SHIPMENT_QUEUED'
  aggregateType: text('aggregate_type').notNull(),
  aggregateId: text('aggregate_id').notNull(),
  payloadJson: jsonb('payload_json').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  attemptCount: integer('attempt_count').default(0).notNull(),
  lastError: text('last_error'),
}, (table) => [
  index('outbox_unprocessed_idx').on(table.processedAt, table.attemptCount),
  index('outbox_trust_idx').on(table.trustId, table.eventType),
]);
