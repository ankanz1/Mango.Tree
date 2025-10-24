"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface HistoryItem {
  id: string
  type: "bet" | "win" | "loss" | "payout"
  title: string
  amount: string
  status: "completed" | "pending" | "failed"
  timestamp: string
  game?: string
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const mockHistory: HistoryItem[] = [
      {
        id: "1",
        type: "win",
        title: "Coin Flip Won",
        amount: "+2.5 USDC",
        status: "completed",
        timestamp: "2m ago",
        game: "Coin Flip",
      },
      {
        id: "2",
        type: "bet",
        title: "Lucky Dice Bet",
        amount: "-1.0 USDC",
        status: "completed",
        timestamp: "5m ago",
        game: "Lucky Dice",
      },
      {
        id: "3",
        type: "payout",
        title: "Payout Received",
        amount: "+5.0 USDC",
        status: "completed",
        timestamp: "10m ago",
      },
      {
        id: "4",
        type: "loss",
        title: "Mango Spin Lost",
        amount: "-0.5 USDC",
        status: "completed",
        timestamp: "15m ago",
        game: "Mango Spin",
      },
      {
        id: "5",
        type: "win",
        title: "Lucky Dice Won",
        amount: "+3.0 USDC",
        status: "completed",
        timestamp: "20m ago",
        game: "Lucky Dice",
      },
    ]
    setHistory(mockHistory)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "win":
        return "🎉"
      case "loss":
        return "❌"
      case "bet":
        return "🎲"
      case "payout":
        return "💰"
      default:
        return "📌"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-foreground"
    }
  }

  const getAmountColor = (type: string) => {
    if (type === "win" || type === "payout") return "text-green-400"
    if (type === "loss" || type === "bet") return "text-red-400"
    return "text-foreground"
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="font-bold text-lg mb-4">History</h3>

      <div className="flex-1 overflow-y-auto space-y-3">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No history yet</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-accent/10 border border-accent/30 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{getIcon(item.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-foreground text-xs font-semibold truncate">{item.title}</p>
                    <p className={`text-xs font-bold whitespace-nowrap ${getAmountColor(item.type)}`}>{item.amount}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    {item.game && <p className="text-muted-foreground text-xs">{item.game}</p>}
                    <p className={`text-xs ${getStatusColor(item.status)}`}>{item.status}</p>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{item.timestamp}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
