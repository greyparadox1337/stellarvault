"use client";

import { useContext } from "react";
import { WalletContext } from "../context/WalletContext";

/**
 * useWallet - Clean interface for accessing global VaultLock wallet state.
 * Throws an error if used outside of a WalletProvider.
 */
export function useWallet() {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider. Ensure your component is a child of the layout with WalletProvider.");
  }
  
  return context;
}
