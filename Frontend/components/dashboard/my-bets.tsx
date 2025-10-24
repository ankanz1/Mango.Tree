"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { resolveBetContract } from "@/lib/contract-placeholders"
import { RotateCcw } from "lucide-react"

interface UserBet {
  id: string
  amount: string
  token: string
  opponent: string
  status: "active" | "won" | "lost" | "pending"
  createdAt: string
  eventId: string
  blockNumber: number
  txHash: string
  timestamp: string
}

export default function MyBets() {
  const [userBets, setUserBets] = useState<UserBet[]>([])
  const [resolvingBetId, setResolvingBetId] = useState<string | null>(null)
  const [contractStatuses, setContractStatuses] = useState<Record<string, "idle" | "pending" | "success">>({})
  const [replayingBetId, setReplayingBetId] = useState<string | null>(null)

  useEffect(() => {
    const mockUserBets: UserBet[] = [
      {
        id: "1",
        amount: "50",
        token: "USDC",
        opponent: "0x1234...5678",
        status: "active",
        createdAt: "2 hours ago",
        eventId: "0xevent_1a2b3c4d5e6f7g8h9i0j",
        blockNumber: 28456789,
        txHash: "0x7f8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z",
        timestamp: "2025-10-22T14:32:00Z",
      },
      {
        id: "2",
        amount: "100",
        token: "cUSD",
        opponent: "0x9876...5432",
        status: "won",
        createdAt: "1 day ago",
        eventId: "0xevent_9i8h7g6f5e4d3c2b1a0z",
        blockNumber: 28445123,
        txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b",
        timestamp: "2025-10-21T09:15:00Z",
      },
      {
        id: "3",
        amount: "25",
        token: "USDC",
        opponent: "0xabcd...ef01",
        status: "pending",
        createdAt: "30 minutes ago",
        eventId: "0xevent_5k4j3i2h1g0f9e8d7c6b",
        blockNumber: 28432456,
        txHash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3z2y1x",
        timestamp: "2025-10-20T16:45:00Z",
      },
    ]
    setUserBets(mockUserBets)
  }, [])

  const handleResolveBet = async (bet: UserBet) => {
    setResolvingBetId(bet.id)
    setContractStatuses((prev) => ({ ...prev, [bet.id]: "pending" }))

    try {
      const result = await resolveBetContract({
        betId: bet.id,
        winner: "0x" + Math.random().toString(16).slice(2), // Placeholder winner
      })

      setContractStatuses((prev) => ({ ...prev, [bet.id]: "success" }))

      // Update bet status
      setUserBets((prev) => prev.map((b) => (b.id === bet.id ? { ...b, status: "won" } : b)))

      setTimeout(() => {
        setResolvingBetId(null)
      }, 2000)
    } catch (error) {
      console.error("Error resolving bet:", error)
      setContractStatuses((prev) => ({ ...prev, [bet.id]: "idle" }))
      setResolvingBetId(null)
    }
  }

  const handleReplayAnimation = (betId: string) => {
    setReplayingBetId(betId)
    setTimeout(() => setReplayingBetId(null), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400"
      case "won":
        return "bg-green-500/20 text-green-400"
      case "lost":
        return "bg-red-500/20 text-red-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Bets</h2>

      <div className="grid gap-4">
        {userBets.map((bet, index) => (
          <motion.div
            key={bet.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl border border-accent/30 bg-card/50 backdrop-blur-sm hover:border-accent/60 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Opponent</p>
                <p className="font-mono font-semibold">{bet.opponent}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold text-accent">
                  {bet.amount} {bet.token}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">{bet.createdAt}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bet.status)}`}>
                {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
              </span>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-xs text-muted-foreground mb-2">On-Chain Details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Event ID</p>
                  <p className="font-mono text-primary">{bet.eventId.slice(0, 14)}...</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Block</p>
                  <p className="font-mono text-primary">{bet.blockNumber.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {bet.status === "pending" && (
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">Smart Contract</p>
                  <p className="text-xs font-mono text-primary">
                    ResolveBet() → Settle {bet.amount} {bet.token}
                  </p>
                </div>

                <motion.button
                  onClick={() => handleResolveBet(bet)}
                  disabled={resolvingBetId === bet.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {contractStatuses[bet.id] === "pending" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                    />
                  )}
                  {contractStatuses[bet.id] === "success" ? "Bet Resolved!" : "Resolve Bet"}
                </motion.button>
              </div>
            )}

            {(bet.status === "won" || bet.status === "lost") && (
              <motion.button
                onClick={() => handleReplayAnimation(bet.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={replayingBetId === bet.id ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6 }}
                className="w-full mt-4 py-2 rounded-lg border border-accent/50 bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {replayingBetId === bet.id ? "Replaying..." : "Replay Payout"}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
