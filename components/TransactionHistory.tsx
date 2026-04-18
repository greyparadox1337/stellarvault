"use client";

import { useState, useEffect, useCallback } from "react";
import GlassCard from "./GlassCard";
import { fetchHistory } from "@/lib/stellar";
import { HistorySkeleton } from "./Skeleton";
import { History, ExternalLink, ArrowDownLeft, ArrowUpRight, UserPlus, Shield, Activity, Lock } from "lucide-react";

interface TransactionHistoryProps {
  address: string;
}

interface TxRecord {
  id: string;
  created_at: string;
  type: string;
  transaction_hash: string;
  hash?: string;
  successful: boolean;
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [history, setHistory] = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const result = await fetchHistory(address, 8);
      setHistory(result.records as any);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  const getFriendlyType = (type: string) => {
    switch (type) {
      case "payment":
        return { label: "Vault Transfer", icon: ArrowUpRight, color: "text-primary" };
      case "create_account":
        return { label: "Vault Initialized", icon: Shield, color: "text-primary" };
      case "account_merge":
        return { label: "Vault Consolidation", icon: UserPlus, color: "text-red-400" };
      case "change_trust":
        return { label: "Security Trustline", icon: Lock, color: "text-amber-400" };
      case "invoke_host_function":
        return { label: "Smart Contract Execution", icon: Activity, color: "text-primary" };
      default:
        return { 
          label: (type || "Unknown").split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "), 
          icon: Shield, 
          color: "text-slate-400" 
        };
    }
  };

  if (isLoading) return <HistorySkeleton />;

  return (
    <GlassCard className="p-6 h-full flex flex-col border-primary/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-primary/10">
            <History className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xs font-bold font-mono text-primary uppercase tracking-widest">
            Neural Ledger Activity
          </h2>
        </div>
        <button 
          onClick={() => { setIsLoading(true); loadHistory(); }}
          className="text-[10px] font-mono text-slate-500 hover:text-primary transition-colors uppercase tracking-widest font-bold"
        >
          Rescan
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {history.length > 0 ? (
          history.map((tx) => {
            const typeInfo = getFriendlyType(tx.type);
            const Icon = typeInfo.icon;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded bg-slate-900/40 border border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                <div className="flex items-center gap-4 z-10">
                  <div className={`p-2 rounded-lg bg-white/5 ${typeInfo.color} group-hover:bg-primary/10 transition-colors`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200 font-sans group-hover:text-primary transition-colors">
                      {typeInfo.label}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 z-10">
                  <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full border ${tx.successful ? 'bg-success/5 text-success border-success/20' : 'bg-error/5 text-error border-error/20'}`}>
                    {tx.successful ? 'Verified' : 'Invalid'}
                  </span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.transaction_hash || tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <Activity className="w-8 h-8 mb-4 text-slate-600" />
            <p className="text-[10px] font-mono uppercase tracking-widest mb-1">Zero Activity Detected</p>
            <p className="text-[9px] text-slate-500">Perform a transfer to initialize neural signatures</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
