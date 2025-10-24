"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface MangoSpinGameProps {
  soundEnabled: boolean
}

const SEGMENTS = [
  { label: "2x", multiplier: 2, color: "from-orange-500 to-yellow-500" },
  { label: "0.5x", multiplier: 0.5, color: "from-red-500 to-orange-500" },
  { label: "3x", multiplier: 3, color: "from-yellow-500 to-green-500" },
  { label: "1x", multiplier: 1, color: "from-green-500 to-cyan-500" },
  { label: "1.5x", multiplier: 1.5, color: "from-cyan-500 to-blue-500" },
  { label: "0x", multiplier: 0, color: "from-blue-500 to-purple-500" },
]

export default function MangoSpinGame({ soundEnabled }: MangoSpinGameProps) {
  const [betAmount, setBetAmount] = useState("10")
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<{ segment: (typeof SEGMENTS)[0]; won: boolean } | null>(null)
  const [balance, setBalance] = useState(1000)

  const playSound = (type: "spin" | "win" | "loss") => {
    if (!soundEnabled) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    if (type === "spin") {
      oscillator.frequency.value = 500
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } else if (type === "win") {
      oscillator.frequency.value = 1000
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } else {
      oscillator.frequency.value = 250
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
  }

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const handleSpin = async () => {
    const amount = Number.parseFloat(betAmount)
    if (amount > balance || amount <= 0) return

    setIsSpinning(true)
    setResult(null)

    playSound("spin")
    triggerHaptic()

    // Simulate Chainlink VRF call
    const randomIndex = Math.floor(Math.random() * SEGMENTS.length)
    const newRotation = rotation + 360 * 5 + randomIndex * 60
    setRotation(newRotation)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    const segment = SEGMENTS[randomIndex]
    const won = segment.multiplier > 1

    if (won) {
      setBalance(balance + amount * segment.multiplier)
      playSound("win")
      triggerHaptic()
    } else if (segment.multiplier === 1) {
      playSound("spin")
    } else {
      setBalance(Math.max(0, balance - amount))
      playSound("loss")
    }

    setResult({ segment, won })
    setIsSpinning(false)
  }

  return (
    <div className="space-y-8">
      {/* Spinner Animation */}
      <div className="flex justify-center py-12">
        <div className="relative w-64 h-64">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-accent"></div>

          {/* Spinner */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={isSpinning ? { duration: 3, ease: "easeOut" } : { duration: 0.3 }}
            className="w-full h-full rounded-full shadow-2xl shadow-accent/50 overflow-hidden"
            style={{
              background: `conic-gradient(${SEGMENTS.map((s) => `var(--tw-gradient-stops)`).join(", ")})`,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SEGMENTS.map((segment, index) => {
                const angle = (index * 360) / SEGMENTS.length
                const nextAngle = ((index + 1) * 360) / SEGMENTS.length
                const startRad = (angle * Math.PI) / 180
                const endRad = (nextAngle * Math.PI) / 180
                const x1 = 50 + 50 * Math.cos(startRad)
                const y1 = 50 + 50 * Math.sin(startRad)
                const x2 = 50 + 50 * Math.cos(endRad)
                const y2 = 50 + 50 * Math.sin(endRad)

                return (
                  <g key={index}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={`url(#gradient-${index})`}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth="0.5"
                    />
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={segment.color.split(" ")[1]} />
                        <stop offset="100%" stopColor={segment.color.split(" ")[3]} />
                      </linearGradient>
                    </defs>
                    <text
                      x={50 + 35 * Math.cos((startRad + endRad) / 2)}
                      y={50 + 35 * Math.sin((startRad + endRad) / 2)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-bold fill-white"
                      transform={`rotate(${(((startRad + endRad) / 2) * 180) / Math.PI} ${50 + 35 * Math.cos((startRad + endRad) / 2)} ${50 + 35 * Math.sin((startRad + endRad) / 2)})`}
                    >
                      {segment.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-2"
        >
          <p className="text-lg font-semibold">
            You landed on: <span className="text-accent text-2xl font-bold">{result.segment.label}</span>
          </p>
          <motion.p
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
            className={`text-2xl font-bold ${result.won ? "text-green-400" : "text-red-400"}`}
          >
            {result.won ? "You Won!" : result.segment.multiplier === 1 ? "Break Even!" : "You Lost!"}
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
            disabled={isSpinning}
            className="w-full px-4 py-2 rounded-lg bg-input border border-accent/30 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-50"
            placeholder="Enter amount"
          />
          <p className="text-xs text-muted-foreground mt-1">Balance: {balance.toFixed(2)}</p>
        </div>

        {/* Spin Button */}
        <motion.button
          onClick={handleSpin}
          disabled={isSpinning || Number.parseFloat(betAmount) > balance || Number.parseFloat(betAmount) <= 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-bold shadow-lg shadow-accent/50 hover:shadow-xl hover:shadow-accent/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSpinning ? "Spinning..." : "Spin Wheel"}
        </motion.button>
      </div>
    </div>
  )
}
