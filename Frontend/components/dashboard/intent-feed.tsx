"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface Intent {
  id: string
  type: "payout" | "solver" | "intent"
  message: string
  timestamp: string
}

export default function IntentFeed() {
  const [intents, setIntents] = useState<Intent[]>([])

  useEffect(() => {
    const mockIntents: Intent[] = [
      {
        id: "1",
        type: "payout",
        message: "Payout sent → Polygon",
        timestamp: "now",
      },
      {
        id: "2",
        type: "solver",
        message: "Solver #03: Route optimized",
        timestamp: "2m ago",
      },
      {
        id: "3",
        type: "intent",
        message: "Intent 0x123 resolved ✅",
        timestamp: "5m ago",
      },
      {
        id: "4",
        type: "payout",
        message: "Payout received +5.0 USDC",
        timestamp: "10m ago",
      },
    ]
    setIntents(mockIntents)

    // Simulate new intents
    const interval = setInterval(() => {
      const newIntent: Intent = {
        id: Date.now().toString(),
        type: ["payout", "solver", "intent"][Math.floor(Math.random() * 3)] as any,
        message: ["Payout sent", "Solver route", "Intent resolved"][Math.floor(Math.random() * 3)],
        timestamp: "now",
      }
      setIntents((prev) => [newIntent, ...prev.slice(0, 3)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "payout":
        return "💰"
      case "solver":
        return "🔄"
      case "intent":
        return "✅"
      default:
        return "📌"
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <h3 className="font-bold text-lg mb-4">Intent Feed</h3>

      <div className="flex-1 overflow-y-auto space-y-3">
        {intents.map((intent, index) => (
          <motion.div
            key={intent.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-sm"
          >
            <div className="flex items-start gap-2">
              <span className="text-lg mt-0.5">{getIcon(intent.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-xs font-semibold truncate">{intent.message}</p>
                <p className="text-muted-foreground text-xs mt-1">{intent.timestamp}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
