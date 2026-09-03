SANKALPVANI

Trust & Temple Management Platform

Business Requirements Document (BRD)

and

Software Requirements Specification (SRS)



| Document field | Value |

| --- | --- |

| Document version | 1.0 |

| Date | 31 August 2026 |

| Status | Baseline for architecture, database, and implementation planning |

| Product baseline | SankalpVani Admin Portal / sankalpvani-admin-v1.0 |

| Primary platform | Multi-tenant Trust and Temple management SaaS |

| Prepared for | Product, engineering, operations, and stakeholder review |



Purpose: This document consolidates the current temple-focused functionality with the approved Trust-as-tenant, Temple-as-child-organization, and dynamic role/permission architecture. It is intended to be used as the baseline for product scope, database design, API contracts, UI implementation, testing, and phased delivery.

Document Structure



| Part | Contents |

| --- | --- |

| A. BRD | Business context, goals, stakeholders, scope, workflows, success measures, risks, and roadmap |

| B. SRS | Functional requirements, data model, APIs, authorization, UI, integrations, non-functional requirements, and test criteria |

| C. Appendices | Permission catalog pattern, state models, traceability, assumptions, and glossary |



Part A — Business Requirements Document

A1. Executive Summary

SankalpVani is a multi-tenant Trust and Temple Management Platform for Devasthanam and temple organizations. A Trust is the tenant and policy root. Each Trust can contain multiple Temples, each with its own operational configuration, staff, office bearers, designations, roles, permissions, bookings, transactions, schedules, documents, and reports.

The product evolves the existing Temple Administration Portal into a scalable organizational platform. The current frontend already covers dashboard analytics, Temple masters, priest registry, Seva and Pooja configuration, booking calendar, transaction ledger, receipts, priest scheduling, prasadam logistics, an organization chart, reports, settings, and local prototype persistence. These capabilities are retained and reorganized under Trust and Temple contexts. [Source baseline: current project analysis report.]

The system will not impose predefined business roles. Authorized Trust and Temple administrators will create custom roles, define or select enforceable permissions, configure scope and conditions, allocate roles to users, and control inheritance, cascading, delegation, and expiry.

A2. Business Problem

The existing product is designed around one Temple and one administrative account, which limits deployment to larger Devasthanams, Trusts with multiple Temples, and organizations requiring differentiated access.

Prototype LocalStorage persistence is unsuitable as the system of record for financial transactions, user identity, operational schedules, or audit history.

A free-text designation or global role cannot accurately represent legal appointments, operational responsibilities, temporary duties, and Temple-specific access.

Trust administrators require oversight across Temples, while Temple administrators require local control without accidentally accessing another Temple or modifying Trust policy.

Reports, documents, background jobs, cache entries, and exports must be isolated by tenant as well as by Temple scope.

A3. Business Objectives



| ID | Objective | Measure of success |

| --- | --- | --- |

| BO-01 | Support multiple independent Trust tenants | Trust A cannot access Trust B data, files, reports, or policy |

| BO-02 | Support multi-Temple Trusts | One Trust can create, operate, report on, and authorize multiple Temples |

| BO-03 | Enable configurable governance | Administrators can create designations, roles, permissions, assignments, cascades, and delegation without code changes |

| BO-04 | Digitize Temple operations | Priests, Sevas, bookings, payments, scheduling, prasadam, documents, and reports use authoritative backend data |

| BO-05 | Improve accountability | Every sensitive access and policy change is attributable, timestamped, and reviewable |

| BO-06 | Provide an extensible foundation | New operational modules can register enforceable permissions and use the same tenant and policy services |

| BO-07 | Preserve current product value | Existing UI patterns and functional modules are migrated rather than discarded |



A4. Stakeholders and Personas



| Persona | Business responsibility | Typical system needs |

| --- | --- | --- |

| Trust governance member | Oversight of the Trust and its Temples | Trust profile, Temple portfolio, office bearers, reports, audit |

| Trust policy administrator | Defines Trust governance and delegated authority | Roles, permissions, designations, assignments, cascades, delegation |

| Temple administrator | Runs one Temple or an authorized set of Temples | Temple masters, staff, Sevas, bookings, schedules, reports |

| Priest / Acharya / Pujari | Performs or coordinates rituals and duty schedules | Roster, assigned Sevas, status, shift information |

| Finance operator | Records or reviews collections and payments | Transactions, receipts, approvals, exports, reconciliation |

| Operations/logistics operator | Manages Prasadam fulfillment | Shipment queue, packing, labels, tracking, status |

| Report viewer / auditor | Reviews activity without operational write access | Dashboards, reports, exports, audit events |

| Devotee / pilgrim | Books Seva or receives service communications | Booking, pilgrim details, payment status, receipt, delivery status |

| Platform operator | Operates the SaaS infrastructure | Tenant onboarding, health, deployment routing, support with audited break-glass |



A5. Product Scope

In scope

Multi-tenant Trust management with Trust-to-Temple hierarchy.

User identity, Trust membership, Temple membership, invitations, suspension, and session context.

Trust and Temple designations, office-bearer appointments, terms, and optional designation-to-role binding.

Fully configurable roles, permissions, role assignment, inheritance, Trust-to-Temple cascading, constraints, and delegation.

Temple information, facilities, priests, Seva and Pooja master, darshan schedules, bookings calendar, transactions, receipts, prasadam logistics, staff scheduling, organization chart, reports, notifications, and settings.

Tenant-aware API, PostgreSQL persistence, object storage, audit logging, background jobs, cache invalidation, and operational monitoring.

Migration from current LocalStorage prototype data structures into backend repositories and APIs.

