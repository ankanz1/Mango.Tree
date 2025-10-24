"use client"

import { motion } from "framer-motion"
import { LogOut, Settings } from "lucide-react"
import { WalletInfo } from "../WalletInfo"

interface UserProfileProps {
  isConnected: boolean
}

export default function UserProfile({ isConnected }: UserProfileProps) {
  const stats = [
    { label: "Total Bets", value: "24" },
    { label: "Win Rate", value: "68%" },
    { label: "Streak", value: "5" },
  ]

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-accent/20 space-y-4 flex-1"
      >
        <div className="text-center">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent to-primary flex items-center justify-center text-2xl shadow-lg shadow-accent/50"
          >
            👤
          </motion.div>
          <h3 className="font-bold text-lg">User Profile</h3>
        </div>

        {isConnected ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 text-sm">
            <WalletInfo />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-accent/5 border border-accent/20 text-center hover:border-accent/50 transition-all"
                >
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="font-bold text-accent">{stat.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-accent/5 border border-accent/20 text-center"
          >
            <p className="text-muted-foreground text-sm">Connect wallet to view profile</p>
          </motion.div>
        )}
      </motion.div>

      {/* Footer Actions */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-t border-accent/20 space-y-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <Settings className="w-4 h-4" />
            Settings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
