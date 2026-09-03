# SankalpVani Product Requirements Document
## Trust & Temple Management Platform

**Version:** 1.0  
**Date:** 01 September 2026  
**Status:** Product baseline for implementation  
**Product:** SankalpVani  
**Primary market:** Trusts, Devasthanams, and multi-Temple religious organizations  
**Related documents:** Complete BRD/SRS and Coding-Agent Implementation Specification

---

## 1. Product Summary

SankalpVani is a multi-tenant Trust and Temple Management Platform that digitizes the administration and daily operations of Hindu temples and Devasthanams.

The product supports a dynamic hierarchical operating model:

```text
Trust = tenant and governance root
 ├── Temple A
 ├── Temple B
 └── Temple C
```

A Trust can manage multiple Temples while allowing each Temple to maintain its own staff, priests, Sevas, facilities, bookings, transactions, schedules, logistics, and reports.

The platform uses dynamic governance. Trust and Temple administrators create their own designations, roles, permissions, assignments, inheritance rules, cascading policies, and delegations. The product does not impose fixed business roles such as Administrator, Treasurer, or Priest Admin.

The current product baseline already contains a Temple administration interface with dashboards, Temple masters, Priest Master, Seva Master, booking calendar, transaction ledger, receipt printing, scheduling, prasadam logistics, organization chart, reports, and settings. This PRD converts that prototype foundation into a production-ready, Trust-aware product. [Source baseline: existing SankalpVani project analysis.]

---

## 2. Product Vision

Enable every Trust and Temple to operate with clarity, accountability, and configurable governance through one secure digital platform.

### Vision statement

> SankalpVani should become the trusted operating system for the administration, service delivery, governance, and reporting of Temples and Devasthanams.

### Product principles

1. **Trust-first:** Trust is the tenant, governance root, and primary data-isolation boundary.
2. **Temple autonomy:** Each Temple can operate independently within Trust policy.
3. **Configurable governance:** Administrators define roles and permissions according to their own organization.
4. **Separation of title and access:** Designations describe appointments; roles control software capabilities.
5. **Operational truth:** The database, not the browser, is the source of truth.
6. **Accountability:** Sensitive operations and policy changes are auditable.
7. **Progressive complexity:** Start simple for one Trust, but support multi-Temple and enterprise scale.
8. **Respectful experience:** The interface should feel appropriate for religious institutions while remaining modern and operationally efficient.

---

## 3. Problem Statement

### Current problems

- Temple operations are fragmented across spreadsheets, paper registers, messaging applications, and disconnected tools.
- A single-Temple administrative model does not represent Trust-level governance or multiple Temples.
- Fixed roles do not reflect the different structures used by individual Trusts and Devasthanams.
- Legal titles and software access are often conflated.
- Booking, payment, scheduling, and prasadam data lacks one authoritative source.
- Trust administrators cannot easily compare Temple operations or delegate authority safely.
- Temple administrators need autonomy without seeing unrelated Temples.
- Existing prototype persistence through browser LocalStorage cannot support production data, concurrent users, audit, or tenant isolation.

### Consequences

- Duplicate or inconsistent records.
- Over-privileged users.
- Weak accountability.
- Manual report preparation.
- Limited visibility for Trust leadership.
- High operational dependency on individual administrators.
- Significant future rework if multi-tenancy is added after database implementation.

---

## 4. Product Goals and Non-Goals

### Goals

| Goal | Product outcome |
|---|---|
| Multi-Trust SaaS | Multiple independent Trusts use one platform without data leakage. |
| Trust–Temple hierarchy | Trust leadership has configured oversight across Temples. |
| Temple operations | Staff can manage Sevas, priests, bookings, payments, logistics, and reports. |
| Dynamic governance | Each organization defines its own designations, roles, permissions, and delegation. |
| Reliable records | Business data persists in an authoritative backend database. |
| Operational accountability | Changes, approvals, access, and exports are auditable. |
| Extensibility | Future modules can use the same tenant, authorization, audit, and reporting foundations. |

### Non-goals for the initial product

- Full replacement for statutory accounting or enterprise ERP.
- Automated legal validation of Trust registration or appointments.
- Autonomous religious or ritual decision-making.
- Universal payment-gateway support in the first release.
- A public marketplace for every Temple in the first release.
- Dedicated infrastructure for every Trust from day one.
- Imposing a standard governance structure on all Trusts.