Out of scope for baseline release

Full accounting or statutory ledger replacement beyond operational collections and transaction tracking.

Native payment-gateway settlement reconciliation for every provider; provider integration is extensible but not assumed.

Automated legal verification of Trust registration or office-bearer appointments.

Automatic religious or ritual decision-making by AI.

Public devotee marketplace and multi-language public booking portal unless separately approved.

Separate database or application deployment for every Trust in the first release.

A6. Business Workflows

Trust onboarding

Platform operator or approved onboarding workflow creates a Trust tenant.

Initial Trust creator is provisioned with a one-time bootstrap management grant.

The Trust creator configures Trust identity, designations, office bearers, policies, and administrative roles.

The Trust creates one or more Temples and invites members.

Temple administrators are appointed through scoped role assignments.

The Trust publishes policies and begins operational use.

User and office-bearer lifecycle

Invite or identify a user.

Create Trust or Temple membership.

Optionally appoint the user as an office bearer under a designation.

Assign one or more roles with scope, conditions, validity, and approval.

Review effective access through policy simulation.

Suspend, revoke, or allow expiry of membership, appointment, delegation, or role assignment.

Seva booking to fulfillment

Temple administrator configures Seva, schedule, capacity, pricing, instructions, and availability.

Authorized operator creates or receives a booking for a future date.

System validates date, capacity, pilgrim information, and price calculation.

Payment and receipt status are recorded.

Priest duty roster is assigned without leave or overlap conflicts.

If home delivery is selected, a shipment is created or queued.

Receipt, notification, fulfillment, and reporting events are audited.

Policy change

Authorized administrator drafts a role, permission, assignment, or inheritance change.

System validates scope, cycles, conflicts, delegation limits, and affected resources.

Administrator previews affected users and permissions.

Required approvers approve the change.

System publishes a new policy version and emits invalidation events.

All subsequent authorization decisions use the new policy version.

A7. Success Measures and KPIs



| Metric | Target direction | Measurement |

| --- | --- | --- |

| Tenant isolation incidents | Zero | Security tests, audit, incident management |

| Unauthorized write attempts blocked | 100% of tested cases | API authorization test suite |

| Policy change propagation | Near real time | Time from publish to cache invalidation |

| Booking creation reliability | High availability | Successful transaction rate and error rate |

| Report data correctness | Reconciled | Comparison with transactional source and approved snapshots |

| User onboarding completion | Improving | Invited user to active membership conversion |

| Administrative support effort | Decreasing | Requests requiring engineering changes for role configuration |

| Audit completeness | 100% for sensitive operations | Required event fields and immutable storage checks |



A8. Business Risks and Mitigations



| Risk | Impact | Mitigation |

| --- | --- | --- |

| Tenant data leakage | Critical | Direct trust_id on tables, server-side scope checks, RLS, isolation tests, tenant-aware storage/cache |

| Privilege escalation through dynamic roles | Critical | Subset delegation rule, deny default, approval workflow, policy simulation, audit |

| Prototype assumptions remain in APIs | High | Stop feature growth on LocalStorage; define database and repository contracts first |

| Complex policy becomes unmanageable | High | Effective-access explanation, versioning, templates optional, no cycles, safe condition DSL |

| Financial data inconsistency | High | Immutable transaction events, idempotency, approval states, reconciliation, no destructive deletion |

| Overengineering too early | Medium | Modular monolith first; extract services only when scale or ownership requires |

| Role/title confusion | Medium | Separate designation, office bearer, role, and permission entities |



A9. Delivery Strategy



| Release | Business outcome | Primary scope |

| --- | --- | --- |

| R0 Foundation | Reliable tenant-ready platform base | Database, Trust/Temple, identity, memberships, API, audit, repository migration |

| R1 Temple operations | Backend-powered existing product | Temple masters, priests, Sevas, bookings, transactions, receipts, dashboard |

| R2 Governance | Dynamic authorization | Custom roles, permissions, designations, assignments, inheritance, cascade, delegation |

| R3 Logistics and reporting | Operational completeness | Scheduling, prasadam, reports, exports, notifications, organization chart |

| R4 Enterprise readiness | Scale and assurance | RLS, cache invalidation, policy service, DR, security testing, bridge/silo routing |



Part B — Software Requirements Specification

B1. System Overview

The system is a tenant-aware web and mobile-compatible platform with a shared application plane and Trust-scoped data. The existing client baseline uses Next.js App Router, React, TypeScript, Tailwind, motion components, React Flow, Dagre, and LocalStorage prototype persistence. The target system retains the frontend technology while replacing business-data LocalStorage with authenticated API access and a transactional database.

The backend may initially be implemented as a modular monolith. Internal modules must have clear boundaries so that authorization, reporting, notifications, or high-volume workloads can later be extracted without redesigning the domain model.

B2. Architectural Principles

Trust is the tenant and primary data-isolation boundary.

Temple is a child organization and authorization scope, not a separate tenant by default.

Users are global identities; memberships and assignments are scoped.

Designation describes organizational or legal appointment; role controls software access; permission describes an individual capability.

No predefined business roles are required. Roles are created by authorized administrators.

Authorization is enforced by backend Policy Enforcement Points, not only by frontend visibility.

All protected data is deny-by-default and tenant-scoped.

Operational records are appendable, auditable, and status-driven; sensitive records are not hard-deleted without retention policy.

Configuration is versioned and changes are attributable, reviewable, and reversible.

The database is the system of record; client storage is limited to UI preferences and drafts.

B3. Context and Deployment Architecture

