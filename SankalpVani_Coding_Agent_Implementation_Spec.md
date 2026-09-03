# SankalpVani Trust & Temple Management Platform
## Coding-Agent Implementation Specification

**Document version:** 1.0  
**Date:** 01 September 2026  
**Repository baseline:** `sankalpvani-admin-v1.0`  
**Implementation status:** Start of backend and production architecture implementation  
**Primary instruction:** Build the product end-to-end. Do not stop at mock screens or LocalStorage simulations.

---

## 0. Instructions to Coding Agents

You are implementing SankalpVani, a multi-tenant Trust and Temple Management Platform.

Treat this document as the implementation contract. Before writing code:

1. Inspect the existing repository, package manifest, route tree, component tree, types, utilities, and current persistence code.
2. Preserve useful existing UI, styling, animations, charts, calendar interactions, receipt layouts, and reusable components.
3. Replace prototype business persistence with an authoritative backend and database.
4. Do not create global hard-coded business roles such as `ADMIN`, `TREASURER`, `PRIEST_ADMIN`, or `SUPER_ADMIN`.
5. Trust administrators and Temple administrators must create and allocate roles and permissions dynamically.
6. Never rely on frontend visibility, LocalStorage, a client-supplied tenant header, or a JWT role claim as the final authorization decision.
7. Every protected API, database query, file access, report, background job, and export must be tenant-aware and authorization-protected.
8. Implement in small, testable increments. Keep the application runnable after every phase.
9. Do not replace the existing project with a new blank starter unless the repository is irreparably broken.
10. Do not silently change requirements. Record assumptions and blockers in `docs/implementation-decisions.md`.

### Agent execution rule

For each task:

```text
Inspect → plan → implement → migrate → test → verify → document
```

At the end of each task, report:

- Files changed.
- Database migrations added.
- API endpoints added or changed.
- Authorization checks added.
- Tests added and executed.
- Known limitations.
- Next recommended task.

### Definition of complete

A feature is not complete when its screen renders. It is complete only when:

- Data is stored in the database.
- Server-side validation exists.
- Tenant scope is enforced.
- Authorization is enforced at the API/service boundary.
- Loading, empty, error, and permission-denied states exist.
- Audit behavior is implemented where applicable.
- Tests cover the primary and negative paths.
- The feature works after refresh and in a second browser session.

---

# 1. Product Context

SankalpVani currently contains a Temple-focused administration portal with the following frontend capabilities:

- Authentication screen and administrator profile.
- Dashboard KPIs and charts.
- Masters Hub.
- Temple core information.
- Temple facilities.
- Priest Master.
- Seva and Pooja Master.
- Priest roster and scheduling.
- Devotee booking calendar.
- Transactions ledger and receipt printing.
- Prasadam dispatch and shipment tracking.
- Organization chart with direct and matrix reporting.
- Reports and exports.
- Settings and notification preferences.

The current implementation uses browser LocalStorage for prototype persistence and assumes one Temple and one administrative account. This implementation must evolve into the following product model:

```text
Platform
├── Trust A = Tenant A
│   ├── Temple A1
│   ├── Temple A2
│   └── Temple A3
├── Trust B = Tenant B
│   └── Temple B1
└── Trust C = Tenant C
    └── Temple C1
```

## Core terminology

| Term | Definition |
|---|---|
| Trust | Root business organization and initial tenant/isolation boundary. |
| Temple | Child organization under exactly one Trust. |
| User | Global identity that may belong to multiple Trusts or Temples. |
| Membership | User’s relationship with a Trust or Temple. |
| Designation | Human, legal, or organizational title such as Treasurer or Chief Priest. |
| Office bearer | Time-bound appointment of a user to a designation. |
| Role | Configurable bundle of software permissions. |
| Permission | Individual action on a resource within a scope and optional condition. |
| Assignment | Grant of a role to a user or group within a scope and validity period. |
| Delegation | Restricted, temporary transfer of administrative authority. |
| Scope | Trust, Temple, selected Temples, descendants, or a specific resource set. |

## Non-negotiable distinction

```text
Designation = who the person is organizationally
Office bearer = the person’s appointment and term
Role = what the person may do in the software
Permission = one software capability
```

A designation must not automatically grant access unless an explicit designation-to-role binding is configured.

---

# 2. Target Technology Baseline

Use the existing frontend stack unless repository inspection proves a justified alternative is required.

## Required baseline

- Next.js 15 App Router.
- React 19.
- TypeScript with strict mode.
- Tailwind CSS v4 and existing visual design system.
- Existing React Flow and Dagre organization-chart implementation where reusable.
- Zod for input validation.
- PostgreSQL as the system of record.
- Drizzle ORM or an existing repository ORM, selected after inspecting the repository. Do not introduce two ORMs.
- SQL migration files committed to the repository.
- Supabase Auth/Postgres/Storage may be used as the initial managed infrastructure if the repository has no existing backend provider. Keep authentication, storage, and database access behind internal adapters.
- Redis-compatible cache only after the database-backed authorization path works correctly.
- Object storage for Temple images, documents, receipt assets, and shipment files.
- Background job interface with an outbox table. A managed queue may be added later.

## Architectural preference

Start as a modular monolith:

```text
Next.js application
├── Identity module
├── Tenant/Trust module
├── Organization/Temple module
├── Governance and Authorization module
├── Membership and Office-Bearer module
├── Temple Operations module
├── Booking module
├── Finance module
├── Logistics module
├── Reporting module
├── Notification module
└── Audit module
```

Do not create microservices merely for appearance. Keep module boundaries and interfaces clean so modules can be extracted later.

