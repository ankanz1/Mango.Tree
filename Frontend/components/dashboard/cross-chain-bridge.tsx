"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAccount, useBalance } from "wagmi"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Globe,
  Shield
} from "lucide-react"

interface BridgeRequest {
  betId: string
  winnerAddress: string
  targetChain: string
  amount: string
  token: string
}

interface PayoutIntent {
  _id: string
  betId: string
  userId: string
  payoutAmount: string
  destinationChain: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transactionHash?: string
  createdAt: string
}

const SUPPORTED_CHAINS = [
  { id: 'celo', name: 'Celo', icon: '🌱', color: 'from-green-500 to-emerald-500' },
  { id: 'polygon', name: 'Polygon', icon: '🔷', color: 'from-purple-500 to-indigo-500' },
  { id: 'ethereum', name: 'Ethereum', icon: '💎', color: 'from-blue-500 to-cyan-500' },
  { id: 'base', name: 'Base', icon: '🔵', color: 'from-blue-600 to-blue-400' }
]

const SUPPORTED_TOKENS = [
  { symbol: 'cUSD', name: 'Celo USD', chain: 'celo' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'polygon' },
  { symbol: 'ETH', name: 'Ethereum', chain: 'ethereum' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'base' }
]

export default function CrossChainBridge() {
  const { address, isConnected } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { toast } = useToast()
  
  const [payoutIntents, setPayoutIntents] = useState<PayoutIntent[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [selectedChain, setSelectedChain] = useState('polygon')
  const [selectedToken, setSelectedToken] = useState('cUSD')
  const [amount, setAmount] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Load payout intents
  useEffect(() => {
    const loadPayoutIntents = async () => {
      if (!address) return
      
      try {
        setLoading(true)
        const response = await apiService.getPayoutIntents(address)
        
        if (response.success) {
          setPayoutIntents(response.data || [])
        }
      } catch (error) {
        console.error('Failed to load payout intents:', error)
        toast({
          title: "Error",
          description: "Failed to load payout intents",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadPayoutIntents()
  }, [address, toast])

  const handleCreatePayoutIntent = async () => {
    if (!address || !amount || !selectedChain || !selectedToken) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setProcessing('creating')
      
      const response = await apiService.createPayoutIntent({
        betId: 'mock-bet-id', // This would come from a selected bet
        winnerAddress: address,
        targetChain: selectedChain,
        amount: amount,
        token: selectedToken
      }, address)

      if (response.success) {
        toast({
          title: "Success",
          description: "Payout intent created successfully",
          variant: "default"
        })
        
        // Refresh payout intents
        const refreshResponse = await apiService.getPayoutIntents(address)
        if (refreshResponse.success) {
          setPayoutIntents(refreshResponse.data || [])
        }
        
        setShowCreateForm(false)
        setAmount('')
      }
    } catch (error) {
      console.error('Failed to create payout intent:', error)
      toast({
        title: "Error",
        description: "Failed to create payout intent",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleConfirmPayout = async (payoutIntent: PayoutIntent) => {
    try {
      setProcessing(payoutIntent._id)
      
      const response = await apiService.confirmPayout(
        payoutIntent.betId,
        'mock-bridge-tx-hash', // This would come from the actual bridge transaction
        address!
      )

      if (response.success) {
        toast({
          title: "Success",
          description: "Payout confirmed successfully",
          variant: "default"
        })
        
        // Refresh payout intents
        const refreshResponse = await apiService.getPayoutIntents(address!)
        if (refreshResponse.success) {
          setPayoutIntents(refreshResponse.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to confirm payout:', error)
      toast({
        title: "Error",
        description: "Failed to confirm payout",
        variant: "destructive"
      })
    } finally {
      setProcessing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500/20 to-green-500/10 border-green-500/30'
      case 'processing':
        return 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/30'
      case 'failed':
        return 'from-red-500/20 to-red-500/10 border-red-500/30'
      default:
        return 'from-muted/20 to-muted/10 border-muted/30'
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

  if (!isConnected) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p>Connect your wallet to access cross-chain bridge features</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold">Cross-Chain Bridge</h2>
        <p className="text-muted-foreground">Transfer your winnings to any supported blockchain</p>
      </motion.div>

      {/* Bridge Overview */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="p-6 rounded-xl border border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-accent" />
            <h3 className="font-semibold">Secure Bridge</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by Axelar for secure cross-chain transfers
          </p>
              </div>

        <div className="p-6 rounded-xl border border-accent/20 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">Fast Transfers</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete cross-chain transfers in minutes
          </p>
            </div>

        <div className="p-6 rounded-xl border border-accent/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold">Multi-Chain</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Support for Celo, Polygon, Ethereum, and Base
          </p>
        </div>
                    </motion.div>

      {/* Create Payout Intent */}
                      <motion.div
        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl border border-accent/20 bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Create Payout Intent</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 rounded-lg bg-accent text-background font-medium hover:bg-accent/90 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'New Payout'}
          </button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Target Chain</label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                  className="w-full p-3 rounded-lg border border-accent/20 bg-background/50 backdrop-blur-sm"
                >
                  {SUPPORTED_CHAINS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium mb-2">Token</label>
                <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full p-3 rounded-lg border border-accent/20 bg-background/50 backdrop-blur-sm"
                >
                  {SUPPORTED_TOKENS.filter(token => token.chain === selectedChain).map((token) => (
                    <option key={`${token.symbol}-${token.chain}`} value={token.symbol}>
                      {token.symbol} - {token.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                className="w-full p-3 rounded-lg border border-accent/20 bg-background/50 backdrop-blur-sm"
              />
          </div>

            <button
              onClick={handleCreatePayoutIntent}
              disabled={processing === 'creating' || !amount}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-accent to-primary text-background font-semibold hover:shadow-lg hover:shadow-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing === 'creating' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                />
              )}
              Create Payout Intent
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Payout Intents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold">Your Payout Intents</h3>
        
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted/10 rounded animate-pulse" />
            ))}
                      </div>
        ) : payoutIntents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No payout intents found</p>
            <p className="text-sm">Create a payout intent to transfer your winnings</p>
                      </div>
        ) : (
          <div className="space-y-3">
            {payoutIntents.map((intent) => (
              <motion.div
                key={intent._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border bg-gradient-to-r ${getStatusColor(intent.status)} backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(intent.status)}
                    <div>
                      <h4 className="font-semibold">
                        {intent.payoutAmount} {intent.destinationChain.toUpperCase()}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(intent.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      intent.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      intent.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      intent.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-muted/20 text-muted-foreground'
                    }`}>
                      {intent.status.charAt(0).toUpperCase() + intent.status.slice(1)}
                    </span>

                    {intent.status === 'processing' && (
                      <button
                        onClick={() => handleConfirmPayout(intent)}
                        disabled={processing === intent._id}
                        className="px-4 py-2 rounded-lg bg-accent text-background font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processing === intent._id && (
                    <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-4 h-4 border-2 border-background border-t-transparent rounded-full"
                          />
                        )}
                      Confirm
                      </button>
                    )}

                    {intent.transactionHash && (
                      <a
                        href={`https://explorer.celo.org/tx/${intent.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                </motion.div>
              ))}
          </div>
        )}
        </motion.div>
    </div>
  )
}