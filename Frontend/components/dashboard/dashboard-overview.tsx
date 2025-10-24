"use client"

import { motion } from "framer-motion"
import { TrendingUp, Zap, Award, Wallet } from "lucide-react"

interface DashboardOverviewProps {
  isConnected: boolean
  balance: string
  activeBets: number
  totalWinnings: string
  leaderboardRank: number
}

export default function DashboardOverview({
  isConnected,
  balance,
  activeBets,
  totalWinnings,
  leaderboardRank,
}: DashboardOverviewProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  const stats = [
    {
      label: "Wallet Balance",
      value: isConnected ? `$${balance}` : "---",
      icon: Wallet,
      color: "from-accent to-orange-500",
      bgColor: "bg-accent/10",
    },
    {
      label: "Active Bets",
      value: activeBets.toString(),
      icon: Zap,
      color: "from-primary to-cyan-500",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Winnings",
      value: `$${totalWinnings}`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Leaderboard Rank",
      value: leaderboardRank > 0 ? `#${leaderboardRank}` : "---",
      icon: Award,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to Mango.tree - Your decentralized betting hub</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-xl border border-accent/20 ${stat.bgColor} backdrop-blur-sm hover:border-accent/50 transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-balance">{stat.value}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ready to Place a Bet?</h2>
            <p className="text-muted-foreground">Create a new bet or join existing ones to start earning rewards</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all whitespace-nowrap"
          >
            Start Betting
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
