import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to mock localStorage since Node doesn't provide it natively
// and jsdom's support can be flaky in some vitest versions.
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

import { setCachedBalance, getCachedBalance } from "../lib/utils";

describe("cacheBalance", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const ADDR = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";

  it("stores balance in localStorage with a timestamp", () => {
    setCachedBalance(ADDR, "1000.50");

    const raw = localStorage.getItem(`stellar_balance_${ADDR}`);
    expect(raw).not.toBeNull();

    const parsed = JSON.parse(raw!);
    expect(parsed.value).toBe("1000.50");
    expect(typeof parsed.timestamp).toBe("number");
  });

  it("returns cached value if < 30 seconds old", () => {
    setCachedBalance(ADDR, "500.00");
    const result = getCachedBalance(ADDR);
    expect(result).toBe("500.00");
  });

  it("returns null if cache is expired (> 30 seconds)", () => {
    // Manually write an expired cache entry (31 seconds ago)
    localStorage.setItem(
      `stellar_balance_${ADDR}`,
      JSON.stringify({ value: "999.99", timestamp: Date.now() - 31000 })
    );

    const result = getCachedBalance(ADDR);
    expect(result).toBeNull();
  });

  it("returns null if no cache exists for address", () => {
    const result = getCachedBalance("GUNKNOWNADDRESSXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    expect(result).toBeNull();
  });
});
