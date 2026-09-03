import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { trusts, temples, users, designations } from './core';

/**
 * Temple Settings - Configurable profile and contact data.
 */
export const templeSettings = pgTable('temple_settings', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  tagline: text('tagline'),
  description: text('description'),
  hotline: text('hotline'),
  officialEmail: text('official_email'),
  websiteUrl: text('website_url'),
  mapsUrl: text('maps_url'),
  primaryPhotoIndex: integer('primary_photo_index').default(0).notNull(),
  photos: jsonb('photos').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_temple_settings').on(table.templeId),
]);

/**
 * Temple Schedule - Darshan timings across Normal, Weekend, Seasonal, and Festivals.
 */
export const templeSchedules = pgTable('temple_schedule', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  scheduleType: text('schedule_type').notNull(), // 'NORMAL' | 'WEEKEND' | 'SEASONAL' | 'FESTIVAL'
  title: text('title').notNull(),
  morningDarshan: text('morning_darshan').notNull(),
  eveningDarshan: text('evening_darshan').notNull(),
  specialNotes: text('special_notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('temple_sched_idx').on(table.templeId, table.scheduleType),
]);

/**
 * Temple Facilities - Guest amenities & facilities (choultry, dining hall, rooms).
 */
export const templeFacilities = pgTable('temple_facility', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  facilityKey: text('facility_key').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name').default('Building').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isDraft: boolean('is_draft').default(false).notNull(),
  capacity: integer('capacity'),
  metadataJson: jsonb('metadata_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_temple_facility_key').on(table.templeId, table.facilityKey),
]);

/**
 * Person Profile - Human demographics & personal details.
 */
export const personProfiles = pgTable('person_profile', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  gotra: text('gotra'),
  nakshatra: text('nakshatra'),
  vedaShakha: text('veda_shakha'),
  phone: text('phone'),
  emergencyPhone: text('emergency_phone'),
  addressJson: jsonb('address_json'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('person_trust_user_idx').on(table.trustId, table.userId),
]);

/**
 * Priest Profile - Dedicated attributes for Acharyas & Archakas.
 */
export const priestProfiles = pgTable('priest_profile', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  personProfileId: text('person_profile_id').references(() => personProfiles.id, { onDelete: 'cascade' }).notNull(),
  systemCode: text('system_code').notNull(), // E.g. 'ARCH-001'
  tradition: text('tradition').default('Smartha / Vaidika').notNull(),
  specialization: text('specialization').notNull(), // E.g. 'Kalyanotsavam & Mahanyasa Rudrabhishekam'
  experienceYears: integer('experience_years').default(0).notNull(),
  qualification: text('qualification'),
  dutyStatus: text('duty_status').default('Active').notNull(), // 'Active' | 'On Leave' | 'Retired'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('unique_priest_system_code').on(table.trustId, table.systemCode),
]);

/**
 * Temple Staff Assignment - Associates a person/priest with an operational temple and designation.
 */
export const templeStaffAssignments = pgTable('temple_staff_assignment', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  personProfileId: text('person_profile_id').references(() => personProfiles.id, { onDelete: 'cascade' }).notNull(),
  designationId: text('designation_id').references(() => designations.id),
  department: text('department').notNull(), // 'Spiritual' | 'Admin' | 'Operations' | 'Finance'
  cadreRank: text('cadre_rank').default('Staff').notNull(),
  status: text('status').default('Active').notNull(),
  validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('staff_assign_temple_idx').on(table.templeId, table.status),
]);

/**
 * Seva - Catalog of poojas and ritual offerings.
 */
export const sevas = pgTable('seva', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'Daily' | 'Weekly' | 'Monthly' | 'Special'
  description: text('description').notNull(),
  instructions: text('instructions'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  includedPersons: integer('included_persons').default(1).notNull(),
  extraPersonPrice: numeric('extra_person_price', { precision: 10, scale: 2 }).default('0').notNull(),
  maxCapacityPerSlot: integer('max_capacity_per_slot').default(50).notNull(),
  durationMinutes: integer('duration_minutes').default(60).notNull(),
  reportingTime: text('reporting_time').notNull(), // E.g. '06:30 AM'
  timingsDisplay: text('timings_display').notNull(), // E.g. '07:00 AM - 08:30 AM'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('seva_temple_category_idx').on(table.templeId, table.category, table.isActive),
  uniqueIndex('unique_seva_code_per_temple').on(table.templeId, table.code),
]);

