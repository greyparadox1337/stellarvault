"use client";

import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";

export function useFreighter() {
  const [address, setAddress] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDetection = useCallback(async () => {
    if (typeof window === "undefined") return false;
    
    try {
      // Named export check from v2+
      const result = await isConnected();
      const detected = typeof result === 'boolean' ? result : result?.isConnected;
      
      if (detected) {
        setIsDetected(true);
        return true;
      }
      
      // Raw window fallback check (SSR Guarded)
      const win = window as any;
      if (win.stellar || win.freighter) {
        setIsDetected(true);
        return true;
      }
    } catch (e) {
      console.warn("Detection check failed:", e);
    }
    return false;
  }, []);

  // Polling for detection on mount
  useEffect(() => {
    let count = 0;
    const interval = setInterval(async () => {
      const found = await checkDetection();
      if (found || count++ > 20) {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [checkDetection]);

  const connect = async () => {
    if (typeof window === "undefined") return null;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // 1. Connection Check
      const connected = await isConnected();
      const win = window as any;
      const provider = win.stellar || win.freighter;

      // 2. Request Access Handshake (The "Failsafe" point)
      // We explicitly solicit permission before reading the address
      if (provider) {
        if (provider.requestAccess) {
          await provider.requestAccess();
        } else if (provider.setAllowed) {
          await provider.setAllowed();
        }
      }

      // 3. Address Retrieval
      let addrResult = await getAddress();
      console.log("Failsafe Handshake result:", addrResult);

      // 4. Fallback to getPublicKey if address is empty (Checklist Point #1)
      if (!addrResult || (typeof addrResult === 'object' && !addrResult.address)) {
        if (provider && provider.getPublicKey) {
          try {
            const pk = await provider.getPublicKey();
            if (pk) addrResult = { address: pk };
          } catch (e) {
            console.warn("getPublicKey fallback failed", e);
          }
        }
      }

      let finalAddress = "";
      if (typeof addrResult === 'string') {
        finalAddress = addrResult;
      } else if (addrResult && typeof addrResult === 'object') {
        finalAddress = addrResult.address || "";
        if (addrResult.error) {
          setError(`Freighter Error: ${addrResult.error}`);
          return null;
        }
      }

      if (finalAddress) {
        // 5. Update state after connection is confirmed (Checklist Point #5)
        setAddress(finalAddress);
        return finalAddress;
      } else {
        setError("Freighter returned no address. Please ensure an account is selected and the extension is unlocked.");
        return null;
      }
    } catch (err: any) {
      console.error("Failsafe connection error:", err);
      setError(err.message || "Failed to connect wallet");
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    address,
    isDetected,
    isConnecting,
    error,
    connect,
    refresh: checkDetection
  };
}