---

## 5. Target Customers and Personas

### Primary customer segments

1. Individual Temples requiring structured administration.
2. Trusts managing two or more Temples.
3. Devasthanams with priests, staff, finance, operations, and reporting teams.
4. Religious organizations requiring Trust-level audit and Temple-level autonomy.
5. Temple groups that need digital booking, receipt, and prasadam operations.

### Personas

#### Trust governance member

Needs high-level oversight, Temple comparison, office-bearer visibility, finance reports, and audit access without necessarily managing daily operations.

#### Trust policy administrator

Creates custom designations, roles, permissions, cascades, assignments, constraints, and delegations.

#### Temple administrator

Runs one Temple’s masters, users, priests, Sevas, bookings, schedules, transactions, shipments, and reports.

#### Priest or Acharya

Views assigned duties, Sevas, schedules, leave, and operational instructions.

#### Finance operator

Records collections, manages receipts, processes payment statuses, prepares reports, and performs authorized exports.

#### Operations and logistics operator

Manages bookings, devotee service operations, prasadam packing, dispatch, tracking, and fulfillment.

#### Auditor or report viewer

Reads authorized records and reports without changing operational data.

#### Devotee or pilgrim

Books a Seva, provides pilgrim details, receives a receipt, and tracks applicable fulfillment.

#### Platform operator

Onboards tenants, operates infrastructure, handles support, and uses temporary audited access only when required.

---

## 6. Product Scope

### Trust-level capabilities

- Trust profile and legal information.
- Multiple Temples under one Trust.
- Trust members and invitations.
- Trust designations.
- Trust office bearers and appointment terms.
- Trust-level roles and permissions.
- Trust-to-Temple cascading.
- Cross-Temple reporting where permitted.
- Delegated administration.
- Trust dashboards and audit.

### Temple-level capabilities

- Temple profile and contact information.
- Darshan and operating schedules.
- Facilities and amenities.
- Priest and staff directory.
- Temple designations and office bearers.
- Temple-local roles and permissions.
- Seva and Pooja master.
- Devotee booking calendar.
- Transactions and receipts.
- Priest scheduling.
- Prasadam dispatch.
- Organization chart and matrix reporting.
- Temple reports and settings.

### Cross-cutting capabilities

- Authentication and MFA.
- Organization context selector.
- Dynamic authorization.
- Audit logs.
- Notifications.
- File and image storage.
- CSV/PDF exports.
- Background jobs.
- Monitoring and support tooling.

---

## 7. Core Product Concepts

### Trust as tenant

A Trust is the initial technical tenant. Trust-owned data must be isolated from every other Trust.

```text
tenant_id = trust_id
```

### Temple as child organization

A Temple belongs to exactly one Trust. A Temple is a scope of operation and authorization, not a separate SaaS tenant by default.

### Designation versus role

```text
Designation = official or organizational title
Office bearer = appointment of a person to a designation
Role = configurable software access bundle
Permission = individual software capability
```

Example:

```text
Designation: Treasurer
Role: Trust Finance Reviewer
Permissions: transaction.read, report.export
```

A designation does not grant access unless an explicit designation-to-role binding is configured.

### Dynamic roles and permissions

Administrators can define custom names and permission sets. The system must not require platform-defined business roles.

A permission still needs an enforceable backend capability. An administrator may configure who can perform an action, but the application module must implement the action and authorization check.

---

## 8. User Journeys

### Journey 1: Trust onboarding

1. Trust is created through secure onboarding.
2. Initial creator receives an expiring bootstrap management grant.
3. Trust profile and settings are completed.
4. Temples are created.
5. Members are invited.
6. Trust designations and office bearers are configured.
7. Custom roles and permissions are created.
8. Temple administrators are appointed.
9. Policies are published.
10. Trust becomes operational.

### Journey 2: User access

1. User authenticates.
2. System displays authorized Trusts.
3. User selects a Trust.
4. System displays authorized Temples and Trust-wide workspace options.
5. User enters a module.
6. API verifies the requested Trust and Temple context.
7. Authorization service evaluates the current permission configuration.
8. User sees only permitted data and actions.