The initial deployment is a pooled multi-tenant architecture: shared frontend, shared backend, shared PostgreSQL, shared cache, shared object storage, and Trust-scoped rows and policies. The design supports bridge or silo isolation tiers later through tenant routing.

Logical component diagram

• Web / mobile clients → CDN/WAF → API Gateway/BFF

• API Gateway → Authentication and tenant-context middleware

• Middleware → modular application backend and Policy Enforcement Points

• PEPs → Authorization PDP/PIP/PAP services

• Application modules → PostgreSQL, object storage, cache, queue/event bus

• Outbox/events → notifications, analytics, search, cache invalidation, audit processing

• Operations → metrics, logs, traces, backups, alerts, deployment control plane

B4. Functional Requirements

FR-01 Identity and Authentication



| ID | Requirement |

| --- | --- |

| FR-01-01 | The system shall create or link a global User identity to an external identity provider or approved authentication mechanism. |

| FR-01-02 | The system shall support login, logout, session expiry, refresh, password recovery, and account suspension. |

| FR-01-03 | The system shall support MFA configuration for administrators and sensitive operations. |

| FR-01-04 | The system shall never use LocalStorage as the authoritative store for credentials, tokens, or authorization state. |

| FR-01-05 | The system shall allow a user to select an authorized Trust and, where applicable, an authorized Temple context after login. |

| FR-01-06 | The system shall prevent a user from selecting a Trust or Temple for which no active membership or explicit grant exists. |



FR-02 Trust and Tenant Management



| ID | Requirement |

| --- | --- |

| FR-02-01 | The system shall create a Trust tenant with unique identity, legal, contact, status, and configuration data. |

| FR-02-02 | The system shall assign a tenant identifier to every Trust-owned record. |

| FR-02-03 | The system shall isolate Trust data, policies, files, cache entries, queues, reports, and exports. |

| FR-02-04 | The system shall support Trust status values such as draft, active, suspended, archived, and deleted/retained. |

| FR-02-05 | The system shall support tenant onboarding, configuration, activation, suspension, and archival workflows. |

| FR-02-06 | The system shall support tenant deployment routing for future pooled, bridge, or dedicated isolation tiers. |



FR-03 Temple and Organization Hierarchy



| ID | Requirement |

| --- | --- |

| FR-03-01 | The system shall allow a Trust to create and manage multiple Temples. |

| FR-03-02 | Each Temple shall belong to exactly one Trust. |

| FR-03-03 | The system shall represent the Trust-Temple relationship using a generic organization-node model extensible to future child entities. |

| FR-03-04 | The system shall support organization ancestry and descendant queries. |

| FR-03-05 | The system shall prevent a Temple from being moved across Trusts without an approved migration workflow. |

| FR-03-06 | The system shall allow users to switch among authorized Temples without changing their global identity. |

| FR-03-07 | The system shall display current Trust and Temple context in navigation and relevant forms. |



FR-04 User Membership and Staff



| ID | Requirement |

| --- | --- |

| FR-04-01 | The system shall invite users to a Trust and track invitation, active, suspended, expired, and revoked states. |

| FR-04-02 | The system shall support direct Temple membership in addition to Trust membership. |

| FR-04-03 | The system shall maintain staff profiles, priest profiles, specializations, contact details, and duty status. |

| FR-04-04 | The system shall support a user having different assignments in different Trusts or Temples. |

| FR-04-05 | The system shall retain historical membership and staff status changes. |



FR-05 Designations and Office Bearers



| ID | Requirement |

| --- | --- |

| FR-05-01 | Authorized administrators shall create custom Trust and Temple designations. |

| FR-05-02 | The system shall record office-bearer appointments with user, designation, scope, term, status, and appointing authority. |

| FR-05-03 | The system shall support term start, term end, renewal, suspension, and historical appointment records. |

| FR-05-04 | Designation shall not automatically grant access unless an explicit designation-to-role binding is configured. |

| FR-05-05 | The system shall optionally bind a designation to one or more roles with approval and validity settings. |

| FR-05-06 | The system shall distinguish designation values from role and permission values in the UI and database. |



FR-06 Dynamic Roles and Permissions



| ID | Requirement |

| --- | --- |

| FR-06-01 | Authorized Trust and Temple administrators shall create custom role names and descriptions. |

| FR-06-02 | Authorized administrators shall define or register enforceable permissions using namespace, resource type, action, description, scope, and condition metadata. |

| FR-06-03 | The system shall allow a role to contain multiple allow and deny grants. |

| FR-06-04 | The system shall support role assignment to users, groups, designations, or approved delegates. |

| FR-06-05 | The system shall support exact, Trust-only, all-descendant, selected-descendant, direct-child, relationship, and validated custom scopes. |

| FR-06-06 | The system shall prevent a role from inheriting itself directly or indirectly. |

| FR-06-07 | The system shall show effective permissions, inherited permissions, source scope, conditions, and expiry. |

| FR-06-08 | The system shall support policy draft, validate, preview, approve, publish, activate, retire, and rollback states. |

| FR-06-09 | The system shall not require a predefined business role such as Admin, Treasurer, Trustee, or Priest Admin. |

| FR-06-10 | Permission definitions without a backend enforcement point shall be marked as inactive, informational, or unavailable for assignment. |



FR-07 Inheritance, Cascading, and Delegation



| ID | Requirement |

| --- | --- |

| FR-07-01 | A Trust role may cascade to all or selected descendant Temples only when explicitly configured. |

| FR-07-02 | A Temple role shall not inherit upward to Trust scope by default. |

| FR-07-03 | A Temple may inherit an exposed Trust role only when the Trust enables such inheritance. |

