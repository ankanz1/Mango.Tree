"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAccount, useBalance } from "wagmi"
import DashboardNavbar from "@/components/dashboard/navbar"
import DashboardOverview from "@/components/dashboard/dashboard-overview"
import UserProfile from "@/components/dashboard/user-profile"
import BetLobby from "@/components/dashboard/bet-lobby"
import MyBets from "@/components/dashboard/my-bets"
import Leaderboard from "@/components/dashboard/leaderboard"
import CrossChainBridge from "@/components/dashboard/cross-chain-bridge"
import FloatingParticles from "@/components/floating-particles"
import BetHistorySidebar from "@/components/dashboard/bet-history-sidebar"
import MiniGames from "@/components/dashboard/mini-games"
import HistoryPanel from "@/components/dashboard/history-panel"

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [isBetHistoryOpen, setIsBetHistoryOpen] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })

  const walletAddress = address || ""
  const walletBalance = balanceData ? Number.parseFloat(balanceData.formatted).toFixed(2) : "0.00"

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <FloatingParticles />
      <DashboardNavbar
        onOpenBetHistory={() => setIsBetHistoryOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - User Profile */}
        <div className="hidden lg:flex w-80 border-r border-accent/20 bg-background/50 backdrop-blur-sm flex-col">
          <UserProfile isConnected={isConnected} address={walletAddress} balance={walletBalance} />
        </div>

        {/* Center Panel - Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "home" && (
                <DashboardOverview
                  isConnected={isConnected}
                  balance={walletBalance}
                  activeBets={3}
                  totalWinnings="1,250.50"
                  leaderboardRank={isConnected ? 42 : 0}
                />
              )}
              {activeTab === "live-bets" && <BetLobby />}
              {activeTab === "my-wagers" && <MyBets />}
              {activeTab === "leaderboard" && <Leaderboard />}
              {activeTab === "bridge" && <CrossChainBridge />}
              {activeTab === "mini-games" && <MiniGames />}
            </motion.div>
          </div>
        </div>

        {/* Right Panel - History */}
        <div className="hidden xl:flex w-80 border-l border-accent/20 bg-background/50 backdrop-blur-sm flex-col">
          <HistoryPanel />
        </div>
      </div>

      <BetHistorySidebar isOpen={isBetHistoryOpen} onClose={() => setIsBetHistoryOpen(false)} />
    </div>
  )
}
