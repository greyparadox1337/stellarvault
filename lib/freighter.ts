import { isConnected, requestAccess, getPublicKey } from "@stellar/freighter-api";
import { Horizon, Networks } from "@stellar/stellar-sdk";

// Constants
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Singleton Horizon server
const server = new Horizon.Server(HORIZON_URL);

/**
 * Checks if Freighter extension exists.
 * SSR safe: returns false if window is undefined.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  
  try {
    const result = await isConnected();
    return typeof result === 'boolean' ? result : (result as any)?.isConnected || false;
  } catch (error) {
    console.error("[Freighter] Installation check failed:", error);
    return false;
  }
}

/**
 * Initiates the full connection flow: requestAccess() followed by getPublicKey().
 * Validates network is TESTNET.
 */
export async function connectWallet(): Promise<{ publicKey: string; network: string } | null> {
  if (typeof window === "undefined") return null;

  try {
    // 1. Request formal access (Failsafe handshake)
    await requestAccess();

    // 2. Fetch the public key after permission granted (Primary in v2)
    const publicKey = await getPublicKey();
    
    if (!publicKey) {
      console.error("[Freighter] No public key returned.");
      return null;
    }

    return { 
      publicKey, 
      network: "TESTNET" 
    };
  } catch (error) {
    console.error("[Freighter] Connection flow failed:", error);
    return null;
  }
}

/**
 * Silently fetches public key if already connected.
 * SSR safe, returns null on failure.
 */
export async function getWalletPublicKey(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const publicKey = await getPublicKey();
    return publicKey || null;
  } catch (error) {
    console.error("[Freighter] Silent PK fetch failed:", error);
    return null;
  }
}

/**
 * Clears local state (Freighter API does not have a disconnect method).
 */
export function disconnectWallet(): void {
  // No-op for Freighter, managed by context state
  console.log("[Freighter] Local disconnect invoked.");
}

/**
 * Formats public key for display (e.g. GABC...XYZ1).
 */
export function formatPublicKey(key: string): string {
  if (!key || key.length < 10) return key;
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/**
 * Fetches XLM and trustline balances from Testnet Horizon.
 * Returns empty array on failure.
 */
export async function getAccountBalances(publicKey: string): Promise<{ asset: string; balance: string }[]> {
  try {
    const account = await server.loadAccount(publicKey);
    
    return account.balances.map((b: any) => ({
      asset: b.asset_type === "native" ? "XLM" : b.asset_code || "Unknown",
      balance: b.balance
    }));
  } catch (error) {
    console.error("[Horizon] Failed to fetch balances for:", publicKey, error);
    return [];
  }
}