| FR-07-04 | Delegation shall be constrained to a subset of the delegator’s effective permissions, resources, scope, and validity period. |

| FR-07-05 | Delegation may be marked non-redelegable or redelegable. |

| FR-07-06 | The system shall support approval for privilege-management delegation and sensitive role assignments. |

| FR-07-07 | The system shall invalidate relevant authorization caches after policy changes and revocation. |

| FR-07-08 | The system shall produce an explanation of why a permission was granted or denied. |



FR-08 Temple Information and Facilities



| ID | Requirement |

| --- | --- |

| FR-08-01 | The system shall manage Temple identity, address, contacts, web links, map links, and media. |

| FR-08-02 | The system shall manage normal-day, weekend, seasonal, and special-occasion darshan schedules. |

| FR-08-03 | The system shall manage configurable facilities such as accommodation, dining, water, restrooms, function hall, private pooja, and prasadam counter. |

| FR-08-04 | The system shall retain configuration publication status and change history. |

| FR-08-05 | Temple media shall be tenant- and Temple-scoped in object storage. |



FR-09 Priest Master and Scheduling



| ID | Requirement |

| --- | --- |

| FR-09-01 | The system shall maintain priest profiles, specializations, contact information, and active duty status. |

| FR-09-02 | The system shall support active, duty-assigned, on-leave, suspended, and inactive status states. |

| FR-09-03 | The system shall create shifts linked to Temple, date, time slot, Seva, and assigned staff. |

| FR-09-04 | The system shall prevent concurrent shift assignment for the same priest unless an authorized override is recorded. |

| FR-09-05 | The system shall prevent assignment of staff marked unavailable or on leave unless an approved override is used. |

| FR-09-06 | The system shall support primary reporting and matrix reporting relationships for the organization chart. |



FR-10 Seva and Pooja Master



| ID | Requirement |

| --- | --- |

| FR-10-01 | The system shall create and manage Temple-owned Sevas and Poojas. |

| FR-10-02 | The system shall support daily, weekly, monthly, annual, special-date, and date-range availability rules. |

| FR-10-03 | The system shall support duration, performance time, price, capacity, base persons, extra-person pricing, description, and instructions. |

| FR-10-04 | The system shall support active, suspended, draft, and retired Seva states. |

| FR-10-05 | The system shall validate Seva availability against schedule, date, capacity, and status. |

| FR-10-06 | The system may support Trust-level Seva templates that are copied or linked into Temple-local Seva configurations in a later release. |



FR-11 Devotee Booking and Calendar



| ID | Requirement |

| --- | --- |

| FR-11-01 | The system shall create bookings for authorized future dates according to Temple policy. |

| FR-11-02 | The system shall prevent bookings for past dates unless a separately authorized historical-entry workflow exists. |

| FR-11-03 | The system shall capture primary and additional pilgrims, age, gender, gotra, nakshatra, contact, and applicable metadata. |

| FR-11-04 | The system shall calculate price using base price, included persons, extra-person charges, discounts, and taxes where configured. |

| FR-11-05 | The system shall enforce capacity and prevent race-condition overbooking through transactional reservation logic. |

| FR-11-06 | The system shall support calendar, agenda, search, filtering, status updates, and booking history. |

| FR-11-07 | The system shall maintain booking status history and actor information. |

| FR-11-08 | The system shall support paid, pending, refunded, cancelled, completed, and no-show states as configured. |



FR-12 Transactions, Receipts, and Finance



| ID | Requirement |

| --- | --- |

| FR-12-01 | The system shall record transaction and payment details linked to Trust, Temple, booking, and receipt. |

| FR-12-02 | The system shall support receipt number, verification reference, amount, method, status, and timestamps. |

| FR-12-03 | The system shall provide authorized ledger search, filter, sort, pagination, and export. |

| FR-12-04 | The system shall support receipt print and PDF generation using Temple configuration. |

| FR-12-05 | The system shall protect payment approval with configurable permissions, limits, MFA, and separation-of-duty rules. |

| FR-12-06 | The system shall not permit unauthorized users to change payment status through a client-only control. |



FR-13 Prasadam and Logistics



| ID | Requirement |

| --- | --- |

| FR-13-01 | The system shall create shipment records for eligible home-delivery bookings. |

| FR-13-02 | The system shall store recipient, address, contact, package, contents, tracking, and status history. |

| FR-13-03 | The system shall support pending, packed, shipped, delivered, failed, cancelled, and returned states. |

| FR-13-04 | The system shall support authorized bulk print, pack, ship, and cancellation actions with per-item audit. |

| FR-13-05 | The system shall prevent a shipment from being processed outside the user’s Trust and Temple scope. |

| FR-13-06 | Shipping-provider integration shall be abstracted behind a provider interface. |



FR-14 Dashboards, Reports, and Exports



| ID | Requirement |

| --- | --- |

| FR-14-01 | The system shall provide Trust dashboards with authorized aggregated Temple metrics. |

| FR-14-02 | The system shall provide Temple dashboards with Temple-scoped metrics. |

| FR-14-03 | The system shall support daily, Seva, monthly, yearly, financial, booking, logistics, and operational reports. |

| FR-14-04 | Reports shall apply the same authorization scope as the underlying records. |

| FR-14-05 | Exports shall be permission-protected, tenant-scoped, logged, and rate-limited. |

| FR-14-06 | Long-running reports shall execute asynchronously and notify the requester when ready. |

| FR-14-07 | Report snapshots shall identify their policy/data version and generation time. |



FR-15 Notifications and Integrations



| ID | Requirement |

| --- | --- |

| FR-15-01 | The system shall provide configurable SMS, email, and in-app notification preferences. |

