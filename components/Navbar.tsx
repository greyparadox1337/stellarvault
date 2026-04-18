"use client";

import React from "react";
import Link from "next/link";
import { ConnectWalletButton } from "./wallet/ConnectWalletButton";
import { WalletStatus } from "./wallet/WalletStatus";
import { Shield } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto glass-panel px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-primary/20 bg-slate-900/60 backdrop-blur-xl">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="w-4 h-4 bg-primary rounded-sm rotate-45 pulse-dot-amber" />
            <div className="absolute inset-0 bg-primary rounded-sm rotate-45 blur-md opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white group-hover:text-primary transition-colors flex items-center gap-1">
            Vault<span className="text-primary italic">Lock</span>
          </span>
        </Link>

        {/* Desktop Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Global Status Bar */}
          <div className="hidden md:block">
            <WalletStatus />
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-400 uppercase tracking-widest px-4 border-l border-white/5">
            <Link href="/demo" className="hover:text-primary transition-colors">Vaults</Link>
            <Link href="#" className="hover:text-primary transition-colors">Governance</Link>
          </div>

          {/* Core Connection Action */}
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
}
