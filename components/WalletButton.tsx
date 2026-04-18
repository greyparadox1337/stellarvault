"use client";

import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress } from "@stellar/freighter-api";
import { Wallet, Loader2, RefreshCw } from "lucide-react";
import { fetchBalance } from "@/lib/stellar";
import { useToast } from "@/context/ToastContext";

interface WalletButtonProps {
  onConnect: (address: string) => void;
  address: string | null;
}

const CACHE_TTL = 30000; // 30 seconds

export default function WalletButton({ onConnect, address }: WalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    const freshBalance = await fetchBalance(addr);
    setBalance(freshBalance);
    localStorage.setItem(
      `stellar_balance_${addr}`,
      JSON.stringify({ value: freshBalance, timestamp: Date.now() })
    );
    setIsRefreshing(false);
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
    setIsConnecting(true);
    try {
      const result = await isConnected();
      if (result && result.isConnected) {
        const addrResult = await getAddress();
        if (addrResult && typeof addrResult === 'object' && 'address' in addrResult) {
          if (addrResult.address) {
            onConnect(addrResult.address);
            showToast("Wallet connected successfully", "success");
          } else if (addrResult.error) {
            showToast(`Connection failed: ${addrResult.error}`, "error");
          }
        } else if (typeof addrResult === 'string') {
          onConnect(addrResult);
          showToast("Wallet connected successfully", "success");
        }
      } else {
        showToast("Freighter wallet not detected or locked. Please ensure it's installed and unlocked.", "error");
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      showToast(err.message || "Failed to connect wallet", "error");
    } finally {
      setIsConnecting(false);
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
