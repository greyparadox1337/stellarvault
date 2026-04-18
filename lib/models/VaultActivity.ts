import mongoose, { Schema, model, models } from "mongoose";

export interface IVaultActivity {
  userAddress: string;
  type: "lock" | "unlock";
  amount: string;
  txHash: string;
  timestamp: Date;
}

const VaultActivitySchema = new Schema<IVaultActivity>({
  userAddress: {
    type: String,
    required: [true, "User address is required"],
    index: true,
  },
  type: {
    type: String,
    enum: ["lock", "unlock"],
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const VaultActivity = models.VaultActivity || model<IVaultActivity>("VaultActivity", VaultActivitySchema);

export default VaultActivity;
