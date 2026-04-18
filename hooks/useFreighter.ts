"use client";

import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";

export function useFreighter() {
  const [address, setAddress] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDetection = useCallback(async () => {
    try {
      const result = await isConnected();
      const detected = typeof result === 'boolean' ? result : result?.isConnected;
      if (detected) {
        setIsDetected(true);
        return true;
      }
    } catch (e) {
      // Manual fallback check
      const win = window as any;
      if (win.stellar || win.freighter) {
        setIsDetected(true);
        return true;
      }
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
    setIsConnecting(true);
    setError(null);
    
    try {
      // Step 1: Request address directly (Simple Wishpool Handshake)
      // This automatically triggers the extension's internal authorization
      const addrResult = await getAddress();
      console.log("Wishpool Handshake result:", addrResult);

      // Final Debug Alert for production linking
      if (!addrResult || (typeof addrResult === 'object' && !addrResult.address)) {
        window.alert("Freighter Handshake Debug: Detected wallet but no address was returned. Raw result: " + JSON.stringify(addrResult));
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
        setAddress(finalAddress);
        return finalAddress;
      } else {
        setError("Freighter returned no address. Please make sure your wallet is unlocked and you've selected an account.");
        return null;
      }
    } catch (err: any) {
      console.error("Simple connection error:", err);
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
