"use client"

import { useAccount, useBalance } from 'wagmi'

export function WalletInfo() {
  const { address, chain } = useAccount()
  const { data: balance } = useBalance({ address })

  return (
    <div className="mt-6 p-6 bg-[#141414] rounded-xl text-white border border-[#00FFA3]/40">
      {address ? (
        <>
          <p>
            <strong>Address:</strong> {address}
          </p>
          <p>
            <strong>Network:</strong> {chain?.name}
          </p>
          <p>
            <strong>Balance:</strong> {balance?.formatted} {balance?.symbol}
          </p>
        </>
      ) : (
        <p>Connect your wallet to view details.</p>
      )}
    </div>
  )
}
