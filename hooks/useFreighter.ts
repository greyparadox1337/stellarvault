"use client";

import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress, getPublicKey } from "@stellar/freighter-api";

export function useFreighter() {
  const [address, setAddress] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDetection = useCallback(async () => {
    if (typeof window === "undefined") return false;
    try {
      const detected = await isConnected();
      if (detected) {
        setIsDetected(true);
        return true;
      }
    } catch (e) {
      console.warn("Legacy detection failed:", e);
    }
    return false;
  }, []);

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
      // Step 1: Legacy Handshake (v2.0.0 Style)
      // This version triggers the popup immediately upon calling getAddress or getPublicKey
      let publicKey = "";
      try {
        publicKey = await getPublicKey();
      } catch (e) {
        // Fallback to getAddress if pk fails
        const addrObj = await getAddress();
        publicKey = typeof addrObj === 'string' ? addrObj : addrObj.address;
      }

      if (publicKey) {
        setAddress(publicKey);
        return publicKey;
      } else {
        setError("Freighter returned no address. Ensure an account is active in the extension.");
        return null;
      }
    } catch (err: any) {
      console.error("Legacy connection error:", err);
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
