import type { ReactNode } from "react";
import { fontStack, initialsOf, onBrandColor, type BrandConfig } from "@/lib/ats/brand";
import type { JobDescription } from "@/lib/ats/types";
import { emailFor } from "@/stores/ats-store";

const INK = "#0F172A";
const BODY = "#475569";
const MUTED = "#94A3B8";
const HAIRLINE = "#E2E8F0";

const candidate = { name: "Amara Okafor", role: "Senior Product Designer" };

function LogoBadge({ brand, size, radius }: { brand: BrandConfig; size: number; radius: number }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={`${brand.companyName} logo`}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center font-bold"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: brand.primary,
        color: onBrandColor(brand.primary),
        fontSize: Math.round(size * 0.36),
        letterSpacing: "-0.02em",
      }}
    >
      {initialsOf(brand.companyName)}
    </span>
  );
}

function CompanyLockup({ brand, light }: { brand: BrandConfig; light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoBadge brand={brand} size={44} radius={12} />
      <div className="min-w-0">
        <p
          className="truncate text-[17px] font-bold leading-tight"
          style={{
            fontFamily: fontStack(brand.headingFont),
            color: light ? "#FFFFFF" : INK,
          }}
        >
          {brand.companyName}
        </p>
        <p
          className="truncate text-[12px]"
          style={{ color: light ? "rgba(255,255,255,0.72)" : BODY }}
        >
          {brand.tagline}
        </p>
      </div>
    </div>
  );
}

