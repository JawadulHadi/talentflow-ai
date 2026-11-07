import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND, hexToRgb, initialsOf, migrateBrand, onBrandColor } from "./brand";

describe("branding", () => {
  it("derives initials for one-word and multi-word names", () => {
    expect(initialsOf("TalentFlow AI")).toBe("TA");
    expect(initialsOf("Acme")).toBe("A");
    expect(initialsOf("  acme  corp  ")).toBe("AC");
    expect(initialsOf("   ")).toBe("??");
  });

  it("parses hex colours and falls back on junk", () => {
    expect(hexToRgb("#7C3AED")).toEqual({ r: 124, g: 58, b: 237 });
    expect(hexToRgb("06b6d4")).toEqual({ r: 6, g: 182, b: 212 });
    expect(hexToRgb("violet")).toEqual({ r: 22, g: 30, b: 46 });
  });

  it("picks readable text for both dark and light brand colours", () => {
    expect(onBrandColor("#7C3AED")).toBe("#FFFFFF");
    expect(onBrandColor("#FDE68A")).toBe("#0B0F19");
  });

  it("fills missing persisted fields from the defaults", () => {
    expect(migrateBrand(undefined, 0)).toEqual(DEFAULT_BRAND);
    expect(migrateBrand({ companyName: "Acme", primary: "#1D4ED8" }, 1)).toMatchObject({
      companyName: "Acme",
      primary: "#1D4ED8",
      accent: DEFAULT_BRAND.accent,
      replyTo: DEFAULT_BRAND.replyTo,
    });
  });
});
