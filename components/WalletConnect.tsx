"use client";

import { useState, useEffect } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";
import GlassCard from "./GlassCard";

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (await isConnected()) {
        const { address: userAddress } = await getAddress();
        setAddress(userAddress);
        onConnect(userAddress);
      } else {
        setError("Please install Freighter extension");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <GlassCard className="p-6 max-w-md mx-auto" accent>
      <h2 className="text-2xl font-bold mb-4 text-glow-cyan font-sans">Initialize Vault</h2>
      {address ? (
        <div>
          <p className="text-gray-400 mb-2 text-sm">Active Vault Address:</p>
          <p className="font-mono text-accent-violet break-all bg-black/30 p-3 rounded border border-accent-violet/30">
            {address}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 mb-6">
            Connect your Freighter wallet to access the StellarVault and manage your assets securely.
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-violet text-navy font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Freighter"}
          </button>
          {error && <p className="mt-4 text-red-400 text-sm font-mono">{error}</p>}
        </div>
      )}
    </GlassCard>
  );
}
