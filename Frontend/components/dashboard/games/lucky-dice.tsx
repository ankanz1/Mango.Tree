"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface LuckyDiceGameProps {
  soundEnabled: boolean
}

export default function LuckyDiceGame({ soundEnabled }: LuckyDiceGameProps) {
  const [betAmount, setBetAmount] = useState("10")
  const [targetNumber, setTargetNumber] = useState(4)
  const [isRolling, setIsRolling] = useState(false)
  const [result, setResult] = useState<{ number: number; won: boolean } | null>(null)
  const [balance, setBalance] = useState(1000)

  const playSound = (type: "roll" | "win" | "loss") => {
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "roll") {
      oscillator.frequency.value = 600
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } else if (type === "win") {
      oscillator.frequency.value = 900
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } else {
      oscillator.frequency.value = 300
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.25)
    }
  }

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50])
    }
  }

  const handleRoll = async () => {
    const amount = Number.parseFloat(betAmount)
    if (amount > balance || amount <= 0) return

    setIsRolling(true)
    setResult(null)

    playSound("roll")
    triggerHaptic()

    // Simulate Chainlink VRF call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const randomNumber = Math.floor(Math.random() * 6) + 1
    const won = randomNumber >= targetNumber

    if (won) {
      setBalance(balance + amount * 1.5)
      playSound("win")
      triggerHaptic()
    } else {
      setBalance(balance - amount)
      playSound("loss")
    }

    setResult({ number: randomNumber, won })
    setIsRolling(false)
  }

  return (
    <div className="space-y-8">
      {/* Dice Animation */}
      <div className="flex justify-center py-12">
        <motion.div
          animate={isRolling ? { rotateX: 360, rotateY: 360, rotateZ: 360 } : { rotateX: 0, rotateY: 0, rotateZ: 0 }}
          transition={isRolling ? { duration: 2, repeat: Number.POSITIVE_INFINITY } : { duration: 0.3 }}
          className="w-32 h-32 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl shadow-accent/50 text-5xl font-bold text-background"
          style={{ perspective: 1000 }}
        >
          {result?.number || "🎲"}
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
            You rolled: <span className="text-accent text-2xl font-bold">{result.number}</span>
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
            disabled={isRolling}
            className="w-full px-4 py-2 rounded-lg bg-input border border-accent/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50"
            placeholder="Enter amount"
          />
          <p className="text-xs text-muted-foreground mt-1">Balance: {balance.toFixed(2)}</p>
        </div>

        {/* Target Number */}
        <div>
          <label className="block text-sm font-medium mb-2">Roll Higher Than</label>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <motion.button
                key={num}
                onClick={() => setTargetNumber(num)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isRolling}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  targetNumber === num
                    ? "bg-gradient-to-r from-accent to-primary text-background shadow-lg shadow-accent/50"
                    : "bg-card border border-accent/20 text-foreground hover:border-accent/40"
                } disabled:opacity-50`}
              >
                {num}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Roll Button */}
        <motion.button
          onClick={handleRoll}
          disabled={isRolling || Number.parseFloat(betAmount) > balance || Number.parseFloat(betAmount) <= 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-bold shadow-lg shadow-accent/50 hover:shadow-xl hover:shadow-accent/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isRolling ? "Rolling..." : "Roll Dice"}
        </motion.button>
      </div>
    </div>
  )
}
