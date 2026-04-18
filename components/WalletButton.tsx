"use client";

import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { Wallet, Loader2, RefreshCw } from "lucide-react";
import { fetchBalance } from "@/lib/stellar";
import { useToast } from "@/context/ToastContext";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  address: string | null;
}

const CACHE_TTL = 30000; // 30 seconds

export default function WalletButton({ onConnect, address }: WalletButtonProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isConnecting, error, connect } = useFreighter();
  const { showToast } = useToast();

  const getCachedBalance = (addr: string) => {
    const cached = localStorage.getItem(`stellar_balance_${addr}`);
    if (cached) {
      const { value, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return value;
      }
    }
    return null;
  };

  const updateBalance = useCallback(async (addr: string) => {
    setIsRefreshing(true);
    try {
      const freshBalance = await fetchBalance(addr);
      setBalance(freshBalance);
      localStorage.setItem(
        `stellar_balance_${addr}`,
        JSON.stringify({ value: freshBalance, timestamp: Date.now() })
      );
    } catch (e) {
      console.error("Failed to update balance:", e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      const cached = getCachedBalance(address);
      if (cached) {
        setBalance(cached);
      } else {
        updateBalance(address);
      }
    }
  }, [address, updateBalance]);

  const handleConnect = async () => {
    const connectedAddress = await connect();
    if (connectedAddress) {
      onConnect(connectedAddress);
      showToast("Wallet connected successfully", "success");
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover-glow-cyan font-mono text-sm
          ${address 
            ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan" 
            : "border-white/20 bg-white/5 text-white hover:bg-white/10"
          }
        `}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : address ? (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-accent-violet animate-pulse" : "bg-accent-cyan"}`} />
            <span className="font-bold">{balance || "0.00"} XLM</span>
            <span className="opacity-40">|</span>
            <span>{truncateAddress(address)}</span>
          </div>
        ) : (
          <>
            {error && (
            <div className="mt-4">
              <p className="text-red-400 text-sm font-mono">{error}</p>
              <button 
                onClick={handleConnect}
                className="mt-2 text-[10px] text-accent-cyan underline uppercase tracking-widest hover:text-white transition-colors"
              >
                Scan Again
              </button>
            </div>
          )}
            <Wallet className="w-4 h-4 text-accent-cyan" />
            Connect Wallet
          </>
        )}
      </button>

      {address && (
        <button 
          onClick={() => updateBalance(address)}
          disabled={isRefreshing}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-accent-cyan transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      )}
    </div>
  );
}
