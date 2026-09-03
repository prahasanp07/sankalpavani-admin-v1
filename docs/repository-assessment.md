# SankalpVani Repository Assessment (Phase 0)

**Document Version:** 1.0  
**Date:** 01 September 2026  
**Repository Baseline:** `sankalpvani-admin-v1.0` (Imported into `Sankalpavani-v1`)  
**Status:** Completed Assessment  

---

## 1. Executive Summary

SankalpVani is transitioning from a single-temple prototype with browser LocalStorage persistence into a production multi-tenant Trust and Temple Management SaaS platform. 

The existing frontend baseline contains mature, high-quality temple administration components, sacred visual theming (gold, vermilion, saffron, ivory), interactive calendars, charts, thermal receipt styling, and React Flow/Dagre organization graphs. The task is to migrate from LocalStorage mocks to an authoritative PostgreSQL database, modular monolith backend, dynamic RBAC/ABAC authorization engine, and multi-tenant Trust/Temple hierarchy.

---

## 2. Route & Component Inventory

### Application Routing
- `app/layout.tsx`: Root HTML layout with Google Fonts (`Cinzel`, `Plus Jakarta Sans`, `JetBrains Mono`), sacred meta tags, and global CSS.
- `app/page.tsx`: Single-page dashboard container switching between operational views based on `navigationState` (`sankalpvani_navigation_state`).
- `app/globals.css`: Tailwind CSS v4 design tokens, color utilities, sacred glow styles, and print media rules for thermal receipts.

### Component Tree
| Component | Primary Function | State & Persistence Dependency |
|---|---|---|
| `components/LoginScreen.tsx` | Sacred login screen with email/password, demo personas, and emergency bypass | `contexts/AuthContext.tsx` |
| `components/Sidebar.tsx` | Global navigation sidebar with dynamic RBAC capability checking & badges | `contexts/AuthContext.tsx`, `sankalpvani_temple_details` |
| `components/DashboardPortal.tsx` | Operational KPIs, collections bar chart, booking breakdown, and pending shipments | `sankalpvani_bookings`, `sankalpvani_prasadam` |
| `components/MastersHub.tsx` | Master navigation hub for Temple Info, Facilities, Priests, Sevas, and Scheduling | Sub-tab routing |
| `components/TempleInfo.tsx` | Temple contact info, geolocations, hero photos, and 4-tier Darshan timings | `sankalpvani_temple_details` |
| `components/TempleFacilities.tsx` | Guest amenities, choultry, dining, room booking toggles, and draft publishing | `sankalpvani_temple_facilities`, `...draft` |
| `components/PriestMaster.tsx` | Acharyas & Archakas directory, specializations, contact details, status | `sankalpvani_priests` |
| `components/SevaMaster.tsx` | Seva offering catalog, pricing, devotee capacity, duration, instructions | `sankalpvani_sevas` |
| `components/Scheduling.tsx` | 4-day duty roster, shift allocations, clash detection, and leave records | `sankalpvani_shifts`, `sankalpvani_priests` |
| `components/CalendarView.tsx` | Monthly devotee booking calendar, daily agenda, Gotra/Nakshatra booking modal | `sankalpvani_bookings`, `sankalpvani_sevas`, `sankalpvani_priests` |
| `components/Transactions.tsx` | Financial ledger, payment status modifications, thermal slip printing modal | `sankalpvani_bookings`, `sankalpvani_temple_details` |
| `components/Prasadam.tsx` | Remote holy prasadam delivery queue, packing pipeline, India Post labels | `sankalpvani_prasadam` |
| `components/OrgChart.tsx` | Hierarchy tree & matrix reporting graph using `@xyflow/react` and `dagre` | `sankalpvani_org_chart` |
| `components/SystemOverview.tsx` | Infrastructure latency graphs, uptime meters, error logs, and export actions | `RAW_BOOKINGS`, `RAW_SHIPMENTS` |
| `components/Settings.tsx` | System preferences, SMS/email alerts, session timeout, factory reset diagnostics | All LocalStorage keys |
| `components/RequirePermission.tsx` | Client-side visual permission guard & locked view fallback | `contexts/AuthContext.tsx` |
| `components/TimeRangePicker.tsx` | 12-hour AM/PM time slot selector for temple schedules & shifts | Component state |

---

## 3. LocalStorage Key Inventory & Migration Mapping

