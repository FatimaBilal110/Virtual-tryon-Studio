import { NavLink } from "react-router-dom";
import { Sparkles, Shirt, Palette, UserSquare2 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Try-On", icon: Shirt },
  { to: "/style", label: "Style AI", icon: Palette },
  { to: "/ghost", label: "Ghost Mannequin", icon: UserSquare2 },
];

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container max-w-6xl flex items-center justify-between h-14">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <div className="p-1.5 rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-gradient">VTO Studio</span>
        </NavLink>
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-smooth",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
