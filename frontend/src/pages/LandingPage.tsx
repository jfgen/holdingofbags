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
