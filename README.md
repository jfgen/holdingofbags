# Holding of Bags — TTRPG Loot Manager

## Setup

```bash
cp backend/.env.example backend/.env
npm install
npm run db:up
npm --workspace backend run prisma:migrate
npm run dev
```

Backend: http://localhost:3001 · Frontend: http://localhost:5173

## Planned improvements

### Features (out of scope for v1)
- Drag-and-drop move between board columns — drop an item card on a character/hoard column as an alternative to the Move modal. Modal stays for precise quantity selection on big stacks.
- Character thumbnails — let players upload an image (or pick from a portrait set) in addition to the current emoji. Emoji becomes a small badge on the avatar.
- Email confirmation on sign-up — send a verification link before the account is active; block login until confirmed. Also needed for:
  - Email-delivered invite links (the `email` field on `Invite` is currently unused).
  - Password reset flow.
- App branding and graphics — logo, favicon, a landing page, themed background art for the board, and empty-state illustrations (e.g. for the "no groups yet" dashboard state).
- Real-time sync across sessions — currently a manual refresh (or any mutation by the current user) updates the board. Sockets or polling would let multiple players see moves live.
- Per-character coin pouches — coins are group-shared right now. A D&D 5e game commonly tracks coin per PC.
- Item categories, tags, and attunement slots.
- Admin / GM-only permissions — today any member can add, move, and delete any item. Tables often want a session lead with final say.

### UX
- Responsive / mobile layout pass. The board view scrolls horizontally on desktop; a small-screen layout (stacked columns or tabs) is needed.
- Keyboard shortcuts (e.g. `n` for new item, `/` to focus search, `esc` closes modals — Escape is already wired).
- Undo for delete / move operations. A transient "undo" toast would avoid needing the `confirm()` dialog.
- Activity log of who added/moved/deleted what (needs an audit table plus a feed UI).
- Group settings page — rename group, change founder, revoke invites, remove members.
- Per-character sheets (character emoji as avatar is the seed).

### Infrastructure
- Rate limiting + brute-force protection on `/api/auth/*`.
- Request-id tracing and structured logging (pino or similar); plumb through errors to a real error tracker.
- HTTPS behind a real reverse proxy (nginx / Caddy) and a production Dockerfile per service.
- CI (GitHub Actions): lint, typecheck, backend Jest, frontend Vitest, frontend build on every PR.
- Prisma seed script for local dev (sample group + items + coins) so new contributors see data immediately.
- Integration tests covering the full stack (Playwright) replacing the manual smoke test in `docs/superpowers/plans/2026-04-14-ttrpg-loot-manager.md` Task 21.
- Upgrade Prisma 5 → 7 and bump vitest/vite majors (noted during install as available).

