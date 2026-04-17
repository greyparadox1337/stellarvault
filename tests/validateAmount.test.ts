import { describe, it, expect } from "vitest";
import { validatePaymentAmount } from "../lib/utils";

describe("validatePaymentAmount", () => {
  it("returns true when amount > 0 and <= balance", () => {
    expect(validatePaymentAmount("10", "100")).toBe(true);
    expect(validatePaymentAmount("100", "100")).toBe(true);
    expect(validatePaymentAmount("0.001", "50")).toBe(true);
  });

  it("returns false when amount is 0", () => {
    expect(validatePaymentAmount("0", "100")).toBe(false);
  });

  it("returns false when amount is negative", () => {
    expect(validatePaymentAmount("-5", "100")).toBe(false);
  });

  it("returns false when amount exceeds balance", () => {
    expect(validatePaymentAmount("150", "100")).toBe(false);
    expect(validatePaymentAmount("100.01", "100")).toBe(false);
  });

  it("returns false for non-numeric input", () => {
    expect(validatePaymentAmount("abc", "100")).toBe(false);
    expect(validatePaymentAmount("10", "abc")).toBe(false);
  });
});
