import { describe, it, expect } from "vitest";
import { validateStellarAddress } from "../lib/utils";

describe("validateStellarAddress", () => {
  it("returns true for a valid Stellar public key (G..., 56 chars)", () => {
    const validKey = "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";
    expect(validKey).toHaveLength(56);
    expect(validKey.startsWith("G")).toBe(true);
    expect(validateStellarAddress(validKey)).toBe(true);
  });

  it("returns true for another valid public key", () => {
    const validKey = "GCGQ64QSVELE6BZW2QRSA5MZCE7IY7CSMIPSZBYWFF3YRCTKSPALUKNM";
    expect(validateStellarAddress(validKey)).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(validateStellarAddress("")).toBe(false);
  });

  it("returns false for a random string", () => {
    expect(validateStellarAddress("not-a-stellar-address")).toBe(false);
  });

  it("returns false for a key that starts with G but has wrong checksum", () => {
    // 56 chars starting with G, but invalid checksum
    expect(validateStellarAddress("G" + "A".repeat(55))).toBe(false);
  });

  it("returns false for a Stellar secret key (starts with S)", () => {
    expect(validateStellarAddress("SCZANGBA5YHTNYVVV3C7CAZMCLEF6WUJUPJKUIF2OOKRGY2JQ6BSQZLN")).toBe(false);
  });
});
