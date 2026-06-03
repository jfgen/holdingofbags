# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public landing page at `/` with a nav, hero, features, testimonials, pricing, and footer sections.

**Architecture:** New `LandingPage.tsx` React component added as a `/` route in `App.tsx`. All sections are sub-components defined in the same file. No backend changes.

**Tech Stack:** React, React Router `<Link>`, Tailwind CSS (Catppuccin Mocha theme tokens already in `tailwind.config.ts`)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `frontend/src/pages/LandingPage.tsx` | All landing page sections |
| Create | `frontend/src/test/__tests__/LandingPage.test.tsx` | Render + navigation tests |
| Modify | `frontend/src/App.tsx` | Add `/` route before catch-all |
| Add | `frontend/public/hero.jpg` | Hero photograph (manual download) |

---

## Task 1: Write tests + stub component + wire route

**Files:**
- Create: `frontend/src/test/__tests__/LandingPage.test.tsx`
- Create: `frontend/src/pages/LandingPage.tsx` (stub)
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Write the test file**

```tsx
// frontend/src/test/__tests__/LandingPage.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../../pages/LandingPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
}

describe("LandingPage", () => {
  it("renders the app name", () => {
    renderPage();
    expect(screen.getByText("Holding of Bags")).toBeInTheDocument();
  });

  it("nav Sign In links to /login", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /sign in/i });
    expect(links[0]).toHaveAttribute("href", "/login");
  });

  it("nav Get Started Free links to /register", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /get started free/i });
    expect(links[0]).toHaveAttribute("href", "/register");
  });

  it("renders the hero h1", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/your party's loot/i);
  });

  it("hero CTA links to /register", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /create your group/i })).toHaveAttribute("href", "/register");
  });

  it("renders the features section heading", () => {
    renderPage();
    expect(screen.getByText(/everything your party needs/i)).toBeInTheDocument();
  });

  it("renders all four feature cards", () => {
    renderPage();
    expect(screen.getByText(/cloud-based/i)).toBeInTheDocument();
    expect(screen.getByText(/up and running in minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/shared hoard/i)).toBeInTheDocument();
    expect(screen.getByText(/everything at a glance/i)).toBeInTheDocument();
  });

  it("renders the testimonials section heading", () => {
    renderPage();
    expect(screen.getByText(/loved by parties everywhere/i)).toBeInTheDocument();
  });

  it("renders three testimonial authors", () => {
    renderPage();
    expect(screen.getByText("Marieke V.")).toBeInTheDocument();
    expect(screen.getByText("Tomás R.")).toBeInTheDocument();
    expect(screen.getByText("Priya S.")).toBeInTheDocument();
  });

  it("renders the pricing section heading", () => {
    renderPage();
    expect(screen.getByText(/simple pricing/i)).toBeInTheDocument();
  });

  it("renders both pricing tiers", () => {
    renderPage();
    expect(screen.getByText("€0")).toBeInTheDocument();
    expect(screen.getByText("€5")).toBeInTheDocument();
  });

  it("pricing CTAs link to /register", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /get started free/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /upgrade to proficient/i })).toHaveAttribute("href", "/register");
  });

  it("footer Sign In links to /login", () => {
    renderPage();
    const links = screen.getAllByRole("link", { name: /sign in/i });
    expect(links[links.length - 1]).toHaveAttribute("href", "/login");
  });
});
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: all tests FAIL with `Cannot find module '../../pages/LandingPage'`

- [ ] **Step 3: Create stub LandingPage**

```tsx
// frontend/src/pages/LandingPage.tsx
export default function LandingPage() {
  return <div />;
}
```

- [ ] **Step 4: Run tests again — expect import errors to clear, assertions to fail**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: tests FAIL with assertion errors (component renders nothing), not import errors

- [ ] **Step 5: Add the `/` route to App.tsx**

Open `frontend/src/App.tsx`. The current routes end with:
```tsx
<Route path="*" element={<Navigate to="/groups" replace />} />
```

Replace the entire file with:
```tsx
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisterInvitePage from "./pages/RegisterInvitePage";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";
import LandingPage from "./pages/LandingPage";
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterRoute />} />
          <Route path="/groups" element={<RequireAuth><GroupsPage /></RequireAuth>} />
          <Route path="/groups/:groupId" element={<RequireAuth><GroupPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 6: Commit stub + tests + route**

```bash
git add frontend/src/pages/LandingPage.tsx \
        frontend/src/test/__tests__/LandingPage.test.tsx \
        frontend/src/App.tsx
git commit -m "feat: add / route + LandingPage stub + tests"
```

---

## Task 2: Nav + Hero sections

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Replace stub with Nav + Hero implementation**

```tsx
// frontend/src/pages/LandingPage.tsx
import { Link } from "react-router-dom";

function Nav() {
  return (
    <nav className="flex items-center justify-between px-12 py-3.5 border-b border-surface0 bg-base">
      <div className="flex items-center gap-2 font-bold text-[15px] text-text">
        <span>⚔️</span>
        <span>Holding of Bags</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Link
          to="/login"
          className="border border-surface1 text-text font-semibold rounded-md px-3.5 py-1.5 text-sm hover:border-mauve hover:text-mauve transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="bg-mauve text-crust font-semibold rounded-md px-3.5 py-1.5 text-sm hover:brightness-90 transition-all duration-200"
        >
          Get Started Free
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="grid grid-cols-2 min-h-[380px]">
      <div className="flex flex-col justify-center px-14 py-16">
        <p className="text-[10px] font-bold tracking-widest uppercase text-mauve mb-3">
          TTRPG Loot Manager
        </p>
        <h1 className="text-[32px] font-extrabold leading-tight text-text mb-4">
          Your party's loot,{" "}
          <em className="not-italic text-mauve">always in hand</em>
        </h1>
        <p className="text-sm text-subtext leading-relaxed mb-7 max-w-[400px]">
          No more lost notebooks. No more "I think I had that potion?"
          Holding of Bags keeps your group's items, coins, and hoard in one
          place — accessible to everyone, any time.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="bg-mauve text-crust font-bold rounded-lg px-6 py-2.5 text-sm hover:brightness-90 hover:-translate-y-px transition-all duration-200"
          >
            Create Your Group →
          </Link>
          <Link
            to="/login"
            className="text-subtext text-sm underline underline-offset-2 hover:text-text transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden">
        <img
          src="/hero.jpg"
          alt="People playing tabletop RPG around a table"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-base to-transparent" />
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mantle text-text">
      <Nav />
      <Hero />
    </div>
  );
}
```

- [ ] **Step 2: Run the Nav + Hero tests**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: the following tests PASS, others still fail:
- `renders the app name`
- `nav Sign In links to /login`
- `nav Get Started Free links to /register`
- `renders the hero h1`
- `hero CTA links to /register`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "feat(landing): nav + hero sections"
```

---

## Task 3: Features section

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Add FEATURES data + Features component**

Add the following before `export default function LandingPage`:

```tsx
const FEATURES = [
  {
    icon: "☁️",
    title: "Cloud-based & always accessible",
    body: "Your loot lives in the cloud. Open it on your phone, laptop, or tablet — mid-session or between sessions. If you have a browser, you have your hoard.",
  },
  {
    icon: "⚡",
    title: "Up and running in minutes",
    body: "Create a group, share the invite link, and your whole party is in. No downloads, no configuration. Just send the link and roll.",
  },
  {
    icon: "🎒",
    title: "Shared hoard, per-character inventory",
    body: "Add items to the party hoard, then assign them to individual characters. Split stacks, move between players, or keep it communal — your call.",
  },
  {
    icon: "👁️",
    title: "Everything at a glance",
    body: "Board view shows each character's items side by side. List view gives you a flat table to search and sort. Coin pool always visible. Nothing buried.",
  },
];

function Features() {
  return (
    <section className="border-t border-surface0 py-16">
      <div className="max-w-[1200px] mx-auto px-12">
      <div className="text-center mb-10">
        <h2 className="text-[22px] font-bold text-text mb-2">Everything your party needs</h2>
        <p className="text-sm text-overlay0">Built for the table, designed to get out of the way</p>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-mantle border border-surface0 rounded-xl p-6">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-sm font-bold text-text mb-2">{f.title}</h3>
            <p className="text-xs text-subtext leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
```

Update `LandingPage` to include `<Features />`:

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mantle text-text">
      <Nav />
      <Hero />
      <Features />
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: additionally passing now:
- `renders the features section heading`
- `renders all four feature cards`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "feat(landing): features section"
```

---

## Task 4: Testimonials section

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Add TESTIMONIALS data + Testimonials component**

Add before `export default function LandingPage`:

```tsx
const TESTIMONIALS = [
  {
    quote:
      "We used to have a spreadsheet, a shared note, and someone's memory all disagreeing with each other. Now everything's in one place and we actually argue about tactics instead of who has the healing potion.",
    avatar: "🧙",
    name: "Marieke V.",
    role: "DM · D&D 5e",
  },
  {
    quote:
      "Our DM set this up five minutes before the session started, sent us a link, and we were all in before the first roll. I don't think I've ever onboarded to anything that fast. We've used it every session since.",
    avatar: "🐉",
    name: "Tomás R.",
    role: "Player · Pathfinder 2e",
  },
  {
    quote:
      "The board view is a game changer. I can see every character's inventory at once without interrupting anyone. We used to lose 10 minutes every session just figuring out who was carrying what. That's gone now.",
    avatar: "⚔️",
    name: "Priya S.",
    role: "Player · Shadowdark",
  },
];

function Testimonials() {
  return (
    <section className="border-t border-surface0 bg-crust py-16">
      <div className="max-w-[1200px] mx-auto px-12">
      <div className="text-center mb-10">
        <h2 className="text-[22px] font-bold text-text mb-2">Loved by parties everywhere</h2>
        <p className="text-sm text-overlay0">Real players, less time on admin, more time rolling dice</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="bg-base border border-surface0 rounded-xl p-7 flex flex-col gap-5">
            <blockquote className="text-sm text-subtext leading-relaxed relative pt-1">
              <span className="absolute -top-2.5 -left-1 text-5xl leading-none text-surface0 font-serif select-none">
                "
              </span>
              {t.quote}
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface0 flex items-center justify-center text-lg flex-shrink-0">
                {t.avatar}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-text">{t.name}</span>
                <span className="text-xs text-overlay0">{t.role}</span>
              </div>
              <span className="ml-auto text-yellow text-xs tracking-wide">★★★★★</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Update `LandingPage`:

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mantle text-text">
      <Nav />
      <Hero />
      <Features />
      <Testimonials />
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: additionally passing:
- `renders the testimonials section heading`
- `renders three testimonial authors`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "feat(landing): testimonials section"
```

---

## Task 5: Pricing section + Footer

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx`

- [ ] **Step 1: Add pricing data + Pricing + Footer components**

Add before `export default function LandingPage`:

```tsx
const FREE_FEATURES = [
  "Shared loot hoard",
  "Per-character item assignment",
  "Stack splitting & item moves",
  "Group coin pool (5 denominations)",
  "Invite members via link",
  "Board & list views",
  "Unlimited groups",
];

const PRO_FEATURES = [
  "Item weight management",
  "D&D 5e open API integration",
  "Pathfinder 2e open API integration",
  "Shadowdark integration",
  "Random loot generator",
  "Early access to new features",
];

function Pricing() {
  return (
    <section className="border-t border-surface0 bg-mantle py-16">
      <div className="max-w-[1200px] mx-auto px-12">
      <div className="text-center mb-10">
        <h2 className="text-[22px] font-bold text-text mb-2">Simple pricing</h2>
        <p className="text-sm text-overlay0">Start free. Upgrade when your party needs more.</p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-w-[720px] mx-auto">
        {/* Free tier */}
        <div className="bg-base border border-surface0 rounded-xl p-8 flex flex-col">
          <p className="text-[11px] font-bold tracking-widest uppercase text-subtext mb-2">Free</p>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-4xl font-extrabold text-text">€0</span>
            <span className="text-sm text-overlay0">/ month</span>
          </div>
          <p className="text-xs text-overlay0 mb-5">Everything you need to get started</p>
          <hr className="border-surface0 mb-4" />
          <ul className="flex flex-col gap-2.5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-subtext">
                <span className="text-green mt-0.5 flex-shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-6 block w-full text-center border border-surface1 text-text font-semibold rounded-lg py-2.5 text-sm hover:border-mauve hover:text-mauve transition-colors duration-200"
          >
            Get Started Free
          </Link>
        </div>

        {/* Proficient tier */}
        <div className="bg-base border border-mauve rounded-xl p-8 flex flex-col relative shadow-[0_4px_24px_rgba(203,166,247,0.15)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mauve text-crust text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap">
            ⚔ Proficient
          </div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-mauve mb-2">Proficient</p>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-4xl font-extrabold text-text">€5</span>
            <span className="text-sm text-overlay0">/ month</span>
          </div>
          <p className="text-xs text-overlay0 mb-5">For groups who want the full experience</p>
          <hr className="border-surface0 mb-4" />
          <ul className="flex flex-col gap-2.5 flex-1">
            <li className="flex items-start gap-2 text-xs text-subtext">
              <span className="text-green mt-0.5 flex-shrink-0">✓</span>
              Everything in Free
            </li>
            <li className="pt-1">
              <span className="text-[9px] font-bold tracking-widest uppercase text-surface2">
                Power features
              </span>
            </li>
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-subtext">
                <span className="text-mauve mt-0.5 flex-shrink-0">✦</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="mt-6 block w-full text-center bg-mauve text-crust font-bold rounded-lg py-2.5 text-sm hover:brightness-90 hover:-translate-y-px transition-all duration-200"
          >
            Upgrade to Proficient →
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface0">
    <div className="max-w-[1200px] mx-auto px-12 py-6 flex items-center justify-between">
      <p className="text-xs text-surface1">© 2026 Holding of Bags</p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="text-xs text-surface2 hover:text-subtext transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="text-xs text-surface2 hover:text-subtext transition-colors duration-200"
        >
          Create Account
        </Link>
      </div>
    </div>
    </footer>
  );
}
```

Update `LandingPage` to the final form:

```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mantle text-text">
      <Nav />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Run all tests — expect full green**

```bash
npm --workspace frontend run test -- --reporter=verbose LandingPage
```

Expected: all 14 tests PASS

- [ ] **Step 3: Run the full frontend test suite to check for regressions**

```bash
npm --workspace frontend run test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx
git commit -m "feat(landing): pricing + footer sections — all tests passing"
```

---

## Task 6: Add hero photograph

**Files:**
- Add: `frontend/public/hero.jpg`

- [ ] **Step 1: Download a free TTRPG photo from Unsplash**

Go to [unsplash.com](https://unsplash.com) and search for `tabletop rpg` or `people playing dungeons dragons`. Pick an atmospheric, warm photo of people gathered around a table with dice and miniatures.

Download it and save it as `frontend/public/hero.jpg`. Aim for a file ≤ 500 KB (use the "medium" download size from Unsplash).

Alternatively, download directly via curl (replace the URL with the one you chose):

```bash
curl -L "https://images.unsplash.com/photo-<ID>?w=1200&q=80" \
  -o frontend/public/hero.jpg
```

- [ ] **Step 2: Verify the image loads in the browser**

With `npm run dev` running, open `http://localhost:5173`. The hero section right side should show the photo. The left-edge gradient (`from-base to-transparent`) should blend it smoothly into the dark background.

If the image is too bright or the gradient blending looks off, add a dark overlay by updating the `<div>` inside `<Hero>`:

```tsx
{/* existing overlay */}
<div className="absolute inset-0 bg-gradient-to-r from-base to-transparent" />
{/* optional: darken the whole image if it's too light */}
<div className="absolute inset-0 bg-black/20" />
```

- [ ] **Step 3: Commit**

```bash
git add frontend/public/hero.jpg
git commit -m "feat(landing): add hero photograph"
```