| FR-15-02 | The system shall support booking, payment, roster, shipment, and administrative notifications. |

| FR-15-03 | Notification jobs shall include Trust and Temple context and shall be idempotent. |

| FR-15-04 | External integrations shall use stored credentials, tenant-specific configuration, retries, timeout, and audit metadata. |

| FR-15-05 | The system shall not expose provider secrets to the client. |



FR-16 Audit and Compliance



| ID | Requirement |

| --- | --- |

| FR-16-01 | The system shall audit authentication, membership, role, permission, designation, delegation, financial, export, and sensitive-record events. |

| FR-16-02 | Audit events shall contain actor, tenant, scope, action, target, outcome, timestamp, request ID, and policy version. |

| FR-16-03 | Audit records shall be append-only to ordinary tenant administrators. |

| FR-16-04 | The system shall provide authorized audit search and export. |

| FR-16-05 | Break-glass platform support shall require reason, approval or incident reference, time limit, and audit trail. |



B5. Permission Model Specification

Permission evaluation shall use the tuple subject, tenant, action, resource, organization scope, and request context. The system shall calculate effective grants from direct assignments, role inheritance, Trust-to-Temple cascades, designation bindings, and valid delegations, then apply expiry, suspension, explicit deny, and constraints.



| Policy element | Specification |

| --- | --- |

| Permission key | Namespaced identifier such as temple.finance.donation.approve |

| Resource type | Entity protected by the permission, such as donation, temple, report, or role |

| Action | Operation such as read, create, update, approve, export, assign, or manage |

| Scope | Exact, Trust-only, all descendants, selected descendants, direct children, relationship, or validated selector |

| Condition | Restricted expression over approved attributes, such as amount <= 50000 or MFA present |

| Effect | Allow or deny; deny resolution is explicit and auditable |

| Validity | Effective date, expiry, suspension, revocation |

| Approval | Optional required approvers, two-person approval, or workflow |



B6. Data Model

Primary entities



| Entity | Key relationships | Notes |

| --- | --- | --- |

| Tenant / Trust | One Trust is one initial technical tenant | Optional customer-account layer may be added later |

| Temple | Temple belongs to one Trust | Child organization and authorization scope |

| OrganizationNode | Parent/child hierarchy | Supports future branches, offices, committees, or schools |

| User | Global identity | No global business role |

| Membership | User ↔ Trust or Temple | Active, suspended, expired, revoked |

| Designation | Scoped title | Does not imply access by itself |

| OfficeBearer | User + designation + scope + term | Appointment history |

| PermissionDefinition | Action on resource | Must map to an enforceable backend capability |

| Role | Scoped bundle of grants | Custom name, inheritance, version |

| RoleAssignment | Subject + role + scope | Validity, source, constraints |

| DelegationGrant | Delegator + delegatee + subset scope | Expiry and approval |

| Operational record | Trust + optional Temple ownership | Bookings, payments, Sevas, shipments, etc. |

| AuditEvent | Actor + target + tenant + policy version | Append-only history |



Minimum relational schema

trust(id, tenant_id, legal_name, registration_number, address_json, status, created_at, updated_at)

temple(id, trust_id, code, name, address_json, location_json, status, created_at, updated_at)

organization_node(id, trust_id, parent_id, node_type, name, materialized_path, hierarchy_version)

user(id, identity_provider_id, name, email, mobile, status, mfa_enabled, created_at)

trust_membership(id, trust_id, user_id, status, valid_from, valid_until)

temple_membership(id, trust_id, temple_id, user_id, status, valid_from, valid_until)

designation(id, trust_id, scope_type, scope_id, name, description, status)

office_bearer(id, trust_id, scope_id, user_id, designation_id, term_start, term_end, status)

permission_definition(id, trust_id, namespace, resource_type, action, condition_schema, status, version)

role(id, trust_id, scope_type, scope_id, name, role_key, version, is_inheritable, status)

role_permission(role_id, permission_id, effect, scope_mode, scope_selector_json, condition_expression, valid_from, valid_until)

role_inheritance(parent_role_id, child_role_id, inheritance_mode, status)

role_assignment(id, trust_id, role_id, user_id, group_id, scope_id, source, status, valid_from, valid_until)

delegation_grant(id, trust_id, delegator_user_id, delegatee_user_id, scope_id, permission_filter_json, resource_filter_json, can_redelegate, approval_status, valid_until)

audit_event(id, trust_id, temple_id, actor_user_id, event_type, target_type, target_id, decision, policy_version, request_id, payload_json, created_at)

Data ownership rules

Every tenant-owned table shall contain trust_id, either directly or through a validated ownership relation.

Temple-owned tables shall contain both trust_id and temple_id.

Composite validation shall ensure temple.trust_id equals resource.trust_id.

Business identifiers must not be treated as tenant isolation; tenant filtering is mandatory.

Deleted records should generally be soft-deleted or retained according to policy; financial and audit records require immutable history.

Use database transactions for booking capacity, payment state changes, role publication, and revocation.

B7. API and Service Requirements



| Service / API | Responsibilities |

| --- | --- |

| Identity API | Login integration, sessions, MFA, user profile, account lifecycle |

| Tenant API | Trust onboarding, Trust settings, deployment routing |

| Organization API | Temples, hierarchy, ancestry, organization context |

| Membership API | Trust and Temple invitations, memberships, staff assignments |

| Governance API | Designations, office bearers, roles, permissions, assignments, inheritance |

| Authorization API | check, batch-check, list authorized objects, explain, policy version |

| Temple Operations API | Temple settings, facilities, Sevas, priests, schedules |

