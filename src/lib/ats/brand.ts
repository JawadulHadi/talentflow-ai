export const HEADING_FONTS = ["fraunces", "manrope"] as const;
export type HeadingFont = (typeof HEADING_FONTS)[number];

export const BODY_FONTS = ["manrope", "fraunces"] as const;
export type BodyFont = (typeof BODY_FONTS)[number];

/**
 * Employer branding for everything a candidate sees: job posts, candidate
 * emails and the exported PDFs. This is *not* the TalentFlow design system.
 */
export interface BrandConfig {
  companyName: string;
  tagline: string;
  website: string;
  /** PNG/JPEG data URL, downscaled to 256 px on upload. `null` means initials. */
  logo: string | null;
  primary: string;
  accent: string;
  headingFont: HeadingFont;
  bodyFont: BodyFont;
  /** Appended to every generated candidate email. */
  emailSignature: string;
  replyTo: string;
  logoInEmail: boolean;
  /** "via TalentFlow AI" line under job posts. */
  attribution: boolean;
}

export const DEFAULT_BRAND: BrandConfig = {
  companyName: "TalentFlow AI",
  tagline: "Hire on evidence, not instinct.",
  website: "https://talntflow-ai.vercel.app",
  logo: null,
  primary: "#7C3AED",
  accent: "#06B6D4",
  headingFont: "fraunces",
  bodyFont: "manrope",
  emailSignature: "Maya Chen\nHead of Talent\nmaya@talentflow.ai",
  replyTo: "talent@talentflow.ai",
  logoInEmail: true,
  attribution: true,
};

export const BRAND_PRESETS: { name: string; primary: string; accent: string }[] = [
  { name: "Violet & cyan", primary: "#7C3AED", accent: "#06B6D4" },
  { name: "Cobalt & sky", primary: "#1D4ED8", accent: "#38BDF8" },
  { name: "Forest & mint", primary: "#047857", accent: "#34D399" },
  { name: "Ember & gold", primary: "#C2410C", accent: "#F59E0B" },
  { name: "Plum & rose", primary: "#9D174D", accent: "#FB7185" },
];

/** Merge persisted data over the defaults so new fields never come back undefined. */
export function migrateBrand(persisted: unknown, version: number): BrandConfig {
  const p = (persisted ?? {}) as Partial<BrandConfig>;
  void version;
  return { ...DEFAULT_BRAND, ...p };
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

/** Tolerant hex → RGB. Unknown input falls back to the product ink. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = hex.trim().replace(/^#/, "");
  if (v.length !== 6 || /[^0-9a-f]/i.test(v)) return { r: 22, g: 30, b: 46 };
  return {
    r: Number.parseInt(v.slice(0, 2), 16),
    g: Number.parseInt(v.slice(2, 4), 16),
    b: Number.parseInt(v.slice(4, 6), 16),
  };
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Black or white text, whichever is readable on the given background. */
export function onBrandColor(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? "#0B0F19" : "#FFFFFF";
}

/** "Acme Corp" → "AC", "TalentFlow AI" → "TA". */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0) return "??";
  const first = words[0]![0] ?? "";
  const last = words.length > 1 ? (words.at(-1)![0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function fontStack(font: HeadingFont | BodyFont): string {
  return font === "fraunces"
    ? '"Fraunces", Georgia, "Times New Roman", serif'
    : '"Manrope", ui-sans-serif, system-ui, sans-serif';
}

const MAX_LOGO_PX = 256;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

/**
 * Read an uploaded logo, downscale it to at most 256 px and return a PNG data
 * URL. Logos are persisted in localStorage, so this keeps them small.
 */
export async function logoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Pick a PNG, JPEG or SVG image.");
  if (file.size > MAX_LOGO_BYTES) throw new Error("That image is over 5 MB. Try a smaller file.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_LOGO_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("This browser cannot process images.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/png");
}