| Prototype LocalStorage Key | Stored Data & Purpose | Target Authoritative PostgreSQL Table(s) |
|---|---|---|
| `sankalpvani_session` | Authenticated user session, active permissions, designation | `user`, `session`, `trust_membership`, `temple_membership`, `role_assignment` |
| `sankalpvani_admin_profile` | Admin profile (name, phone, avatar, designation) | `user`, `person_profile` |
| `sankalpvani_navigation_state` | Last active navigation tab and parent tab | Allowed in LocalStorage (UI preference) |
| `sankalpvani_temple_details` | Temple name, address, hotline, email, map, photos, darshan timings | `temple`, `temple_settings`, `temple_schedule` |
| `sankalpvani_temple_facilities` | Facilities list, status, descriptions | `temple_facility` |
| `sankalpvani_temple_facilities_draft` | Unsaved draft state flag | `temple_facility.is_draft` / LocalStorage draft |
| `sankalpvani_priests` | Archakas directory, gotras, phone, photo, active status | `person_profile`, `priest_profile`, `temple_staff_assignment` |
| `sankalpvani_sevas` | Seva offerings, pricing, capacity, recurrence, category | `seva`, `seva_schedule_rule`, `seva_capacity_rule` |
| `sankalpvani_shifts` | 4-day duty roster, shift timings, assigned priest IDs | `shift`, `shift_assignment`, `staff_availability` |
| `sankalpvani_bookings` | Devotee bookings, gotras, nakshatra, payment status, receipts | `booking`, `booking_pilgrim`, `payment`, `financial_transaction`, `receipt` |
| `sankalpvani_prasadam` | Postal shipments, recipient address, tracking codes, status | `shipment`, `shipment_item`, `shipment_status_history` |
| `sankalpvani_org_chart` | Staff members, reporting lines, matrix supervisors, cadre ranks | `organization_node`, `reporting_relationship`, `matrix_relationship`, `office_bearer` |
| `sankalpvani_custom_designation_presets` | Custom role/designation presets | `role`, `permission_definition`, `role_permission`, `designation` |

---

## 4. Current Types vs Target Domain Entities

1. **Staff & Identity**:
   - *Current*: `StaffMember` conflates user account, organizational designation, department, and software permissions.
   - *Target Separation*:
     - `User`: Global authentication identity.
     - `PersonProfile` / `PriestProfile`: Human demographics, contact, gotra, specializations.
     - `Designation`: Organizational title (e.g., "Pradhana Archaka", "Chief Treasurer").
     - `OfficeBearer`: Term-bound appointment of a user to a designation.
     - `Role` & `Permission`: Granular software capabilities (`namespace.resource.action`).

2. **Bookings & Financials**:
   - *Current*: `Booking` contains embedded `Pilgrim[]`, payment status string, and receipt info in a single flat JSON object.
   - *Target Separation*:
     - `Booking`: Scoped to `trust_id` and `temple_id`, references `seva_id` and devotee user.
     - `BookingPilgrim`: Family members, gotra, nakshatra, age, gender.
     - `Payment`: Payment method, transaction reference, amount, status.
     - `Receipt`: Unique scoped receipt number, verification code, timestamp.

3. **Multi-Temple Scope**:
   - *Current*: Hardcoded single temple assumptions ("Temple-1 Administrative Dashboard").
   - *Target*: Dynamic workspace URL routing:
     - `/trusts/[trustId]/dashboard` (Trust-level aggregate oversight)
     - `/trusts/[trustId]/temples/[templeId]/...` (Scoped Temple operations)

---

## 5. Security & Isolation Deficiencies in Baseline

1. **Client-Side Permission Enforcement Only**: `<RequirePermission>` and `hasPermission` in `AuthContext` are easily bypassed via client console or storage editing.
2. **Hardcoded Apex Super Admin**: `admin@temple1.com` with hardcoded credentials and instantaneous elevation button.
3. **No Database Row-Level Isolation**: No tenant scoping exists in the current prototype.
4. **No Mutation Audit Trails**: Financial status changes (e.g. marking booking as Paid/Refunded) do not record actor ID or timestamp.

---

## 6. Recommendations & Migration Action Items

1. Introduce **Drizzle ORM** with PostgreSQL migrations.
2. Set up core tenancy schema (`trust`, `temple`, `user`, `trust_membership`, `temple_membership`).
3. Build server-side Policy Enforcement Point (PEP) with dynamic permissions.
4. Implement tenant-aware route tree under `app/(workspace)/trusts/[trustId]/...`.
5. Migrate each operational component to repository-backed API clients while preserving sacred UI styling.
