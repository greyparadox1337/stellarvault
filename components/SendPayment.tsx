"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import GlassCard from "./GlassCard";
import { validateAddress, sendPayment } from "@/lib/stellar";
import { useToast } from "@/context/ToastContext";
import { Send, Loader2, ExternalLink } from "lucide-react";

interface SendPaymentProps {
  sourceAddress: string;
  onSuccess: () => void;
}

export default function SendPayment({ sourceAddress, onSuccess }: SendPaymentProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(destination)) {
      showToast("Invalid destination address", "error");
      return;
    }

    if (parseFloat(amount) <= 0) {
      showToast("Amount must be greater than 0", "error");
      return;
    }

    setIsSending(true);
    setTxHash(null);
    showToast("Preparing transaction...", "pending");

    try {
      const result = await sendPayment({
        destination,
        amount,
        memo: memo || undefined,
        sourceAddress,
      });
      
      setTxHash(result.hash);
      showToast("Payment sent successfully!", "success");
      setDestination("");
      setAmount("");
      setMemo("");
      onSuccess();

      // Confetti burst!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#00E5FF", "#7C3AED", "#ffffff"],
      });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Transaction failed", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded bg-accent-cyan/10">
          <Send className="w-4 h-4 text-accent-cyan" />
        </div>
        <h2 className="text-sm font-bold font-mono text-accent-cyan uppercase tracking-widest">
          Dispatch Assets
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1 tracking-tighter">
            Destination Address
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G..."
            className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm font-mono text-white focus:border-accent-cyan/50 focus:outline-none transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1 tracking-tighter">
              Amount (XLM)
            </label>
            <input
              type="number"
              step="0.0000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm font-mono text-white focus:border-accent-cyan/50 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase mb-1 tracking-tighter">
              Memo (Optional)
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Text memo"
              className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm font-mono text-white focus:border-accent-cyan/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="w-full py-4 rounded-lg bg-accent-cyan text-navy font-bold hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 hover-glow-cyan disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AUTHORIZING...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              CONFIRM DISPATCH
            </>
          )}
        </button>
      </form>

      {txHash && (
        <div className="mt-6 p-4 rounded bg-accent-cyan/5 border border-accent-cyan/20 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] font-mono text-accent-cyan uppercase mb-2">Transaction Confirmed</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-white/60 hover:text-white transition-colors group"
          >
            <span className="font-mono text-xs truncate max-w-[200px]">{txHash}</span>
            <ExternalLink className="w-3 h-3 group-hover:text-accent-cyan transition-colors" />
          </a>
        </div>
      )}
    </GlassCard>
  );
}
