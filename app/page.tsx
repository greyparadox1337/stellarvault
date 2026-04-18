"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import SendPayment from "@/components/SendPayment";
import Vault from "@/components/Vault";
import TransactionHistory from "@/components/TransactionHistory";
import { BalanceSkeleton, HistorySkeleton } from "@/components/Skeleton";
import { fundWithFriendbot } from "@/lib/stellar";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/hooks/useWallet";
import { ArrowUpRight, TrendingUp, Droplets, Loader2, ShieldCheck } from "lucide-react";

export default function Home() {
  const { 
    isConnected, 
    publicKey: address, 
    balances, 
    isLoading: isWalletLoading,
    refreshBalances 
  } = useWallet();
  
  const [isFunding, setIsFunding] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showToast } = useToast();

  const balance = balances.find(b => b.asset === "XLM")?.balance || null;

  useEffect(() => {
    if (address) {
      showToast("Vault Access Authorized", "success");
      const interval = setInterval(() => refreshBalances(), 30000);
      return () => clearInterval(interval);
    }
  }, [address, refreshBalances, showToast]);

  const handleFund = async () => {
    if (!address) return;
    setIsFunding(true);
    showToast("Requesting friendbot funds...", "pending");
    try {
      await fundWithFriendbot(address);
      showToast("10,000 XLM received!", "success");
      await refreshBalances();
      setRefreshKey((k) => k + 1);
    } catch {
      showToast("Funding failed. Rate limited?", "error");
    } finally {
      setIsFunding(false);
    }
  };

  const handlePaymentSuccess = () => {
    refreshBalances();
    setRefreshKey((k) => k + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen relative pt-20 sm:pt-24 pb-16 px-3 sm:px-4 flex flex-col items-center">
      <StarField />
      <Navbar />

      <div className="z-10 w-full max-w-6xl space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 sm:space-y-4 px-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <ShieldCheck className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol Secured</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-sans tracking-tighter leading-none">
            <span className="shimmer inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary/60">
              VaultLOCK
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 font-mono text-xs sm:text-sm md:text-base tracking-wide">
            Secure, lightning-fast transactions on the Stellar Testnet. 
            Connect your Freighter wallet to authorize vault access.
          </p>
        </motion.section>

        <AnimatePresence mode="wait">
          <motion.div
            key={address ? "connected" : "disconnected"}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
          >
            {/* Left Column: Balance & Wallet Status */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
              <AnimatePresence mode="wait">
                {!address ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GlassCard className="p-6 sm:p-8 text-center border-dashed border-white/10">
                      <p className="text-slate-500 font-mono text-xs sm:text-sm px-2 sm:px-4">
                        Authorize your wallet to view locked assets and transaction controls.
                      </p>
                    </GlassCard>
                  </motion.div>
                ) : isWalletLoading && !balance ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <BalanceSkeleton />
                  </motion.div>
                ) : (
                  <motion.div key="balance" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <GlassCard className="p-4 sm:p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-16 h-16 text-primary" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded bg-primary/10">
                            <ArrowUpRight className="w-4 h-4 text-primary" />
                          </div>
                          <h2 className="text-xs sm:text-sm font-bold font-mono text-primary uppercase tracking-widest">
                            Vault Balance
                          </h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tighter">
                                {balance || "0.00"}
                              </span>
                              <span className="text-primary font-mono font-bold text-sm sm:text-lg">XLM</span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/10 space-y-3">
                            <button
                              onClick={handleFund}
                              disabled={isFunding}
                              className="w-full py-2 rounded-lg bg-white/5 border border-primary/30 text-primary hover:bg-primary/10 transition-all font-mono text-xs flex items-center justify-center gap-2 hover-glow-amber disabled:opacity-50"
                            >
                              {isFunding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Friendbot Funds"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transactions History */}
              <motion.div variants={itemVariants} className="pt-4">
                <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                  <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  Live Vault Activity
                </h3>
                <AnimatePresence mode="wait">
                  {!address ? (
                    <HistorySkeleton />
                  ) : (
                    <TransactionHistory key={refreshKey} address={address} />
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Right Column: Send Payment & Vault */}
            <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">
              <AnimatePresence>
                {address && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Vault address={address} />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <SendPayment sourceAddress={address} onSuccess={handlePaymentSuccess} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="fixed bottom-4 text-white/5 text-[10px] font-mono tracking-widest uppercase pointer-events-none">
        VaultLock Node v1.0.0 • Protocol 22 Secured
      </footer>
    </main>
  );
}
