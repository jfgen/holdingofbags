# TTRPG Loot Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack web application where TTRPG groups manage a shared treasure hoard — members can add items/coins to the hoard, assign items to characters, move items between characters, and return items to the hoard.

**Architecture:** npm-workspaces monorepo. Express + Prisma + PostgreSQL backend exposing REST under `/api` (JWT `Authorization: Bearer`). React + Vite + Tailwind + shadcn/ui frontend with client-side routing, a typed fetch layer, and two view modes (kanban Board / flat List) with client-side search. A single `/move` endpoint handles every item transfer (hoard ↔ character, character ↔ character) by mutating the source row and creating a destination row — everything else is conventional CRUD.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Catppuccin Mocha), React Router, Node.js, Express, Prisma, PostgreSQL 15, jsonwebtoken, bcrypt, Jest + supertest (backend), Vitest + React Testing Library (frontend), Docker Compose.

**Spec:** `docs/superpowers/specs/2026-04-13-ttrpg-loot-manager-design.md`

---

## File Map

### Root (monorepo)

| File | Purpose |
|---|---|
| `package.json` | npm workspaces: `backend`, `frontend`; top-level scripts `dev`, `test`, `lint` |
| `docker-compose.yml` | Postgres services `db` (port 5432) and `db-test` (port 5433) |
| `.env.example` | `DATABASE_URL`, `TEST_DATABASE_URL`, `JWT_SECRET`, `PORT` |
| `.gitignore` | `node_modules`, `dist`, `.env`, `coverage` |
| `README.md` | Setup & run instructions |

### Backend (`backend/`)

| File | Purpose |
|---|---|
| `package.json` | Scripts + deps (express, prisma, bcrypt, jsonwebtoken, zod, jest, supertest) |
| `tsconfig.json` | TS config for backend |
| `jest.config.ts` | ts-jest preset, `tests/**` discovery, `setupFilesAfterEach` resets DB |
| `prisma/schema.prisma` | All 6 models + enums |
| `src/lib/prisma.ts` | PrismaClient singleton |
| `src/lib/jwt.ts` | `signToken(userId)` / `verifyToken(token)` |
| `src/lib/password.ts` | `hashPassword` / `verifyPassword` (bcrypt) |
| `src/lib/emojis.ts` | Curated TTRPG emoji whitelist + `isValidEmoji(e)` |
| `src/middleware/auth.ts` | Parses `Authorization: Bearer`, attaches `req.userId` |
| `src/middleware/membership.ts` | Loads `GroupMember` for `(userId, groupId)`, attaches `req.member` or 403s |
| `src/middleware/error.ts` | Catches errors → `{ error: string }` JSON |
| `src/routes/auth.ts` | `/register`, `/register/invite`, `/login`, `/me` |
| `src/routes/groups.ts` | Create / list / get group, invite generation |
| `src/routes/invites.ts` | Public invite lookup by token |
| `src/routes/items.ts` | CRUD + `/move` |
| `src/routes/coins.ts` | Get coins (via group detail) + PATCH coins |
| `src/app.ts` | Express app factory (mounts routes + middleware) |
| `src/index.ts` | Starts the HTTP listener |
| `tests/helpers.ts` | `resetDb`, `makeUser`, `makeGroup`, `authHeader` helpers |
| `tests/auth.test.ts` | Auth route tests |
| `tests/groups.test.ts` | Group + invite route tests |
| `tests/items.test.ts` | Items CRUD + move tests |
| `tests/coins.test.ts` | Coins tests |

### Frontend (`frontend/`)

| File | Purpose |
|---|---|
| `package.json` | Scripts + deps |
| `vite.config.ts` | Vite + React + `server.proxy` for `/api` |
| `tsconfig.json` | TS config |
| `tailwind.config.ts` | Catppuccin Mocha colors |
| `postcss.config.js` | Tailwind + autoprefixer |
| `index.html` | App root |
| `src/main.tsx` | React root + Router |
| `src/App.tsx` | Route table + `AuthProvider` |
| `src/index.css` | Tailwind directives + theme tokens |
| `src/types.ts` | API response types |
| `src/lib/auth.tsx` | `AuthContext`, `useAuth`, token in `localStorage` |
| `src/lib/emojis.ts` | Same curated list as backend |
| `src/api/client.ts` | `apiFetch` wrapper (auth header + JSON + error) |
| `src/api/auth.ts` | login / register / registerInvite / me |
| `src/api/groups.ts` | createGroup / listGroups / getGroup / createInvite |
| `src/api/items.ts` | list / create / update / delete / move |
| `src/api/coins.ts` | update coins |
| `src/components/EmojiPicker.tsx` | Grid picker over curated set |
| `src/components/CoinsBar.tsx` | 5 coin inline editors |
| `src/components/AddItemForm.tsx` | Modal form: add to hoard |
| `src/components/MoveItemModal.tsx` | Destination grid + quantity stepper |
| `src/components/BoardView.tsx` | Kanban columns (Hoard + characters) |
| `src/components/ListView.tsx` | Sortable flat table |
| `src/pages/LoginPage.tsx` | Login form |
| `src/pages/RegisterPage.tsx` | Self-registration |
| `src/pages/RegisterInvitePage.tsx` | Invite registration (+ "already logged in" branch) |
| `src/pages/GroupsPage.tsx` | Dashboard + New Group modal |
| `src/pages/GroupPage.tsx` | Group view (CoinsBar + toolbar + Board/List) |
| `src/test/setup.ts` | Vitest setup (jest-dom) |
| `src/test/__tests__/CoinsBar.test.tsx` | Component tests |
| `src/test/__tests__/MoveItemModal.test.tsx` | Component tests |
| `src/test/__tests__/ListView.test.tsx` | Component tests |

---

## Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "holdingofbags",
  "private": true,
  "version": "0.1.0",
  "workspaces": ["backend", "frontend"],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "dev:backend": "npm run dev --workspace backend",
    "dev:frontend": "npm run dev --workspace frontend",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "db:up": "docker compose up -d db db-test",
    "db:down": "docker compose down"
  }
}
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: holdings
      POSTGRES_PASSWORD: holdings
      POSTGRES_DB: holdingofbags
    ports: ["5432:5432"]
    volumes: ["db_data:/var/lib/postgresql/data"]
  db-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: holdings
      POSTGRES_PASSWORD: holdings
      POSTGRES_DB: holdingofbags_test
    ports: ["5433:5432"]
volumes:
  db_data:
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL=postgresql://holdings:holdings@localhost:5432/holdingofbags
TEST_DATABASE_URL=postgresql://holdings:holdings@localhost:5433/holdingofbags_test
JWT_SECRET=change-me-in-production
PORT=3001
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
coverage
*.log
```

- [ ] **Step 5: Create `README.md`**

```markdown
# Holding of Bags — TTRPG Loot Manager

## Setup

```bash
cp .env.example .env
npm install
npm run db:up
npm --workspace backend run prisma:migrate
npm run dev
```

Backend: http://localhost:3001 · Frontend: http://localhost:5173
```

- [ ] **Step 6: Start dev databases and verify**

Run: `docker compose up -d db db-test && docker compose ps`
Expected: both services listed as `running`; ports `5432` and `5433` exposed.

- [ ] **Step 7: Commit**

```bash
git add package.json docker-compose.yml .env.example .gitignore README.md
git commit -m "chore: scaffold monorepo with workspaces + docker compose"
```

---

## Task 2: Backend TypeScript scaffold

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/src/app.ts`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test": "jest --runInBand",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:test": "DATABASE_URL=$TEST_DATABASE_URL prisma migrate deploy"
  },
  "dependencies": {
    "@prisma/client": "^5.19.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.13",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^20.16.5",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "prisma": "^5.19.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "tsx": "^4.19.1",
    "typescript": "^5.5.4"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Create `backend/src/app.ts`**

```ts
import express, { Express } from "express";
import cors from "cors";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  return app;
}
```

- [ ] **Step 4: Create `backend/src/index.ts`**

```ts
import "dotenv/config";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3001);
createApp().listen(port, () => {
  console.log(`[backend] listening on :${port}`);
});
```

- [ ] **Step 5: Install and verify build**

Run: `npm install && npm --workspace backend run build`
Expected: no errors; `backend/dist/index.js` exists.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/src package-lock.json
git commit -m "chore(backend): scaffold express + typescript"
```

---

## Task 3: Prisma schema

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/lib/prisma.ts`

- [ ] **Step 1: Create `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
}

model User {
  id            String         @id @default(uuid())
  username      String         @unique
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())
  foundedGroups Group[]        @relation("Founder")
  memberships   GroupMember[]
}

model Group {
  id        String        @id @default(uuid())
  name      String
  founderId String
  founder   User          @relation("Founder", fields: [founderId], references: [id])
  createdAt DateTime      @default(now())
  members   GroupMember[]
  invites   Invite[]
  items     Item[]
  coins     GroupCoins?
}

model Invite {
  id        String       @id @default(uuid())
  groupId   String
  group     Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  token     String       @unique
  email     String?
  status    InviteStatus @default(PENDING)
  expiresAt DateTime
  createdAt DateTime     @default(now())
}

model GroupMember {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  groupId        String
  group          Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  characterName  String
  characterEmoji String
  joinedAt       DateTime @default(now())
  items          Item[]

  @@unique([userId, groupId])
}

model Item {
  id          String       @id @default(uuid())
  groupId     String
  group       Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  memberId    String?
  member      GroupMember? @relation(fields: [memberId], references: [id], onDelete: SetNull)
  name        String
  description String       @default("")
  amount      Int          @default(1)
  value       Decimal      @default(0) @db.Decimal(10, 2)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model GroupCoins {
  id       String @id @default(uuid())
  groupId  String @unique
  group    Group  @relation(fields: [groupId], references: [id], onDelete: Cascade)
  platinum Int    @default(0)
  electrum Int    @default(0)
  gold     Int    @default(0)
  silver   Int    @default(0)
  copper   Int    @default(0)
}
```

- [ ] **Step 2: Create `backend/src/lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "test" ? [] : ["warn", "error"],
});
```

- [ ] **Step 3: Run initial migration**

Run: `npm --workspace backend exec -- prisma migrate dev --name init`
Expected: migration file created under `backend/prisma/migrations/*_init/`, client generated.

- [ ] **Step 4: Run migration on test DB**

Run: `DATABASE_URL=postgresql://holdings:holdings@localhost:5433/holdingofbags_test npm --workspace backend exec -- prisma migrate deploy`
Expected: `All migrations have been successfully applied.`

- [ ] **Step 5: Commit**

```bash
git add backend/prisma backend/src/lib/prisma.ts
git commit -m "feat(backend): add prisma schema + initial migration"
```

---

## Task 4: Jest setup + test helpers

**Files:**
- Create: `backend/jest.config.ts`
- Create: `backend/tests/setup.ts`
- Create: `backend/tests/helpers.ts`

- [ ] **Step 1: Create `backend/jest.config.ts`**

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  testTimeout: 15000,
};
export default config;
```

- [ ] **Step 2: Create `backend/tests/globalSetup.ts`**

```ts
import "dotenv/config";