| Booking API | Availability, reservation, pilgrim details, status, cancellation |

| Finance API | Payments, receipts, transaction ledger, approvals, exports |

| Logistics API | Shipments, labels, tracking, status, bulk actions |

| Reporting API | Authorized dashboards, report jobs, snapshots, exports |

| Notification API | Templates, preferences, delivery jobs, provider adapters |

| Audit API | Events, search, retention, export, access review |



Representative endpoints



| Method | Endpoint | Purpose |

| --- | --- | --- |

| POST | /v1/trusts | Create Trust tenant |

| GET | /v1/trusts/{trustId}/temples | List authorized Temples |

| POST | /v1/trusts/{trustId}/temples | Create Temple |

| POST | /v1/scopes/{scopeId}/designations | Create scoped designation |

| POST | /v1/scopes/{scopeId}/permissions | Create permission definition |

| POST | /v1/scopes/{scopeId}/roles | Create role |

| POST | /v1/roles/{roleId}/permissions | Attach permission grant |

| POST | /v1/role-assignments | Assign role to subject |

| POST | /v1/delegations | Create delegation |

| POST | /v1/authorization/check | Evaluate one authorization request |

| POST | /v1/authorization/batch-check | Evaluate multiple requests |

| GET | /v1/authorization/explain | Explain effective access |

| POST | /v1/bookings | Create booking |

| POST | /v1/reports/jobs | Create authorized report job |



API behavior requirements

The server shall derive or validate Trust and Temple ownership from the requested resource.

The server shall not trust a client-provided tenant header as authority.

All mutating APIs shall validate authorization before persistence and again inside sensitive workflows where state may have changed.

All list APIs shall filter by effective authorized scope; object-level checks alone are insufficient.

Mutating APIs shall support idempotency keys where retries could duplicate bookings, payments, shipments, or notifications.

Responses shall not disclose the existence of unauthorized resources; use consistent not-found or forbidden behavior according to security policy.

Errors shall include a safe code, request ID, and actionable message without exposing secrets or policy internals.

B8. User Interface Requirements

Global workspace

Show active Trust and Temple selectors in the workspace header.

Display the user identity, designation(s), and accessible organization context without treating designation as authorization.

Render navigation items based on permissions but rely on APIs for enforcement.

Support responsive desktop, tablet, and mobile layouts.

Retain the existing sacred visual language, typography, colors, responsive navigation, toasts, charts, and card patterns where usable.

Provide loading, empty, validation, error, permission-denied, and offline/draft states.

Trust administration screens

Trust profile and settings.

Temple portfolio.

Trust members and invitations.

Trust designations and office bearers.

Roles, permissions, inheritance, scope, and policy preview.

Delegation and approvals.

Audit and access review.

Trust dashboard and aggregated reports.

Temple administration screens

Temple profile, schedules, facilities, and media.

Members, staff, priests, designations, office bearers, and reporting chart.

Seva and Pooja master.

Bookings calendar and agenda.

Transactions and receipts.

Prasadam dispatch.

Priest duty scheduling.

Temple reports and settings.

Role builder requirements

Custom role name, key, description, scope, status, and validity.

Permission search by namespace, resource, and action.

Scope selector for Trust, all Temples, selected Temples, or exact Temple.

Condition editor restricted to approved attributes and operators.

Parent role selector with cycle validation.

Effective permission preview and impacted-user preview.

Conflict, escalation, and separation-of-duty warnings.

Draft/publish workflow and version history.

B9. Detailed Data and State Rules



| Object | Primary states | Important transitions |

| --- | --- | --- |

| Trust | Draft, Active, Suspended, Archived | Draft → Active after onboarding; Active → Suspended blocks operations; Archived is read-only |

| Temple | Draft, Active, Suspended, Archived | Must have active parent Trust; suspension blocks configured operations |

| Membership | Invited, Active, Suspended, Expired, Revoked | Invitation accepted → Active; revocation is immediate |

| Office bearer | Scheduled, Active, Expired, Suspended, Revoked | Term dates control appointment validity |

| Role | Draft, Published, Retired | Only published role versions participate in normal evaluation |

| Assignment | Pending, Active, Expired, Suspended, Revoked | Approval and dates control effectiveness |

| Booking | Draft, Reserved, Pending, Paid, Refunded, Cancelled, Completed, No-show | Transitions require permission and validation |

| Payment | Pending, Authorized, Captured, Failed, Refunded, Voided | Financial transitions are audited and idempotent |

| Shipment | Pending, Packed, Shipped, Delivered, Failed, Cancelled, Returned | Provider events must be reconciled |

| Policy | Draft, Validated, Approved, Published, Rolled back, Retired | Publication increments policy version |



B10. Non-Functional Requirements



| ID | Category | Requirement / target |

| --- | --- | --- |

| NFR-01 | Security | Deny by default; no protected API action may succeed without an applicable permission. |

| NFR-02 | Tenant isolation | Automated tests shall verify no cross-Trust reads, writes, files, reports, cache hits, or jobs. |

| NFR-03 | Authorization latency | Target p95 decision latency under normal load: 50 ms when cached and 150 ms when uncached, excluding network/client latency. |

| NFR-04 | API performance | Target p95 for ordinary read APIs: 500 ms; write APIs: 800 ms under agreed baseline load. |

| NFR-05 | Availability | Initial production target: 99.5% monthly availability, excluding approved maintenance. |

| NFR-06 | Consistency | Strong consistency for role revocation, payment transitions, booking capacity, and policy publication. |

| NFR-07 | Scalability | Initial design shall support multiple Trusts and Temples with indexed tenant queries and horizontal application scaling. |

