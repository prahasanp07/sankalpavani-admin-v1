# SankalpVani Implementation Decisions & Architecture Log

**Document Version:** 1.0  
**Date:** 01 September 2026  
**Status:** Active  

---

## Decision Log

### DEC-001: Tenancy Model and Isolation Root
- **Decision:** The primary tenant boundary is `tenant_id = trust_id`. Temples are child organizational nodes within a Trust.
- **Alternatives Considered:** 
  1. *Temple-as-tenant*: Rejected because trusts frequently govern multiple temples with shared trustees, cross-temple financial auditing, and centralized office-bearer appointments.
  2. *Account-as-tenant owning multiple trusts*: Deferred for future expansion; `tenantId` is architecturally abstracted to map to `trustId` initially.
- **Consequences:** All tables contain `trust_id` directly or via foreign key. Temple-scoped tables contain both `trust_id` and `temple_id`.
- **Reversal/Migration Path:** The tenancy context resolver can map multi-trust customer accounts to `tenantId` without altering relational schema.

---

### DEC-002: Dynamic Governance & RBAC Model
- **Decision:** Software permissions are granular strings formatted as `namespace.resource.action` (e.g. `temple.seva.update`, `temple.booking.create`, `trust.finance.export`). Roles are dynamically created data entities per Trust/Temple, not hard-coded enums or static code definitions.
- **Distinction Enforced:**
  ```text
  Designation   = Human/legal title (e.g. Dharmadhikari, Chief Archaka)
  Office Bearer = Time-bound appointment of a user to a designation
  Role          = Dynamic collection of software permissions
  Permission    = Granular capability on a resource within a scope
  ```
- **Scope Modes Supported:** `EXACT`, `TRUST_ONLY`, `ALL_DESCENDANTS`, `SELECTED_DESCENDANTS`, `DIRECT_CHILDREN`.
- **Cascading & Inheritance:**
  - Trust-to-Temple cascading must be explicit.
  - Temple roles never inherit upward to Trust resources.
  - Role inheritance graphs must be acyclic (validated on create/update).
  - Explicit Deny overrides Allow within applicable scope.

---

### DEC-003: Persistence & Modular Monolith
- **Decision:** Next.js 15 App Router application with PostgreSQL system of record managed via Drizzle ORM and committed SQL migrations.
- **Alternatives Considered:** Prisma, Raw SQL, Microservices.
- **Reason:** Drizzle ORM provides lightweight, type-safe SQL queries, zero runtime overhead, excellent serverless/edge compatibility, and transparent SQL migrations. Modular monolith keeps interfaces clean without premature distributed system complexity.

---

### DEC-004: Server-Side Policy Enforcement Point (PEP)
- **Decision:** Every API endpoint, server action, background worker, report generator, and file download must invoke `authorization.require(...)` on the server before executing business logic or data mutations.
- **Frontend UI Guards:** Components like `<RequirePermission>` or `<Can>` provide progressive UI disclosure only and are never trusted as security decisions.

---

### DEC-005: Audit Trail & Outbox Pattern
- **Decision:** Sensitive mutations (membership changes, role grants, policy publications, financial payments, refunds, shipment status transitions, and bulk exports) record an immutable row in `audit_event` within the same database transaction.
- **Asynchronous Events:** Handled via an `outbox_event` table to ensure transactional integrity between database mutations and external side effects (notifications, emails, print queues).

---

### DEC-006: LocalStorage Decommissioning
- **Decision:** All business state is migrated to PostgreSQL. LocalStorage is restricted solely to non-sensitive client preferences (e.g. sidebar collapse state, last active view tab preference, temporary form draft).