## Environment variables

Create `.env.example`. Never commit real values.

```text
DATABASE_URL=
DIRECT_DATABASE_URL=
AUTH_PROVIDER_URL=
AUTH_PROVIDER_ANON_KEY=
AUTH_PROVIDER_SERVICE_KEY=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
REDIS_URL=
APP_BASE_URL=
SESSION_SECRET=
ENCRYPTION_KEY=
EMAIL_PROVIDER_API_KEY=
SMS_PROVIDER_API_KEY=
PAYMENT_PROVIDER_KEY=
PAYMENT_PROVIDER_SECRET=
LOG_LEVEL=info
```

Service keys must only be available to server-side code. Validate required environment variables at startup.

---

# 3. Target Architecture

```text
Web browser / Mobile web / Future mobile app
                    │
                CDN / WAF
                    │
             Next.js BFF/API
                    │
       Authentication + tenant context
                    │
     Policy Enforcement Point on every API
                    │
    ┌───────────────┴──────────────────┐
    │                                  │
Application modules              Authorization service
    │                                  │
    └───────────────┬──────────────────┘
                    │
        PostgreSQL + Object Storage
                    │
        Cache + Outbox + Job Workers
                    │
        Audit + Logs + Metrics + Traces
```

## Control plane

The control plane manages:

- Trust onboarding.
- Tenant status and deployment routing.
- Platform support operations.
- Environment configuration.
- Feature flags.
- Platform health.
- Support access with audited break-glass behavior.

## Application plane

The application plane manages:

- Trusts and Temples.
- Users and memberships.
- Designations and office bearers.
- Dynamic roles and permissions.
- Temple operations.
- Bookings, transactions, receipts, logistics, reports, and notifications.

## Initial tenancy model

```text
tenant_id = trust_id
```

Keep the code organized around a technical `tenantId` even if it equals `trustId` initially. This allows a future customer account to own multiple Trusts without redesigning all tables.

## Future isolation tiers

```text
POOL               Shared application and database tables
BRIDGE_SCHEMA      Shared application, dedicated schema for selected Trusts
BRIDGE_DATABASE    Shared application, dedicated database for selected Trusts
DEDICATED          Dedicated application and infrastructure
```

Implement a tenant deployment abstraction, but use the pooled model first.

---

# 4. Repository and Code Organization

Adapt to the existing repository, but converge toward this structure:

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── select-organization/page.tsx
│   └── account-recovery/page.tsx
├── (workspace)/
│   └── trusts/
│       └── [trustId]/
│           ├── dashboard/page.tsx
│           ├── temples/page.tsx
│           ├── members/page.tsx
│           ├── designations/page.tsx
│           ├── office-bearers/page.tsx
│           ├── governance/
│           │   ├── roles/page.tsx
│           │   ├── permissions/page.tsx
│           │   ├── assignments/page.tsx
│           │   ├── inheritance/page.tsx
│           │   ├── delegations/page.tsx
│           │   └── access-simulator/page.tsx
│           └── temples/[templeId]/
│               ├── dashboard/page.tsx
│               ├── masters/page.tsx
│               ├── temple-info/page.tsx
│               ├── priests/page.tsx
│               ├── sevas/page.tsx
│               ├── bookings/page.tsx
│               ├── transactions/page.tsx
│               ├── prasadam/page.tsx
│               ├── scheduling/page.tsx
│               ├── org-chart/page.tsx
│               └── reports/page.tsx
├── api/
│   └── v1/
│       └── ...
components/
├── authorization/
├── organization/
├── trust/
├── temple/
├── priests/
├── sevas/
├── bookings/
├── transactions/
├── prasadam/
├── scheduling/
├── reports/
└── shared/
lib/
├── auth/
├── tenant/
├── authorization/
├── db/
├── repositories/
├── validation/
├── audit/
├── storage/
├── events/
└── integrations/
db/
├── schema/
├── migrations/
├── seeds/
└── policies/
docs/
├── implementation-decisions.md
├── api-contracts.md
├── authorization-model.md
└── runbooks/
tests/
├── unit/
├── integration/
├── authorization/
├── tenant-isolation/
└── e2e/
```

## Layering rule

```text
Page/component
  → feature hook or server action
    → API client / repository
      → service method
        → authorization requirement
          → validated database query