| NFR-08 | Usability | Core workflows shall be usable on desktop and mobile web; forms shall provide inline validation and recoverable errors. |

| NFR-09 | Accessibility | Target WCAG 2.1 AA practices for keyboard operation, labels, focus, contrast, and status messaging. |

| NFR-10 | Auditability | All sensitive writes and exports shall have actor, scope, target, decision, request ID, and timestamp. |

| NFR-11 | Backup | Automated encrypted backups with tested restore procedure and documented RPO/RTO. |

| NFR-12 | Observability | Structured logs, metrics, traces, authorization decision metrics, and tenant-aware dashboards. |

| NFR-13 | Maintainability | TypeScript strict mode, module boundaries, schema migrations, API contracts, code review, and automated tests. |

| NFR-14 | Privacy | Minimize personal data, encrypt sensitive fields where appropriate, restrict exports, and apply retention policies. |

| NFR-15 | Localization | Support INR, IST, en-IN formatting, configurable date/time display, and future regional language support. |



B11. Security Architecture

Authentication establishes identity; authorization determines action and scope.

The API Gateway and every sensitive module act as Policy Enforcement Points.

The Authorization PDP evaluates roles, permissions, ancestry, conditions, membership, office-bearer validity, delegation, and constraints.

The system shall use short-lived sessions or access tokens, refresh rotation, MFA for privileged actions, and secure cookie or token handling.

PostgreSQL Row-Level Security may be used as defense in depth for tenant rows; application authorization remains mandatory.

Object-storage keys, signed URLs, cache keys, queue messages, analytics, and logs shall include tenant context.

No administrator may disable audit logging, bypass tenant boundaries, or delegate more authority than they possess.

Break-glass support access shall be temporary, approval-controlled, reason-coded, and fully audited.

B12. Caching, Events, and Scalability

Cache

Cache user memberships, role closure, organization ancestry, and frequent authorization decisions.

Use keys such as authz:{trust_id}:{policy_version}:{user_id}:{action}:{resource_id}.

Invalidate by policy version and event-driven eviction after role, assignment, membership, delegation, or hierarchy changes.

Fail closed for privileged actions when policy state cannot be verified.

Events and background jobs

Use transactional outbox for policy changes, booking events, payment events, shipment events, and notifications.

Every event includes trust_id, optional temple_id, aggregate ID, event ID, version, actor, and occurred_at.

Consumers must be idempotent and retain failed messages for retry or dead-letter review.

Background workers re-check authorization for sensitive jobs rather than trusting the creator’s old session.

Scale path



| Stage | Architecture |

| --- | --- |

| Initial | Pooled application and PostgreSQL; Redis cache; object-storage prefixes; tenant-aware indexes and RLS |

| Growth | Dedicated authorization service; batch checks; read models for reports; partitioning by Trust where justified |

| Enterprise | Bridge database/schema for selected Trusts; tenant deployment routing; regional or dedicated stacks |



B13. Migration from Current Prototype

Because no production database has been designed, migration risk is substantially lower than it would be after launch. The current components and visual patterns can be preserved while replacing prototype persistence and single-Temple assumptions.



| Current prototype pattern | Target replacement |

| --- | --- |

| Single default administrative account | Global User + Trust membership + scoped role assignment |

| LocalStorage session | Secure authenticated session + active Trust/Temple context |

| sankalpvani_bookings registry | Booking, pilgrim, payment, and status-history tables |

| sankalpvani_org_chart | Users, office bearers, designations, and reporting relationships |

| Free-text or dropdown role values | Configurable designation and role entities |

| Shared component state | API repositories and server query state |

| Dashboard calculated from client arrays | Tenant-scoped server queries and reporting views |

| LocalStorage factory reset | Environment-seeded development data; protected production deletion workflow |

| Simulated sync status | Real health checks, job state, policy version, and observability |



Freeze business-feature expansion on LocalStorage.

Extract TypeScript domain types and map each type to target entities.

Create schema migrations and seed only development fixtures.

Implement identity, Trust, Temple, membership, and context middleware.

Implement repositories and migrate one module at a time.

Add authorization before exposing financial, export, or administrative writes.

Backfill or manually review prototype fixture data; do not assume mock records are production-safe.

Run tenant-isolation, authorization, concurrency, and reconciliation tests.

Remove business-data LocalStorage code after feature parity is verified.

B14. Testing and Acceptance

Test levels

Unit tests for pricing, availability, schedule rules, role closure, condition evaluation, conflict resolution, and state transitions.

Integration tests for database constraints, transaction boundaries, RLS policies, repositories, and outbox events.

API tests for authentication, tenant scope, authorization, pagination, idempotency, error handling, and exports.

End-to-end tests for Trust onboarding, Temple creation, role assignment, booking, payment, scheduling, shipment, and reporting.

Security tests for IDOR, cross-tenant access, privilege escalation, stale cache, token misuse, file access, and export leakage.

Performance tests for booking capacity, authorization checks, dashboards, reports, and concurrent users.

Usability and accessibility tests for responsive screens, keyboard operation, forms, alerts, and permission-denied states.

Critical acceptance scenarios



| Scenario | Expected result |

| --- | --- |

| User in Trust A requests Trust B record | Denied; no record existence leakage |

| Temple admin accesses another Temple under same Trust | Denied unless explicit cross-Temple scope exists |

| Trust role cascades to selected Temples | Allowed only in selected Temples; denied elsewhere |

| Role inheritance cycle is submitted | Rejected with clear validation error |

| Delegator grants more than their authority | Rejected |

| Office-bearer term expires | Any designation-bound role becomes ineffective after expiry |