### Journey 3: Create and allocate a role

1. Authorized administrator opens Roles.
2. Administrator creates a custom role name.
3. Administrator selects or defines enforceable permissions.
4. Administrator configures scope and conditions.
5. Administrator optionally selects an inheritable parent role.
6. System validates cycles, conflicts, and authority boundaries.
7. Administrator previews impacted users.
8. Policy is approved and published.
9. Role is assigned to one or more users or groups.
10. New access becomes effective and is audited.

### Journey 4: Manage a Seva booking

1. Temple administrator configures a Seva.
2. Booking operator selects a valid future date.
3. System verifies schedule and capacity.
4. Operator enters primary and additional pilgrim details.
5. Server calculates amount.
6. Booking is reserved transactionally.
7. Payment and receipt state are recorded.
8. Priest schedule and shipment workflow are updated as applicable.
9. Dashboard, reports, and audit reflect the operation.

### Journey 5: Trust oversight

1. Trust user enters the Trust dashboard.
2. System loads only authorized Temple aggregates.
3. User compares bookings, collections, Seva activity, shipments, and staffing.
4. User drills into a Temple only if scope permits.
5. User exports an authorized report.
6. Export is logged with scope and filter details.

### Journey 6: Revoke access

1. Trust or Temple administrator opens a user’s effective access.
2. Administrator revokes membership, assignment, delegation, or office-bearer binding.
3. System publishes a new policy version.
4. Cache invalidation events are emitted.
5. Existing sessions are rechecked for protected operations.
6. User is denied after the documented propagation window.
7. Audit records preserve actor, target, reason, and time.

---

## 9. Product Requirements by Epic

### EPIC-01 Identity and organization context

**Objective:** Allow users to authenticate and operate within the correct Trust and Temple context.

Requirements:

- Login and logout.
- Password recovery.
- MFA configuration.
- Session expiry and revocation.
- User profile.
- Trust selection.
- Temple selection.
- Membership status.
- Suspended Trust and Temple handling.
- Context visible in URL and workspace header.

Acceptance criteria:

- A user cannot select an unauthorized Trust.
- A user cannot access a Temple outside their effective scope.
- Changing the URL does not bypass context authorization.
- Business data is not stored in LocalStorage.

### EPIC-02 Trust and Temple management

**Objective:** Establish the multi-tenant hierarchy.

Requirements:

- Create and update Trust.
- Create, update, suspend, and archive Temples.
- Maintain Trust-to-Temple ownership.
- Support organization ancestry.
- Display Temple portfolio.
- Prevent cross-Trust Temple movement without approved migration.
- Support future organization-node types.

Acceptance criteria:

- One Trust can contain multiple Temples.
- Every Temple belongs to exactly one Trust.
- Trust A cannot see Trust B’s Temples.
- Temple suspension affects configured operations without deleting history.

### EPIC-03 Membership, staff, and office bearers

**Objective:** Represent people, staff, appointments, and terms accurately.

Requirements:

- Invite users.
- Create Trust and Temple memberships.
- Maintain staff and priest profiles.
- Create custom designations.
- Appoint office bearers.
- Support term dates, renewal, suspension, and expiry.
- Maintain historical assignments.
- Keep designation separate from role.

Acceptance criteria:

- The same user can have different roles in different Temples.
- A designation can exist without access.
- An office-bearer term can expire independently.
- Historical appointments remain reportable.

### EPIC-04 Dynamic governance and authorization

**Objective:** Give each Trust and Temple configurable control over application access.

Requirements:

- Permission definition and registry.
- Custom role creation.
- Role-permission binding.
- User and group assignments.
- Assignment expiry.
- Trust-level role scope.
- Temple-level role scope.
- Selected-Temple cascade.
- Role inheritance.
- Permission conditions.
- Explicit deny.
- Separation of duties.
- Delegation.
- Policy drafts and publication.
- Effective-access explanation.
- Access simulator.

Acceptance criteria:

- An administrator can create a role named anything required by the organization.
- A role can contain a custom permission set.
- Trust roles cascade only where configured.
- Temple roles cannot grant Trust authority by default.
- Inheritance cycles are rejected.
- Delegation cannot exceed the delegator’s authority.
- Every protected API enforces the permission server-side.

