"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { acceptBetContract } from "@/lib/contract-placeholders"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Zap } from "lucide-react"

interface Bet {
  id: string
  creator: string
  prediction: string
  amount: string
  token: string
  chain: string
  odds: string
  timeRemaining: string
  status: "open" | "locked" | "resolved"
  participants: number
}

export default function BetLobby() {
  const [bets, setBets] = useState<Bet[]>([])
  const [acceptingBetId, setAcceptingBetId] = useState<string | null>(null)
  const [contractStatuses, setContractStatuses] = useState<Record<string, "idle" | "pending" | "success">>({})
  const { toast } = useToast()

  useEffect(() => {
    const mockBets: Bet[] = [
      {
        id: "1",
        creator: "0x1234...5678",
        prediction: "BTC will reach $50,000 by Dec 31, 2025",
        amount: "50",
        token: "USDC",
        chain: "Celo",
        odds: "1.8x",
        timeRemaining: "45 days",
        status: "open",
        participants: 3,
      },
      {
        id: "2",
        creator: "0x9876...5432",
        prediction: "Celo price will exceed $2 by Q1 2026",
        amount: "100",
        token: "cUSD",
        chain: "Celo",
        odds: "2.5x",
        timeRemaining: "92 days",
        status: "open",
        participants: 7,
      },
      {
        id: "3",
        creator: "0xabcd...ef01",
        prediction: "ETH will outperform BTC in next 30 days",
        amount: "25",
        token: "USDC",
        chain: "Celo",
        odds: "1.5x",
        timeRemaining: "28 days",
        status: "locked",
        participants: 5,
      },
    ]
    setBets(mockBets)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  const handleAcceptBet = async (bet: Bet) => {
    setAcceptingBetId(bet.id)
    setContractStatuses((prev) => ({ ...prev, [bet.id]: "pending" }))

    try {
      const result = await acceptBetContract({
        betId: bet.id,
        amount: bet.amount,
        token: bet.token,
      })

      setContractStatuses((prev) => ({ ...prev, [bet.id]: "success" }))

      // Update bet status
      setBets((prev) => prev.map((b) => (b.id === bet.id ? { ...b, status: "locked" } : b)))

      toast({
        title: "Bet Accepted!",
        description: `Successfully locked ${bet.amount} ${bet.token} at ${bet.odds} odds. Your bet is now active!`,
        variant: "default",
      })

      setTimeout(() => {
        setAcceptingBetId(null)
      }, 2000)
    } catch (error) {
      console.error("Error accepting bet:", error)
      setContractStatuses((prev) => ({ ...prev, [bet.id]: "idle" }))
      setAcceptingBetId(null)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h2 className="text-3xl font-bold">Live Bets</h2>
        <p className="text-muted-foreground">Join active bets and start earning rewards</p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
        {bets.map((bet, index) => (
          <motion.div
            key={bet.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="p-6 rounded-xl border border-accent/30 bg-card/50 backdrop-blur-sm hover:border-accent/60 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Prediction</p>
                <p className="text-lg font-semibold text-balance">{bet.prediction}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Creator</p>
                  <p className="font-mono text-sm font-semibold">{bet.creator}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Bet Amount</p>
                  <p className="text-lg font-bold text-accent">
                    {bet.amount} {bet.token}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Odds</p>
                    <p className="font-bold text-primary">{bet.odds}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Left</p>
                    <p className="font-semibold text-accent">{bet.timeRemaining}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">Players</p>
                    <p className="font-semibold">{bet.participants}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                    {bet.chain}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      bet.status === "open"
                        ? "bg-accent/20 text-accent"
                        : bet.status === "locked"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                  </span>
                </div>
              </div>

              {bet.status === "open" && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1">Smart Contract</p>
                    <p className="text-xs font-mono text-primary">
                      AcceptBet() → Lock {bet.amount} {bet.token}
                    </p>
                  </div>

                  <motion.button
                    onClick={() => handleAcceptBet(bet)}
                    disabled={acceptingBetId === bet.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {contractStatuses[bet.id] === "pending" && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                      />
                    )}
                    {contractStatuses[bet.id] === "success" ? "Bet Accepted!" : "Accept Bet"}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
