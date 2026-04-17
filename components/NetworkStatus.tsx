"use client";

import { useState, useEffect } from "react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch("https://horizon-testnet.stellar.org/", {
          method: "HEAD",
          cache: "no-store",
        });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    };

    ping();
    const interval = setInterval(ping, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider">
      <div
        className={`w-2 h-2 rounded-full transition-colors ${
          isOnline === null
            ? "bg-gray-500 animate-pulse"
            : isOnline
            ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
            : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        }`}
      />
      <span className={isOnline === null ? "text-gray-500" : isOnline ? "text-green-400" : "text-red-400"}>
        {isOnline === null ? "Checking..." : isOnline ? "Testnet Live" : "Offline"}
      </span>
    </div>
  );
}
