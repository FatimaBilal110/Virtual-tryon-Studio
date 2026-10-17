import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { SITE } from "@/lib/site";

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export const LegalPage = ({ title, children }: LegalPageProps) => (
  <Layout title={title}>
    <article className="container max-w-3xl pb-8 pt-8 md:pt-12">
      <div className="glass-strong rounded-3xl p-7 md:p-12">
        <h1 className="text-5xl leading-[1.05] md:text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated {SITE.legalUpdated}</p>
        <div className="mt-10 space-y-10">{children}</div>
      </div>
    </article>
  </Layout>
);

interface LegalSectionProps {
  heading: string;
  children: ReactNode;
}

export const LegalSection = ({ heading, children }: LegalSectionProps) => (
  <section className="space-y-3 text-base leading-relaxed text-foreground/90">
    <h2 className="text-3xl text-foreground">{heading}</h2>
    {children}
  </section>
);

export const LegalList = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc space-y-2 pl-6 marker:text-muted-foreground">{children}</ul>
);

export const ContactLine = () =>
  SITE.contactEmail ? (
    <p>
      Email{" "}
      <a href={`mailto:${SITE.contactEmail}`} className="text-clay underline">
        {SITE.contactEmail}
      </a>
      .
    </p>
  ) : null;
