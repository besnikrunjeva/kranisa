# Kranisa — MVP Design

## Problem

Travel shoppers in Kosovo/Albania have to check each agency's Facebook page,
Instagram, or website individually to compare package holiday prices for the
same dates and group size. There's no single place to compare offers across
agencies.

## Scope (v1)

A comparison/discovery site: users enter destination + dates + party size and
see matching package-holiday offers from multiple agencies, sorted by price.
Clicking an offer links out to the agency (site, WhatsApp, or phone) — no
booking or payment happens on this platform.

**Explicitly out of scope for v1** (future sub-projects):
- Automated scraping/ingestion from agency websites or social media.
- Agency self-serve accounts/dashboard.
- Custom/flexible trip quotes (only pre-built package holidays for v1).
- On-site booking or payment.

Offer data for v1 is entered manually by the site owner via an admin panel,
sourced from checking agency Facebook/Instagram pages and the handful of
agencies that do have real websites.

## Target market

Kosovo/Albania region. Site supports Albanian and English, with **Albanian as
the primary language** — Albanian copy is the default and takes visual
priority; English is a secondary toggle, not an equal-weight option.

## Brand

Name: **Kranisa** (chosen over Farovo/Skovia and others after a naming pass —
Albanian-flavored, coined, cleared a trademark/domain collision check).

Visual direction: pure white ground (no dark-mode swap — deliberately
single-theme), crimson red (`#C81E3A`) as the sole loud accent for the
wordmark/CTAs/prices, deep pine green (`#1F5E4A`) held in reserve for
secondary marks, amber for a "best price" badge, neutral charcoal ink
(`#1A1A1A`) rather than warm-toned text. Wordmark and headings use a bold
geometric sans (Futura/Avenir Next style), body text a system sans, prices
set in tabular numerals. Each offer card carries its own agency-color mark
so a long results list stays scannable rather than blurring together
(a usability issue observed in a competitor, Wanderu, during naming
research). Reference mock: see the "Kranisa" artifact produced during
brand ideation for the canonical look.

## Architecture

- **Frontend:** React + Vite + Tailwind, hosted on Render as a static site.
- **Backend:** Node/Express REST API, hosted on Render as a web service.
- **Database:** Postgres (Render managed Postgres).
- **Admin panel:** Login-gated routes in the same app (email/password auth,
  single admin user for v1 — no public signup). CRUD screens for offers.
- **UI components:** sourced via 21st.dev (Magic MCP) rather than hand-rolled
  from scratch; visual design pass follows a frontend-design skill so the
  result doesn't read as generic AI-template output.

## Data model

- **`agencies`**: id, name, logo_url, contact_link (WhatsApp/site/phone),
  notes.
- **`destinations`**: id, name (canonical list, e.g. "Antalya, Turkey") — kept
  as a fixed/curated list so filtering doesn't fragment on spelling variants.
- **`offers`**: id, agency_id (FK), destination_id (FK), start_date, end_date,
  nights, price_per_person, currency, board_type (all-inclusive/half-board/
  etc), star_rating, capacity (max people), image_url, external_link,
  created_at, updated_at.

## Core components

1. **Public search** — destination picker, date range, party size → results
   list.
2. **Offer card** — agency name/logo, destination, dates, nights, price per
   person, board type, star rating, photo, "View Offer" button (opens
   agency's external link/WhatsApp/phone in a new tab).
3. **Admin panel** — login, offer list (sortable, flags expired offers),
   add/edit/delete form with validation.
4. **Backend API** — public read-only search endpoint with filters
   (destination, date range, party size); protected CRUD endpoints for
   agencies/destinations/offers, gated by admin auth.

## Data flow

**Search:** Frontend calls
`GET /api/offers?destination=...&dateFrom=...&dateTo=...&people=...` →
backend queries Postgres for offers matching destination, whose travel dates
overlap the requested range, and whose capacity covers the party size →
returns results sorted by price ascending → frontend renders offer cards.
Clicking "View Offer" opens the agency's external link — no data is sent back
to the platform beyond an optional simple click counter for the site owner's
own visibility into what's popular.

**Admin:** Admin logs in → sees offer list → adds/edits/deletes offers via a
form → saved through protected API routes with validation.

## Error handling

- No matching offers → friendly empty state ("No offers found for these
  dates — try adjusting your dates or destination"), not a blank page.
- Offer form validation: required fields, end date after start date, price >
  0, valid image URL.
- Offers whose travel dates have already passed are auto-excluded from
  public search results, but remain visible in admin for cleanup.
- Admin auth failure → redirect to login. API errors surface as a
  toast/banner on the frontend, not a silent failure.

## Testing

- Backend: unit tests for the search/filter query logic (date-range overlap,
  destination matching, capacity filtering) — this is the core business
  logic worth protecting.
- Admin CRUD: integration tests against protected endpoints (auth required,
  validation rejects bad input).
- Frontend: manual verification in-browser for v1 (search flow, empty state,
  admin add/edit/delete) rather than a full e2e suite, matching the
  "lean MVP, fast to build" goal.

## Future work (separate sub-projects, not this spec)

- Automated scraping/ingestion pipeline for the dozen+ agencies that have
  real structured websites, once the core product has validated demand.
- Agency self-serve dashboard, pitched to agencies once the site has
  traffic to offer them ("we send you visitors, you keep your offers
  fresh").
- Custom/flexible trip quote requests (RFQ-style), as a second offer type
  alongside package holidays.