### EPIC-05 Temple masters

**Objective:** Configure the operating foundation of each Temple.

Requirements:

- Temple identity.
- Address and contact information.
- Website and map link.
- Temple photos and media.
- Darshan schedules.
- Weekend and seasonal timings.
- Special occasion schedules.
- Facilities and amenities.
- Configuration publication and history.

Acceptance criteria:

- Temples can have independent configurations.
- Only authorized users can publish changes.
- Published configuration is used by booking and public-facing workflows.

### EPIC-06 Priest and staff management

**Objective:** Maintain priest and staff information and availability.

Requirements:

- Priest directory.
- Specializations.
- Contact details.
- Duty status.
- Leave and availability.
- Temple assignment.
- Designation.
- Office-bearer link where applicable.
- Status history.
- Search and filters.

Acceptance criteria:

- Staff records are persistent.
- A priest cannot be assigned to a conflicting shift unless an authorized override exists.
- On-leave staff are not normally assignable.

### EPIC-07 Seva and Pooja management

**Objective:** Configure the services offered by each Temple.

Requirements:

- Seva name and category.
- Description and instructions.
- Price.
- Included persons.
- Extra-person charges.
- Capacity.
- Duration and reporting time.
- Daily schedule.
- Weekly days.
- Monthly and annual dates.
- Special dates.
- Date ranges.
- Draft, active, suspended, and retired states.

Acceptance criteria:

- Seva availability is validated server-side.
- Different Temples can configure the same-named Seva differently.
- Price and capacity are versioned or historically attributable for bookings.

### EPIC-08 Booking and pilgrim management

**Objective:** Manage Seva reservations and pilgrim information.

Requirements:

- Calendar and agenda views.
- Future-date validation.
- Primary devotee.
- Multiple pilgrims.
- Name, age, gender, gotra, nakshatra.
- Contact details.
- Price calculation.
- Capacity reservation.
- Booking status.
- Payment status.
- Cancellation and refund states.
- Booking search and filters.
- Booking history.

Acceptance criteria:

- Amount is calculated server-side.
- Concurrent requests cannot overbook capacity.
- Past dates are blocked by policy.
- Booking status changes are audited.
- Unauthorized Temple users cannot view or edit the booking.

### EPIC-09 Finance and receipts

**Objective:** Provide accountable operational collection and receipt management.

Requirements:

- Transaction ledger.
- Payment method.
- Receipt number.
- Verification reference.
- Payment status.
- Refund and void workflow.
- Approval limits.
- Separation of duties.
- Thermal slip print.
- PDF receipt.
- CSV export.
- Financial filters and reports.

Acceptance criteria:

- Payment transitions require authorization.
- A user cannot approve their own transaction when policy prohibits it.
- Receipt and payment history cannot be silently deleted.
- Exports are permission-protected and audited.

### EPIC-10 Priest scheduling

**Objective:** Coordinate priest duty and Seva performance.

Requirements:

- Shift date and time.
- Seva link.
- Priest link.
- Availability check.
- Leave check.
- Conflict detection.
- Authorized override.
- Roster display.
- Schedule history.

### EPIC-11 Prasadam logistics

**Objective:** Fulfill eligible home-delivery orders.

Requirements:

- Shipment creation from booking.
- Recipient address.
- Package contents.
- Packing state.
- Shipping state.
- Tracking number.
- Bulk actions.
- Label printing.
- Failure, cancellation, and return states.
- Provider adapter.
- Shipment history.

Acceptance criteria:

- Shipment creation is idempotent.
- Bulk actions are authorized.
- Shipment history remains available after cancellation.
- Provider failures are retried and visible.

### EPIC-12 Organization chart and reporting

**Objective:** Represent management and matrix relationships visually and operationally.

Requirements:

- Primary reporting relationship.
- Matrix reporting relationship.
- Organization filtering.
- Staff search.
- Auto-layout.
- Export where authorized.
- Relationship history.
- Cycle validation for primary hierarchy where required.

### EPIC-13 Dashboards and reports

**Objective:** Give each user useful insight within authorized scope.

Requirements:

