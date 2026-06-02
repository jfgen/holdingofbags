# Landing Page — Design Spec

**Date:** 2026-06-03

## Overview

A public-facing landing page at `/` that introduces Holding of Bags to new visitors. It replaces the current behaviour where `/` redirects straight to the app. Visitors see the product pitch, features, social proof, and pricing before deciding to sign up or sign in.

The page is implemented as a new React route inside the existing SPA — no URL restructuring, no separate HTML file, no build config changes.

---

## Route & Navigation

- `/` → `LandingPage` component (public, no auth required)
- `/login` and `/register` remain unchanged
- `RequireAuth` already only wraps group routes; no changes needed there
- The nav bar on the landing page links to `/login` (Sign In) and `/register` (Get Started Free)
- After login/register, the app continues to redirect to `/groups` as today

---

## Page Structure

Sections top to bottom:

1. **Nav**
2. **Hero**
3. **Features**
4. **Testimonials**
5. **Pricing**
6. **Footer**

---

## Sections

### 1. Nav

Fixed-height bar across the full page width.

- Left: ⚔️ logo mark + "Holding of Bags" wordmark
- Right: "Sign In" ghost button → `/login`, "Get Started Free" primary button → `/register`
- No other nav items

### 2. Hero

Two-column split layout, full viewport height suggestion (~380px min).

**Left column — copy:**
- Eyebrow label: `TTRPG Loot Manager` (small caps, purple)
- Headline: *"Your party's loot, always in hand"* — "always in hand" in accent purple
- Subheadline: *"No more lost notebooks. No more 'I think I had that potion?' Holding of Bags keeps your group's items, coins, and hoard in one place — accessible to everyone, any time."*
- Primary CTA: `Create Your Group →` → `/register`
- Secondary text link: `Sign in` → `/login`

**Right column — image:**
- A photograph of people playing TTRPG around a table (warm, atmospheric)
- Source: Unsplash free licence (search: `tabletop rpg`, `dnd table`, `people playing board game`)
- A left-edge gradient overlay fades the photo into the dark hero background so the two columns blend
- Image is `object-fit: cover` to fill the column at any height

### 3. Features

Four-column grid of cards.

Section header: *"Everything your party needs"* / *"Built for the table, designed to get out of the way"*

| Icon | Title | Body |
|------|-------|------|
| ☁️ | Cloud-based & always accessible | Your loot lives in the cloud. Open it on your phone, laptop, or tablet — mid-session or between sessions. If you have a browser, you have your hoard. |
| ⚡ | Up and running in minutes | Create a group, share the invite link, and your whole party is in. No downloads, no configuration. Just send the link and roll. |
| 🎒 | Shared hoard, per-character inventory | Add items to the party hoard, then assign them to individual characters. Split stacks, move between players, or keep it communal — your call. |
| 👁️ | Everything at a glance | Board view shows each character's items side by side. List view gives you a flat table to search and sort. Coin pool always visible. Nothing buried. |

### 4. Testimonials

Three-column grid of quote cards. Section background is one shade darker (`#11111b`) to visually separate it from the features and pricing sections.

Section header: *"Loved by parties everywhere"* / *"Real players, less time on admin, more time rolling dice"*

Each card contains:
- Pull quote (the testimonial text)
- Large decorative opening quotation mark (CSS `::before`, dim colour)
- Author row: emoji avatar, name, role + game system, ★★★★★ rating flush right

**Testimonial content (placeholder — replace with real quotes before launch):**

| Avatar | Name | Role | Quote summary |
|--------|------|------|---------------|
| 🧙 | Marieke V. | DM · D&D 5e | Replaced spreadsheet + shared note + someone's memory. Now argue about tactics, not who has the potion. |
| 🐉 | Tomás R. | Player · Pathfinder 2e | DM set it up 5 min before the session, sent a link, everyone was in before the first roll. |
| ⚔️ | Priya S. | Player · Shadowdark | Board view lets her see every inventory at once. Used to lose 10 min/session figuring out who carried what. |

### 5. Pricing

Two-column tier comparison, centred with a max-width of ~720px, so the cards don't stretch too wide on a 1200px container.

Section header: *"Simple pricing"* / *"Start free. Upgrade when your party needs more."*

**Free — €0/month**
- Shared loot hoard
- Per-character item assignment
- Stack splitting & item moves
- Group coin pool (5 denominations)
- Invite members via link
- Board & list views
- Unlimited groups

CTA: `Get Started Free` (ghost button) → `/register`

**Proficient — €5/month** *(featured: purple border + glow + badge)*
- Everything in Free
- *(section label: Power features)*
- Item weight management
- D&D 5e open API integration
- Pathfinder 2e open API integration
- Shadowdark integration
- Random loot generator
- Early access to new features

CTA: `Upgrade to Proficient →` (purple filled button) → `/register` *(or a future upgrade flow)*

Both cards use `display: flex; flex-direction: column` with `flex: 1` on the feature list so the CTA buttons are always bottom-aligned regardless of feature count.

### 6. Footer

Minimal one-line bar.

- Left: `© 2026 Holding of Bags`
- Right: `Sign In` → `/login`, `Create Account` → `/register`

---

## Interactions

All buttons share a `transition` on `background`, `border-color`, `color`, `opacity`, and `transform` at `0.2s ease` (transform at `0.15s`).

| Button | Hover state |
|--------|-------------|
| Ghost (Sign In, nav free button, tier free) | Border + text shift to purple (`#cba6f7`) |
| Primary / CTA (filled purple) | Darken to `#6d28d9` + `translateY(-1px)` lift |
| Text link (hero "Sign in") | Fade to full white |
| Footer links | Fade from dim (`#585b70`) to `#a6adc8` |

---

## Implementation Notes

- **New file:** `frontend/src/pages/LandingPage.tsx`
- **Router:** add `<Route path="/" element={<LandingPage />} />` before the catch-all in `App.tsx`
- **Hero image:** download a free Unsplash photo and save it to `frontend/public/hero.jpg`. Reference it as `/hero.jpg` in the `<img>` tag. Suggested search terms: `tabletop rpg`, `dnd game night`, `people playing dungeons and dragons`. Unsplash licence allows free use without attribution for web products.
- **Styling:** Tailwind utility classes, consistent with the rest of the app. No new dependencies.
- **No backend changes required.**

---

## Out of Scope

- Mobile / responsive layout (deferred to a future pass)
- Real testimonials (placeholder copy ships; replace before public launch)
- Proficient upgrade flow (button links to `/register` for now)
- Animations beyond CSS hover transitions (scroll reveals, parallax, etc.)
