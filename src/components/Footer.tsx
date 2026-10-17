import { Link } from "react-router-dom";
import { SITE } from "@/lib/site";

export const Footer = () => {
  return (
    <footer className="glass mt-20 rounded-none border-x-0 border-b-0">
      <div className="container flex flex-col gap-3 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{SITE.name}, by Fatima Bilal</p>
        <nav aria-label="Legal" className="flex gap-5">
          <Link to="/privacy" className="hover:text-foreground">
            Privacy policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms and conditions
          </Link>
        </nav>
      </div>
    </footer>
  );
};
