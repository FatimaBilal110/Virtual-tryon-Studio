import { useEffect, type ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/site";

interface LayoutProps {
  /** Page title. The site name is appended. Omit on the home page. */
  title?: string;
  children: ReactNode;
}

/** Static warm backdrop: soft light, plus two peach spheres. Decorative only. */
const Backdrop = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: [
          "radial-gradient(60% 50% at 6% 0%, hsl(38 80% 95% / 0.95), transparent 70%)",
          "radial-gradient(45% 40% at 100% 18%, hsl(24 55% 76% / 0.5), transparent 70%)",
          "radial-gradient(60% 45% at 85% 100%, hsl(28 45% 70% / 0.5), transparent 70%)",
        ].join(","),
      }}
    />
    <div
      className="absolute right-[7%] top-[22%] h-20 w-20 rounded-full md:h-28 md:w-28"
      style={{ background: "radial-gradient(circle at 32% 30%, hsl(28 70% 88%), hsl(24 50% 68%) 72%)" }}
    />
    <div
      className="absolute -bottom-40 -left-32 h-[22rem] w-[22rem] rounded-full opacity-70 md:h-[30rem] md:w-[30rem]"
      style={{ background: "radial-gradient(circle at 32% 30%, hsl(30 65% 86%), hsl(25 45% 66%) 75%)" }}
    />
  </div>
);

export const Layout = ({ title, children }: LayoutProps) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : SITE.name;
  }, [title]);

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <Backdrop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

interface PageIntroProps {
  title: string;
  children: ReactNode;
  /** Optional content shown under the text, inside the same panel. */
  aside?: ReactNode;
}

export const PageIntro = ({ title, children, aside }: PageIntroProps) => (
  <div className="container pb-10 pt-8 md:pb-12 md:pt-12">
    <div className="glass-strong rounded-3xl p-7 md:p-12">
      <h1 className="max-w-3xl text-5xl leading-[1.02] md:text-7xl">{title}</h1>
      <div className="mt-6 max-w-2xl space-y-3 text-base leading-relaxed text-muted-foreground md:text-lg">{children}</div>
      {aside && <div className="mt-8 border-t border-bronze/30 pt-6">{aside}</div>}
    </div>
  </div>
);