```

UI components must not call the database directly. Domain modules must not import arbitrary UI state. Authorization must be called from server-side service boundaries.

---

# 5. Database Implementation

Create the database before migrating operational features. Use migrations, not manual production edits.

## Required core tables

Implement the following tables. Names may be adapted to project conventions, but relationships and ownership rules must remain.

```text
trust
-----
id
tenant_id
legal_name
registration_number
address_json
contact_json
logo_asset_id
status
created_at
updated_at
```

```text
temple
------
id
trust_id
organization_node_id
code
name
address_json
location_json
contact_json
status
created_at
updated_at
```

```text
organization_node
-----------------
id
trust_id
parent_id
node_type
name
materialized_path
hierarchy_version
status
created_at
updated_at
```

```text
user
----
id
identity_provider_id
name
email
mobile_number
avatar_url
status
mfa_enabled
created_at
updated_at
```

```text
trust_membership
----------------
id
trust_id
user_id
status
membership_type
valid_from
valid_until
created_at
updated_at
```

```text
temple_membership
-----------------
id
trust_id
temple_id
user_id
status
valid_from
valid_until
created_at
updated_at
```

```text
designation
-----------
id
trust_id
scope_type
scope_id
name
description
metadata_json
status
created_by
created_at
updated_at
```

```text
office_bearer
-------------
id
trust_id
scope_id
user_id
designation_id
term_start
term_end
appointment_status
appointed_by
created_at
updated_at
```

```text
permission_definition
---------------------
id
trust_id
namespace
resource_type
action
description
condition_schema_json
enforcement_key
status
version
created_by
created_at
updated_at
```

```text
role
----
id
trust_id
scope_type
scope_id
name
role_key
description
version
is_inheritable
status
created_by
created_at
updated_at
```

```text
role_permission
---------------
role_id
permission_id
effect
scope_mode
scope_selector_json
condition_expression
valid_from
valid_until
```

```text
role_inheritance
----------------
parent_role_id
child_role_id
inheritance_mode
status
created_at
```

```text
role_assignment
---------------
id
trust_id
role_id
user_id
group_id
scope_id
assignment_source
status
valid_from
valid_until
assigned_by
created_at
updated_at
```

```text
designation_role_binding
------------------------
id
designation_id
role_id
scope_mode
requires_approval
auto_assign
valid_from
valid_until
status
```

```text
delegation_grant
----------------
id
trust_id
d elegator_user_id
delegatee_user_id
scope_id
permission_filter_json
resource_filter_json
can_redelegate
approval_status
valid_from
valid_until
created_at
revoked_at
```

Correct the field name to `delegator_user_id` when creating the migration.

```text
policy_version
--------------
id
trust_id
version_number
status
published_by
published_at
change_summary
created_at
```

```text
audit_event
-----------
id
trust_id
temple_id
actor_user_id
event_type
target_type
target_id
action
decision
policy_version
request_id
ip_address
user_agent
payload_json
created_at
```

## Operational tables

Implement and relate these modules to `trust_id` and, where applicable, `temple_id`:

```text
temple_settings
temple_schedule
temple_facility
person_profile
priest_profile
temple_staff_assignment
staff_status_history
seva
seva_schedule_rule
seva_capacity_rule
booking
booking_pilgrim
booking_status_history
payment
financial_transaction
receipt
payment_status_history
shipment
shipment_item
shipment_status_history
shift
shift_assignment
staff_availability
reporting_relationship
matrix_relationship
document
notification_preference
notification_delivery
outbox_event
```

## Ownership rules

1. Every Trust-owned table must contain `trust_id` directly or through a validated ownership relation.
2. Every Temple-owned table must contain both `trust_id` and `temple_id`.
3. Validate that `temple.trust_id = record.trust_id`.
4. Never trust a `temple_id` from the client without resolving and validating its parent Trust.
5. Use composite indexes beginning with `trust_id` for tenant-owned query paths.
6. Add uniqueness constraints within tenant scope, not globally, unless a field is genuinely global.
7. Use soft deletion or archival for business records. Do not hard-delete financial or audit history.
8. Store timestamps in UTC; display in IST by default and support future localization.

## Database defense in depth

Implement application-level tenant filters first. Add PostgreSQL Row-Level Security after the first repository layer is stable. RLS must not become an excuse to omit explicit service authorization.

Required isolation tests:

- Trust A cannot read Trust B rows.
- Trust A cannot update Trust B rows by changing an ID.
- Temple A cannot read Temple B rows without an explicit cross-Temple grant.
- Report queries cannot aggregate unauthorized Temples.
- File access cannot cross tenant prefixes.

---

# 6. Authentication, Tenant Context, and Sessions

## Authentication

Implement provider-backed authentication behind an adapter:

```ts
interface IdentityProvider {
  getSession(request: Request): Promise<AuthenticatedIdentity | null>;
  signOut(sessionId: string): Promise<void>;
  beginPasswordRecovery(identifier: string): Promise<void>;
  requireRecentMfa(userId: string): Promise<boolean>;
}
```

The provider establishes identity only. It does not decide Trust or Temple permissions.

## Tenant context

Create server-side context middleware:

```ts
interface RequestContext {
  requestId: string;
  userId: string;
  trustId: string;
  templeId?: string;
  sessionId: string;
  policyVersion?: number;
}
```

Context resolution must:

1. Authenticate the user.
2. Read the requested Trust and optional Temple from a trusted route parameter.
3. Resolve Temple ownership from the database.
4. Verify active Trust membership.
5. Verify Temple membership or effective role scope.
6. Attach context to the service request.

Do not treat `X-Tenant-ID` or a hidden form field as authority.

## Organization selection

After login, if a user belongs to multiple Trusts, show an organization selector. If a Trust contains multiple authorized Temples, show a Temple selector or Trust-wide mode where permitted.

The selected context must appear in the URL:

```text
/trusts/{trustId}/dashboard
/trusts/{trustId}/temples/{templeId}/transactions
```

---

# 7. Dynamic Authorization Implementation

## Authorization contract

Implement an internal provider interface:

```ts
interface AuthorizationRequest {
  subjectId: string;
  trustId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  scopeId?: string;
  context?: Record<string, unknown>;
}

interface AuthorizationDecision {
  decision: 'ALLOW' | 'DENY' | 'CONDITIONAL';
  reasonCode: string;
  policyVersion: number;
  matchedGrants: MatchedGrant[];
}

