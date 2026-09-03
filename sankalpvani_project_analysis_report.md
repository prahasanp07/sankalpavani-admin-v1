# SankalpVani Admin Portal — Detailed Comprehensive Project & Functionality Analysis

**Project Name:** SankalpVani Admin Portal (`sankalpvani-admin-v1.0`)  
**Target Domain:** Devasthanam & Temple Administrative Management System  
**Framework & Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion family), React Flow (`@xyflow/react` v12), Dagre Graph Layout Engine (`dagre`), Lucide React, LocalStorage Persistence Engine.

---

## Executive Summary

The **SankalpVani Admin Portal** is an enterprise-grade, sacred-themed temple administration platform designed for Devasthanam authorities, Chief Priests (*Maha-Purohitas*), Pujaris, and administrative personnel. The application manages the end-to-end operational workflow of a Hindu temple—ranging from core temple parameters, priest registries, seva pooja offerings setup, and duty shift roster scheduling to live financial transaction ledgers, thermal receipt/slip printing, remote prasadam shipping logistics, and real-time infrastructure metrics.

---

## Detailed Minute Functionalities Breakdown

### 1. Authentication & Security Engine
*Located in:* `components/LoginScreen.tsx`, `app/page.tsx`

* **Sacred-Themed Authenticator Screen:**
  * Custom background banner overlay with glassmorphism backdrop blur (`backdrop-blur-md`).
  * Sacred branding with Hindu temple iconography (`temple_hindu`) and spring-animated header badge.
* **Credential Validation & Session Management:**
  * Email and password login validation (default administrative account: `admin@temple1.com`).
  * Simulated authentication delay for real-world API experience.
  * LocalStorage session persistence via key `sankalpvani_session`.
  * Auto-login guard on app initialization to restore authenticated state across browser refreshes.
* **Password Reset Notice Modal:**
  * Direct user alert for administrative credential recovery via head priest or system administrator.
* **Multi-Point Logout Controls:**
  * Global logout execution available from Sidebar, Profile Dropdown, and Mobile Drawer Menu.

---

### 2. Global Header & Navigation System
*Located in:* `app/page.tsx`, `components/Sidebar.tsx`

* **Dynamic Page Title Breadcrumbs:**
  * Context-aware top header title updating automatically based on the active menu tab.
* **Live Indian Standard Time (IST) Ticker:**
  * Real-time ticking clock displaying day, date, month, year, hours, minutes, and seconds in 12-hour AM/PM format for `en-IN` locale.
* **Responsive Drawer Navigation:**
  * Desktop fixed sidebar with golden divider accents (`divider-gold`).
  * Mobile overlay navigation drawer triggered via hamburger button with smooth slide-in animations.
  * Smart tab selection with nested active state recognition (e.g., highlighting *Masters* when in sub-pages like Priest Master, Seva Master, or Org Chart).
  * Navigation items include: *Dashboard*, *Masters Hub*, *Devotee Bookings Calendar*, *Prasadam Dispatch*, *Transactions Ledger*, *Org Chart & Matrix Reporting*, *System Reports*, and *Settings*.
* **Administrator Profile Synchronization:**
  * Displays avatar image, admin name, and designation.
  * Dynamically synchronized so updates made in the *Modify Administrator Profile* settings panel instantly propagate to both the top navigation bar and the sidebar footer layout uniformly.
* **System-Wide Toast Notification System:**
  * Floating toast messages with status icons (`CheckCircle`, `Printer`, `PackageCheck`) providing real-time feedback for background syncs, label prints, and updates.

---

### 3. Administrator Profile & Credential Management
*Located in:* `app/page.tsx`

* **Persona Details Editor:**
  * Modifiable Full Name / Sacred Title (e.g. Chief Priest Rama Prasad).
  * System Designation / Role configuration (e.g. Maha-Purohita / System Admin).
  * Primary Email Address update with automatic session synchronization.
  * Emergency Hotline Contact Number updating.
* **Avatar & Profile Icon Chooser:**
  * 4 high-resolution avatar presets with selection highlight ring.
  * Custom avatar URL input for uploading personal/temple priest photos.
