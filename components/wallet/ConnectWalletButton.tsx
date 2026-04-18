"use client";

import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink, Loader2, ChevronDown } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { formatPublicKey } from "../../lib/freighter";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export function ConnectWalletButton() {
  const { 
    isConnected, 
    publicKey, 
    network, 
    balances, 
    isLoading, 
    error, 
    freighterInstalled, 
    connect, 
    disconnect, 
    clearError 
  } = useWallet();
  const { showToast } = useToast();

  const xlmBalance = balances.find(b => b.asset === "XLM")?.balance || "0.00";

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      showToast("Public key copied to clipboard", "success");
    }
  };

  // State 1: Loading
  if (isLoading) {
    return (
      <button 
        disabled 
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg border border-primary/20 animate-pulse"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-medium">Connecting...</span>
      </button>
    );
  }

  // State 2: Not Installed
  if (!freighterInstalled) {
    return (
      <a 
        href="https://freighter.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-secondary font-bold rounded-lg hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95"
      >
        <ExternalLink className="w-4 h-4" />
        <span>Install Freighter</span>
      </a>
    );
  }

  // State 3: Disconnected
  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button 
          onClick={connect}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-secondary font-bold rounded-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all active:scale-95 glow-amber"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </button>
        {error && (
          <span className="text-[10px] text-error font-mono animate-bounce">{error}</span>
        )}
      </div>
    );
  }

  // State 4: Connected (Dropdown)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 px-4 py-2 bg-secondary/80 backdrop-blur-md border border-primary/30 rounded-lg hover:border-primary/60 transition-all group overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-2 z-10">
            <div className="relative">
              <div className="w-2 h-2 bg-success rounded-full" />
              <div className="absolute inset-0 bg-success rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-primary font-mono text-sm font-semibold">
              {formatPublicKey(publicKey!)}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors z-10" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content 
          align="end" 
          sideOffset={8}
          className="z-50 min-w-[240px] bg-secondary border border-primary/20 rounded-xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Info */}
          <div className="px-3 py-2 border-b border-primary/10 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Public Key</span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-bold border border-primary/20 uppercase">
                {network}
              </span>
            </div>
            <p className="text-slate-100 font-mono text-xs break-all leading-relaxed bg-slate-900/50 p-2 rounded border border-white/5">
              {publicKey}
            </p>
          </div>

          {/* Balance Item */}
          <div className="px-3 py-2 flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors cursor-default mb-1">
            <span className="text-slate-400 text-sm">XLM Balance</span>
            <span className="text-primary font-bold">{xlmBalance} XLM</span>
          </div>

          <DropdownMenu.Separator className="h-px bg-primary/10 my-1" />

          {/* Actions */}
          <DropdownMenu.Item 
            onClick={handleCopy}
            className="flex items-center gap-3 px-3 py-2 text-slate-300 text-sm hover:text-primary hover:bg-primary/5 rounded-lg transition-all focus:outline-none cursor-pointer group"
          >
            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Copy Address</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item 
            onClick={disconnect}
            className="flex items-center gap-3 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-all focus:outline-none cursor-pointer group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Disconnect</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
