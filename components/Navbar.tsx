"use client";

import WalletButton from "./WalletButton";
import NetworkStatus from "./NetworkStatus";
import Link from "next/link";

interface NavbarProps {
  address: string | null;
  onConnect: (address: string) => void;
}

export default function Navbar({ address, onConnect }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto glass-panel px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-white/10">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="w-3 h-3 bg-accent-cyan rounded-full pulse-dot" />
            <div className="absolute inset-0 bg-accent-cyan rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg sm:text-xl font-bold font-sans tracking-tight text-white group-hover:text-accent-cyan transition-colors">
            Stellar<span className="text-accent-cyan">Vault</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <div className="hidden sm:block">
            <NetworkStatus />
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm font-mono text-gray-400">
            <Link href="/demo" className="hover:text-accent-cyan transition-colors">Demo</Link>
            <Link href="#" className="hover:text-accent-cyan transition-colors">Docs</Link>
          </div>
          <WalletButton address={address} onConnect={onConnect} />
        </div>
      </div>
    </nav>
  );
}
