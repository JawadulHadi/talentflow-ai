import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { seedJobDescription } from "@/lib/ats/seed";
import { THEMES, type EmailTemplate, type ThemeName } from "@/lib/ats/types";
import { cn } from "@/lib/utils";
import { emailFor } from "@/stores/ats-store";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brand & voice — TalentFlow AI" },
      {
        name: "description",
        content:
          "How TalentFlow AI sounds and looks to candidates: the email templates it sends, the job posts it publishes, the scorecard it exports, and the tokens behind them.",
      },
      { property: "og:title", content: "Brand & voice — TalentFlow AI" },
    ],
  }),
  component: BrandPage,
});

const themeLabels: Record<ThemeName, string> = {
  "frosted-slate": "Frosted slate",
  "frosted-ember": "Frosted ember",
  "paper-light": "Paper light",
  "signal-emerald": "Signal emerald",
};

/** The candidate the sample emails are addressed to. */
const sample = { name: "Amara Okafor", role: "Senior Product Designer" };

const emailMeta: Record<EmailTemplate, { label: string; when: string }> = {
  confirm: { label: "Application received", when: "Sent automatically on apply" },
  reminder: { label: "Interview reminder", when: "Sent before a scheduled interview" },
  feedback: { label: "Application update", when: "Sent when a candidate is screened" },
  offer: { label: "Offer", when: "Sent on entering Offer Sent" },
  rejection: { label: "Rejection", when: "Sent when a recruiter rejects with a reason" },
};

const EMAIL_ORDER: EmailTemplate[] = ["confirm", "reminder", "feedback", "offer", "rejection"];

/** Logo palette — fixed brand colors, independent of the active UI theme. */
const brandColors = [
  { name: "Ink", value: "#070A10", note: "Logo background" },
  { name: "Violet", value: "#A855F7", note: "AI core" },
  { name: "Cyan", value: "#06B6D4", note: "Pipeline source" },
  { name: "Emerald", value: "#10B981", note: "Hired" },
];

/** Semantic UI tokens. Each chip reads its live value from the active theme. */
const uiTokens = [
  { token: "--background", label: "Background", usage: "Page surface" },
  { token: "--foreground", label: "Foreground", usage: "Primary text" },
  { token: "--card", label: "Card", usage: "Glass panels" },
  { token: "--primary", label: "Primary", usage: "Actions, active nav" },
  { token: "--secondary", label: "Secondary", usage: "Chips, hovers" },
  { token: "--accent", label: "Accent", usage: "Warnings, highlights" },
  { token: "--muted-foreground", label: "Muted", usage: "Secondary text" },
  { token: "--destructive", label: "Destructive", usage: "Removal, errors" },
  { token: "--border", label: "Border", usage: "Hairlines" },
] as const;

function BrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Identity & voice</p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Brand system</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          TalentFlow talks to candidates more often than to recruiters. This page documents that
          voice — the emails the app actually sends, the job post it publishes, the scorecard it
          exports — plus the tokens behind every screen.
        </p>
      </div>

      <Section
        eyebrow="01 — Voice"
        title="Direct, specific, human"
        description="We describe what happened and what happens next. No hype, no adjectives doing the work of facts."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Say what happened",
              body: "“After careful review we will not be moving forward this time.” State the decision before the consolation.",
            },
            {
              title: "Give the next step",
              body: "Every message ends with a date, an action, or an open door. Candidates should never wonder what to do next.",
            },
            {
              title: "Drop the hype",
              body: "“Revolutionary AI-powered synergy” says nothing. “The agent proposed three stage moves” says everything.",
            },
          ].map((v) => (
            <div key={v.title} className="glass p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{v.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <RuleList
            title="Do"
            tone="do"
            items={[
              "Address the candidate by first name and name the role they applied for.",
              "Keep a rejection to two sentences: the decision, then the wish.",
              "Match the tone of the template to the stage — warmer at offer, plainest at rejection.",
            ]}
          />
          <RuleList
            title="Don't"
            tone="dont"
            items={[
              "Never promise a timeline the team cannot hold.",
              "Don't explain a rejection with a score or a ranking.",
              "Don't use the candidate's data beyond the reason the recruiter recorded.",
            ]}
          />
        </div>
      </Section>

      <Section
        eyebrow="02 — Candidate email"
        title="The five messages the app sends"
        description="Imported from emailFor() in the store, so this is the exact copy a candidate receives — not a mockup. Copy any of them into a template."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {EMAIL_ORDER.map((template) => {
            const meta = emailMeta[template];
            const { subject, body } = emailFor(template, sample);
            return (
              <article key={template} className="glass flex flex-col p-5">
                <header className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {meta.when}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground"
                    aria-label={`Copy the ${meta.label.toLowerCase()} email`}
                    onClick={() => void copyText(`${subject}\n\n${body}`, meta.label)}
                  >
                    <Copy className="size-4" />
                  </Button>
                </header>
                <div className="mt-4 rounded-lg border border-border/60 bg-background/40 p-4">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    Subject
                  </p>
                  <p className="text-sm font-medium text-foreground">{subject}</p>
                  <div className="my-3 h-px bg-border/60" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
                <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                  template: {template}
                </p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="03 — Job post"
        title="How a role is presented"
        description="Title, meta line, overview, then responsibilities. The seed description doubles as the reference example."
      >
        <article className="glass overflow-hidden">
          <div className="border-b border-border/60 p-5">
            <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {seedJobDescription.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{seedJobDescription.meta}</p>
          </div>
          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Overview
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {seedJobDescription.overview}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Responsibilities
              </p>
              <ul className="mt-2 space-y-1.5">
                {seedJobDescription.responsibilities.slice(0, 3).map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </Section>

      <Section
        eyebrow="04 — Documents"
        title="Scorecard export"
        description="Every PDF export opens with the same ink header, so a downloaded scorecard is recognisable before it is opened."
      >
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="glass overflow-hidden p-0">
            <div className="bg-[#161E2E] px-6 py-5">
              <p className="text-lg font-bold text-white">Candidate scorecard</p>
              <p className="mt-1 text-[13px] text-white/80">
                {sample.name} — {sample.role}
              </p>
              <p className="mt-3 text-[10px] text-white/60">TalentFlow AI — 7 Nov 2026</p>
            </div>
            <div className="space-y-2 p-6">
              <p className="text-sm font-semibold text-[#283C6E]">Weighted outcome</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The score and verdict stay deterministic; Claude only writes the narrative summary
                below them.
              </p>
            </div>
          </div>
          <div className="glass p-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Spec</p>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Header fill", "#161E2E, full bleed, 34 mm"],
                ["Title", "Helvetica bold 18 pt, white"],
                ["Subtitle", "Helvetica 10 pt, white"],
                ["Footer line", "8 pt, white at 60%"],
                ["Section head", "Helvetica bold 12 pt, #283C6E"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-mono text-[11px] text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="05 — Logo"
        title="The mark and the wordmark"
        description="A hiring pipeline: a cyan candidate enters, passes through the violet AI core, and leaves hired in emerald."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <LogoCard label="Mark" hint="App icon, favicon, avatars">
            <img
              src="/repo-logo.svg"
              alt="TalentFlow AI mark"
              width={96}
              height={96}
              className="size-24 rounded-2xl"
            />
          </LogoCard>

          <LogoCard label="Wordmark" hint="Header, documents, signatures">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              TalentFlow<span className="text-primary">.ai</span>
            </span>
          </LogoCard>

          <LogoCard label="Full lockup" hint="Cover pages, decks, banners">
            <div className="flex items-center gap-3">
              <img
                src="/repo-logo.svg"
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-xl"
              />
              <div className="text-left">
                <span className="block font-display text-xl font-bold leading-tight tracking-tight text-foreground">
                  TalentFlow<span className="text-primary">.ai</span>
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  ATS & Job Board Hub
                </span>
              </div>
            </div>
          </LogoCard>
        </div>
      </Section>

      <Section
        eyebrow="06 — Color"
        title="Brand palette and interface tokens"
        description="Four fixed colors tell the product story. Everything in the interface reads from a semantic token instead."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {brandColors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => void copyText(c.value, c.name)}
              className="group glass overflow-hidden p-0 text-left transition-transform hover:-translate-y-0.5"
            >
              <div className="h-20 w-full" style={{ backgroundColor: c.value }} />
              <div className="flex items-start justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {c.note}
                  </p>
                </div>
                <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  {c.value}
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uiTokens.map((t) => (
            <button
              key={t.token}
              type="button"
              onClick={(e) => {
                const el = e.currentTarget.querySelector<HTMLElement>("[data-chip]");
                if (el) void copyText(getComputedStyle(el).backgroundColor, t.label);
              }}
              className="glass flex items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/40"
            >
              <span
                data-chip
                className="size-10 shrink-0 rounded-lg border border-border"
                style={{ backgroundColor: `var(${t.token})` }}
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{t.label}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {t.token}
                </span>
              </span>
              <span className="ml-auto hidden text-[11px] text-muted-foreground sm:block">
                {t.usage}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="07 — Type"
        title="Fraunces for voice, Manrope for work"
        description="Fraunces carries headlines and numbers with editorial weight. Manrope keeps dense tables and forms legible at 12–14 px."
      >
        <div className="glass space-y-6 p-6">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Fraunces · display
            </p>
            <p className="font-display text-4xl font-bold leading-tight tracking-tight text-foreground">
              Hire on evidence, not instinct.
            </p>
          </div>
          <div className="border-t border-border/60 pt-6">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Manrope · UI
            </p>
            <p className="text-base text-foreground">
              The agent reads the pipeline, proposes stage moves, and waits for a recruiter to
              approve each one. Nothing ships without a human decision.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Body copy sits at 14 px with 1.6 line height. Labels run 12 px, uppercase, and 0.2em
              tracked.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="08 — Themes"
        title="Four token sets, one system"
        description="Themes only swap values; structure, spacing, and type never change. Frosted slate is the default."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((theme) => (
            <div key={theme} data-theme={theme} className="glass overflow-hidden">
              <div className="bg-background p-4">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary" />
                  <span className="size-6 rounded-md bg-accent" />
                  <span className="size-6 rounded-md border border-border bg-card" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  TalentFlow<span className="text-primary">.ai</span>
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {theme === "frosted-slate" ? "Default theme" : "Token set"}
                </p>
              </div>
              <div className="border-t border-border px-4 py-3">
                <p className="text-xs font-medium text-foreground">{themeLabels[theme]}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{theme}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="glass flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Changing the brand?</p>
            <p className="text-xs text-muted-foreground">
              Email copy lives in <span className="font-mono">emailFor()</span>; colors live in{" "}
              <span className="font-mono">styles.css</span>. Update those and this page follows.
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" className="gap-2">
          <a
            href="https://github.com/JawadulHadi/talentflow-ai/issues/new"
            target="_blank"
            rel="noreferrer"
          >
            Open an issue
          </a>
        </Button>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function LogoCard({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="glass flex flex-col p-5">
      <div className="flex flex-1 items-center justify-center rounded-lg bg-background/60 py-8">
        {children}
      </div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function RuleList({ title, tone, items }: { title: string; tone: "do" | "dont"; items: string[] }) {
  const Icon = tone === "do" ? Check : X;
  return (
    <div className="glass p-5">
      <p
        className={cn(
          "mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em]",
          tone === "do" ? "text-primary" : "text-destructive",
        )}
      >
        <Icon className="size-4" /> {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <span
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                tone === "do" ? "bg-primary" : "bg-destructive",
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Copied ${label}`);
  } catch {
    toast.error("Could not copy to the clipboard.");
  }
}
