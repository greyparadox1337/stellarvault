import { 
  Horizon, 
  TransactionBuilder, 
  Operation, 
  Asset, 
  Networks, 
  Memo, 
  StrKey, 
  Contract, 
  Address, 
  nativeToScVal, 
  scValToNative, 
  rpc
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const HORIZON_URL = (process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org").replace(/\/$/, "");
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;
const VAULT_CONTRACT_ID = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || "";

let horizonServer: Horizon.Server | null = null;
let rpcServerInstance: rpc.Server | null = null;

export const getHorizon = () => {
  if (!horizonServer) {
    horizonServer = new Horizon.Server(HORIZON_URL);
  }
  return horizonServer;
};

export const getRpc = () => {
  if (!rpcServerInstance) {
    rpcServerInstance = new rpc.Server(RPC_URL);
  }
  return rpcServerInstance;
};

export const validateAddress = (address: string): boolean => {
  return StrKey.isValidEd25519PublicKey(address);
};

export const fetchBalance = async (address: string): Promise<string> => {
  try {
    const server = getHorizon();
    const account = await server.loadAccount(address);
    const nativeBalance = account.balances.find((b) => b.asset_type === "native");
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0";
  }
};

export const fundWithFriendbot = async (address: string): Promise<void> => {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${address}`);
    if (!response.ok) {
      throw new Error("Friendbot funding failed");
    }
  } catch (error) {
    console.error("Error funding with friendbot:", error);
    throw error;
  }
};

export const sendPayment = async ({
  destination,
  amount,
  memo,
  sourceAddress,
}: {
  destination: string;
  amount: string;
  memo?: string;
  sourceAddress: string;
}) => {
  const server = getHorizon();
  const sourceAccount = await server.loadAccount(sourceAddress);
  const baseFee = await server.fetchBaseFee();

  const builder = new TransactionBuilder(sourceAccount, {
    fee: baseFee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(60);

  if (memo) {
    builder.addMemo(Memo.text(memo));
  }

  const builtTx = builder.build();
  const xdr = builtTx.toXDR();

  const signedResult = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = TransactionBuilder.fromXDR(
    signedResult,
    NETWORK_PASSPHRASE
  );

  return server.submitTransaction(signedTx);
};

/**
 * Soroban Vault Interactions
 */

export const fetchLockedBalance = async (userAddress: string): Promise<string> => {
  if (!VAULT_CONTRACT_ID) return "0";
  const server = getRpc();
  const contract = new Contract(VAULT_CONTRACT_ID);

  try {
    const response = await server.getLedgerEntries(
      contract.getFootprint()
    );
    
    // For simplicity, we use simulateTransaction to get the value
    const simulation = await server.simulateTransaction(
      new TransactionBuilder(
        await getHorizon().loadAccount(userAddress),
        { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
      )
        .addOperation(
          contract.call("balance", nativeToScVal(new Address(userAddress), { type: "address" }))
        )
        .setTimeout(30)
        .build()
    );

    if (rpc.Api.isSimulationSuccess(simulation) && simulation.result) {
      const result = scValToNative(simulation.result.retval);
      return (Number(result) / 10000000).toString(); // Convert from stroops if i128 is stroops
    }
    return "0";
  } catch (e) {
    console.error("Error fetching locked balance:", e);
    return "0";
  }
};

export const invokeVault = async (
  userAddress: string,
  method: "deposit" | "withdraw",
  amount: string
) => {
  if (!VAULT_CONTRACT_ID) throw new Error("Vault contract ID not configured");
  
  const server = getHorizon();
  const rpcServer = getRpc();
  const sourceAccount = await server.loadAccount(userAddress);
  const contract = new Contract(VAULT_CONTRACT_ID);

  // Convert amount to i128 (stroops)
  const amountStroops = BigInt(Math.floor(parseFloat(amount) * 10000000));

  let tx = new TransactionBuilder(sourceAccount, {
    fee: "10000", // Buffer fee
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        method,
        nativeToScVal(new Address(userAddress), { type: "address" }),
        nativeToScVal(amountStroops, { type: "i128" })
      )
    )
    .setTimeout(60)
    .build();

  // Simulate to get accurate fee and footprint
  const simulation = await rpcServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }

  tx = rpc.assembleTransaction(tx, simulation).build();
  
  const xdr = tx.toXDR();
  const signedResult = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = TransactionBuilder.fromXDR(
    signedResult,
    NETWORK_PASSPHRASE
  );

  return server.submitTransaction(signedTx);
};

export const fetchHistory = async (address: string, limit: number = 5) => {
  const server = getHorizon();
  return server
    .operations()
    .forAccount(address)
    .limit(limit)
    .order("desc")
    .call();
};