/**
 * Booking - Devotee seva booking record.
 */
export const bookings = pgTable('booking', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  sevaId: text('seva_id').references(() => sevas.id).notNull(),
  bookingDate: timestamp('booking_date', { withTimezone: true }).notNull(),
  slotTime: text('slot_time').notNull(),
  primaryDevoteeName: text('primary_devotee_name').notNull(),
  primaryPhone: text('primary_phone').notNull(),
  primaryEmail: text('primary_email'),
  gotra: text('gotra').notNull(),
  nakshatra: text('nakshatra').notNull(),
  totalPersons: integer('total_persons').default(1).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  bookingStatus: text('booking_status').default('Confirmed').notNull(), // 'Confirmed' | 'Completed' | 'Cancelled'
  paymentStatus: text('payment_status').default('Pending').notNull(), // 'Paid' | 'Pending' | 'Refunded'
  paymentMethod: text('payment_method').default('UPI / Online').notNull(),
  isHomeDelivery: boolean('is_home_delivery').default(false).notNull(),
  deliveryAddressJson: jsonb('delivery_address_json'),
  notes: text('notes'),
  bookedByUserId: text('booked_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('booking_temple_date_idx').on(table.templeId, table.bookingDate),
  index('booking_phone_idx').on(table.primaryPhone),
]);

/**
 * Booking Pilgrim - Individual family members included in a booking.
 */
export const bookingPilgrims = pgTable('booking_pilgrim', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  gotra: text('gotra'),
  nakshatra: text('nakshatra'),
  relationship: text('relationship'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('pilgrim_booking_idx').on(table.bookingId),
]);

/**
 * Receipt - Authoritative, unique thermal and printable receipt slip record.
 */
export const receipts = pgTable('receipt', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  bookingId: text('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  receiptNumber: text('receipt_number').notNull(), // E.g. 'RCP-2026-08892'
  verificationHash: text('verification_hash').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow().notNull(),
  issuedByUserId: text('issued_by_user_id').references(() => users.id),
}, (table) => [
  uniqueIndex('unique_receipt_number_per_temple').on(table.templeId, table.receiptNumber),
  index('receipt_booking_idx').on(table.bookingId),
]);

/**
 * Prasadam Shipment - Remote delivery logistics and postal pipeline.
 */
export const shipments = pgTable('shipment', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  bookingId: text('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  contents: text('contents').notNull(), // E.g. 'Kumkum, Sacred Akshata, Vibhuti & Laddu Prasadam'
  courierProvider: text('courier_provider').default('India Post Speed Post').notNull(),
  trackingNumber: text('tracking_number'),
  status: text('status').default('Pending').notNull(), // 'Pending' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled'
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('shipment_temple_status_idx').on(table.templeId, table.status),
  uniqueIndex('unique_shipment_booking').on(table.bookingId),
]);

/**
 * Priest Shift & Scheduling - 4-day duty roster and shift allocations.
 */
export const shifts = pgTable('shift', {
  id: text('id').primaryKey(),
  trustId: text('trust_id').references(() => trusts.id, { onDelete: 'cascade' }).notNull(),
  templeId: text('temple_id').references(() => temples.id, { onDelete: 'cascade' }).notNull(),
  priestProfileId: text('priest_profile_id').references(() => priestProfiles.id, { onDelete: 'cascade' }).notNull(),
  shiftDate: timestamp('shift_date', { withTimezone: true }).notNull(),
  startTime: text('start_time').notNull(), // E.g. '05:30 AM'
  endTime: text('end_time').notNull(), // E.g. '12:30 PM'
  dutyRole: text('duty_role').notNull(), // E.g. 'Pradhana Archaka' | 'Sanctum Alankara'
  assignedSanctum: text('assigned_sanctum').notNull(), // E.g. 'Moola Virat Garbhagriha'
  status: text('status').default('Confirmed').notNull(), // 'Confirmed' | 'Pending' | 'Completed' | 'Leave'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('shift_temple_date_idx').on(table.templeId, table.shiftDate),
]);

