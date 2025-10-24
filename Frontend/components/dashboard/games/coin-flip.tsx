"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Coins } from "lucide-react"

interface CoinFlipGameProps {
  soundEnabled: boolean
}

export default function CoinFlipGame({ soundEnabled }: CoinFlipGameProps) {
  const [betAmount, setBetAmount] = useState("10")
  const [selectedSide, setSelectedSide] = useState<"heads" | "tails">("heads")
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<{ side: "heads" | "tails"; won: boolean } | null>(null)
  const [balance, setBalance] = useState(1000)

  const playSound = (type: "flip" | "win" | "loss") => {
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "flip") {
      oscillator.frequency.value = 400
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } else if (type === "win") {
      oscillator.frequency.value = 800
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } else {
      oscillator.frequency.value = 200
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  }

  const handleFlip = async () => {
    const amount = Number.parseFloat(betAmount)
    if (amount > balance || amount <= 0) return

    setIsFlipping(true)
    setResult(null)

    playSound("flip")
    triggerHaptic()

    // Simulate Chainlink VRF call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const randomResult = Math.random() > 0.5 ? "heads" : "tails"
    const won = randomResult === selectedSide

    if (won) {
      setBalance(balance + amount)
      playSound("win")
      triggerHaptic()
    } else {
      setBalance(balance - amount)
      playSound("loss")
    }

    setResult({ side: randomResult, won })
    setIsFlipping(false)
  }

  return (
    <div className="space-y-8">
      {/* Coin Animation */}
      <div className="flex justify-center py-12">
        <motion.div
          animate={isFlipping ? { rotateY: 360 } : { rotateY: 0 }}
          transition={isFlipping ? { duration: 2, repeat: Number.POSITIVE_INFINITY } : { duration: 0.3 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl shadow-accent/50"
          style={{ perspective: 1000 }}
        >
          <Coins className="w-16 h-16 text-background" />
        </motion.div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-2"
        >
          <p className="text-lg font-semibold">
            Result: <span className="capitalize text-accent">{result.side}</span>
          </p>
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
            className={`text-2xl font-bold ${result.won ? "text-green-400" : "text-red-400"}`}
          >
            {result.won ? "You Won!" : "You Lost!"}
          </motion.p>
          {result.won && (
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6 }}
              className="text-3xl"
            >
              ✨
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className="space-y-4 max-w-md mx-auto">
        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium mb-2">Bet Amount</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            disabled={isFlipping}
            className="w-full px-4 py-2 rounded-lg bg-input border border-accent/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50"
            placeholder="Enter amount"
          />
          <p className="text-xs text-muted-foreground mt-1">Balance: {balance.toFixed(2)}</p>
        </div>

        {/* Side Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Choose Side</label>
          <div className="grid grid-cols-2 gap-3">
            {["heads", "tails"].map((side) => (
              <motion.button
                key={side}
                onClick={() => setSelectedSide(side as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isFlipping}
                className={`py-3 rounded-lg font-semibold capitalize transition-all ${
                  selectedSide === side
                    ? "bg-gradient-to-r from-accent to-primary text-background shadow-lg shadow-accent/50"
                    : "bg-card border border-accent/20 text-foreground hover:border-accent/40"
                } disabled:opacity-50`}
              >
                {side}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Flip Button */}
        <motion.button
          onClick={handleFlip}
          disabled={isFlipping || Number.parseFloat(betAmount) > balance || Number.parseFloat(betAmount) <= 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-bold shadow-lg shadow-accent/50 hover:shadow-xl hover:shadow-accent/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </motion.button>
      </div>
    </div>
  )
}
