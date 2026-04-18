import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { StrKey } from "@stellar/stellar-sdk";

/**
 * cn - Utility for conditional class merging in Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * validateStellarAddress - Checks if a string is a valid Stellar public key (G-address).
 */
export function validateStellarAddress(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  try {
    return StrKey.isValidEd25519PublicKey(address) && address.startsWith("G");
  } catch {
    return false;
  }
}

/**
 * validatePaymentAmount - Validates that an amount is positive, numeric and <= balance.
 */
export function validatePaymentAmount(amount: string, balance: string): boolean {
  if (!amount || !balance) return false;
  
  const numAmount = parseFloat(amount);
  const numBalance = parseFloat(balance);
  
  if (isNaN(numAmount) || isNaN(numBalance)) return false;
  if (numAmount <= 0) return false;
  if (numAmount > numBalance) return false;
  
  return true;
}

/**
 * formatBalance - Formats a balance string into "X.XX XLM".
 */
export function formatBalance(balance: string | null | undefined): string {
  if (balance === null || balance === undefined || balance === "" || isNaN(parseFloat(balance))) {
    return "0.00 XLM";
  }
  
  const num = parseFloat(balance);
  return `${num.toFixed(2)} XLM`;
}

/**
 * setCachedBalance - Stores a balance in localStorage with a 30s TTL.
 */
export function setCachedBalance(address: string, balance: string): void {
  if (typeof window === "undefined") return;
  
  const data = JSON.stringify({
    value: balance,
    timestamp: Date.now()
  });
  
  localStorage.setItem(`stellar_balance_${address}`, data);
}

/**
 * getCachedBalance - Retrieves balance if it's < 30s old.
 */
export function getCachedBalance(address: string): string | null {
  if (typeof window === "undefined") return null;
  
  const raw = localStorage.getItem(`stellar_balance_${address}`);
  if (!raw) return null;
  
  try {
    const { value, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;
    
    // 30 seconds TTL (as per test requirements)
    if (age < 30000) {
      return value;
    }
  } catch {
    return null;
  }
  
  return null;
}
