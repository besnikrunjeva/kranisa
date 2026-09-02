# Kranisa — Apple-Design Review & Plan

_Reviewed against the `apple-design` skill (Designing Fluid Interfaces, WWDC 2018 + Principles of Great Design). Baseline commit: `cfc5b8b`. Scope: `client/`._

**Status:** Plans **1, 2, 3, 4, 5A implemented** (2026-08-30) and verified on localhost. Remaining: 5B (px→rem type migration), 6–7 (optional, feel-check).

## Verdict

The interface is already close. Motion is restrained and mostly correct: the staggered `hero-rise` entrance, the translucent scroll-shrink header pill ([Header.jsx:27](../client/src/components/Header.jsx#L27)), the Radix price slider's native 1:1 tracking, the date-picker Popover's origin-aware zoom+fade ([popover.tsx:24](../client/src/components/ui/popover.tsx#L24)), the cobe globe syncing to live theme tokens, and the entrance + press-feedback pass just added all hold up.

The gaps below are **consistency, symmetry, and accessibility** — not "add more motion." They're ordered by leverage (impact ÷ effort).

---

## Findings

| # | Sev | Apple principle | Location | Finding | Fix |
|---|-----|-----------------|----------|---------|-----|
| 1 | HIGH | §7 Spatial consistency / §16 Familiarity | [LanguageToggle.jsx:43](../client/src/components/LanguageToggle.jsx#L43), [DestinationSelect.jsx:81](../client/src/components/DestinationSelect.jsx#L81) | Two hand-rolled dropdowns teleport in **and** out with a flat solid surface, while the date-picker Popover animates (zoom+fade from its placement). Same UI pattern, three different behaviors → the app feels inconsistent. | Add an origin-anchored `menu-in` entrance and unify the surface. |
| 2 | MEDIUM | §7 Symmetric paths | [Header.jsx:57](../client/src/components/Header.jsx#L57) | The mobile nav drawer now animates **open** (`drawer-in`, just added) but still snaps **closed** via `display:hidden`. Enter and exit must travel the same path. | Keep the panel mounted; drive open/close with mirrored transitions. |
| 3 | MEDIUM | §14 Reduced motion / transparency | [HeroGlobe.jsx:69](../client/src/components/HeroGlobe.jsx#L69), [Header.jsx:29](../client/src/components/Header.jsx#L29) | The globe auto-rotates forever with no `prefers-reduced-motion` check (a slow persistent oscillation — exactly what §14 warns against). `backdrop-blur` chrome has no `prefers-reduced-transparency` / `prefers-contrast` fallback. | Stop rotation under reduced-motion; solidify glass under reduced-transparency. |
| 4 | LOW | §1 Response / §10 Reach | [button.tsx:8](../client/src/components/ui/button.tsx#L8), [NewestOffers.jsx:46](../client/src/components/NewestOffers.jsx#L46) | Press scale runs `duration-150`; Apple presses land ~100ms. Heart + carousel-chevron buttons are 32px (`h-8 w-8`), under the 44px touch minimum. | Tighten to 100ms; grow the hit area to 44px. |
| 5 | MEDIUM | §15 Typography | section `h2`s app-wide; body type | Large section headings ([PopularDestinations.jsx:18](../client/src/components/PopularDestinations.jsx#L18), [CompareSection.jsx:37](../client/src/components/CompareSection.jsx#L37), [NewestOffers.jsx:82](../client/src/components/NewestOffers.jsx#L82), FAQ, offer detail `h1`) carry **no negative tracking** — only the hero does. Body/detail type is pervasive fixed-px (`text-[14px]`, `text-[12.5px]`…), so it ignores the user's text-size setting. | Add `tracking-[-0.01em/-0.02em]` to headings (cheap); phase a px→rem type scale (larger). |
| 6 | OPT | §7 Continuity | route changes ([SearchPage.jsx:28](../client/src/pages/SearchPage.jsx#L28), [OfferCard.jsx:26](../client/src/components/OfferCard.jsx#L26)) | Search→results and card→detail are hard cuts. React Router 7 supports the View Transitions API for cheap cross-route continuity (offer image → detail hero). | Opt-in `viewTransition`; **feel-check required**. |
| 7 | OPT | §14 Brightness easing | [ThemeSwitcher.jsx:18](../client/src/components/ThemeSwitcher.jsx#L18) | Light↔dark hard-cuts the whole page — the abrupt brightness jump §14 flags. _(Note: rejected earlier on frequency/jank grounds; included here for the Apple lens with that tension flagged.)_ | Short root-scoped color transition — **only if a feel-check likes it.** |

---

## Plans

All new keyframes reuse the house curve `cubic-bezier(0.16, 1, 0.3, 1)` and go in [index.css](../client/src/index.css) beside the existing ones. Every one is `prefers-reduced-motion` guarded.

### Plan 1 — Unify dropdown entrances (HIGH)

**Why:** one menu pattern should behave one way. Anchor each to its trigger (§7).

**CSS** (add to index.css, and to the reduced-motion guard block):
```css
@keyframes menu-in {
  from { opacity: 0; transform: scale(0.96) translateY(-4px); }
  to   { opacity: 1; transform: none; }
}
.menu-in { animation: menu-in 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
/* in @media (prefers-reduced-motion: reduce): .menu-in { animation: none; } */
```

**LanguageToggle.jsx** — the panel at line 44 is right-aligned, so its origin is the top-right:
- add `menu-in origin-top-right` to the panel's className.

**DestinationSelect.jsx** — the listbox at line 82 spans the field width; origin is the top:
- add `menu-in origin-top` to the listbox className.

**Surface consistency (optional, same pass):** give both panels a translucent material to match Apple chrome — `bg-popover/80 backdrop-blur-xl supports-[backdrop-filter]:bg-popover/70` in place of the flat `bg-popover`/`bg-card`. Keep the existing `shadow-lg`.

**Scope boundary:** enter-only (both unmount on close, so no exit animation needed — the pop-out is instant, which is acceptable for small menus). Do not touch the date-picker Popover; it already animates.

**Verify:** open each in slow-motion (DevTools → Rendering → 10% speed). The menu should grow from the corner nearest its trigger, not the center.

---

### Plan 2 — Symmetric mobile-drawer exit (MEDIUM)

**Why:** §7 — a panel that animates in must animate out the same way.

**Header.jsx** — the panel currently switches `open ? 'block drawer-in' : 'hidden'`. Keep it mounted and mirror the path instead:

```jsx
// panel className: always rendered; visibility + motion by state
className={cn(
  'bg-card/95 fixed top-16 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-border md:hidden',
  'transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
  open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'
)}
```
- Remove the `drawer-in` keyframe usage here (the transition supersedes it; the `.drawer-in` rule can stay for now or be removed if unused elsewhere).
- Keep `aria-hidden={!open}` semantics via the `pointer-events-none` + `opacity-0` closed state so it's inert when closed.

**Reduced motion:** add `motion-reduce:transition-none` so it cross-fades only.

**Verify:** open then close at 10% speed — the panel should retract up-and-fade along the same 8px path it entered on, and the hamburger↔X icon (already 300ms) should feel paired with it.

---

### Plan 3 — Accessibility signals (MEDIUM)

**3a — Globe respects reduced motion.** In [HeroGlobe.jsx](../client/src/components/HeroGlobe.jsx), gate the rotation `speed`:
```jsx
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
// ...
speed={reduce ? 0 : 0.0025}
```
(Optionally subscribe to the media query's `change` like the theme sync already does.)

**3b — Glass degrades.** Add to index.css:
```css
@media (prefers-reduced-transparency: reduce) {
  .backdrop-blur-lg, .backdrop-blur-xl { backdrop-filter: none !important; }
  /* pair with an opaque bg on the header wrapper */
}
@media (prefers-contrast: more) {
  :root { --color-border: #000; } /* or a defined high-contrast border token */
}
```
Verify by toggling the three flags in DevTools → Rendering.

---

### Plan 4 — Press timing + reach (LOW)

- **button.tsx:8** — change `duration-150` → `duration-100` in the base class (press lands faster; §1). Leave `active:scale-[0.98]`.
- **NewestOffers.jsx** — heart button (line 46) and both chevrons (lines 84, 92): keep the visual 32px circle but grow the tap target to 44px with padding, e.g. wrap the icon so the button is `h-11 w-11` or add `p-2.5` and keep the icon centered. Preserves layout density while meeting the touch minimum.

---

### Plan 5 — Typography discipline (MEDIUM, phased)

**Phase A (cheap, do now):** add negative tracking to large headings — `tracking-[-0.01em]` on `text-2xl`, `tracking-[-0.02em]` on `text-3xl`/`text-4xl`. Locations: PopularDestinations:18, CompareSection:37, NewestOffers:82, AllOffersPage title, OfferDetailPage `h1`, FAQ section title. The hero already does this — this makes the rest match.

**Phase B (follow-up, larger):** migrate the fixed-px type scale (`text-[14px]`, `text-[12.5px]`, `text-[13px]`…) to a small set of rem-based tokens so type honors the user's browser font-size setting (§15 Dynamic Type). Do this as a token pass, not scattered edits — define `--text-caption/body/…` and replace call sites. Out of scope for a quick win; tracked here.

---

### Plan 6 — Cross-route continuity (OPTIONAL, feel-check)

React Router 7 exposes the View Transitions API. Add `viewTransition` to the offer `<Link>` ([OfferCard.jsx:26](../client/src/components/OfferCard.jsx#L26)) and give the card image + detail hero image a shared `view-transition-name`, so tapping an offer morphs the photo into the detail header instead of hard-cutting. **Prototype and feel-check before committing** — a bad shared-element transition is worse than a clean cut. Guard with `prefers-reduced-motion`.

---

### Plan 7 — Theme-change easing (OPTIONAL, tension flagged)

§14 wants the big light↔dark brightness jump eased; an earlier pass rejected a full-page color crossfade on frequency/jank grounds. Reconcile with a **short, root-scoped** transition only:
```css
:root { transition: background-color 180ms ease, color 180ms ease; }
@media (prefers-reduced-motion: reduce) { :root { transition: none; } }
```
Apply narrowly (root/body + surfaces), keep it ≤200ms, and **feel-check on a real toggle** — if it reads as sluggish, drop it. This is the one item where the two skills genuinely disagree; ship only if the feel-check favors it.

---

## What's already right (don't touch)

- `hero-rise` staggered entrance + its reduced-motion guard.
- Header translucent scroll-shrink pill (`backdrop-blur-lg` + `bg-card/80`).
- Radix price slider — native pointer-capture 1:1 tracking.
- Date-picker Popover — origin-aware zoom-in-95 + fade, symmetric enter/exit.
- Cobe globe reading live `--color-*` tokens for light/dark/any theme.
- The card-entrance stagger + global `active:scale` press (added this session).

## Suggested order

1 → 4 (both cheap, high daily-touch payoff) → 2 → 3 → 5A. Then decide 5B / 6 / 7 with feel-checks.
