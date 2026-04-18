"use client";

import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";

export function useFreighter() {
  const [address, setAddress] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDetection = useCallback(async () => {
    const win = window as any;
    const provider = win.stellar || win.freighter;
    
    if (provider) {
      setIsDetected(true);
      return true;
    }

    try {
      const result = await isConnected();
      const detected = typeof result === 'boolean' ? result : result?.isConnected;
      if (detected) {
        setIsDetected(true);
        return true;
      }
    } catch (e) {
      console.warn("Freighter detection error:", e);
    }
    
    return false;
  }, []);

  // Polling for detection on mount
  useEffect(() => {
    let count = 0;
    const interval = setInterval(async () => {
      const found = await checkDetection();
      if (found || count++ > 20) { // Poll for 10 seconds (20 * 500ms)
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [checkDetection]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const detected = await checkDetection();
      if (!detected) {
        setError("Freighter wallet not detected. Please install and unlock the extension.");
        setIsConnecting(false);
        return null;
      }

      console.log("Hook: Requesting authorization handshake...");
      const win = window as any;
      const provider = win.stellar || win.freighter;
      
      let addrResult: any;
      try {
        // Attempt to solicit explicit permission first
        if (provider.setAllowed) {
          await provider.setAllowed();
          // Give the extension a moment to process the authorization
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Now attempt to get the address
        addrResult = await provider.getAddress();
        console.log("Handshake raw result:", addrResult);
      } catch (e: any) {
        console.warn("Handshake attempt triggered exception, falling back:", e);
        addrResult = await getAddress();
      }

      // Handle the various return formats for modern Freighter
      let finalAddress = "";
      let errorReason = "";

      if (typeof addrResult === 'string') {
        finalAddress = addrResult;
      } else if (addrResult && typeof addrResult === 'object') {
        finalAddress = addrResult.address || "";
        errorReason = addrResult.error || "";
      }

      if (finalAddress) {
        setAddress(finalAddress);
        return finalAddress;
      } else {
        const msg = errorReason 
          ? `Freighter denied access: ${errorReason}` 
          : "Freighter returned no address. Please ensure the site is 'Allowed' in your extension settings.";
        setError(msg);
        return null;
      }
    } catch (err: any) {
      console.error("Hook connection error:", err);
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
