"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface AboutModalProps {
  onClose: () => void
}

export default function AboutModal({ onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rules" | "leaderboard">("overview")
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setParticles(newParticles)
  }, [])

  const tabs = [
    { id: "overview", label: "Overview", icon: "🥭" },
    { id: "rules", label: "Rules", icon: "⚖️" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  ] as const

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Floating particles background */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-accent rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + particle.id,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-background via-background to-background/80 border border-accent/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 hover:bg-accent/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-accent" />
          </motion.button>

          {/* Spinning mango icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="absolute top-6 left-6 text-4xl"
          >
            🥭
          </motion.div>

          {/* Tab buttons */}
          <div className="flex gap-2 p-6 border-b border-accent/20 bg-background/50 backdrop-blur">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-accent to-primary text-background shadow-lg shadow-accent/50"
                    : "text-muted-foreground hover:text-accent border border-accent/20 hover:border-accent/50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Content area */}
          <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Welcome to Mango.tree 🌳
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Mango.tree is a decentralized, intent-driven betting platform built on the Celo blockchain. Place
                    bets, predict outcomes, and earn rewards — all transparently and securely. Choose your payout chain,
                    and let our cross-chain solver handle the rest.
                  </p>

                  {/* Animated flow diagram */}
                  <div className="bg-card/50 border border-accent/20 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-2">👤</div>
                        <span className="text-sm font-semibold">User</span>
                      </motion.div>

                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="text-2xl text-accent"
                      >
                        →
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-2">🎲</div>
                        <span className="text-sm font-semibold">Place Bet</span>
                      </motion.div>

                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="text-2xl text-accent"
                      >
                        →
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-2">🎯</div>
                        <span className="text-sm font-semibold">Win</span>
                      </motion.div>

                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="text-2xl text-accent"
                      >
                        →
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
                        className="flex flex-col items-center"
                      >
                        <div className="text-4xl mb-2">🌉</div>
                        <span className="text-sm font-semibold">Cross-Chain</span>
                      </motion.div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all"
                  >
                    Start Betting →
                  </motion.button>
                </motion.div>
              )}

              {activeTab === "rules" && (
                <motion.div
                  key="rules"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Platform Rules
                  </h2>

                  <div className="space-y-4">
                    {[
                      "Each bet locks funds until result is verified.",
                      "Winners are chosen by oracle / smart contract logic.",
                      "You can claim payouts across chains (Celo, Polygon, Ethereum, etc.)",
                      "Fair play only — all results are verifiable on-chain.",
                      "Once payout is claimed, the transaction cannot be reversed.",
                    ].map((rule, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex gap-4 items-start bg-card/50 border border-accent/20 rounded-lg p-4 hover:border-accent/50 transition-all"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="text-2xl flex-shrink-0 mt-1"
                        >
                          ✓
                        </motion.div>
                        <p className="text-muted-foreground">{rule}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "leaderboard" && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                    Leaderboard Highlights
                  </h2>

                  <div className="space-y-4">
                    {[
                      { rank: 1, name: "@AlphaWager", wins: 32, medal: "🥇" },
                      { rank: 2, name: "@BetKing", wins: 28, medal: "🥈" },
                      { rank: 3, name: "@MangoLord", wins: 25, medal: "🥉" },
                    ].map((player, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg p-4 hover:border-accent/50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: index * 0.2 }}
                              className="text-4xl"
                            >
                              {player.medal}
                            </motion.div>
                            <div>
                              <p className="font-bold text-lg">{player.name}</p>
                              <p className="text-sm text-muted-foreground">Rank #{player.rank}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-accent">{player.wins}</p>
                            <p className="text-sm text-muted-foreground">wins</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-6 px-6 py-3 rounded-lg border border-accent/50 text-accent font-semibold hover:bg-accent/10 transition-all"
                  >
                    View Full Leaderboard →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
