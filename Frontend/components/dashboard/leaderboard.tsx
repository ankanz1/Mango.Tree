"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useLeaderboardUpdates } from "@/hooks/use-websocket"
import { apiService } from "@/lib/api"
import { Trophy, Medal, Award, TrendingUp, Users, Zap } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  username?: string
  totalWinnings: number
  totalWins: number
  totalBets: number
  winRate: number
  avatar?: string
  badges?: string[]
}

interface LeaderboardProps {
  type?: 'winnings' | 'wins' | 'winrate' | 'activity'
  period?: 'all' | 'day' | 'week' | 'month'
  limit?: number
}

export default function Leaderboard({ 
  type = 'winnings', 
  period = 'all', 
  limit = 10 
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState(type)
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  // Get real-time leaderboard updates
  const { latestLeaderboard, isConnected } = useLeaderboardUpdates()

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await apiService.getLeaderboard({
          type: selectedType,
          period: selectedPeriod,
          limit
        })
        
        if (response.success) {
          setLeaderboard(response.data.leaderboard || [])
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [selectedType, selectedPeriod, limit])

  // Update leaderboard when real-time data arrives
  useEffect(() => {
    if (latestLeaderboard.length > 0) {
      setLeaderboard(latestLeaderboard.slice(0, limit))
    }
  }, [latestLeaderboard, limit])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {rank}
        </span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/30'
      case 2:
        return 'from-gray-400/20 to-gray-400/10 border-gray-400/30'
      case 3:
        return 'from-amber-600/20 to-amber-600/10 border-amber-600/30'
      default:
        return 'from-muted/20 to-muted/10 border-muted/30'
    }
  }

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'winnings':
        return `$${value.toLocaleString()}`
      case 'wins':
        return value.toString()
      case 'winrate':
        return `${value.toFixed(1)}%`
      case 'activity':
        return value.toString()
      default:
        return value.toString()
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'winnings':
        return 'Total Winnings'
      case 'wins':
        return 'Total Wins'
      case 'winrate':
        return 'Win Rate'
      case 'activity':
        return 'Activity Score'
      default:
        return 'Score'
    }
  }

  const typeOptions = [
    { value: 'winnings', label: 'Winnings', icon: TrendingUp },
    { value: 'wins', label: 'Wins', icon: Trophy },
    { value: 'winrate', label: 'Win Rate', icon: Award },
    { value: 'activity', label: 'Activity', icon: Zap }
  ]

  const periodOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'day', label: '24 Hours' },
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted/20 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/10">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Leaderboard</h3>
            <p className="text-muted-foreground">Top performers in the community</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {typeOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setSelectedType(option.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedType === option.value
                    ? 'bg-accent text-background'
                    : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            )
          })}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === option.value
                  ? 'bg-primary text-background'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.walletAddress}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border bg-gradient-to-r ${getRankColor(entry.rank)} backdrop-blur-sm hover:scale-105 transition-all cursor-pointer group`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold truncate">
                    {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                  </h4>
                  <span className="text-lg font-bold text-accent">
                    {formatValue(entry[selectedType as keyof LeaderboardEntry] as number, selectedType)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{getTypeLabel(selectedType)}</span>
                  <span>•</span>
                  <span>{entry.totalBets} bets</span>
                  {selectedType !== 'winrate' && (
                    <>
                      <span>•</span>
                      <span>{entry.winRate.toFixed(1)}% win rate</span>
                    </>
                  )}
                </div>

                {entry.badges && entry.badges.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {entry.badges.slice(0, 3).map((badge, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {leaderboard.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No leaderboard data available</p>
            <p className="text-sm">Leaderboard will populate as users start betting</p>
          </div>
        )}
      </div>
    </div>
  )
}