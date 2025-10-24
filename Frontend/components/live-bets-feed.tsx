"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useWebSocketEvents } from "@/hooks/use-websocket"
import { apiService } from "@/lib/api"
import { Clock, Users, Zap, TrendingUp, Award, ExternalLink } from "lucide-react"

interface FeedEvent {
  id: string
  type: 'bet' | 'payout'
  eventType: string
  data: any
  timestamp: string
}

interface LiveBetsFeedProps {
  limit?: number
  showPayouts?: boolean
}

export default function LiveBetsFeed({ limit = 20, showPayouts = true }: LiveBetsFeedProps) {
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get real-time events from WebSocket
  const wsEvents = useWebSocketEvents(['bet:created', 'bet:joined', 'bet:resolved', 'payout:intent:created', 'payout:completed'])

  // Load initial events
  useEffect(() => {
    const loadInitialEvents = async () => {
      try {
        setLoading(true)
        const response = await apiService.getLiveFeed({ 
          limit, 
          type: showPayouts ? 'all' : 'bets' 
        })
        
        if (response.success) {
          setEvents(response.data.events || [])
        }
      } catch (err) {
        console.error('Failed to load initial events:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    loadInitialEvents()
  }, [limit, showPayouts])

  // Update events when WebSocket events arrive
  useEffect(() => {
    if (wsEvents.length > 0) {
      const newEvents = wsEvents.map(event => ({
        id: `${event.type}-${Date.now()}-${Math.random()}`,
        type: event.type.startsWith('bet:') ? 'bet' : 'payout',
        eventType: event.type,
        data: event.data,
        timestamp: event.timestamp
      }))

      setEvents(prev => [...newEvents, ...prev].slice(0, limit))
    }
  }, [wsEvents, limit])

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'bet:created':
        return <Zap className="w-4 h-4 text-accent" />
      case 'bet:joined':
        return <Users className="w-4 h-4 text-primary" />
      case 'bet:resolved':
        return <Award className="w-4 h-4 text-green-500" />
      case 'payout:intent:created':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />
      case 'payout:completed':
        return <ExternalLink className="w-4 h-4 text-emerald-500" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'bet:created':
        return 'from-accent/20 to-accent/10'
      case 'bet:joined':
        return 'from-primary/20 to-primary/10'
      case 'bet:resolved':
        return 'from-green-500/20 to-green-500/10'
      case 'payout:intent:created':
        return 'from-yellow-500/20 to-yellow-500/10'
      case 'payout:completed':
        return 'from-emerald-500/20 to-emerald-500/10'
      default:
        return 'from-muted/20 to-muted/10'
    }
  }

  const formatEventMessage = (event: FeedEvent) => {
    const { eventType, data } = event

    switch (eventType) {
      case 'bet:created':
        return {
          title: 'New Bet Created',
          message: `${data.creator?.username || data.creator?.walletAddress?.slice(0, 6)}... created a ${data.gameType} bet for ${data.betAmount} tokens`,
          highlight: data.creator?.username || data.creator?.walletAddress?.slice(0, 6)
        }
      case 'bet:joined':
        return {
          title: 'Bet Joined',
          message: `${data.participant?.username || data.participant?.slice(0, 6)}... joined a bet`,
          highlight: data.participant?.username || data.participant?.slice(0, 6)
        }
      case 'bet:resolved':
        return {
          title: 'Bet Resolved',
          message: `${data.winner?.username || data.winner?.slice(0, 6)}... won ${data.winnings} tokens!`,
          highlight: data.winner?.username || data.winner?.slice(0, 6)
        }
      case 'payout:intent:created':
        return {
          title: 'Payout Intent Created',
          message: `${data.winner?.username || data.winner?.slice(0, 6)}... requested payout to ${data.targetChain}`,
          highlight: data.winner?.username || data.winner?.slice(0, 6)
        }
      case 'payout:completed':
        return {
          title: 'Payout Completed',
          message: `${data.winner?.username || data.winner?.slice(0, 6)}... received ${data.amount} tokens on ${data.targetChain}`,
          highlight: data.winner?.username || data.winner?.slice(0, 6)
        }
      default:
        return {
          title: 'Activity',
          message: 'New activity detected',
          highlight: ''
        }
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const eventTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - eventTime.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

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
    <div className="space-y-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h3 className="text-2xl font-bold">Live Activity Feed</h3>
          <p className="text-muted-foreground">Real-time betting and payout events</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </div>
      </motion.div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {events.map((event, index) => {
            const eventMessage = formatEventMessage(event)
            const eventColor = getEventColor(event.eventType)
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 
                }}
                className={`p-4 rounded-xl border border-accent/20 bg-gradient-to-r ${eventColor} backdrop-blur-sm hover:border-accent/40 transition-all cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-background/50">
                    {getEventIcon(event.eventType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">{eventMessage.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {eventMessage.message.split(eventMessage.highlight).map((part, i) => (
                        <span key={i}>
                          {part}
                          {i < eventMessage.message.split(eventMessage.highlight).length - 1 && (
                            <span className="font-semibold text-accent">
                              {eventMessage.highlight}
                            </span>
                          )}
                        </span>
                      ))}
                    </p>

                    {event.data.gameType && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                          {event.data.gameType}
                        </span>
                        {event.data.betAmount && (
                          <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                            {event.data.betAmount} tokens
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as users place bets</p>
          </div>
        )}
      </div>
    </div>
  )
}