* **Administrative Security Credentials Reset:**
  * Current password verification field.
  * New password specification with minimum length check (min 6 characters).
  * Confirmation password match validation.
  * Animated error alerts and toast feedback.

---

### 4. Executive Dashboard Portal
*Located in:* `components/DashboardPortal.tsx`

* **Welcome Section Banner Card:**
  * Prominent banner photo of the temple. Styled using `object-cover` and `w-full h-full` to fit the wide container aspect ratio perfectly without distorted proportions or redundant blurred backgrounds.
* **KPI Performance Bento Grid:**
  * **Today's Devotees:** Displays the count of daily pilgrims scheduled for today. Clicking the card opens a devotee roster modal with gotra/nakshatra, booked seva, and reporting times details.
  * **Recent Bookings:** Tracking total bookings made within the last 4 hours. Clicking opens a list table modal of recent ticket registrations.
  * **Prasadam to Dispatch:** Pending shipment counter with progress bar visualization.
  * **Total Collections:** Total revenue counter formatted in Indian Rupees, dynamically calculated from bookings history.
* **Shared Storage Data Sync:**
  * Linked to a shared local storage registry (`sankalpvani_bookings`). Listens to window-wide event triggers (`sankalpvani_bookings_updated`) so numbers recalculate in real-time when new bookings are added or status updates are made elsewhere in the portal.
* **Interactive 7-Day Donation Trends Graph:**
  * Responsive SVG/CSS shaded bar chart for weekly collection trends.
  * Interactive hover tooltips displaying exact daily revenue figures (e.g., `Fri: ₹24.5k`).
* **Recent Transactions Feed:**
  * Quick-view table of devotee names, initial badges, seva types, booking amounts, and completion statuses.
* **Seva Popularity Donut Visualizer:**
  * SVG multi-colored donut chart showing offering distribution (Archana, Annadanam, Vahan Puja).

---

### 5. Structural Masters Hub
*Located in:* `components/MastersHub.tsx`

* **Central Master Indices Routing:**
  * Gateway cards connecting to 6 underlying structural sub-masters:
    1. *Temple Core Information*
    2. *Seva & Pooja Master*
    3. *Temple Facilities Master*
    4. *Priest Master Registry*
    5. *Priest Roster & Scheduling*
    6. *Org Chart & Matrix Reporting*
* **Master Status Badges:**
  * Visual indicators displaying current record counts across departments and rosters.
* **Sync Engine Status Monitor:**
  * Real-time status badge showing encryption, offline-cached schema sync, and Durable-Sync ID (`SV-60882-SYS`).

---

### 6. Acharyas & Priest Master Registry
*Located in:* `components/PriestMaster.tsx`

* **Official Priest Directory Table:**
  * Detailed registry listing Priest Name, System ID, Official Role, Specialized Rituals, Mobile Contact Number, and Duty Status.
* **Interactive Duty Status Cycle:**
  * One-click status toggle cycling between `Active`, `Duty-Assign`, and `On Leave`.
* **Search & Multi-Filter Toolbar:**
  * Real-time text search filtering by priest name or ritual specialization.
  * Role filter tabs for quick segmenting (*All*, *Chief Priest*, *Pujari*, *Archaka*).
* **Add & Edit Official Priest Modals:**
  * Interactive forms for registering new priests or updating existing ones (name, role dropdown, mobile number, and specialization tags), immediately syncing changes to LocalStorage.

---

### 7. Seva & Pooja Master Setup
*Located in:* `components/SevaMaster.tsx`

* **Offering Master List Table:**
  * Catalog showing Seva ID, Ritual Name, Category Type, Price Ticket (₹), Daily Capacity Limit, Availability Status, and Action Controls.
