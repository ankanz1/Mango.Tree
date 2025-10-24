"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Clock, TrendingUp, TrendingDown } from "lucide-react"

interface HistoricalBet {
  id: string
  eventId: string
  prediction: string
  amount: string
  token: string
  result: "won" | "lost"
  timestamp: string
  blockNumber: number
  txHash: string
  payout: string
}

interface BetHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function BetHistorySidebar({ isOpen, onClose }: BetHistorySidebarProps) {
  const [selectedBet, setSelectedBet] = useState<HistoricalBet | null>(null)

  const historicalBets: HistoricalBet[] = [
    {
      id: "1",
      eventId: "0xevent_1a2b3c4d5e6f7g8h9i0j",
      prediction: "BTC > $50k",
      amount: "100",
      token: "USDC",
      result: "won",
      timestamp: "2025-10-22T14:32:00Z",
      blockNumber: 28456789,
      txHash: "0x7f8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z",
      payout: "250",
    },
    {
      id: "2",
      eventId: "0xevent_9i8h7g6f5e4d3c2b1a0z",
      prediction: "ETH volatility < 5%",
      amount: "50",
      token: "cUSD",
      result: "lost",
      timestamp: "2025-10-21T09:15:00Z",
      blockNumber: 28445123,
      txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b",
      payout: "0",
    },
    {
      id: "3",
      eventId: "0xevent_5k4j3i2h1g0f9e8d7c6b",
      prediction: "Celo price up 10%",
      amount: "75",
      token: "USDC",
      result: "won",
      timestamp: "2025-10-20T16:45:00Z",
      blockNumber: 28432456,
      txHash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3z2y1x",
      payout: "187.50",
    },
  ]

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-96 bg-background/95 backdrop-blur-xl border-r border-accent/30 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-accent/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Bet History</h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            {/* Bets List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {historicalBets.map((bet, index) => (
                <motion.button
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedBet(bet)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedBet?.id === bet.id
                      ? "border-accent/60 bg-accent/10"
                      : "border-accent/20 bg-card/30 hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {bet.result === "won" ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="font-semibold text-sm">{bet.prediction}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        bet.result === "won" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {bet.result === "won" ? "+$" : "-$"}
                      {bet.result === "won" ? bet.payout : bet.amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(bet.timestamp)}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Selected Bet Details */}
            {selectedBet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border-t border-accent/20 bg-card/50 space-y-3"
              >
                <h3 className="font-semibold text-sm text-muted-foreground">On-Chain Details</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event ID:</span>
                    <span className="font-mono text-accent">{selectedBet.eventId.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Block:</span>
                    <span className="font-mono text-accent">{selectedBet.blockNumber.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tx Hash:</span>
                    <span className="font-mono text-accent">{selectedBet.txHash.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono text-accent">{formatDate(selectedBet.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