export default async function globalSetup() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
}
```

- [ ] **Step 3: Create `backend/tests/setup.ts`**

```ts
import { prisma } from "../src/lib/prisma";

afterEach(async () => {
  // order matters due to FKs
  await prisma.item.deleteMany();
  await prisma.groupCoins.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

- [ ] **Step 4: Create `backend/tests/helpers.ts`**

```ts
import request from "supertest";
import { Express } from "express";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { signToken } from "../src/lib/jwt";

export async function makeUser(opts: { username?: string; email?: string; password?: string } = {}) {
  const username = opts.username ?? `u_${Math.random().toString(36).slice(2, 8)}`;
  const email = opts.email ?? `${username}@test.local`;
  const password = opts.password ?? "password123";
  const user = await prisma.user.create({
    data: { username, email, passwordHash: await hashPassword(password) },
  });
  return { user, password, token: signToken(user.id) };
}

export async function makeGroup(founderId: string, name = "Party of Heroes") {
  const group = await prisma.group.create({ data: { name, founderId } });
  const member = await prisma.groupMember.create({
    data: { userId: founderId, groupId: group.id, characterName: "Founder Hero", characterEmoji: "⚔" },
  });
  await prisma.groupCoins.create({ data: { groupId: group.id } });
  return { group, member };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function post(app: Express, path: string, body: object, token?: string) {
  const req = request(app).post(path).send(body);
  return token ? req.set(authHeader(token)) : req;
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/jest.config.ts backend/tests/setup.ts backend/tests/globalSetup.ts backend/tests/helpers.ts
git commit -m "chore(backend): configure jest + test helpers"
```

---

## Task 5: Password + JWT libs

**Files:**
- Create: `backend/src/lib/password.ts`
- Create: `backend/src/lib/jwt.ts`
- Create: `backend/tests/lib.test.ts`

- [ ] **Step 1: Write failing test**

`backend/tests/lib.test.ts`:
```ts
import { hashPassword, verifyPassword } from "../src/lib/password";
import { signToken, verifyToken } from "../src/lib/jwt";

describe("password", () => {
  it("hashes and verifies", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("jwt", () => {
  it("round-trips userId", () => {
    const token = signToken("user-1");
    expect(verifyToken(token)).toEqual({ userId: "user-1" });
  });
  it("rejects tampered token", () => {
    expect(() => verifyToken("not.a.jwt")).toThrow();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- lib.test.ts`
Expected: fails because `password.ts`/`jwt.ts` do not exist.

- [ ] **Step 3: Implement `backend/src/lib/password.ts`**

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Implement `backend/src/lib/jwt.ts`**

```ts
import jwt from "jsonwebtoken";

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set");
  return s;
};

export function signToken(userId: string): string {
  return jwt.sign({ userId }, secret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  const payload = jwt.verify(token, secret()) as { userId: string };
  return { userId: payload.userId };
}
```

- [ ] **Step 5: Run tests**

Run: `npm --workspace backend test -- lib.test.ts`
Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add backend/src/lib/password.ts backend/src/lib/jwt.ts backend/tests/lib.test.ts
git commit -m "feat(backend): password hashing + JWT helpers"
```

---

## Task 6: Emoji whitelist + auth middleware

**Files:**
- Create: `backend/src/lib/emojis.ts`
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/middleware/error.ts`

- [ ] **Step 1: Create `backend/src/lib/emojis.ts`**

```ts
export const CHARACTER_EMOJIS = [
  "⚔", "🏹", "🧙", "🛡", "🗡", "🪄", "🌿", "🔥", "💀", "🐉",
  "🎲", "🧝", "🧛", "🧟", "🦄", "🐺", "🦉", "🐍", "🦂", "🕷",
  "🧚", "🧞", "👑", "🗝", "🏰", "⚗", "📜", "🪓", "🏺", "💎",
] as const;

export function isValidEmoji(e: string): boolean {
  return (CHARACTER_EMOJIS as readonly string[]).includes(e);
}
```

- [ ] **Step 2: Create `backend/src/middleware/error.ts`**

```ts
import { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
};
```

- [ ] **Step 3: Create `backend/src/middleware/auth.ts`**

```ts
import { RequestHandler } from "express";
import { verifyToken } from "../lib/jwt";
import { HttpError } from "./error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) {
    return next(new HttpError(401, "missing bearer token"));
  }
  try {
    const { userId } = verifyToken(header.slice(7));
    req.userId = userId;
    next();
  } catch {
    next(new HttpError(401, "invalid or expired token"));
  }
};
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/lib/emojis.ts backend/src/middleware/auth.ts backend/src/middleware/error.ts
git commit -m "feat(backend): emoji whitelist + auth/error middleware"
```

---

## Task 7: Auth routes — self-registration, login, /me

**Files:**
- Create: `backend/src/routes/auth.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/auth.test.ts`

- [ ] **Step 1: Write failing test `backend/tests/auth.test.ts`**

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { makeUser } from "./helpers";

const app = createApp();

describe("POST /api/auth/register", () => {
  it("creates user and returns JWT", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "gandalf", email: "g@m.com", password: "youShallNotPass",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe("gandalf");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send({ username: "alpha", email: "dup@test.local", password: "pw12345678" });
    const res = await request(app).post("/api/auth/register").send({ username: "beta", email: "dup@test.local", password: "pw12345678" });
    expect(res.status).toBe(409);
  });

  it("rejects short password", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "carla", email: "c@test.local", password: "123" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns JWT for valid creds", async () => {
    const { user, password } = await makeUser();
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const { user } = await makeUser();
    const res = await request(app).post("/api/auth/login").send({ email: user.email, password: "nope" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user", async () => {
    const { user, token } = await makeUser();
    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });
  it("401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- auth.test.ts`
Expected: all tests fail — routes missing.

- [ ] **Step 3: Implement `backend/src/routes/auth.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { signToken } from "../lib/jwt";
import { HttpError } from "../middleware/error";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(8),
});

function publicUser(u: { id: string; username: string; email: string; createdAt: Date }) {
  return { id: u.id, username: u.username, email: u.email, createdAt: u.createdAt };
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw new HttpError(409, "username or email already in use");
    const user = await prisma.user.create({
      data: { username: body.username, email: body.email, passwordHash: await hashPassword(body.password) },
    });
    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new HttpError(401, "invalid credentials");
    }
    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) throw new HttpError(404, "user not found");
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
```

- [ ] **Step 4: Wire router + error handler in `backend/src/app.ts`**

Replace the file:
```ts
import express, { Express } from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { errorHandler } from "./middleware/error";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRouter);
  app.use(errorHandler);
  return app;
}
```

- [ ] **Step 5: Run tests**

Run: `npm --workspace backend test -- auth.test.ts`
Expected: all 7 passing.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/auth.ts backend/src/app.ts backend/tests/auth.test.ts
git commit -m "feat(backend): auth routes (register/login/me)"
```

---

## Task 8: Groups — create, list, get

**Files:**
- Create: `backend/src/routes/groups.ts`
- Create: `backend/src/middleware/membership.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/groups.test.ts`

- [ ] **Step 1: Write failing test `backend/tests/groups.test.ts`**

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";

const app = createApp();

describe("POST /api/groups", () => {
  it("creates group + founder member + empty coins", async () => {
    const { token } = await makeUser();
    const res = await request(app).post("/api/groups").set(authHeader(token)).send({
      groupName: "The Nine", characterName: "Aragorn", characterEmoji: "⚔",
    });
    expect(res.status).toBe(201);
    expect(res.body.group.name).toBe("The Nine");
    expect(res.body.group.members).toHaveLength(1);
    expect(res.body.group.members[0].characterName).toBe("Aragorn");
    expect(res.body.group.coins).toMatchObject({ platinum: 0, gold: 0 });
  });
  it("rejects bad emoji", async () => {
    const { token } = await makeUser();
    const res = await request(app).post("/api/groups").set(authHeader(token)).send({
      groupName: "X", characterName: "Y", characterEmoji: "🙈",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/groups", () => {
  it("lists only groups the user belongs to", async () => {
    const a = await makeUser();
    const b = await makeUser();
    await makeGroup(a.user.id, "A-group");
    await makeGroup(b.user.id, "B-group");
    const res = await request(app).get("/api/groups").set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.groups).toHaveLength(1);
    expect(res.body.groups[0].name).toBe("A-group");
  });
});

describe("GET /api/groups/:id", () => {
  it("returns group details for a member", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).get(`/api/groups/${group.id}`).set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.group.id).toBe(group.id);
    expect(res.body.group.members).toHaveLength(1);
    expect(res.body.group.coins).toBeDefined();
  });
  it("403s for non-members", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).get(`/api/groups/${group.id}`).set(authHeader(b.token));
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- groups.test.ts`
Expected: fails — routes missing.

- [ ] **Step 3: Implement `backend/src/middleware/membership.ts`**

```ts
import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "./error";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      member?: { id: string; userId: string; groupId: string; characterName: string; characterEmoji: string };
    }
  }
}

export const requireMembership: RequestHandler = async (req, _res, next) => {
  try {
    const groupId = req.params.groupId;
    if (!req.userId) throw new HttpError(401, "unauthenticated");
    const member = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.userId, groupId } },
    });
    if (!member) throw new HttpError(403, "not a member of this group");
    req.member = {
      id: member.id, userId: member.userId, groupId: member.groupId,
      characterName: member.characterName, characterEmoji: member.characterEmoji,
    };
    next();
  } catch (e) {
    next(e);
  }
};
```

- [ ] **Step 4: Implement `backend/src/routes/groups.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";
import { isValidEmoji } from "../lib/emojis";

export const groupsRouter = Router();
groupsRouter.use(requireAuth);

const createSchema = z.object({
  groupName: z.string().min(1).max(64),
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

groupsRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const group = await prisma.group.create({
      data: {
        name: body.groupName,
        founderId: req.userId!,
        members: { create: { userId: req.userId!, characterName: body.characterName, characterEmoji: body.characterEmoji } },
        coins: { create: {} },
      },
      include: { members: true, coins: true },
    });
    res.status(201).json({ group });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

groupsRouter.get("/", async (req, res, next) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.userId! },
      include: { group: true },
      orderBy: { joinedAt: "desc" },
    });
    res.json({ groups: memberships.map((m) => m.group) });
  } catch (e) {
    next(e);
  }
});

groupsRouter.get("/:groupId", requireMembership, async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.groupId },
      include: { members: true, coins: true },
    });
    if (!group) throw new HttpError(404, "group not found");
    res.json({ group });
  } catch (e) {
    next(e);
  }
});
```

- [ ] **Step 5: Mount router in `backend/src/app.ts`**

Add after `app.use("/api/auth", authRouter);`:
```ts
import { groupsRouter } from "./routes/groups";
// ...
app.use("/api/groups", groupsRouter);
```

- [ ] **Step 6: Run tests**

Run: `npm --workspace backend test -- groups.test.ts`
Expected: all 5 passing.

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/groups.ts backend/src/middleware/membership.ts backend/src/app.ts backend/tests/groups.test.ts
git commit -m "feat(backend): group create/list/detail + membership middleware"
```

---

## Task 9: Invites — generate + lookup + invite-based registration

**Files:**
- Create: `backend/src/routes/invites.ts`
- Modify: `backend/src/routes/groups.ts` (add invite generation)
- Modify: `backend/src/routes/auth.ts` (add `/register/invite`)
- Modify: `backend/src/app.ts`
- Create: `backend/tests/invites.test.ts`

- [ ] **Step 1: Write failing test `backend/tests/invites.test.ts`**

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";
import { prisma } from "../src/lib/prisma";

const app = createApp();

describe("POST /api/groups/:id/invites", () => {
  it("founder creates an invite with a token", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    expect(res.status).toBe(201);
    expect(res.body.invite.token).toMatch(/.{16,}/);
    expect(res.body.invite.status).toBe("PENDING");
  });
});

describe("GET /api/invites/:token", () => {
  it("returns group name for a pending token", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id, "Sworn");
    const create = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    const res = await request(app).get(`/api/invites/${create.body.invite.token}`);
    expect(res.status).toBe(200);
    expect(res.body.groupName).toBe("Sworn");
  });
  it("404s unknown token", async () => {
    const res = await request(app).get("/api/invites/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/auth/register/invite", () => {
  it("creates user + member + marks invite ACCEPTED", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const create = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(a.token)).send({});
    const token = create.body.invite.token;
    const res = await request(app).post("/api/auth/register/invite").send({
      token, username: "legolas", email: "le@m.com", password: "arrowtime",
      characterName: "Legolas", characterEmoji: "🏹",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.groupId).toBe(group.id);
    const invite = await prisma.invite.findUnique({ where: { token } });
    expect(invite?.status).toBe("ACCEPTED");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- invites.test.ts`
Expected: fails — routes missing.

- [ ] **Step 3: Add invite generation in `backend/src/routes/groups.ts`**

Append:
```ts
import crypto from "node:crypto";

groupsRouter.post("/:groupId/invites", requireMembership, async (req, res, next) => {
  try {
    const group = await prisma.group.findUnique({ where: { id: req.params.groupId } });
    if (!group) throw new HttpError(404, "group not found");
    if (group.founderId !== req.userId) throw new HttpError(403, "only the founder can invite");
    const invite = await prisma.invite.create({
      data: {
        groupId: group.id,
        token: crypto.randomBytes(24).toString("base64url"),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json({ invite });
  } catch (e) {
    next(e);
  }
});
```

- [ ] **Step 4: Create `backend/src/routes/invites.ts`**

```ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/error";

export const invitesRouter = Router();

invitesRouter.get("/:token", async (req, res, next) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: req.params.token },
      include: { group: true },
    });
    if (!invite) throw new HttpError(404, "invite not found");
    if (invite.status !== "PENDING") throw new HttpError(410, "invite no longer valid");
    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
      throw new HttpError(410, "invite expired");
    }
    res.json({ groupId: invite.groupId, groupName: invite.group.name, expiresAt: invite.expiresAt });
  } catch (e) {
    next(e);
  }
});
```

- [ ] **Step 5: Add `/register/invite` in `backend/src/routes/auth.ts`**

Append:
```ts
import { isValidEmoji } from "../lib/emojis";

const registerInviteSchema = z.object({
  token: z.string().min(10),
  username: z.string().min(2).max(32),
  email: z.string().email(),
  password: z.string().min(8),
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

authRouter.post("/register/invite", async (req, res, next) => {
  try {
    const body = registerInviteSchema.parse(req.body);
    const invite = await prisma.invite.findUnique({ where: { token: body.token } });
    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      throw new HttpError(410, "invite no longer valid");
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });
    if (existing) throw new HttpError(409, "username or email already in use");

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { username: body.username, email: body.email, passwordHash: await hashPassword(body.password) },
      });
      await tx.groupMember.create({
        data: {
          userId: user.id, groupId: invite.groupId,
          characterName: body.characterName, characterEmoji: body.characterEmoji,
        },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
      return user;
    });
    res.status(201).json({
      token: signToken(result.id),
      user: publicUser(result),
      groupId: invite.groupId,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
```

- [ ] **Step 6: Mount invites router in `backend/src/app.ts`**

Add:
```ts
import { invitesRouter } from "./routes/invites";
// ...
app.use("/api/invites", invitesRouter);
```

- [ ] **Step 7: Run tests**

Run: `npm --workspace backend test -- invites.test.ts auth.test.ts groups.test.ts`
Expected: all passing.

- [ ] **Step 8: Commit**

```bash
git add backend/src/routes/invites.ts backend/src/routes/auth.ts backend/src/routes/groups.ts backend/src/app.ts backend/tests/invites.test.ts
git commit -m "feat(backend): invites + invite-based registration"
```

---

## Task 10: Items CRUD

**Files:**
- Create: `backend/src/routes/items.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/items.test.ts`

- [ ] **Step 1: Write failing test `backend/tests/items.test.ts`**

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";
import { prisma } from "../src/lib/prisma";

const app = createApp();

describe("items CRUD", () => {
  it("POST adds an item to the hoard (memberId null)", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).post(`/api/groups/${group.id}/items`).set(authHeader(a.token)).send({
      name: "Potion", description: "heals 2d4+2", amount: 3, value: "5.00",
    });
    expect(res.status).toBe(201);
    expect(res.body.item.memberId).toBeNull();
    expect(res.body.item.amount).toBe(3);
  });

  it("GET lists all items in the group", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    await prisma.item.create({ data: { groupId: group.id, name: "Rope" } });
    const res = await request(app).get(`/api/groups/${group.id}/items`).set(authHeader(a.token));
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  it("PATCH updates an item", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const item = await prisma.item.create({ data: { groupId: group.id, name: "Torch", amount: 2 } });
    const res = await request(app)
      .patch(`/api/groups/${group.id}/items/${item.id}`)
      .set(authHeader(a.token))
      .send({ amount: 5, description: "lit" });
    expect(res.status).toBe(200);
    expect(res.body.item.amount).toBe(5);
    expect(res.body.item.description).toBe("lit");
  });

  it("DELETE removes an item", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const item = await prisma.item.create({ data: { groupId: group.id, name: "Gone" } });
    const res = await request(app).delete(`/api/groups/${group.id}/items/${item.id}`).set(authHeader(a.token));
    expect(res.status).toBe(204);
    expect(await prisma.item.count()).toBe(0);
  });

  it("404s on item from another group", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const other = await makeGroup((await makeUser()).user.id);
    const otherItem = await prisma.item.create({ data: { groupId: other.group.id, name: "X" } });
    const res = await request(app).patch(`/api/groups/${group.id}/items/${otherItem.id}`).set(authHeader(a.token)).send({ amount: 1 });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- items.test.ts`
Expected: fails.

- [ ] **Step 3: Implement `backend/src/routes/items.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";

export const itemsRouter = Router({ mergeParams: true });
itemsRouter.use(requireAuth, requireMembership);

const createSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(1024).optional().default(""),
  amount: z.number().int().min(1).optional().default(1),
  value: z.union([z.string(), z.number()]).optional().default(0),
  memberId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(1024).optional(),
  amount: z.number().int().min(1).optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

async function loadItem(groupId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item || item.groupId !== groupId) throw new HttpError(404, "item not found");
  return item;
}

itemsRouter.get("/", async (req, res, next) => {
  try {
    const items = await prisma.item.findMany({
      where: { groupId: req.params.groupId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

itemsRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    if (body.memberId) {
      const member = await prisma.groupMember.findUnique({ where: { id: body.memberId } });
      if (!member || member.groupId !== req.params.groupId) throw new HttpError(400, "invalid memberId");
    }
    const item = await prisma.item.create({
      data: {
        groupId: req.params.groupId,
        memberId: body.memberId ?? null,
        name: body.name,
        description: body.description,
        amount: body.amount,
        value: String(body.value) as unknown as number,
      },
    });
    res.status(201).json({ item });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

itemsRouter.patch("/:itemId", async (req, res, next) => {
  try {
    await loadItem(req.params.groupId, req.params.itemId);
    const body = updateSchema.parse(req.body);
    const item = await prisma.item.update({
      where: { id: req.params.itemId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.value !== undefined && { value: String(body.value) as unknown as number }),
      },
    });
    res.json({ item });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});

itemsRouter.delete("/:itemId", async (req, res, next) => {
  try {
    await loadItem(req.params.groupId, req.params.itemId);
    await prisma.item.delete({ where: { id: req.params.itemId } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
```

- [ ] **Step 4: Mount items router in `backend/src/app.ts`**

Add:
```ts
import { itemsRouter } from "./routes/items";
// ...
app.use("/api/groups/:groupId/items", itemsRouter);
```

- [ ] **Step 5: Run tests**

Run: `npm --workspace backend test -- items.test.ts`
Expected: all passing.

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/items.ts backend/src/app.ts backend/tests/items.test.ts
git commit -m "feat(backend): items CRUD"
```

---

## Task 11: Move endpoint

**Files:**
- Modify: `backend/src/routes/items.ts`
- Modify: `backend/tests/items.test.ts`

- [ ] **Step 1: Append failing tests to `backend/tests/items.test.ts`**

```ts
describe("POST /items/:itemId/move", () => {
  it("partial stack: decrements source, creates new at destination", async () => {
    const a = await makeUser();
    const { group, member } = await makeGroup(a.user.id);
    const source = await prisma.item.create({ data: { groupId: group.id, name: "Arrows", amount: 20 } });
    const res = await request(app).post(`/api/groups/${group.id}/items/${source.id}/move`).set(authHeader(a.token)).send({
      quantity: 7, destinationMemberId: member.id,
    });
    expect(res.status).toBe(200);
    const remaining = await prisma.item.findUnique({ where: { id: source.id } });
    expect(remaining?.amount).toBe(13);
    expect(res.body.item.memberId).toBe(member.id);
    expect(res.body.item.amount).toBe(7);
  });

  it("full stack: deletes source, creates destination", async () => {
    const a = await makeUser();
    const { group, member } = await makeGroup(a.user.id);
    const source = await prisma.item.create({ data: { groupId: group.id, name: "Shield", amount: 1 } });
    const res = await request(app).post(`/api/groups/${group.id}/items/${source.id}/move`).set(authHeader(a.token)).send({
      quantity: 1, destinationMemberId: member.id,
    });
    expect(res.status).toBe(200);
    expect(await prisma.item.findUnique({ where: { id: source.id } })).toBeNull();
    expect(res.body.item.memberId).toBe(member.id);
  });

  it("character → hoard with destinationMemberId null", async () => {
    const a = await makeUser();
    const { group, member } = await makeGroup(a.user.id);
    const source = await prisma.item.create({ data: { groupId: group.id, memberId: member.id, name: "Map", amount: 1 } });
    const res = await request(app).post(`/api/groups/${group.id}/items/${source.id}/move`).set(authHeader(a.token)).send({
      quantity: 1, destinationMemberId: null,
    });
    expect(res.status).toBe(200);
    expect(res.body.item.memberId).toBeNull();
  });

  it("rejects quantity > amount", async () => {
    const a = await makeUser();
    const { group, member } = await makeGroup(a.user.id);
    const source = await prisma.item.create({ data: { groupId: group.id, name: "X", amount: 2 } });
    const res = await request(app).post(`/api/groups/${group.id}/items/${source.id}/move`).set(authHeader(a.token)).send({
      quantity: 5, destinationMemberId: member.id,
    });
    expect(res.status).toBe(400);
  });

  it("rejects destinationMemberId from another group", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const other = await makeGroup((await makeUser()).user.id);
    const src = await prisma.item.create({ data: { groupId: group.id, name: "X", amount: 1 } });
    const res = await request(app).post(`/api/groups/${group.id}/items/${src.id}/move`).set(authHeader(a.token)).send({
      quantity: 1, destinationMemberId: other.member.id,
    });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- items.test.ts`
Expected: the 5 new tests fail.

- [ ] **Step 3: Append to `backend/src/routes/items.ts`**

```ts
const moveSchema = z.object({
  quantity: z.number().int().min(1),
  destinationMemberId: z.string().uuid().nullable(),
});

itemsRouter.post("/:itemId/move", async (req, res, next) => {
  try {
    const source = await loadItem(req.params.groupId, req.params.itemId);
    const body = moveSchema.parse(req.body);
    if (body.quantity > source.amount) throw new HttpError(400, "quantity exceeds stack size");
    if (body.destinationMemberId) {
      const dest = await prisma.groupMember.findUnique({ where: { id: body.destinationMemberId } });
      if (!dest || dest.groupId !== req.params.groupId) throw new HttpError(400, "invalid destinationMemberId");
    }
    if ((body.destinationMemberId ?? null) === (source.memberId ?? null)) {
      throw new HttpError(400, "source and destination are the same");
    }

    const created = await prisma.$transaction(async (tx) => {
      if (body.quantity === source.amount) {
        await tx.item.delete({ where: { id: source.id } });
      } else {
        await tx.item.update({ where: { id: source.id }, data: { amount: source.amount - body.quantity } });
      }
      return tx.item.create({
        data: {
          groupId: source.groupId,
          memberId: body.destinationMemberId,
          name: source.name,
          description: source.description,
          amount: body.quantity,
          value: source.value,
        },
      });
    });
    res.json({ item: created });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
```

- [ ] **Step 4: Run tests**

Run: `npm --workspace backend test -- items.test.ts`
Expected: all passing.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/items.ts backend/tests/items.test.ts
git commit -m "feat(backend): item move endpoint (hoard ↔ character, partial stacks)"
```

---

## Task 12: Coins endpoint

**Files:**
- Create: `backend/src/routes/coins.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/coins.test.ts`

- [ ] **Step 1: Write failing test `backend/tests/coins.test.ts`**

```ts
import request from "supertest";
import { createApp } from "../src/app";
import { makeUser, makeGroup, authHeader } from "./helpers";

const app = createApp();

describe("PATCH /api/groups/:id/coins", () => {
  it("updates the five coin fields", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({
      platinum: 3, electrum: 1, gold: 100, silver: 12, copper: 42,
    });
    expect(res.status).toBe(200);
    expect(res.body.coins).toMatchObject({ platinum: 3, gold: 100, copper: 42 });
  });

  it("accepts partial updates", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({ gold: 5 });
    expect(res.status).toBe(200);
    expect(res.body.coins.gold).toBe(5);
    expect(res.body.coins.silver).toBe(0);
  });

  it("rejects negative amounts", async () => {
    const a = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(a.token)).send({ gold: -1 });
    expect(res.status).toBe(400);
  });

  it("403s non-members", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const { group } = await makeGroup(a.user.id);
    const res = await request(app).patch(`/api/groups/${group.id}/coins`).set(authHeader(b.token)).send({ gold: 1 });
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace backend test -- coins.test.ts`
Expected: fails.

- [ ] **Step 3: Implement `backend/src/routes/coins.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { requireMembership } from "../middleware/membership";
import { HttpError } from "../middleware/error";

export const coinsRouter = Router({ mergeParams: true });
coinsRouter.use(requireAuth, requireMembership);

const coinInt = z.number().int().min(0);
const schema = z.object({
  platinum: coinInt.optional(),
  electrum: coinInt.optional(),
  gold: coinInt.optional(),
  silver: coinInt.optional(),
  copper: coinInt.optional(),
});

coinsRouter.patch("/", async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const coins = await prisma.groupCoins.update({
      where: { groupId: req.params.groupId },
      data: body,
    });
    res.json({ coins });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
```

- [ ] **Step 4: Mount in `backend/src/app.ts`**

Add:
```ts
import { coinsRouter } from "./routes/coins";
// ...
app.use("/api/groups/:groupId/coins", coinsRouter);
```

- [ ] **Step 5: Run tests**

Run: `npm --workspace backend test -- coins.test.ts`
Expected: all passing.

- [ ] **Step 6: Run full backend test suite**

Run: `npm --workspace backend test`
Expected: all tests green.

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/coins.ts backend/src/app.ts backend/tests/coins.test.ts
git commit -m "feat(backend): coins update endpoint"
```

---

## Task 13: Frontend scaffold (Vite + Tailwind + Router)

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/index.css`
- Create: `frontend/src/test/setup.ts`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.446.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.7",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "typescript": "^5.5.4",
    "vite": "^5.4.7",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 3: Create `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `frontend/tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

// Catppuccin Mocha
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#1e1e2e",
        mantle: "#181825",
        crust: "#11111b",
        surface0: "#313244",
        surface1: "#45475a",
        surface2: "#585b70",
        overlay0: "#6c7086",
        text: "#cdd6f4",
        subtext: "#a6adc8",
        blue: "#89b4fa",
        lavender: "#b4befe",
        mauve: "#cba6f7",
        green: "#a6e3a1",
        yellow: "#f9e2af",
        red: "#f38ba8",
        peach: "#fab387",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 6: Create `frontend/postcss.config.js`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 7: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Holding of Bags</title>
  </head>
  <body class="bg-base text-text">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { font-family: ui-sans-serif, system-ui, sans-serif; }
```

- [ ] **Step 9: Create `frontend/src/App.tsx` (placeholder)**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div className="p-8 text-text">Holding of Bags</div>} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 10: Create `frontend/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 11: Create `frontend/src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 12: Install and verify**

Run: `npm install && npm --workspace frontend run build`
Expected: build succeeds; `frontend/dist/index.html` exists.

- [ ] **Step 13: Commit**

```bash
git add frontend package-lock.json
git commit -m "chore(frontend): scaffold vite + react + tailwind + router"
```

---

## Task 14: Types + API client + auth context

**Files:**
- Create: `frontend/src/types.ts`
- Create: `frontend/src/lib/emojis.ts`
- Create: `frontend/src/lib/auth.tsx`
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/groups.ts`
- Create: `frontend/src/api/items.ts`
- Create: `frontend/src/api/coins.ts`

- [ ] **Step 1: Create `frontend/src/types.ts`**

```ts
export type User = { id: string; username: string; email: string; createdAt: string };

export type Member = {
  id: string;
  userId: string;
  groupId: string;
  characterName: string;
  characterEmoji: string;
  joinedAt: string;
};

export type Coins = {
  id: string;
  groupId: string;
  platinum: number;
  electrum: number;
  gold: number;
  silver: number;
  copper: number;
};

export type Group = {
  id: string;
  name: string;
  founderId: string;
  createdAt: string;
  members?: Member[];
  coins?: Coins;
};

export type Item = {
  id: string;
  groupId: string;
  memberId: string | null;
  name: string;
  description: string;
  amount: number;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type Invite = {
  id: string;
  groupId: string;
  token: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  expiresAt: string;
};

export type AuthResponse = { token: string; user: User; groupId?: string };
```

- [ ] **Step 2: Create `frontend/src/lib/emojis.ts`**

```ts
export const CHARACTER_EMOJIS = [
  "⚔","🏹","🧙","🛡","🗡","🪄","🌿","🔥","💀","🐉",
  "🎲","🧝","🧛","🧟","🦄","🐺","🦉","🐍","🦂","🕷",
  "🧚","🧞","👑","🗝","🏰","⚗","📜","🪓","🏺","💎",
] as const;
```

- [ ] **Step 3: Create `frontend/src/api/client.ts`**

```ts
const TOKEN_KEY = "hob.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(path, { ...init, headers });
  if (res.status === 204) return undefined as unknown as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  return body as T;
}
```

- [ ] **Step 4: Create `frontend/src/lib/auth.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch, setToken, getToken } from "../api/client";
import type { User } from "../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    apiFetch<{ user: User }>("/api/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider value={{
      user,
      loading,
      login: (t, u) => { setToken(t); setUser(u); },
      logout: () => { setToken(null); setUser(null); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
```

- [ ] **Step 5: Create `frontend/src/api/auth.ts`**

```ts
import { apiFetch } from "./client";
import type { AuthResponse, User } from "../types";

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { username: string; email: string; password: string }) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  registerWithInvite: (payload: { token: string; username: string; email: string; password: string; characterName: string; characterEmoji: string }) =>
    apiFetch<AuthResponse>("/api/auth/register/invite", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch<{ user: User }>("/api/auth/me"),
};
```

- [ ] **Step 6: Create `frontend/src/api/groups.ts`**

```ts
import { apiFetch } from "./client";
import type { Group, Invite, Coins, Member } from "../types";

export const groupsApi = {
  list: () => apiFetch<{ groups: Group[] }>("/api/groups"),
  create: (groupName: string, characterName: string, characterEmoji: string) =>
    apiFetch<{ group: Group & { members: Member[]; coins: Coins } }>("/api/groups", {
      method: "POST", body: JSON.stringify({ groupName, characterName, characterEmoji }),
    }),
  get: (groupId: string) =>
    apiFetch<{ group: Group & { members: Member[]; coins: Coins } }>(`/api/groups/${groupId}`),
  createInvite: (groupId: string) =>
    apiFetch<{ invite: Invite }>(`/api/groups/${groupId}/invites`, { method: "POST", body: "{}" }),
  getInvite: (token: string) =>
    apiFetch<{ groupId: string; groupName: string; expiresAt: string }>(`/api/invites/${token}`),
  joinWithInvite: (token: string, characterName: string, characterEmoji: string) =>
    apiFetch<{ member: Member; groupId: string }>(`/api/invites/${token}/join`, {
      method: "POST", body: JSON.stringify({ characterName, characterEmoji }),
    }),
};
```

- [ ] **Step 7: Create `frontend/src/api/items.ts`**

```ts
import { apiFetch } from "./client";
import type { Item } from "../types";

export const itemsApi = {
  list: (groupId: string) =>
    apiFetch<{ items: Item[] }>(`/api/groups/${groupId}/items`),
  create: (groupId: string, payload: { name: string; description?: string; amount?: number; value?: string }) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items`, { method: "POST", body: JSON.stringify(payload) }),
  update: (groupId: string, itemId: string, payload: Partial<{ name: string; description: string; amount: number; value: string }>) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items/${itemId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  delete: (groupId: string, itemId: string) =>
    apiFetch<void>(`/api/groups/${groupId}/items/${itemId}`, { method: "DELETE" }),
  move: (groupId: string, itemId: string, quantity: number, destinationMemberId: string | null) =>
    apiFetch<{ item: Item }>(`/api/groups/${groupId}/items/${itemId}/move`, {
      method: "POST", body: JSON.stringify({ quantity, destinationMemberId }),
    }),
};
```

- [ ] **Step 8: Create `frontend/src/api/coins.ts`**

```ts
import { apiFetch } from "./client";
import type { Coins } from "../types";

export const coinsApi = {
  update: (groupId: string, patch: Partial<Pick<Coins, "platinum" | "electrum" | "gold" | "silver" | "copper">>) =>
    apiFetch<{ coins: Coins }>(`/api/groups/${groupId}/coins`, { method: "PATCH", body: JSON.stringify(patch) }),
};
```

- [ ] **Step 9: Add backend route for existing-user invite accept**

Append to `backend/src/routes/invites.ts`:
```ts
import { requireAuth } from "../middleware/auth";
import { isValidEmoji } from "../lib/emojis";
import { z } from "zod";

const joinSchema = z.object({
  characterName: z.string().min(1).max(64),
  characterEmoji: z.string().refine(isValidEmoji, "invalid emoji"),
});

invitesRouter.post("/:token/join", requireAuth, async (req, res, next) => {
  try {
    const body = joinSchema.parse(req.body);
    const invite = await prisma.invite.findUnique({ where: { token: req.params.token } });
    if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
      throw new HttpError(410, "invite no longer valid");
    }
    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: req.userId!, groupId: invite.groupId } },
    });
    if (existing) throw new HttpError(409, "already a member of this group");
    const member = await prisma.$transaction(async (tx) => {
      const m = await tx.groupMember.create({
        data: {
          userId: req.userId!, groupId: invite.groupId,
          characterName: body.characterName, characterEmoji: body.characterEmoji,
        },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { status: "ACCEPTED" } });
      return m;
    });
    res.status(201).json({ member, groupId: invite.groupId });
  } catch (e) {
    if (e instanceof z.ZodError) return next(new HttpError(400, e.issues[0].message));
    next(e);
  }
});
```

- [ ] **Step 10: Run backend test**

Add to `backend/tests/invites.test.ts`:
```ts
describe("POST /api/invites/:token/join (logged in)", () => {
  it("creates a member for the authenticated user", async () => {
    const founder = await makeUser();
    const { group } = await makeGroup(founder.user.id);
    const invite = await request(app).post(`/api/groups/${group.id}/invites`).set(authHeader(founder.token)).send({});
    const joiner = await makeUser();
    const res = await request(app).post(`/api/invites/${invite.body.invite.token}/join`).set(authHeader(joiner.token)).send({
      characterName: "Sam", characterEmoji: "🌿",
    });
    expect(res.status).toBe(201);
    expect(res.body.member.characterName).toBe("Sam");
    expect(res.body.groupId).toBe(group.id);
  });
});
```

Run: `npm --workspace backend test -- invites.test.ts`
Expected: all passing.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/types.ts frontend/src/lib frontend/src/api backend/src/routes/invites.ts backend/tests/invites.test.ts
git commit -m "feat: frontend types/api client/auth context + invite-join endpoint"
```

---

## Task 15: LoginPage + RegisterPage + route guards

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/components/RequireAuth.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/src/components/RequireAuth.tsx`**

```tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { ReactNode } from "react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <>{children}</>;
}
```

- [ ] **Step 2: Create `frontend/src/pages/LoginPage.tsx`**

```tsx
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await authApi.login(email, password);
      login(res.token, res.user);
      nav(sp.get("next") || "/groups");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-mantle p-6 rounded-xl border border-surface0 space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <label className="block">
          <span className="text-subtext text-sm">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <label className="block">
          <span className="text-subtext text-sm">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        {error && <p className="text-red text-sm">{error}</p>}
        <button disabled={busy} className="w-full bg-blue text-base font-semibold py-2 rounded-md hover:bg-lavender">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-subtext">
          No account? <Link to="/register" className="text-blue hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/pages/RegisterPage.tsx`**

```tsx
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";

export default function RegisterPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await authApi.register({ username, email, password });
      login(res.token, res.user);
      nav("/groups");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-mantle p-6 rounded-xl border border-surface0 space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <label className="block">
          <span className="text-subtext text-sm">Username</span>
          <input required minLength={2} value={username} onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <label className="block">
          <span className="text-subtext text-sm">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <label className="block">
          <span className="text-subtext text-sm">Password</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        {error && <p className="text-red text-sm">{error}</p>}
        <button disabled={busy} className="w-full bg-blue text-base font-semibold py-2 rounded-md hover:bg-lavender">
          {busy ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-subtext">
          Already have one? <Link to="/login" className="text-blue hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Update `frontend/src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { RequireAuth } from "./components/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/groups" element={<RequireAuth><div className="p-8">Groups dashboard coming soon</div></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm --workspace frontend run build`
Expected: build passes.

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): login + register + route guard"
```

---

## Task 16: EmojiPicker + RegisterInvitePage

**Files:**
- Create: `frontend/src/components/EmojiPicker.tsx`
- Create: `frontend/src/pages/RegisterInvitePage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/src/components/EmojiPicker.tsx`**

```tsx
import { CHARACTER_EMOJIS } from "../lib/emojis";

export function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  return (
    <div className="grid grid-cols-10 gap-1">
      {CHARACTER_EMOJIS.map((e) => (
        <button
          key={e}
          type="button"
          aria-label={`emoji ${e}`}
          aria-pressed={e === value}
          onClick={() => onChange(e)}
          className={`text-2xl p-1 rounded-md border ${
            e === value ? "border-blue bg-surface0" : "border-transparent hover:bg-surface0"
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/pages/RegisterInvitePage.tsx`**

```tsx
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import { groupsApi } from "../api/groups";
import { useAuth } from "../lib/auth";
import { ApiError } from "../api/client";
import { EmojiPicker } from "../components/EmojiPicker";
import { CHARACTER_EMOJIS } from "../lib/emojis";

export default function RegisterInvitePage() {
  const [sp] = useSearchParams();
  const token = sp.get("invite") ?? "";
  const { user, login } = useAuth();
  const nav = useNavigate();

  const [groupName, setGroupName] = useState<string>("");
  const [inviteError, setInviteError] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterEmoji, setCharacterEmoji] = useState<string>(CHARACTER_EMOJIS[0]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setInviteError("Missing invite token"); return; }
    groupsApi.getInvite(token)
      .then((r) => setGroupName(r.groupName))
      .catch((e) => setInviteError(e instanceof ApiError ? e.message : "invalid invite"));
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      if (user) {
        const r = await groupsApi.joinWithInvite(token, characterName, characterEmoji);
        nav(`/groups/${r.groupId}`);
      } else {
        const r = await authApi.registerWithInvite({ token, username, email, password, characterName, characterEmoji });
        login(r.token, r.user);
        nav(`/groups/${r.groupId}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "registration failed");
    } finally {
      setBusy(false);
    }
  }

  if (inviteError) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h1 className="text-xl font-semibold">Invite unavailable</h1>
        <p className="text-red">{inviteError}</p>
        <Link to="/register" className="text-blue hover:underline">Continue to regular registration</Link>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full max-w-lg bg-mantle p-6 rounded-xl border border-surface0 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Join {groupName || "group"}</h1>
          <p className="text-subtext text-sm">
            {user ? `Logged in as ${user.username}. Pick your character.` : "Create an account and your character."}
          </p>
        </div>
        {!user && (
          <>
            <label className="block">
              <span className="text-subtext text-sm">Username</span>
              <input required minLength={2} value={username} onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
            </label>
            <label className="block">
              <span className="text-subtext text-sm">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
            </label>
            <label className="block">
              <span className="text-subtext text-sm">Password</span>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
            </label>
          </>
        )}
        <label className="block">
          <span className="text-subtext text-sm">Character name</span>
          <input required value={characterName} onChange={(e) => setCharacterName(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <div>
          <span className="text-subtext text-sm block mb-1">Character emoji</span>
          <EmojiPicker value={characterEmoji} onChange={setCharacterEmoji} />
        </div>
        {error && <p className="text-red text-sm">{error}</p>}
        <button disabled={busy} className="w-full bg-blue text-base font-semibold py-2 rounded-md hover:bg-lavender">
          {busy ? "Joining…" : user ? "Join group" : "Create account and join"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Wire routes in `frontend/src/App.tsx`**

Replace the file:
```tsx
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterInvitePage from "./pages/RegisterInvitePage";
import { RequireAuth } from "./components/RequireAuth";

function RegisterRoute() {
  const [sp] = useSearchParams();
  return sp.get("invite") ? <RegisterInvitePage /> : <RegisterPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/groups" element={<RequireAuth><div className="p-8">Groups dashboard coming soon</div></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/EmojiPicker.tsx frontend/src/pages/RegisterInvitePage.tsx frontend/src/App.tsx
git commit -m "feat(frontend): emoji picker + invite registration page"
```

---

## Task 17: GroupsPage + New Group modal

**Files:**
- Create: `frontend/src/pages/GroupsPage.tsx`
- Create: `frontend/src/components/NewGroupModal.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/src/components/NewGroupModal.tsx`**

```tsx
import { FormEvent, useState } from "react";
import { groupsApi } from "../api/groups";
import { EmojiPicker } from "./EmojiPicker";
import { CHARACTER_EMOJIS } from "../lib/emojis";
import { ApiError } from "../api/client";

export function NewGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (groupId: string) => void }) {
  const [groupName, setGroupName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [emoji, setEmoji] = useState<string>(CHARACTER_EMOJIS[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await groupsApi.create(groupName, characterName, emoji);
      onCreated(r.group.id);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div role="dialog" className="fixed inset-0 bg-crust/70 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-mantle p-6 rounded-xl border border-surface0 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">New group</h2>
        <label className="block">
          <span className="text-subtext text-sm">Group name</span>
          <input required value={groupName} onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <label className="block">
          <span className="text-subtext text-sm">Your character's name</span>
          <input required value={characterName} onChange={(e) => setCharacterName(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <div>
          <span className="text-subtext text-sm block mb-1">Your character's emoji</span>
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </div>
        {err && <p className="text-red text-sm">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-surface1 hover:bg-surface0">Cancel</button>
          <button disabled={busy} className="px-4 py-2 rounded-md bg-blue text-base font-semibold hover:bg-lavender">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/pages/GroupsPage.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { groupsApi } from "../api/groups";
import { useAuth } from "../lib/auth";
import type { Group } from "../types";
import { NewGroupModal } from "../components/NewGroupModal";

export default function GroupsPage() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    groupsApi.list().then((r) => setGroups(r.groups)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Your groups</h1>
        <div className="flex items-center gap-3">
          <span className="text-subtext text-sm">{user?.username}</span>
          <button onClick={logout} className="text-sm text-subtext hover:text-text underline">Sign out</button>
        </div>
      </header>

      <div className="mb-4">
        <button onClick={() => setShowNew(true)} className="bg-blue text-base font-semibold px-4 py-2 rounded-md hover:bg-lavender">
          + New group
        </button>
      </div>

      {loading ? (
        <p className="text-subtext">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-subtext">You don't belong to any groups yet. Create one, or ask a friend for an invite link.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link to={`/groups/${g.id}`} className="block bg-mantle border border-surface0 rounded-xl p-4 hover:border-blue">
                <div className="text-lg font-semibold">{g.name}</div>
                <div className="text-subtext text-sm">Created {new Date(g.createdAt).toLocaleDateString()}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showNew && (
        <NewGroupModal onClose={() => setShowNew(false)} onCreated={(id) => nav(`/groups/${id}`)} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add route in `frontend/src/App.tsx`**

Replace `<Route path="/groups" ...>` with:
```tsx
<Route path="/groups" element={<RequireAuth><GroupsPage /></RequireAuth>} />
<Route path="/groups/:groupId" element={<RequireAuth><div className="p-8">Group view coming soon</div></RequireAuth>} />
```
and add `import GroupsPage from "./pages/GroupsPage";` at the top.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/NewGroupModal.tsx frontend/src/pages/GroupsPage.tsx frontend/src/App.tsx
git commit -m "feat(frontend): groups dashboard + new group modal"
```

---

## Task 18: CoinsBar + AddItemForm

**Files:**
- Create: `frontend/src/components/CoinsBar.tsx`
- Create: `frontend/src/components/AddItemForm.tsx`
- Create: `frontend/src/test/__tests__/CoinsBar.test.tsx`

- [ ] **Step 1: Write failing test `frontend/src/test/__tests__/CoinsBar.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoinsBar } from "../../components/CoinsBar";

const coins = { id: "c", groupId: "g", platinum: 1, electrum: 0, gold: 10, silver: 0, copper: 0 };

describe("CoinsBar", () => {
  it("shows every coin denomination", () => {
    render(<CoinsBar coins={coins} onChange={() => {}} />);
    expect(screen.getByLabelText(/platinum/i)).toHaveValue(1);
    expect(screen.getByLabelText(/gold/i)).toHaveValue(10);
    expect(screen.getByLabelText(/copper/i)).toHaveValue(0);
  });

  it("calls onChange when a value is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CoinsBar coins={coins} onChange={onChange} />);
    const gold = screen.getByLabelText(/gold/i);
    await user.clear(gold);
    await user.type(gold, "25");
    gold.blur();
    expect(onChange).toHaveBeenLastCalledWith({ gold: 25 });
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace frontend test -- CoinsBar`
Expected: fails — component missing.

- [ ] **Step 3: Create `frontend/src/components/CoinsBar.tsx`**

```tsx
import { useState } from "react";
import type { Coins } from "../types";

const FIELDS: { key: keyof Omit<Coins, "id" | "groupId">; label: string; color: string }[] = [
  { key: "platinum", label: "Platinum", color: "text-lavender" },
  { key: "electrum", label: "Electrum", color: "text-mauve" },
  { key: "gold",     label: "Gold",     color: "text-yellow" },
  { key: "silver",   label: "Silver",   color: "text-subtext" },
  { key: "copper",   label: "Copper",   color: "text-peach" },
];

export function CoinsBar({
  coins,
  onChange,
}: {
  coins: Coins;
  onChange: (patch: Partial<Pick<Coins, "platinum" | "electrum" | "gold" | "silver" | "copper">>) => void;
}) {
  const [local, setLocal] = useState(coins);

  function commit(key: keyof typeof local, raw: string) {
    const v = Math.max(0, Math.floor(Number(raw) || 0));
    if (v === coins[key]) return;
    setLocal((l) => ({ ...l, [key]: v }));
    onChange({ [key]: v } as never);
  }

  return (
    <div className="bg-mantle border border-surface0 rounded-xl p-3 flex flex-wrap gap-4">
      {FIELDS.map(({ key, label, color }) => (
        <label key={key} className="flex items-center gap-2">
          <span className={`font-semibold ${color}`}>{label[0]}P</span>
          <span className="sr-only">{label}</span>
          <input
            aria-label={label.toLowerCase()}
            type="number"
            min={0}
            value={local[key]}
            onChange={(e) => setLocal({ ...local, [key]: Number(e.target.value) })}
            onBlur={(e) => commit(key, e.target.value)}
            className="w-20 bg-base border border-surface1 rounded-md p-1 text-right"
          />
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test**

Run: `npm --workspace frontend test -- CoinsBar`
Expected: 2 passing.

- [ ] **Step 5: Create `frontend/src/components/AddItemForm.tsx`**

```tsx
import { FormEvent, useState } from "react";
import { itemsApi } from "../api/items";
import type { Item } from "../types";
import { ApiError } from "../api/client";

export function AddItemForm({ groupId, onClose, onAdded }: {
  groupId: string;
  onClose: () => void;
  onAdded: (item: Item) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(1);
  const [value, setValue] = useState("0");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await itemsApi.create(groupId, { name, description, amount, value });
      onAdded(r.item);
      onClose();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div role="dialog" className="fixed inset-0 bg-crust/70 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-mantle p-6 rounded-xl border border-surface0 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Add item to hoard</h2>
        <label className="block">
          <span className="text-subtext text-sm">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <label className="block">
          <span className="text-subtext text-sm">Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
        </label>
        <div className="flex gap-3">
          <label className="block flex-1">
            <span className="text-subtext text-sm">Amount</span>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
          </label>
          <label className="block flex-1">
            <span className="text-subtext text-sm">Value (gp)</span>
            <input type="number" step="0.01" min={0} value={value} onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none" />
          </label>
        </div>
        {err && <p className="text-red text-sm">{err}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-surface1 hover:bg-surface0">Cancel</button>
          <button disabled={busy} className="px-4 py-2 rounded-md bg-blue text-base font-semibold hover:bg-lavender">
            {busy ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/CoinsBar.tsx frontend/src/components/AddItemForm.tsx frontend/src/test
git commit -m "feat(frontend): coins bar + add-item form"
```

---

## Task 19: MoveItemModal

**Files:**
- Create: `frontend/src/components/MoveItemModal.tsx`
- Create: `frontend/src/test/__tests__/MoveItemModal.test.tsx`

- [ ] **Step 1: Write failing test `frontend/src/test/__tests__/MoveItemModal.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoveItemModal } from "../../components/MoveItemModal";
import type { Item, Member } from "../../types";

const item: Item = {
  id: "i1", groupId: "g", memberId: null, name: "Arrows",
  description: "", amount: 20, value: "0", createdAt: "", updatedAt: "",
};
const members: Member[] = [
  { id: "m1", userId: "u1", groupId: "g", characterName: "Legolas", characterEmoji: "🏹", joinedAt: "" },
  { id: "m2", userId: "u2", groupId: "g", characterName: "Gimli",   characterEmoji: "🪓", joinedAt: "" },
];

describe("MoveItemModal", () => {
  it("disables the current location button", () => {
    render(<MoveItemModal item={item} members={members} onClose={() => {}} onMove={() => {}} />);
    expect(screen.getByRole("button", { name: /hoard/i })).toBeDisabled();
  });

  it("selecting a destination and confirming calls onMove with quantity", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<MoveItemModal item={item} members={members} onClose={() => {}} onMove={onMove} />);
    await user.click(screen.getByRole("button", { name: /Legolas/ }));
    const qty = screen.getByLabelText(/quantity/i);
    await user.clear(qty);
    await user.type(qty, "5");
    await user.click(screen.getByRole("button", { name: /Move 5/ }));
    expect(onMove).toHaveBeenCalledWith(5, "m1");
  });

  it("hides quantity input when amount is 1", () => {
    render(<MoveItemModal item={{ ...item, amount: 1 }} members={members} onClose={() => {}} onMove={() => {}} />);
    expect(screen.queryByLabelText(/quantity/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace frontend test -- MoveItemModal`
Expected: fails.

- [ ] **Step 3: Create `frontend/src/components/MoveItemModal.tsx`**

```tsx
import { useState } from "react";
import type { Item, Member } from "../types";

export function MoveItemModal({
  item, members, onClose, onMove,
}: {
  item: Item;
  members: Member[];
  onClose: () => void;
  onMove: (quantity: number, destinationMemberId: string | null) => void;
}) {
  const currentLabel = item.memberId
    ? members.find((m) => m.id === item.memberId)?.characterName ?? "Character"
    : "Hoard";
  const [dest, setDest] = useState<string | null | undefined>(undefined);
  const [qty, setQty] = useState(item.amount);

  const destName = dest === undefined
    ? null
    : dest === null ? "Hoard" : members.find((m) => m.id === dest)?.characterName ?? "";

  const canConfirm = dest !== undefined && qty >= 1 && qty <= item.amount;

  return (
    <div role="dialog" className="fixed inset-0 bg-crust/70 flex items-center justify-center p-4">
      <div className="bg-mantle p-6 rounded-xl border border-surface0 w-full max-w-md space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Move {item.name}</h2>
          <p className="text-subtext text-sm">Currently in {currentLabel}</p>
        </div>
        <div>
          <span className="text-subtext text-sm block mb-2">Destination</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={item.memberId === null}
              onClick={() => setDest(null)}
              aria-pressed={dest === null}
              className={`p-3 rounded-md border ${dest === null ? "border-blue bg-surface0" : "border-surface1 hover:bg-surface0"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >🏰 Hoard</button>
            {members.map((m) => (
              <button
                key={m.id}
                disabled={item.memberId === m.id}
                onClick={() => setDest(m.id)}
                aria-pressed={dest === m.id}
                className={`p-3 rounded-md border ${dest === m.id ? "border-blue bg-surface0" : "border-surface1 hover:bg-surface0"} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {m.characterEmoji} {m.characterName}
              </button>
            ))}
          </div>
        </div>
        {item.amount > 1 && (
          <label className="block">
            <span className="text-subtext text-sm">Quantity (max {item.amount})</span>
            <input
              aria-label="quantity"
              type="number"
              min={1}
              max={item.amount}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(item.amount, Number(e.target.value) || 1)))}
              className="mt-1 w-full bg-base rounded-md p-2 border border-surface1 focus:border-blue outline-none"
            />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-surface1 hover:bg-surface0">Cancel</button>
          <button
            disabled={!canConfirm}
            onClick={() => canConfirm && onMove(qty, dest ?? null)}
            className="px-4 py-2 rounded-md bg-blue text-base font-semibold hover:bg-lavender disabled:opacity-40"
          >
            {canConfirm ? `Move ${qty} to ${destName}` : "Select destination"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test**

Run: `npm --workspace frontend test -- MoveItemModal`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/MoveItemModal.tsx frontend/src/test/__tests__/MoveItemModal.test.tsx
git commit -m "feat(frontend): move-item modal"
```

---

## Task 20: BoardView + ListView + GroupPage assembly

**Files:**
- Create: `frontend/src/components/BoardView.tsx`
- Create: `frontend/src/components/ListView.tsx`
- Create: `frontend/src/components/InviteButton.tsx`
- Create: `frontend/src/pages/GroupPage.tsx`
- Create: `frontend/src/test/__tests__/ListView.test.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write failing test `frontend/src/test/__tests__/ListView.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListView } from "../../components/ListView";
import type { Item, Member } from "../../types";

const members: Member[] = [
  { id: "m1", userId: "u", groupId: "g", characterName: "Frodo", characterEmoji: "🌿", joinedAt: "" },
];
const items: Item[] = [
  { id: "i1", groupId: "g", memberId: null, name: "Rope",  description: "", amount: 2, value: "1", createdAt: "", updatedAt: "" },
  { id: "i2", groupId: "g", memberId: "m1", name: "Sting", description: "", amount: 1, value: "500", createdAt: "", updatedAt: "" },
];

describe("ListView", () => {
  it("renders rows with location labels", () => {
    render(<ListView items={items} members={members} onMove={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Rope")).toBeInTheDocument();
    expect(screen.getByText("Hoard")).toBeInTheDocument();
    expect(screen.getByText(/Frodo/)).toBeInTheDocument();
  });

  it("sorts by name when column header clicked", async () => {
    const user = userEvent.setup();
    render(<ListView items={items} members={members} onMove={() => {}} onDelete={() => {}} />);
    await user.click(screen.getByRole("button", { name: /name/i }));
    const rows = screen.getAllByRole("row").slice(1).map((r) => r.textContent);
    expect(rows[0]).toContain("Rope");
    expect(rows[1]).toContain("Sting");
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm --workspace frontend test -- ListView`
Expected: fails.

- [ ] **Step 3: Create `frontend/src/components/ListView.tsx`**

```tsx
import { useMemo, useState } from "react";
import type { Item, Member } from "../types";

type SortKey = "name" | "amount" | "value" | "location";

function locationLabel(item: Item, members: Member[]) {
  if (!item.memberId) return "Hoard";
  const m = members.find((x) => x.id === item.memberId);
  return m ? `${m.characterEmoji} ${m.characterName}` : "Unknown";
}

export function ListView({
  items, members, onMove, onDelete,
}: {
  items: Item[];
  members: Member[];
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const [sort, setSort] = useState<SortKey>("name");
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    const dir = asc ? 1 : -1;
    return [...items].sort((a, b) => {
      switch (sort) {
        case "name": return dir * a.name.localeCompare(b.name);
        case "amount": return dir * (a.amount - b.amount);
        case "value": return dir * (Number(a.value) - Number(b.value));
        case "location": return dir * locationLabel(a, members).localeCompare(locationLabel(b, members));
      }
    });
  }, [items, sort, asc, members]);

  function toggle(k: SortKey) {
    if (sort === k) setAsc(!asc);
    else { setSort(k); setAsc(true); }
  }

  const Header = ({ k, label }: { k: SortKey; label: string }) => (
    <th className="text-left p-2">
      <button onClick={() => toggle(k)} className="font-semibold hover:text-blue">
        {label}{sort === k ? (asc ? " ↑" : " ↓") : ""}
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto bg-mantle border border-surface0 rounded-xl">
      <table className="w-full text-sm">
        <thead className="border-b border-surface0">
          <tr>
            <Header k="name" label="Name" />
            <Header k="amount" label="Amount" />
            <Header k="value" label="Value" />
            <Header k="location" label="Location" />
            <th className="p-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((it) => (
            <tr key={it.id} className="border-t border-surface0">
              <td className="p-2 font-medium">{it.name}</td>
              <td className="p-2">{it.amount}</td>
              <td className="p-2">{it.value}</td>
              <td className="p-2">{locationLabel(it, members)}</td>
              <td className="p-2 text-right">
                <button onClick={() => onMove(it)} className="text-blue hover:underline mr-3">Move</button>
                <button onClick={() => onDelete(it)} className="text-red hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create `frontend/src/components/BoardView.tsx`**

```tsx
import type { Item, Member } from "../types";

function Column({
  title, subtitle, items, onMove, onDelete, dimNonMatching, matcher,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
  dimNonMatching: boolean;
  matcher: (item: Item) => boolean;
}) {
  return (
    <div className="flex flex-col bg-mantle border border-surface0 rounded-xl w-72 shrink-0 max-h-full">
      <div className="p-3 border-b border-surface0">
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs text-subtext">{subtitle}</div>}
        <div className="text-xs text-subtext">{items.length} item{items.length === 1 ? "" : "s"}</div>
      </div>
      <ul className="p-2 space-y-2 overflow-y-auto">
        {items.map((it) => {
          const match = matcher(it);
          return (
            <li
              key={it.id}
              className={`bg-base border border-surface1 rounded-md p-2 ${dimNonMatching && !match ? "opacity-30" : match && dimNonMatching ? "border-blue" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-subtext">×{it.amount}</div>
              </div>
              {it.description && <div className="text-xs text-subtext mt-1">{it.description}</div>}
              <div className="mt-2 flex gap-3 text-xs">
                <button onClick={() => onMove(it)} className="text-blue hover:underline">Move</button>
                <button onClick={() => onDelete(it)} className="text-red hover:underline">Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BoardView({
  items, members, search, onMove, onDelete,
}: {
  items: Item[];
  members: Member[];
  search: string;
  onMove: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  const q = search.trim().toLowerCase();
  const matcher = (it: Item) =>
    !q || it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);

  const hoard = items.filter((i) => i.memberId === null);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <Column title="🏰 Hoard" items={hoard} onMove={onMove} onDelete={onDelete} dimNonMatching={!!q} matcher={matcher} />
      {members.map((m) => (
        <Column
          key={m.id}
          title={`${m.characterEmoji} ${m.characterName}`}
          items={items.filter((i) => i.memberId === m.id)}
          onMove={onMove}
          onDelete={onDelete}
          dimNonMatching={!!q}
          matcher={matcher}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `frontend/src/components/InviteButton.tsx`**

```tsx
import { useState } from "react";
import { groupsApi } from "../api/groups";
import { ApiError } from "../api/client";

export function InviteButton({ groupId }: { groupId: string }) {
  const [link, setLink] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function gen() {
    setBusy(true); setErr("");
    try {
      const r = await groupsApi.createInvite(groupId);
      setLink(`${window.location.origin}/register?invite=${r.invite.token}`);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={gen} disabled={busy} className="text-sm px-3 py-1 rounded-md border border-surface1 hover:bg-surface0">
        {busy ? "…" : "Invite"}
      </button>
      {link && (
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="bg-base border border-surface1 rounded-md p-1 text-xs w-64"
        />
      )}
      {err && <span className="text-red text-xs">{err}</span>}
    </div>
  );
}
```

- [ ] **Step 6: Create `frontend/src/pages/GroupPage.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { groupsApi } from "../api/groups";
import { itemsApi } from "../api/items";
import { coinsApi } from "../api/coins";
import type { Group, Coins, Member, Item } from "../types";
import { CoinsBar } from "../components/CoinsBar";
import { BoardView } from "../components/BoardView";
import { ListView } from "../components/ListView";
import { AddItemForm } from "../components/AddItemForm";
import { MoveItemModal } from "../components/MoveItemModal";
import { InviteButton } from "../components/InviteButton";

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<(Group & { members: Member[]; coins: Coins }) | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState<Item | null>(null);

  async function refresh() {
    if (!groupId) return;
    const [g, it] = await Promise.all([groupsApi.get(groupId), itemsApi.list(groupId)]);
    setGroup(g.group); setItems(it.items);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [groupId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }, [items, search]);

  const matchSummary = useMemo(() => {
    if (!search.trim() || !group) return "";
    const locs = new Set<string>();
    for (const i of filtered) {
      locs.add(i.memberId ? group.members.find((m) => m.id === i.memberId)?.characterName ?? "?" : "Hoard");
    }
    return locs.size === 0 ? "No matches" : `Found in ${[...locs].join(", ")}`;
  }, [filtered, search, group]);

  async function onMove(itemId: string, qty: number, destId: string | null) {
    if (!groupId) return;
    await itemsApi.move(groupId, itemId, qty, destId);
    await refresh();
    setMoving(null);
  }

  async function onDelete(item: Item) {
    if (!groupId) return;
    if (!confirm(`Delete ${item.name}?`)) return;
    await itemsApi.delete(groupId, item.id);
    await refresh();
  }

  if (loading) return <p className="p-8 text-subtext">Loading…</p>;
  if (!group) return <p className="p-8 text-red">Group not found.</p>;

  return (
    <div className="min-h-full p-6 space-y-4 max-w-[1600px] mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <Link to="/groups" className="text-subtext text-sm hover:text-text">← All groups</Link>
          <h1 className="text-2xl font-semibold">{group.name}</h1>
        </div>
        <InviteButton groupId={group.id} />
      </header>

      <CoinsBar
        coins={group.coins}
        onChange={async (patch) => {
          const r = await coinsApi.update(group.id, patch);
          setGroup({ ...group, coins: r.coins });
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setAdding(true)} className="bg-blue text-base font-semibold px-4 py-2 rounded-md hover:bg-lavender">
          + Add Item to Hoard
        </button>
        <input
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-base border border-surface1 rounded-md p-2 w-64"
        />
        <div className="flex rounded-md overflow-hidden border border-surface1">
          <button onClick={() => setView("board")} className={`px-3 py-1 ${view === "board" ? "bg-surface0" : ""}`}>Board</button>
          <button onClick={() => setView("list")} className={`px-3 py-1 ${view === "list" ? "bg-surface0" : ""}`}>List</button>
        </div>
        {search && <span className="text-subtext text-sm">{matchSummary}</span>}
      </div>

      {view === "board" ? (
        <BoardView
          items={items}
          members={group.members}
          search={search}
          onMove={setMoving}
          onDelete={onDelete}
        />
      ) : (
        <ListView
          items={filtered}
          members={group.members}
          onMove={setMoving}
          onDelete={onDelete}
        />
      )}

      {adding && (
        <AddItemForm groupId={group.id} onClose={() => setAdding(false)} onAdded={() => refresh()} />
      )}
      {moving && (
        <MoveItemModal
          item={moving}
          members={group.members}
          onClose={() => setMoving(null)}
          onMove={(q, dest) => onMove(moving.id, q, dest)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 7: Wire route in `frontend/src/App.tsx`**

Replace the placeholder for `/groups/:groupId`:
```tsx
import GroupPage from "./pages/GroupPage";
// ...
<Route path="/groups/:groupId" element={<RequireAuth><GroupPage /></RequireAuth>} />
```

- [ ] **Step 8: Run ListView test**

Run: `npm --workspace frontend test -- ListView`
Expected: 2 passing.

- [ ] **Step 9: Run all frontend tests**

Run: `npm --workspace frontend test`
Expected: all tests (CoinsBar, MoveItemModal, ListView) passing.

- [ ] **Step 10: Commit**

```bash
git add frontend/src
git commit -m "feat(frontend): board + list views assembled into GroupPage"
```

---

## Task 21: End-to-end smoke test (manual)

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Start backend and frontend**

Run (two terminals):
```bash
npm run dev:backend
npm run dev:frontend
```
Expected: backend on :3001, frontend on :5173.

- [ ] **Step 2: Walk through the full flow in the browser**

Manual checklist (mark each as you complete it):
- Register as user A at http://localhost:5173/register
- Create group "Smoke Test" with character "Alpha" emoji ⚔
- Add three items to the Hoard (Arrows ×20, Potion ×3, Rope ×1)
- Generate invite link from the group page
- Open invite link in a private/incognito window, register user B with character "Beta" 🏹
- Back in user A window, refresh; move 7 Arrows to Beta
- Switch to List view; verify both Alpha and Beta appear as locations
- Edit coins (Platinum=1, Gold=50, Silver=10); refresh; values persist
- Delete the Rope item

Expected: every step succeeds; no 500 errors in backend log.

- [ ] **Step 3: Run all tests once more**

Run: `npm test`
Expected: every workspace passes.

- [ ] **Step 4: Commit any README tweaks**

If you updated `README.md` with any discovered gotchas:
```bash
git add README.md
git commit -m "docs: README smoke-test notes"
```

---

## Self-Review Checklist

Before declaring the plan complete, confirm:

1. **Spec coverage:**
   - ✅ All 6 data models present in Task 3 (User, Group, Invite, GroupMember, Item, GroupCoins)
   - ✅ All auth routes (Tasks 7, 9)
   - ✅ All group routes (Task 8, 9) — create, list, get, invite generation, invite lookup
   - ✅ All item routes (Tasks 10, 11) — GET/POST/PATCH/DELETE + move
   - ✅ Coins PATCH (Task 12)
   - ✅ Frontend routes: `/login` (15), `/register` (15, 16), `/register?invite=` (16), `/groups` (17), `/groups/:id` (20)
   - ✅ Curated emoji whitelist (Task 6 backend, Task 14 frontend)
   - ✅ Kanban board + flat list + client-side search + match summary (Task 20)
   - ✅ Move modal with quantity stepper shown only when amount > 1 (Task 19)
   - ✅ Existing-user-joining-via-invite branch (Task 14 + Task 16)

2. **Placeholders:** none — every step has complete code.

3. **Type consistency:**
   - `Item.memberId: string | null` used consistently.
   - `move` signature `(quantity: number, destinationMemberId: string | null)` matches across backend route, frontend API client, and modal callback.
   - `CoinsBar.onChange` receives a partial patch object both in tests and in `GroupPage.tsx` callsite.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-14-ttrpg-loot-manager.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