* **Expansion of Fields & Seva Types:**
  * Supports a variety of Seva types representing different Devasthanam scheduling rituals: `Daily`, `Weekly`, `Monthly`, `Annually`, `Special`, and `Dhanur Masa`.
  * **Dynamic Form Scheduling Rules based on Seva Type:**
    * **Daily:** Standard everyday Sevas with no additional date constraints, available for booking on any chosen calendar day.
    * **Weekly:** Activates a **Day selection** multi-select array button toolbar (Sunday through Saturday). The chosen days are stored in `selectedDays` and displayed in the main table layout (e.g., `Days: Mon, Fri`). Bookings for this Seva are restricted to the selected weekdays.
    * **Monthly, Annually, Special:** Displays a calendar-based **Date selection** field (`selectedDate` input of type `date`), binding the offering exclusively to that specific calendar date.
    * **Dhanur Masa:** Renders a date-range calendar selector with **From** (`dateFrom`) and **To** (`dateTo`) inputs, restricting the Seva availability strictly within that solstice seasonal range (e.g., December 15 to January 15).
  * **Enhanced Devotee Capacity & Dynamic Costing Fields:**
    * **No. of Persons per Seva:** Specifies the standard pilgrim count allowed under a single booked ticket.
    * **Extra Person Cost (₹):** Renders an additional ticket price per person if the count exceeds the standard allocation.
    * **About Seva Description:** Detailed text area explaining the significance and mythological background (*sthala mahime*) of the offering.
    * **Instructions/Guidelines:** Text area for specific instructions, dress codes, or arrival regulations for pilgrims.
  * Shows **Duration / Performance Timing** and dynamic scheduling rules (e.g., weekday lists, dates, or date ranges) as inline badges on the list table for each record.
* **Inline Quick-Edit Mode:**
  * Inline table row editing for Seva Name, Category Type, Price, Capacity, and inline time durations with direct Save/Cancel controls.
* **Availability Toggle:**
  * Toggle button to instantly switch offering status between `Active` and `Suspended`.
* **Dynamic TimeRangePicker Integration:**
  * Incorporates standalone scroll-wheel time pickers inside collapsible forms to specify pooja performance ranges cleanly.

---

### 8. Temple Core Parameters Setup
*Located in:* `components/TempleInfo.tsx`

* **General Identity Management:**
  * Inputs for Temple Name, Physical Address, Telephone Hotline, Official Email, Web Portal URL, and Google Maps Location Link.
* **Darshan Schedule Expansion Accordions:**
  * Splitted timing parameters into 4 distinct calendar periods:
    * **Normal Days (General Weekdays)**
    * **Weekends (Saturdays & Sundays)**
    * **Dhanur Masa Season (Special Month)**
    * **Special Occasion Days (Festivals, Utsavas)**
  * Configured each category inside interactive **Expansion Panels (Accordions)** with dynamic chevron indicators.
  * Integrated reusable `TimeRangePicker` scroll widget widgets inside each accordion panel, showing a low-profile summary bar by default which expands inline on click.
* **Upload Temple Photos Panel:**
  * Supports choosing/uploading temple files. The selected primary photo dynamically propagates as the logo in the Sidebar and on receipt printouts.
* **Verification Status Widget:**
  * Live status display for external integrations (Google Maps API).
* **Reordered Screen Layout:**
  * Moved the **Publish Parameters** action section to the absolute bottom of the sidebar column (directly below the Verification Badges) to align with standard configuration workflows.

---

### 9. Temple Facilities Master Setup
*Located in:* `components/TempleFacilities.tsx`

* **Guest Amenities Management:**
  * Toggle controls to enable/disable 7 core temple facilities:
    1. *Function Hall / Choultry*
    2. *Rest Rooms*
    3. *Accommodation*
    4. *Dining Hall*
    5. *Private Poojas*
    6. *Drinking Water Facility*
    7. *Prasadam Counter*
* **Custom Icon Mapping:**
  * Integrates dynamic icon rendering for each facility (`Building2`, `Bath`, `Hotel`, `UtensilsCrossed`, `Sparkles`, `Droplets`, `Gift`, `Home`).

---

### 10. Seva Transactions Ledger & Receipt Generator
*Located in:* `components/Transactions.tsx`