- Trust dashboard.
- Temple dashboard.
- Bookings KPI.
- Collections KPI.
- Seva trends.
- Shipment status.
- Priest roster summary.
- Daily, Seva, monthly, and yearly reports.
- Financial reports.
- Logistics reports.
- CSV/PDF export.
- Date and Temple filters.
- Async report jobs for large reports.

Acceptance criteria:

- Trust dashboards aggregate only authorized Temples.
- Temple dashboards cannot expose other Temples.
- Report exports are logged.
- Large report generation does not block normal requests.

### EPIC-14 Notifications and settings

**Objective:** Notify users and configure operational behavior.

Requirements:

- In-app notifications.
- Email and SMS adapters.
- Booking confirmations.
- Payment notifications.
- Roster reminders.
- Shipment notifications.
- End-of-day digests.
- Session timeout settings.
- MFA settings.
- Notification preferences.

### EPIC-15 Audit and administration

**Objective:** Make policy and operational activity accountable.

Requirements:

- Authentication events.
- Membership events.
- Designation and appointment events.
- Role and permission events.
- Delegation events.
- Financial events.
- Export events.
- Sensitive record access.
- Policy version.
- Actor and scope.
- Search and retention.
- Break-glass support audit.

---

## 10. Information Architecture

### Trust workspace

```text
Trust Dashboard
Trust Profile
Temples
Members
Designations
Office Bearers
Roles
Permissions
Assignments
Inheritance
Delegations
Reports
Audit Logs
Settings
```

### Temple workspace

```text
Temple Dashboard
Temple Information
Facilities
Priests
Seva Master
Bookings Calendar
Transactions
Receipts
Prasadam
Scheduling
Organization Chart
Reports
Settings
```

### Context display

Every page should clearly display:

```text
Trust: Sri Example Trust
Temple: Sri Example Temple
User: Ravi Kumar
Designation: Treasurer
```

The interface must not imply that the displayed designation is the source of access.

---

## 11. UX Requirements

### Existing design preservation

Retain useful parts of the current product experience:

- Sacred saffron, gold, vermilion, ivory, emerald, and blue visual language.
- Responsive sidebar and mobile drawer.
- Bento dashboard cards.
- Tables with sorting, filters, and pagination.
- Modal and drawer editing patterns.
- Calendar and agenda views.
- React Flow and Dagre organization graph.
- Thermal receipt intent.
- Toast notifications.
- Responsive empty and loading states.

### Required states on every data screen

- Loading.
- Empty.
- Error.
- Retry.
- Permission denied.
- Suspended Trust or Temple.
- Unsaved changes.
- Validation failure.
- Success.
- Stale or refreshing data.

### Administrative usability

- Show effective permissions before publishing policy.
- Show impacted users before changing a role.
- Show scope on every role assignment.
- Show expiry and approval state.
- Explain access denial in safe language.
- Confirm destructive actions with target and scope.
- Support keyboard operation and accessible labels.

---

## 12. Product Rules and Business Logic

### Tenant rules

- Trust is the initial tenant boundary.
- A Temple belongs to one Trust.
- Cross-Trust access is denied by default.
- Cross-Temple access requires explicit scope.
- Storage, cache, jobs, reports, and exports carry tenant context.

### Role and permission rules

- Roles are configurable data.
- Permissions are action capabilities.
- Designations do not grant access automatically.
- Trust role cascading is opt-in.
- Temple roles do not inherit upward.
- Role inheritance cannot contain cycles.
- Delegation is a subset of delegator authority.
- Deny by default.
- Explicit deny overrides an applicable allow.
- Expiry, suspension, and revocation remove effective access.

### Booking rules

- Booking date must satisfy Temple policy.
- Seva must be active and available.
- Capacity must be reserved transactionally.
- Price is calculated server-side.
- Booking state transitions are validated.
- Payment state transitions are separately authorized.

### Financial rules

- Financial records are attributable and historically preserved.
- Refund and void operations require explicit permission.
- Approval conditions may include amount, Temple, stage, MFA, and self-approval restrictions.
- Exports require permission and audit.

---

## 13. Product Metrics

### Adoption metrics

- Number of active Trusts.
- Number of active Temples.
- Trust onboarding completion rate.
- Active users per Trust.
- Weekly and monthly active administrators.
- Percentage of active Temples using backend persistence.

### Operational metrics

