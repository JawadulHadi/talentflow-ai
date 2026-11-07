import { createFileRoute } from "@tanstack/react-router";
import { Check, Monitor, Paintbrush, RotateCcw, Smartphone, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  EmailPreview,
  JobPostPreview,
  PreviewCanvas,
  ScorecardPreview,
} from "@/components/brand-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BRAND_PRESETS,
  DEFAULT_BRAND,
  fontStack,
  initialsOf,
  isHexColor,
  logoDataUrl,
  type BrandConfig,
  type BodyFont,
  type HeadingFont,
} from "@/lib/ats/brand";
import { cn } from "@/lib/utils";
import { useAtsStore } from "@/stores/ats-store";
import { useBrandStore } from "@/stores/brand-store";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Branding - TalentFlow AI" },
      {
        name: "description",
        content:
          "Set the employer brand candidates see: logo, colours, fonts, email signature and the header on exported PDFs.",
      },
      { property: "og:title", content: "Branding - TalentFlow AI" },
    ],
  }),
  component: BrandingPage,
});

const headingFonts: { value: HeadingFont; label: string }[] = [
  { value: "fraunces", label: "Fraunces - editorial serif" },
  { value: "manrope", label: "Manrope - geometric sans" },
];

const bodyFonts: { value: BodyFont; label: string }[] = [
  { value: "manrope", label: "Manrope - UI sans" },
  { value: "fraunces", label: "Fraunces - serif" },
];

type Surface = "post" | "email" | "scorecard";

