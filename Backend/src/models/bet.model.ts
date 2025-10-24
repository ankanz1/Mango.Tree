import { Schema, model, type Document, Types } from "mongoose"

export interface BetDocument extends Document {
  participants: Array<{
    userId: Types.ObjectId
    stake: number
  }>
  resolver: string
  status: "active" | "resolving" | "resolved" | "cancelled"
  chain: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const betSchema = new Schema<BetDocument>(
  {
    participants: {
      type: [
        {
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          stake: { type: Number, required: true, min: 0 },
        },
      ],
      required: true,
      validate: [(value: unknown[]) => value.length >= 2, "At least two participants are required"],
    },
    resolver: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "resolving", "resolved", "cancelled"],
      default: "active",
    },
    chain: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export default model<BetDocument>("Bet", betSchema)