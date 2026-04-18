"use client";

import React from "react";
import { useWallet } from "../../hooks/useWallet";
import { formatPublicKey } from "../../lib/freighter";
import { cn } from "../../lib/utils";
import { Globe, Shield, Wallet } from "lucide-react";

export function WalletStatus() {
  const { isConnected, publicKey, network, balances, isLoading, error } = useWallet();

  const xlmBalance = balances.find(b => b.asset === "XLM")?.balance || "0.00";

  return (
    <div className={cn(
      "flex items-center gap-6 px-4 py-2 rounded-full border transition-all duration-500",
      isConnected 
        ? "bg-success/5 border-success/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
        : isLoading 
          ? "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
          : "bg-slate-900/40 border-slate-800"
    )}>
      {/* Network Indicator */}
      <div className="flex items-center gap-2">
        <Globe className={cn(
          "w-4 h-4 transition-colors",
          isConnected ? "text-success" : isLoading ? "text-primary animate-pulse" : "text-slate-500"
        )} />
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          isConnected ? "text-success/90" : "text-slate-400"
        )}>
          {network || (isLoading ? "Connecting" : "Offline")}
        </span>
      </div>

      <div className="w-px h-4 bg-slate-800" />

      {/* Account Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Shield className={cn(
            "w-3.5 h-3.5",
            isConnected ? "text-primary" : "text-slate-500"
          )} />
          <span className="text-xs font-mono text-slate-300">
            {isConnected ? formatPublicKey(publicKey!) : "No Vault Linked"}
          </span>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
            <Wallet className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary">
              {xlmBalance} XLM
            </span>
          </div>
        )}
      </div>

      {/* Core Status Glow */}
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "w-2 h-2 rounded-full transition-all duration-500",
          isConnected ? "bg-success" : isLoading ? "bg-primary animate-pulse" : error ? "bg-error" : "bg-slate-700"
        )} />
        {(isConnected || isLoading) && (
          <div className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-50",
            isConnected ? "bg-success" : "bg-primary"
          )} />
        )}
      </div>
    </div>
  );
}
