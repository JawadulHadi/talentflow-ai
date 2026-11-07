import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSignature,
  FileText,
  ListChecks,
  Monitor,
  Package,
  PenLine,
  Smartphone,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { JobPostPreview, PreviewCanvas } from "@/components/brand-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, timeAgo } from "@/lib/ats/analytics";
import { exportInterviewGuide, exportJobDescription, exportPackage } from "@/lib/ats/pdf";
import { buildRecommendation } from "@/lib/ats/scoring";
import type { JobDescription } from "@/lib/ats/types";
import { cn } from "@/lib/utils";
import { useAtsStore } from "@/stores/ats-store";
import { useBrandStore } from "@/stores/brand-store";

export const Route = createFileRoute("/deliverables")({
  head: () => ({
    meta: [
      { title: "Hiring plan - TalentFlow AI" },
      {
        name: "description",
        content:
          "The hiring plan for a requisition: job description, interview plan and scorecards, with branded PDF exports.",
      },
      { property: "og:title", content: "Hiring plan - TalentFlow AI" },
      {
        property: "og:description",
        content: "Job description, interview plan and scorecards for an open requisition.",
      },
    ],
  }),
  component: HiringPlanPage,
});

const lines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

type DocKey = "jd" | "guide";
type Tone = "ok" | "muted";

