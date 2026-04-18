"use client";

import { useState, useEffect, useCallback } from "react";
import GlassCard from "./GlassCard";
import { Lock, Unlock, Loader2, ShieldCheck, History, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { invokeVault, fetchLockedBalance } from "@/lib/stellar";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";

interface VaultActivity {
  _id: string;
  type: "lock" | "unlock";
  amount: string;
  txHash: string;
  timestamp: string;
}

export default function Vault({ address }: { address: string }) {
  const [lockedBalance, setLockedBalance] = useState<string>("0.00");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<VaultActivity[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchLockedBalance(address);
      setLockedBalance(bal);
      
      setIsLoadingHistory(true);
      const res = await fetch(`/api/vault/activity?userAddress=${address}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error loading vault data:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (method: "deposit" | "withdraw") => {
    if (!amount || isNaN(parseFloat(amount))) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setIsProcessing(true);
    showToast(`${method === "deposit" ? "Locking" : "Unlocking"} XLM...`, "pending");

    try {
      const result = await invokeVault(address, method, amount);
      showToast(`${amount} XLM ${method === "deposit" ? "locked" : "unlocked"} successfully!`, "success");
      
      // Record to MongoDB
      await fetch("/api/vault/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: address,
          type: method === "deposit" ? "lock" : "unlock",
          amount: amount,
          txHash: result.hash,
        }),
      });

      setAmount("");
      loadData();
    } catch (error: any) {
      console.error("Vault action failed:", error);
      showToast(error.message || "Transaction failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ShieldCheck className="w-24 h-24 text-accent-violet" />
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded bg-accent-violet/10">
            <Lock className="w-4 h-4 text-accent-violet" />
          </div>
          <h2 className="text-sm font-bold font-mono text-accent-violet uppercase tracking-widest">
            Stellar Escrow Vault
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Balance & Stats */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-400 mb-1 text-xs font-mono">Total Locked Assets</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                  {lockedBalance}
                </span>
                <span className="text-accent-violet font-mono font-bold text-lg">XLM</span>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white font-mono focus:outline-none focus:border-accent-violet/50 transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction("deposit")}
                  disabled={isProcessing}
                  className="py-3 rounded-lg bg-accent-violet/20 border border-accent-violet/40 text-accent-violet hover:bg-accent-violet/30 transition-all font-mono text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Lock XLM
                </button>
                <button
                  onClick={() => handleAction("withdraw")}
                  disabled={isProcessing}
                  className="py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all font-mono text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                  Unlock XLM
                </button>
              </div>
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="border-l border-white/5 pl-8 hidden md:block">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <History className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-tighter">Vault Ledger</span>
            </div>
            
            <div className="space-y-3 h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {isLoadingHistory ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>
                ) : history.length === 0 ? (
                  <p className="text-white/20 text-xs font-mono text-center py-8">No vault activity found.</p>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {item.type === "lock" ? (
                          <ArrowUpFromLine className="w-3 h-3 text-red-400" />
                        ) : (
                          <ArrowDownToLine className="w-3 h-3 text-green-400" />
                        )}
                        <div>
                          <p className="text-[10px] text-white font-mono leading-none capitalize">{item.type}ed</p>
                          <p className="text-[10px] text-white/40 font-mono mt-1">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-white">{item.amount} XLM</p>
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${item.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] text-accent-violet hover:underline font-mono"
                        >
                          {item.txHash.slice(0, 8)}...
                        </a>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