* **Advanced Devotee Booking Table:**
  * **Sortable Column Headers:** Clickable column headers (Receipt #, Devotee Name, Booked Seva, Pooja Date, settled Ticket, Status) that toggle ascending/descending sorting states.
  * **Advanced Filters Card:** Collapsible filter card containing selectors for Seva Offering Name, Start Date, and End Date.
  * **Export to CSV:** Serializes the current filtered/sorted transaction list into downloadable CSV sheets.
  * **Pooja Date Column:** Dedicated column displaying scheduled booking date.
  * **Pagination controls:** Renders entries stats ("Showing 1 to 5 of 13 entries") and responsive page index navigation buttons.
  * **Expandable Roster Sub-rows:** Chevron toggles reveal detailed lists of all pilgrims (primary and family) including their Name, Gotra, Nakshatra, Age, and Gender.
* **High-Fidelity Official Seva Darshan Slip Modal:**
  * Authentic Devasthanam header with traditional Sanskrit Sloka (`॥ श्रीः शुभमस्तु देवकार्य सिद्ध्यर्थम् ॥`).
  * Detailed breakdown of Devotee Gotra, Nakshetra, Seva Name, Reporting Time, and Settled Amount.
  * Clean, traditional layout with a prominent numeric **Verification Reference Code** (QR codes and barcodes are completely removed to maintain Devasthanam design authenticity).
  * Direct **Thermal Slip Print** trigger (with toast notification displaying verification code) and **PDF Download** simulation.

---

### 11. Priest Duty Roster & Scheduling
*Located in:* `components/Scheduling.tsx`

* **Interactive 4-Day Roster Board:**
  * Column layout rendering assigned shifts across Today, Tomorrow, and upcoming dates.
* **Automated Conflict Safeguard Engine:**
  * Prevents double-booking a priest for concurrent sevas or assigning priests who are marked *On Leave*.
* **Shift Assignment Modal:**
  * Dialog to pick Target Date, Priest Acharya (populated from Priest Master), Seva Pooja, and Shift Slot.

---

### 12. Prasadam Shipping & Logistics Manager
*Located in:* `components/Prasadam.tsx`

* **Table-based Ledger Layout:**
  * Replaced the static card view with an enterprise-grade table matching the layout of the Transactions Ledger.
* **Devotee Booking Order Ingestion:**
  * Auto-synchronizes on mount and listens for changes in `sankalpvani_bookings`. Bookings containing home delivery requests (`deliverToHome: true` or shipping metadata) are automatically ingested as pending logistics shipments, populating `recipientName`, `streetAddress`, `city`, `state`, `pincode`, and `phone` columns.
* **Interactive Sorting & Collapsible Filters:**
  * Column headers for Package ID, Devotee Pilgrim, Booking Date, and Status are fully sortable.
  * Collapsible search cards allow filtering by devotee name, status, sacred contents (e.g. Laddu, Kumkum), and dates.
* **CSV Spreadsheet Export:**
  * One-click CSV generation for logistics manifest spreadsheets.
* **Checkbox Multi-Selection & Floating Bulk Drawer:**
  * Row-level checkboxes and a page-level master checkbox. Toggling elements opens a floating bulk actions bar at the bottom:
    * **Bulk Print Packing Labels:** Prints labels for all selected orders.
    * **Bulk Mark Packed:** Changes status to Packed.
    * **Bulk Mark Shipped:** Assigns India Post tracking codes (e.g., `INDPOST_XXXX`) to all selected orders.
    * **Bulk Cancel:** Deletes selected shipments.

---

### 13. Devotee Bookings Calendar Workspace
*Located in:* `components/CalendarView.tsx`

* **Monthly Calendar Roster Grid:**
  * Calculates calendar offset spacing for the selected month, displaying preceding/trailing adjacent month slots in faded styling.
  * Default selection snaps automatically to today's date upon launch, and centers on today via the "Today" navigation action.
  * Features **Dynamic Date Shifting** algorithm which automatically increments mock bookings relative to today's date on initial load so dashboard tables, recent bookings, and calendar states are active and populated immediately.
  * Grid cells render color-coded event pills (Green = Paid, Amber = Pending, Red = Refunded). On small viewports, text labels collapse into small status dots, displaying a scrollable day schedule roster underneath the grid cell layout.
* **Real-Time Seva Slots Availability Indicator & Legend:**
  * Calculates date-level capacity limits dynamically by comparing total bookings versus configured seva limits (`s.capacity`).
  * Displays color-coded availability badges on every calendar day cell:
    * **Green (Available):** All Seva slots have open capacity.
    * **Amber (Partially Available):** One or more Sevas have reached maximum capacity while others remain open.
    * **Red (Not Available):** All Seva offerings for that date are fully booked.
* **Strict Past Date Booking Restrictions & Validation Safeguards:**
  * **Submission Guard (`handleAddBooking`):** Enforces `bookingDate >= today` validation to block registering or scheduling Sevas for previous dates.
  * **Modal Date Input Constraints:** Configured with `min={today}` and active `onChange` validation alerting users against selecting past dates.
  * **Header & Quick-Action Fallback:** If a past date is selected on the calendar and the user clicks *"Add Booking"* or *"Register Seva Booking"*, the system alerts the user via a toast notification and automatically defaults the schedule date to today.
  * **Agenda Overview for Past Dates:** Disables the *"Add Booking"* action on previous empty dates, displaying an informational *"Past date (Bookings closed)"* notice.
  * **Month Grid Double-Click:** Double-clicking past dates triggers a warning toast *"Cannot register bookings for past dates"* and prevents opening the booking modal.
* **Devotee Seva Booking Modal Form:**
  * **Dropdown Selectors:** Gothra and Nakshatra text inputs replaced with drop-down selector menus using `gotramsList` and `nakshatramsList` schemas.
  * **Persons Count & Dynamic Costing:** Collects "No. of Persons" and dynamically calculates total ticket cost using Selected Seva's base price, base capacity, and extra person fees.
  * **Pilgrim Schema Extensions:** Captures devotee **Age** and **Gender** fields for the primary devotee.
  * **Dynamic Multi-Pilgrim / Family Roster:** Dynamically adds and removes additional pilgrim input rows with full gotra, nakshatra, age, and gender parameters.
  * **Seva Description Cards:** Dynamically retrieves and renders the selected Seva's *About Seva* description and *Instructions / Guidelines* details inside the modal.
* **Day Agenda Details Drawer:**
  * Click cell dates to view full pilgrim registries for that date. Displays the primary devotee's age/gender, and loops over the pilgrims roster showing name, age, gender, gotra, and nakshatra.
  * Includes an inline **Payment Status Selector Dropdown** allowing Pujaris to change status directly (Paid / Pending / Refunded) which updates database states and dispatches global event triggers instantly.
* **Layout Overlap Bug Correction:**
  * Corrected layout bug where receipt IDs and status badges overlapped in the top right. Positioned both inline within a flex layout row next to the devotee name, keeping payment status clearly visible at all times.

---

### 14. Devasthanam Org Chart & Matrix Reporting
*Located in:* `components/org-chart/OrgChartCanvas.tsx`, `components/org-chart/BentoNode.tsx`, `components/org-chart/AddStaffDrawer.tsx`, `components/org-chart/types.ts`, `components/OrgChart.tsx`

* **Interactive Dual-Reporting Canvas Engine:**
  * Powered by **React Flow (`@xyflow/react` v12)** and the **Dagre (`dagre`) directed hierarchical layout engine** (Top-to-Bottom `TB` orientation).
  * **Primary Hierarchical Lines (Solid Bezier Curves):** Direct managerial reporting connections (`reports_to`) styled in dark saffron (`#8f4e00`).
  * **Matrix Reporting Lines (Dashed Animated Bezier Curves):** Cross-departmental and functional coordination connections (`secondary_reports`) styled in purple (`#9333ea`) with animated flows and `Matrix Line` center pill badges.
* **Custom Bento Card Nodes (`BentoNode.tsx`):**
  * Built using Tailwind CSS Bento cards with color-coded left borders matching temple wings:
    * **Saffron (`#ff7700`):** Spiritual / Archakas / Pujaris.
    * **Gold (`#d4af37`):** Administration & Management.
    * **Emerald (`#059669`):** Operations & Logistics.
    * **Blue (`#2563eb`):** Finance & Accounts.
  * Displays avatar, active duty status badge, full designation, direct reports counter chip, and matrix reporting lead badges.
  * **Dual Handles:** Top (Primary Target), Bottom (Primary Source), Left (Matrix Target), Right (Matrix Source).
  * **Double-Click Interaction:** Double-clicking any node card instantly opens the right-aligned **Edit Staff Profile** drawer pre-filled with that person's complete data.
  * **Hover Quick Actions:** Interactive action buttons on cards for Edit, `+ Report` (direct subordinate), `+ Matrix Link` (secondary relation), and Delete with confirmation.
* **Slide-Over Form Drawer (`AddStaffDrawer.tsx`):**
  * Right-aligned slide-over drawer with 4 core configuration fields:
    1. *Name & Role:* Text inputs for Full Name and Designation.
    2. *Department:* Radio group with Saffron Spiritual and Gold Admin selectors.
    3. *Primary Manager:* Searchable combobox with supervisor avatars, designations, search filter, and "None (Top Apex Leader / Dharmadhikari)".
    4. *Secondary Supervisors (Matrix Reporting):* Multi-select pill box with single-click remove tags.
  * Includes avatar gallery presets, emergency contact details, wing location, and active status selector.
* **Collapsible / Expandable Devasthanam Legend Popup:**
  * Located at the **top-right** corner of the canvas for clean viewing.
  * Includes inline **Hide (Chevron)** toggle to minimize into a floating trigger pill (**"Show Legend"** with `HelpCircle` icon).
  * Top toolbar toggle button (**"Legend"**) with `Eye` / `EyeOff` indicator.
  * **Interactive Filter Clicks:** Clicking directly on Saffron (Spiritual), Gold (Admin), Solid (Direct), or Dashed (Matrix) inside the legend instantly isolates and highlights those nodes and edges on the graph.
* **Toolbar Controls & Persistence:**
  * Live search input with real-time matching highlights, department filter pills (All, Spiritual, Admin), Matrix line visibility switcher, Auto Layout rebalance trigger, Add Staff trigger, Export to JSON, and Reset to Default Devasthanam Hierarchy.
  * Persistent storage in browser `localStorage` under `sankalpvani_org_chart`.

---

### 15. Administrative Reports Dashboard
*Located in:* `components/SystemOverview.tsx`

* **Infrastructure Health metrics:**
  * Server CPU load, API Latency, database sync states, and global Network Uptime tracking.
* **Dynamic Grouping Roster:**
  * Groups operational reports data by **Daily**, **Seva**, **Monthly**, and **Yearly** rows, with column-level sorting.
* **Report Criteria Filtering & Export:**
  * Date range filters and a downloadable CSV export trigger for offline spreadsheet reports.
* **Collections Analytics Grid:**
  * Bento performance cards showing Total collections (₹), bookings count, average ticket values (ATV), and logistics fulfillment rates.
* **Revenue Contribution Visualizers:**
  * Dynamic progress graphs showing pooja revenue percentages and logistics pipeline flows.

---

### 16. System Configuration & Safety Controls
*Located in:* `components/Settings.tsx`

* **Pilgrim Alerts Gateway Preferences:**
  * Checkbox toggles for Auto-dispatch SMS Tickets and End-of-day Roster Digests.
* **Administrative Security Controls:**
  * Session inactivity timeouts and password vs SMS MFA credentials configuration.
* **Factory Reset Diagnostics:**
  * "Reset Factory Presets" wipes localStorage and restores factory datasets cleanly.

---

## Architectural & Technical Highlights

1. **Sacred Theme Design System (`globals.css`):**
   * Curated color palette (Sacred Saffron `#8f4e00`, Deep Gold `#ff9933`, Divine Amber `#735c00`, Temple Vermilion `#b22b1d`, and Ivory Background `#fafaeb`).
   * Custom typography pairing: **Libre Caslon Text** (Serif) for headings and **Manrope** (Sans) for UI controls.
   * Sacred glow utility classes (`sacred-glow`), radial dot pattern overlays (`bg-pattern`), and golden borders (`divider-gold`).
2. **Interactive Graph & Flow Architecture:**
   * Uses React Flow (`@xyflow/react` v12) integrated with Dagre graphlib for acyclic hierarchical tree layout generation.
   * Implements custom SVG bezier paths with dual handle routing, animated stroke-dasharrays, and department-tailored Bento node components.
3. **Reusable TimeRangePicker Standalone Widget:**
   * Extracted custom touch/mouse scroll-wheel time selector to a standalone React component at `components/TimeRangePicker.tsx`. Employs CSS scroll snapping, drag-snapping listener delta adjustments, and meridian pill selects.
4. **Offline Resilience & Hydration Safety:**
   * Custom SSR hydration guard in `page.tsx` preventing React hydration mismatches.
   * State persistence across all sub-modules using browser `localStorage` lazy initializers and window-wide state sync events (`sankalpvani_bookings_updated`, `sankalpvani_priests_updated`).
5. **Git Remote Links:**
   * Local git repository linked to Vercel hosting source remote at `https://github.com/prahasanp07/sankalpavani-temple-admin-portal.git` in the `main` branch.

---

## Summary Matrix of Modules & Data Models

| Module Name | Component File | Primary Purpose | Key Features |
| :--- | :--- | :--- | :--- |
| **Authentication** | `LoginScreen.tsx` | Access control & login | Sacred card layout, session creation, password reset prompt |
| **Dashboard Portal** | `DashboardPortal.tsx` | Executive summary | KPI stats, w-full h-full object-cover temple banner card, 7-day trend chart, recent transactions, donut chart, quick actions |
| **Masters Hub** | `MastersHub.tsx` | Master indices gateway | 6 Sub-master directory cards, sync engine health indicator |
| **Priest Master** | `PriestMaster.tsx` | Acharyas registry | Priest directory table, status toggles, add & edit priest modals, specialization tags |
| **Seva Master** | `SevaMaster.tsx` | Pooja offerings setup | Offerings pricing matrix, inline editing, capacity limits, active/suspended toggle, time duration picker |
| **Temple Info** | `TempleInfo.tsx` | Core parameters | General contact info, photo upload, 4 collapsible darshan timing accordions, capacity rules |
| **Temple Facilities**| `TempleFacilities.tsx` | Guest amenities setup | 7 facility toggles with dynamic icon mapping and description |
| **Transactions** | `Transactions.tsx` | Financial & slip ledger | Searchable receipt ledger, column sorting, collapsible filtering, CSV export, pagination, expandable pilgrim roster rows (age/gender), QR-free traditional Darshan slip, numeric verification code |
| **Scheduling** | `Scheduling.tsx` | Priest duty roster | 4-day calendar roster grid, conflict safeguard validation, shift assignment modal |
| **Prasadam** | `Prasadam.tsx` | Remote shipping | Table-based shipment ledger, devotee booking order address ingestion, column sorting, collapsible filters, row multi-select, floating bulk actions drawer, packing label printing |
| **Calendar Roster** | `CalendarView.tsx` | Calendar workspace | Dynamic month grid, today default selections, gotra/nakshatra select dropdowns, age/gender inputs, dynamic multi-pilgrim rows, dynamic price calculator, real-time availability indicators (Green/Amber/Red), strict past date validation safeguards, inline status dropdown selectors |
| **Org Chart & Matrix** | `OrgChartCanvas.tsx` | Devasthanam organization tree | React Flow canvas, Dagre auto-layout, solid primary & dashed animated matrix lines, Bento node cards, double-click to Edit Staff Profile, 4-field slide-over drawer, top-right collapsible legend, instant filter pills |
| **System Overview** | `SystemOverview.tsx` | Operational reports | Operational analytics grid (ATV, Collections), CPU/Latency metrics, report table (Daily/Seva/Monthly/Yearly grouping), column sorting, date filters, CSV reports |
| **Settings** | `Settings.tsx` | System configuration | SMS/Email digest alerts, session timeouts, factory reset diagnostic |

---
*Report compiled automatically for SankalpVani Devasthanam Administration.*
