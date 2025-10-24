"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { motion, AnimatePresence } from "framer-motion"

interface WalletModalProps {
  onConnect?: (address: string, balance: string) => void
  onClose?: () => void
}

export default function WalletModal({ onClose }: WalletModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-accent/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-accent/20"
        >
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-muted-foreground mb-6">Choose your wallet provider</p>

          <div className="flex justify-center">
            <ConnectButton />
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