function HiringPlanPage() {
  const jd = useAtsStore((s) => s.jd);
  const updateJd = useAtsStore((s) => s.updateJd);
  const questions = useAtsStore((s) => s.questions);
  const candidates = useAtsStore((s) => s.candidates);
  const jobs = useAtsStore((s) => s.jobs);
  const teamMembers = useAtsStore((s) => s.teamMembers);
  const cid = useAtsStore((s) => s.scorecardCandidateId);
  const ratings = useAtsStore((s) => s.ratings);
  const brand = useBrandStore((s) => s.config);

  const [tab, setTab] = useState<DocKey>("jd");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const pdfBrand = { company: brand.companyName, color: brand.primary };
  const set = (patch: Partial<JobDescription>) => updateJd({ ...jd, ...patch });

  const job = useMemo(
    () =>
      jobs.find((j) => jd.title.startsWith(j.title) || j.title.startsWith(jd.title)) ??
      jobs[0] ??
      null,
    [jobs, jd.title],
  );

  const pipeline = useMemo(
    () => candidates.filter((c) => c.jobId === job?.id),
    [candidates, job?.id],
  );

  const hiringManager = teamMembers.find(
    (m) => m.role === "Hiring Manager" && m.status === "Active",
  );
  const scored = pipeline.filter((c) => Object.keys(ratings[c.id] ?? {}).length > 0).length;
  const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);

  const jdReady = Boolean(
    jd.title.trim() &&
    jd.meta.trim() &&
    jd.overview.trim() &&
    jd.responsibilities.length &&
    jd.requirements.length &&
    jd.whyJoinUs.trim(),
  );
  const guideReady = questions.length > 0 && questions.every((q) => q.lookFor.trim() !== "");
  const scorecardsReady = pipeline.length > 0 && scored === pipeline.length;
  const readyDocs = [jdReady, guideReady, scorecardsReady].filter(Boolean).length;

  const downloadPackage = () => {
    const c = pipeline.find((x) => x.id === cid) ?? pipeline[0] ?? candidates[0];
    if (!c) return;
    const r = ratings[c.id] ?? {};
    exportPackage(jd, questions, c, r, buildRecommendation(c.name, questions, r), pdfBrand);
    toast.success(`Hiring plan for ${c.name} downloaded`);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Hiring plan</p>
            <h1 className="text-3xl tracking-tight text-foreground text-balance sm:text-4xl">
              {job?.title ?? jd.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                {job?.status ?? "Draft"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileSignature className="size-3.5" aria-hidden />
                {job?.department ?? "Unassigned"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden />
                {job?.location ?? "Location TBD"}
              </span>
              <span>{job?.salary ?? "Salary TBD"}</span>
              {job && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Posted {timeAgo(job.postedDate)}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hiring manager{" "}
              <span className="font-medium text-foreground">
                {hiringManager?.name ?? "Unassigned"}
              </span>
              {" · "}
              {pipeline.length} candidate{pipeline.length === 1 ? "" : "s"} in the pipeline
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/scorecard">
                <ClipboardCheck className="size-4" /> Open scorecards
              </Link>
            </Button>
            <Button onClick={downloadPackage} className="gap-2">
              <Package className="size-4" /> Download hiring pack
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<FileText className="size-4" />}
          label="Documents"
          value={`${readyDocs}/3 ready`}
          hint={readyDocs === 3 ? "Everything a panel needs" : "Finish the items flagged below"}
        />
        <Stat
          icon={<ListChecks className="size-4" />}
          label="Interview plan"
          value={`${questions.length} questions`}
          hint={
            questions.length
              ? `${new Set(questions.map((q) => q.competency)).size} competencies, weighted rubric`
              : "No questions yet"
          }
        />
        <Stat
          icon={<ClipboardCheck className="size-4" />}
          label="Scorecards"
          value={`${scored}/${pipeline.length || 0} completed`}
          hint={scored ? "Debrief is ready to schedule" : "No scores recorded yet"}
          progress={pipeline.length ? scored / pipeline.length : 0}
        />
        <Stat
          icon={<PenLine className="size-4" />}
          label="Branding"
          value={brand.companyName}
          hint="Applied to the post, emails and PDFs"
          swatch={brand.primary}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <DocCard
          icon={<FileText className="size-5" />}
          title="Job description"
          description="The candidate-facing post that goes out to job boards."
          meta={`Updated ${job ? formatDate(job.postedDate) : "—"} · ${jd.responsibilities.length} responsibilities`}
          status={job?.status === "Active" ? "Published" : "Draft"}
          tone={job?.status === "Active" ? "ok" : "muted"}
          onOpen={() => setTab("jd")}
          onDownload={() => exportJobDescription(jd, pdfBrand)}
        />
        <DocCard
          icon={<ListChecks className="size-5" />}
          title="Interview plan"
          description="Weighted STAR questions with what to listen for and follow-ups."
          meta={`${questions.length} questions · ${new Set(questions.map((q) => q.competency)).size} competencies`}
          status={guideReady ? "Ready" : "Incomplete"}
          tone={guideReady ? "ok" : "muted"}
          onOpen={() => setTab("guide")}
          onDownload={() => exportInterviewGuide(jd, questions, pdfBrand)}
        />
        <DocCard
          icon={<ClipboardCheck className="size-5" />}
          title="Scorecards"
          description="A shared rubric so every interviewer scores the same evidence."
          meta={`${questions.length} rated criteria · ${scored} of ${pipeline.length || 0} candidates scored`}
          status={scorecardsReady ? "Complete" : "In progress"}
          tone={scorecardsReady ? "ok" : "muted"}
          linkTo="/scorecard"
        />
      </section>

      <section className="space-y-4">
        <div
          role="tablist"
          aria-label="Hiring plan documents"
          className="flex flex-wrap items-center gap-1 rounded-lg border border-border/70 bg-background/40 p-1"
        >
          <TabButton
            active={tab === "jd"}
            onClick={() => setTab("jd")}
            icon={<FileText className="size-3.5" />}
          >
            Job description
          </TabButton>
          <TabButton
            active={tab === "guide"}
            onClick={() => setTab("guide")}
            icon={<ListChecks className="size-3.5" />}
          >
            Interview plan
          </TabButton>
          <span className="ml-auto hidden items-center gap-1.5 px-2 text-[11px] text-muted-foreground sm:flex">
            <CheckCircle2 className="size-3.5" aria-hidden />
            Edits save automatically
          </span>
        </div>

        {tab === "jd" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="glass space-y-4 p-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    Post basics
                  </p>
                  <p className="text-xs text-muted-foreground">
                    How the role is listed on job boards and your careers page.
                  </p>
                </div>
                <Field label="Title" htmlFor="jd-title">
                  <Input
                    id="jd-title"
                    value={jd.title}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                </Field>
                <Field label="Location and pay" htmlFor="jd-meta">
                  <Input
                    id="jd-meta"
                    value={jd.meta}
                    onChange={(e) => set({ meta: e.target.value })}
                  />
                </Field>
              </div>

              <div className="glass space-y-4 p-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    Narrative
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The pitch, in the candidate's words.
                  </p>
                </div>
                <Field label="Overview" htmlFor="jd-overview">
                  <Textarea
                    id="jd-overview"
                    rows={4}
                    value={jd.overview}
                    onChange={(e) => set({ overview: e.target.value })}
                  />
                </Field>
                <Field label="Why join us" htmlFor="jd-why">
                  <Textarea
                    id="jd-why"
                    rows={3}
                    value={jd.whyJoinUs}
                    onChange={(e) => set({ whyJoinUs: e.target.value })}
                  />
                </Field>
              </div>

              <div className="glass space-y-4 p-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    Requirements
                  </p>
                  <p className="text-xs text-muted-foreground">
                    One item per line; each becomes a bullet.
                  </p>
                </div>
                <Field label="Responsibilities" htmlFor="jd-resp">
                  <Textarea
                    id="jd-resp"
                    rows={5}
                    value={jd.responsibilities.join("\n")}
                    onChange={(e) => set({ responsibilities: lines(e.target.value) })}
                  />
                </Field>
                <Field label="What you bring" htmlFor="jd-req">
                  <Textarea
                    id="jd-req"
                    rows={5}
                    value={jd.requirements.join("\n")}
                    onChange={(e) => set({ requirements: lines(e.target.value) })}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Candidate view · branded by {brand.companyName}
                </p>
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <DeviceButton
                    active={device === "desktop"}
                    label="Desktop preview"
                    onClick={() => setDevice("desktop")}
                  >
                    <Monitor className="size-4" />
                  </DeviceButton>
                  <DeviceButton
                    active={device === "mobile"}
                    label="Phone preview"
                    onClick={() => setDevice("mobile")}
                  >
                    <Smartphone className="size-4" />
                  </DeviceButton>
                </div>
              </div>
              <PreviewCanvas device={device}>
                <JobPostPreview brand={brand} jd={jd} />
              </PreviewCanvas>
              <div className="glass flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="text-xs text-muted-foreground">
                  Logo, colours and fonts come from{" "}
                  <Link to="/brand" className="font-medium text-primary hover:underline">
                    Branding
                  </Link>
                  .
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportJobDescription(jd, pdfBrand)}
                >
                  <Download className="size-4" /> Export PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <h2 className="text-lg text-foreground">STAR interview plan</h2>
                <p className="text-xs text-muted-foreground">
                  {questions.length} behavioural questions ·{" "}
                  {new Set(questions.map((q) => q.competency)).size} competencies · weights total{" "}
                  {totalWeight.toFixed(1)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportInterviewGuide(jd, questions, pdfBrand)}
              >
                <Download className="size-4" /> Export PDF
              </Button>
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {questions.map((q, i) => {
                const share = totalWeight ? Math.round((q.weight / totalWeight) * 100) : 0;
                return (
                  <article key={q.id} className="glass space-y-2 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/15 font-mono text-[11px] font-semibold text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                          {q.competency}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        weight {q.weight.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-snug text-foreground">{q.question}</p>
                    <div className="grid gap-2 pt-1 text-xs sm:grid-cols-2">
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Look for:</span> {q.lookFor}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Follow up:</span>{" "}
                        {q.followUp}
                      </p>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-secondary" aria-hidden>
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  progress,
  swatch,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  progress?: number;
  swatch?: string;
}) {
  return (
    <div className="glass space-y-2 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span
          className="grid size-7 place-items-center rounded-md bg-secondary text-foreground"
          aria-hidden
        >
          {icon}
        </span>
        {label}
      </div>
      <p className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
        {swatch && (
          <span
            className="size-3 shrink-0 rounded-full ring-1 ring-black/10"
            style={{ background: swatch }}
            aria-hidden
          />
        )}
        <span className="truncate">{value}</span>
      </p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
      {progress !== undefined && (
        <div className="h-1 overflow-hidden rounded-full bg-secondary" aria-hidden>
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function DocCard({
  icon,
  title,
  description,
  meta,
  status,
  tone,
  onOpen,
  onDownload,
  linkTo,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  meta: string;
  status: string;
  tone: Tone;
  onOpen?: () => void;
  onDownload?: () => void;
  linkTo?: "/scorecard";
}) {
  return (
    <article className="glass flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"
          aria-hidden
        >
          {icon}
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            tone === "ok"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-secondary/60 text-muted-foreground",
          )}
        >
          {status}
        </span>
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <p className="text-[11px] text-muted-foreground">{meta}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {linkTo ? (
          <Button size="sm" variant="outline" asChild>
            <Link to={linkTo}>
              Open <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={onOpen}>
              Open <ArrowRight className="size-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDownload}>
              <Download className="size-3.5" /> PDF
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function DeviceButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-7 place-items-center rounded-full transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
