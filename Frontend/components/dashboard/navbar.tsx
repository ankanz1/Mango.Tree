"use client"

import { motion } from "framer-motion"
import { History, Home, Zap, TrendingUp, Users, Wallet, Gamepad2 } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

interface DashboardNavbarProps {
  onOpenBetHistory?: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function DashboardNavbar({ onOpenBetHistory, activeTab = "home", onTabChange }: DashboardNavbarProps) {
  const { isConnected } = useAccount()

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "live-bets", label: "Live Bets", icon: Zap },
    { id: "my-wagers", label: "My Wagers", icon: TrendingUp },
    { id: "leaderboard", label: "Leaderboard", icon: Users },
    { id: "payout", label: "Payout", icon: Wallet },
    { id: "mini-games", label: "Mini Games", icon: Gamepad2 },
  ]

  return (
    <nav className="h-20 border-b border-accent/20 bg-background/50 backdrop-blur-md sticky top-0 z-40">
      <div className="h-full px-6 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
          <div className="text-3xl">🥭</div>
          <span className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Mango.tree
          </span>
        </motion.div>

        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-accent to-primary text-background shadow-lg shadow-accent/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <motion.button
              onClick={onOpenBetHistory}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all"
              title="View bet history"
            >
              <History className="w-5 h-5" />
            </motion.button>
          )}

          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
