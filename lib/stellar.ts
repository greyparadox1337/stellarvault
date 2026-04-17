import { Horizon, TransactionBuilder, Operation, Asset, Networks, Memo, StrKey } from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const getHorizon = () => {
  return new Horizon.Server(HORIZON_URL);
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

  // Reconstruct the signed transaction from the returned XDR
  const signedTx = TransactionBuilder.fromXDR(
    typeof signedResult === "string" ? signedResult : signedResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );

  return server.submitTransaction(signedTx);
};

export const fetchHistory = async (address: string, limit: number = 5) => {
  const server = getHorizon();
  return server
    .transactions()
    .forAccount(address)
    .limit(limit)
    .order("desc")
    .call();
};
