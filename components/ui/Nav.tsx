import Link from "next/link";
import { AuthButton } from "../auth-button";

const Nav = () => {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <Link className="font-semibold" href={"/"}>
          Holding of Bags
        </Link>
        <AuthButton />
      </div>
    </nav>
  );
};

export default Nav;
