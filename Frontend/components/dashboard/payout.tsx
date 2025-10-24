"use client";

import { useState, useEffect } from 'react';
import { useAccount, useSigner } from 'wagmi';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

const supportedChains = [
  { id: 'Celo', name: 'Celo' },
  { id: 'Polygon', name: 'Polygon' },
  { id: 'Ethereum', name: 'Ethereum' },
];

const supportedTokens = [
  { id: 'cUSD', name: 'Celo USD', symbol: 'cUSD' },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC' },
  { id: 'USDT', name: 'Tether', symbol: 'USDT' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
];

export default function PayoutPage() {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [amount, setAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [betId, setBetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [payoutIntents, setPayoutIntents] = useState([]);

  // Fetch payout history and intents
  const fetchPayoutData = async () => {
    try {
      // Fetch payout history
      const historyResponse = await fetch(`/api/payouts/${address}`);
      const historyData = await historyResponse.json();
      setPayoutHistory(historyData);

      // Fetch payout intents
      const intentsResponse = await fetch(`/api/payout-intents/${address}`);
      const intentsData = await intentsResponse.json();
      setPayoutIntents(intentsData);
    } catch (error) {
      console.error('Error fetching payout data:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (address) {
      fetchPayoutData();
    }
  }, [address]);

  // Handle payout intent creation
  const handlePayoutIntent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!signer) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/payout-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          betId,
          winnerAddress: address,
          targetChain: selectedChain,
          amount,
          token: selectedToken || null, // null for native token
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payout intent');
      }

      const result = await response.json();
      setSuccess(true);
      setAmount('');
      setSelectedChain('');
      setSelectedToken('');
      setBetId('');
      
      // Refresh data
      fetchPayoutData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Payout</h1>

      {/* Payout Intent Form */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Payout Intent</h2>
        <form onSubmit={handlePayoutIntent}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="betId">Bet ID</Label>
              <Input
                id="betId"
                type="text"
                value={betId}
                onChange={(e) => setBetId(e.target.value)}
                placeholder="Enter bet ID"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="token">Token</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select token (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Tokens</SelectLabel>
                    <SelectItem value="">Native Token</SelectItem>
                    {supportedTokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="chain">Target Chain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Chains</SelectLabel>
                    {supportedChains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your payout request has been submitted successfully.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading || !amount || !selectedChain || !betId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating Intent...' : 'Create Payout Intent'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Payout Intents */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payout Intents</h2>
        <div className="space-y-4">
          {payoutIntents.length > 0 ? (
            payoutIntents.map((intent) => (
              <div
                key={intent._id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(intent.status)}
                  <div>
                    <p className="font-medium">Bet ID: {intent.betId}</p>
                    <p className="text-sm text-gray-500">Amount: {intent.payoutAmount}</p>
                    <p className="text-sm text-gray-500">Target: {intent.destinationChain}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(intent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      intent.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : intent.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {intent.status}
                  </span>
                  {intent.transactionHash && (
                    <a
                      href={`https://alfajores.celoscan.io/tx/${intent.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      View TX
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No payout intents available</p>
          )}
        </div>
      </Card>

      {/* Payout History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Payout History</h2>
        <div className="space-y-4">
          {payoutHistory.length > 0 ? (
            payoutHistory.map((payout) => (
              <div
                key={payout._id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">Amount: {payout.amount}</p>
                  <p className="text-sm text-gray-500">Chain: {payout.chain}</p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(payout.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      payout.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payout.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payout.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No payout history available</p>
          )}
        </div>
      </Card>
    </div>
  );
}