| Payment approver attempts own transaction | Denied when separation-of-duty rule applies |

| Concurrent bookings consume final slot | Exactly one valid reservation; others receive capacity response |

| Revoked administrator uses cached decision | Denied after required revocation propagation window |

| Unauthorized user exports report | Denied and audit event recorded |



B15. Operational Requirements

Use versioned database migrations with forward and rollback plans.

Use separate development, test, staging, and production environments.

Protect production secrets through managed secret storage and rotation.

Monitor API latency, error rate, database health, queue lag, cache hit rate, authorization denials, policy publication, and tenant isolation alerts.

Define RPO, RTO, backup retention, incident response, data retention, and support escalation before production launch.

Use feature flags for migration and module rollout, but never use a feature flag as a substitute for authorization.

Create tenant-aware support tooling that masks sensitive data and records every support access.

Part C — Appendices

C1. Suggested Initial Permission Capability Registry



| Namespace | Example capabilities |

| --- | --- |

| trust | trust.read, trust.update, trust.temple.create, trust.member.manage, trust.office_bearer.manage |

| temple | temple.read, temple.update, temple.settings.manage, temple.staff.manage, temple.facility.manage |

| policy | policy.permission.create, policy.role.create, policy.role.assign, policy.delegate, policy.audit.read |

| priest | priest.read, priest.create, priest.update, priest.status.update |

| seva | seva.read, seva.create, seva.update, seva.publish, seva.capacity.manage |

| booking | booking.read, booking.create, booking.update, booking.cancel, booking.status.update |

| finance | finance.transaction.read, finance.payment.record, finance.payment.approve, finance.export |

| prasadam | prasadam.read, prasadam.pack, prasadam.ship, prasadam.cancel, prasadam.export |

| schedule | schedule.read, schedule.create, schedule.update, schedule.override_conflict |

| report | report.read, report.create, report.export, report.aggregate_across_temples |

| document | document.read, document.upload, document.update, document.delete, document.export |



These are capability examples for backend module registration, not predefined business roles. Tenants decide which custom roles receive them.

C2. Example Dynamic Policy

Designation: Treasurer

Office bearer: Ravi Kumar, Trust T1, term 01-Apr-2026 to 31-Mar-2029

Role: Festival Finance Coordinator

Scope: Temples M1 and M2

Grants: finance.transaction.read; finance.payment.record; finance.payment.approve where amount <= 50,000

Constraint: cannot approve a payment created by the same user

Delegation: may assign finance.transaction.read, but may not delegate payment approval

Audit: policy version increments on publication; affected-user preview is retained

C3. Glossary



| Term | Definition |

| --- | --- |

| Tenant | Isolation boundary for data, policy, storage, cache, jobs, and reports; initially the Trust |

| Trust | Root domain organization and initial SaaS tenant |

| Temple | Child organization under one Trust |

| User | Global identity representing a person or account |

| Membership | Relationship allowing a user to belong to a Trust or Temple |

| Designation | Organizational or legal title |

| Office bearer | Time-bound appointment of a user to a designation |

| Role | Custom bundle of permissions |

| Permission | Action on a resource under a scope and optional condition |

| Assignment | Grant of a role to a subject within a scope and validity period |

| Cascade | Trust role or permission applying to selected descendant Temples |

| Delegation | Restricted transfer of administrative authority |

| PEP | Policy Enforcement Point that intercepts and enforces access |

| PDP | Policy Decision Point that calculates access decisions |

| RLS | Database row-level security used as defense in depth |



C4. Traceability Summary



| Business objective | Primary requirements | Primary modules |

| --- | --- | --- |

| BO-01 Tenant isolation | FR-02, FR-03, FR-16, NFR-01, NFR-02 | Tenant, organization, authorization, database, audit |

| BO-02 Multi-Temple operation | FR-03, FR-04, FR-08 to FR-15 | Organization, Temple operations, reporting |

| BO-03 Configurable governance | FR-05, FR-06, FR-07, B5 | Governance, authorization, administration UI |

| BO-04 Digitize operations | FR-08 to FR-15 | Temple masters, bookings, finance, logistics, scheduling |

| BO-05 Accountability | FR-16, NFR-10, B11 | Audit, policy history, access review |

| BO-06 Extensibility | FR-06, FR-15, NFR-13 | Permission registry, module interfaces, events |

| BO-07 Preserve product value | Migration section, FR-08 to FR-15 | Existing frontend modules and repositories |



C5. Decisions Requiring Stakeholder Confirmation

Whether the first release includes public devotee booking or only administrative booking entry.

Payment gateway providers, settlement and refund rules, and whether accounting integration is required.

Required data retention periods for identity, financial, booking, shipment, and audit records.

Whether Trust office-bearer appointments require a formal approval workflow in the product.

Exact permission condition language and the list of attributes permitted in conditions.

Whether a Trust may create its own arbitrary permission definitions or only configure capabilities registered by product modules.

Target RPO, RTO, availability tier, and whether any Trust requires data residency or dedicated infrastructure.

Notification providers, templates, language support, and consent requirements.

Whether Temple data can be moved between Trusts and what historical records must remain with the source Trust.

C6. Source and Baseline Note

This combined BRD/SRS incorporates the current SankalpVani Admin Portal feature baseline supplied in the project analysis report, including its existing Next.js/React frontend structure, Temple administration modules, LocalStorage prototype persistence, dashboards, Seva, priest, booking, transaction, logistics, scheduling, organization-chart, reporting, and settings capabilities. The target architecture adds Trust-based multi-tenancy, hierarchical organization, dynamic governance, durable persistence, and tenant-aware security.