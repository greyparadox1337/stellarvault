import { StrKey } from "@stellar/stellar-sdk";

/**
 * Validates a Stellar public key (Ed25519).
 * Must start with 'G' and be exactly 56 characters.
 */
export const validateStellarAddress = (address: string): boolean => {
  if (!address || typeof address !== "string") return false;
  return StrKey.isValidEd25519PublicKey(address);
};

/**
 * Validates a payment amount against a balance.
 * Amount must be > 0 and <= balance.
 */
export const validatePaymentAmount = (amount: string, balance: string): boolean => {
  const parsed = parseFloat(amount);
  const bal = parseFloat(balance);
  if (isNaN(parsed) || isNaN(bal)) return false;
  return parsed > 0 && parsed <= bal;
};

/**
 * Formats a raw balance string into a display string.
 * e.g. "100.1234567" → "100.12 XLM"
 * Handles null/undefined gracefully → "0.00 XLM"
 */
export const formatBalance = (balance: string | null | undefined): string => {
  if (!balance || balance === "0") {
    return "0.00 XLM";
  }
  const num = parseFloat(balance);
  if (isNaN(num)) return "0.00 XLM";
  return `${num.toFixed(2)} XLM`;
};

const CACHE_PREFIX = "stellar_balance_";
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Stores a balance value in localStorage with a timestamp.
 */
export const setCachedBalance = (address: string, balance: string): void => {
  localStorage.setItem(
    `${CACHE_PREFIX}${address}`,
    JSON.stringify({ value: balance, timestamp: Date.now() })
  );
};

/**
 * Retrieves a cached balance from localStorage.
 * Returns the balance string if the cache is < 30s old, otherwise null.
 */
export const getCachedBalance = (address: string): string | null => {
  const raw = localStorage.getItem(`${CACHE_PREFIX}${address}`);
  if (!raw) return null;

  try {
    const { value, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return value;
    }
  } catch {
    // Corrupted cache entry
  }
  return null;
};
