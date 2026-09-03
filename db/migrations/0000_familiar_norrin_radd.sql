CREATE TABLE "designation" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"scope_type" text NOT NULL,
	"scope_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"metadata_json" jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "office_bearer" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"scope_id" text NOT NULL,
	"user_id" text NOT NULL,
	"designation_id" text NOT NULL,
	"term_start" timestamp with time zone NOT NULL,
	"term_end" timestamp with time zone,
	"appointment_status" text DEFAULT 'ACTIVE' NOT NULL,
	"appointed_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_node" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"parent_id" text,
	"node_type" text NOT NULL,
	"name" text NOT NULL,
	"materialized_path" text NOT NULL,
	"hierarchy_version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"organization_node_id" text,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address_json" jsonb,
	"location_json" jsonb,
	"contact_json" jsonb,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"membership_type" text DEFAULT 'STANDARD' NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trust" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"legal_name" text NOT NULL,
	"registration_number" text,
	"address_json" jsonb,
	"contact_json" jsonb,
	"logo_asset_id" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"identity_provider_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"mobile_number" text,
	"avatar_url" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_identity_provider_id_unique" UNIQUE("identity_provider_id")
);
--> statement-breakpoint
CREATE TABLE "delegation_grant" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"delegator_user_id" text NOT NULL,
	"delegatee_user_id" text NOT NULL,
	"scope_id" text NOT NULL,
	"permission_filter_json" jsonb,
	"resource_filter_json" jsonb,
	"can_redelegate" boolean DEFAULT false NOT NULL,
	"approval_status" text DEFAULT 'APPROVED' NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "designation_role_binding" (
	"id" text PRIMARY KEY NOT NULL,
	"designation_id" text NOT NULL,
	"role_id" text NOT NULL,
	"scope_mode" text DEFAULT 'EXACT' NOT NULL,
	"requires_approval" boolean DEFAULT false NOT NULL,
	"auto_assign" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"status" text DEFAULT 'ACTIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_definition" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text,
	"namespace" text NOT NULL,
	"resource_type" text NOT NULL,
	"action" text NOT NULL,
	"description" text NOT NULL,
	"condition_schema_json" jsonb,
	"enforcement_key" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_version" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"published_by" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"change_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"role_id" text NOT NULL,
	"user_id" text NOT NULL,
	"group_id" text,
	"scope_id" text NOT NULL,
	"assignment_source" text DEFAULT 'DIRECT' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"assigned_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_inheritance" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_role_id" text NOT NULL,
	"child_role_id" text NOT NULL,
	"inheritance_mode" text DEFAULT 'ALL' NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"effect" text DEFAULT 'ALLOW' NOT NULL,
	"scope_mode" text DEFAULT 'EXACT' NOT NULL,
	"scope_selector_json" jsonb,
	"condition_expression" text,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"scope_type" text NOT NULL,
	"scope_id" text NOT NULL,
	"name" text NOT NULL,
	"role_key" text NOT NULL,
	"description" text,
	"version" integer DEFAULT 1 NOT NULL,
	"is_inheritable" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text,
	"actor_user_id" text,
	"event_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"action" text NOT NULL,
	"decision" text NOT NULL,
	"policy_version" integer,
	"request_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"payload_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outbox_event" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"payload_json" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_error" text
);
--> statement-breakpoint
CREATE TABLE "booking_pilgrim" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"gender" text,
	"gotra" text,
	"nakshatra" text,
	"relationship" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"seva_id" text NOT NULL,
	"booking_date" timestamp with time zone NOT NULL,
	"slot_time" text NOT NULL,
	"primary_devotee_name" text NOT NULL,
	"primary_phone" text NOT NULL,
	"primary_email" text,
	"gotra" text NOT NULL,
	"nakshatra" text NOT NULL,
	"total_persons" integer DEFAULT 1 NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"booking_status" text DEFAULT 'Confirmed' NOT NULL,
	"payment_status" text DEFAULT 'Pending' NOT NULL,
	"payment_method" text DEFAULT 'UPI / Online' NOT NULL,
	"is_home_delivery" boolean DEFAULT false NOT NULL,
	"delivery_address_json" jsonb,
	"notes" text,
	"booked_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matrix_relationship" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text,
	"matrix_supervisor_assignment_id" text NOT NULL,
	"staff_assignment_id" text NOT NULL,
	"functional_area" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"user_id" text,
	"full_name" text NOT NULL,
	"gotra" text,
	"nakshatra" text,
	"veda_shakha" text,
	"phone" text,
	"emergency_phone" text,
	"address_json" jsonb,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "priest_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"person_profile_id" text NOT NULL,
	"system_code" text NOT NULL,
	"tradition" text DEFAULT 'Smartha / Vaidika' NOT NULL,
	"specialization" text NOT NULL,
	"experience_years" integer DEFAULT 0 NOT NULL,
	"qualification" text,
	"duty_status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipt" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"receipt_number" text NOT NULL,
	"verification_hash" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"issued_by_user_id" text
);
--> statement-breakpoint
CREATE TABLE "reporting_relationship" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text,
	"supervisor_assignment_id" text NOT NULL,
	"subordinate_assignment_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seva" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"instructions" text,
	"price" numeric(10, 2) NOT NULL,
	"included_persons" integer DEFAULT 1 NOT NULL,
	"extra_person_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"max_capacity_per_slot" integer DEFAULT 50 NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"reporting_time" text NOT NULL,
	"timings_display" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"priest_profile_id" text NOT NULL,
	"shift_date" timestamp with time zone NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"duty_role" text NOT NULL,
	"assigned_sanctum" text NOT NULL,
	"status" text DEFAULT 'Confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_phone" text NOT NULL,
	"shipping_address" text NOT NULL,
	"contents" text NOT NULL,
	"courier_provider" text DEFAULT 'India Post Speed Post' NOT NULL,
	"tracking_number" text,
	"status" text DEFAULT 'Pending' NOT NULL,
	"dispatched_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple_facility" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"facility_key" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon_name" text DEFAULT 'Building' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"capacity" integer,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"schedule_type" text NOT NULL,
	"title" text NOT NULL,
	"morning_darshan" text NOT NULL,
	"evening_darshan" text NOT NULL,
	"special_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"tagline" text,
	"description" text,
	"hotline" text,
	"official_email" text,
	"website_url" text,
	"maps_url" text,
	"primary_photo_index" integer DEFAULT 0 NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temple_staff_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"trust_id" text NOT NULL,
	"temple_id" text NOT NULL,
	"person_profile_id" text NOT NULL,
	"designation_id" text,
	"department" text NOT NULL,
	"cadre_rank" text DEFAULT 'Staff' NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "designation" ADD CONSTRAINT "designation_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designation" ADD CONSTRAINT "designation_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_bearer" ADD CONSTRAINT "office_bearer_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_bearer" ADD CONSTRAINT "office_bearer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_bearer" ADD CONSTRAINT "office_bearer_designation_id_designation_id_fk" FOREIGN KEY ("designation_id") REFERENCES "public"."designation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_bearer" ADD CONSTRAINT "office_bearer_appointed_by_user_id_fk" FOREIGN KEY ("appointed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_node" ADD CONSTRAINT "organization_node_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_membership" ADD CONSTRAINT "temple_membership_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_membership" ADD CONSTRAINT "temple_membership_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_membership" ADD CONSTRAINT "temple_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple" ADD CONSTRAINT "temple_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple" ADD CONSTRAINT "temple_organization_node_id_organization_node_id_fk" FOREIGN KEY ("organization_node_id") REFERENCES "public"."organization_node"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_membership" ADD CONSTRAINT "trust_membership_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trust_membership" ADD CONSTRAINT "trust_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegation_grant" ADD CONSTRAINT "delegation_grant_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegation_grant" ADD CONSTRAINT "delegation_grant_delegator_user_id_user_id_fk" FOREIGN KEY ("delegator_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegation_grant" ADD CONSTRAINT "delegation_grant_delegatee_user_id_user_id_fk" FOREIGN KEY ("delegatee_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designation_role_binding" ADD CONSTRAINT "designation_role_binding_designation_id_designation_id_fk" FOREIGN KEY ("designation_id") REFERENCES "public"."designation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "designation_role_binding" ADD CONSTRAINT "designation_role_binding_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_definition" ADD CONSTRAINT "permission_definition_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_definition" ADD CONSTRAINT "permission_definition_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_version" ADD CONSTRAINT "policy_version_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_version" ADD CONSTRAINT "policy_version_published_by_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_inheritance" ADD CONSTRAINT "role_inheritance_parent_role_id_role_id_fk" FOREIGN KEY ("parent_role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_inheritance" ADD CONSTRAINT "role_inheritance_child_role_id_role_id_fk" FOREIGN KEY ("child_role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_definition_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox_event" ADD CONSTRAINT "outbox_event_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outbox_event" ADD CONSTRAINT "outbox_event_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_pilgrim" ADD CONSTRAINT "booking_pilgrim_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_seva_id_seva_id_fk" FOREIGN KEY ("seva_id") REFERENCES "public"."seva"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_booked_by_user_id_user_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_relationship" ADD CONSTRAINT "matrix_relationship_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_relationship" ADD CONSTRAINT "matrix_relationship_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_relationship" ADD CONSTRAINT "matrix_relationship_matrix_supervisor_assignment_id_temple_staff_assignment_id_fk" FOREIGN KEY ("matrix_supervisor_assignment_id") REFERENCES "public"."temple_staff_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrix_relationship" ADD CONSTRAINT "matrix_relationship_staff_assignment_id_temple_staff_assignment_id_fk" FOREIGN KEY ("staff_assignment_id") REFERENCES "public"."temple_staff_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_profile" ADD CONSTRAINT "person_profile_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_profile" ADD CONSTRAINT "person_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "priest_profile" ADD CONSTRAINT "priest_profile_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "priest_profile" ADD CONSTRAINT "priest_profile_person_profile_id_person_profile_id_fk" FOREIGN KEY ("person_profile_id") REFERENCES "public"."person_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_issued_by_user_id_user_id_fk" FOREIGN KEY ("issued_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_relationship" ADD CONSTRAINT "reporting_relationship_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_relationship" ADD CONSTRAINT "reporting_relationship_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_relationship" ADD CONSTRAINT "reporting_relationship_supervisor_assignment_id_temple_staff_assignment_id_fk" FOREIGN KEY ("supervisor_assignment_id") REFERENCES "public"."temple_staff_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_relationship" ADD CONSTRAINT "reporting_relationship_subordinate_assignment_id_temple_staff_assignment_id_fk" FOREIGN KEY ("subordinate_assignment_id") REFERENCES "public"."temple_staff_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seva" ADD CONSTRAINT "seva_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seva" ADD CONSTRAINT "seva_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift" ADD CONSTRAINT "shift_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift" ADD CONSTRAINT "shift_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift" ADD CONSTRAINT "shift_priest_profile_id_priest_profile_id_fk" FOREIGN KEY ("priest_profile_id") REFERENCES "public"."priest_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_facility" ADD CONSTRAINT "temple_facility_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_facility" ADD CONSTRAINT "temple_facility_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_schedule" ADD CONSTRAINT "temple_schedule_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_schedule" ADD CONSTRAINT "temple_schedule_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_settings" ADD CONSTRAINT "temple_settings_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_settings" ADD CONSTRAINT "temple_settings_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_staff_assignment" ADD CONSTRAINT "temple_staff_assignment_trust_id_trust_id_fk" FOREIGN KEY ("trust_id") REFERENCES "public"."trust"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_staff_assignment" ADD CONSTRAINT "temple_staff_assignment_temple_id_temple_id_fk" FOREIGN KEY ("temple_id") REFERENCES "public"."temple"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_staff_assignment" ADD CONSTRAINT "temple_staff_assignment_person_profile_id_person_profile_id_fk" FOREIGN KEY ("person_profile_id") REFERENCES "public"."person_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temple_staff_assignment" ADD CONSTRAINT "temple_staff_assignment_designation_id_designation_id_fk" FOREIGN KEY ("designation_id") REFERENCES "public"."designation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "designation_trust_scope_idx" ON "designation" USING btree ("trust_id","scope_type","scope_id");--> statement-breakpoint
CREATE INDEX "office_bearer_trust_user_idx" ON "office_bearer" USING btree ("trust_id","user_id");--> statement-breakpoint
CREATE INDEX "office_bearer_scope_idx" ON "office_bearer" USING btree ("trust_id","scope_id");--> statement-breakpoint
CREATE INDEX "org_node_trust_idx" ON "organization_node" USING btree ("trust_id");--> statement-breakpoint
CREATE INDEX "org_node_parent_idx" ON "organization_node" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "org_node_path_idx" ON "organization_node" USING btree ("materialized_path");--> statement-breakpoint
CREATE INDEX "temple_member_temple_user_idx" ON "temple_membership" USING btree ("temple_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_temple_user_membership" ON "temple_membership" USING btree ("trust_id","temple_id","user_id");--> statement-breakpoint
CREATE INDEX "temple_trust_idx" ON "temple" USING btree ("trust_id");--> statement-breakpoint
CREATE UNIQUE INDEX "temple_trust_code_idx" ON "temple" USING btree ("trust_id","code");--> statement-breakpoint
CREATE INDEX "trust_member_trust_user_idx" ON "trust_membership" USING btree ("trust_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_trust_user_membership" ON "trust_membership" USING btree ("trust_id","user_id");--> statement-breakpoint
CREATE INDEX "trust_tenant_idx" ON "trust" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "trust_status_idx" ON "trust" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_status_idx" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "delegation_trust_delegator_idx" ON "delegation_grant" USING btree ("trust_id","delegator_user_id");--> statement-breakpoint
CREATE INDEX "delegation_trust_delegatee_idx" ON "delegation_grant" USING btree ("trust_id","delegatee_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_designation_role_binding" ON "designation_role_binding" USING btree ("designation_id","role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_perm_enforcement_key" ON "permission_definition" USING btree ("trust_id","enforcement_key");--> statement-breakpoint
CREATE INDEX "perm_namespace_idx" ON "permission_definition" USING btree ("namespace");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_trust_policy_version" ON "policy_version" USING btree ("trust_id","version_number");--> statement-breakpoint
CREATE INDEX "role_assign_user_trust_idx" ON "role_assignment" USING btree ("trust_id","user_id","scope_id");--> statement-breakpoint
CREATE INDEX "role_assign_role_idx" ON "role_assignment" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_inheritance" ON "role_inheritance" USING btree ("parent_role_id","child_role_id");--> statement-breakpoint
CREATE INDEX "role_perm_role_idx" ON "role_permission" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_permission" ON "role_permission" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_trust_scope_idx" ON "role" USING btree ("trust_id","scope_type","scope_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_key_in_scope" ON "role" USING btree ("trust_id","scope_id","role_key");--> statement-breakpoint
CREATE INDEX "audit_trust_event_idx" ON "audit_event" USING btree ("trust_id","event_type","created_at");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_event" USING btree ("trust_id","actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "audit_event" USING btree ("trust_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "outbox_unprocessed_idx" ON "outbox_event" USING btree ("processed_at","attempt_count");--> statement-breakpoint
CREATE INDEX "outbox_trust_idx" ON "outbox_event" USING btree ("trust_id","event_type");--> statement-breakpoint
CREATE INDEX "pilgrim_booking_idx" ON "booking_pilgrim" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_temple_date_idx" ON "booking" USING btree ("temple_id","booking_date");--> statement-breakpoint
CREATE INDEX "booking_phone_idx" ON "booking" USING btree ("primary_phone");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_matrix_rel" ON "matrix_relationship" USING btree ("matrix_supervisor_assignment_id","staff_assignment_id");--> statement-breakpoint
CREATE INDEX "person_trust_user_idx" ON "person_profile" USING btree ("trust_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_priest_system_code" ON "priest_profile" USING btree ("trust_id","system_code");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_receipt_number_per_temple" ON "receipt" USING btree ("temple_id","receipt_number");--> statement-breakpoint
CREATE INDEX "receipt_booking_idx" ON "receipt" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_reporting_rel" ON "reporting_relationship" USING btree ("supervisor_assignment_id","subordinate_assignment_id");--> statement-breakpoint
CREATE INDEX "seva_temple_category_idx" ON "seva" USING btree ("temple_id","category","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_seva_code_per_temple" ON "seva" USING btree ("temple_id","code");--> statement-breakpoint
CREATE INDEX "shift_temple_date_idx" ON "shift" USING btree ("temple_id","shift_date");--> statement-breakpoint
CREATE INDEX "shipment_temple_status_idx" ON "shipment" USING btree ("temple_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_shipment_booking" ON "shipment" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_temple_facility_key" ON "temple_facility" USING btree ("temple_id","facility_key");--> statement-breakpoint
CREATE INDEX "temple_sched_idx" ON "temple_schedule" USING btree ("temple_id","schedule_type");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_temple_settings" ON "temple_settings" USING btree ("temple_id");--> statement-breakpoint
CREATE INDEX "staff_assign_temple_idx" ON "temple_staff_assignment" USING btree ("temple_id","status");