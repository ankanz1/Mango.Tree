"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"

import { createBetContract } from "@/lib/contract-placeholders"

export default function CreateBet() {
  const [formData, setFormData] = useState({
    token: "USDC",
    amount: "",
    chain: "Celo",
    expiration: "1h",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [contractStatus, setContractStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setContractStatus("pending")

    try {
      const result = await createBetContract({
        token: formData.token,
        amount: formData.amount,
        chain: formData.chain,
        expiration: formData.expiration,
      })

      setTransactionHash(result.transactionHash)
      setContractStatus("success")
      setShowConfirmation(true)
      setIsCreating(false)

      setTimeout(() => {
        setShowConfirmation(false)
        setFormData({ token: "USDC", amount: "", chain: "Celo", expiration: "1h" })
        setContractStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error creating bet:", error)
      setContractStatus("error")
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-accent/30 bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create a Bet</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                contractStatus === "pending"
                  ? "bg-yellow-400 animate-pulse"
                  : contractStatus === "success"
                    ? "bg-green-400"
                    : contractStatus === "error"
                      ? "bg-red-400"
                      : "bg-muted-foreground"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {contractStatus === "pending"
                ? "Contract pending..."
                : contractStatus === "success"
                  ? "Contract confirmed"
                  : contractStatus === "error"
                    ? "Contract error"
                    : "Ready"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">Token</label>
            <select
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-accent/30 text-foreground focus:border-accent outline-none transition-colors"
            >
              <option>USDC</option>
              <option>cUSD</option>
              <option>CELO</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-lg bg-background border border-accent/30 text-foreground placeholder-muted-foreground focus:border-accent outline-none transition-colors"
              required
            />
          </div>

          {/* Chain Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2">Target Chain</label>
            <select
              value={formData.chain}
              onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-accent/30 text-foreground focus:border-accent outline-none transition-colors"
            >
              <option>Celo</option>
              <option>Polygon</option>
              <option>Ethereum</option>
            </select>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-semibold mb-2">Expiration</label>
            <select
              value={formData.expiration}
              onChange={(e) => setFormData({ ...formData, expiration: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-background border border-accent/30 text-foreground focus:border-accent outline-none transition-colors"
            >
              <option value="1h">1 Hour</option>
              <option value="6h">6 Hours</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-muted-foreground mb-2">Smart Contract Integration</p>
            <p className="text-sm font-mono text-primary">CreateBet() → {formData.chain} Network</p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isCreating || !formData.amount}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                Creating Bet...
              </motion.span>
            ) : (
              "Lock Bet"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Confirmation Toast */}
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 p-6 rounded-xl bg-gradient-to-r from-accent to-primary text-background shadow-2xl shadow-accent/50"
        >
          <p className="font-semibold">Bet created successfully!</p>
          <p className="text-sm opacity-90">Your bet is now live in the lobby</p>
          {transactionHash && (
            <p className="text-xs font-mono mt-2 opacity-75">TX: {transactionHash.slice(0, 10)}...</p>
          )}
        </motion.div>
      )}
    </div>
  )
}
