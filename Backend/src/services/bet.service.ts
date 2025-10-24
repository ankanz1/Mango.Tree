import Bet, { type BetDocument } from "@models/bet.model.js"
import type { Types } from "mongoose"

export const listRecentBets = async (limit = 10): Promise<BetDocument[]> => {
  return Bet.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("participants.userId", "username")
}

interface CreateBetPayload {
  participants: Array<{ userId: Types.ObjectId; stake: number }>
  resolver: string
  chain: string
  metadata?: Record<string, unknown>
}

export const createBet = async (payload: CreateBetPayload): Promise<BetDocument> => {
  const bet = new Bet({
    participants: payload.participants,
    resolver: payload.resolver,
    chain: payload.chain,
    metadata: payload.metadata ?? {},
  })

  return bet.save()
}