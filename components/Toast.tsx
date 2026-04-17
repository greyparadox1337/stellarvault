"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 items-center w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`w-full glass-panel p-4 flex items-center justify-between gap-4 border border-white/10 shadow-2xl backdrop-blur-xl`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-accent-cyan" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === "pending" && <Loader2 className="w-5 h-5 text-accent-violet animate-spin" />}
              
              <p className="text-sm font-mono text-white tracking-tight">{toast.message}</p>
            </div>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