/** A job post as it appears on a job board after publishing. */
export function JobPostPreview({ brand, jd }: { brand: BrandConfig; jd: JobDescription }) {
  return (
    <article style={{ background: "#FFFFFF", color: INK }}>
      <div style={{ height: 5, background: brand.primary }} aria-hidden />
      <header className="flex items-center justify-between gap-4 px-6 pb-5 pt-5">
        <CompanyLockup brand={brand} />
        <span
          className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: `${brand.accent}22`, color: brand.primary }}
        >
          Actively hiring
        </span>
      </header>

      <div className="px-6">
        <h3
          className="text-[24px] font-bold leading-tight"
          style={{ fontFamily: fontStack(brand.headingFont), color: INK }}
        >
          {jd.title}
        </h3>
        <p className="mt-1 text-[13px]" style={{ color: BODY }}>
          {jd.meta}
        </p>

        <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: BODY }}>
          {jd.overview}
        </p>

        <p
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: brand.primary }}
        >
          What you will do
        </p>
        <ul className="mt-2 space-y-1.5">
          {jd.responsibilities.slice(0, 3).map((item) => (
            <li
              key={item}
              className="flex gap-2 text-[13px] leading-relaxed"
              style={{ color: BODY }}
            >
              <span
                className="mt-[7px] size-1.5 shrink-0 rounded-full"
                style={{ background: brand.accent }}
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        <div
          className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5"
          style={{ borderColor: HAIRLINE }}
        >
          <span
            className="inline-flex items-center rounded-lg px-4 py-2 text-[13px] font-semibold"
            style={{ background: brand.primary, color: onBrandColor(brand.primary) }}
          >
            Apply now
          </span>
          <span className="text-[12px]" style={{ color: MUTED }}>
            {brand.website.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>

      <footer
        className="mt-5 flex items-center justify-between gap-3 px-6 py-4 text-[11px]"
        style={{ borderTop: `1px solid ${HAIRLINE}`, color: MUTED }}
      >
        <span>{brand.companyName}</span>
        {brand.attribution && <span>via TalentFlow AI</span>}
      </footer>
    </article>
  );
}

/** The application-received email, with the signature candidates actually see. */
export function EmailPreview({ brand }: { brand: BrandConfig }) {
  const { subject, body } = emailFor("confirm", candidate);
  const signature = brand.emailSignature.trim();
  const text = signature ? `${body}\n\n${signature}` : body;

  return (
    <article style={{ background: "#F1F5F9", color: INK }}>
      <header className="flex items-center gap-3 px-6 py-4" style={{ background: brand.primary }}>
        {brand.logoInEmail ? (
          <>
            <LogoBadge brand={brand} size={32} radius={9} />
            <span
              className="text-[14px] font-semibold"
              style={{ color: onBrandColor(brand.primary) }}
            >
              {brand.companyName}
            </span>
          </>
        ) : (
          <span
            className="text-[15px] font-semibold"
            style={{
              color: onBrandColor(brand.primary),
              fontFamily: fontStack(brand.headingFont),
            }}
          >
            {brand.companyName}
          </span>
        )}
      </header>

      <div className="px-6 py-5" style={{ background: "#FFFFFF" }}>
        <p className="text-[11px]" style={{ color: MUTED }}>
          {brand.companyName} · {brand.replyTo}
        </p>
        <p
          className="mt-2 text-[15px] font-semibold"
          style={{ fontFamily: fontStack(brand.headingFont), color: INK }}
        >
          {subject}
        </p>
        <p
          className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed"
          style={{ color: BODY }}
        >
          {text}
        </p>
        <div className="mt-4" style={{ borderTop: `1px solid ${HAIRLINE}` }} />
        <p className="mt-3 text-[12px]" style={{ color: MUTED }}>
          You are receiving this because you applied to {brand.companyName}. Reply to this email to
          reach the hiring team.
        </p>
      </div>

      <footer className="px-6 py-3 text-[11px]" style={{ color: MUTED }}>
        {brand.companyName} · {brand.website.replace(/^https?:\/\//, "")}
      </footer>
    </article>
  );
}

/** The branded header every exported PDF opens with. */
export function ScorecardPreview({ brand }: { brand: BrandConfig }) {
  const headingStyle = {
    fontFamily: fontStack(brand.headingFont),
    color: brand.primary,
  } as const;

  return (
    <article style={{ background: "#FFFFFF", color: INK }}>
      <header className="px-6 py-5" style={{ background: brand.primary }}>
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: onBrandColor(brand.primary), opacity: 0.8 }}
          >
            {brand.companyName}
          </p>
          <span
            className="text-[10px]"
            style={{ color: onBrandColor(brand.primary), opacity: 0.7 }}
          >
            07/11/2026
          </span>
        </div>
        <p
          className="mt-2 text-[19px] font-bold leading-tight"
          style={{ fontFamily: fontStack(brand.headingFont), color: onBrandColor(brand.primary) }}
        >
          Candidate scorecard — {candidate.name}
        </p>
        <p
          className="mt-1 text-[12px]"
          style={{ color: onBrandColor(brand.primary), opacity: 0.85 }}
        >
          {candidate.role}
        </p>
      </header>

      <div className="space-y-4 px-6 py-5">
        <div>
          <p className="text-[13px] font-bold" style={headingStyle}>
            Recommendation: Strong hire — 92/100
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: BODY }}>
            Evidence across discovery, craft and systems thinking. Two probes on analytics depth
            were answered with concrete examples.
          </p>
        </div>
        <div>
          <p className="text-[13px] font-bold" style={headingStyle}>
            Key strengths
          </p>
          <ul className="mt-1 space-y-1">
            {["Structured storytelling", "Systems thinking", "Fast synthesis of feedback"].map(
              (s) => (
                <li key={s} className="flex gap-2 text-[12.5px]" style={{ color: BODY }}>
                  <span aria-hidden>•</span>
                  {s}
                </li>
              ),
            )}
          </ul>
        </div>
        <p className="border-t pt-3 text-[10.5px]" style={{ borderColor: HAIRLINE, color: MUTED }}>
          {brand.companyName} · 07/11/2026 · Generated by TalentFlow AI
        </p>
      </div>
    </article>
  );
}

/** Light canvas that frames a preview at desktop or phone width. */
export function PreviewCanvas({
  device,
  children,
}: {
  device: "desktop" | "mobile";
  children: ReactNode;
}) {
  return (
    <div
      className="mx-auto w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10 transition-[max-width] duration-300"
      style={{ maxWidth: device === "mobile" ? 380 : undefined }}
    >
      {children}
    </div>
  );
}
