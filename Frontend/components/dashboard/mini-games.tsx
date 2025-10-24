"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Volume2, VolumeX } from "lucide-react"
import CoinFlipGame from "./games/coin-flip"
import LuckyDiceGame from "./games/lucky-dice"
import MangoSpinGame from "./games/mango-spin"

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<"coin-flip" | "lucky-dice" | "mango-spin">("coin-flip")
  const [soundEnabled, setSoundEnabled] = useState(true)

  const games = [
    { id: "coin-flip", label: "Coin Flip", description: "50/50 chance to win" },
    { id: "lucky-dice", label: "Lucky Dice", description: "Roll for higher number" },
    { id: "mango-spin", label: "Mango Spin", description: "Spin the wheel" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-accent to-primary">
            <Gamepad2 className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Mini Games
            </h1>
            <p className="text-sm text-muted-foreground">Play instant games with real-time randomness</p>
          </div>
        </div>

        {/* Sound Toggle */}
        <motion.button
          onClick={() => setSoundEnabled(!soundEnabled)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Game Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game) => (
          <motion.button
            key={game.id}
            onClick={() => setActiveGame(game.id as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg border transition-all ${
              activeGame === game.id
                ? "border-accent bg-gradient-to-br from-accent/20 to-primary/20 shadow-lg shadow-accent/30"
                : "border-accent/20 bg-card/50 hover:border-accent/40 hover:bg-card/70"
            }`}
          >
            <h3 className="font-semibold text-lg">{game.label}</h3>
            <p className="text-sm text-muted-foreground">{game.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Game Content */}
      <motion.div
        key={activeGame}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border border-accent/20 bg-card/50 backdrop-blur-sm p-8"
      >
        {activeGame === "coin-flip" && <CoinFlipGame soundEnabled={soundEnabled} />}
        {activeGame === "lucky-dice" && <LuckyDiceGame soundEnabled={soundEnabled} />}
        {activeGame === "mango-spin" && <MangoSpinGame soundEnabled={soundEnabled} />}
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-sm"
      >
        <p className="text-sm text-foreground">
          <span className="font-semibold">Powered by Chainlink VRF:</span> All game results are generated using
          Chainlink's Verifiable Random Function for true on-chain randomness. Your bets are secure and transparent.
        </p>
      </motion.div>
    </div>
  )
}
