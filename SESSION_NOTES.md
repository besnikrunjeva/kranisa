# Kranisa — Session Notes (through 2026-08-28)

Handoff doc for continuing this project in a new conversation. Paste this in, or point a new Claude Code session at this file (`/Users/macbookpro/kranisa/SESSION_NOTES.md`).

## What Kranisa is

A Kosovo/Albania travel-offer comparison site. Regular people search a destination + dates, see every agency's current offer side by side, and contact the agency directly (WhatsApp/phone/site) to book — Kranisa never touches the booking or payment. Free for travelers. Agencies list for free. Positioning is built entirely around **trust**: only real, currently-available, manually-checked offers; sponsored listings always labeled; Kosovo/Albania agencies only.

Repo: `/Users/macbookpro/kranisa` (git). Frontend `client/` (React 19 + Vite 8 + Tailwind v4). Backend `server/` (Express + Postgres, `DATABASE_URL=postgres://localhost:5432/kranisa`).

## Brand direction (locked)

As of 2026-08-28 (later in this session), replaced "Peak & Route" (warm sand/rust/sage, Lora/Nunito Sans) with a blue/white theme built on the "Modern Minimal" 21st.dev community theme (serafimcloud): primary `#3b82f6`, Inter (headings + body), JetBrains Mono. Page background and cards stay white; blue shows through accent surfaces instead — `--color-border`, `--color-surface-2`, and `--color-accent` are all blue-tinted, which shows up on nearly every card/panel/badge site-wide via `border-border`/`bg-surface-2`. Real dark mode exists too (`:root.dark` in `client/src/index.css`, toggled by the footer's Sun/Moon switch) — Modern Minimal's own dark neutrals for bg/card, with the same blue-tinted accent layer. Tokens live in `client/src/index.css` under `@theme` (light) and `:root.dark` (dark), both as raw vars (`--color-bg`, `--color-primary`, etc.) and shadcn-standard aliases (`--color-background`, `--color-card`, etc.) pointing at the same values. The old `--color-muted` double-definition bug is gone — it's now defined once.

Components are pasted-and-adapted from 21st.dev/shadcn (not npm-installed as black boxes) — that's the established workflow for any new UI piece: search 21st.dev, evaluate fit against the actual page's job (not just "looks cool"), adapt colors/tokens, paste into `client/src/components/ui/`.

## What got built this session

- **Full visual rebuild** of the previous "ProjectOne" look into Peak & Route, across search page, admin panel, all core components.
- **Results page** (`/rezultatet`) — separate from home, filter sidebar, sort toggle, loading/error/empty states.
- **Destination picker** — type-to-filter combobox (`DestinationSelect.jsx`), restricted to real DB destinations only (deliberate: never suggest a place with zero offers).
- **Popular Destinations grid** (`PopularDestinations.jsx` + `ui/destination-card.jsx`, adapted from 21st.dev) — clicking a card scrolls up and pre-fills the search form's destination (doesn't navigate straight to results, since dates are still required).
- **Why Kranisa trust bar** (`WhyKranisa.jsx`) — revived the `why.point1-4` i18n keys that existed but were never rendered.
- **"No exact match" fallback** — when a dated search returns zero offers, the site now automatically shows the destination's other real current offers instead of a dead end. Backend `searchOffers` now takes optional dates (`server/src/db/offers.js`, `server/src/routes/offers.js`); `client/src/pages/ResultsPage.jsx` fetches the fallback and renders it under "No match for these dates — here's what's actually available."
- Removed the shadow from the search bar (`shadow-lg` dropped from `SearchForm.jsx`).

## Full-site audit (52 findings)

Ran 5 parallel skill-based audits (code quality/security, accessibility/performance, SEO/AEO, UX/IA, design-system/i18n/voice) against the real codebase. Published as an artifact: **https://claude.ai/code/artifact/da0847fb-ecd5-47ab-a69b-6100da090cb7** (note: the live watch on this disconnected, so re-read it directly if referencing).

Top items **not yet fixed**, in rough priority:
1. **No SSR/prerendering** — pure client-rendered SPA, so Bing and most AI crawlers (GPTBot, ClaudeBot, PerplexityBot) won't see any content. Also no robots.txt/sitemap, one static `<title>` for every route.
2. **Destination combobox lets you submit unmatched text** with no warning (`DestinationSelect.jsx`).
3. **No Express error-handling middleware**; admin delete/create-agency have no confirm dialog and no error handling.
4. **No rate limiting on admin login, CORS wide open** (`server/src/app.js`).
5. **Two trust promises in the FAQ aren't built**: "no sponsored offer is ever hidden" (no sponsored-badge logic exists) and "every offer is checked manually" (no verified indicator on cards).
6. **745 KB single JS bundle**, no route-based code-splitting — admin panel ships to every anonymous visitor.
7. Accessibility: globe ignores `prefers-reduced-motion`, some contrast failures on the primary/orange tokens, `OfferForm` inputs have no `<label>`s.
8. 19 dead i18n keys (`how.*`, `why.point1-4` — now partially revived by the trust bar — `agency.*`, `footer.*`, `destinations.title`).
9. Admin/forms pages (`AgencyForm.jsx`, `OfferForm.jsx`, `AdminLoginPage.jsx`, etc.) use a totally different hardcoded palette, not the token system at all.

