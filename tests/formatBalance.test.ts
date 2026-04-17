import { describe, it, expect } from "vitest";
import { formatBalance } from "../lib/utils";

describe("formatBalance", () => {
  it('formats "100.1234567" → "100.12 XLM"', () => {
    expect(formatBalance("100.1234567")).toBe("100.12 XLM");
  });

  it('formats "0.5" → "0.50 XLM"', () => {
    expect(formatBalance("0.5")).toBe("0.50 XLM");
  });

  it('formats whole numbers like "250" → "250.00 XLM"', () => {
    expect(formatBalance("250")).toBe("250.00 XLM");
  });

  it('handles undefined gracefully → "0.00 XLM"', () => {
    expect(formatBalance(undefined)).toBe("0.00 XLM");
  });

  it('handles null gracefully → "0.00 XLM"', () => {
    expect(formatBalance(null)).toBe("0.00 XLM");
  });

  it('handles empty string → "0.00 XLM"', () => {
    expect(formatBalance("")).toBe("0.00 XLM");
  });

  it('handles "0" → "0.00 XLM"', () => {
    expect(formatBalance("0")).toBe("0.00 XLM");
  });
});
