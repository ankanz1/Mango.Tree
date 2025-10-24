"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface WebSocketEvent {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000',
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError
  } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<WebSocketEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    if (socketRef.current?.connected) return

    try {
      const newSocket = io(url, {
        transports: ['websocket'],
        timeout: 20000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        onConnect?.()
      })

      newSocket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        setIsConnected(false)
        onDisconnect?.()
        
        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      })

      newSocket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err)
        setError(err.message)
        onError?.(err)
      })

      // Listen for all events and store them
      newSocket.onAny((eventName, data) => {
        const event: WebSocketEvent = {
          type: eventName,
          data,
          timestamp: new Date().toISOString()
        }
        
        setEvents(prev => [event, ...prev.slice(0, 99)]) // Keep last 100 events
      })

      socketRef.current = newSocket
      setSocket(newSocket)
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event)
    }
  }

  const joinRoom = (room: string) => {
    emit('join-room', room)
  }

  const leaveRoom = (room: string) => {
    emit('leave-room', room)
  }

  const authenticate = (walletAddress: string) => {
    emit('authenticate', { walletAddress })
  }

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect])

  return {
    socket,
    isConnected,
    events,
    error,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    authenticate
  }
}

// Hook for specific event types
export function useWebSocketEvents(eventTypes: string[]) {
  const { events } = useWebSocket()
  
  return events.filter(event => eventTypes.includes(event.type))
}

// Hook for real-time bet updates
export function useBetUpdates() {
  const { events, isConnected } = useWebSocket()
  
  const betEvents = events.filter(event => 
    event.type.startsWith('bet:') || 
    event.type.startsWith('payout:')
  )

  return {
    betEvents,
    isConnected,
    latestBetEvent: betEvents[0] || null
  }
}

// Hook for leaderboard updates
export function useLeaderboardUpdates() {
  const { events, isConnected } = useWebSocket()
  
  const leaderboardEvents = events.filter(event => 
    event.type === 'leaderboard:update'
  )

  return {
    leaderboardEvents,
    isConnected,
    latestLeaderboard: leaderboardEvents[0]?.data?.leaderboard || []
  }
}
