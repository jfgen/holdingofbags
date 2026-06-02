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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-mantle text-text">
      <Nav />
      <Hero />
      <Features />
    </div>
  );
}
