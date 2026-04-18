"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import * as freighter from "../lib/freighter";

interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  balances: { asset: string; balance: string }[];
  isLoading: boolean;
  error: string | null;
  freighterInstalled: boolean;
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  clearError: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    network: null,
    balances: [],
    isLoading: true,
    error: null,
    freighterInstalled: false,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!state.publicKey) return;
    
    try {
      const balances = await freighter.getAccountBalances(state.publicKey);
      setState((prev) => ({ ...prev, balances }));
    } catch (err: any) {
      console.error("[WalletContext] Failed to refresh balances:", err);
    }
  }, [state.publicKey]);

  const disconnect = useCallback(() => {
    freighter.disconnectWallet();
    setState((prev) => ({
      ...prev,
      isConnected: false,
      publicKey: null,
      network: null,
      balances: [],
      isLoading: false,
    }));
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const isInstalled = await freighter.checkFreighterInstalled();
      if (!isInstalled) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          freighterInstalled: false,
          error: "Freighter extension not found. Please install it to continue."
        }));
        return;
      }

      const connection = await freighter.connectWallet();
      
      if (connection) {
        const balances = await freighter.getAccountBalances(connection.publicKey);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          publicKey: connection.publicKey,
          network: connection.network,
          balances,
          isLoading: false,
          freighterInstalled: true,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to connect to Freighter. Please unlock your wallet and try again."
        }));
      }
    } catch (err: any) {
      console.error("[WalletContext] Connection failed:", err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "An unexpected connection error occurred."
      }));
    }
  }, []);

  // Silent auto-connect on mount
  useEffect(() => {
    async function initWallet() {
      const isInstalled = await freighter.checkFreighterInstalled();
      setState(prev => ({ ...prev, freighterInstalled: isInstalled }));

      if (isInstalled) {
        const pk = await freighter.getWalletPublicKey();
        if (pk) {
          const balances = await freighter.getAccountBalances(pk);
          setState(prev => ({
            ...prev,
            isConnected: true,
            publicKey: pk,
            network: "TESTNET",
            balances,
            isLoading: false,
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
    
    initWallet();
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    connect,
    disconnect,
    refreshBalances,
    clearError,
  }), [state, connect, disconnect, refreshBalances, clearError]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