function BrandingPage() {
  const saved = useBrandStore((s) => s.config);
  const replace = useBrandStore((s) => s.replace);
  const reset = useBrandStore((s) => s.reset);
  const jd = useAtsStore((s) => s.jd);

  const [draft, setDraft] = useState<BrandConfig>(saved);
  const [surface, setSurface] = useState<Surface>("post");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const set = (patch: Partial<BrandConfig>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    replace(draft);
    toast.success("Branding saved. The next emails and PDFs you send will use it.");
  };

  const discard = () => setDraft(saved);

  const resetAll = () => {
    reset();
    setDraft(DEFAULT_BRAND);
    toast.success("Branding reset to the demo defaults.");
  };

  const onLogoPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      set({ logo: await logoDataUrl(file) });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read that image.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Candidate experience</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Branding</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Your company, not ours. These settings are what a candidate sees on the job posts you
            publish, in every email TalentFlow sends on your behalf, and on the PDFs you export.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          <Button variant="ghost" onClick={discard} disabled={!dirty}>
            Discard
          </Button>
          <Button onClick={save} disabled={!dirty} className="gap-2">
            <Check className="size-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel step="01" title="Company" hint="Shown on job posts, emails and PDFs.">
            <Field label="Company name" htmlFor="brand-name">
              <Input
                id="brand-name"
                value={draft.companyName}
                onChange={(e) => set({ companyName: e.target.value })}
                placeholder="Acme Corp"
              />
            </Field>
            <Field label="Tagline" htmlFor="brand-tagline">
              <Input
                id="brand-tagline"
                value={draft.tagline}
                onChange={(e) => set({ tagline: e.target.value })}
                placeholder="One line on why people join"
              />
            </Field>
            <Field label="Website" htmlFor="brand-site">
              <Input
                id="brand-site"
                value={draft.website}
                onChange={(e) => set({ website: e.target.value })}
                placeholder="https://acme.com"
              />
            </Field>
          </Panel>

          <Panel step="02" title="Logo" hint="Used unless you prefer an initials block.">
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-background/60">
                {draft.logo ? (
                  <img src={draft.logo} alt="Logo preview" className="size-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold tracking-tight text-muted-foreground">
                    {initialsOf(draft.companyName)}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    {draft.logo ? "Replace" : "Upload"}
                  </Button>
                  {draft.logo && (
                    <Button size="sm" variant="ghost" onClick={() => set({ logo: null })}>
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPEG or SVG, up to 5 MB. Stored at 256 px.
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void onLogoPicked(e)}
            />
          </Panel>

          <Panel step="03" title="Colour" hint="Buttons, links, email header, PDF banner.">
            <div className="flex flex-wrap gap-2">
              {BRAND_PRESETS.map((preset) => {
                const active =
                  preset.primary.toLowerCase() === draft.primary.toLowerCase() &&
                  preset.accent.toLowerCase() === draft.accent.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => set({ primary: preset.primary, accent: preset.accent })}
                    aria-label={preset.name}
                    aria-pressed={active}
                    title={preset.name}
                    className={cn(
                      "flex items-center gap-1 rounded-full border p-1 pr-2.5 transition-all",
                      active ? "border-primary" : "border-border hover:border-primary/50",
                    )}
                  >
                    <span
                      className="size-5 rounded-full"
                      style={{ background: preset.primary }}
                      aria-hidden
                    />
                    <span
                      className="size-5 rounded-full"
                      style={{ background: preset.accent }}
                      aria-hidden
                    />
                    <span className="text-[11px] text-muted-foreground">{preset.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField
                label="Primary"
                value={draft.primary}
                onChange={(primary) => set({ primary })}
              />
              <ColorField
                label="Accent"
                value={draft.accent}
                onChange={(accent) => set({ accent })}
              />
            </div>
          </Panel>

          <Panel step="04" title="Type" hint="Only the two families the app already loads.">
            <Field label="Headings" htmlFor="brand-heading-font">
              <Select
                value={draft.headingFont}
                onValueChange={(v) => set({ headingFont: v as HeadingFont })}
              >
                <SelectTrigger id="brand-heading-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {headingFonts.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Body" htmlFor="brand-body-font">
              <Select
                value={draft.bodyFont}
                onValueChange={(v) => set({ bodyFont: v as BodyFont })}
              >
                <SelectTrigger id="brand-body-font">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bodyFonts.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <p
              className="text-lg text-foreground"
              style={{ fontFamily: fontStack(draft.headingFont) }}
              aria-hidden
            >
              {draft.companyName}
            </p>
          </Panel>

          <Panel step="05" title="Candidate email" hint="Appended to every automated message.">
            <Field label="Signature" htmlFor="brand-signature">
              <Textarea
                id="brand-signature"
                rows={4}
                value={draft.emailSignature}
                onChange={(e) => set({ emailSignature: e.target.value })}
                placeholder={"Maya Chen\nHead of Talent\nmaya@acme.com"}
              />
            </Field>
            <Field label="Reply-to address" htmlFor="brand-reply-to">
              <Input
                id="brand-reply-to"
                value={draft.replyTo}
                onChange={(e) => set({ replyTo: e.target.value })}
                placeholder="talent@acme.com"
              />
            </Field>
            <ToggleRow
              id="brand-email-logo"
              label="Show the logo in the email header"
              checked={draft.logoInEmail}
              onChange={(logoInEmail) => set({ logoInEmail })}
            />
          </Panel>

          <Panel step="06" title="Attribution" hint="Shown under published job posts.">
            <ToggleRow
              id="brand-attribution"
              label='"via TalentFlow AI" on job posts'
              checked={draft.attribution}
              onChange={(attribution) => set({ attribution })}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                Reset colours, fonts and copy back to the demo defaults.
              </p>
              <Button variant="outline" size="sm" className="gap-2" onClick={resetAll}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </Panel>
        </div>

        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Tabs value={surface} onValueChange={(v) => setSurface(v as Surface)}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value="post">Job post</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
              </TabsList>
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

            <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Candidate view - live
            </p>

            <TabsContent value="post" className="mt-2">
              <PreviewCanvas device={device}>
                <JobPostPreview brand={draft} jd={jd} />
              </PreviewCanvas>
            </TabsContent>
            <TabsContent value="email" className="mt-2">
              <PreviewCanvas device={device}>
                <EmailPreview brand={draft} />
              </PreviewCanvas>
            </TabsContent>
            <TabsContent value="scorecard" className="mt-2">
              <PreviewCanvas device={device}>
                <ScorecardPreview brand={draft} />
              </PreviewCanvas>
            </TabsContent>
          </Tabs>

          <div className="glass flex items-start gap-3 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
              <Paintbrush className="size-4" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Saving applies the signature to candidate emails from the pipeline and the company
              name and colour to every PDF exported from{" "}
              <span className="font-mono">Deliverables</span> and{" "}
              <span className="font-mono">Scorecard</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  step,
  title,
  hint,
  children,
}: {
  step: string;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="glass space-y-4 p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          {step}
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = `brand-color-${label.toLowerCase()}`;
  const valid = isHexColor(value);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <span className="relative size-9 shrink-0 overflow-hidden rounded-md border border-border">
          <input
            id={id}
            type="color"
            value={valid ? value : "#000000"}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -inset-2 size-[calc(100%+1rem)] cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
        <Input
          aria-label={`${label} hex value`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("font-mono text-xs", !valid && "border-destructive")}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm font-normal text-foreground">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
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
