import { Schema, model, type Document, Types } from "mongoose"

export interface PayoutIntentDocument extends Document {
  betId: Types.ObjectId
  userId: Types.ObjectId
  payoutAmount: number
  destinationChain: string
  status: "pending" | "processing" | "completed" | "failed"
  transactionHash?: string
  createdAt: Date
  updatedAt: Date
}

const payoutIntentSchema = new Schema<PayoutIntentDocument>(
  {
    betId: { type: Schema.Types.ObjectId, ref: "Bet", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payoutAmount: { type: Number, required: true, min: 0 },
    destinationChain: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    transactionHash: { type: String },
  },
  { timestamps: true }
)

export default model<PayoutIntentDocument>("PayoutIntent", payoutIntentSchema)