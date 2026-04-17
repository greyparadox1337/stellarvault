"use client";

import { useState, useEffect, useCallback } from "react";
import GlassCard from "./GlassCard";
import { fetchHistory } from "@/lib/stellar";
import { HistorySkeleton } from "./Skeleton";
import { History, ExternalLink, ArrowDownLeft, ArrowUpRight, UserPlus, Settings } from "lucide-react";

interface TransactionHistoryProps {
  address: string;
}

interface TxRecord {
  id: string;
  created_at: string;
  type: string;
  hash: string;
  successful: boolean;
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [history, setHistory] = useState<TxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const result = await fetchHistory(address, 5);
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
        return { label: "Payment", icon: ArrowUpRight, color: "text-accent-cyan" };
      case "create_account":
        return { label: "Vault Created", icon: UserPlus, color: "text-accent-violet" };
      case "account_merge":
        return { label: "Vault Merged", icon: UserPlus, color: "text-red-400" };
      case "change_trust":
        return { label: "Asset Trust", icon: Settings, color: "text-orange-400" };
      default:
        return { label: type.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "), icon: Settings, color: "text-gray-400" };
    }
  };

  if (isLoading) return <HistorySkeleton />;

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-accent-violet/10">
            <History className="w-4 h-4 text-accent-violet" />
          </div>
          <h2 className="text-sm font-bold font-mono text-accent-violet uppercase tracking-widest">
            Recent Activity
          </h2>
        </div>
        <button 
          onClick={() => { setIsLoading(true); loadHistory(); }}
          className="text-[10px] font-mono text-white/20 hover:text-white transition-colors uppercase tracking-tighter"
        >
          Refresh Ledger
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
                className="flex items-center justify-between p-4 rounded bg-black/30 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white/5 ${typeInfo.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white font-sans">{typeInfo.label}</p>
                    <p className="text-[10px] font-mono text-gray-500">
                      {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${tx.successful ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.successful ? 'Confirmed' : 'Failed'}
                  </span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
            <History className="w-8 h-8 mb-2" />
            <p className="text-xs font-mono">No neural signatures found in current ledger</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
