# TTRPG Loot Manager — Design Spec

**Date:** 2026-04-13

## Overview

A web application for TTRPG groups to manage shared loot. Groups have a treasure hoard (items + coins) and member characters. Any member can assign items from the hoard to a character, move items between characters, or return items to the hoard. Partial stack assignment is supported.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui (Catppuccin Mocha theme) |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (Authorization: Bearer header) |
| Frontend testing | Vitest + React Testing Library |
| Backend testing | Jest |

---

## Data Model

### User
- `id` uuid PK
- `username` text (unique)
- `email` text (unique)
- `passwordHash` text
- `createdAt` timestamp

### Group
- `id` uuid PK
- `name` text
- `founderId` FK → User
- `createdAt` timestamp

### Invite
- `id` uuid PK
- `groupId` FK → Group
- `token` text (unique) — the secret embedded in the invite link
- `email` text (nullable)
- `status` enum: `PENDING | ACCEPTED | EXPIRED`
- `expiresAt` timestamp

### GroupMember *(join table between User and Group; holds the character)*
- `id` uuid PK
- `userId` FK → User
- `groupId` FK → Group
- `characterName` text
- `characterEmoji` text — chosen from a curated TTRPG emoji set
- `joinedAt` timestamp
- UNIQUE(userId, groupId)

### Item
- `id` uuid PK
- `groupId` FK → Group
- `memberId` FK → GroupMember (nullable) — `null` = in hoard, set = character's inventory
- `name` text
- `description` text
- `amount` int (≥ 1)
- `value` decimal
- `createdAt` / `updatedAt` timestamps

### GroupCoins *(one row per group, created with the group)*
- `id` uuid PK
- `groupId` FK → Group (unique)
- `platinum` int
- `electrum` int
- `gold` int
- `silver` int
- `copper` int

---

## API

All routes prefixed `/api`. All group/item routes require the requesting user to be a member of the target group (enforced by middleware).

### Auth
```
POST /api/auth/register          — self-registration (username, email, password)
POST /api/auth/register/invite   — invite-based registration (token, username, email, password, characterName, characterEmoji)
POST /api/auth/login             — returns JWT
GET  /api/auth/me                — current user info
```

### Groups
```
POST /api/groups                           — create group (body: groupName, characterName, characterEmoji)
GET  /api/groups                           — list groups the current user belongs to
GET  /api/groups/:groupId                  — group details, members, coins
POST /api/groups/:groupId/invites          — generate invite link (founder only)
GET  /api/invites/:token                   — look up invite info for the registration page
```

### Items
```
GET    /api/groups/:groupId/items                   — all items (hoard + all characters)
POST   /api/groups/:groupId/items                   — add item to hoard
PATCH  /api/groups/:groupId/items/:itemId           — edit item (name, description, amount, value)
DELETE /api/groups/:groupId/items/:itemId           — delete item
POST   /api/groups/:groupId/items/:itemId/move      — move item (body: quantity, destinationMemberId — null = hoard)
```

### Coins
```
PATCH /api/groups/:groupId/coins   — update coin amounts (body: { platinum, electrum, gold, silver, copper })
```

The `move` endpoint handles all transfer cases: hoard → character, character → hoard, character → character. It validates `quantity ≤ item.amount`, decrements (deletes if 0) the source, and creates a new Item row at the destination.

---

## Auth & Registration Flows

**Returning user:** `/login` → email + password → JWT → `/groups`

**Self-registration:** `/register` → username + email + password → JWT → `/groups` (empty, ready to create or join a group)

**Invite-based registration:** `/register?invite=<token>` → server validates token → form pre-filled with group name, user enters username + email + password + character name + emoji → creates User + GroupMember, marks Invite ACCEPTED → `/groups/:id`

**Founding a group:** logged in → "New Group" → group name + character name + emoji → creates Group + GroupMember + empty GroupCoins → generate invite link → `/groups/:id`

**Existing user receiving an invite:** visiting `/register?invite=<token>` while already logged in skips account creation and shows a simplified "Join Group" form asking only for character name and emoji → creates GroupMember, marks Invite ACCEPTED → `/groups/:id`

---

## Frontend Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx        — self-registration
│   │   ├── RegisterInvitePage.tsx  — invite-based registration
│   │   ├── GroupsPage.tsx          — dashboard listing user's groups
│   │   └── GroupPage.tsx           — main board/list view
│   ├── components/
│   │   ├── ui/                     — shadcn/ui components
│   │   ├── MoveItemModal.tsx
│   │   ├── AddItemForm.tsx
│   │   ├── CoinsBar.tsx
│   │   └── EmojiPicker.tsx         — curated TTRPG emoji set
│   ├── api/                        — typed fetch wrappers (auth.ts, groups.ts, items.ts, coins.ts)
│   └── main.tsx
```

### Routes
| Path | Page |
|---|---|
| `/login` | Login |
| `/register` | Self-registration |
| `/register?invite=<token>` | Invite registration |
| `/groups` | Groups dashboard |
| `/groups/:groupId` | Group board/list view |

---

## Group View (GroupPage)

The main screen has three zones:

1. **Coins bar** — always visible at the top; shows all five coin types, editable inline.
2. **Toolbar** — "Add Item to Hoard" button (prominent), search input (filters across all columns/rows), Board/List view toggle.
3. **Content area** — switches between:
   - **Board view**: horizontal scrolling kanban. One column per location (Hoard first, then one per character). Hoard column and character columns scroll vertically independently. Item count shown in column header.
   - **List view**: flat table of all items with columns: Name, Amount, Value, Location, Action. Sortable by any column. Pairs well with search for quickly locating items across the party.

**Search behaviour**: filters items client-side on the already-loaded data (no extra API call). In board view, matching cards are highlighted and non-matching cards are dimmed. A summary line ("Found in Hoard and Thorin") appears below the search bar.

### Move Item Modal
Triggered by "Assign…" / "Move…" on any item. Contains:
- Item name + current location in the header
- Destination grid (Hoard + all characters as buttons; current location disabled)
- Quantity stepper (only shown when `amount > 1`)
- Confirm button summarises the action ("Move 2 to Thorin")

### Character Emoji
Each `GroupMember` has a `characterEmoji` chosen from a curated set at registration/group-creation time (⚔ 🏹 🧙 🛡 🗡 🌿 🔥 💀 🐉 🎲 and similar TTRPG-themed options). The emoji appears next to the character name throughout the UI.

---

## Project Structure

```
holdingofbags/
├── frontend/          — React + TypeScript + Vite + Tailwind + shadcn/ui
│   ├── src/
│   └── vite.config.ts
├── backend/           — Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/    — auth, groups, items, coins
│   │   ├── middleware/ — JWT auth, membership guard
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── jest.config.ts
└── package.json       — npm workspaces root
```

No shared package; the frontend maintains its own TypeScript types mirroring API responses.

---

## Error Handling

- Invalid/expired invite token → error page with explanation and link to `/register`
- JWT expired → 401 response → frontend redirects to `/login`
- `move` with `quantity > item.amount` → 400 Bad Request
- All API errors return `{ error: string }` JSON

---

## Out of Scope (v1)

- Real-time sync (refresh button is sufficient)
- Per-character coin tracking
- Item categories or tags
- Mobile app (planned for later)
- Admin/GM-only permissions (any member can do everything)