- Bookings created per Temple.
- Booking completion rate.
- Seva utilization.
- Payment completion and refund rates.
- Receipt generation success rate.
- Shipment fulfillment time.
- Scheduling conflicts prevented.
- Report generation success rate.

### Governance metrics

- Percentage of users with reviewed access.
- Number of unexpired temporary assignments.
- Delegation count and expiry compliance.
- Policy publication time.
- Unauthorized access attempts blocked.
- Audit event completeness.
- Cross-tenant isolation test results.

### Product quality metrics

- API error rate.
- p95 authorization latency.
- p95 dashboard load time.
- Availability.
- Support tickets per active Trust.
- Data reconciliation exceptions.

---

## 14. Release Plan

### Release 0 — Foundation

Goal: establish production-ready tenancy and persistence.

- Repository assessment.
- Database migrations.
- Trust and Temple entities.
- User and membership model.
- Authentication adapter.
- Tenant context.
- Basic audit.
- Backend repository layer.

Exit criteria:

- Two Trusts and multiple Temples can coexist.
- Data persists after refresh.
- Cross-tenant tests pass.

### Release 1 — Core Temple operations

Goal: migrate the existing Temple workflows.

- Temple information.
- Facilities.
- Priest Master.
- Seva Master.
- Booking calendar.
- Transactions.
- Receipts.
- Temple dashboard.

Exit criteria:

- One Temple can operate end-to-end using backend data.
- Two Temples can operate independently.

### Release 2 — Dynamic governance

Goal: enable Trust and Temple-configurable access.

- Designations.
- Office bearers.
- Permission registry.
- Role builder.
- Role assignments.
- Inheritance.
- Cascading.
- Delegation.
- Access simulator.
- Audit and policy versions.

Exit criteria:

- A Trust can define its own governance without code changes.
- Temple admins are restricted to their delegated scope.

### Release 3 — Logistics and reporting

Goal: complete operational workflows.

- Priest scheduling.
- Organization chart.
- Prasadam logistics.
- Notifications.
- Trust dashboards.
- Reports and exports.

### Release 4 — Enterprise readiness

Goal: harden for larger Trusts.

- Row-Level Security.
- Authorization cache.
- Outbox and jobs.
- Load testing.
- Backup and restore.
- Bridge or dedicated tenant routing.
- Advanced audit and access review.

---

## 15. Prioritization

### P0 — Must have

- Trust and Temple hierarchy.
- Authentication and tenant context.
- User memberships.
- Database persistence.
- Tenant isolation.
- Dynamic roles and permissions.
- Permission enforcement on APIs.
- Temple profile.
- Priest Master.
- Seva Master.
- Bookings.
- Transactions and receipts.
- Audit for sensitive actions.

### P1 — Should have

- Office bearers and terms.
- Designation-role bindings.
- Trust dashboard.
- Priest scheduling.
- Prasadam logistics.
- Reports and exports.
- Delegation.
- Access simulator.
- Notifications.
- Organization chart persistence.

### P2 — Could have

- Public devotee portal.
- Payment-provider adapters.
- Trust Seva templates.
- Advanced workflow builder.
- Multi-language interface.
- Dedicated tenant deployment tiers.
- Mobile application.
- Advanced analytics.

### Not planned for initial release

- Full ERP/accounting replacement.
- Automated legal verification.
- AI-driven ritual decisions.
- Unrestricted arbitrary code-based policies.

---

## 16. Dependencies

### Product dependencies

- Confirmation of target payment providers.
- Notification provider decisions.
- Data retention and export policies.
- Trust and Temple approval workflows.
- Required languages.
- Public booking decision.
- Financial reporting requirements.

### Technical dependencies

- PostgreSQL environment.
- Authentication provider.
- Object storage.
- Email and SMS providers.
- PDF and receipt rendering.
- Queue or background-job provider.
- Monitoring and error tracking.
- Deployment and backup environment.

### Organizational dependencies

- Product owner approval of permission semantics.
- Representative Trust/Temple users for usability validation.
- Finance stakeholder validation.
- Security review.
- Data migration ownership.

---

