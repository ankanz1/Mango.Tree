import { Schema, model, type Document } from "mongoose"

export interface UserDocument extends Document {
  username: string
  email: string
  passwordHash: string
  walletAddress: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    walletAddress: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
)

export default model<UserDocument>("User", userSchema)