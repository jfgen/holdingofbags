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
      </div>
    </section>
  );
}

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
