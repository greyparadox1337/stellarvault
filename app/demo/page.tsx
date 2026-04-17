"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarField from "@/components/StarField";
import GlassCard from "@/components/GlassCard";
import Link from "next/link";
import { Wallet, Droplets, Send, History, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Connect Wallet",
    icon: Wallet,
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
    description: "Install the Freighter browser extension and connect your Stellar wallet to StellarVault.",
    details: [
      "Click 'Connect Wallet' in the top-right navbar",
      "Freighter will prompt you to approve the connection",
      "Your public key and balance will appear instantly",
      "Balance is cached locally for 30 seconds to reduce API calls",
    ],
  },
  {
    id: 2,
    title: "Fund via Friendbot",
    icon: Droplets,
    color: "text-green-400",
    bg: "bg-green-400/10",
    description: "Get free 10,000 XLM on the Stellar Testnet using the Friendbot faucet.",
    details: [
      "Click 'Request Friendbot Funds' in the balance card",
      "The Stellar Friendbot automatically sends 10,000 test XLM",
      "Your balance updates in real-time after funding",
      "Note: Friendbot may rate-limit repeated requests",
    ],
  },
  {
    id: 3,
    title: "Send XLM",
    icon: Send,
    color: "text-accent-violet",
    bg: "bg-accent-violet/10",
    description: "Transfer XLM to any valid Stellar address with optional memo support.",
    details: [
      "Enter a valid Stellar public key (starts with G, 56 characters)",
      "Specify the amount in XLM (must be > 0 and ≤ your balance)",
      "Optionally add a text memo for the transaction",
      "Freighter prompts you to sign — then confetti! 🎉",
    ],
  },
  {
    id: 4,
    title: "View History",
    icon: History,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    description: "Monitor your last 5 transactions in real-time from the Stellar Horizon API.",
    details: [
      "Transactions auto-refresh every 30 seconds",
      "Each entry shows operation type, date, and status",
      "Click the link icon to view details on Stellar Expert",
      "Friendly labels: 'Payment', 'Vault Created', 'Asset Trust'",
    ],
  },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <main className="min-h-screen relative pt-20 pb-12 px-4 flex flex-col items-center">
      <StarField />

      <div className="z-10 w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to App
          </Link>
          <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
            Interactive Walkthrough
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i <= currentStep ? "bg-accent-cyan" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-xl ${step.bg}`}>
                  <Icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Step {step.id} of {steps.length}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black font-sans text-white tracking-tight">
                    {step.title}
                  </h2>
                </div>
              </div>

              <p className="text-gray-400 font-mono text-sm mt-4 mb-8 leading-relaxed">
                {step.description}
              </p>

              <div className="space-y-3">
                {step.details.map((detail, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5"
                  >
                    <span className="text-accent-cyan font-mono font-bold text-sm mt-0.5">
                      {i + 1}.
                    </span>
                    <p className="text-sm text-gray-300 font-mono leading-relaxed">{detail}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all font-mono text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? "bg-accent-cyan scale-125" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-navy font-bold font-mono text-sm hover-glow-cyan"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-violet text-white font-bold font-mono text-sm hover-glow-violet"
            >
              Launch App <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