interface AuthorizationProvider {
  check(input: AuthorizationRequest): Promise<AuthorizationDecision>;
  batchCheck(inputs: AuthorizationRequest[]): Promise<AuthorizationDecision[]>;
  explain(input: AuthorizationRequest): Promise<AuthorizationDecision>;
  listAuthorizedScopes(input: ListScopeRequest): Promise<string[]>;
}
```

The initial implementation may be SQL-backed. Keep the interface compatible with a future OpenFGA, SpiceDB, OPA, or equivalent provider.

## Permission model

Permission format:

```text
namespace.resource.action
```

Examples:

```text
trust.temple.create
temple.priest.manage
temple.seva.publish
temple.booking.create
temple.finance.payment.approve
temple.prasadam.ship
policy.role.assign
report.finance.export
```

Roles are data, not code:

```text
Role: Annual Festival Finance Coordinator
Permissions:
  temple.event.read
  temple.event.create
  temple.expense.create
Scope:
  Selected Temples A and B
Validity:
  01-Apr-2026 to 30-Nov-2026
```

## Scope modes

Implement:

```text
EXACT
TRUST_ONLY
ALL_DESCENDANTS
SELECTED_DESCENDANTS
DIRECT_CHILDREN
RESOURCE_RELATION
CUSTOM_SELECTOR
```

Trust-to-Temple cascading must be explicit. Temple roles must not inherit upward to Trust resources.

## Effective permission calculation

```text
Direct grants
+ inherited role grants
+ Trust-to-Temple cascades
+ designation-role bindings
+ valid delegation grants
- explicit denies
- expired or revoked grants
- suspended memberships
- violated constraints
```

Rules:

- Deny by default.
- No role inheritance cycles.
- A delegate cannot grant beyond the delegator’s effective scope.
- A Temple administrator cannot expand a Trust grant.
- Explicit deny overrides an allow in the same applicable scope.
- More-specific deny overrides broader allow.
- Revoked or expired assignments are ineffective immediately after policy propagation.

## Dynamic administration permissions

These are permission capabilities, not predefined roles:

```text
policy.permission.create
policy.permission.update
policy.role.create
policy.role.update
policy.role.assign
policy.role.revoke
policy.role.inherit
policy.cascade.configure
policy.designation.manage
policy.office_bearer.manage
policy.delegation.create
policy.delegation.revoke
policy.audit.read
```

A bootstrap Trust creator may receive a one-time provisioning grant. After onboarding, all normal authority must be represented by tenant-configured role assignments.

## Condition engine

Do not execute arbitrary JavaScript supplied by administrators. Use a restricted expression language or a structured condition AST.

Allowed examples:

```text
amount <= 50000
mfa_present == true
requester_id != created_by
approval_stage == 'TREASURER_REVIEW'
current_time within assignment_validity
```

The condition engine must:

- Validate syntax before publishing.
- Validate referenced attributes against a schema.
- Restrict operators and functions.
- Have deterministic evaluation.
- Produce safe explanation output.
- Have unit tests for allow and deny outcomes.

## API enforcement pattern

```ts
export async function updateSeva(ctx: RequestContext, sevaId: string, input: UpdateSevaInput) {
  const seva = await sevaRepository.getOwnedByTrust(sevaId, ctx.trustId);

  await authorization.require({
    subjectId: ctx.userId,
    trustId: ctx.trustId,
    scopeId: seva.templeId,
    action: 'temple.seva.update',
    resourceType: 'seva',
    resourceId: seva.id,
  });

  const validated = updateSevaSchema.parse(input);
  return sevaRepository.update(seva.id, ctx.trustId, validated, ctx.userId);
}
```

Every mutating service must follow this pattern.

---

# 8. Existing Feature Migration Plan

## Phase 0 — Repository assessment

Deliverables:

- `docs/repository-assessment.md`.
- Current route and component inventory.
- LocalStorage key inventory.
- Existing TypeScript type inventory.
- Current package and dependency inventory.
- List of hard-coded roles, designations, and one-Temple assumptions.
- Proposed migration map from current types to database entities.

Inspect at minimum:

```text
app/page.tsx
components/LoginScreen.tsx
components/Sidebar.tsx
components/DashboardPortal.tsx
components/MastersHub.tsx
components/PriestMaster.tsx
components/SevaMaster.tsx
components/TempleInfo.tsx
components/TempleFacilities.tsx
components/Transactions.tsx
components/Scheduling.tsx
components/Prasadam.tsx
components/CalendarView.tsx
components/OrgChart.tsx
components/org-chart/*
components/SystemOverview.tsx
components/Settings.tsx
globals.css
package.json
```

Do not modify major UI code until the assessment is complete.

## Phase 1 — Database and application foundation

Deliverables:

- Database connection.
- Migration runner.
- Core Trust, Temple, User, membership, designation, office-bearer tables.
- Seed scripts for development only.
- Repository layer.
- Request context middleware.
- Secure session integration.
- Error and validation conventions.
- Audit-event foundation.

Acceptance criteria:

- A development database can be created from zero using documented commands.
- A Trust can be created.
- Multiple Temples can be created under one Trust.
- A second Trust can be created without data collision.
- Users can belong to multiple Trusts.
- The application survives refresh without losing authoritative data.

## Phase 2 — Trust and Temple workspaces

Deliverables:

- Trust selector.
- Temple selector.
- Trust dashboard shell.
- Temple dashboard shell.
- Trust profile.
- Temple profile.
- Temple portfolio.
- Tenant-aware navigation and breadcrumbs.
- Permission-aware menu rendering.

Acceptance criteria:

- A user cannot navigate to another Trust by editing the URL.
- Trust dashboards aggregate only authorized Temples.
- Temple dashboards show only the selected Temple’s records.
- Empty, loading, error, and no-access states exist.

## Phase 3 — Governance and dynamic authorization

Deliverables:

- Permission definition administration.
- Role builder.
- Role-permission binding.
- Role assignment.
- Designation management.
- Office-bearer appointments.
- Designation-to-role binding.
- Role inheritance.
- Trust-to-Temple cascade.
- Delegation.
- Policy validation and publication.
- Effective-access explanation.
- Access simulator.

Acceptance criteria:

- A Trust admin can create a custom role with a custom name.
- A Trust admin can define or register an enforceable permission.
- A Temple admin can create a Temple-local role.
- A role can be assigned to a user with an expiry date.
- Trust roles cascade only to configured Temples.
- Role inheritance cycles are rejected.
- Delegation cannot exceed the delegator’s access.
- Policy changes are audited and cached decisions are invalidated.
- A user’s access can be explained as direct, inherited, cascaded, designation-bound, or delegated.

## Phase 4 — Temple master data

Migrate and backend-enable:

- Temple Core Information.
- Facilities.
- Priest Master.
- Designations and staff assignments.
- Seva and Pooja Master.
- Darshan and Seva schedules.

Acceptance criteria:

- A Temple can configure different Seva prices, schedules, capacity, and instructions from another Temple in the same Trust.
- Priest status and specialization are persistent.
- Temple media uses tenant-scoped object storage.
- Configuration changes are audited.

## Phase 5 — Bookings and transactions

Migrate and backend-enable:

- Booking calendar.
- Pilgrim and family roster.
- Gotra and Nakshatra fields.
- Date validation.
- Capacity validation.
- Pricing calculation.
- Booking status history.
- Payment and transaction ledger.
- Receipt print and PDF generation.
- Refund and cancellation workflow.

Acceptance criteria:

- Two concurrent requests cannot overbook the final available Seva capacity.
- Past-date booking is denied according to policy.
- Amount calculation is performed server-side.
- Payment status cannot be changed through a client-only control.
- Receipt numbers are unique within the required scope.
- Financial updates have an audit trail and actor.

## Phase 6 — Scheduling and organization chart

Migrate:

- Priest duty roster.
- Leave and availability.
- Shift assignment.
- Double-booking safeguards.
- Primary reporting relationship.
- Matrix reporting relationship.
- React Flow and Dagre visualization.

Acceptance criteria:

- Staff assigned to one Temple cannot appear in another Temple without a valid assignment.
- Leave and conflict rules work server-side.
- Reporting relationships cannot create an invalid cycle where cycles are disallowed.
- Org-chart filtering respects Trust and Temple scope.

## Phase 7 — Prasadam logistics and notifications

Migrate:

- Home-delivery ingestion.
- Shipment record.
- Recipient address.
- Packing and shipping states.
- Tracking number.
- Bulk actions.
- Label printing.
- SMS/email/in-app notification adapters.

Acceptance criteria:

- Shipment creation is idempotent.
- Bulk operations authorize each affected record or validate the batch scope.
- Shipment status history is immutable.
- Provider failures are retried and visible.
- Notification jobs contain Trust and Temple context.

## Phase 8 — Reports, exports, and audit

Deliverables:

- Trust aggregate dashboard.
- Temple dashboard.
- Daily, Seva, monthly, yearly, finance, booking, and logistics reports.
- CSV export.
- PDF export where required.
- Audit search.
- Effective access report.
- Asynchronous report jobs for large datasets.

Acceptance criteria:

- Reports cannot expose unauthorized Temple data.
- Exports require an explicit permission.
- Export events contain actor, scope, filters, and timestamp.
- Large reports do not block API requests.
- Audit search is tenant-scoped.

## Phase 9 — Production hardening

Deliverables:

- Database RLS.
- Tenant-isolation test suite.
- Policy cache and invalidation.
- Outbox processing.
- Rate limiting.
- Backup and restore runbook.
- Monitoring and alerting.
- Security review.
- Load testing.
- Deployment pipeline.
- Staging environment.

---

# 9. Feature Requirements for Existing Modules

## Authentication and profile

Retain the existing sacred-themed login and profile experience where appropriate, but replace simulated behavior with real identity operations.

Required:

- Login and logout.
- Session persistence through secure server mechanism.
- Password reset.
- MFA setting.
- Session timeout.
- User profile.
- Avatar upload through storage service.
- Account suspension.
- Recent session view where supported.

Do not retain a default production password or hard-coded account.

## Dashboard

Support two contexts:

### Trust dashboard

- Number of Temples.
- Authorized member count.
- Authorized booking count.
- Authorized collections.
- Pending shipments.
- Temple comparison.
- Trust-level reports.

### Temple dashboard

- Today’s devotees.
- Recent bookings.
- Temple collections.
- Pending prasadam.
- Seva capacity.
- Priest roster.
- Recent transactions.

All dashboard queries must be server-side and authorization-filtered.

## Temple Core Information

Support:

- Name.
- Address.
- Hotline.
- Official email.
- Website.
- Maps link.
- Media.
- Normal-day schedule.
- Weekend schedule.
- Seasonal schedule.
- Special-occasion schedule.
- Publication state.
- Configuration history.

## Temple Facilities

Support configurable facility records rather than a fixed array only. Seed the existing facilities as development data, but allow each Temple to create, rename, disable, and describe facilities.

## Priest Master

Separate:

```text
User identity
Person profile
Priest profile
Temple staff assignment
Designation
Office bearer
Role assignment
```

Support:

- Full name.
- System identifier.
- Contact information.
- Specialization.
- Status.
- Temple assignment.
- Leave.
- Validity dates.
- Audit history.

## Seva Master

Support:

- Name.
- Category.
- Description.
- Instructions.
- Price.
- Included persons.
- Extra-person price.
- Capacity.
- Duration.
- Reporting time.
- Daily schedule.
- Weekly days.
- Monthly dates.
- Annual dates.
- Special dates.
- Date ranges.
- Active/suspended/draft/retired state.

Validate all scheduling rules server-side.

## Bookings

Support:

- Primary devotee.
- Additional pilgrims.
- Name.
- Age.
- Gender.
- Gotra.
- Nakshatra.
- Contact details.
- Seva.
- Temple.
- Date.
- Capacity.
- Price calculation.
- Payment state.
- Booking state.
- Notes.
- Receipt reference.
- Home delivery option.

Use a database transaction for reservation and capacity allocation.

## Transactions and receipts

Support:

- Receipt number.
- Verification reference.
- Booking link.
- Amount.
- Payment method.
- Payment provider reference.
- Payment status.
- Refund status.
- Receipt print.
- PDF receipt.
- Filters.
- Pagination.
- CSV export.
- Approval workflow.

Do not call an ordinary payment-status update endpoint for a privileged financial transition without authorization and state validation.

## Scheduling

Support:

- Staff availability.
- Leave.
- Seva shift.
- Date.
- Start and end time.
- Primary assignment.
- Conflict detection.
- Authorized override with reason.
- Roster view.

## Prasadam

Support:

- Shipment creation from eligible booking.
- Recipient address.
- Contents.
- Quantity.
- Tracking.
- Status history.
- Bulk packing.
- Bulk shipping.
- Label printing.
- Cancellation and return.

Do not delete shipments from production as the default bulk-cancel behavior. Transition them to cancelled and preserve history.

## Organization chart

Store graph relationships as data:

```text
reporting_relationship
matrix_relationship
```

The current visual distinction should be retained:

- Solid line: primary management relationship.
- Dashed line: matrix or functional relationship.

The graph must load only authorized staff and relationships.

## Reports

All reports must define:

- Required permission.
- Allowed scope.
- Supported filters.
- Maximum date range.
- Export behavior.
- Data freshness.
- Audit event.

---

# 10. API Standards

## Response format

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123"
  }
}
```

Error:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "requestId": "req_123"
  }
}
```

Do not reveal unauthorized resource existence unless the endpoint’s security policy explicitly permits it.

## Pagination

Use cursor pagination for large datasets and support stable sorting. Offset pagination is acceptable for small admin tables.

```text
?pageSize=25&cursor=...
```

## Validation

- Validate all input with Zod or equivalent at the API boundary.
- Validate ownership and tenant scope before mutation.
- Validate state transitions.
- Validate concurrency-sensitive operations in the transaction.
- Return field-level errors for forms.

## Idempotency

Require idempotency keys for:

- Booking creation.
- Payment creation.
- Refund request.
- Shipment creation.
- Bulk shipment operations.
- Notification enqueue.
- Report job creation.

## API groups

```text
/v1/auth
/v1/users
/v1/trusts
/v1/trusts/{trustId}/temples
/v1/trusts/{trustId}/memberships
/v1/scopes/{scopeId}/designations
/v1/scopes/{scopeId}/office-bearers
/v1/scopes/{scopeId}/permissions
/v1/scopes/{scopeId}/roles
/v1/roles/{roleId}/permissions
/v1/roles/{roleId}/inheritance
/v1/role-assignments
/v1/delegations
/v1/authorization/check
/v1/authorization/batch-check
/v1/authorization/explain
/v1/temples/{templeId}/priests
/v1/temples/{templeId}/sevas
/v1/temples/{templeId}/bookings
/v1/temples/{templeId}/transactions
/v1/temples/{templeId}/shipments
/v1/temples/{templeId}/reports
/v1/audit-events
```

---

# 11. Audit, Events, and Background Jobs

## Audit events

At minimum, record:

```text
USER_INVITED
MEMBERSHIP_CREATED
MEMBERSHIP_REVOKED
DESIGNATION_CREATED
OFFICE_BEARER_APPOINTED
ROLE_CREATED
ROLE_UPDATED
ROLE_PUBLISHED
ROLE_ASSIGNED
ROLE_REVOKED
PERMISSION_CREATED
DELEGATION_CREATED
DELEGATION_REVOKED
POLICY_PUBLISHED
AUTHORIZATION_ALLOWED
AUTHORIZATION_DENIED
BOOKING_CREATED
PAYMENT_CREATED
PAYMENT_APPROVED
PAYMENT_REFUNDED
REPORT_EXPORTED
DOCUMENT_DOWNLOADED
SHIPMENT_STATUS_CHANGED
```

Audit events must include:

```text
id
trust_id
temple_id
actor_user_id
event_type
target_type
target_id
action
decision
policy_version
request_id
created_at
payload_json
```

Never place passwords, access tokens, or payment secrets in audit payloads.

## Outbox event

Use an outbox table in the same database transaction as the domain change:

```text
outbox_event
------------
id
trust_id
temple_id
event_type
aggregate_type
aggregate_id
payload_json
occurred_at
processed_at
attempt_count
last_error
```

Consumers must be idempotent.

## Jobs

Every job must carry:

```json
{
  "jobId": "job_123",
  "trustId": "trust_001",
  "templeId": "temple_001",
  "createdBy": "user_001",
  "operation": "generate_report"
}
```

Workers must re-check authorization for sensitive jobs.

---

# 12. Caching and Performance

Implement caching only after correctness is established.

## Cache keys

```text
authz:{trustId}:{policyVersion}:{userId}:{action}:{resourceId}
membership:{trustId}:{userId}
org:{trustId}:{hierarchyVersion}
dashboard:{trustId}:{scopeId}:{dateRange}:{queryVersion}
```

Never use a cache key that omits tenant identity for tenant-owned data.

## Invalidation triggers

Invalidate or version-bump on:

- Membership change.
- Role change.
- Permission change.
- Assignment change.
- Delegation change.
- Office-bearer term change.
- Temple suspension.
- Trust suspension.
- Organization hierarchy change.

## Performance targets

Initial targets:

- p95 authorization decision under 150 ms uncached.
- p95 cached authorization decision under 50 ms.
- p95 ordinary read API under 500 ms.
- p95 ordinary write API under 800 ms.
- No unbounded list queries.
- No N+1 authorization or database queries in list endpoints.

---

# 13. Security Requirements

Implement and test:

- Deny-by-default authorization.
- Tenant isolation in every repository.
- Server-side permission checks.
- Object-level authorization.
- Short-lived sessions or access tokens.
- Refresh rotation if applicable.
- MFA for privileged operations.
- CSRF protection where cookie sessions are used.
- Rate limiting.
- Input validation.
- Output filtering.
- Secure signed file URLs.
- Storage namespace isolation.
- Encryption in transit and at rest.
- Secrets management.
- Audit logging.
- Account and membership revocation.
- Session invalidation after high-risk changes.
- Dependency and vulnerability scanning.
- Security headers.
- No sensitive data in browser LocalStorage.

## Threat cases to test

- Change `trustId` in a URL.
- Change `templeId` in a request body.
- Use a Temple A role to access Temple B.
- Use an expired assignment.
- Use a revoked assignment with a stale cache.
- Create a role with more authority than the creator.
- Create a role-inheritance cycle.
- Download another Trust’s file by changing the path.
- Export a report with an unauthorized Temple filter.
- Replay a payment or booking request.
- Submit arbitrary condition code.
- Use a disabled Trust account.
- Access data through a background job created before revocation.

---

# 14. Testing Strategy

## Unit tests

Cover:

- Seva price calculation.
- Capacity calculation.
- Date and schedule rules.
- Booking status transitions.
- Payment transitions.
- Shipment transitions.
- Role inheritance closure.
- Cycle detection.
- Scope resolution.
- Delegation subset validation.
- Condition evaluation.
- Conflict resolution.

## Integration tests

Cover:

- Database migrations from zero.
- Foreign-key and tenant constraints.
- Repositories.
- Policy queries.
- Outbox transaction behavior.
- Storage access policy.
- RLS policies where enabled.
- Concurrent booking capacity.
- Role revocation and cache invalidation.

## End-to-end tests

Required scenarios:

1. Create Trust.
2. Create two Temples.
3. Invite two users.
4. Create Trust designation and office bearer.
5. Create custom Trust role.
6. Create custom Temple role.
7. Assign different roles to users.
8. Configure Trust role cascade to one Temple only.
9. Verify access in selected and unselected Temples.
10. Create Seva.
11. Create booking.
12. Record payment.
13. Print receipt.
14. Assign priest shift.
15. Create prasadam shipment.
16. Export authorized report.
17. Attempt unauthorized access.
18. Revoke access and verify denial.

## Tenant-isolation test matrix

| Actor | Resource | Expected |
|---|---|---|
| Trust A member | Trust A record | According to permission |
| Trust A member | Trust B record | Deny |
| Temple A member | Temple A record | According to permission |
| Temple A member | Temple B record | Deny by default |
| Trust admin with selected cascade | Selected Temples | Allow according to permission |
| Trust admin with selected cascade | Unselected Temple | Deny |
| Expired assignment | Any protected resource | Deny |
| Revoked assignment | Any protected resource | Deny |

---

# 15. UI and UX Rules

Preserve the existing sacred visual language where useful, including:

- Sacred saffron, gold, vermilion, ivory, emerald, and blue semantic accents.
- Existing responsive layout patterns.
- Existing cards, tables, modals, drawers, charts, calendar, and organization graph interactions.
- Existing receipt and thermal-slip visual intent.
- Accessible contrast and focus states.

## Required UI states

Every data screen must implement:

- Initial loading.
- Empty state.
- Error state.
- Retry action.
- Permission denied state.
- Suspended Trust or Temple state.
- Stale data or refresh state where relevant.
- Unsaved changes warning.
- Success confirmation.
- Validation errors.

## Permission-aware UI

Use a component or hook such as:

```tsx
<Can permission="temple.seva.manage">
  <SevaManagementActions />
</Can>
```

This is only a usability layer. The server must enforce the permission independently.

## Destructive actions

Use confirmation for:

- Revoking membership.
- Revoking role assignment.
- Publishing policy.
- Suspending Trust or Temple.
- Refund.
- Shipment cancellation.
- Bulk status changes.
- Deleting or archiving records.

Display the target, scope, impact, and current user before confirmation.

---

# 16. Seed Data and Development Accounts

Development seed data must be clearly marked and must never run automatically in production.

Seed:

```text
Trust: Development Dharma Trust
Temples: Development Temple A, Development Temple B
Users: test users with documented credentials stored only in local development documentation
Designations: sample titles
Roles: sample roles only as seed data, not platform defaults
Permissions: module capability examples
Priests, Sevas, bookings, transactions, shipments, and schedules
```

Do not create production defaults such as `admin@temple1.com` with a known password.

A production Trust onboarding flow must create the initial bootstrap administrator through a secure, expiring invitation or equivalent controlled provisioning process.

---

# 17. Migration Rules from LocalStorage

Identify current keys and replace business persistence progressively.

```text
sankalpvani_session       → secure authenticated session
sankalpvani_bookings      → booking, pilgrim, payment, status tables
sankalpvani_org_chart     → users, staff, office bearers, relationships
sankalpvani_priests       → person, priest, staff assignment tables
```

Allowed LocalStorage after migration:

```text
- UI preferences
- Last selected view
- Sidebar state
- Temporary form draft
- Non-sensitive filter preferences
```

Forbidden LocalStorage after migration:

```text
- Passwords
- Access tokens
- Roles
- Permissions
- Users
- Bookings
- Transactions
- Payments
- Priests
- Office bearers
- Audit events
```

Use repository interfaces so UI components are not coupled to the migration mechanism.

---

# 18. Documentation Deliverables

Create and maintain:

```text
docs/architecture.md
docs/database-schema.md
docs/authorization-model.md
docs/api-contracts.md
docs/repository-assessment.md
docs/implementation-decisions.md
docs/testing-strategy.md
docs/deployment.md
docs/runbooks/tenant-isolation-incident.md
docs/runbooks/backup-restore.md
docs/runbooks/policy-revocation.md
```

Every major design decision must include:

- Decision.
- Alternatives considered.
- Reason.
- Consequences.
- Reversal or migration path.

---

# 19. Pull Request and Agent Completion Checklist

Before declaring a task complete, verify:

## Functional

- [ ] User workflow works end-to-end.
- [ ] Data persists in the database.
- [ ] Refresh does not lose data.
- [ ] Multiple Trusts and Temples are tested.
- [ ] Existing relevant UI behavior is preserved.

## Authorization

- [ ] Permission is defined or registered.
- [ ] API/service check exists.
- [ ] Tenant scope is validated.
- [ ] Temple scope is validated.
- [ ] Negative authorization test exists.
- [ ] UI guard is not the only protection.

## Data

- [ ] Migration is committed.
- [ ] Indexes exist for primary queries.
- [ ] Tenant ownership is explicit.
- [ ] Status history exists where needed.
- [ ] Audit event exists for sensitive changes.

## Quality

- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] End-to-end tests pass or are documented as pending.
- [ ] Loading, empty, error, and denied states are implemented.
- [ ] No secrets or real credentials are committed.
- [ ] Documentation is updated.

---

# 20. Final Release Acceptance Criteria

The platform is ready for initial production pilot when all of the following are true:

1. A new database can be created from zero using migrations.
2. A Trust can be onboarded without code changes.
3. A Trust can create multiple Temples.
4. Users can belong to multiple Trusts with independent access.
5. Trust and Temple administrators can create custom roles.
6. Administrators can assign permissions dynamically.
7. Designations and roles remain separate.
8. Trust-to-Temple cascading is explicit and testable.
9. Role inheritance cannot create cycles.
10. Delegation cannot exceed the delegator’s effective access.
11. All existing core Temple modules work with backend persistence.
12. Bookings, payments, receipts, scheduling, and shipments have server-side validation.
13. Reports and exports apply authorization scope.
14. Cross-Trust access tests pass.
15. Revocation propagates within the documented security window.
16. Audit records exist for sensitive operations.
17. No business-critical data depends on LocalStorage.
18. Backup and restore have been tested.
19. Monitoring and error reporting are active.
20. Stakeholders have approved the unresolved decisions in the BRD/SRS.

---

# 21. Immediate First Tasks

Execute these tasks in order:

```text
TASK-001 Inspect repository and write repository assessment.
TASK-002 Extract current TypeScript domain types and LocalStorage keys.
TASK-003 Confirm package/dependency and environment strategy.
TASK-004 Create database connection and migration infrastructure.
TASK-005 Implement Trust, Temple, User, and membership schema.
TASK-006 Implement authentication adapter and request context.
TASK-007 Implement Trust/Temple selection and tenant-aware routes.
TASK-008 Implement repository interfaces and migrate Temple profile.
TASK-009 Implement authorization schema and basic check service.
TASK-010 Implement dynamic role, permission, and assignment administration.
TASK-011 Add tenant-isolation and authorization test suites.
TASK-012 Migrate Priest, Seva, Booking, Transaction, and Logistics modules.
```

Do not proceed to large-scale feature migration until `TASK-005` through `TASK-010` have a working vertical slice.

## First vertical slice definition

The first vertical slice must demonstrate:

```text
Create Trust
  → Create two Temples
  → Invite user
  → Create custom Temple role
  → Define permission
  → Assign role to user for Temple A
  → User can access Temple A
  → User cannot access Temple B
  → Revoke assignment
  → User is denied
  → Audit events are visible
```

This vertical slice validates the most important architectural risks before significant module migration.

---

# 22. Implementation Decision Defaults

Unless the product owner explicitly changes them, use these defaults:

- Trust is the technical tenant boundary.
- Temple is a child organization and scope, not a separate tenant.
- Pooled multi-tenant PostgreSQL is the initial deployment model.
- PostgreSQL is the system of record.
- UTC is stored; IST is the default display timezone.
- Roles and permissions are tenant-configurable.
- Designations do not grant permissions automatically.
- Trust roles cascade only when explicitly configured.
- Temple roles do not inherit upward.
- Deny by default.
- Explicit deny overrides allow within applicable scope.
- Delegation is a subset of the delegator’s permissions and scope.
- Role inheritance is acyclic.
- Sensitive writes and exports are audited.
- Financial and audit history is retained.
- LocalStorage is not authoritative for business data.
- Modular monolith first; service extraction later.
- No production feature is considered complete with a mock-only implementation.

---

## End of Coding-Agent Implementation Specification