## 17. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Dynamic policy becomes confusing | Effective-access explanation, previews, versioning, safe condition language, clear scope labels |
| Cross-tenant data leakage | Tenant-aware repositories, database constraints, RLS, storage prefixes, isolation tests |
| Existing UI remains coupled to LocalStorage | Repository interfaces and phased migration |
| Too many features delay launch | P0/P1/P2 prioritization and vertical-slice delivery |
| Financial inconsistency | Transactional updates, idempotency, immutable history, reconciliation |
| Designation and role confusion | Separate entities and explicit UI terminology |
| Permission revocation is delayed | Policy versions, event invalidation, synchronous checks for sensitive actions |
| Overengineering | Modular monolith first; extract services only when justified |
| Poor user adoption | Preserve familiar workflows, responsive UX, pilot with representative Temples |

---

## 18. Analytics and Event Taxonomy

Track product events without storing unnecessary sensitive data.

```text
trust_created
temple_created
user_invited
membership_activated
role_created
permission_created
role_assigned
policy_published
office_bearer_appointed
seva_created
booking_created
payment_recorded
receipt_generated
shift_assigned
shipment_created
shipment_shipped
report_generated
report_exported
authorization_denied
```

Each event should include:

- Event name.
- Trust ID.
- Optional Temple ID.
- Actor ID where applicable.
- Timestamp.
- Request ID.
- Product version.
- Non-sensitive properties.

Do not place passwords, tokens, full payment secrets, or unnecessary personal data in analytics events.

---

## 19. Acceptance Criteria for Product Pilot

The product is ready for a controlled pilot when:

1. A new Trust can be onboarded without engineering intervention.
2. A Trust can create multiple Temples.
3. Users can belong to multiple Trusts with independent memberships.
4. A Trust can define custom designations and office bearers.
5. A Trust can create custom roles and permissions.
6. A Temple can create local roles within delegated boundaries.
7. Trust roles can cascade to selected Temples.
8. Role inheritance cycles are rejected.
9. Delegation cannot exceed the delegator’s effective authority.
10. Existing Temple operations use backend persistence.
11. A complete booking-to-receipt workflow works.
12. Priest scheduling prevents conflicts server-side.
13. Prasadam workflow works for eligible bookings.
14. Reports and exports apply authorization scope.
15. Cross-Trust and cross-Temple isolation tests pass.
16. Revoked access is blocked within the documented window.
17. Sensitive actions create audit events.
18. No production business data depends on LocalStorage.
19. Backup and restore have been tested.
20. Pilot users approve the core workflows.

---

## 20. Open Product Decisions

The following require stakeholder confirmation before final release planning:

- Will the first release support public devotee booking or only internal booking entry?
- Which payment providers and payment states are required?
- Is full accounting integration required, or only operational collections?
- Which notification channels are mandatory?
- Which Indian languages are required in the first release?
- What are the data retention periods for pilgrim, financial, shipment, and audit records?
- Which Trust operations require two-person approval?
- Can Trust administrators create arbitrary permission definitions, or only configure module-registered capabilities?
- What is the required RPO and RTO?
- Which Trusts, if any, require dedicated storage or infrastructure?
- What is the official policy for moving a Temple between Trusts?
- What information may platform support staff access during break-glass support?

---

## 21. Product Owner Sign-Off

| Area | Owner | Status | Date |
|---|---|---|---|
| Product vision and scope |  | Pending |  |
| Trust and Temple hierarchy |  | Pending |  |
| Dynamic governance model |  | Pending |  |
| Core Temple operations |  | Pending |  |
| Finance and payment scope |  | Pending |  |
| Data retention and privacy |  | Pending |  |
| Release priorities |  | Pending |  |
| Pilot readiness |  | Pending |  |

---

## 22. Relationship to Other Documents

- **BRD:** Defines business goals, stakeholders, scope, risks, and business outcomes.
- **SRS:** Defines technical, functional, data, API, security, and non-functional requirements.
- **This PRD:** Defines product vision, user problems, personas, user journeys, priorities, epics, UX outcomes, release strategy, metrics, and product acceptance.
- **Coding-Agent Implementation Specification:** Converts the approved product and technical requirements into implementation instructions, task sequencing, coding rules, migrations, tests, and completion criteria.

The coding agent must use all approved documents together and must escalate conflicts through `docs/implementation-decisions.md` rather than silently selecting a behavior.

---

## End of Product Requirements Document
