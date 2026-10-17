import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

const links = [
  { to: "/", label: "Try-on" },
  { to: "/style", label: "Color match" },
  { to: "/ghost", label: "Model shots" },
];

export const Navbar = () => {
  return (
    <header className="glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
      <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link to="/" className="flex items-center gap-3 no-underline" aria-label={`${SITE.name} home`}>
          {/* Keep your VTO Logo image */}
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          
          {/* Replace the long image with styled text */}
          <h1 
            className="font-display text-2xl font-bold tracking-tight hidden sm:block"
            style={{ color: '#432f11' }} // Apply your specific gold color
          >
            Virtual Try-On Studio
          </h1>
        </Link>
        
        <nav aria-label="Main" className="-mx-1 flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium no-underline transition-colors",
                  isActive
                    ? "bg-card/90 text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};