Full detail for all 52 is in the artifact.

## Business/strategy decisions made (not code, but load-bearing)

- **Monetization sequencing**: free listing now → paid sponsored placement once there's real traffic → maybe direct ad sales later. **Commission-per-booking was explicitly rejected** as a default plan — booking happens off-platform so it's unenforceable, and it directly contradicts the "No commission" promise already sitting in `why.point1` / the FAQ. Whether to build in-platform booking (which *would* make commission trackable) is still explicitly undecided — flagged as a phase-2-at-earliest question, not a pre-launch one, given the payment/legal/liability scope jump involved.
- **Agency outreach**: lead with "free marketing, zero commitment," not a formal ask. Don't publish scraped offers live without at least a heads-up to the agency first (see below).
- **Facebook/Instagram ads**: corrected a premise — Meta doesn't have a website ad network equivalent to Google AdSense (Audience Network was app-only and is being wound down). If revenue ads are wanted later, AdSense is the real option, but direct sponsorship deals with the actual listed agencies will out-earn a generic ad network at this site's scale, and keeps ad content relevant/trustworthy.
- **Autonomous scraping pipeline**: user asked about a fully autonomous, zero-human-touch system to keep scraping agency Instagram accounts forever. Flagged two real risks (ongoing ToS violation risk vs. a one-off pull; zero review means bad AI-parses go live unchecked, contradicting the "manually checked" promise) and recommended instead: Instagram Graph API with each agency's consent (their connecting *is* the confirmation) + AI-parse-then-one-click-admin-approve, not silent auto-publish. **Not built** — parked for later.

## Instagram scrape → seeded test data

User provided two Apify scrape datasets (`~/Downloads/dataset_instagram-post-scraper_...json`, 1360 posts across 142 profiles, and a broken/empty profile-scraper dataset). Filtered to **12 real Kosovo/Albania travel agencies** (the rest was noise — Belize/Costa Rica resorts, NGOs, unrelated personal accounts, pulled in by related-profile drift). Extracted real contact info (phone/email) for 9 of the 12.

Real demand analysis: only ~37% of real agency offers matched Kranisa's original 6 destinations — the rest spanned 25+ places across a dozen countries. This directly motivated moving toward a broader real destination list instead of a hand-typed handful.

**Seeded into the local dev DB** (not published, local-only, per the consent discussion above):
- 7 real agencies (Kalemi Travel Kosova, Travel Partner AL, Sense Travel, Top Tours, EU Travel, My Travel, Star Tours) with real contact links.
- 18 new destinations (Halkidiki, Corfu, Zakynthos, Sivota, Budva, Alberobello, Nice, Vlorë, Shëngjin, Ksamil, Budapest, Saint Julian's/Malta, Prague, Marbella, Barcelona, Dubrovnik, Mauritius, Istanbul) — DB now has 24 total.
- 18 real offers, every price/date/board-type taken directly from an actual Instagram caption, each linking back to the real source post. (Halkidiki, Shëngjin, Ksamil got destination rows but no offer — their posts had either passed dates or open-ended per-night pricing with no fixed date, so nothing was invented for them.)

**Not yet done**: sending outreach to the 12 real agencies (message draft was proposed but not written/sent — they need at minimum a heads-up before any of their real content/offers go live publicly, per the consent discussion). Also not done: the "surprise me" feature, beach/city-break split, family/adults-only filter, discount badges — all proposed as feature ideas grounded in the scrape but not built.

## Skills

The full RampStack Claude Skills catalog (103 skills covering the whole website lifecycle — brand, design, content, SEO, dev/QA, growth, research) is installed and up to date at `~/.claude/skills/`, alongside ~65 unrelated skills from a different set. They auto-trigger by context or can be invoked directly (e.g. `/design-system`).

## Immediate next-step candidates (not yet decided by user)

- Fix any of the 52 audit findings (SEO/SSR is the highest-leverage one).
- Draft and send the agency outreach messages using the pre-built offer pages as the pitch.
- Build one of the scrape-inspired features (Surprise Me, Beach/City split, Family/Adults filter, discount badges).
- Decide the in-platform-booking question before it becomes load-bearing on the monetization model.
